(function(){

  const tabs = document.querySelectorAll(".fase-card");
  const panes = document.querySelectorAll(".fase-pane");

  tabs.forEach(tab => {

    tab.addEventListener("click", function(){

      const fase = this.dataset.fase;

      tabs.forEach(t => {
        t.classList.remove("active");
        t.querySelector(".fase-icon").classList.remove("active");
      });

      panes.forEach(p => p.classList.remove("active"));

      this.classList.add("active");
      this.querySelector(".fase-icon").classList.add("active");

      document.querySelector('[data-content="'+fase+'"]')
              .classList.add("active");

    });

  });

})();



(function () {

  var flowUrl = "/_api/cloudflow/v1.0/trigger/06bfccd0-bcef-f011-8406-7ced8da81546";

  var intervalo = setInterval(function () {
    var btnDeAcordo = document.getElementById("btnDeAcordo");
    var btnConfirmar = document.getElementById("btnConfirmarModal");
    var btnCancelar = document.getElementById("btnCancelarModal");
    var btnOkSucesso = document.getElementById("btnOkSucesso");
    var modalConfirmacao = document.getElementById("modalConfirmacaoTaxa");
    var modalSucesso = document.getElementById("modalSucesso");
    var recordID = "{{ solicitacaoId }}";
    var valorTaxa = "{{ taxaValor }}";

    if (
      btnDeAcordo &&
      btnConfirmar &&
      btnCancelar &&
      modalConfirmacao &&
      window.shell &&
      typeof shell.ajaxSafePost === "function"
    ) {
      clearInterval(intervalo);
      configurarEventos();
    }

    function configurarEventos() {

      btnDeAcordo.addEventListener("click", function (e) {
        e.preventDefault();
        modalConfirmacao.style.display = "flex";
      });

      btnCancelar.addEventListener("click", function (e) {
        e.preventDefault();
        modalConfirmacao.style.display = "none";
      });


      btnConfirmar.addEventListener("click", function () {

        if (btnConfirmar.dataset.executando === "true") return;

        btnConfirmar.dataset.executando = "true";
        btnConfirmar.disabled = true;

        var textoOriginal = btnConfirmar.innerText;
        btnConfirmar.innerText = "Processando...";

        if (!recordID || !valorTaxa) {
          alert("Erro ao obter dados da solicitação.");
          resetarBotao();
          return;
        }

        console.log("🚀 Chamando Flow", { recordID, valorTaxa });

        var payload = {
          eventData: JSON.stringify({
            RecordID: recordID,
            ValorTaxa: valorTaxa
          })
        };

        shell.ajaxSafePost({
          type: "POST",
          contentType: "application/json",
          url: flowUrl,
          data: JSON.stringify(payload),
          processData: false,
          global: false
        })
        .done(function () {
          modalConfirmacao.style.display = "none";
          modalSucesso.style.display = "flex";
        })
        .fail(function (xhr) {
})
        .always(function () {
          resetarBotao();
        });

        function resetarBotao() {
          btnConfirmar.disabled = false;
          btnConfirmar.innerText = textoOriginal;
          btnConfirmar.dataset.executando = "false";
        }
      });


btnOkSucesso.addEventListener("click", function () {

 
  if (modalSucesso) modalSucesso.style.display = "none";

  
  if (modalConfirmacao) modalConfirmacao.style.display = "none";

 
  window.location.reload();
});


    }

  }, 300);

})();

