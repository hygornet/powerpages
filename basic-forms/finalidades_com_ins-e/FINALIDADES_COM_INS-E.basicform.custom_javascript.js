
(function () {

    const camposComPessoa = [
        '#cloud_estimativa_publico_diario',
        '#cloud_numero_funcionarios'
    ];

    let modoSalvando = false;

    function deixarSomenteNumeros(valor) {
        return (valor || '').toString().replace(/\D/g, '');
    }

    function textoPessoa(numero) {
        const n = parseInt(numero, 10);

        if (!n || n <= 0) {
            return '';
        }

        return n === 1 ? ' pessoa' : ' pessoas';
    }

    function aplicarMascaraVisual($field) {
        if (modoSalvando) return;

        const numero = deixarSomenteNumeros($field.val());

        if (numero) {
            $field.val(numero + textoPessoa(numero));
        } else {
            $field.val('');
        }

        const input = $field[0];
        const posicao = numero.length;

        setTimeout(function () {
            try {
                input.setSelectionRange(posicao, posicao);
            } catch (e) {}
        }, 0);
    }

    function limparCamposParaSalvar() {
        modoSalvando = true;

        camposComPessoa.forEach(function (selector) {
            const $field = $(selector);

            if ($field.length) {
                const numero = deixarSomenteNumeros($field.val());
                $field.val(numero);
            }
        });
    }

    function reaplicarMascaraSeNaoSalvou() {
        setTimeout(function () {
            modoSalvando = false;

            camposComPessoa.forEach(function (selector) {
                const $field = $(selector);

                if ($field.length) {
                    aplicarMascaraVisual($field);
                }
            });
        }, 1500);
    }

    function aplicarMascaraPessoa($field) {
        if ($field.data('pessoa-ok')) return;
        $field.data('pessoa-ok', true);

        $field.attr('inputmode', 'numeric');
        $field.attr('pattern', '[0-9]*');

        $field.on('input', function () {
            aplicarMascaraVisual($field);
        });

        $field.on('paste', function () {
            setTimeout(function () {
                aplicarMascaraVisual($field);
            }, 0);
        });

        $field.on('focus', function () {
            aplicarMascaraVisual($field);
        });

        $field.on('blur', function () {
            aplicarMascaraVisual($field);
        });

        aplicarMascaraVisual($field);
    }

    function aplicarMascaras() {
        camposComPessoa.forEach(function (selector) {
            const $field = $(selector);

            if ($field.length) {
                aplicarMascaraPessoa($field);
            }
        });
    }

    /*
      CAPTURA NATIVA:
      roda antes dos validadores do Power Pages / ASP.NET
    */
    document.addEventListener('mousedown', function (e) {
        const btn = e.target.closest('#UpdateButton, #InsertButton, input[type="submit"], button[type="submit"]');

        if (btn) {
            limparCamposParaSalvar();
        }
    }, true);

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('#UpdateButton, #InsertButton, input[type="submit"], button[type="submit"]');

        if (btn) {
            limparCamposParaSalvar();
            reaplicarMascaraSeNaoSalvou();
        }
    }, true);

    document.addEventListener('submit', function () {
        limparCamposParaSalvar();
    }, true);

    /*
      Garante também antes da validação do ASP.NET
    */
    if (typeof window.Page_ClientValidate === 'function') {
        const originalPageClientValidate = window.Page_ClientValidate;

        window.Page_ClientValidate = function () {
            limparCamposParaSalvar();
            return originalPageClientValidate.apply(this, arguments);
        };
    }

    /*
      Garante também antes do postback do Power Pages
    */
    if (typeof window.WebForm_DoPostBackWithOptions === 'function') {
        const originalPostBack = window.WebForm_DoPostBackWithOptions;

        window.WebForm_DoPostBackWithOptions = function () {
            limparCamposParaSalvar();
            return originalPostBack.apply(this, arguments);
        };
    }

    const observer = new MutationObserver(aplicarMascaras);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    aplicarMascaras();

    setTimeout(aplicarMascaras, 300);
    setTimeout(aplicarMascaras, 800);
    setTimeout(aplicarMascaras, 1500);

})();
