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


(function configurarAtualizacaoFsa() {

  const FLOW_ATUALIZAR_FSA =
    "/_api/cloudflow/v1.0/trigger/b9a1abc5-d0df-f011-8543-000d3a5ae560";

  function el(id) {
    return document.getElementById(id);
  }

  function abrirModal(modal) {
    if (!modal) return;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function fecharModal(modal) {
    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  function valor(id) {
    const campo = el(id);

    return campo
      ? String(campo.value || "").trim()
      : "";
  }

  function formatarCpf(valor) {

  const numeros = String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11);

  return numeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}


function formatarRg(valor) {

  return String(valor || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 11);
}


function formatarCnpj(valor) {

  let texto = String(valor || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 14);

  /*
    Os dois últimos caracteres, referentes aos
    dígitos verificadores, precisam ser números.
  */
  if (texto.length > 12) {

    const base =
      texto.substring(0, 12);

    const digitos =
      texto.substring(12, 14)
        .replace(/\D/g, "");

    texto =
      base + digitos;
  }

  return texto
    .replace(/^(.{2})(.)/, "$1.$2")
    .replace(
      /^(.{2})\.(.{3})(.)/,
      "$1.$2.$3"
    )
    .replace(
      /^(.{2})\.(.{3})\.(.{3})(.)/,
      "$1.$2.$3/$4"
    )
    .replace(
      /^(.{2})\.(.{3})\.(.{3})\/(.{4})(.)/,
      "$1.$2.$3/$4-$5"
    );
}


/* =====================================================
   VALIDAÇÃO DE CPF, RG E CNPJ
   ===================================================== */

function validarCpfFsa(valor) {

  const cpf =
        String(valor || "")
          .replace(/\D/g, "");

      if (
        cpf.length !== 11 ||
        /^(\d)\1+$/.test(cpf)
      ) {
        return false;
      }

      let soma = 0;

      for (let i = 0; i < 9; i++) {
        soma +=
          Number(cpf[i]) * (10 - i);
      }

      let primeiroDigito =
        11 - (soma % 11);

      if (primeiroDigito >= 10) {
        primeiroDigito = 0;
      }

      if (
        primeiroDigito !==
        Number(cpf[9])
      ) {
        return false;
      }

      soma = 0;

      for (let i = 0; i < 10; i++) {
        soma +=
          Number(cpf[i]) * (11 - i);
      }

      let segundoDigito =
        11 - (soma % 11);

      if (segundoDigito >= 10) {
        segundoDigito = 0;
      }

      return (
        segundoDigito ===
        Number(cpf[10])
      );
    }


    function validarRgFsa(valor) {

      const rg =
        String(valor || "")
          .trim()
          .toUpperCase();

      return /^[A-Z0-9]{2,11}$/.test(rg);
    }


    function validarCnpjFsa(valor) {

      let cnpj =
        String(valor || "")
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");

      if (cnpj.length !== 14) {
        return false;
      }

      /*
        CNPJ alfanumérico:
        os 12 primeiros caracteres podem conter
        letras ou números, e os dois últimos devem
        ser números.
      */
      if (/[A-Z]/.test(cnpj)) {

        const base =
          cnpj.substring(0, 12);

        const digitos =
          cnpj.substring(12, 14);

        return (
          /^[A-Z0-9]{12}$/.test(base) &&
          /^\d{2}$/.test(digitos)
        );
      }

      /*
        CNPJ exclusivamente numérico.
      */
      if (/^(\d)\1+$/.test(cnpj)) {
        return false;
      }

      let tamanho =
        cnpj.length - 2;

      let numeros =
        cnpj.substring(0, tamanho);

      const digitos =
        cnpj.substring(tamanho);

      let soma = 0;
      let posicao =
        tamanho - 7;

      for (
        let indice = tamanho;
        indice >= 1;
        indice--
      ) {

        soma +=
          Number(
            numeros[tamanho - indice]
          ) * posicao--;

        if (posicao < 2) {
          posicao = 9;
        }
      }

      let resultado =
        soma % 11 < 2
          ? 0
          : 11 - (soma % 11);

      if (
        resultado !==
        Number(digitos[0])
      ) {
        return false;
      }

      tamanho += 1;

      numeros =
        cnpj.substring(0, tamanho);

      soma = 0;

      posicao =
        tamanho - 7;

      for (
        let indice = tamanho;
        indice >= 1;
        indice--
      ) {

        soma +=
          Number(
            numeros[tamanho - indice]
          ) * posicao--;

        if (posicao < 2) {
          posicao = 9;
        }
      }

      resultado =
        soma % 11 < 2
          ? 0
          : 11 - (soma % 11);

      return (
        resultado ===
        Number(digitos[1])
      );
    }

  function iniciar() {

    const btnAbrir = el("btnAtualizarSolicitacao");

    const modalFormulario = el("modalAtualizarDadosFsa");
    const form = el("formAtualizarDadosFsa");

    const btnFechar = el("btnFecharModalAtualizarDados");
    const btnCancelar = el("btnCancelarAtualizacaoFsa");
    const btnSalvar = el("btnSalvarAtualizacaoFsa");

    const modalConfirmacao =
      el("modalConfirmarAtualizacaoFsa");

    const btnCancelarConfirmacao =
      el("btnCancelarConfirmacaoFsa");

    const btnConfirmar =
      el("btnConfirmarAtualizacaoFsa");

    const modalSucesso =
      el("modalSucessoAtualizarDados");

    const btnOk =
      el("btnOkAtualizarDados");

    if (
      !btnAbrir ||
      !modalFormulario ||
      !form ||
      !btnSalvar
    ) {
      return;
    }

    if (btnAbrir.dataset.fsaConfigurado === "true") {
      return;
    }

    btnAbrir.dataset.fsaConfigurado = "true";

    const inputCpf =
  el("fsaCpfProprietario");

const inputRg =
  el("fsaRgProprietario");

const inputCnpj =
  el("fsaCnpjConstrutora");

  const inputNomeConstrutora =
  el("fsaNomeConstrutora");

const selectRespFaturamento =
  el("fsaNomeRespFaturamento");


function configurarMascaraDocumento(
  campo,
  funcaoMascara
) {

  if (!campo) {
    return;
  }

  /*
    Formata o valor carregado do Dataverse.
  */
  campo.value =
    funcaoMascara(campo.value);

  campo.addEventListener(
  "input",
  function () {

    this.value =
      funcaoMascara(this.value);

    atualizarEstadoBotaoSalvarFsa();
  }
);

  /*
    Garante que a mensagem e o botão sejam
    atualizados ao sair do campo.
  */
  campo.addEventListener(
    "blur",
    function () {
      atualizarEstadoBotaoSalvarFsa();
    }
  );
}


configurarMascaraDocumento(
  inputCpf,
  formatarCpf
);

configurarMascaraDocumento(
  inputRg,
  formatarRg
);

configurarMascaraDocumento(
  inputCnpj,
  formatarCnpj
);
/* =====================================================
   VALIDAÇÃO DO BOTÃO SALVAR
   Considera somente os campos obrigatórios visíveis
   do bloco Dados complementares
   ===================================================== */

const blocoDadosComplementares =
  el("blocoDadosComplementaresFsa");

  const inputDataPrevisao =
  el("fsaDataPrevisao");


function verificarDataPrevisaoFsa() {

  if (!inputDataPrevisao) {
    return true;
  }

  const valor =
    String(inputDataPrevisao.value || "").trim();

  let dataInvalida = false;

  /*
    Campo vazio não entra como erro de data.
    O required já cuida do campo vazio.
  */
  if (valor) {

    const partes =
      valor.split("-").map(Number);

    if (partes.length === 3) {

      const dataSelecionada =
        new Date(
          partes[0],
          partes[1] - 1,
          partes[2]
        );

      dataSelecionada.setHours(0, 0, 0, 0);

      const hoje =
        new Date();

      hoje.setHours(0, 0, 0, 0);

      /*
        Somente data anterior a hoje é inválida.
        A data de hoje continua permitida.
      */
      dataInvalida =
        dataSelecionada < hoje;
    }
  }

  inputDataPrevisao.classList.toggle(
    "fsa-data-invalida",
    dataInvalida
  );

  inputDataPrevisao.setAttribute(
    "aria-invalid",
    dataInvalida ? "true" : "false"
  );

  let mensagem =
    document.getElementById(
      "fsaMensagemDataInvalida"
    );

  if (dataInvalida && !mensagem) {

    mensagem =
      document.createElement("div");

    mensagem.id =
      "fsaMensagemDataInvalida";

    mensagem.className =
      "fsa-mensagem-data-invalida";

    mensagem.textContent =
      "Selecione uma data maior que a data de hoje!";

    inputDataPrevisao.insertAdjacentElement(
      "afterend",
      mensagem
    );

  } else if (!dataInvalida && mensagem) {

    mensagem.remove();
  }

  return !dataInvalida;
}

function campoEstaVisivelNoBloco(campo) {

  if (
    !campo ||
    campo.disabled ||
    String(campo.type || "").toLowerCase() === "hidden"
  ) {
    return false;
  }

  /*
    Verifica somente a visibilidade dentro do bloco 2.

    Não usamos offsetWidth/offsetHeight porque o modal
    inicia fechado com display:none. Caso usássemos isso,
    todos os campos seriam considerados invisíveis.
  */
  let elementoAtual = campo;

  while (
    elementoAtual &&
    elementoAtual !== blocoDadosComplementares
  ) {

    if (elementoAtual.hidden) {
      return false;
    }

    const estilo =
      window.getComputedStyle(elementoAtual);

    if (
      estilo.display === "none" ||
      estilo.visibility === "hidden"
    ) {
      return false;
    }

    elementoAtual =
      elementoAtual.parentElement;
  }

  return elementoAtual === blocoDadosComplementares;
}

/* =====================================================
   MENSAGENS DE CPF, RG E CNPJ INVÁLIDOS
   ===================================================== */

function definirErroDocumento(
  campo,
  mensagem
) {

  if (!campo) {
    return;
  }

  const idMensagem =
    "fsaErro_" + campo.id;

  let elementoMensagem =
    document.getElementById(idMensagem);

  const possuiErro =
    Boolean(mensagem);

  campo.classList.toggle(
    "fsa-campo-invalido",
    possuiErro
  );

  campo.setAttribute(
    "aria-invalid",
    possuiErro ? "true" : "false"
  );

  if (!possuiErro) {

    if (elementoMensagem) {
      elementoMensagem.remove();
    }

    return;
  }

  if (!elementoMensagem) {

    elementoMensagem =
      document.createElement("div");

    elementoMensagem.id =
      idMensagem;

    elementoMensagem.className =
      "fsa-mensagem-invalida";

    elementoMensagem.setAttribute(
      "role",
      "alert"
    );

    campo.insertAdjacentElement(
      "afterend",
      elementoMensagem
    );
  }

  elementoMensagem.textContent =
    mensagem;
}


function validarDocumentosFsa() {

  let documentosValidos = true;

  /*
    CPF
  */
  if (inputCpf) {

    const cpf =
      String(
        inputCpf.value || ""
      ).trim();

    const cpfInvalido =
      cpf !== "" &&
      !validarCpfFsa(cpf);

    definirErroDocumento(
      inputCpf,
      cpfInvalido
        ? "CPF inválido. Formato: 000.000.000-00"
        : ""
    );

    if (cpfInvalido) {
      documentosValidos = false;
    }
  }

  /*
    RG
  */
  if (inputRg) {

    const rg =
      String(
        inputRg.value || ""
      ).trim();

    const rgInvalido =
      rg !== "" &&
      !validarRgFsa(rg);

    definirErroDocumento(
      inputRg,
      rgInvalido
        ? "RG inválido. Use apenas letras e números."
        : ""
    );

    if (rgInvalido) {
      documentosValidos = false;
    }
  }

  /*
    CNPJ:
    somente é validado quando o campo existe
    e está visível dentro do bloco 2.
  */
  if (
    inputCnpj &&
    campoEstaVisivelNoBloco(inputCnpj)
  ) {

    const cnpj =
      String(
        inputCnpj.value || ""
      ).trim();

    /*
      O CNPJ atual não está marcado como required.
      Portanto, vazio continua permitido.
    */
    const cnpjInvalido =
      cnpj !== "" &&
      !validarCnpjFsa(cnpj);

    definirErroDocumento(
      inputCnpj,
      cnpjInvalido
        ? "CNPJ inválido. Formato: 00.000.000/0000-00"
        : ""
    );

    if (cnpjInvalido) {
      documentosValidos = false;
    }

  } else if (inputCnpj) {

    /*
      Remove mensagem antiga caso o campo
      deixe de ficar visível.
    */
    definirErroDocumento(
      inputCnpj,
      ""
    );
  }

  return documentosValidos;
}

function validarRespFaturamentoFsa() {

  /*
    Se o campo não existe ou não está visível,
    ele não deve bloquear o SALVAR.
  */
  if (
    !selectRespFaturamento ||
    !campoEstaVisivelNoBloco(
      selectRespFaturamento
    )
  ) {

    definirErroDocumento(
      selectRespFaturamento,
      ""
    );

    return true;
  }

  const valorSelecionado =
    String(
      selectRespFaturamento.value || ""
    ).trim();

  const opcaoValida =
    valorSelecionado === "586450000" ||
    valorSelecionado === "586450001";

  definirErroDocumento(
    selectRespFaturamento,
    opcaoValida
      ? ""
      : "Selecione uma opção da lista"
  );

  return opcaoValida;
}

function campoObrigatorioPreenchido(campo) {

  const tipo =
    String(campo.type || "").toLowerCase();

  const tag =
    String(campo.tagName || "").toLowerCase();

  /*
    Radio button
  */
  if (tipo === "radio") {

    const nomeGrupo = campo.name;

    if (!nomeGrupo) {
      return campo.checked;
    }

    const radios =
      blocoDadosComplementares.querySelectorAll(
        'input[type="radio"][name="' +
        CSS.escape(nomeGrupo) +
        '"]'
      );

    return Array.from(radios).some(function (radio) {
      return (
        !radio.disabled &&
        campoEstaVisivelNoBloco(radio) &&
        radio.checked
      );
    });
  }

  /*
    Checkbox obrigatório
  */
  if (tipo === "checkbox") {
    return campo.checked;
  }

  /*
    Campo select
  */
  if (tag === "select") {

    const valor =
      String(campo.value || "").trim();

    return (
      valor !== "" &&
      valor !== "null" &&
      valor !== "-1"
    );
  }

  /*
    Input e textarea
  */
  return String(campo.value || "").trim() !== "";
}

function atualizarEstadoBotaoSalvarFsa() {

  if (
    !btnSalvar ||
    !blocoDadosComplementares
  ) {
    return;
  }

  if (
    btnSalvar.dataset.executando === "true"
  ) {
    return;
  }

  const camposObrigatorios =
    Array.from(
      blocoDadosComplementares.querySelectorAll(
        "input[required], " +
        "select[required], " +
        "textarea[required]"
      )
    );

  const obrigatoriosPreenchidos =
    camposObrigatorios.every(function (campo) {

      if (
        campo.disabled ||
        !campoEstaVisivelNoBloco(campo)
      ) {
        return true;
      }

      return campoObrigatorioPreenchido(campo);
    });

  const tipoCadastro =
    String(
      el("pp-tipo-cadastro")?.value || ""
    )
    .trim()
    .toUpperCase();

  const cadastroCnpj =
    tipoCadastro.includes("CNPJ");

  const nomeConstrutoraPreenchido =
    !cadastroCnpj ||
    String(
      inputNomeConstrutora?.value || ""
    )
    .trim() !== "";

  const cnpjPreenchido =
    !cadastroCnpj ||
    String(
      inputCnpj?.value || ""
    )
    .trim() !== "";

  const camposCnpjPreenchidos =
    nomeConstrutoraPreenchido &&
    cnpjPreenchido;

  const documentosValidos =
    validarDocumentosFsa();

  const faturamentoValido =
    validarRespFaturamentoFsa();

  const dataValida =
    verificarDataPrevisaoFsa();

  const camposValidos =
    documentosValidos &&
    faturamentoValido &&
    dataValida;

  const podeSalvar =
    obrigatoriosPreenchidos &&
    camposCnpjPreenchidos &&
    camposValidos;

  btnSalvar.disabled =
    !podeSalvar;

  btnSalvar.setAttribute(
    "aria-disabled",
    String(!podeSalvar)
  );

  btnSalvar.classList.toggle(
    "btn-cloud-disabled",
    !podeSalvar
  );

  console.log(
    "VALIDAÇÃO DO SALVAR",
    {
      tipoCadastro,
      cadastroCnpj,
      nomeConstrutoraPreenchido,
      cnpjPreenchido,
      obrigatoriosPreenchidos,
      documentosValidos,
      faturamentoValido,
      dataValida,
      podeSalvar
    }
  );
}

/*
  Reavalia enquanto o usuário preenche os campos.
*/
if (blocoDadosComplementares) {

  blocoDadosComplementares.addEventListener(
    "input",
    atualizarEstadoBotaoSalvarFsa,
    true
  );

  blocoDadosComplementares.addEventListener(
    "change",
    atualizarEstadoBotaoSalvarFsa,
    true
  );

  /*
    Detecta campos que forem exibidos ou ocultados
    dinamicamente.
  */
  const observerCamposFsa =
    new MutationObserver(function () {
      atualizarEstadoBotaoSalvarFsa();
    });

  observerCamposFsa.observe(
    blocoDadosComplementares,
    {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "hidden",
        "disabled",
        "required"
      ]
    }
  );
}


/*
  Depois de um form.reset(), recalcula o botão.
*/
form.addEventListener("reset", function () {

  setTimeout(
    atualizarEstadoBotaoSalvarFsa,
    0
  );
});


/*
  Validação inicial com os valores carregados
  pelo Liquid/Dataverse.
*/
atualizarEstadoBotaoSalvarFsa();

    btnAbrir.addEventListener(
  "click",
  function (event) {

    event.preventDefault();
    event.stopPropagation();

    abrirModal(modalFormulario);

    atualizarEstadoBotaoSalvarFsa();
  }
);
    function cancelarFormulario(event) {
      event?.preventDefault();
      event?.stopPropagation();

      form.reset();

      if (inputCpf) {
        inputCpf.value = formatarCpf(inputCpf.value);
      }

      if (inputCnpj) {
        inputCnpj.value = formatarCnpj(inputCnpj.value);
      }

      if (inputRg) {
        inputRg.value =
          formatarRg(inputRg.value);
      }

      fecharModal(modalConfirmacao);
      fecharModal(modalFormulario);

      document.body.style.removeProperty("overflow");
    }

    btnFechar?.addEventListener(
      "click",
      cancelarFormulario
    );

    btnCancelar?.addEventListener(
      "click",
      cancelarFormulario
    );

form.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();
    event.stopPropagation();

    atualizarEstadoBotaoSalvarFsa();

    if (btnSalvar.disabled) {
      console.warn(
        "SALVAR bloqueado: existem campos obrigatórios ou inválidos."
      );

      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    abrirModal(modalConfirmacao);
  }
);

    btnCancelarConfirmacao?.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();

        fecharModal(modalConfirmacao);
      }
    );

    btnConfirmar?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        if (!form.reportValidity()) {
          fecharModal(modalConfirmacao);
          return;
        }

        if (
          btnConfirmar.dataset.executando === "true"
        ) {
          return;
        }

        if (
          !window.shell ||
          typeof shell.ajaxSafePost !== "function"
        ) {
          alert("Contexto de segurança não disponível.");
          return;
        }

        const recordID =
          new URLSearchParams(
            window.location.search
          ).get("id") ||
          el("pp-recordid")?.value ||
          "";

        if (!recordID) {
          alert("ID da solicitação não encontrado.");
          return;
        }
