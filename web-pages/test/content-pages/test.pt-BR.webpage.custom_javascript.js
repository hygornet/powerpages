
(function () {
  function avisarPaginaPai() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "ANEXO_PRELIMINAR_SALVO"
      }, "*");
    }
  }

  const observer = new MutationObserver(function () {
    const sucesso =
      document.querySelector(".alert-success") ||
      document.querySelector(".success") ||
      document.querySelector("[data-form-success]");

    if (sucesso && sucesso.innerText.trim() !== "") {
      avisarPaginaPai();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