(function () {

  var btn = document.getElementById("btnBaixarOficio");
  if (!btn) return;

  btn.addEventListener("click", function (e) {
    e.preventDefault();

    var analiseId = "{{ analise.cloud_analises_tecnicasid }}";

    if (!analiseId) {
      alert("Boleto não encontrado.");
      return;
    }

    var url =
      "/_api/data/v9.2/cloud_analises_tecnicases(" +
      analiseId +
      ")/cloud_file_oficio_analise_preliminar/$value";

    if (!window.shell || typeof shell.ajaxSafeGet !== "function") {
      alert("Contexto de segurança não disponível.");
      return;
    }

    shell.ajaxSafeGet({
      type: "GET",
      url: url,
      xhrFields: {
        responseType: "blob" 
      },
      success: function (data, status, xhr) {

        var blob = data;


        var fileName = "boleto.pdf";
        var disposition = xhr.getResponseHeader("Content-Disposition");

        if (disposition && disposition.indexOf("filename=") !== -1) {
          fileName = disposition.split("filename=")[1].replace(/"/g, "");
        }


        var link = document.createElement("a");
        var downloadUrl = window.URL.createObjectURL(blob);

        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: function (xhr) {
        console.error("❌ Erro ao baixar boleto:", xhr);
        alert("Erro ao baixar o boleto. Verifique permissões.");
      }
    });

  });

})();



(function () {

  const intervalo = setInterval(function () {

    const input = document.getElementById("inputComprovante");
    const label = document.getElementById("arquivoSelecionado");

    if (!input || !label) return;

    clearInterval(intervalo);

    input.addEventListener("change", function () {

      if (!input.files.length) {
        label.style.display = "none";
        return;
      }

      const file = input.files[0];

      label.style.display = "block";
      label.innerHTML =
        "✔ <strong>" + file.name + "</strong>";
    });

  }, 200);

})();




(function () {

  var flowUrl =
    "/_api/cloudflow/v1.0/trigger/203e0892-f9e8-f011-8543-000d3a5ae560";

  var intervalo = setInterval(function () {

    var btnAbrir      = document.getElementById("btnCancelarAlteracoes");
    var btnConfirmar  = document.getElementById("btnConfirmarCancelamento");
    var btnVoltar     = document.getElementById("btnNaoCancelarAlteracao");
    var btnOk         = document.getElementById("btnOkCancelamento");

    var modalConfirm  = document.getElementById("modalConfirmarCancelamento");
    var modalSucesso  = document.getElementById("modalCancelamentoSucesso");

    var recordID = "{{ solicitacaoId }}";
    var logID    = "{{ ultimoLog.cloud_log_alteracoesid }}";

    if (
      btnAbrir &&
      btnConfirmar &&
      btnVoltar &&
      modalConfirm &&
      window.shell &&
      typeof shell.ajaxSafePost === "function"
    ) {
      clearInterval(intervalo);
      configurarEventos();
    }

    function configurarEventos() {


      btnAbrir.addEventListener("click", function (e) {
        e.preventDefault();
        modalConfirm.style.display = "flex";
      });

      btnVoltar.addEventListener("click", function () {
        modalConfirm.style.display = "none";
      });


      btnConfirmar.addEventListener("click", function () {

        if (btnConfirmar.dataset.executando === "true") return;

        btnConfirmar.dataset.executando = "true";
        btnConfirmar.disabled = true;

        var textoOriginal = btnConfirmar.innerText;
        btnConfirmar.innerText = "Processando...";

        if (!recordID || !logID) {
          alert("Erro ao identificar a alteração.");
          resetar();
          return;
        }

        var payload = {
          eventData: JSON.stringify({
            RecordID: recordID,
            LogID: logID
          })
        };

        console.log("🚀 Cancelando alteração", payload);

        shell.ajaxSafePost({
          type: "POST",
          contentType: "application/json",
          url: flowUrl,
          data: JSON.stringify(payload),
          processData: false,
          global: false
        })
        .done(function () {
          modalConfirm.style.display = "none";
          modalSucesso.style.display = "flex";
        })
        .fail(function (xhr) {
          console.error("❌ Erro ao cancelar alteração:", xhr);
          alert("Erro ao cancelar a alteração.");
        })
        .always(function () {
          resetar();
        });

        function resetar() {
          btnConfirmar.disabled = false;
          btnConfirmar.innerText = textoOriginal;
          btnConfirmar.dataset.executando = "false";
        }
      });


      btnOk.addEventListener("click", function () {
        window.location.replace(
          "/minhas-solicitacoes/?refreshlist=1&nocache=" + Date.now()
        );
      });

    }

  }, 300);

})();


(function () {

  let effectsLayer = document.querySelector(".effects-layer");
  if (!effectsLayer) {
    effectsLayer = document.createElement("div");
    effectsLayer.className = "effects-layer";
    document.body.appendChild(effectsLayer); 
  }

  function explodirFogos(x, y) {

    const cores = [
      "var(--brand-color)",
      "var(--secondary-color)",
      "#ffffff"
    ];

    for (let i = 0; i < 200; i++) {

      const confetti = document.createElement("div");
      confetti.className = "confetti";

      const angle = Math.random() * 2 * Math.PI;
      const distance = 100 + Math.random() * 340;

      confetti.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      confetti.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      confetti.style.backgroundColor =
        cores[Math.floor(Math.random() * cores.length)];

      confetti.style.left = `${x}px`;
      confetti.style.top  = `${y}px`;

      effectsLayer.appendChild(confetti);

      setTimeout(() => confetti.remove(), 1000);
    }
  }

  const idsOk = [
    "btnOkExclusao",
    "btnOkCancelamento",
    "btnOkSucesso",
    "btnOkBoleto",
    "btnOkNovoPagamento",
    "btnOkAvancoFase",
    "btnOk"
  ];

  function bindExplosao() {
    idsOk.forEach(id => {
      const btn = document.getElementById(id);
      if (!btn || btn.dataset.confetti === "true") return;

      btn.dataset.confetti = "true";

      btn.addEventListener("click", function () {
        const rect = btn.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top - 12; 

        explodirFogos(x, y);
      });
    });
  }

  bindExplosao();

  new MutationObserver(bindExplosao)
    .observe(document.body, { childList: true, subtree: true });

})();
(function () {

  var flowUrl =
    "/_api/cloudflow/v1.0/trigger/8ce80190-36f8-f011-8406-7ced8da81546";

  var intervalo = setInterval(function () {

    var btnAbrir     = document.getElementById("btnNovoPagamento");
    var btnConfirmar = document.getElementById("btnConfirmarNovoPagamento");
    var btnCancelar  = document.getElementById("btnCancelarNovoPagamento");
    var btnOk        = document.getElementById("btnOkNovoPagamento");

    var modalConfirm = document.getElementById("modalConfirmarNovoPagamento");
    var modalSucesso = document.getElementById("modalNovoPagamentoSucesso");

    var recordID = "{{ solicitacaoId }}";

    if (
      btnAbrir &&
      btnConfirmar &&
      btnCancelar &&
      modalConfirm &&
      window.shell &&
      typeof shell.ajaxSafePost === "function"
    ) {
      clearInterval(intervalo);
      configurarEventos();
    }

    function configurarEventos() {

      btnAbrir.addEventListener("click", function (e) {
        e.preventDefault();
        modalConfirm.style.display = "flex";
      });

      btnCancelar.addEventListener("click", function () {
        modalConfirm.style.display = "none";
      });

      btnConfirmar.addEventListener("click", function () {

        if (btnConfirmar.dataset.executando === "true") return;

        btnConfirmar.dataset.executando = "true";
        btnConfirmar.disabled = true;
        var textoOriginal = btnConfirmar.innerText;
        btnConfirmar.innerText = "Processando...";
        if (!recordID) {
          alert("Erro ao identificar a solicitação.");
          resetar();
          return;
        }

        var payload = {
          eventData: JSON.stringify({
            RecordID: recordID
          })
        };

        console.log("🔁 Novo pagamento", payload);

        shell.ajaxSafePost({
          type: "POST",
          contentType: "application/json",
          url: flowUrl,
          data: JSON.stringify(payload),
          processData: false,
          global: false
        })
        .done(function () {
          modalConfirm.style.display = "none";
          modalSucesso.style.display = "flex";
        })
        .fail(function (xhr) {
          console.error("❌ Erro Novo Pagamento:", xhr);
          alert("Erro ao retornar para a etapa de pagamento.");
        })
        .always(function () {
          resetar();
        });

        function resetar() {
          btnConfirmar.disabled = false;
          btnConfirmar.innerText = textoOriginal;
          btnConfirmar.dataset.executando = "false";
        }
      });

      btnOk.addEventListener("click", function () {
        window.location.replace(
          "/minhas-solicitacoes/?refreshlist=1&nocache=" + Date.now()
        );
      });
    }

  }, 300);

})();
(function () {

  var flowUrl =
    "/_api/cloudflow/v1.0/trigger/a16c5a35-56fa-f011-8406-002248de77b7";

  var intervalo = setInterval(function () {

    var btnAvancar   = document.getElementById("btnAvancarFase");
    var btnCancelar  = document.getElementById("btnCancelarAvancoFase");
    var btnConfirmar = document.getElementById("btnConfirmarAvancoFase");
    var btnOk        = document.getElementById("btnOkAvancoFase");

    var modalConfirm = document.getElementById("modalConfirmarAvancoFase");
    var modalSucesso = document.getElementById("modalAvancoFaseSucesso");

    var recordID = "{{ solicitacaoId }}";

    if (
      btnAvancar &&
      btnCancelar &&
      btnConfirmar &&
      btnOk &&
      modalConfirm &&
      modalSucesso &&
      window.shell &&
      typeof shell.ajaxSafePost === "function"
    ) {
      clearInterval(intervalo);
      configurarEventos();
    }

    function configurarEventos() {

      if (btnAvancar.dataset.bound === "true") return;
      btnAvancar.dataset.bound = "true";


      btnAvancar.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        modalConfirm.style.display = "flex";
      });


      btnCancelar.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        modalConfirm.style.display = "none";
        return false;
      }, true);


      btnConfirmar.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (btnConfirmar.dataset.executando === "true") return;

        btnConfirmar.dataset.executando = "true";
        btnConfirmar.disabled = true;

        var textoOriginal = btnConfirmar.innerText;
        btnConfirmar.innerText = "Processando...";

        var payload = {
          eventData: JSON.stringify({
            RecordID: recordID,
            AnaliseID: "{{ analiseId }}"
          })
        };

        shell.ajaxSafePost({
          type: "POST",
          contentType: "application/json",
          url: flowUrl,
          data: JSON.stringify(payload),
          processData: false,
          global: false
        })
        .done(function () {
          modalConfirm.style.display = "none";
          modalSucesso.style.display = "flex";
        })
        .fail(function (xhr) {
          console.error("❌ Erro ao avançar fase:", {
            status: xhr?.status,
            responseText: xhr?.responseText
          });
          alert("Erro ao avançar a fase.");
        })
        .always(function () {
          btnConfirmar.disabled = false;
          btnConfirmar.innerText = textoOriginal;
          btnConfirmar.dataset.executando = "false";
        });
      });

      btnOk.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();


        modalSucesso.style.display = "none";
        modalConfirm.style.display = "none";

        
window.location.reload();



        return false;
      }, true);

    }

  }, 300);

})();






