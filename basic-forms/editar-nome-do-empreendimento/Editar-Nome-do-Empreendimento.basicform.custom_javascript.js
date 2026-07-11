{% assign solicitacaoId = request.params["id"] %} {% fetchxml solicitacao %}
<fetch top="1">
  <entity name="cloud_solicitacoes">
    <attribute name="cloud_nome_empreendimento" />
    <filter>
      <condition attribute="cloud_solicitacoesid" operator="eq" value="{{ solicitacaoId }}" />
    </filter>
  </entity>
</fetch>
{% endfetchxml %} {% assign registro = solicitacao.results.entities | first %}

(function () {

  const intervalo = setInterval(function() {

    
    const btn = document.getElementById("UpdateButton");
    
    if (btn) {
      console.log("✅ Botão encontrado:", btn);
      clearInterval(intervalo);
      configurarOverride();
      
    } else {
      console.log("❌ Botão NÃO encontrado");
      clearInterval(intervalo);
    }
  }, 500);

  function configurarOverride() {
    console.log("🔧 Configurando override...");
    
    const originalPostBack = window.WebForm_DoPostBackWithOptions;
    
    window.WebForm_DoPostBackWithOptions = function(options) {
      console.log("🔔 WebForm_DoPostBackWithOptions chamada!");
      console.log("🎯 EventTarget:", options.eventTarget);
      
      if (options.eventTarget === "ctl00$ContentContainer$MainContent$EntityFormControl$UpdateButton") {
        console.log("🟢 Botão Salvar Edição clicado!");
        chamarPowerAutomate();
      }
      
      return originalPostBack.call(this, options);
    };
    
    console.log("✅ Override configurado com sucesso");
  }

  function chamarPowerAutomate() {
    console.log("Chamando Power Automate...");

    const recordID = new URLSearchParams(window.location.search).get("id");
    
    // Pega o valor antigo (ajuste conforme necessário)
    const valorAntigo = "{{ registro.cloud_nome_empreendimento }}";
    
    // Pega o valor novo do campo
    const valorNovo = String(document.getElementById("cloud_nome_empreendimento") ? 
                             document.getElementById("cloud_nome_empreendimento").value : 
                             "").trim();

    if (!recordID || !valorNovo) {
      console.error("❌ Dados inválidos - RecordID ou ValorNovo ausente");
      return;
    }

    console.log("📋 Dados a enviar:", { recordID, valorAntigo, valorNovo });

    var data = {
      RecordID: recordID,
      VALOR_ANTIGO: valorAntigo,
      VALOR_NOVO: valorNovo
    };

    var payload = {
      eventData: JSON.stringify(data)
    };

    shell.ajaxSafePost({
      type: "POST",
      contentType: "application/json",
      url: "/_api/cloudflow/v1.0/trigger/b9a1abc5-d0df-f011-8543-000d3a5ae560",
      data: JSON.stringify(payload),
      processData: false,
      global: false
    })
    .done(function () {
      console.log("✅ Power Automate executado com sucesso!");
      
      // Aguarda e redireciona
      setTimeout(function () {
        window.location.href = "https://site-cjz8s.powerappsportals.com/minhas-solicitacoes/?forceRefresh=1&t=" + Date.now();
      }, 1200);
    })
    .fail(function (xhr, status, error) {
      console.error("❌ Erro ao executar Power Automate");
      console.error("Status:", xhr.status);
      console.error("Resposta:", xhr.responseText);
    });
  }

})();