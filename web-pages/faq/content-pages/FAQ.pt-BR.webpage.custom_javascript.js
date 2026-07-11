(function () {

  const modal = document.getElementById("faqModal");
  const title = document.getElementById("faqModalTitle");
  const text = document.getElementById("faqModalText");
  const closeBtn = document.querySelector(".faq-close");
  const okBtn = document.querySelector(".faq-ok");

  document.querySelectorAll(".faq-card a[data-title]").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      title.innerText = this.dataset.title;
      text.innerText = this.dataset.text;
      modal.style.display = "flex";
    });
  });

  function fecharModal() {
    modal.style.display = "none";
  }

  closeBtn.addEventListener("click", fecharModal);
  okBtn.addEventListener("click", fecharModal);

})();
(function () {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", function () {
      const item = this.parentElement;
      item.classList.toggle("active");
    });
  });
})();
