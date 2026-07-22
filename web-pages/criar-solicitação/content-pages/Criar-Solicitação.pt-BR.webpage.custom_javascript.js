document.addEventListener("DOMContentLoaded", function () {
  var cards = document.querySelectorAll("[data-unit-card]");

  function save(key, value) {
    try {
      localStorage.setItem(key, value || "");
    } catch (error) {
      // The destination still works when storage is unavailable.
    }
  }

  function getDestination(domain, fallback) {
    if (!domain) return fallback;

    try {
      var base = /^https?:\/\//i.test(domain) ? domain : "https://" + domain;
      var destination = new URL(base);
      destination.pathname = "/iniciar-viabilidade/";
      destination.search = "";
      destination.hash = "";
      return destination.toString();
    } catch (error) {
      return fallback;
    }
  }

  cards.forEach(function (card) {
    card.href = getDestination(card.dataset.unitDomain, card.href);

    card.addEventListener("click", function () {
      save("aegea_unidade_selecionada", card.dataset.unitName);
      save("aegea_unidade_logo", card.dataset.unitLogo);
      save("aegea_unidade_footer_logo", card.dataset.unitFooterLogo);
      save("aegea_unidade_photo", card.dataset.unitPhoto);
    });
  });
});