const tipoCadastroOriginal =
  String(
    el("pp-tipo-cadastro")?.value || ""
  )
  .trim()
  .toUpperCase();

const tipoCadastro =
  tipoCadastroOriginal.includes("CNPJ")
    ? "CNPJ"
    : "CPF";
        const payload = {
          eventData: JSON.stringify({
            RecordID: recordID,
            ALTERACAO: "SIM",

            TIPO_CADASTRO: tipoCadastro,

            NOME_EMPREENDIMENTO:
              valor("fsaNomeEmpreendimento"),

            NOME_PROPRIETARIO:
              valor("fsaNomeProprietario"),

            CPF_PROPRIETARIO:
              valor("fsaCpfProprietario"),

            RG_PROPRIETARIO:
              valor("fsaRgProprietario"),

            DATA_PREVISAO:
              valor("fsaDataPrevisao"),

            ENDERECO_OBRA:
              valor("fsaEnderecoObra"),

            BAIRRO_OBRA:
              valor("fsaBairroObra"),

            OBSERVACOES:
              valor("fsaObservacoes"),

            NOME_CONSTRUTORA:
              valor("fsaNomeConstrutora"),

            CNPJ:
              valor("fsaCnpjConstrutora"),

            NOME_RESP:
              valor("fsaNomeRespFaturamento")
          })
        };

        const textoOriginal =
          btnConfirmar.innerText;

        btnConfirmar.dataset.executando = "true";
        btnConfirmar.disabled = true;
        btnConfirmar.innerText = "PROCESSANDO...";

        shell.ajaxSafePost({
          type: "POST",
          contentType: "application/json",
          url: FLOW_ATUALIZAR_FSA,
          data: JSON.stringify(payload),
          processData: false,
          global: false
        })
        .done(function () {

          fecharModal(modalConfirmacao);
          fecharModal(modalFormulario);
          abrirModal(modalSucesso);

        })
        .fail(function (xhr) {

          console.error(
            "Erro ao atualizar informações do FSA:",
            {
              status: xhr?.status,
              responseText: xhr?.responseText
            }
          );

          alert(
            "Não foi possível atualizar as informações. " +
            "Verifique a execução do fluxo e tente novamente."
          );

        })
        .always(function () {

          btnConfirmar.dataset.executando = "false";
          btnConfirmar.disabled = false;
          btnConfirmar.innerText = textoOriginal;

        });
      }
    );

    btnOk?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        fecharModal(modalSucesso);
        fecharModal(modalConfirmacao);
        fecharModal(modalFormulario);

        document.body.style.removeProperty("overflow");

        window.location.reload();
      }
    );

    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key !== "Escape") {
          return;
        }

        if (
          modalConfirmacao?.style.display === "flex"
        ) {
          fecharModal(modalConfirmacao);
          return;
        }

        if (
          modalFormulario?.style.display === "flex"
        ) {
          cancelarFormulario(event);
        }
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciar
    );
  } else {
    iniciar();
  }

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

