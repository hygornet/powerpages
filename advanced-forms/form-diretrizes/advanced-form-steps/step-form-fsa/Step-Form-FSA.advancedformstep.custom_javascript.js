// ============================================
// VARIÁVEL GLOBAL: Armazena campos a ocultar
// ============================================
var camposParaOcultar = [];




/* ============================================================
   3) MÁSCARAS E VALIDAÇÕES – CPF / CNPJ / RG / DATA
   ✅ RG: só letras e números
   ✅ DATA: não permite data passada (mensagem específica)
   ============================================================ */
$(document).ready(function () {

    const camposMascara = {
        cnpj: {
            selector: '#cloud_cnpj_construtora',
            mascara: aplicarMascaraCNPJ,
            validation: validarCNPJ,
            errorMsg: 'CNPJ inválido. Formato: 00.000.000/0000-00'
        },
        cpf: {
            selector: '#cloud_cpf_proprietario',
            mascara: aplicarMascaraCPF,
            validation: validarCPF,
            errorMsg: 'CPF inválido. Formato: 000.000.000-00'
        },
        rg: {
            selector: '#cloud_rg_proprietario',
            mascara: aplicarMascaraRG,
            validation: validarRG,
            errorMsg: 'RG inválido. Use apenas letras e números.'
        },
        data: {
            selector: '#cloud_data_prev_fim_obra_datepicker_description',
            mascara: aplicarMascaraData,
            validation: validarDataNaoPassada,
            errorMsg: 'Não é possível selecionar uma data passada!'
        }
    };

    Object.keys(camposMascara).forEach(function (key) {
        const config = camposMascara[key];
        const $field = $(config.selector);

        if (!$field.length) return;

        // INPUT
        $field.on('input', function () {
            const cursorPos = this.selectionStart;
            const valorAnterior = $(this).val();
            const valorFormatado = config.mascara($(this).val());

            $(this).val(valorFormatado);

            // Ajusta cursor (não quebra UX)
            const diff = valorFormatado.length - valorAnterior.length;
            try { this.setSelectionRange(cursorPos + diff, cursorPos + diff); } catch(e){}

            removerErro($(this));
        });

        // BLUR
        $field.on('blur', function () {
            validarCampo($(this), config);
        });

        // CHANGE (importante para calendário)
        $field.on('change', function () {
            validarCampo($(this), config);
        });

        // PASTE
        $field.on('paste', function () {
            const $this = $(this);
            setTimeout(function () {
                $this.val(config.mascara($this.val()));
                validarCampo($this, config);
            }, 10);
        });
    });

    // ==========================
    // MÁSCARAS
    // ==========================
    function aplicarMascaraRG(valor) {
        return (valor || '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 11);
    }

    function aplicarMascaraCPF(valor) {
        valor = valor.replace(/\D/g, '').substring(0, 11);
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return valor;
    }

    function aplicarMascaraCNPJ(valor) {
    if (!valor) return '';

    valor = valor.toUpperCase();

    // Remove tudo que não for letra ou número
    valor = valor.replace(/[^A-Z0-9]/g, '');

    // Limita a 14 posições
    valor = valor.substring(0, 14);

    // Se já chegou no DV, REMOVE letras do DV
    if (valor.length > 12) {
        const base = valor.substring(0, 12);               // raiz + ordem
        let dv = valor.substring(12, 14).replace(/\D/g, ''); // só números
        valor = base + dv;
    }

    // Aplica máscara SS.SSS.SSS/SSSS-NN
    let v = valor;
    v = v.replace(/^(.{2})(.)/, '$1.$2');
    v = v.replace(/^(.{2})\.(.{3})(.)/, '$1.$2.$3');
    v = v.replace(/^(.{2})\.(.{3})\.(.{3})(.)/, '$1.$2.$3/$4');
    v = v.replace(/^(.{2})\.(.{3})\.(.{3})\/(.{4})(.)/, '$1.$2.$3/$4-$5');

    return v;
}



    function aplicarMascaraData(valor) {
        valor = valor.replace(/\D/g, '').substring(0, 8);
        valor = valor.replace(/^(\d{2})(\d)/, '$1/$2');
        valor = valor.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
        return valor;
    }

    // ==========================
    // VALIDAÇÕES
    // ==========================
    function validarRG(valor) {
        return /^[A-Z0-9]{2,11}$/.test(valor);
    }

    function validarDataNaoPassada(valor) {
        const d = (valor || '').replace(/\D/g, '');
        if (d.length !== 8) return false;

        const dia = +d.substr(0, 2);
        const mes = +d.substr(2, 2);
        const ano = +d.substr(4, 4);

        const data = new Date(ano, mes - 1, dia);
        if (data.getDate() !== dia || data.getMonth() !== mes - 1) return false;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        data.setHours(0, 0, 0, 0);

        return data >= hoje;
    }

    // ======= (CPF/CNPJ seguem iguais ao seu, sem mexer) =======
    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let s = 0;
        for (let i = 0; i < 9; i++) s += cpf[i] * (10 - i);
        let d1 = 11 - (s % 11);
        if (d1 >= 10) d1 = 0;
        if (d1 != cpf[9]) return false;

        s = 0;
        for (let i = 0; i < 10; i++) s += cpf[i] * (11 - i);
        let d2 = 11 - (s % 11);
        if (d2 >= 10) d2 = 0;

        return d2 == cpf[10];
    }

function validarCNPJ(cnpj) {
    if (!cnpj) return false;

    // Remove máscara
    cnpj = cnpj.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cnpj.length !== 14) return false;

    // 🔎 Se tiver qualquer letra → mantém regra atual
    if (/[A-Z]/.test(cnpj)) {

        const raiz = cnpj.substring(0, 8);
        const ordem = cnpj.substring(8, 12);
        const dv = cnpj.substring(12, 14);

        if (!/^[A-Z0-9]{8}$/.test(raiz)) return false;
        if (!/^[A-Z0-9]{4}$/.test(ordem)) return false;
        if (!/^[0-9]{2}$/.test(dv)) return false;

        return true;
    }

    // 🔐 Se for somente números → valida CNPJ oficial Brasil
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14) return false;

    // Bloqueia sequências iguais (00000000000000 etc)
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros[tamanho - i] * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos[0]) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros[tamanho - i] * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado == digitos[1];
}


    // ==========================
    // VALIDAÇÃO GENÉRICA + UI
    // ==========================
    function validarCampo($field, config) {
        const v = ($field.val() || '').trim();

        if (!v && !$field.prop('required')) {
            removerErro($field);
            return true;
        }

        if (!config.validation(v)) {
            mostrarErro($field, config.errorMsg);
            return false;
        }

        removerErro($field);
        return true;
    }

    function mostrarErro($field, msg) {
        removerErro($field);
        $field.addClass('is-invalid');
        $field.after(`<div class="invalid-feedback d-block">${msg}</div>`);
        $field.css('border-color', '#dc3545');
    }

    function removerErro($field) {
        $field.removeClass('is-invalid');
        $field.next('.invalid-feedback').remove();
        $field.css('border-color', '');
    }
});


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
   5) CONTROLE GLOBAL DO BOTÃO AVANÇAR
   ✅ Data inválida
   ✅ CPF inválido
   ✅ CNPJ inválido
   ============================================================ */
