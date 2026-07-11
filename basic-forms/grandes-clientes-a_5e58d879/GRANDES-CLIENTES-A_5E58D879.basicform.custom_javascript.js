 // ======================================================
// POWER PAGES - STEP FORM GRANDES CLIENTES (FINAL)
// ✔ Decimais com unidade VISUAL (m² / m³)
// ✔ Inteiros com unidade VISUAL (unidade / unidades)
// ✔ Campos iniciam VAZIOS
// ✔ ZERO (0) é valor VÁLIDO
// ✔ Backspace / Delete funcionam
// ✔ Ao salvar: envia somente números
// ✔ Data >= hoje
// ======================================================


(function () {

  // ============================
  // CONFIG
  // ============================
  const campos = {
    '#cloud_area_construida_total': 'decimal_m2',
    '#cloud_consumo_mensal': 'decimal_m3',
    '#cloud_volume_agua_processo': 'decimal',

    '#cloud_numero_funcionarios': 'inteiro',
    '#cloud_quantidade_box': 'inteiro',
    '#cloud_numero_economias': 'inteiro',
    '#cloud_estimativa_publico_diario': 'inteiro',

    '#cloud_data_prev_fim_obra': 'data',
    '#cloud_data_prev_fim_obra_datepicker_description': 'data'
  };

  // ============================
  // HELPERS
  // ============================
  function cssEscape(s) {
    return (s || '').replace(/[ !"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
  }

  function pegarCampos(sel) {
    const id = sel.replace('#', '');
    return $('#' + cssEscape(id))
      .add(`input[name='${id}'], textarea[name='${id}'], select[name='${id}']`);
  }

  // ============================
  // INTEIROS
  // ============================
  function limparInteiro(v) {
    return (v || '').replace(/\D/g, '');
  }

  function inteiroParaVisual(v) {
    v = limparInteiro(v);

    if (v === '') return '';

    const n = parseInt(v, 10);
    if (n === 0) return '0 unidades';
    if (n === 1) return '1 unidade';
    return `${n} unidades`;
  }

  // ============================
  // DECIMAIS
  // ============================
  function limparDecimal(v) {
    return (v || '').replace(/\D/g, '');
  }

  function formatarMilhar(v) {
    return v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function baseDecimalEmpurrando(v) {
    v = limparDecimal(v);
    if (v === '') return '';

    v = v.padStart(3, '0');

    let i = v.slice(0, -2);
    let d = v.slice(-2);

    i = formatarMilhar(String(parseInt(i, 10) || 0));
    return `${i},${d}`;
  }

  function decimalVisual(v, unidade) {
    const base = baseDecimalEmpurrando(v);

    if (base === '') return '';
    if (base === '0,00') return unidade ? `0,00 ${unidade}` : '0,00';

    return unidade ? `${base} ${unidade}` : base;
  }

  // ============================
  // MÁSCARAS
  // ============================
  function aplicarMascaras() {

    Object.keys(campos).forEach(sel => {
      const tipo = campos[sel];

      pegarCampos(sel).each(function () {
        const $f = $(this);
        if ($f.data('mask-ok')) return;
        $f.data('mask-ok', true);

        $f.attr('inputmode', 'numeric');

        // ---------- BACKSPACE ----------
        $f.on('keydown', function (e) {
          if (e.key !== 'Backspace' && e.key !== 'Delete') return;

          e.preventDefault();

          if (tipo === 'inteiro') {
            let n = limparInteiro(this.value).slice(0, -1);
            this.value = inteiroParaVisual(n);
            return;
          }

          if (tipo.includes('decimal')) {
            let n = limparDecimal(this.value).slice(0, -1);
            this.value = decimalVisual(
              n,
              tipo === 'decimal_m2' ? 'm²' :
              tipo === 'decimal_m3' ? 'm³' : null
            );
          }
        });

        // ---------- INPUT ----------
        $f.on('input', function () {

          if (this.value === '') return;

          if (tipo === 'inteiro') {
            this.value = inteiroParaVisual(this.value);
          }

          if (tipo === 'decimal') {
            this.value = decimalVisual(this.value);
          }

          if (tipo === 'decimal_m2') {
            this.value = decimalVisual(this.value, 'm²');
          }

          if (tipo === 'decimal_m3') {
            this.value = decimalVisual(this.value, 'm³');
          }
        });

        // ---------- BLUR ----------
        $f.on('blur', function () {
          if (tipo === 'inteiro') {
            if (limparInteiro(this.value) === '') this.value = '';
          }

          if (tipo.includes('decimal')) {
            if (limparDecimal(this.value) === '') this.value = '';
          }
        });

      });
    });
  }

  // ============================
  // ENVIO PARA VALIDAÇÃO
  // ============================
  function prepararEnvio() {

    Object.keys(campos).forEach(sel => {
      const tipo = campos[sel];

      pegarCampos(sel).each(function () {

        if (tipo === 'inteiro') {
          this.value = limparInteiro(this.value);
        }

        if (tipo.includes('decimal')) {
          const n = limparDecimal(this.value);

          if (n === '') {
            this.value = '';
          } else {
            const raw = n.padStart(3, '0');
            this.value = raw.slice(0, -2) + ',' + raw.slice(-2);
          }
        }
      });
    });
  }

  function restaurarVisual() {

    Object.keys(campos).forEach(sel => {
      const tipo = campos[sel];

      pegarCampos(sel).each(function () {

        if (tipo === 'inteiro') {
          this.value = inteiroParaVisual(this.value);
        }

        if (tipo === 'decimal') {
          this.value = decimalVisual(this.value);
        }

        if (tipo === 'decimal_m2') {
          this.value = decimalVisual(this.value, 'm²');
        }

        if (tipo === 'decimal_m3') {
          this.value = decimalVisual(this.value, 'm³');
        }
      });
    });
  }

  // ============================
  // INTERCEPTADORES
  // ============================
  function interceptarValidacao() {

    if (window.Page_ClientValidate && !window.Page_ClientValidate.__masked) {
      const o = window.Page_ClientValidate;
      window.Page_ClientValidate = function () {
        prepararEnvio();
        const ok = o.apply(this, arguments);
        setTimeout(restaurarVisual, 0);
        return ok;
      };
      window.Page_ClientValidate.__masked = true;
    }

    if (window.entityFormClientValidate && !window.entityFormClientValidate.__masked) {
      const o = window.entityFormClientValidate;
      window.entityFormClientValidate = function () {
        prepararEnvio();
        const ok = o.apply(this, arguments);
        setTimeout(restaurarVisual, 0);
        return ok;
      };
      window.entityFormClientValidate.__masked = true;
    }
  }

  // ============================
  // BOOT
  // ============================
  function boot() {
    aplicarMascaras();
    interceptarValidacao();
  }

 // new MutationObserver(boot)
 //   .observe(document.body, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", function () {

  var formContainer = document.querySelector("#custom-modern-form");

  if (!formContainer) return;

  new MutationObserver(function () {
      boot();
  }).observe(formContainer, { childList: true, subtree: true });

});
  boot();

  

})();

// =============================================
// BLOQUEAR DIAS ANTERIORES A HOJE
// Bootstrap DateTimePicker (Power Pages)
// =============================================

(function () {

  function bloquearDiasPassados() {

    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    $(".bootstrap-datetimepicker-widget td[data-action='selectDay']").each(function () {

      var dataStr = $(this).attr("data-day"); // ex: 10/02/2026
      if (!dataStr) return;

      var partes = dataStr.split("/");
      var dataCelula = new Date(partes[2], partes[1] - 1, partes[0]);
      dataCelula.setHours(0, 0, 0, 0);

      if (dataCelula < hoje) {

        // 🔒 Remove clique
        $(this)
          .addClass("dia-bloqueado")
          .off("click")
          .css({
            "color": "#ccc",
            "background": "#f3f3f3",
            "pointer-events": "none",
            "cursor": "not-allowed"
          });

        // Remove botão interno também
        $(this).find("button").prop("disabled", true);
      }
    });
  }

  // Executa quando calendário abrir
  $(document).on("click", "#cloud_data_prev_fim_obra", function () {
    setTimeout(bloquearDiasPassados, 200);
  });

  // Executa quando trocar mês
  $(document).on("click", ".bootstrap-datetimepicker-widget .prev, .bootstrap-datetimepicker-widget .next", function () {
    setTimeout(bloquearDiasPassados, 200);
  });

})();


// ============================================
// VARIÁVEL GLOBAL: Armazena campos a ocultar
// ============================================
var camposParaOcultar = [];


$(document).ready(function () {

    // --- CONFIGURAÇÃO ---
    const colunaParaOcultar_LogicalName = "cloud_id_finalidades_solicitacao";
    const colunaParaOcultar_Titulo = "ID_FINALIDADES_SOLICITACAO";

    const renomearMapa = {
        "NOME_FINALIDADE": "Finalidade",
        "DESCRICAO_FINALIDADE": "Descrição"
    };

    function aplicarMudancasGrid() {
        var $gridModal = $(".modal-dialog .entity-grid");
        if ($gridModal.length === 0) return;

        // A) OCULTAR CABEÇALHO (TH)
        $gridModal.find("th").each(function () {
            var $th = $(this);

            // pega texto do th (ou aria-label do link)
            var thText = ($th.text() || "").trim();
            var temAria = $th.find('a[aria-label*="' + colunaParaOcultar_Titulo + '"]').length > 0;

            if (thText.indexOf(colunaParaOcultar_Titulo) > -1 || temAria) {
                $th.hide();
            }
        });

        // B) OCULTAR DADOS (TD) — seletor estável pelo data-attribute
        $gridModal.find('td[data-attribute="' + colunaParaOcultar_LogicalName + '"]').hide();

        // C) RENOMEAR COLUNAS (SEM ARROW FUNCTION, COMPATÍVEL COM JQUERY)
        $gridModal.find("th.sort-enabled a, th a").each(function () {
            var $link = $(this);

            // Pega somente o TEXTO “puro” do link (sem ícone)
            var textoPuro = $link.contents().filter(function () {
                return this.nodeType === 3; // TEXT NODE
            }).text().trim();

            if (renomearMapa[textoPuro]) {
                $link.contents().filter(function () {
                    return this.nodeType === 3;
                }).each(function () {
                    this.nodeValue = renomearMapa[textoPuro];
                });
            }
        });
    }

    // Observa abertura da modal + recarregamento do grid (paginação, busca)
    const observer = new MutationObserver(function () {
        var $gridModal = $(".modal-dialog .entity-grid");

        if ($gridModal.length > 0) {
            aplicarMudancasGrid();

            if (!$gridModal.data("monitorando")) {
                $gridModal.on("loaded", function () {
                    setTimeout(aplicarMudancasGrid, 50);
                });
                $gridModal.data("monitorando", true);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});


//FINALIDADES:

$(document).ready(function () {

    var tabelaSetName = "cloud_finalidades_solicitacaos";
    var lookupIdField = "cloud_fk_finalidades_solicitacao";
    var lookupNameField = "cloud_fk_finalidades_solicitacao_name";
    var colunaNomeParaExibir = "cloud_nome_finalidade";

    function updateLookupDisplayName(retries) {
        retries = (typeof retries === "number") ? retries : 8;

        var selectedId = $("#" + lookupIdField).val();
        if (!selectedId) return;

        selectedId = selectedId.replace(/[{}]/g, '');

        var apiUrl = "/_api/" + tabelaSetName + "(" + selectedId + ")?$select=" + colunaNomeParaExibir;

        $.ajax({
            type: "GET",
            url: apiUrl,
            contentType: "application/json",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            },
            success: function (data) {
                var nomeCorreto = data[colunaNomeParaExibir];

                if (nomeCorreto) {
                    var $name = $("#" + lookupNameField);

                    // Atualiza visual imediatamente
                    $name.val(nomeCorreto);
                    $name.attr("title", nomeCorreto);
                    $name.attr("value", nomeCorreto);

                    // “segura” contra sobrescrita do Power Pages (2x tentativas rápidas)
                    setTimeout(function(){ $name.val(nomeCorreto).attr("value", nomeCorreto); }, 50);
                    setTimeout(function(){ $name.val(nomeCorreto).attr("value", nomeCorreto); }, 150);
                } else if (retries > 0) {
                    setTimeout(function () { updateLookupDisplayName(retries - 1); }, 120);
                }
            },
            error: function () {
                if (retries > 0) {
                    setTimeout(function () { updateLookupDisplayName(retries - 1); }, 150);
                }
            }
        });
    }

    // Troca de valor
    $("#" + lookupIdField).on("change", function () {
        updateLookupDisplayName(8);
    });

    // Também tenta ao carregar (Step Form às vezes injeta depois)
    setTimeout(function(){ updateLookupDisplayName(8); }, 200);
    setTimeout(function(){ updateLookupDisplayName(8); }, 800);

    // Observa mudanças no DOM para quando o campo aparece/re-renderiza
    new MutationObserver(function () {
        if ($("#" + lookupIdField).length) updateLookupDisplayName(3);
    }).observe(document.body, { childList: true, subtree: true });
});


/* ============================================================
   1) POPUP LOOKUP – MUNICÍPIO
   ✅ Renomeia colunas
   ✅ Oculta coluna ID_MUNICIPIO (th + td)
   ✅ Mantém alinhamento (sem “desajustar” rótulos)
   ============================================================ */
$(document).ready(function () {

    // --- CONFIGURAÇÃO ---
    const colunaParaOcultar_LogicalName = "cloud_id_municipio";
    const colunaParaOcultar_Titulo = "ID_MUNICIPIO";

    const renomearMapa = {
        "NOME_MUNICIPIO": "Nome do Município",
        "NOME_REGIONAL (FK_REGIONAIS)": "Nome da Regional"
    };

    function aplicarMudancasGrid() {
        var $gridModal = $(".modal-dialog .entity-grid");
        if ($gridModal.length === 0) return;

        // A) OCULTAR CABEÇALHO (TH)
        $gridModal.find("th").each(function () {
            var $th = $(this);

            // pega texto do th (ou aria-label do link)
            var thText = ($th.text() || "").trim();
            var temAria = $th.find('a[aria-label*="' + colunaParaOcultar_Titulo + '"]').length > 0;

            if (thText.indexOf(colunaParaOcultar_Titulo) > -1 || temAria) {
                $th.hide();
            }
        });

        // B) OCULTAR DADOS (TD) — seletor estável pelo data-attribute
        $gridModal.find('td[data-attribute="' + colunaParaOcultar_LogicalName + '"]').hide();

        // C) RENOMEAR COLUNAS (SEM ARROW FUNCTION, COMPATÍVEL COM JQUERY)
        $gridModal.find("th.sort-enabled a, th a").each(function () {
            var $link = $(this);

            // Pega somente o TEXTO “puro” do link (sem ícone)
            var textoPuro = $link.contents().filter(function () {
                return this.nodeType === 3; // TEXT NODE
            }).text().trim();

            if (renomearMapa[textoPuro]) {
                $link.contents().filter(function () {
                    return this.nodeType === 3;
                }).each(function () {
                    this.nodeValue = renomearMapa[textoPuro];
                });
            }
        });
    }

    // Observa abertura da modal + recarregamento do grid (paginação, busca)
    const observer = new MutationObserver(function () {
        var $gridModal = $(".modal-dialog .entity-grid");

        if ($gridModal.length > 0) {
            aplicarMudancasGrid();

            if (!$gridModal.data("monitorando")) {
                $gridModal.on("loaded", function () {
                    setTimeout(aplicarMudancasGrid, 50);
                });
                $gridModal.data("monitorando", true);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});


/* ============================================================
   2) LOOKUP cloud_fk_municipios
   ✅ Faz o nome aparecer mais rápido (com tentativas)
   ============================================================ */
$(document).ready(function () {

    var tabelaSetName = "cloud_municipioses";
    var lookupIdField = "cloud_fk_municipios";
    var lookupNameField = "cloud_fk_municipios_name";
    var colunaNomeParaExibir = "cloud_nome_municipio";

    function updateLookupDisplayName(retries) {
        retries = (typeof retries === "number") ? retries : 8;

        var selectedId = $("#" + lookupIdField).val();
        if (!selectedId) return;

        selectedId = selectedId.replace(/[{}]/g, '');

        var apiUrl = "/_api/" + tabelaSetName + "(" + selectedId + ")?$select=" + colunaNomeParaExibir;

        $.ajax({
            type: "GET",
            url: apiUrl,
            contentType: "application/json",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            },
            success: function (data) {
                var nomeCorreto = data[colunaNomeParaExibir];

                if (nomeCorreto) {
                    var $name = $("#" + lookupNameField);

                    // Atualiza visual imediatamente
                    $name.val(nomeCorreto);
                    $name.attr("title", nomeCorreto);
                    $name.attr("value", nomeCorreto);

                    // “segura” contra sobrescrita do Power Pages (2x tentativas rápidas)
                    setTimeout(function(){ $name.val(nomeCorreto).attr("value", nomeCorreto); }, 50);
                    setTimeout(function(){ $name.val(nomeCorreto).attr("value", nomeCorreto); }, 150);
                } else if (retries > 0) {
                    setTimeout(function () { updateLookupDisplayName(retries - 1); }, 120);
                }
            },
            error: function () {
                if (retries > 0) {
                    setTimeout(function () { updateLookupDisplayName(retries - 1); }, 150);
                }
            }
        });
    }

    // Troca de valor
    $("#" + lookupIdField).on("change", function () {
        updateLookupDisplayName(8);
    });

    // Também tenta ao carregar (Step Form às vezes injeta depois)
    setTimeout(function(){ updateLookupDisplayName(8); }, 200);
    setTimeout(function(){ updateLookupDisplayName(8); }, 800);

    // Observa mudanças no DOM para quando o campo aparece/re-renderiza
    new MutationObserver(function () {
        if ($("#" + lookupIdField).length) updateLookupDisplayName(3);
    }).observe(document.body, { childList: true, subtree: true });
});




/* ============================================================
   CONTROLE DINÂMICO – TIPO CADASTRO (CPF x CNPJ)
   ✔ Oculta campos quando CPF
   ✔ Força valor PROPRIETARIO (586450000)
   ✔ Funciona em multi-etapas
   ============================================================ */
(function () {

    const CAMPO_TIPO = '#cloud_tipo_cadastro';

    const CAMPOS_DEPENDENTES = [
        '#cloud_is_conglomerado_empresarial',
        '#cloud_nome_construtora',
        '#cloud_cnpj_construtora',
        '#cloud_nome_resp_faturamento'
    ];

    const VALOR_CPF = "586450001";
    const VALOR_PROPRIETARIO = "586450000";

    function esconderCampo(selector) {

        const $campo = $(selector);
        if (!$campo.length) return;

        // Oculta linha inteira do form (Power Pages table layout)
        $campo.closest('tr').hide();

        // Remove required visual
        $campo.removeAttr('required');

        // Limpa validação visual
        $campo.removeClass('is-invalid');
        $campo.next('.invalid-feedback').remove();
    }

    function mostrarCampo(selector) {

        const $campo = $(selector);
        if (!$campo.length) return;

        $campo.closest('tr').show();
    }

    function aplicarRegraTipoCadastro() {

    const $tipo = $(CAMPO_TIPO);
    if (!$tipo.length) return;

    const valor = ($tipo.val() || "").trim();
    const textoSelecionado = $tipo.find("option:selected").text().trim().toUpperCase();

    const ehCPF =
        valor === VALOR_CPF ||
        textoSelecionado === "CPF";

    if (ehCPF) {

        CAMPOS_DEPENDENTES.forEach(function(selector){

            const $campo = $(selector);
            if (!$campo.length) return;

            // Oculta linha inteira
            $campo.closest('tr').hide();

            // Remove required
            $campo.removeAttr('required');

            // Limpa erro visual
            $campo.removeClass('is-invalid');
            $campo.next('.invalid-feedback').remove();
        });

    } else {

        CAMPOS_DEPENDENTES.forEach(function(selector){

            const $campo = $(selector);
            if (!$campo.length) return;

            $campo.closest('tr').show();
        });
    }
}


    // Observa mudança manual
    $(document).on('change', CAMPO_TIPO, function () {
        setTimeout(aplicarRegraTipoCadastro, 50);
    });

    // Observa re-render do Step Form
    new MutationObserver(function () {
        aplicarRegraTipoCadastro();
    }).observe(document.body, { childList: true, subtree: true });

    // Primeira execução
    $(document).ready(function () {
        setTimeout(aplicarRegraTipoCadastro, 300);
    });

})();
// ======================================================
// OCULTAR BOTÃO ENVIAR DO BASIC FORM (Power Pages)
// ======================================================

(function(){

  function ocultarSubmit(){

    const container = document.querySelectorAll(".form-actions");

    container.forEach(function(el){
        el.style.display = "none";
    });

  }

  document.addEventListener("DOMContentLoaded", ocultarSubmit);

  new MutationObserver(ocultarSubmit)
      .observe(document.body,{childList:true,subtree:true});

})();