(function formatarConsumoMensalFsa() {

  function formatar() {

    document
      .querySelectorAll(".fsa-consumo-mensal")
      .forEach(function (elemento) {

        const valorOriginal =
          String(
            elemento.dataset.valor || ""
          ).trim();

        if (!valorOriginal) {
          elemento.textContent =
            "Não informado";

          return;
        }

        /*
          O Dataverse normalmente entrega decimal
          usando ponto como separador.
          O replace também permite tratar vírgula.
        */
        const valorNumerico =
          Number(
            valorOriginal
              .replace(/\s/g, "")
              .replace(",", ".")
          );

        if (!Number.isFinite(valorNumerico)) {
          elemento.textContent =
            "Não informado";

          return;
        }

        const valorFormatado =
          new Intl.NumberFormat(
            "pt-BR",
            {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }
          ).format(valorNumerico);

        elemento.textContent =
          valorFormatado + " m³";
      });
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      formatar
    );

  } else {

    formatar();

  }

})();

(function formatarAreaConstruidaFsa() {

  function converterDecimalDataverse(valorOriginal) {

    let texto =
      String(valorOriginal || "")
        .trim()
        .replace(/\s/g, "");

    if (!texto) {
      return NaN;
    }

    /*
      Trata os dois formatos possíveis:

      Dataverse: 1250.50
      Português: 1.250,50
    */
    if (
      texto.includes(".") &&
      texto.includes(",")
    ) {

      texto =
        texto
          .replace(/\./g, "")
          .replace(",", ".");

    } else if (texto.includes(",")) {

      texto =
        texto.replace(",", ".");
    }

    return Number(texto);
  }

  function formatar() {

    document
      .querySelectorAll(
        ".fsa-area-construida-total"
      )
      .forEach(function (elemento) {

        const valorNumerico =
          converterDecimalDataverse(
            elemento.dataset.valor
          );

        if (!Number.isFinite(valorNumerico)) {

          elemento.textContent =
            "Não informada";

          return;
        }

        const valorFormatado =
          new Intl.NumberFormat(
            "pt-BR",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }
          ).format(valorNumerico);

        elemento.textContent =
          valorFormatado + " m²";
      });
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      formatar
    );

  } else {

    formatar();
  }

})();
(function formatarNumeroEconomiasFsa() {

  function formatar() {

    document
      .querySelectorAll(".fsa-numero-economias")
      .forEach(function (elemento) {

        const valorOriginal =
          String(
            elemento.dataset.valor || ""
          )
          .trim()
          .replace(/\D/g, "");

        if (!valorOriginal) {
          elemento.textContent =
            "Não informado";

          return;
        }

        const valorNumerico =
          Number(valorOriginal);

        if (!Number.isFinite(valorNumerico)) {
          elemento.textContent =
            "Não informado";

          return;
        }

        elemento.textContent =
          new Intl.NumberFormat(
            "pt-BR",
            {
              maximumFractionDigits: 0
            }
          ).format(valorNumerico);
      });
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      formatar
    );

  } else {

    formatar();
  }

})();
(function formatarQuantidadesPessoasFsa() {

  function formatar() {

    document
      .querySelectorAll(".fsa-quantidade-pessoas")
      .forEach(function (elemento) {

        const valorOriginal =
          String(
            elemento.dataset.valor || ""
          )
          .trim()
          .replace(/\D/g, "");

        if (!valorOriginal) {

          elemento.textContent =
            "Não informado";

          return;
        }

        const valorNumerico =
          Number(valorOriginal);

        if (!Number.isFinite(valorNumerico)) {

          elemento.textContent =
            "Não informado";

          return;
        }

        const numeroFormatado =
          new Intl.NumberFormat(
            "pt-BR",
            {
              maximumFractionDigits: 0
            }
          ).format(valorNumerico);

        const complemento =
          valorNumerico === 1
            ? "pessoa"
            : "pessoas";

        elemento.textContent =
          numeroFormatado + " " + complemento;
      });
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      formatar
    );

  } else {

    formatar();
  }

})();
(function formatarVolumeAguaProcessoFsa() {

  function converterDecimalDataverse(valorOriginal) {

    let texto =
      String(valorOriginal || "")
        .trim()
        .replace(/\s/g, "");

    if (!texto) {
      return NaN;
    }

    /*
      Aceita:
      1250.50
      1250,50
      1.250,50
    */
    if (
      texto.includes(".") &&
      texto.includes(",")
    ) {

      texto =
        texto
          .replace(/\./g, "")
          .replace(",", ".");

    } else if (texto.includes(",")) {

      texto =
        texto.replace(",", ".");
    }

    return Number(texto);
  }

  function formatar() {

    document
      .querySelectorAll(
        ".fsa-volume-agua-processo"
      )
      .forEach(function (elemento) {

        const valorNumerico =
          converterDecimalDataverse(
            elemento.dataset.valor
          );

        if (!Number.isFinite(valorNumerico)) {

          elemento.textContent =
            "Não informado";

          return;
        }

        const valorFormatado =
          new Intl.NumberFormat(
            "pt-BR",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }
          ).format(valorNumerico);

        elemento.textContent =
          valorFormatado + " m³/mês";
      });
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      formatar
    );

  } else {

    formatar();
  }

})();