(function(){

    const campoData = '#cloud_data_prev_fim_obra_datepicker_description';
    const campoCPF = '#cloud_cpf_proprietario';
    const campoCNPJ = '#cloud_cnpj_construtora';
    const botaoAvancar = 'input.next.submit-btn';

    function campoInvalido(selector){
        const $campo = $(selector);
        if (!$campo.length) return false;

        return $campo.hasClass('is-invalid') || $campo.data("data-invalida") === true;
    }

    function atualizarBotao() {

    const $btn = $(botaoAvancar);
    if (!$btn.length) return;

    const tipo = $('#cloud_tipo_cadastro').val();
    const ehCPF = tipo === "586450001";

    const dataInvalida = campoInvalido(campoData);
    const cpfInvalido  = campoInvalido(campoCPF);

    // 🔥 Se for CPF, ignora CNPJ
    let cnpjInvalido = false;

    if (!ehCPF) {
        cnpjInvalido = campoInvalido(campoCNPJ);
    }

    if (dataInvalida || cpfInvalido || cnpjInvalido) {

        $btn.prop('disabled', true);
        $btn.css({
            'opacity': '0.5',
            'cursor': 'not-allowed'
        });

    } else {

        $btn.prop('disabled', false);
        $btn.css({
            'opacity': '',
            'cursor': ''
        });
    }
}


    // Observa mudanças nos campos críticos
    $(document).on('input change blur', 
        campoData + ',' + campoCPF + ',' + campoCNPJ, 
        function(){
            setTimeout(atualizarBotao, 50);
        }
    );

    // Observa re-render do Step Form
    new MutationObserver(function(){
        atualizarBotao();
    }).observe(document.body, { childList:true, subtree:true });

    $(document).ready(function(){
        setTimeout(atualizarBotao, 300);
    });

})();
/* ============================================================
   ETAPA 2 – REGRA DINÂMICA TIPO CADASTRO
   ============================================================ */
