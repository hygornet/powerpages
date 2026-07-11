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
  const modal = document.querySelector("#modalNovosDocumentos .modal-cloud");
  if (!modal) return;

  if (modal.querySelector(".modal-close-x")) return;

  const btn = document.createElement("button");
  btn.className = "modal-close-x";
  btn.type = "button";
  btn.innerHTML = "&times;";
  btn.setAttribute("aria-label", "Fechar");
  btn.onclick = function () {
    document.getElementById("modalNovosDocumentos").style.display = "none";
  };

  modal.appendChild(btn);
})();
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal-close-x")) {
      document.getElementById("modalNovosDocumentos").style.display = "none";
    }
  });

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

  const FLOW_URL = "/_api/cloudflow/v1.0/trigger/87913ed4-15f1-f011-8406-002248de77b7";
  const RECORD_ID = "{{ solicitacaoId }}";

  function getEl(id) { return document.getElementById(id); }

  function abrirModal() {
    const modal = getEl("modalComprovante");
    if (!modal) {
      console.error("❌ #modalComprovante não existe no DOM (coloque fora dos IFs).");
      return;
    }
    modal.style.display = "flex";
  }

  function fecharModal() {
    const modal = getEl("modalComprovante");
    if (modal) modal.style.display = "none";
  }

  function abrirSucesso() {
    const modalOk = getEl("modalSucessoComprovante");
    if (modalOk) modalOk.style.display = "flex";
  }

  function fecharSucesso() {
    const modalOk = getEl("modalSucessoComprovante");
    if (modalOk) modalOk.style.display = "none";
  }


  document.addEventListener("click", function (e) {
    const btn = e.target.closest('[data-action="abrir-comprovante"]');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();
    abrirModal();
  }, true);


  const intervalo = setInterval(function () {

    const btnSalvar   = getEl("btnSalvarComprovante");
    const btnCancelar = getEl("btnCancelarComprovante");
    const btnOk       = getEl("btnOkComprovante");
    const inputFile   = getEl("inputComprovante");

    if (!btnSalvar || !btnCancelar || !inputFile) return;

    clearInterval(intervalo);

 
    btnCancelar.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      fecharModal();
    });

  
    btnSalvar.addEventListener("click", function () {

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
          fecharModal();
          abrirSucesso();
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

    // OK (sucesso)
    if (btnOk) {
  btnOk.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    fecharSucesso();

    setTimeout(function () {
      window.location.reload();
    }, 300);
  });
}

  }, 200);

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
  const MODAL_ID = "modalComprovante";

  function fecharModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.style.display = "none";
  }

  function garantirBotaoX() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    const box = modal.querySelector(".modal-cloud");
    if (!box) return;

    // evita duplicar
    if (box.querySelector(".modal-close-x")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-close-x";
    btn.setAttribute("aria-label", "Fechar");
    btn.innerHTML = "&times;";

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      fecharModal();
    });

    box.appendChild(btn);
  }


  const intervalo = setInterval(() => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    clearInterval(intervalo);
    garantirBotaoX();
  }, 200);


  document.addEventListener("click", function (e) {
    const modal = document.getElementById(MODAL_ID);
    if (!modal || modal.style.display === "none") return;
    if (e.target === modal) fecharModal();
  }, true);


  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharModal();
  });
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
          "/minhas-solicitacoes/"
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
    "btnOkComprovante",
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
        
window.location.reload();


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

  var intervalo = setInterval(function () {

    var btnAbrir  = document.getElementById("btnSubmeterNovosDocumentos");
    var btnFechar = document.getElementById("btnFecharNovosDocumentos");
    var modal     = document.getElementById("modalNovosDocumentos");

    if (btnAbrir && btnFechar && modal) {
      clearInterval(intervalo);
      bindEventos();
    }

    function bindEventos() {

      btnAbrir.addEventListener("click", function (e) {
        e.preventDefault();
        modal.style.display = "flex";
      });

      btnFechar.addEventListener("click", function () {
        modal.style.display = "none";
      });

    }

  }, 300);

})();



