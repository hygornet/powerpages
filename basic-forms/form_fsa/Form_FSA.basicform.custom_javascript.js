 // ============================================
// VARIÁVEL GLOBAL: Armazena campos a ocultar
// ============================================
var camposParaOcultar = [];


/* ============================================================
   3) MÁSCARAS E VALIDAÇÕES – CPF / CNPJ / RG / DATA
   Compatível com carregamento assíncrono do Power Pages
   ============================================================ */
(function () {

    const camposMascara = {
        cnpj: {
            selector: "#cloud_cnpj_construtora",
            mascara: aplicarMascaraCNPJ,
            validation: validarCNPJ,
            errorMsg: "CNPJ inválido. Formato: 00.000.000/0000-00"
        },
        cpf: {
            selector: "#cloud_cpf_proprietario",
            mascara: aplicarMascaraCPF,
            validation: validarCPF,
            errorMsg: "CPF inválido. Formato: 000.000.000-00"
        },
        rg: {
            selector: "#cloud_rg_proprietario",
            mascara: aplicarMascaraRG,
            validation: validarRG,
            errorMsg: "RG inválido. Use apenas letras e números."
        },
        data: {
            selector: "#cloud_data_prev_fim_obra_datepicker_description",
            mascara: aplicarMascaraData,
            validation: validarDataNaoPassada,
            errorMsg: "Não é possível selecionar uma data passada!"
        }
    };

    let timeoutInicializacao = null;

    // ==========================
    // MÁSCARAS
    // ==========================

    function aplicarMascaraRG(valor) {
        return (valor || "")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 11);
    }

    function aplicarMascaraCPF(valor) {
        valor = (valor || "")
            .replace(/\D/g, "")
            .substring(0, 11);

        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        return valor;
    }

    function aplicarMascaraCNPJ(valor) {
        if (!valor) return "";

        valor = valor
            .toString()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 14);

        /*
         * Os dois últimos caracteres, referentes aos dígitos
         * verificadores, devem ser numéricos.
         */
        if (valor.length > 12) {
            const base = valor.substring(0, 12);
            const dv = valor
                .substring(12, 14)
                .replace(/\D/g, "");

            valor = base + dv;
        }

        let formatado = valor;

        formatado = formatado.replace(/^(.{2})(.)/, "$1.$2");
        formatado = formatado.replace(
            /^(.{2})\.(.{3})(.)/,
            "$1.$2.$3"
        );
        formatado = formatado.replace(
            /^(.{2})\.(.{3})\.(.{3})(.)/,
            "$1.$2.$3/$4"
        );
        formatado = formatado.replace(
            /^(.{2})\.(.{3})\.(.{3})\/(.{4})(.)/,
            "$1.$2.$3/$4-$5"
        );

        return formatado;
    }

    function aplicarMascaraData(valor) {
        valor = (valor || "")
            .replace(/\D/g, "")
            .substring(0, 8);

        valor = valor.replace(/^(\d{2})(\d)/, "$1/$2");
        valor = valor.replace(
            /^(\d{2})\/(\d{2})(\d)/,
            "$1/$2/$3"
        );

        return valor;
    }

    // ==========================
    // VALIDAÇÕES
    // ==========================

    function validarRG(valor) {
        return /^[A-Z0-9]{2,11}$/.test(valor);
    }

    function validarDataNaoPassada(valor) {
        const numeros = (valor || "").replace(/\D/g, "");

        if (numeros.length !== 8) {
            return false;
        }

        const dia = Number(numeros.substring(0, 2));
        const mes = Number(numeros.substring(2, 4));
        const ano = Number(numeros.substring(4, 8));

        const data = new Date(ano, mes - 1, dia);

        const dataValida =
            data.getFullYear() === ano &&
            data.getMonth() === mes - 1 &&
            data.getDate() === dia;

        if (!dataValida) {
            return false;
        }

        const hoje = new Date();

        hoje.setHours(0, 0, 0, 0);
        data.setHours(0, 0, 0, 0);

        return data >= hoje;
    }

    function validarCPF(cpf) {
        cpf = (cpf || "").replace(/\D/g, "");

        if (
            cpf.length !== 11 ||
            /^(\d)\1+$/.test(cpf)
        ) {
            return false;
        }

        let soma = 0;

        for (let i = 0; i < 9; i++) {
            soma += Number(cpf[i]) * (10 - i);
        }

        let digito1 = 11 - (soma % 11);

        if (digito1 >= 10) {
            digito1 = 0;
        }

        if (digito1 !== Number(cpf[9])) {
            return false;
        }

        soma = 0;

        for (let i = 0; i < 10; i++) {
            soma += Number(cpf[i]) * (11 - i);
        }

        let digito2 = 11 - (soma % 11);

        if (digito2 >= 10) {
            digito2 = 0;
        }

        return digito2 === Number(cpf[10]);
    }

    function validarCNPJ(cnpj) {
        if (!cnpj) {
            return false;
        }

        cnpj = cnpj
            .toString()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "");

        if (cnpj.length !== 14) {
            return false;
        }

        /*
         * CNPJ alfanumérico.
         * Os dois últimos caracteres continuam numéricos.
         */
        if (/[A-Z]/.test(cnpj)) {
            const base = cnpj.substring(0, 12);
            const dv = cnpj.substring(12, 14);

            return (
                /^[A-Z0-9]{12}$/.test(base) &&
                /^[0-9]{2}$/.test(dv)
            );
        }

        if (/^(\d)\1+$/.test(cnpj)) {
            return false;
        }

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        const digitos = cnpj.substring(tamanho);

        let soma = 0;
        let posicao = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += Number(numeros[tamanho - i]) * posicao--;

            if (posicao < 2) {
                posicao = 9;
            }
        }

        let resultado =
            soma % 11 < 2
                ? 0
                : 11 - (soma % 11);

        if (resultado !== Number(digitos[0])) {
            return false;
        }

        tamanho++;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        posicao = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += Number(numeros[tamanho - i]) * posicao--;

            if (posicao < 2) {
                posicao = 9;
            }
        }

        resultado =
            soma % 11 < 2
                ? 0
                : 11 - (soma % 11);

        return resultado === Number(digitos[1]);
    }

    // ==========================
    // MENSAGEM DE ERRO
    // ==========================

    function removerErro($field) {
        $field.removeClass("is-invalid");
        $field.next(".invalid-feedback").remove();
        $field.css("border-color", "");
    }

    function mostrarErro($field, mensagem) {
        removerErro($field);

        $field.addClass("is-invalid");
        $field.css("border-color", "#dc3545");

        $field.after(
            '<div class="invalid-feedback d-block">' +
            mensagem +
            "</div>"
        );
    }

    function validarCampo($field, config) {
        const valor = ($field.val() || "").trim();

        if (!valor && !$field.prop("required")) {
            removerErro($field);
            return true;
        }

        if (!config.validation(valor)) {
            mostrarErro($field, config.errorMsg);
            return false;
        }

        removerErro($field);
        return true;
    }

    // ==========================
    // FORMATAR VALORES EXISTENTES
    // ==========================

    function formatarValorInicial($field, config) {
        const valorAtual = $field.val();

        if (!valorAtual) {
            return;
        }

        const valorFormatado = config.mascara(valorAtual);

        if (valorAtual !== valorFormatado) {
            $field.val(valorFormatado);
        }
    }

    // ==========================
    // INICIALIZAÇÃO DOS CAMPOS
    // ==========================

    function inicializarCampo(config) {
        const $field = $(config.selector);

        if (!$field.length) {
            return;
        }

        /*
         * Evita registrar os mesmos eventos várias vezes.
         */
        $field.off(".mascaraFSA");

        formatarValorInicial($field, config);

        $field.on("input.mascaraFSA", function () {
            const campo = this;
            const $campo = $(campo);

            const posicaoCursor =
                typeof campo.selectionStart === "number"
                    ? campo.selectionStart
                    : 0;

            const valorAnterior = $campo.val() || "";
            const valorFormatado =
                config.mascara(valorAnterior);

            $campo.val(valorFormatado);
            removerErro($campo);

            const diferenca =
                valorFormatado.length -
                valorAnterior.length;

            const novaPosicao =
                Math.max(
                    0,
                    posicaoCursor + diferenca
                );

            try {
                campo.setSelectionRange(
                    novaPosicao,
                    novaPosicao
                );
            } catch (erro) {
                // Alguns tipos de campo não permitem seleção.
            }
        });

        $field.on(
            "blur.mascaraFSA change.mascaraFSA",
            function () {
                validarCampo($(this), config);
            }
        );

        $field.on("paste.mascaraFSA", function () {
            const $campo = $(this);

            setTimeout(function () {
                $campo.val(
                    config.mascara($campo.val())
                );

                validarCampo($campo, config);
            }, 10);
        });

        $field.attr(
            "data-mascara-fsa-inicializada",
            "true"
        );
    }

    function inicializarMascaras() {
        Object.keys(camposMascara).forEach(function (chave) {
            inicializarCampo(camposMascara[chave]);
        });
    }

    function agendarInicializacao() {
        clearTimeout(timeoutInicializacao);

        timeoutInicializacao = setTimeout(function () {
            inicializarMascaras();
        }, 100);
    }

    // ==========================
    // CARREGAMENTO INICIAL
    // ==========================

    $(document).ready(function () {
        inicializarMascaras();

        setTimeout(inicializarMascaras, 300);
        setTimeout(inicializarMascaras, 800);
        setTimeout(inicializarMascaras, 1500);
        setTimeout(inicializarMascaras, 3000);
    });

    // ==========================
    // CARREGAMENTO ASSÍNCRONO
    // ==========================

    const observer = new MutationObserver(function (mutacoes) {
        const alterouFormulario = mutacoes.some(function (mutacao) {
            return (
                mutacao.type === "childList" &&
                mutacao.addedNodes.length > 0
            );
        });

        if (alterouFormulario) {
            agendarInicializacao();
        }
    });

    function iniciarObserver() {
        const secaoForm =
            document.getElementById("secao-etapa-2") ||
            document.body;

        observer.observe(secaoForm, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarObserver
        );
    } else {
        iniciarObserver();
    }

    // ==========================
    // POSTBACK PARCIAL ASP.NET
    // ==========================

    try {
        if (
            window.Sys &&
            Sys.WebForms &&
            Sys.WebForms.PageRequestManager
        ) {
            const pageRequestManager =
                Sys.WebForms.PageRequestManager.getInstance();

            pageRequestManager.add_endRequest(function () {
                setTimeout(inicializarMascaras, 100);
            });
        }
    } catch (erro) {
        console.warn(
            "Não foi possível registrar o postback parcial:",
            erro
        );
    }

})();