(function () {

    const CAMPO_TIPO = '#cloud_tipo_cadastro';
    const CAMPO_PROPRIETARIO = '#cloud_is_conglomerado_empresarial';

    const VALOR_CPF = "586450001";
    const VALOR_PROPRIETARIO = "586450000";

    const CAMPOS_DEPENDENTES = [
        '#cloud_nome_construtora',
        '#cloud_cnpj_construtora',
        '#cloud_nome_resp_faturamento'
    ];

        function esconderCampo(selector) {

            const $campo = $(selector);
            if (!$campo.length) return;

            // Oculta linha inteira
            $campo.closest('tr').hide();

        }



    function mostrarCampo(selector) {
        const $campo = $(selector);
        if (!$campo.length) return;

        $campo.closest('tr').show();
    }

    function ocultarTipoCadastroVisualmente() {
    const $tipo = $('#cloud_tipo_cadastro');
    if (!$tipo.length) return;

    // Oculta apenas visualmente
    $tipo.closest('tr').hide();
    }


    function aplicarRegra() {

        const $tipo = $(CAMPO_TIPO);
        if (!$tipo.length) return;

        const valor = ($tipo.val() || "").trim();
        const ehCPF = valor === VALOR_CPF;

        if (ehCPF) {

            // 🔒 Oculta campos
            CAMPOS_DEPENDENTES.forEach(esconderCampo);

            // 🔄 Força valor PROPRIETARIO
            const $prop = $(CAMPO_PROPRIETARIO);
            if ($prop.length) {
                $prop.val(VALOR_PROPRIETARIO).trigger('change');
            }

        } else {

            // 👁️ Mostra novamente
            CAMPOS_DEPENDENTES.forEach(mostrarCampo);
        }
    }
function preencherCamposSeCPF() {

    const tipo = $(CAMPO_TIPO).val();
    if (tipo !== VALOR_CPF) return;

    // Preenche valores obrigatórios
    $('#cloud_nome_resp_faturamento')
        .val('586450000')
        .trigger('change');

    $('#cloud_cnpj_construtora')
        .val('00.000.000/0000-00')
        .trigger('change');

    $('#cloud_nome_construtora')
        .val('Não se aplica')
        .trigger('change');

     

}
// 🔐 Intercepta validação do Step Form


    // Ao mudar o tipo
    $(document).on('change', CAMPO_TIPO, function () {
        setTimeout(aplicarRegra, 50);
    });

    // Quando carregar a etapa
    $(document).ready(function () {
    setTimeout(function(){

        ocultarTipoCadastroVisualmente();
        aplicarRegra();
        preencherCamposSeCPF();   // 🔥 AQUI

    }, 300);
        });


    // Quando o Step Form re-renderizar
    new MutationObserver(function () {
        aplicarRegra();
    }).observe(document.body, { childList: true, subtree: true });

})();



// ============================================
// FIX DEFINITIVO: Botão ANTERIOR (PreviousButton)
// Força o __doPostBack mesmo se algum JS interferir
// ============================================
(function () {
  function bindPrevFix() {
    var prev = document.getElementById("PreviousButton");
    if (!prev) return;

    // Evita bind duplicado
    if (prev.dataset.prevfix === "1") return;
    prev.dataset.prevfix = "1";

    // Captura o clique antes dos outros scripts
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target;

        // se clicou no input ou em algum wrapper (por segurança, sobe na árvore)
        if (el && el.id !== "PreviousButton") {
          el = el.closest ? el.closest("#PreviousButton") : null;
        }
        if (!el) return;

        // Para interferências
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

        // Dispara postback do próprio botão
        if (typeof window.__doPostBack === "function") {
          window.__doPostBack(el.name, "");
        } else if (el.getAttribute("onclick")) {
          // fallback: executa o onclick original
          try { new Function(el.getAttribute("onclick"))(); } catch (err) {}
        } else {
          console.error("❌ __doPostBack não existe e onclick não encontrado no PreviousButton.");
        }
      },
      true // <<< CAPTURE (roda antes)
    );
  }

  // Tenta agora e também após re-render do step
  bindPrevFix();
  new MutationObserver(bindPrevFix).observe(document.body, { childList: true, subtree: true });
})();