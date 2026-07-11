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
    '#cloud_numero_economias': 'inteiro',
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

  if (n === '' || parseInt(n, 10) === 0) {
    this.value = '';
    return;
  }

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
        // ---------- BLUR ----------
            $f.on('blur', function () {
            if (tipo === 'inteiro') {
                if (limparInteiro(this.value) === '') this.value = '';
            }

            if (tipo.includes('decimal')) {
                const n = limparDecimal(this.value);

                if (n === '' || parseInt(n, 10) === 0) {
                this.value = '';
                }
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

          if (n === '' || parseInt(n, 10) === 0) {
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
function aplicarTextoPadraoLookup(lookupIdField, lookupNameField) {
    var $id = $("#" + lookupIdField);
    var $name = $("#" + lookupNameField);

    if (!$name.length) return;

    var selectedId = ($id.val() || "").replace(/[{}]/g, '').trim();

    if (!selectedId) {
        $name.val("");
        $name.attr("placeholder", "Clique na lupa");
        $name.attr("title", "Clique na lupa");
    } else {
        $name.removeAttr("placeholder");
    }
}
$(document).ready(function () {

    var tabelaSetName = "cloud_finalidades_solicitacaos";
    var lookupIdField = "cloud_fk_finalidades_solicitacao";
    var lookupNameField = "cloud_fk_finalidades_solicitacao_name";
    var colunaNomeParaExibir = "cloud_nome_finalidade";

    function updateLookupDisplayName(retries) {
    retries = (typeof retries === "number") ? retries : 8;

    var $id = $("#" + lookupIdField);
    var $name = $("#" + lookupNameField);

    if (!$name.length) return;

    var selectedId = ($id.val() || "").replace(/[{}]/g, '').trim();

    if (!selectedId) {
        aplicarTextoPadraoLookup(lookupIdField, lookupNameField);
        return;
    }

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
                $name.val(nomeCorreto);
                $name.attr("title", nomeCorreto);
                $name.attr("value", nomeCorreto);
                $name.removeAttr("placeholder");

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
$("#" + lookupNameField).on("input blur", function () {
    aplicarTextoPadraoLookup(lookupIdField, lookupNameField);
});

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
   LOOKUP MUNICÍPIO
   Filtra visualmente municípios pelo cloud_portal = domínio do portal
   Campo lookup: cloud_fk_municipios
   Coluna obrigatória na view do lookup: cloud_portal
   ============================================================ */
$(document).ready(function () {

    const PORTAL_ATIVO = (window.PORTAL_ATIVO_DOMINIO || "").trim().toLowerCase();

    const colunaPortal = "cloud_portal";
    const colunaIdMunicipio = "cloud_id_municipio";
    const tituloIdMunicipio = "ID_MUNICIPIO";
    const tituloPortal = "PORTAL";

    const renomearMapa = {
        "NOME_MUNICIPIO": "Nome do Município",
        "NOME_REGIONAL (FK_REGIONAIS)": "Nome da Regional"
    };

    function isGridMunicipio($grid) {
    if (!$grid || !$grid.length) return false;

    const temPortal = $grid.find('td[data-attribute="cloud_portal"]').length > 0;
    const temMunicipio =
        $grid.find('td[data-attribute="cloud_nome_municipio"]').length > 0 ||
        $grid.find('td[data-attribute="cloud_id_municipio"]').length > 0;

    return temPortal && temMunicipio;
}

    function normalizar(valor) {
        return (valor || "")
            .toString()
            .trim()
            .toLowerCase();
    }

    function aplicarFiltroMunicipio() {
        if (!PORTAL_ATIVO) {
            console.warn("PORTAL_ATIVO_DOMINIO vazio. Filtro de município não aplicado.");
            return;
        }

        const $gridModal = $(".modal-dialog .entity-grid").filter(function () {
                return isGridMunicipio($(this));
            });

            if ($gridModal.length === 0) return;

        // Renomear cabeçalhos
        $gridModal.find("th.sort-enabled a, th a").each(function () {
            const $link = $(this);

            const textoPuro = $link.contents().filter(function () {
                return this.nodeType === 3;
            }).text().trim();

            if (renomearMapa[textoPuro]) {
                $link.contents().filter(function () {
                    return this.nodeType === 3;
                }).each(function () {
                    this.nodeValue = renomearMapa[textoPuro];
                });
            }
        });

        // Ocultar cabeçalhos técnicos
        $gridModal.find("th").each(function () {
            const $th = $(this);
            const thText = ($th.text() || "").trim().toUpperCase();

            const ocultar =
                thText.indexOf(tituloIdMunicipio) > -1 ||
                thText.indexOf(tituloPortal) > -1 ||
                $th.find('a[aria-label*="' + tituloIdMunicipio + '"]').length > 0 ||
                $th.find('a[aria-label*="' + tituloPortal + '"]').length > 0;

            if (ocultar) {
                $th.hide();
            }
        });

        // Ocultar colunas técnicas
        $gridModal.find('td[data-attribute="' + colunaIdMunicipio + '"]').hide();
        $gridModal.find('td[data-attribute="' + colunaPortal + '"]').hide();

        // Filtrar linhas pelo cloud_portal
        $gridModal.find("tbody tr").each(function () {
            const $tr = $(this);
            const portalLinha = normalizar(
                $tr.find('td[data-attribute="' + colunaPortal + '"]').text()
            );

            if (!portalLinha) {
                $tr.hide();
                return;
            }

            if (portalLinha === PORTAL_ATIVO) {
                $tr.show();
            } else {
                $tr.hide();
            }
        });
    }

    const observer = new MutationObserver(function () {
        const $gridModal = $(".modal-dialog .entity-grid");

        if ($gridModal.length > 0 && isGridMunicipio($gridModal)) {
            aplicarFiltroMunicipio();

            if (!$gridModal.data("monitorandoMunicipioPortal")) {
                $gridModal.on("loaded", function () {
                    setTimeout(aplicarFiltroMunicipio, 80);
                    setTimeout(aplicarFiltroMunicipio, 250);
                    setTimeout(aplicarFiltroMunicipio, 600);
                });

                $gridModal.data("monitorandoMunicipioPortal", true);
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

    var $id = $("#" + lookupIdField);
    var $name = $("#" + lookupNameField);

    if (!$name.length) return;

    var selectedId = ($id.val() || "").replace(/[{}]/g, '').trim();

    if (!selectedId) {
        aplicarTextoPadraoLookup(lookupIdField, lookupNameField);
        return;
    }

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
                $name.val(nomeCorreto);
                $name.attr("title", nomeCorreto);
                $name.attr("value", nomeCorreto);
                $name.removeAttr("placeholder");

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
$("#" + lookupNameField).on("input blur", function () {
    aplicarTextoPadraoLookup(lookupIdField, lookupNameField);
});

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
// ============================================================
// CONTROLE DINÂMICO – TIPO CADASTRO (CPF x CNPJ)
// + CORREÇÃO VISUAL DO RADIO IS_CONGLOMERADO_EMPRESARIAL
// ============================================================
// ============================================================
// CONTROLE DINÂMICO – TIPO CADASTRO (CPF x CNPJ)
// + AJUSTE VISUAL DO RADIO IS_CONGLOMERADO_EMPRESARIAL
// ============================================================

(function () {

    const CAMPO_TIPO = '#cloud_tipo_cadastro';
    const CAMPO_CONGLOMERADO = '#cloud_is_conglomerado_empresarial';

    const CAMPOS_DEPENDENTES = [
        '#cloud_is_conglomerado_empresarial',
        '#cloud_nome_construtora',
        '#cloud_cnpj_construtora',
        '#cloud_nome_resp_faturamento'
    ];

    const VALOR_CPF = "586450001";

    let ultimoModoTipoCadastro = null;

    function garantirCssConglomerado() {
        if (document.getElementById('fix-css-conglomerado-radio')) return;

        const style = document.createElement('style');
        style.id = 'fix-css-conglomerado-radio';
        style.textContent = `
            #cloud_is_conglomerado_empresarial.boolean-radio {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
                margin-top: 6px !important;
            }

            #cloud_is_conglomerado_empresarial.boolean-radio > span {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
                gap: 8px !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #cloud_is_conglomerado_empresarial.boolean-radio > span > input[type="radio"] {
                margin: 0 !important;
                position: static !important;
                opacity: 1 !important;
                width: 16px !important;
                height: 16px !important;
                flex: 0 0 16px !important;
                vertical-align: middle !important;
            }

            /* ESCONDE O LABEL ORIGINAL COMPLETAMENTE */
            #cloud_is_conglomerado_empresarial.boolean-radio > span > label {
                position: absolute !important;
                left: -9999px !important;
                top: auto !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important;
                padding: 0 !important;
                margin: 0 !important;
                border: 0 !important;
                clip: rect(0 0 0 0) !important;
                white-space: nowrap !important;
                font-size: 0 !important;
                color: transparent !important;
            }

            /* DESLIGA A BOLINHA FAKE DO LABEL */
            #cloud_is_conglomerado_empresarial.boolean-radio > span > label::before,
            #cloud_is_conglomerado_empresarial.boolean-radio > span > label::after {
                content: none !important;
                display: none !important;
            }

            /* NOVO TEXTO VISÍVEL */
            #cloud_is_conglomerado_empresarial .pp-radio-label-visible {
                display: inline-block !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #374151 !important;
                font-size: 15px !important;
                font-weight: 600 !important;
                line-height: 18px !important;
                white-space: nowrap !important;
                vertical-align: middle !important;
                cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);
    }

    function encontrarLinhaCampo(selector) {
        let $linha = $(selector).closest('tr');

        if ($linha.length) return $linha;

        $linha = $('tr, .control, .form-group, td, fieldset').filter(function () {
            return $(this).find("[id*='cloud_is_conglomerado_empresarial'], [name*='cloud_is_conglomerado_empresarial']").length > 0;
        }).first();

        return $linha;
    }

    function limparRotulosVisuaisConglomerado() {
        const $grupo = $(CAMPO_CONGLOMERADO + '.boolean-radio');
        if (!$grupo.length) return;

        $grupo.find('.pp-radio-label-visible').remove();
    }

    function textoOpcaoConglomerado($radio, index) {
        const valor = String($radio.val() || '').trim().toLowerCase();

        if (valor === 'false' || valor === '0' || valor === 'no' || valor === 'nao' || valor === 'não') {
            return 'NÃO';
        }

        if (valor === 'true' || valor === '1' || valor === 'yes' || valor === 'sim') {
            return 'SIM';
        }

        return index === 0 ? 'NÃO' : 'SIM';
    }

    function aplicarVisualConglomerado() {
        garantirCssConglomerado();

        const $grupo = $(CAMPO_CONGLOMERADO + '.boolean-radio');
        if (!$grupo.length || !$grupo.is(':visible')) return;

        limparRotulosVisuaisConglomerado();

        const $opcoes = $grupo.children('span');

        $opcoes.each(function (index) {
            const $opcao = $(this);
            const $radio = $opcao.find("input[type='radio']").first();
            const $label = $opcao.find("label").first();

            if (!$radio.length) return;

            const texto = textoOpcaoConglomerado($radio, index);

            const $novoTexto = $('<span class="pp-radio-label-visible"></span>')
                .text(texto);

            if ($label.length) {
                $label.after($novoTexto);
            } else {
                $radio.after($novoTexto);
            }

            $novoTexto.off('click.ppConglomerado').on('click.ppConglomerado', function (e) {
                e.preventDefault();
                $radio.prop('checked', true).trigger('change').trigger('click');
            });
        });
    }

    function esconderCampo(selector) {
        const $campo = $(selector);
        if (!$campo.length) return;

        if (selector === CAMPO_CONGLOMERADO) {
            limparRotulosVisuaisConglomerado();
        }

        $campo.closest('tr').hide();
        $campo.removeAttr('required');
        $campo.removeClass('is-invalid');
        $campo.next('.invalid-feedback').remove();
    }

    function mostrarCampo(selector) {
        const $campo = $(selector);
        if (!$campo.length) return;

        $campo.closest('tr').show();
    }

    function resetarConglomeradoParaNao() {
        const $linha = encontrarLinhaCampo(CAMPO_CONGLOMERADO);
        if (!$linha.length) return;

        const $radioNao = $linha.find("input[type='radio']").filter(function () {
            const v = String($(this).val() || '').trim().toLowerCase();
            return v === 'false' || v === '0' || v === 'no' || v === 'nao' || v === 'não';
        }).first();

        if ($radioNao.length) {
            $radioNao.prop('checked', true).trigger('click').trigger('change');
            return;
        }

        const $primeiroRadio = $linha.find("input[type='radio']").first();
        if ($primeiroRadio.length) {
            $primeiroRadio.prop('checked', true).trigger('click').trigger('change');
        }
    }

    function aplicarRegraTipoCadastro() {
    const $tipo = $(CAMPO_TIPO);
    if (!$tipo.length) return;

    const valor = ($tipo.val() || "").trim();
    const textoSelecionado = $tipo.find("option:selected").text().trim().toUpperCase();

    const semSelecao = valor === "";
    const ehCPF = valor === VALOR_CPF || textoSelecionado === "CPF";
    const ehCNPJ = !semSelecao && !ehCPF;

    if (!ehCNPJ) {
        CAMPOS_DEPENDENTES.forEach(function (selector) {
            esconderCampo(selector);
        });

        // ao sair de CNPJ, força voltar para NÃO
        if (ultimoModoTipoCadastro !== 'NAO_CNPJ') {
            resetarConglomeradoParaNao();
        }

        ultimoModoTipoCadastro = 'NAO_CNPJ';
        return;
    }

    // aqui é CNPJ
    CAMPOS_DEPENDENTES.forEach(function (selector) {
        mostrarCampo(selector);
    });

    // só define NÃO quando acabou de entrar em CNPJ
    if (ultimoModoTipoCadastro !== 'CNPJ') {
        resetarConglomeradoParaNao();
    }

    ultimoModoTipoCadastro = 'CNPJ';

    setTimeout(aplicarVisualConglomerado, 80);
    setTimeout(aplicarVisualConglomerado, 250);
    setTimeout(aplicarVisualConglomerado, 700);
}

    $(document).on('change', CAMPO_TIPO, function () {
        setTimeout(aplicarRegraTipoCadastro, 50);
    });

    new MutationObserver(function () {
        aplicarRegraTipoCadastro();
    }).observe(document.body, { childList: true, subtree: true });

    $(document).ready(function () {
        setTimeout(aplicarRegraTipoCadastro, 300);
        setTimeout(aplicarVisualConglomerado, 800);
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