(function () {

  function abrirModalExclusao() {
    const modal = document.getElementById("modalConfirmarExclusao");

    if (!modal) {
      alert("Modal de exclusão não existe nesta tela. Coloque o HTML do modal fora do IF do status 586450001.");
      console.error("❌ #modalConfirmarExclusao não encontrado no DOM.");
      return;
    }

    modal.style.display = "flex";
  }

  document.addEventListener("click", function (e) {

    const btnExcluir = e.target.closest('[data-action="excluir-solicitacao"]');
    if (btnExcluir) {
      e.preventDefault();
      e.stopPropagation();
      abrirModalExclusao();
      return;
    }



  }, true);

})();
(function () {

  var flowUrl =
    "/_api/cloudflow/v1.0/trigger/6f112501-20fe-f011-8406-7ced8da81546";

  var intervalo = setInterval(function () {

    var btnContinuar = document.getElementById("btnContinuarSolicitacao");

    if (
      btnContinuar &&
      window.shell &&
      typeof shell.ajaxSafePost === "function"
    ) {
      clearInterval(intervalo);
      configurarEventos(btnContinuar);
    }

  }, 300);

  function configurarEventos(btn) {

    btn.addEventListener("click", function (e) {
      e.preventDefault();

      if (btn.dataset.executando === "true") return;
      btn.dataset.executando = "true";

      var recordID = "{{ solicitacaoId }}";
      var siteBaseUrl = window.location.origin + "/";

      var textoOriginal = btn.innerText;
      btn.innerText = "Carregando...";
      btn.classList.add("disabled");

      if (!recordID) {
        alert("Solicitação não identificada.");
        resetar();
        return;
      }

      var payload = {
        eventData: JSON.stringify({
          RecordID: recordID,
          SiteBaseUrl: siteBaseUrl
        })
      };

      console.log("🚀 CONTINUAR → chamando Flow", {
        flowUrl: flowUrl,
        payload: payload
      });

      shell.ajaxSafePost({
        type: "POST",
        contentType: "application/json",
        url: flowUrl,
        data: JSON.stringify(payload),
        processData: false,
        global: false
      })
      .done(function (res, textStatus, jqXHR) {

        var raw = res;

        if ((!raw || raw === "") && jqXHR && jqXHR.responseText) {
          raw = jqXHR.responseText;
        }

        console.log("✅ Flow retornou (raw):", raw);

        try {
          var response =
            (typeof raw === "string") ? JSON.parse(raw) : raw;


          var urlfinal =
            response?.urlfinal ||
            response?.UrlFinal ||
            response?.result?.urlfinal ||
            response?.data?.urlfinal;

          if (urlfinal) {
            console.log("➡️ Redirecionando para:", urlfinal);
            window.location.replace(urlfinal);
          } else {
            console.error("❌ Resposta sem urlfinal:", response);
            alert("O Flow respondeu, mas não retornou 'urlfinal'. Veja o console (F12).");
          }

        } catch (err) {
          console.error("❌ Erro ao interpretar resposta do Flow:", err);
          alert("O Flow respondeu, mas o retorno não veio em JSON. Veja o console (F12).");
        }

      })
      .fail(function (xhr) {


        var status = xhr?.status;
        var resp = xhr?.responseText;

        console.error("❌ Erro Flow CONTINUAR:", {
          status: status,
          statusText: xhr?.statusText,
          responseText: resp
        });


        if (status === 403) {
          alert("Erro 403: sem permissão para executar o fluxo (ou conexão/Run-only).");
        } else if (status === 400) {
          alert("Erro 400: payload inválido. Confira se o Flow espera RecordID/SiteBaseUrl.");
        } else if (status === 404) {
          alert("Erro 404: trigger do Flow não encontrado (URL do Flow errada).");
        } else if (status >= 500) {
          alert("Erro no servidor/Flow (5xx). O Flow provavelmente falhou em alguma ação.");
        } else {
          alert("Erro ao recuperar a etapa da solicitação. Veja o console (F12) para detalhes.");
        }

      })
      .always(function () {
        resetar();
      });

      function resetar() {
        btn.dataset.executando = "false";
        btn.innerText = textoOriginal;
        btn.classList.remove("disabled");
      }

    });

  }

})();



