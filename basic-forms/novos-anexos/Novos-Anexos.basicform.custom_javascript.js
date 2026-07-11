function aplicarClassePadraoUpload() {

  const interval = setInterval(function () {

    const btn = document.getElementById("UploadButton");
    if (!btn) return;

    clearInterval(interval);

    console.log("🎨 Ajustando UploadButton para padrão do sistema");

    // 🔥 remove classe moderna do form
    const form = btn.closest(".custom-modern-form");
    if (form) {
      form.classList.remove("custom-modern-form");
      console.log("🚫 custom-modern-form removido");
    }

    // 🔥 força classe correta
    btn.className = "btn btn-default btn-secondary";

    // 🔥 remove estilos inline se existirem
    btn.removeAttribute("style");

  }, 300);
}

aplicarClassePadraoUpload();

