// ======================================================
// POWER PAGES - MÁSCARAS (VERSÃO ENXUTA)
// ✔ cloud_volume_agua_processo → decimal m³
// ✔ cloud_numero_funcionarios → inteiro (funcionário/s)
// ======================================================



(function () {

  // ============================
  // CONFIG
  // ============================
  const campos = {
    '#cloud_volume_agua_processo': 'decimal_m3',
    '#cloud_numero_funcionarios': 'inteiro_funcionarios'
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
      .add(`input[name='${id}'], textarea[name='${id}']`);
  }

  // ============================
  // INTEIRO (FUNCIONÁRIOS)
  // ============================
  function limparInteiro(v) {
    return (v || '').replace(/\D/g, '');
  }

  function inteiroFuncionariosVisual(v) {
    v = limparInteiro(v);
    if (v === '') return '';

    const n = parseInt(v, 10);
    if (n === 0) return '0 funcionários';
    if (n === 1) return '1 funcionário';
    return `${n} funcionários`;
  }

  // ============================
  // DECIMAL m³
  // ============================
  function limparDecimal(v) {
    return (v || '').replace(/\D/g, '');
  }

  function formatarMilhar(v) {
    return v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function decimalBase(v) {
    v = limparDecimal(v);
    if (v === '') return '';

    v = v.padStart(3, '0');
    let i = v.slice(0, -2);
    let d = v.slice(-2);

    i = formatarMilhar(String(parseInt(i, 10) || 0));
    return `${i},${d}`;
  }

  function decimalM3Visual(v) {
    const base = decimalBase(v);
    if (base === '') return '';
    return `${base} m³`;
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

        // BACKSPACE / DELETE
        $f.on('keydown', function (e) {
          if (e.key !== 'Backspace' && e.key !== 'Delete') return;
          e.preventDefault();

          if (tipo === 'inteiro_funcionarios') {
            let n = limparInteiro(this.value).slice(0, -1);
            this.value = inteiroFuncionariosVisual(n);
          }

          if (tipo === 'decimal_m3') {
            let n = limparDecimal(this.value).slice(0, -1);
            this.value = decimalM3Visual(n);
          }
        });

        // INPUT
        $f.on('input', function () {
          if (this.value === '') return;

          if (tipo === 'inteiro_funcionarios') {
            this.value = inteiroFuncionariosVisual(this.value);
          }

          if (tipo === 'decimal_m3') {
            this.value = decimalM3Visual(this.value);
          }
        });

        // BLUR
        $f.on('blur', function () {
          if (
            (tipo === 'inteiro_funcionarios' && limparInteiro(this.value) === '') ||
            (tipo === 'decimal_m3' && limparDecimal(this.value) === '')
          ) {
            this.value = '';
          }
        });

      });
    });
  }

  // ============================
  // PREPARAR ENVIO (SUBMIT)
  // ============================
  function prepararEnvio() {

    Object.keys(campos).forEach(sel => {
      const tipo = campos[sel];

      pegarCampos(sel).each(function () {

        if (tipo === 'inteiro_funcionarios') {
          this.value = limparInteiro(this.value);
        }

        if (tipo === 'decimal_m3') {
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

        if (tipo === 'inteiro_funcionarios') {
          this.value = inteiroFuncionariosVisual(this.value);
        }

        if (tipo === 'decimal_m3') {
          this.value = decimalM3Visual(this.value);
        }
      });
    });
  }

  // ============================
  // INTERCEPTA VALIDAÇÃO
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

  new MutationObserver(boot)
    .observe(document.body, { childList: true, subtree: true });

  boot();

})();