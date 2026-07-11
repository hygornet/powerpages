{% assign solicitacaoId = request.params["id"] %} {% fetchxml solicitacao %}
<fetch top="1">
  <entity name="cloud_solicitacoes">
    <attribute name="cloud_numero_economias" />
    <attribute name="cloud_status_atual" />
    <attribute name="cloud_etapa" />
    <attribute name="cloud_fase" />
    <filter>
      <condition attribute="cloud_solicitacoesid" operator="eq" value="{{ solicitacaoId }}" />
    </filter>
  </entity>
</fetch>
{% endfetchxml %} {% assign registro = solicitacao.results.entities | first %}

(function () {

  console.log("🧠 Script de confirmação carregado");

  const intervalo = setInterval(function () {

    // Botão OK do modal de confirmação
    const btnOk = document.querySelector(
      ".modal-footer button.btn-primary"
    );

    if (btnOk && !btnOk.dataset.flowBound) {

      console.log("✅ Botão OK do modal encontrado");

      btnOk.dataset.flowBound = "true";

      btnOk.addEventListener("click", function () {
        console.log("🟢 Usuário confirmou no modal (OK)");
        chamarPowerAutomate();
      });

      clearInterval(intervalo);
    }

  }, 300);

  function chamarPowerAutomate() {

    console.log("🚀 Chamando Power Automate");

    const recordID = new URLSearchParams(window.location.search).get("id");

    const valorAntigo = "{{ registro.cloud_numero_economias }}";
    

    const campo = document.getElementById("cloud_numero_economias");
    const valorNovo = campo ? campo.value.trim() : "";

    if (!recordID || !valorNovo) {
      console.error("❌ Dados inválidos");
      return;
    }

    const payload = {
      eventData: JSON.stringify({
        RecordID: recordID,
        VALOR_ANTIGO: valorAntigo,
        VALOR_NOVO: valorNovo
      })
    };

    shell.ajaxSafePost({
      type: "POST",
      contentType: "application/json",
      url: "/_api/cloudflow/v1.0/trigger/8a44f186-b5e4-f011-8543-000d3a5ae560",
      data: JSON.stringify(payload),
      processData: false,
      global: false
    })
    .done(function () {
      console.log("✅ Power Automate executado");
    })
    .fail(function (xhr) {
      console.error("❌ Erro ao executar fluxo", xhr.responseText);
    });
  }

})();