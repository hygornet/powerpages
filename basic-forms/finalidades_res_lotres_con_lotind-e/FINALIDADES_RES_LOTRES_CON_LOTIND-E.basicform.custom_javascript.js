 // ======================================================
// STEP FORM – CAMPOS SOMENTE NÚMEROS INTEIROS
// (sem valor padrão 0)
// ======================================================

(function () {

    const camposInteiros = [

        '#cloud_quantidade_box',
        '#cloud_qtd_apt_1_dorm_maior_12',
        '#cloud_qtd_apt_1_dorm_menor_12',
        '#cloud_qtd_apt_2_dorm_maior_12',
        '#cloud_qtd_apt_2_dorm_menor_12',
        '#cloud_qtd_apt_3_dorm_maior_12',
        '#cloud_qtd_apt_3_dorm_menor_12',
        '#cloud_qtd_apt_4_dorm_maior_12',
        '#cloud_qtd_apt_4_dorm_menor_12'
    ];

    function aplicarMascaraInteiro($field) {
        if ($field.data('inteiro-ok')) return;
        $field.data('inteiro-ok', true);

        // Melhora teclado mobile
        $field.attr('inputmode', 'numeric');
        $field.attr('pattern', '[0-9]*');

        // INPUT → remove tudo que não for número
        $field.on('input', function () {
            this.value = this.value.replace(/\D/g, '');
        });

        // BLUR → apenas limpa lixo visual (não força valor)
        $field.on('blur', function () {
            $(this)
                .removeClass('is-invalid')
                .css('border-color', '')
                .next('.invalid-feedback')
                .remove();
        });
    }

    function aplicarMascaras() {
        camposInteiros.forEach(selector => {
            const $field = $(selector);
            if ($field.length) {
                aplicarMascaraInteiro($field);
            }
        });
    }

    // ============================
    // OBSERVADOR (STEP FORM)
    // ============================
    const observer = new MutationObserver(aplicarMascaras);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    aplicarMascaras();

})();