/* ============================================================
   4) CALENDÁRIO – BLOQUEIO REAL DE DATA PASSADA
   ✅ Bloqueia no calendário (min no input REAL)
   ✅ Se escolher/colar data passada: mostra erro custom
   ============================================================ */
(function () {

    const campoReal = '#cloud_data_prev_fim_obra'; // input type="date" (o que manda no calendário)
    const campoDesc = '#cloud_data_prev_fim_obra_datepicker_description'; // texto dd/mm/aaaa

    function hojeISO() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function showErroData() {
        const $desc = $(campoDesc);
        if (!$desc.length) return;

        // reaproveita padrão bootstrap
        $desc.addClass('is-invalid');
        if (!$desc.next('.invalid-feedback').length) {
            $desc.after(`<div class="invalid-feedback d-block">Não é permitido incluir uma data passada! Selecione outra data!</div>`);
        }
        $desc.css('border-color', '#dc3545');
    }

    function clearErroData() {
        const $desc = $(campoDesc);
        if (!$desc.length) return;

        $desc.removeClass('is-invalid');
        $desc.next('.invalid-feedback').remove();
        $desc.css('border-color', '');
    }

    function descToDate(v) {
        v = (v || '').trim();
        const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!m) return null;
        const dia = +m[1], mes = +m[2], ano = +m[3];
        const dt = new Date(ano, mes - 1, dia);
        if (dt.getDate() !== dia || dt.getMonth() !== (mes - 1)) return null;
        dt.setHours(0,0,0,0);
        return dt;
    }

    function aplicarMinEBloqueio() {

    const min = hojeISO();
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    // BLOQUEIA INPUT REAL
    const $real = $(campoReal);
    if ($real.length) {
        $real.attr('min', min);
        $real.prop('min', min);
    }

    const $desc = $(campoDesc);
    if (!$desc.length) return;

    const valor = $desc.val();
    const dt = descToDate(valor);

    if (!valor) {
        clearErroData();
        return;
    }

    if (!dt) {
        showErroData();
        return;
    }

    if (dt < hoje) {

        // NÃO LIMPA IMEDIATAMENTE
        showErroData();

        // bloqueia envio
        $desc.data("data-invalida", true);

    } else {
        clearErroData();
        $desc.data("data-invalida", false);
    }
}


    // roda no load + step form re-render
    $(document).ready(aplicarMinEBloqueio);
    new MutationObserver(aplicarMinEBloqueio)
        .observe(document.body, { childList: true, subtree: true });

    // reforço em change/blur no campo de texto
    $(document).on('change blur', campoDesc, aplicarMinEBloqueio);

})();