(function () {

  const intervalo = setInterval(function () {

    const botoes = document.querySelectorAll(".btnAdicionarComprovante");
    const modal = document.getElementById("modalComprovante");

    if (!botoes.length || !modal) return;

    clearInterval(intervalo);

    botoes.forEach(btn => {
      btn.addEventListener("click", function () {
        modal.style.display = "flex";
      });
    });

  }, 200);

})();


(function () {

  const FLOW_URL = "/_api/cloudflow/v1.0/trigger/87913ed4-15f1-f011-8406-002248de77b7";
  const RECORD_ID = "{{ solicitacaoId }}";

  function getEl(id) {
    return document.getElementById(id);
  }

  function resetarInputComprovante() {
    const input = getEl("inputComprovante");
    const label = document.getElementById("arquivoSelecionado");

    if (input) {
      input.value = "";
      input.type = "text";
      input.type = "file";
    }

    if (label) {
      label.style.display = "none";
      label.innerHTML = "";
    }
  }

  function abrirModalComprovante() {
    const modal = getEl("modalComprovante");
    if (!modal) {
      console.error("❌ #modalComprovante não existe no DOM.");
      return;
    }
    modal.style.display = "flex";
  }

  function fecharModalComprovante() {
    const modal = getEl("modalComprovante");
    if (modal) modal.style.display = "none";
    resetarInputComprovante();
  }

  function abrirModalSucessoComprovante() {
    const modal = getEl("modalSucessoComprovante");
    if (modal) modal.style.display = "flex";
  }

  function fecharModalSucessoComprovante() {
    const modal = getEl("modalSucessoComprovante");
    if (modal) modal.style.display = "none";
  }

  function garantirBotaoX() {
    const modal = getEl("modalComprovante");
    if (!modal) return;

    const box = modal.querySelector(".modal-cloud");
    if (!box) return;

    if (box.querySelector(".modal-close-x")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-close-x";
    btn.setAttribute("aria-label", "Fechar");
    btn.innerHTML = "&times;";

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      fecharModalComprovante();
    });

    box.appendChild(btn);
  }

  document.addEventListener("click", function (e) {
    const btnAbrir = e.target.closest('[data-action="abrir-comprovante"]');
    if (btnAbrir) {
      e.preventDefault();
      e.stopPropagation();
      abrirModalComprovante();
      return;
    }

    if (e.target.classList.contains("modal-close-x")) {
      fecharModalComprovante();
      return;
    }
  }, true);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      fecharModalComprovante();
    }
  });

  const intervalo = setInterval(function () {
    const modal = getEl("modalComprovante");
    const btnSalvar = getEl("btnSalvarComprovante");
    const btnCancelar = getEl("btnCancelarComprovante");
    const btnOk = getEl("btnOkComprovante");
    const inputFile = getEl("inputComprovante");

    if (!modal || !btnSalvar || !btnCancelar || !btnOk || !inputFile) return;

    clearInterval(intervalo);
    garantirBotaoX();

    if (btnCancelar.dataset.bound !== "true") {
      btnCancelar.dataset.bound = "true";

      btnCancelar.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        fecharModalComprovante();
      });
    }

    if (btnSalvar.dataset.bound !== "true") {
      btnSalvar.dataset.bound = "true";

      btnSalvar.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (btnSalvar.dataset.executando === "true") return;

        if (!inputFile.files.length) {
          alert("Selecione um arquivo.");
          return;
        }

        if (!window.shell || typeof shell.ajaxSafePost !== "function") {
          alert("Contexto de segurança não disponível.");
          return;
        }

        btnSalvar.dataset.executando = "true";
        btnSalvar.disabled = true;

        const textoOriginal = btnSalvar.innerText;
        btnSalvar.innerText = "Enviando...";

        const file = inputFile.files[0];
        const reader = new FileReader();

        reader.onload = function () {
          const base64 = reader.result.split(",")[1];

          const payload = {
            eventData: JSON.stringify({
              RecordID: RECORD_ID,
              FileName: file.name,
              FileType: file.type,
              FileBase64: base64
            })
          };

          shell.ajaxSafePost({
            type: "POST",
            contentType: "application/json",
            url: FLOW_URL,
            data: JSON.stringify(payload),
            processData: false,
            global: false
          })
          .done(function () {
            fecharModalComprovante();
            abrirModalSucessoComprovante();
          })
          .fail(function (xhr) {
            console.error("❌ Erro Flow Comprovante:", xhr);
            alert("Erro ao enviar comprovante.");
          })
          .always(function () {
            btnSalvar.disabled = false;
            btnSalvar.innerText = textoOriginal;
            btnSalvar.dataset.executando = "false";
          });
        };

        reader.readAsDataURL(file);
      });
    }

    if (btnOk.dataset.bound !== "true") {
      btnOk.dataset.bound = "true";

      btnOk.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        fecharModalSucessoComprovante();

        if (typeof explodirFogos === "function") {
          const rect = btnOk.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top - 12;
          explodirFogos(x, y);
        }

        setTimeout(function () {
          window.location.reload();
        }, 600);
      });
    }

  }, 200);

})();

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modalComprovante");
  const modalBox = document.getElementById("modalComprovanteBox");
  const inputComprovante = document.getElementById("inputComprovante");
  const btnCancelar = document.getElementById("btnCancelarComprovante");

  function limparArquivoComprovante() {
    if (inputComprovante) {
      inputComprovante.value = "";
    }
  }

  function fecharModalComprovante(limparArquivo = true) {
    if (limparArquivo) {
      limparArquivoComprovante();
    }
    modal.style.display = "none";
  }

  // CANCELAR
  if (btnCancelar) {
    btnCancelar.addEventListener("click", function () {
      fecharModalComprovante(true);
    });
  }

  // CLIQUE FORA DO MODAL
  if (modal) {
    modal.addEventListener("click", function (e) {
      // só fecha se clicou no overlay, fora da caixa
      if (e.target === modal) {
        fecharModalComprovante(true);
      }
    });
  }

  // impede que clique dentro da caixa feche o modal
  if (modalBox) {
    modalBox.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  // Exemplo para abrir o modal:
  // modal.style.display = "flex";
});

/* =====================================================
   SCROLL PÓS-REFRESH
   Sempre posiciona a página no TOPO
   ===================================================== */
(function () {
  /*
    Impede o navegador de restaurar automaticamente
    o último ponto de rolagem após refresh.
  */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function rolarParaTopo() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  /*
    Executa o mais cedo possível.
  */
  rolarParaTopo();

  /*
    Executa novamente quando a página terminar de carregar,
    porque o Power Pages às vezes reposiciona o scroll depois.
  */
  window.addEventListener("DOMContentLoaded", function () {
    setTimeout(rolarParaTopo, 50);
  });

  window.addEventListener("load", function () {
    setTimeout(rolarParaTopo, 100);
    setTimeout(rolarParaTopo, 300);
    setTimeout(rolarParaTopo, 700);
  });

  /*
    Também força o topo quando algum script chama window.location.reload().
  */
  const reloadOriginal = window.location.reload.bind(window.location);

  window.location.reload = function () {
    try {
      sessionStorage.setItem("pp_scroll_topo", "1");
    } catch (e) {}

    reloadOriginal();
  };
})();