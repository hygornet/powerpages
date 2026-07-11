 $(document).ready(function () {
    const $field = $('#cloud_cnpj_construtora');

    if (!$field.length) return;

    // INPUT: aplica máscara enquanto digita
    $field.on('input', function () {
        const cursorPos = this.selectionStart;
        const valorAnterior = $(this).val();
        const valorFormatado = aplicarMascaraCNPJ($(this).val());

        $(this).val(valorFormatado);

        // Ajusta cursor
        const diff = valorFormatado.length - valorAnterior.length;
        try {
            this.setSelectionRange(cursorPos + diff, cursorPos + diff);
        } catch (e) {}

        removerErro($(this));
    });

    // BLUR: valida ao sair do campo
    $field.on('blur', function () {
        validarCampoCNPJ($(this));
    });

    // CHANGE: valida quando mudar o valor
    $field.on('change', function () {
        validarCampoCNPJ($(this));
    });

    // PASTE: aplica máscara e valida após colar
    $field.on('paste', function () {
        const $this = $(this);
        setTimeout(function () {
            $this.val(aplicarMascaraCNPJ($this.val()));
            validarCampoCNPJ($this);
        }, 10);
    });

    function aplicarMascaraCNPJ(valor) {
        if (!valor) return '';

        valor = valor.toUpperCase();

        // Remove tudo que não for letra ou número
        valor = valor.replace(/[^A-Z0-9]/g, '');

        // Limita a 14 posições
        valor = valor.substring(0, 14);

        // Se já chegou no DV, remove letras do DV
        if (valor.length > 12) {
            const base = valor.substring(0, 12);
            let dv = valor.substring(12, 14).replace(/\D/g, '');
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

    function validarCNPJ(cnpj) {
        if (!cnpj) return false;

        // Remove máscara
        cnpj = cnpj.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cnpj.length !== 14) return false;

        // Se tiver qualquer letra, aplica a regra alfanumérica do seu form
        if (/[A-Z]/.test(cnpj)) {
            const raiz = cnpj.substring(0, 8);
            const ordem = cnpj.substring(8, 12);
            const dv = cnpj.substring(12, 14);

            if (!/^[A-Z0-9]{8}$/.test(raiz)) return false;
            if (!/^[A-Z0-9]{4}$/.test(ordem)) return false;
            if (!/^[0-9]{2}$/.test(dv)) return false;

            return true;
        }

        // Se for somente números, valida CNPJ oficial Brasil
        cnpj = cnpj.replace(/\D/g, '');

        if (cnpj.length !== 14) return false;

        // Bloqueia sequências iguais
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

    function validarCampoCNPJ($field) {
        const valor = ($field.val() || '').trim();

        if (!valor && !$field.prop('required')) {
            removerErro($field);
            return true;
        }

        if (!validarCNPJ(valor)) {
            mostrarErro($field, 'CNPJ inválido. Formato: 00.000.000/0000-00');
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