/* ============================================================
   ETAPA 2 – OCULTAR CAMPOS CNPJ QUANDO TIPO CADASTRO = CPF
   Condição: #cloud_tipo_cadastro === "586450001"
   ============================================================ */
(function () {
  const CAMPO_TIPO = "#cloud_tipo_cadastro";
  const VALOR_CPF = "586450001";

  const CAMPOS_CNPJ = [
    "#cloud_nome_construtora",
    "#cloud_cnpj_construtora",
    "#cloud_nome_resp_faturamento"
  ];

  function pegarValorTipoCadastro() {
    const el = document.querySelector(CAMPO_TIPO);
    if (!el) return null;
    return (el.value || "").toString().trim();
  }

  function pegarLinhaCampo(selector) {
    const campo = document.querySelector(selector);
    if (!campo) return null;

    return campo.closest("tr") ||
           campo.closest(".form-group") ||
           campo.closest(".control") ||
           campo.closest(".cell") ||
           campo.closest("td");
  }

  function desabilitarValidador(campoId, desabilitar) {
    if (typeof Page_Validators === "undefined") return;

    Page_Validators.forEach(function (validator) {
      if (validator.controltovalidate === campoId) {
        ValidatorEnable(validator, !desabilitar);
      }
    });
  }

  function aplicarRegraCpf() {
    const valorTipo = pegarValorTipoCadastro();

    // Se o campo ainda não carregou, não mostra nada ainda.
    if (valorTipo === null) return;

    const ehCpf = valorTipo === VALOR_CPF;

    CAMPOS_CNPJ.forEach(function (selector) {
      const campo = document.querySelector(selector);
      const linha = pegarLinhaCampo(selector);

      if (!campo || !linha) return;

      if (ehCpf) {
        linha.style.setProperty("display", "none", "important");

        campo.removeAttribute("required");
        campo.setAttribute("aria-required", "false");

        if (selector === "#cloud_nome_construtora") {
          campo.value = "Não se aplica";
        }

        if (selector === "#cloud_cnpj_construtora") {
          campo.value = "00.000.000/0000-00";
        }

        if (selector === "#cloud_nome_resp_faturamento") {
          campo.value = "586450000";
        }

        desabilitarValidador(campo.id, true);
      } else {
        linha.style.removeProperty("display");
        desabilitarValidador(campo.id, false);
      }
    });
  }

  $(document).on("change input", CAMPO_TIPO, function () {
    aplicarRegraCpf();
  });

  $(document).ready(function () {
    aplicarRegraCpf();

    setTimeout(aplicarRegraCpf, 300);
    setTimeout(aplicarRegraCpf, 800);
    setTimeout(aplicarRegraCpf, 1500);
    setTimeout(aplicarRegraCpf, 2500);
    setTimeout(aplicarRegraCpf, 4000);
  });

  const observer = new MutationObserver(function () {
    aplicarRegraCpf();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();




$(document).ready(function () {
  function ocultarMensagemSucesso() {
    $('.message.success, .alert-success.success').hide();
  }

  ocultarMensagemSucesso();

  const observer = new MutationObserver(function () {
    ocultarMensagemSucesso();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});