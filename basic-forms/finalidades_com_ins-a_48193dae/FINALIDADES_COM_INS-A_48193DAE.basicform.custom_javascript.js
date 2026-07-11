(function () {

    const camposInteiros = [
        '#cloud_estimativa_publico_diario',
        '#cloud_numero_funcionarios'
    ];

    function aplicarMascaraInteiro($field) {
        if ($field.data('inteiro-ok')) return;
        $field.data('inteiro-ok', true);

        $field.attr('inputmode', 'numeric');
        $field.attr('pattern', '[0-9]*');

        function deixarSomenteNumeros(input) {
            input.value = (input.value || '').replace(/\D/g, '');
        }

        $field.on('input', function () {
            deixarSomenteNumeros(this);
        });

        $field.on('paste', function () {
            const input = this;
            setTimeout(function () {
                deixarSomenteNumeros(input);
            }, 0);
        });

        $field.on('blur', function () {
            deixarSomenteNumeros(this);
        });

        $field.on('focus', function () {
            deixarSomenteNumeros(this);
        });

        // aplica ao carregar
        deixarSomenteNumeros($field[0]);
    }

    function aplicarMascaras() {
        camposInteiros.forEach(selector => {
            const $field = $(selector);

            if ($field.length) {
                aplicarMascaraInteiro($field);
            }
        });
    }

    const observer = new MutationObserver(aplicarMascaras);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    aplicarMascaras();

    setTimeout(aplicarMascaras, 300);
    setTimeout(aplicarMascaras, 800);

    $('form').on('submit', function () {
        camposInteiros.forEach(selector => {
            const $field = $(selector);

            if ($field.length) {
                $field.val(($field.val() || '').replace(/\D/g, ''));
            }
        });
    });

})();