(function () {

  const intervalo = setInterval(function () {

    const botoesExcluir = document.querySelectorAll('[data-action="excluir-solicitacao"]');
    const modalExcluir = document.getElementById("modalConfirmarExclusao");

    const btnContinuar = document.getElementById("btnContinuarSolicitacao");

      if (
        (!btnContinuar && !botoesExcluir.length) ||
        (botoesExcluir.length && !modalExcluir)
      ) {
        return;
      }

    clearInterval(intervalo);
    console.log("✅ Controle central de ações carregado");

    botoesExcluir.forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();

        console.log("🗑️ Abrindo modal de exclusão");

        modalExcluir.style.display = "flex";
      });
    });

  }, 200);

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
      console.log("🗑️ Clique em EXCLUIR capturado");
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

  const FLOW_URL =
    "/_api/cloudflow/v1.0/trigger/d5a3f4c1-3a00-f111-8407-002248dedebb";

  const RECORD_ID = "{{ solicitacaoId }}";

  const intervalo = setInterval(function () {

    const form = document.querySelector(
      "#modalNovosDocumentos form"
    );

    if (
      form &&
      window.shell &&
      typeof shell.ajaxSafePost === "function"
    ) {
      clearInterval(intervalo);
      interceptarSubmit(form);
    }

  }, 300);

  function interceptarSubmit(form) {

    if (form.dataset.interceptado === "true") return;
    form.dataset.interceptado = "true";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const btnSubmit =
        form.querySelector('button[type="submit"]');

      if (btnSubmit?.dataset.executando === "true") return;

      if (!RECORD_ID) {
        alert("Erro ao identificar a solicitação.");
        return;
      }

      btnSubmit.dataset.executando = "true";
      btnSubmit.disabled = true;

      const textoOriginal = btnSubmit.innerText;
      btnSubmit.innerText = "Enviando...";

      const payload = {
        eventData: JSON.stringify({
          RecordID: RECORD_ID
        })
      };

      console.log("🚀 Enviando novos documentos", payload);

      shell.ajaxSafePost({
        type: "POST",
        contentType: "application/json",
        url: FLOW_URL,
        data: JSON.stringify(payload),
        processData: false,
        global: false
      })
      .done(function () {

        console.log("✅ Flow executado com sucesso");
        const modal = document.getElementById("modalNovosDocumentos");
        if (modal) modal.style.display = "none";
        abrirModalSucesso();

      })
      .fail(function (xhr) {

        console.error("❌ Erro ao executar Flow:", {
          status: xhr?.status,
          responseText: xhr?.responseText
        });

        alert("Erro ao enviar os documentos. Tente novamente.");

      })
      .always(function () {

        btnSubmit.disabled = false;
        btnSubmit.innerText = textoOriginal;
        btnSubmit.dataset.executando = "false";

      });

    }, true);
  }

  function abrirModalSucesso() {


    let modal = document.getElementById("modalSucessoNovosDocs");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modalSucessoNovosDocs";
      modal.className = "modal-cloud-overlay";
      modal.style.display = "flex";

      modal.innerHTML = `
        <div class="modal-cloud">
          <h3>✅ Documentos enviados</h3>
          <p>Os documentos foram enviados com sucesso.</p>
          <div class="modal-cloud-actions-center">
            <button id="btnOkNovosDocs" class="btn-cloud">
              OK
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    } else {
      modal.style.display = "flex";
    }

    const btnOk = modal.querySelector("#btnOkNovosDocs");

    btnOk.onclick = function () {
      modal.style.display = "none";
      window.location.reload();
    };
  }

})();

(function () {

  const FLOW_URL =
    "/_api/cloudflow/v1.0/trigger/d5a3f4c1-3a00-f111-8407-002248dedebb";

  const MODAL_ID = "modalNovosDocumentos";
  const RECORD_ID = "{{ solicitacaoId }}";


  const intervalo = setInterval(() => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    const btnEnviar =
      modal.querySelector('input#UpdateButton, input[id$="UpdateButton"]');

    if (!btnEnviar) return;

    clearInterval(intervalo);
    bindEnviar(btnEnviar, modal);
  }, 300);

  function bindEnviar(btnEnviar, modal) {
    if (btnEnviar.dataset.ppIntercept === "true") return;
    btnEnviar.dataset.ppIntercept = "true";

    btnEnviar.addEventListener("click", function () {

      if (btnEnviar.dataset.executando === "true") return;
      btnEnviar.dataset.executando = "true";

      const textoOriginal = btnEnviar.value;
      btnEnviar.value = "Salvando...";
      btnEnviar.disabled = true;
      const prm = getPRM();
      if (!prm) {
        console.error("❌ PageRequestManager não encontrado (Sys).");
        alert("Não consegui monitorar o envio do formulário. Veja o console (F12).");
        reset();
        return;
      }
      const handler = function () {

        prm.remove_endRequest(handler);

        if (temErrosNoForm(modal)) {
          console.warn("⚠️ Form com erro de validação — Flow não será chamado.");
          reset();
          return;
        }

        btnEnviar.value = "Processando...";
        chamarFlow()
          .then(() => {
            fecharModal(modal);
            abrirModalSucesso();
          })
          .catch((xhr) => {
            console.error("❌ Erro Flow:", {
              status: xhr?.status,
              responseText: xhr?.responseText
            });
            alert("Erro ao executar o processamento após o envio. Tente novamente.");
          })
          .finally(() => {
            reset();
          });
      };

      prm.add_endRequest(handler);
      function reset() {
        btnEnviar.disabled = false;
        btnEnviar.value = textoOriginal;
        btnEnviar.dataset.executando = "false";
      }
    });
  }

  function getPRM() {
    try {
      if (window.Sys &&
          Sys.WebForms &&
          Sys.WebForms.PageRequestManager) {
        return Sys.WebForms.PageRequestManager.getInstance();
      }
    } catch (e) {}
    return null;
  }

  function temErrosNoForm(modal) {
    const vs = modal.querySelector(".validation-summary-errors");
    if (vs && vs.innerText.trim().length > 0 && isVisivel(vs)) return true;
    const danger = modal.querySelector(".alert-danger, .notification.error");
    if (danger && danger.innerText.trim().length > 0 && isVisivel(danger)) return true;
    return false;
  }

  function isVisivel(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function chamarFlow() {
    return new Promise((resolve, reject) => {

      if (!window.shell || typeof shell.ajaxSafePost !== "function") {
        alert("Contexto de segurança não disponível.");
        reject({ status: 0, responseText: "shell.ajaxSafePost indisponível" });
        return;
      }

      if (!RECORD_ID) {
        alert("Solicitação não identificada.");
        reject({ status: 0, responseText: "RecordID vazio" });
        return;
      }

      const payload = {
        eventData: JSON.stringify({
          RecordID: RECORD_ID
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
      .done(() => resolve())
      .fail((xhr) => reject(xhr));
    });
  }

  function fecharModal(modal) {
    modal.style.display = "none";
  }

  function abrirModalSucesso() {

    let modal = document.getElementById("modalSucessoNovosDocs");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modalSucessoNovosDocs";
      modal.className = "modal-cloud-overlay";
      modal.style.display = "flex";

      modal.innerHTML = `
        <div class="modal-cloud">
          <h3>✅ Documentos enviados</h3>
          <p>Envio concluído com sucesso.</p>
          <div class="modal-cloud-actions-center">
            <button id="btnOkNovosDocs" class="btn-cloud">OK</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    } else {
      modal.style.display = "flex";
    }

    const btnOk = modal.querySelector("#btnOkNovosDocs");
    btnOk.onclick = function () {
      modal.style.display = "none";
      window.location.reload();
    };
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

  const FLOW_URL = "/_api/cloudflow/v1.0/trigger/46fad9d8-5a18-f111-8341-7ced8da81546";

  function getEl(id){ 
    return document.getElementById(id); 
  }

  const intervalo = setInterval(function(){

    const btnAtualizar = getEl("btnAtualizarSolicitacao");
    const btnAvancar = getEl("btnAvancarEtapa");

    const modalConfirmar = getEl("modalConfirmarAvancoEtapa");
    const modalSucesso = getEl("modalSucessoAvancoEtapa");

    const btnCancelar = getEl("btnCancelarAvancoEtapa");
    const btnConfirmar = getEl("btnConfirmarAvancoEtapa");
    const btnOk = getEl("btnOkAvancoEtapa");

    const recordId = getEl("pp-recordid")?.value;

    if(!btnAtualizar || !btnAvancar || !modalConfirmar || !btnConfirmar || !btnOk) {
      return;
    }

    clearInterval(intervalo);

    btnAtualizar.addEventListener("click", function(e){

      e.preventDefault();
      e.stopPropagation();

      const id = getEl("pp-recordid")?.value;
      const modalAtualizar = getEl("modalAtualizarDadosFilho");
      const iframeAtualizar = getEl("iframeAtualizarDadosFilho");

      if(!id){
        alert("ID da solicitação não encontrado.");
        return;
      }

      if(!modalAtualizar || !iframeAtualizar){
        alert("Modal de atualização não encontrado.");
        return;
      }

      iframeAtualizar.src =
        "/Atualizar-Dados-da-Solicitação/?id=" + encodeURIComponent(id);

      modalAtualizar.style.display = "flex";
      modalAtualizar.style.zIndex = "999999";

    });

    document.addEventListener("click", function(e){

      const btnFecharAtualizar = e.target.closest("#btnFecharModalAtualizarDados");

      if(!btnFecharAtualizar) return;

      e.preventDefault();
      e.stopPropagation();

      const modalAtualizar = getEl("modalAtualizarDadosFilho");
      const iframeAtualizar = getEl("iframeAtualizarDadosFilho");

      if(iframeAtualizar) iframeAtualizar.src = "";
      if(modalAtualizar) modalAtualizar.style.display = "none";

    }, true);

    window.addEventListener("message", function(event){

      const data = event.data || {};

      if(data.tipo !== "ATUALIZAR_DADOS_SOLICITACAO_OK") return;

      const modalAtualizar = getEl("modalAtualizarDadosFilho");
      const iframeAtualizar = getEl("iframeAtualizarDadosFilho");
      const modalSucessoAtualizar = getEl("modalSucessoAtualizarDados");

      if(iframeAtualizar) iframeAtualizar.src = "";
      if(modalAtualizar) modalAtualizar.style.display = "none";
      if(modalSucessoAtualizar) modalSucessoAtualizar.style.display = "flex";

    });

    document.addEventListener("click", function(e){

      const btnOkAtualizar = e.target.closest("#btnOkAtualizarDados");

      if(!btnOkAtualizar) return;

      e.preventDefault();
      e.stopPropagation();

      const modalSucessoAtualizar = getEl("modalSucessoAtualizarDados");

      if(modalSucessoAtualizar) modalSucessoAtualizar.style.display = "none";

    }, true);

    btnAvancar.addEventListener("click", function(){
      modalConfirmar.style.display = "flex";
    });

    btnCancelar.addEventListener("click", function(){
      modalConfirmar.style.display = "none";
    });

    btnConfirmar.addEventListener("click", function(){

      if(!recordId){
        alert("ID da solicitação não encontrado.");
        return;
      }

      if (!window.shell || typeof shell.ajaxSafePost !== "function") {
        alert("Contexto de segurança não disponível.");
        return;
      }

      btnConfirmar.disabled = true;
      const textoOriginal = btnConfirmar.innerText;
      btnConfirmar.innerText = "Processando...";

      const payload = {
        eventData: JSON.stringify({
          RecordID: recordId
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
      .done(function(){
        modalConfirmar.style.display = "none";
        modalSucesso.style.display = "flex";
      })
      .fail(function(xhr){
        console.error("❌ ERRO FLOW AVANÇAR ETAPA:", xhr);
        alert("Erro ao avançar etapa.");
      })
      .always(function(){
        btnConfirmar.disabled = false;
        btnConfirmar.innerText = textoOriginal;
      });

    });

    btnOk.addEventListener("click", function(e){

      e.preventDefault();
      e.stopPropagation();

      modalSucesso.style.display = "none";

      setTimeout(function(){
        window.location.reload();
      }, 700);

    });

  }, 200);

})();


/* ====================================
   FILTRO DOCUMENTOS + SLIDER
==================================== */

(function(){

const buttons = document.querySelectorAll(".docs-filter-btn");
const slider = document.querySelector(".docs-filter-slider");

const rows = document.querySelectorAll(".doc-row");

const crucialBar = document.querySelector(".progress-crucial");
const complementarBar = document.querySelector(".progress-complementar");

const docsTitle = document.getElementById("docsTitle");

function moveSlider(btn){

slider.style.width = btn.offsetWidth + "px";
slider.style.left = btn.offsetLeft + "px";

}

buttons.forEach(btn=>{

btn.addEventListener("click",function(){

buttons.forEach(b=>b.classList.remove("active"));
btn.classList.add("active");

moveSlider(btn);

const filter = btn.dataset.filter;

/* FILTRO TABELA */

rows.forEach(row=>{

row.style.display="none";

if(filter==="all"){
row.style.display="table-row";
}

if(filter==="crucial" && row.classList.contains("doc-crucial")){
row.style.display="table-row";
}

if(filter==="complementar" && row.classList.contains("doc-complementar")){
row.style.display="table-row";
}

});

/* BARRAS */

if(filter==="all"){

crucialBar.style.display="block";
complementarBar.style.display="block";

docsTitle.innerText="Lista com todos os documentos requisitados";

}

if(filter==="crucial"){

crucialBar.style.display="block";
complementarBar.style.display="none";

docsTitle.innerText="Documentos Cruciais";

}

if(filter==="complementar"){

crucialBar.style.display="none";
complementarBar.style.display="block";

docsTitle.innerText="Documentos Complementares";

}

});

});

/* posição inicial */

window.addEventListener("load",function(){

const active = document.querySelector(".docs-filter-btn.active");

moveSlider(active);

const initialFilter = active.dataset.filter;

if(initialFilter === "crucial"){
crucialBar.style.display = "block";
complementarBar.style.display = "none";
}

if(initialFilter === "complementar"){
crucialBar.style.display = "none";
complementarBar.style.display = "block";
}

if(initialFilter === "all"){
crucialBar.style.display = "block";
complementarBar.style.display = "block";
}

});

})();

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