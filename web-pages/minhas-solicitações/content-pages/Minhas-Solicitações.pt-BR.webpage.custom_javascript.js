  (function () {
  const FLOW_URL =
    "/_api/cloudflow/v1.0/trigger/8a44f186-b5e4-f011-8543-000d3a5ae560";
  let recordID = "";
  let valorAntigo = "";
  const wait = setInterval(function () {
    const modalEditar    = document.getElementById("modalEditarEconomias");
    const modalConfirmar = document.getElementById("modalConfirmarEconomias");
    const modalSucesso   = document.getElementById("modalSucessoEconomias");
    const inputNumero = document.getElementById("inputNovoNumeroEconomias");
    const btnSalvar   = document.getElementById("btnSalvarEconomias");
    const btnCancelar = document.getElementById("btnCancelarEditarEconomias");
    const btnFechar   = document.getElementById("btnFecharEditarEconomias");
    const btnConfirmar    = document.getElementById("btnConfirmarEconomias");
    const btnCancelarConf = document.getElementById("btnCancelarConfirmarEconomias");
    const btnOk           = document.getElementById("btnOkEconomias");
    const textoConfirmacao = document.getElementById("textoConfirmacaoEconomias");
    if (!modalEditar || !modalConfirmar || !modalSucesso ||
        !inputNumero || !btnSalvar || !btnCancelar ||
        !btnConfirmar || !btnCancelarConf || !btnOk ||
        !window.shell || typeof shell.ajaxSafePost !== "function") {
      return;
    }
    clearInterval(wait);
    function validarBotao() {
  inputNumero.value = inputNumero.value.replace(/\D/g, "");
  const novo = inputNumero.value.trim();
  btnSalvar.disabled =
    (novo === "" || Number(novo) === Number(valorAntigo));
}
    function abrirModal() {
      inputNumero.value = valorAntigo;
      btnSalvar.disabled = true;
      modalEditar.style.display = "flex";
      setTimeout(() => inputNumero.focus(), 50);
    }
    document.addEventListener("click", function (e) {
      const btn = e.target.closest('[data-action="alter_economias"]');
      if (!btn) return;
      recordID    = btn.dataset.recordId || "";
      valorAntigo = btn.dataset.valorAtual || "";
      setTimeout(() => {
        if (!recordID) {
          alert("ID da solicitação não encontrado.");
          return;
        }
        abrirModal();
      }, 0);
    }, true);
    inputNumero.addEventListener("input", validarBotao);
    function fecharEditar() {
      modalEditar.style.display = "none";
    }
    btnCancelar.addEventListener("click", fecharEditar);
    btnFechar.addEventListener("click", fecharEditar);
    btnSalvar.addEventListener("click", function () {
      const novo = inputNumero.value.trim();
      textoConfirmacao.innerHTML = `
  <p>
    Deseja alterar o número de economias de
    <strong>${valorAntigo}</strong>
    para
    <strong>${novo}</strong>?
  </p>

  <div class="alert-reanalise">
    <strong>⚠️ Observação importante</strong><br />
    Ao avançar, você declara estar de acordo com o
    <strong>reinício da fase de diretrizes técnicas</strong>,
    onde haverá o pagamento de uma
    <strong>nova taxa de entrada (taxa de reanálise)</strong>
    devido a alterações no número de economias.
  </div>
`;
      modalEditar.style.display = "none";
      modalConfirmar.style.display = "flex";
    });
    btnCancelarConf.addEventListener("click", function () {
      modalConfirmar.style.display = "none";
    });
    btnConfirmar.addEventListener("click", function () {
      if (btnConfirmar.dataset.executando === "true") return;
      btnConfirmar.dataset.executando = "true";
      btnConfirmar.disabled = true;
      const novo = inputNumero.value.trim();
      const payload = {
        eventData: JSON.stringify({
          RecordID: recordID,
          VALOR_ANTIGO: valorAntigo,
          VALOR_NOVO: novo
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
        modalConfirmar.style.display = "none";
        modalSucesso.style.display = "flex";
      })
      .fail(function (xhr) {
        console.error("❌ Flow alterar economias falhou:", xhr);
        alert("Erro ao salvar a alteração.");
      })
      .always(function () {
        btnConfirmar.disabled = false;
        btnConfirmar.dataset.executando = "false";
      });
    });
    btnOk.addEventListener("click", function () {
      modalSucesso.style.display = "none";
      const url = new URL(window.location.href);
      url.searchParams.set("nocache", Date.now());
      window.location.replace(url.toString());
    });
  }, 200);
})();
(function () {
  var flowUrl = "/_api/cloudflow/v1.0/trigger/2361651b-5ff6-f011-8406-002248de77b7";
  var intervalo = setInterval(function () {
    var modalConfirmacao = document.getElementById("modalConfirmacaoExclusao");
    var modalSucesso = document.getElementById("modalSucessoExclusao");
    var btnCancelar = document.getElementById("btnCancelarExclusao");
    var btnConfirmar = document.getElementById("btnConfirmarExclusao");
    var btnOkSucesso = document.getElementById("btnOkSucessoExclusao");
    var btnFechar = document.getElementById("btnFecharModalExclusao");
    if (
      modalConfirmacao &&
      modalSucesso &&
      btnCancelar &&
      btnConfirmar &&
      btnOkSucesso &&
      window.shell &&
      typeof shell.ajaxSafePost === "function"
    ) {
      clearInterval(intervalo);
      configurarEventos();
    }
    function configurarEventos() {
      var recordIDSelecionado = null;
      document.addEventListener("click", function (e) {
        var btnExcluir = e.target.closest('[data-action="excluir"]');
        if (!btnExcluir) return;
        e.preventDefault();
        e.stopPropagation();
        recordIDSelecionado = btnExcluir.dataset.recordId;
        if (!recordIDSelecionado) {
          alert("ID da solicitação não encontrado.");
          return;
        }
        modalConfirmacao.style.display = "flex";
      });
      btnCancelar.addEventListener("click", fecharModal);
      btnFechar.addEventListener("click", fecharModal);
      function fecharModal() {
        modalConfirmacao.style.display = "none";
        recordIDSelecionado = null;
      }
      btnConfirmar.addEventListener("click", function () {
        if (btnConfirmar.dataset.executando === "true") return;
        btnConfirmar.dataset.executando = "true";
        btnConfirmar.disabled = true;
        var textoOriginal = btnConfirmar.innerText;
        btnConfirmar.innerText = "Processando...";
        if (!recordIDSelecionado) {
          alert("Erro ao obter o ID da solicitação.");
          resetarBotao();
          return;
        }
        var payload = {
          eventData: JSON.stringify({
            RecordID: recordIDSelecionado
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
          alert("Erro ao cancelar a solicitação.");
          console.error(xhr);
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
        modalSucesso.style.display = "none";
        if (window.confetti) {
          confetti({
            particleCount: 160,
            spread: 100,
            origin: { y: 0.6 }
          });
        }
        setTimeout(function () {
          const url = new URL(window.location.href);
          url.searchParams.set("nocache", Date.now());
          window.location.replace(url.toString());
        }, 800);
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
    "btnOkSucessoExclusao",
    "btnOkEditarNome",
    "btnOkEconomias"
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
  const FLOW_URL =
  "/_api/cloudflow/v1.0/trigger/b9a1abc5-d0df-f011-8543-000d3a5ae560";
  let recordID = "";
  let valorAntigo = "";
  const wait = setInterval(function () {
    const btnFecharEditar = document.getElementById("btnFecharEditarNome");
    btnFecharEditar.addEventListener("click", () => modalEditar.style.display = "none");
    const modalEditar    = document.getElementById("modalEditarNome");
    const modalConfirmar = document.getElementById("modalConfirmarEditarNome");
    const modalSucesso   = document.getElementById("modalEditarNomeSucesso");
    const inputNome   = document.getElementById("inputNovoNome");  
    const btnSalvar   = document.getElementById("btnSalvarNome");
    const btnCancelar = document.getElementById("btnCancelarEditarNome");
    const btnConfirmar    = document.getElementById("btnConfirmarEditarNome");
    const btnCancelarConf = document.getElementById("btnCancelarConfirmacaoNome");
    const btnOk           = document.getElementById("btnOkEditarNome");
    const textoConfirmacao= document.getElementById("textoConfirmacaoNome");
    if (!modalEditar || !modalConfirmar || !modalSucesso ||
        !inputNome || !btnSalvar || !btnCancelar ||
        !btnConfirmar || !btnCancelarConf || !btnOk || !textoConfirmacao) {
      return;
    }
    if (!window.shell || typeof shell.ajaxSafePost !== "function") {
      console.warn("⚠ shell.ajaxSafePost não disponível ainda...");
      return;
    }
    clearInterval(wait);
    console.log("✅ Editar Nome: handlers carregados");
    function validarBotao() {
      const novo = inputNome.value.trim();
      btnSalvar.disabled = (novo === "" || novo === valorAntigo);
    }


    function abrirModalEditar() {
      inputNome.value = valorAntigo;
      btnSalvar.disabled = true;
      modalEditar.style.display = "flex";
      setTimeout(() => inputNome.focus(), 50);
    }
document.addEventListener("click", function (e) {
  const btn = e.target.closest('[data-action="edit_nome"]');
  if (!btn) return;

  e.preventDefault();

  recordID    = btn.dataset.recordId;
  valorAntigo = btn.dataset.nomeAtual;

  if (!recordID) {
    alert("ID da solicitação não encontrado.");
    return;
  }
  inputNome.value = valorAntigo;
  btnSalvar.disabled = true;
  modalEditar.style.display = "flex";

  setTimeout(() => inputNome.focus(), 50);

});
    inputNome.addEventListener("input", validarBotao);
    btnCancelar.addEventListener("click", function () {
      modalEditar.style.display = "none";
    });
    btnSalvar.addEventListener("click", function () {
      const novo = inputNome.value.trim();
      textoConfirmacao.innerHTML =
        `Deseja alterar nome do empreendimento de
         <strong>${valorAntigo}</strong>
         para
         <strong>${novo}</strong>?`;
      modalEditar.style.display = "none";
      modalConfirmar.style.display = "flex";
    });
    btnCancelarConf.addEventListener("click", function () {
      modalConfirmar.style.display = "none";
    });
    btnConfirmar.addEventListener("click", function () {
      if (btnConfirmar.dataset.executando === "true") return;
      const novo = inputNome.value.trim();
      btnConfirmar.dataset.executando = "true";
      btnConfirmar.disabled = true;
      const payload = {
        eventData: JSON.stringify({
          RecordID: recordID,
          VALOR_ANTIGO: valorAntigo,
          VALOR_NOVO: novo
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
        modalConfirmar.style.display = "none";
        modalSucesso.style.display = "flex";
      })
      .fail(function (xhr) {
        console.error("❌ Flow editar nome falhou:", xhr);
        alert("Erro ao salvar a alteração.");
      })
      .always(function () {
        btnConfirmar.disabled = false;
        btnConfirmar.dataset.executando = "false";
      });
    });
    btnOk.addEventListener("click", function () {
      modalSucesso.style.display = "none";
      const url = new URL(window.location.href);
      url.searchParams.set("nocache", Date.now());
      window.location.replace(url.toString());
    });
  }, 200);
})();
(function () {
  const btn = document.getElementById("btnBaixarExcel");
  if (!btn) return;
  btn.addEventListener("click", function () {
    const tabela = document.querySelector(".pp-table-wrapper table");
    if (!tabela) {
      alert("Tabela não encontrada para exportação.");
      return;
    }

    const tabelaClone = tabela.cloneNode(true);

    tabelaClone.querySelectorAll("thead th").forEach(th => {
  const label = th.querySelector(".th-label");

  if (label) {
    th.textContent = label.textContent.trim();
  } else {
    th.textContent = th.textContent.replace("▾", "").trim();
  }
});
    const linhasOriginais = Array.from(tabela.querySelectorAll("tbody tr"));
    const linhasClone = Array.from(tabelaClone.querySelectorAll("tbody tr"));

    linhasClone.forEach((trClone, index) => {
      const trOriginal = linhasOriginais[index];

      if (!trOriginal || trOriginal.style.display === "none" || trOriginal.id === "msgFiltroVazio") {
        trClone.remove();
      }
    });

    tabelaClone.querySelectorAll("tr").forEach(tr => {
      const tds = tr.querySelectorAll("th, td");
      if (tds.length > 1) {
        tds[1].remove();
      }
    });
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Minhas Solicitações</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        ${tabelaClone.outerHTML}
      </body>
      </html>
    `;
    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const agora = new Date();

const dataHora =
  agora.getFullYear() + "-" +
  String(agora.getMonth() + 1).padStart(2, "0") + "-" +
  String(agora.getDate()).padStart(2, "0") + "_" +
  String(agora.getHours()).padStart(2, "0") + "h" +
  String(agora.getMinutes()).padStart(2, "0");

a.download = `minhas_solicitacoes_${dataHora}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
})();
document.addEventListener("DOMContentLoaded", function () {
  const nomeUsuarioLogado = "{{ nomeUsuario | escape }}";

if (nomeUsuarioLogado === "Mayco Fabricio") {
  document.body.classList.add("is-mayco-user");
}
  document.body.classList.add("page-gif-fundo");
});

document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll("td.br-date").forEach(function (td) {

    const isoUtc = td.getAttribute("data-utc");
    if (!isoUtc) {
      td.textContent = "-";
      return;
    }

    const d = new Date(isoUtc);
    if (isNaN(d.getTime())) {
      td.textContent = "-";
      return;
    }

    const fmt = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    td.textContent = fmt.format(d).replace(",", "");

  });

});

(function () {

  // Fecha todos os menus
  function closeMenus() {
    document.querySelectorAll(".th-menu").forEach(m => m.remove());
  }

  // Event delegation TOTAL
  document.addEventListener("click", function (e) {

    /* ============================
       1) ABRIR MENU NO CHEVRON
       ============================ */
    if (e.target.classList.contains("th-chevron")) {
      e.preventDefault();
      e.stopPropagation();

      closeMenus();

      const th = e.target.closest("th");
      const colIndex = th.cellIndex;
      const type = th.dataset.type || "text";

      const menu = document.createElement("div");
      menu.className = "th-menu";
      menu.dataset.colIndex = colIndex;
      menu.dataset.type = type;

      if (type === "date") {
        menu.innerHTML = `
          <button data-dir="desc">Classificar do Mais Antigo para o Mais Recente</button>
          <button data-dir="asc">Classificar do Mais Recente para o Mais Antigo</button>
        `;
      } else {
        menu.innerHTML = `
          <button data-dir="asc">Classificar de A a Z</button>
          <button data-dir="desc">Classificar de Z a A</button>
        `;
      }

      th.appendChild(menu);
      return;
    }

    /* ============================
       2) CLICAR NA OPÇÃO → ORDENAR
       ============================ */
    const btn = e.target.closest(".th-menu button");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();

      const menu = btn.closest(".th-menu");
      const th = menu.closest("th");
      const table = th.closest("table");     // 🔥 AQUI ESTÁ A CHAVE
      const tbody = table.querySelector("tbody");

      const colIndex = Number(menu.dataset.colIndex);
      const type = menu.dataset.type;
      const dir = btn.dataset.dir;

      const rows = Array.from(tbody.querySelectorAll("tr"));

      rows.sort((a, b) => {
        let A = a.children[colIndex]?.innerText.trim() || "";
        let B = b.children[colIndex]?.innerText.trim() || "";

        if (type === "date") {
          const dA = parseDateBR(A);
          const dB = parseDateBR(B);
          return dir === "asc" ? dA - dB : dB - dA;
        }

        return dir === "asc"
          ? A.localeCompare(B, "pt-BR", { sensitivity: "base" })
          : B.localeCompare(A, "pt-BR", { sensitivity: "base" });
      });

      rows.forEach(r => tbody.appendChild(r));
      closeMenus();
      return;
    }

    /* ============================
       3) CLIQUE FORA → FECHAR
       ============================ */
    if (!e.target.closest(".th-menu")) {
      closeMenus();
    }
  });

  // Parser de data BR (dd/MM/yyyy HH:mm)
  function parseDateBR(str) {
    if (!str) return new Date(0);
    const parts = str.split(" ");
    const [dd, mm, yyyy] = parts[0].split("/");
    const [HH = 0, MM = 0] = parts[1]?.split(":") || [];
    return new Date(yyyy, mm - 1, dd, HH, MM);
  }

})();

(function () {

  const table = document.querySelector("table");
  if (!table) return;

  const headers = table.querySelectorAll("th[data-type]");
  let currentSort = { index: null, direction: 1 };

  headers.forEach((header, index) => {
    header.addEventListener("click", () => {
      const type = header.dataset.type;

      // alterna direção
      if (currentSort.index === index) {
        currentSort.direction *= -1;
      } else {
        currentSort.index = index;
        currentSort.direction = 1;
      }

      sortTable(table, index, type, currentSort.direction);
    });
  });

  function sortTable(table, columnIndex, type, direction) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      let aVal = getCellValue(a, columnIndex, type);
      let bVal = getCellValue(b, columnIndex, type);

      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  function getCellValue(row, index, type) {
    const cell = row.children[index];
    if (!cell) return "";

    // usa data-sort-value se existir
    const raw = cell.getAttribute("data-sort-value") || cell.innerText.trim();

    if (type === "number") {
      return parseFloat(
        raw
          .replace(/[^\d,-]/g, "")
          .replace(",", ".")
      ) || 0;
    }

    if (type === "date") {
      return raw;
    }

    return raw.toLowerCase();
  }

})();

(function () {

  // Fecha todos os menus abertos
  function closeAllMenus() {
    document.querySelectorAll(".actions-wrap.open").forEach(w => {
      w.classList.remove("open");
      const btn = w.querySelector(".btn-ellipsis");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  // Clique geral
  document.addEventListener("click", function (e) {

    // 1) Clique no botão "..."
    const ellipsisBtn = e.target.closest(".btn-ellipsis");
    if (ellipsisBtn) {
      e.preventDefault();
      e.stopPropagation();

      const wrap = ellipsisBtn.closest(".actions-wrap");
      const isOpen = wrap.classList.contains("open");

      // fecha outros
      closeAllMenus();

      // abre/fecha este
      if (!isOpen) {
        wrap.classList.add("open");
        ellipsisBtn.setAttribute("aria-expanded", "true");
      }
      return;
    }

    // 2) Clique em item do menu
    const item = e.target.closest(".am-item");
    if (item) {
      e.preventDefault();
      e.stopPropagation();

      const wrap = item.closest(".actions-wrap");
      const btn = wrap.querySelector(".btn-ellipsis");
      const action = item.dataset.action;

      // Só o Status navega agora
      if (action === "status") {
        const url = btn.getAttribute("data-status-url");
        if (url) window.location.href = url;
      } else {
        // placeholders por enquanto
        console.log("Ação selecionada (ainda não implementada):", action);
        closeAllMenus();
      }
      return;
    }

    // 3) Clique fora → fecha tudo
    closeAllMenus();
  });

  // Tecla ESC fecha
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllMenus();
  });

})();
(function () {
  const btn = document.getElementById("btnRefreshStatus");
  if (!btn) return;

  btn.addEventListener("click", function () {
    // força reload completo (quebra cache)
    window.location.reload(true);
  });
})();

document.addEventListener("DOMContentLoaded", function () {

  const primeiraLinha = document.querySelector(".pp-table-wrapper tbody tr");
  if (!primeiraLinha) return;

  const botao = primeiraLinha.querySelector(".has-tooltip");
  if (!botao) return;

  botao.classList.add("tooltip-bottom");

});
(function () {

  const tabela = document.querySelector(".pp-table-wrapper tbody");
  if (!tabela) return;

  tabela.addEventListener("click", function (e) {

    const btn = e.target.closest(".btn-ellipsis");

    // clique fora do botão → fecha menus
    if (!btn) {
      document.querySelectorAll(".actions-wrap.open")
        .forEach(el => el.classList.remove("open"));
      return;
    }

    e.stopPropagation();

    const wrap = btn.closest(".actions-wrap");
    const menu = wrap.querySelector(".actions-menu");
    const tr = btn.closest("tr");

    if (!menu || !tr) return;

    // fecha outros menus
    document.querySelectorAll(".actions-wrap.open")
      .forEach(el => {
        if (el !== wrap) el.classList.remove("open");
      });

    wrap.classList.toggle("open");

    // últimas 4 linhas
    const linhas = Array.from(tr.parentElement.children);
    const indexAtual = linhas.indexOf(tr);
    const total = linhas.length;

    if (indexAtual >= total - 4) {
      menu.classList.add("menu-up");
    } else {
      menu.classList.remove("menu-up");
    }

  });

  // clicar fora fecha
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".actions-wrap")) {
      document.querySelectorAll(".actions-wrap.open")
        .forEach(el => el.classList.remove("open"));
    }
  });

  // mover para outra linha fecha
  tabela.addEventListener("mouseover", function (e) {
    const linha = e.target.closest("tr");
    if (!linha) return;

    document.querySelectorAll(".actions-wrap.open")
      .forEach(el => {
        if (!linha.contains(el)) {
          el.classList.remove("open");
        }
      });
  });

})();

document.querySelectorAll(".pp-table-wrapper tbody tr")
  .forEach(tr => {
    tr.addEventListener("mouseenter", function () {
      document.querySelectorAll(".actions-wrap.open")
        .forEach(el => el.classList.remove("open"));
    });
});
document.addEventListener("click", function (e) {

  if (
    !e.target.closest(".actions-wrap") &&
    !e.target.closest(".actions-menu")
  ) {
    document.querySelectorAll(".actions-wrap.open")
      .forEach(el => el.classList.remove("open"));
  }

});

document.addEventListener("click", function (e) {

  const item = e.target.closest(".am-item");
  if (!item) return;

  const action = item.dataset.action;
  const wrap = item.closest(".actions-wrap");
  const btn = wrap?.querySelector(".btn-ellipsis");

  // =====================================
  // VER STATUS
  // =====================================
  if (action === "status") {

    const fase = btn.dataset.fase;
    const urlNormal = btn.dataset.statusUrl;
    const urlProjeto = btn.dataset.statusProjetoUrl;

    if (fase === "586450000") {
      window.location.href = urlNormal;
    } else if (fase === "586450001") {
      window.location.href = urlProjeto;
    }

    return;
  }

  // =====================================
  // EDITAR SOLICITAÇÃO (NOVO)
  // =====================================
  if (action === "editar") {

  e.preventDefault();
  e.stopPropagation();

  const editUrl = item.dataset.editUrl;

  if (!editUrl) return;

  RecordIDEditar = editUrl.split("id=")[1];

  document.getElementById("modalConfirmarEdicao").style.display = "flex";

  return;
}

});

(function () {

  const modal = document.getElementById("modalEditarFSA");
  const grid = document.querySelector(".fsa-grid");
  const btnSalvar = document.getElementById("btnSalvarAlteracoesFSA");
  const btnFechar = document.getElementById("btnFecharFSA");

  let paginaAtual = 1;
  let originalData = {};
  let rowSelecionada = null;
  let finalidadeAtual = "";
  // ================================
  // ABRIR MODAL
  // ================================
  document.addEventListener("click", function (e) {

    const editarBtn = e.target.closest('[data-action="editar"]');
    if (!editarBtn) return;

    rowSelecionada = editarBtn.closest("tr");
    if (!rowSelecionada) return;

    paginaAtual = 1;
    montarPagina();

    modal.style.display = "flex";
  });

  // ================================
  // CONTROLE DE PAGINA
  // ================================
  function montarPagina() {

    grid.innerHTML = "";
    btnSalvar.style.display = "none";
    btnFechar.style.display = "none";

    atualizarIndicadorEtapa();

    if (paginaAtual === 1) montarPagina1();
    if (paginaAtual === 2) montarPagina2();
    if (paginaAtual === 3) montarPagina3();

    atualizarBotoes();
  }

  function atualizarBotoes() {

    const footer = modal.querySelector(".modal-cloud-actions");
    footer.innerHTML = "";

    if (paginaAtual === 1) {
      footer.appendChild(criarBotao("FECHAR", fecharModal, true));
      footer.appendChild(criarBotao("AVANÇAR", () => mudarPagina(2)));
    }

    if (paginaAtual === 2) {
      footer.appendChild(criarBotao("ANTERIOR", () => mudarPagina(1), true));
      footer.appendChild(criarBotao("AVANÇAR", () => mudarPagina(3)));
    }

    if (paginaAtual === 3) {
      footer.appendChild(criarBotao("ANTERIOR", () => mudarPagina(2), true));
      footer.appendChild(criarBotao("SALVAR ALTERAÇÕES", salvarAlteracoes));
    }
  }

  function criarBotao(texto, acao, outline = false) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = outline ? "btn-cloud btn-cloud-outline" : "btn-cloud";
    btn.innerText = texto;
    btn.addEventListener("click", acao);
    return btn;
  }

  function mudarPagina(num) {
    paginaAtual = num;
    montarPagina();
  }

  function fecharModal() {
    modal.style.display = "none";
  }

  document.getElementById("btnFecharEditarFSA").addEventListener("click", fecharModal);

  // ================================
  // PAGINA 1
  // ================================
function montarPagina1() {

  const campos = [
    "PROTOCOLO",
    "CRIADO EM",
    "ÚLT. ATUALIZAÇÃO",
    "MUNICÍPIO OBRA",
    "FINALIDADE EMPREENDIMENTO",
    "TIPO CADASTRO",
    "NÚM. ECONOMIAS",
    "ÁREA CONSTRUÍDA TOTAL",
    "CONSUMO MENSAL",
    "CONGLOMERADO EMPRESARIAL?"
  ];

  originalData = {};

  campos.forEach(nomeCampo => {

    const valor = obterValorColuna(nomeCampo);

    const wrapper = document.createElement("div");
    wrapper.className = "fsa-field";

    const lbl = document.createElement("label");
    lbl.innerText = nomeCampo;

    const input = document.createElement("input");
    input.type = "text";
    input.value = valor === "-" ? "" : valor;

    if (["PROTOCOLO","CRIADO EM","ÚLT. ATUALIZAÇÃO"].includes(nomeCampo)) {
      input.disabled = true;
    }

    // 🔥 CAPTURA FINALIDADE
    if (nomeCampo === "FINALIDADE EMPREENDIMENTO") {
      finalidadeAtual = input.value;

      input.addEventListener("input", function () {
        finalidadeAtual = this.value.trim();

        // se estiver na página 3, atualiza automaticamente
        if (paginaAtual === 3) {
          montarPagina();
        }
      });
    }

    originalData[nomeCampo] = input.value;
    input.addEventListener("input", verificarAlteracoes);

    wrapper.appendChild(lbl);
    wrapper.appendChild(input);
    grid.appendChild(wrapper);
  });
}

  // ================================
  // PAGINA 2
  // ================================
  function montarPagina2() {

    const campos = [
      "NOME EMPREENDIMENTO",
      "NOME CONSTRUTORA",
      "CNPJ CONSTRUTORA",
      "RESPONSÁVEL FATURAMENTO",
      "NOME PROPRIETÁRIO",
      "CPF PROPRIETÁRIO",
      "RG PROPRIETÁRIO",
      "DATA PREV. FIM OBRA",
      "ENDEREÇO OBRA",
      "BAIRRO OBRA",
      "OBSERVAÇÕES"
    ];

    criarCampos(campos);
  }

  // ================================
  // PAGINA 3 (CONDICIONAL)
  // ================================
function montarPagina3() {

  let campos = [];

  const finalidade = (finalidadeAtual || "").toUpperCase();

  if (finalidade.includes("INDUSTRIAL")) {
    campos = [
      "NÚM. FUNCIONÁRIOS",
      "VOLUME ÁGUA DO PROCESSO",
      "DESCRIÇÃO ATIVIDADES",
      "PROJETO DE AMPLIAÇÃO?"
    ];
  }
  else if (finalidade.includes("COMERCIAL") || finalidade.includes("INSTITUCIONAL")) {
    campos = [
      "DESCRIÇÃO ATIVIDADES",
      "NÚM. FUNCIONÁRIOS",
      "ESTIMATIVA PÚBLICO DIÁRIO"
    ];
  }
  else {
    campos = [
      "TIPO OCUPAÇÃO",
      "TIPO PARCELAMENTO",
      "TIPO MEDIÇÃO"
    ];
  }

  criarCampos(campos);
}
  // ================================
  // GERADOR DE CAMPOS
  // ================================
  function criarCampos(lista, somenteLeitura = []) {

    originalData = {};

    lista.forEach(nomeCampo => {

      const valor = obterValorColuna(nomeCampo);

      const wrapper = document.createElement("div");
      wrapper.className = "fsa-field";

      const lbl = document.createElement("label");
      lbl.innerText = nomeCampo;

      const input = document.createElement("input");
      input.type = "text";
      input.value = valor === "-" ? "" : valor;

      if (somenteLeitura.includes(nomeCampo)) {
        input.disabled = true;
      }

      originalData[nomeCampo] = input.value;

      input.addEventListener("input", verificarAlteracoes);

      wrapper.appendChild(lbl);
      wrapper.appendChild(input);
      grid.appendChild(wrapper);
    });

    function atualizarIndicadorEtapa() {
      const step = document.getElementById("fsaStepNumber");
      if (step) step.innerText = paginaAtual;
    }

  }

  function obterValorColuna(nomeColuna) {
    const headers = document.querySelectorAll("th .th-label");
    let index = -1;

    headers.forEach((h, i) => {
      if (h.innerText.trim() === nomeColuna) {
        index = i;
      }
    });

    if (index === -1) return "";

    return rowSelecionada.children[index].innerText.trim();
  }

  function verificarAlteracoes() {

    const inputs = grid.querySelectorAll("input");
    let mudou = false;

    inputs.forEach(input => {
      const label = input.previousElementSibling.innerText;
      if (input.value !== originalData[label]) {
        mudou = true;
      }
    });

    const salvarBtn = modal.querySelector(".btn-cloud:not(.btn-cloud-outline)");
    if (salvarBtn && salvarBtn.innerText.includes("SALVAR")) {
      salvarBtn.disabled = !mudou;
    }
  }

  function salvarAlteracoes() {
    alert("🔥 Aqui vamos integrar com o Flow depois.");
    fecharModal();
  }

})();


let RecordIDEditar = null;






// ============================================
// FECHAR MODAL
// ============================================

document.getElementById("btnCancelarEdicao").onclick = function(){

  document.getElementById("modalConfirmarEdicao").style.display = "none";

}

document.getElementById("btnFecharModalEdicao").onclick = function(){

  document.getElementById("modalConfirmarEdicao").style.display = "none";

}



// ============================================
// CONFIRMAR EDIÇÃO
// ============================================
document.getElementById("btnConfirmarEdicao").onclick = function () {

  if (!RecordIDEditar) {
    alert("ID da solicitação não encontrado.");
    return;
  }

  const btn = this;

  if (btn.dataset.executando === "true") return;

  btn.dataset.executando = "true";
  btn.disabled = true;
  btn.innerText = "Processando...";

  const payload = {
    eventData: JSON.stringify({
      RecordID: RecordIDEditar
    })
  };

  shell.ajaxSafePost({
    type: "POST",
    contentType: "application/json",
    url: "/_api/cloudflow/v1.0/trigger/a997cb3f-1d1d-f111-8341-7ced8da81546",
    data: JSON.stringify(payload),
    processData: false,
    global: false
  })
  .done(function (response) {

    try {

      const data = typeof response === "string"
        ? JSON.parse(response)
        : response;

      if (data && data.urlid) {

        // fecha modal antes de redirecionar
        const modal = document.getElementById("modalConfirmarEdicao");
        if (modal) modal.style.display = "none";

        // pequeno delay para garantir fechamento visual
        setTimeout(function(){

          window.location.href = "/Editar-Solicitacoes/?id=" + data.urlid;

        }, 200);

      } else {

        alert("Fluxo executado, mas não retornou urlID.");

      }

    } catch (e) {

      console.error("Erro ao interpretar retorno:", response);
      alert("Erro ao processar retorno do fluxo.");

    }

  })
  .fail(function (xhr) {

    console.error("❌ Flow editar solicitação falhou:", xhr);
    alert("Erro ao executar o fluxo.");

  })
  .always(function () {

    btn.dataset.executando = "false";
    btn.disabled = false;
    btn.innerText = "CONFIRMAR";

  });

};
(function () {

  const FLOW_URL =
  "/_api/cloudflow/v1.0/trigger/46fad9d8-5a18-f111-8341-7ced8da81546";

  let recordID = "";

  const wait = setInterval(function () {

    const modalConfirmar =
      document.getElementById("modalEditarComponentesConfirmacao");

    const modalSucesso =
      document.getElementById("modalEditarComponentesSucesso");

    const btnCancelar =
      document.getElementById("btnCancelarEditarComponentes");

    const btnConfirmar =
      document.getElementById("btnConfirmarEditarComponentes");

    const btnOk =
      document.getElementById("btnOkEditarComponentes");

    const btnFechar =
      document.getElementById("btnFecharEditarComponentes");

    if (
      !modalConfirmar ||
      !modalSucesso ||
      !btnCancelar ||
      !btnConfirmar ||
      !btnOk ||
      !window.shell ||
      typeof shell.ajaxSafePost !== "function"
    ) {
      return;
    }

    clearInterval(wait);

    // =============================
    // ABRIR MODAL
    // =============================
    document.addEventListener("click", function (e) {

      const btn = e.target.closest('[data-action="editar-componentes"]');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      recordID = btn.dataset.recordId;

      if (!recordID) {
        alert("ID da solicitação não encontrado.");
        return;
      }

      modalConfirmar.style.display = "flex";

    });

    // =============================
    // CANCELAR
    // =============================
    function fecharModal() {
      modalConfirmar.style.display = "none";
      recordID = "";
    }

    btnCancelar.addEventListener("click", fecharModal);
    btnFechar.addEventListener("click", fecharModal);

    // =============================
    // CONFIRMAR
    // =============================
    btnConfirmar.addEventListener("click", function () {

      if (btnConfirmar.dataset.executando === "true") return;

      btnConfirmar.dataset.executando = "true";
      btnConfirmar.disabled = true;

      const payload = {
        eventData: JSON.stringify({
          RecordID: recordID
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

        modalConfirmar.style.display = "none";
        modalSucesso.style.display = "flex";

      })

      .fail(function (xhr) {

        console.error("❌ Flow editar componentes falhou:", xhr);
        alert("Erro ao redefinir componentes.");

      })

      .always(function () {

        btnConfirmar.disabled = false;
        btnConfirmar.dataset.executando = "false";

      });

    });

    // =============================
    // OK → REDIRECIONAR
    // =============================
    btnOk.addEventListener("click", function () {

      modalSucesso.style.display = "none";

      if (!recordID) return;

      window.location.href =
        "/status-projeto/?id=" + recordID;

    });

  }, 200);

})();

(function () {
  const FLOW_URL = "/_api/cloudflow/v1.0/trigger/b90407c7-2827-f111-88b4-002248de77b7";

  let recordIDAtual = "";

  const modal = document.getElementById("modalAlterarCnpj");
  const modalSucesso = document.getElementById("modalSucessoAlterarCnpj");

  const btnFechar = document.getElementById("btnFecharAlterarCnpj");
  const btnCancelar = document.getElementById("btnCancelarAlterarCnpj");
  const btnSalvar = document.getElementById("btnSalvarAlterarCnpj");
  const btnOk = document.getElementById("btnOkSucessoAlterarCnpj");

  const inputCnpj = document.getElementById("inputCnpjConstrutora");
  const inputNome = document.getElementById("inputNomeConstrutora");
  const selectResp = document.getElementById("selectRespFaturamento");

  if (
    !modal || !modalSucesso || !btnFechar || !btnCancelar || !btnSalvar || !btnOk ||
    !inputCnpj || !inputNome || !selectResp
  ) {
    return;
  }

  function abrirModal(el) {
    if (el) el.style.display = "flex";
  }

  function fecharModal(el) {
    if (el) el.style.display = "none";
  }

  function fecharMenusAcoes() {
    document.querySelectorAll(".actions-wrap.open").forEach(el => {
      el.classList.remove("open");
      const btn = el.querySelector(".btn-ellipsis");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function apenasAlphaNum(valor) {
    return String(valor || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function apenasDigitos(valor) {
    return String(valor || "").replace(/\D/g, "");
  }

  function aplicarMascaraCNPJ(valor) {
    if (!valor) return "";

    valor = String(valor).toUpperCase().replace(/[^A-Z0-9]/g, "");
    valor = valor.substring(0, 14);

    if (valor.length > 12) {
      const base = valor.substring(0, 12);
      const dv = valor.substring(12, 14).replace(/\D/g, "");
      valor = base + dv;
    }

    let v = valor;
    v = v.replace(/^(.{2})(.)/, "$1.$2");
    v = v.replace(/^(.{2})\.(.{3})(.)/, "$1.$2.$3");
    v = v.replace(/^(.{2})\.(.{3})\.(.{3})(.)/, "$1.$2.$3/$4");
    v = v.replace(/^(.{2})\.(.{3})\.(.{3})\/(.{4})(.)/, "$1.$2.$3/$4-$5");

    return v;
  }

  function validarCNPJ(valor) {
    if (!valor) return false;

    let cnpj = String(valor).toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (cnpj.length !== 14) return false;

    if (/[A-Z]/.test(cnpj)) {
      const raiz = cnpj.substring(0, 8);
      const ordem = cnpj.substring(8, 12);
      const dv = cnpj.substring(12, 14);

      if (!/^[A-Z0-9]{8}$/.test(raiz)) return false;
      if (!/^[A-Z0-9]{4}$/.test(ordem)) return false;
      if (!/^[0-9]{2}$/.test(dv)) return false;

      return true;
    }

    cnpj = cnpj.replace(/\D/g, "");

    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros[tamanho - i]) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos[0]) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros[tamanho - i]) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado == digitos[1];
  }

  function mostrarErroCnpj(msg) {
    removerErroCnpj();
    inputCnpj.classList.add("is-invalid");
    inputCnpj.style.borderColor = "#dc3545";

    const erro = document.createElement("div");
    erro.className = "invalid-feedback d-block";
    erro.id = "erroCnpjConstrutora";
    erro.textContent = msg;

    inputCnpj.insertAdjacentElement("afterend", erro);
  }

  function removerErroCnpj() {
    inputCnpj.classList.remove("is-invalid");
    inputCnpj.style.borderColor = "";

    const erro = document.getElementById("erroCnpjConstrutora");
    if (erro) erro.remove();
  }

  function validarCampoCNPJ() {
    const valor = (inputCnpj.value || "").trim();

    if (!valor) {
      removerErroCnpj();
      return false;
    }

    if (!validarCNPJ(valor)) {
      mostrarErroCnpj("CNPJ inválido. Formato: 00.000.000/0000-00");
      return false;
    }

    removerErroCnpj();
    return true;
  }

  function formularioValido() {
    const nome = inputNome.value.trim();
    const resp = selectResp.value;
    const reuso = document.querySelector('input[name="reusoCnpjRadio"]:checked');

    return (
      validarCampoCNPJ() &&
      nome !== "" &&
      resp !== "" &&
      !!reuso
    );
  }

  function atualizarBotaoSalvar() {
    btnSalvar.disabled = !formularioValido();
  }

  function resetarFormularioAlterarCnpj() {
    inputCnpj.value = "";
    inputNome.value = "";
    selectResp.value = "";

    document.querySelectorAll('input[name="reusoCnpjRadio"]').forEach(radio => {
      radio.checked = false;
    });

    removerErroCnpj();
    btnSalvar.disabled = true;
  }

  function preencherFormulario() {
  inputCnpj.value = "";
  inputNome.value = "";
  selectResp.value = "";

  document.querySelectorAll('input[name="reusoCnpjRadio"]').forEach(radio => {
    radio.checked = false;
  });

  removerErroCnpj();
  btnSalvar.disabled = true;
}

  function explodirFogos(btn) {
    if (window.confetti) {
      confetti({
        particleCount: 180,
        spread: 110,
        origin: { y: 0.65 }
      });
      return;
    }

    let effectsLayer = document.querySelector(".effects-layer");
    if (!effectsLayer) {
      effectsLayer = document.createElement("div");
      effectsLayer.className = "effects-layer";
      document.body.appendChild(effectsLayer);
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 12;

    const cores = [
      "var(--brand-color)",
      "var(--secondary-color)",
      "#ffffff"
    ];

    for (let i = 0; i < 200; i++) {
      const pedaco = document.createElement("div");
      pedaco.className = "confetti";

      const angle = Math.random() * 2 * Math.PI;
      const distance = 100 + Math.random() * 340;

      pedaco.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      pedaco.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      pedaco.style.backgroundColor =
        cores[Math.floor(Math.random() * cores.length)];

      pedaco.style.left = `${x}px`;
      pedaco.style.top = `${y}px`;

      effectsLayer.appendChild(pedaco);
      setTimeout(() => pedaco.remove(), 1000);
    }
  }

  inputCnpj.addEventListener("input", function () {
    const cursorPos = this.selectionStart || 0;
    const valorAnterior = this.value;
    const valorFormatado = aplicarMascaraCNPJ(this.value);

    this.value = valorFormatado;

    const diff = valorFormatado.length - valorAnterior.length;
    try {
      this.setSelectionRange(cursorPos + diff, cursorPos + diff);
    } catch (e) {}

    removerErroCnpj();
    atualizarBotaoSalvar();
  });

  inputCnpj.addEventListener("blur", function () {
    validarCampoCNPJ();
    atualizarBotaoSalvar();
  });

  inputCnpj.addEventListener("change", function () {
    validarCampoCNPJ();
    atualizarBotaoSalvar();
  });

  inputCnpj.addEventListener("paste", function () {
    const campo = this;
    setTimeout(function () {
      campo.value = aplicarMascaraCNPJ(campo.value);
      validarCampoCNPJ();
      atualizarBotaoSalvar();
    }, 10);
  });

  inputNome.addEventListener("input", atualizarBotaoSalvar);
  selectResp.addEventListener("change", atualizarBotaoSalvar);

  document.querySelectorAll('input[name="reusoCnpjRadio"]').forEach(radio => {
    radio.addEventListener("change", atualizarBotaoSalvar);
  });

  document.addEventListener("click", function (e) {
    const btn = e.target.closest('[data-action="alterar-cnpj"]');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    recordIDAtual = btn.dataset.recordId || "";
    if (!recordIDAtual) {
      alert("ID da solicitação não encontrado.");
      return;
    }

    resetarFormularioAlterarCnpj();
    preencherFormulario();
    fecharMenusAcoes();
    abrirModal(modal);
  });

  btnFechar.addEventListener("click", function () {
    fecharModal(modal);
  });

  btnCancelar.addEventListener("click", function () {
    fecharModal(modal);
  });

  btnSalvar.addEventListener("click", function () {
    if (btnSalvar.dataset.executando === "true") return;
    if (!formularioValido()) return;

    const valorRadioReuso = document.querySelector('input[name="reusoCnpjRadio"]:checked');
    const valorCnpjDigitado = (inputCnpj.value || "").trim();

    const Cnpj = aplicarMascaraCNPJ(valorCnpjDigitado);
    const NomeConst = inputNome.value.trim();
    const RespFaturamento = String(selectResp.value);
    const ReusoCnpj = !!(valorRadioReuso && valorRadioReuso.value === "1");

    btnSalvar.dataset.executando = "true";
    btnSalvar.disabled = true;
    btnSalvar.innerText = "SALVANDO...";

    const payload = {
      eventData: JSON.stringify({
        RecordID: recordIDAtual,
        ReusoCnpj: ReusoCnpj,
        RespFaturamento: RespFaturamento,
        Cnpj: Cnpj,
        NomeConst: NomeConst
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
      fecharModal(modal);
      abrirModal(modalSucesso);
    })
    .fail(function (xhr) {
      console.error("❌ Flow Alterar para CNPJ falhou:", xhr);

      let detalhe = "";

      try {
        detalhe =
          (xhr.responseJSON && (xhr.responseJSON.error?.message || xhr.responseJSON.message)) ||
          xhr.responseText ||
          "";
      } catch (e) {}

      alert("Erro ao salvar as alterações." + (detalhe ? "\n\n" + detalhe : ""));
    })
    .always(function () {
      btnSalvar.dataset.executando = "false";
      btnSalvar.innerText = "SALVAR ALTERAÇÕES";
      atualizarBotaoSalvar();
    });
  });

  btnOk.addEventListener("click", function () {
    explodirFogos(btnOk);
    fecharModal(modalSucesso);

    setTimeout(function () {
      const url = new URL(window.location.href);
      url.searchParams.set("nocache", Date.now());
      window.location.replace(url.toString());
    }, 800);
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  const tabela = document.querySelector(".pp-table-wrapper table");
  if (!tabela) return;

  const tbody = tabela.querySelector("tbody");
  const linhas = Array.from(tbody.querySelectorAll("tr"));

  const estado = {
    finalidades: [],
    fases: [],
    status: [],
    dataInicio: "",
    dataFim: ""
  };

  const opcoesFiltroFase = document.getElementById("opcoesFiltroFase");
  const opcoesFiltroStatus = document.getElementById("opcoesFiltroStatus");

  const opcoesFiltroFinalidade = document.getElementById("opcoesFiltroFinalidade");
const resumoFiltroFinalidade = document.getElementById("resumoFiltroFinalidade");

  const resumoFiltroFase = document.getElementById("resumoFiltroFase");
  const resumoFiltroStatus = document.getElementById("resumoFiltroStatus");
  const resumoFiltroData = document.getElementById("resumoFiltroData");

  const tagsContainer = document.getElementById("filtrosAplicados");
  const qtdResultado = document.getElementById("qtdFiltroResultado");
  const btnLimparFiltros = document.getElementById("btnLimparFiltros");

 const painelFiltros = document.querySelector(".pp-filter-panel");
const btnToggleFiltros = document.getElementById("btnToggleFiltros");
const overlayFiltros = document.getElementById("ppFilterOverlay");
const btnFecharSlideFiltros = document.getElementById("btnFecharSlideFiltros");

function abrirSlideFiltros() {
  painelFiltros.classList.add("is-open");
  overlayFiltros?.classList.add("is-open");
  btnToggleFiltros.classList.add("is-active");
  btnToggleFiltros.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function fecharSlideFiltros(limpar = false) {
  painelFiltros.classList.remove("is-open");
  overlayFiltros?.classList.remove("is-open");
  btnToggleFiltros.classList.remove("is-active");
  btnToggleFiltros.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";

  fecharModais();

  if (limpar) {
    limparFiltros();
  }
}

if (btnToggleFiltros && painelFiltros) {
  btnToggleFiltros.addEventListener("click", function () {
    if (painelFiltros.classList.contains("is-open")) {
      fecharSlideFiltros(false);
    } else {
      abrirSlideFiltros();
    }
  });
}

btnFecharSlideFiltros?.addEventListener("click", function () {
  fecharSlideFiltros(false);
});

overlayFiltros?.addEventListener("click", function () {
  fecharSlideFiltros(false);
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && painelFiltros?.classList.contains("is-open")) {
    fecharSlideFiltros(false);
  }
});

  const modalDataInicio = document.getElementById("modalDataInicio");
  const modalDataFim = document.getElementById("modalDataFim");
  const modalDataSliderInicio = document.getElementById("modalDataSliderInicio");
const modalDataSliderFim = document.getElementById("modalDataSliderFim");

const datasDaTabela = linhas
  .map(l => normalizar(l.dataset.created))
  .filter(Boolean)
  .sort();

const dataMinTabela = datasDaTabela[0] || "";
const dataMaxTabela = datasDaTabela[datasDaTabela.length - 1] || "";
const totalDiasTabela = dataMinTabela && dataMaxTabela
  ? diferencaDias(dataMinTabela, dataMaxTabela)
  : 0;
  const textoSliderData = document.getElementById("textoSliderData");

  function normalizar(valor) {
    return (valor || "").trim();
  }

  function linhaPassaNosFiltros(linha, ignorarCampo = "") {
  const linhaFinalidade = normalizar(linha.dataset.finalidade);
  const linhaFase = normalizar(linha.dataset.fase);
  const linhaStatus = normalizar(linha.dataset.status);
  const linhaData = normalizar(linha.dataset.created);

  let exibir = true;

  if (ignorarCampo !== "finalidade" && estado.finalidades.length && !estado.finalidades.includes(linhaFinalidade)) exibir = false;
  if (ignorarCampo !== "fase" && estado.fases.length && !estado.fases.includes(linhaFase)) exibir = false;
  if (ignorarCampo !== "status" && estado.status.length && !estado.status.includes(linhaStatus)) exibir = false;

if (ignorarCampo !== "data" && estado.dataInicio && linhaData < estado.dataInicio) exibir = false;
if (ignorarCampo !== "data" && estado.dataFim && linhaData > estado.dataFim) exibir = false;

  return exibir;
}

function valoresUnicos(campo) {
  return [...new Set(
    linhas
      .filter(linha => linhaPassaNosFiltros(linha, campo))
      .map(linha => normalizar(linha.dataset[campo]))
      .filter(v => v && v !== "-")
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

  function obterStatusDisponiveis() {
  return valoresUnicos("status");
}

  function renderizarCheckboxes(container, valores, selecionados, name) {
    container.innerHTML = "";

    valores.forEach(valor => {
      const id = `${name}_${valor.replace(/\W+/g, "_")}`;

      const label = document.createElement("label");
      label.className = "pp-filter-check";
      label.innerHTML = `
        <input type="checkbox" value="${valor}" ${selecionados.includes(valor) ? "checked" : ""}>
        <span>${valor}</span>
      `;

      container.appendChild(label);
    });
  }

  function lerSelecionados(container) {
    return Array.from(container.querySelectorAll("input:checked")).map(i => i.value);
  }

  function abrirModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (id === "modalFiltroFase") {
  renderizarCheckboxes(
    opcoesFiltroFase,
    valoresUnicos("fase"),
    estado.fases,
    "fase"
  );
}

if (id === "modalFiltroStatus") {
  renderizarCheckboxes(
    opcoesFiltroStatus,
    valoresUnicos("status"),
    estado.status,
    "status"
  );
}

if (id === "modalFiltroFinalidade") {
  renderizarCheckboxes(
    opcoesFiltroFinalidade,
    valoresUnicos("finalidade"),
    estado.finalidades,
    "finalidade"
  );
}

if (id === "modalFiltroData") {
  prepararLimitesDataFiltrada();

  modalDataInicio.value = estado.dataInicio || modalDataInicio.min;
  modalDataFim.value = estado.dataFim || modalDataFim.max;

  sincronizarSliderComInputs();
}

    modal.style.display = "flex";
  }

  function fecharModais() {
    document.querySelectorAll(".pp-filter-modal-backdrop").forEach(modal => {
      modal.style.display = "none";
    });
  }

  function formatarDataBR(dataISO) {
    if (!dataISO) return "";
    const partes = dataISO.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function diferencaDias(dataInicio, dataFim) {
  const ini = new Date(dataInicio + "T00:00:00");
  const fim = new Date(dataFim + "T00:00:00");
  return Math.round((fim - ini) / 86400000);
}

function somarDias(dataISO, dias) {
  const data = new Date(dataISO + "T00:00:00");
  data.setDate(data.getDate() + Number(dias));
  return data.toISOString().slice(0, 10);
}

function prepararLimitesDataFiltrada() {
  const datasFiltradas = linhas
    .filter(linha => linhaPassaNosFiltros(linha, "data"))
    .map(linha => normalizar(linha.dataset.created))
    .filter(Boolean)
    .sort();

  const minFiltrado = datasFiltradas[0] || dataMinTabela;
  const maxFiltrado = datasFiltradas[datasFiltradas.length - 1] || dataMaxTabela;

  modalDataInicio.min = minFiltrado;
  modalDataInicio.max = maxFiltrado;
  modalDataFim.min = minFiltrado;
  modalDataFim.max = maxFiltrado;

  modalDataSliderInicio.min = 0;
  modalDataSliderInicio.max = diferencaDias(minFiltrado, maxFiltrado);
  modalDataSliderFim.min = 0;
  modalDataSliderFim.max = diferencaDias(minFiltrado, maxFiltrado);

  modalDataInicio.dataset.minAtual = minFiltrado;
}

function prepararLimitesData() {
  if (!dataMinTabela || !dataMaxTabela) return;

  modalDataInicio.min = dataMinTabela;
  modalDataInicio.max = dataMaxTabela;
  modalDataFim.min = dataMinTabela;
  modalDataFim.max = dataMaxTabela;

  modalDataSliderInicio.min = 0;
  modalDataSliderInicio.max = totalDiasTabela;
  modalDataSliderFim.min = 0;
  modalDataSliderFim.max = totalDiasTabela;
}

function sincronizarInputsComSlider() {
  const dataBase = modalDataInicio.dataset.minAtual || dataMinTabela;
  if (!dataBase) return;

  let inicio = Number(modalDataSliderInicio.value);
  let fim = Number(modalDataSliderFim.value);

  if (inicio > fim) {
    const temp = inicio;
    inicio = fim;
    fim = temp;
  }

  modalDataSliderInicio.value = inicio;
  modalDataSliderFim.value = fim;

  modalDataInicio.value = somarDias(dataBase, inicio);
  modalDataFim.value = somarDias(dataBase, fim);

  atualizarTextoSlider();
  atualizarRangeFill();
  atualizarZIndexSliders();
}



function sincronizarSliderComInputs() {
  const dataBase = modalDataInicio.dataset.minAtual || dataMinTabela;
  if (!dataBase) return;

  const inicio = modalDataInicio.value || modalDataInicio.min;
  const fim = modalDataFim.value || modalDataFim.max;

  modalDataSliderInicio.value = diferencaDias(dataBase, inicio);
  modalDataSliderFim.value = diferencaDias(dataBase, fim);

  atualizarTextoSlider();
  atualizarRangeFill();
}

function atualizarRangeFill() {

  const fill = document.getElementById("rangeFillData");
  if (!fill) return;

  const min = Number(modalDataSliderInicio.min);
  const max = Number(modalDataSliderInicio.max);

  if (max <= min) {
    fill.style.left = "0%";
    fill.style.width = "100%";
    return;
  }

  const start = Number(modalDataSliderInicio.value);
  const end = Number(modalDataSliderFim.value);

  const left = ((start - min) / (max - min)) * 100;
  const right = ((end - min) / (max - min)) * 100;

  fill.style.left = left + "%";
  fill.style.width = (right - left) + "%";

  atualizarRangeCustom();
}

  function criarTag(tipo, label, valor) {
    const tag = document.createElement("span");
    tag.className = "pp-filter-tag";
    tag.innerHTML = `${label}: ${valor} <button type="button" data-remove="${tipo}" data-value="${valor}">×</button>`;
    tagsContainer.appendChild(tag);
  }

  function atualizarResumoBotoes() {
    resumoFiltroFinalidade.textContent = estado.finalidades.length ? `${estado.finalidades.length} selecionada(s)` : "Todas";
    resumoFiltroFase.textContent = estado.fases.length ? `${estado.fases.length} selecionada(s)` : "Todas";
    resumoFiltroStatus.textContent = estado.status.length ? `${estado.status.length} selecionado(s)` : "Todos";

    if (estado.dataInicio && estado.dataFim) {
      resumoFiltroData.textContent = `${formatarDataBR(estado.dataInicio)} até ${formatarDataBR(estado.dataFim)}`;
    } else if (estado.dataInicio) {
      resumoFiltroData.textContent = `A partir de ${formatarDataBR(estado.dataInicio)}`;
    } else if (estado.dataFim) {
      resumoFiltroData.textContent = `Até ${formatarDataBR(estado.dataFim)}`;
    } else {
      resumoFiltroData.textContent = "Todas";
    }
  }

  function atualizarTags() {
  tagsContainer.innerHTML = "";

  estado.finalidades.forEach(finalidade => criarTag("finalidade", "Finalidade", finalidade));
  estado.fases.forEach(fase => criarTag("fase", "Fase", fase));
  estado.status.forEach(status => criarTag("status", "Status", status));

  if (estado.dataInicio) criarTag("dataInicio", "De", formatarDataBR(estado.dataInicio));
  if (estado.dataFim) criarTag("dataFim", "Até", formatarDataBR(estado.dataFim));

  const temFiltro =
    estado.finalidades.length > 0 ||
    estado.fases.length > 0 ||
    estado.status.length > 0 ||
    !!estado.dataInicio ||
    !!estado.dataFim;

  btnLimparFiltros.classList.toggle("is-hidden", !temFiltro);

  document.querySelector('[data-clear-field="finalidade"]')?.classList.toggle("has-filter", estado.finalidades.length > 0);  
  document.querySelector('[data-clear-field="fase"]')?.classList.toggle("has-filter", estado.fases.length > 0);
  document.querySelector('[data-clear-field="status"]')?.classList.toggle("has-filter", estado.status.length > 0);
  document.querySelector('[data-clear-field="data"]')?.classList.toggle("has-filter", !!estado.dataInicio || !!estado.dataFim);
}



function filtrarTabela() {
  let totalVisivel = 0;

  linhas.forEach(linha => {
    const linhaFinalidade = normalizar(linha.dataset.finalidade);
    const linhaFase = normalizar(linha.dataset.fase);
    const linhaStatus = normalizar(linha.dataset.status);
    const linhaData = normalizar(linha.dataset.created);

    let exibir = true;

    if (estado.finalidades.length && !estado.finalidades.includes(linhaFinalidade)) exibir = false;
    if (estado.fases.length && !estado.fases.includes(linhaFase)) exibir = false;
    if (estado.status.length && !estado.status.includes(linhaStatus)) exibir = false;
    if (estado.dataInicio && linhaData < estado.dataInicio) exibir = false;
    if (estado.dataFim && linhaData > estado.dataFim) exibir = false;

    linha.style.display = exibir ? "" : "none";
    if (exibir) totalVisivel++;
  });

  atualizarResumoBotoes();
  atualizarTags();

  qtdResultado.textContent =
    totalVisivel === 1
      ? "1 solicitação encontrada."
      : `${totalVisivel} solicitações encontradas.`;
sincronizarCardsComTabela();
  controlarMensagemVazia(totalVisivel);
}


  function controlarMensagemVazia(totalVisivel) {
    let msg = document.getElementById("msgFiltroVazio");

    if (totalVisivel === 0) {
      if (!msg) {
        msg = document.createElement("tr");
        msg.id = "msgFiltroVazio";
        msg.innerHTML = `
          <td colspan="42">
            <div class="pp-empty-filter">
              Nenhuma solicitação encontrada com os filtros selecionados.
            </div>
          </td>
        `;
        tbody.appendChild(msg);
      }
    } else if (msg) {
      msg.remove();
    }
  }

  function limparFiltros() {
    estado.finalidades = [];
    estado.fases = [];
    estado.status = [];
    estado.dataInicio = "";
    estado.dataFim = "";
    filtrarTabela();
  }

  function atualizarTextoSlider() {
    if (modalDataInicio.value && modalDataFim.value) {
      textoSliderData.textContent =
        `${formatarDataBR(modalDataInicio.value)} até ${formatarDataBR(modalDataFim.value)}`;
    } else {
      textoSliderData.textContent = "Intervalo completo";
    }
  }

  document.querySelectorAll(".pp-filter-open").forEach(btn => {
    btn.addEventListener("click", function () {
      abrirModal(this.dataset.modal);
    });
  });

  document.querySelectorAll(".pp-close-filter-modal").forEach(btn => {
    btn.addEventListener("click", fecharModais);
  });

  document.querySelectorAll(".pp-filter-modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", function (e) {
      if (e.target === this) fecharModais();
    });
  });

  document.getElementById("btnAplicarFase").addEventListener("click", function () {
    estado.fases = lerSelecionados(opcoesFiltroFase);

    const statusDisponiveis = obterStatusDisponiveis();
    estado.status = estado.status.filter(s => statusDisponiveis.includes(s));

    fecharModais();
    filtrarTabela();
  });

  document.getElementById("btnAplicarStatus").addEventListener("click", function () {
    estado.status = lerSelecionados(opcoesFiltroStatus);
    fecharModais();
    filtrarTabela();
  });

  document.getElementById("btnAplicarFinalidade").addEventListener("click", function () {
  estado.finalidades = lerSelecionados(opcoesFiltroFinalidade);
  fecharModais();
  filtrarTabela();
});

  document.getElementById("btnAplicarData").addEventListener("click", function () {
    estado.dataInicio = modalDataInicio.value || "";
    estado.dataFim = modalDataFim.value || "";
    fecharModais();
    filtrarTabela();
  });

  modalDataInicio.addEventListener("change", atualizarTextoSlider);
  modalDataFim.addEventListener("change", atualizarTextoSlider);

const rangeDataCustom = document.getElementById("rangeDataCustom");
const thumbDataInicio = document.getElementById("thumbDataInicio");
const thumbDataFim = document.getElementById("thumbDataFim");

let thumbAtivo = null;

function atualizarRangeCustom() {
  const max = Number(modalDataSliderInicio.max || 0);
  const inicio = Number(modalDataSliderInicio.value || 0);
  const fim = Number(modalDataSliderFim.value || 0);

  if (!rangeDataCustom || max <= 0) return;

  const pctInicio = (inicio / max) * 100;
  const pctFim = (fim / max) * 100;

  thumbDataInicio.style.left = pctInicio + "%";
  thumbDataFim.style.left = pctFim + "%";

  rangeFillData.style.left = pctInicio + "%";
  rangeFillData.style.width = (pctFim - pctInicio) + "%";
}

function moverThumbPorEvento(e) {
  if (!thumbAtivo || !rangeDataCustom) return;

  e.preventDefault();

  const rect = rangeDataCustom.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

  const max = Number(modalDataSliderInicio.max || 0);
  let valor = Math.round(pct * max);

  const inicio = Number(modalDataSliderInicio.value || 0);
  const fim = Number(modalDataSliderFim.value || 0);

  if (thumbAtivo === "inicio") {
    valor = Math.min(valor, fim);
    modalDataSliderInicio.value = valor;
  }

  if (thumbAtivo === "fim") {
    valor = Math.max(valor, inicio);
    modalDataSliderFim.value = valor;
  }

  sincronizarInputsComSlider();
  atualizarRangeCustom();
}

rangeDataCustom.addEventListener("pointerdown", function (e) {
  e.preventDefault();

  const rect = rangeDataCustom.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const max = Number(modalDataSliderInicio.max || 0);
  const valorClique = Math.round(pct * max);

  const inicio = Number(modalDataSliderInicio.value || 0);
  const fim = Number(modalDataSliderFim.value || 0);

  const distInicio = Math.abs(valorClique - inicio);
  const distFim = Math.abs(valorClique - fim);

  thumbAtivo = distInicio <= distFim ? "inicio" : "fim";

  if (thumbAtivo === "inicio") {
    thumbDataInicio.style.zIndex = "7";
    thumbDataFim.style.zIndex = "6";
  } else {
    thumbDataInicio.style.zIndex = "6";
    thumbDataFim.style.zIndex = "7";
  }

  rangeDataCustom.setPointerCapture(e.pointerId);

  moverThumbPorEvento(e);
});

rangeDataCustom.addEventListener("pointermove", moverThumbPorEvento);

rangeDataCustom.addEventListener("pointerup", function () {
  thumbAtivo = null;
});

rangeDataCustom.addEventListener("pointercancel", function () {
  thumbAtivo = null;
});

modalDataSliderFim.addEventListener("input", function () {
  atualizarZIndexSliders("fim");
  sincronizarInputsComSlider();
});

modalDataInicio.addEventListener("change", sincronizarSliderComInputs);
modalDataFim.addEventListener("change", sincronizarSliderComInputs);

  btnLimparFiltros.addEventListener("click", limparFiltros);
document.querySelectorAll(".pp-filter-mini-clear").forEach(btn => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const campo = this.dataset.clearField;

    if (campo === "finalidade") {
      estado.finalidades = [];
    }

    if (campo === "fase") {
      estado.fases = [];
      estado.status = [];
    }

    if (campo === "status") {
      estado.status = [];
    }

    if (campo === "data") {
      estado.dataInicio = "";
      estado.dataFim = "";
    }

    filtrarTabela();
  });
});
  tagsContainer.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;

    const tipo = btn.dataset.remove;
    const valor = btn.dataset.value;
    if (tipo === "finalidade") {
  estado.finalidades = estado.finalidades.filter(f => f !== valor);
}

    if (tipo === "fase") {
      estado.fases = estado.fases.filter(f => f !== valor);

      const statusDisponiveis = obterStatusDisponiveis();
      estado.status = estado.status.filter(s => statusDisponiveis.includes(s));
    }

    if (tipo === "status") {
      estado.status = estado.status.filter(s => s !== valor);
    }

    if (tipo === "dataInicio") estado.dataInicio = "";
    if (tipo === "dataFim") estado.dataFim = "";

    filtrarTabela();
  });


const tableWrapper = document.querySelector(".pp-table-wrapper");
const cardsGallery = document.getElementById("ppCardsGallery");
const btnViewLista = document.getElementById("btnViewLista");
const btnViewCards = document.getElementById("btnViewCards");
const cardsGalleryWrapper = document.getElementById("ppCardsGalleryWrapper");

const modalVisualizar = document.getElementById("modalVisualizarLinha");
const conteudoVisualizar = document.getElementById("conteudoVisualizarLinha");
const btnFecharVisualizar = document.getElementById("btnFecharVisualizarLinha");
const btnFecharVisualizarRodape = document.getElementById("btnFecharVisualizarLinhaRodape");

function obterValorPorTitulo(linha, titulo) {
  const headers = Array.from(tabela.querySelectorAll("thead th"));
  const index = headers.findIndex(th => {
    const label = th.querySelector(".th-label");
    return label && label.textContent.trim().toUpperCase() === titulo.toUpperCase();
  });

  if (index < 0) return "-";
  return linha.children[index]?.innerText.trim() || "-";
}

function calcularObservacaoConclusaoObra(dataTexto, fase, status) {
  if (!dataTexto || dataTexto === "-") return "";

  const statusAtual = String(status || "").toUpperCase().trim();



  let dataLimpa = String(dataTexto).trim().split(" ")[0];
  let dataPrevista;

  if (dataLimpa.includes("/")) {
    const p = dataLimpa.split("/");
    dataPrevista = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
  } else if (dataLimpa.includes("-")) {
    const p = dataLimpa.split("-");
    dataPrevista = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  } else {
    return "";
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataPrevista.setHours(0, 0, 0, 0);

  const diffDias = Math.ceil((dataPrevista - hoje) / 86400000);
  if (isNaN(diffDias)) return "";

  if (diffDias < 0) {
    const atraso = Math.abs(diffDias);

    return `
      <div class="pp-card-observacao pp-card-observacao-atraso">
        <strong>Observação:</strong> A previsão de conclusão da obra está atrasada há ${atraso} ${atraso === 1 ? "dia" : "dias"}.
      </div>
    `;
  }

  return `
    <div class="pp-card-observacao">
      <strong>Observação:</strong> Faltam ${diffDias} ${diffDias === 1 ? "dia" : "dias"} para conclusão prevista da obra.
    </div>
  `;
}

function somenteDataBR(dataTexto) {
  if (!dataTexto || dataTexto === "-") return "Não informada";

  return String(dataTexto).trim().split(" ")[0];
}

function montarCards() {
  if (!cardsGallery) return;

  cardsGallery.innerHTML = "";

  linhas.forEach((linha, index) => {
    if (linha.id === "msgFiltroVazio") return;

    const protocolo = obterValorPorTitulo(linha, "PROTOCOLO");
    const nome = obterValorPorTitulo(linha, "NOME EMPREENDIMENTO");
    const finalidade = obterValorPorTitulo(linha, "FINALIDADE EMPREENDIMENTO");
    const fase = obterValorPorTitulo(linha, "FASE");
    const status = obterValorPorTitulo(linha, "STATUS ATUAL");
    const criado = obterValorPorTitulo(linha, "CRIADO EM");
    const dataPrevFimObra = obterValorPorTitulo(linha, "DATA PREV. FIM OBRA");
    const dataPrevFimObraFormatada = somenteDataBR(dataPrevFimObra);
    const observacaoConclusao = calcularObservacaoConclusaoObra(dataPrevFimObra, fase, status);

    const card = document.createElement("div");
    card.className = "pp-request-card";
    card.dataset.rowIndex = index;

    const actionsOriginal = linha.querySelector(".actions-wrap");
    const actionsClone = actionsOriginal ? actionsOriginal.cloneNode(true) : "";

    card.innerHTML = `
      <div class="pp-card-title-row">
        <h4>${protocolo}</h4>
        <span class="pp-card-finalidade">${finalidade}</span>
      </div>

      <div class="pp-card-info">
        <div><strong>Empreendimento:</strong> ${nome}</div>
        <div><strong>Fase Atual:</strong> ${fase}</div>
        <div><strong>Status:</strong> ${status}</div>
        <div><strong>Criado em:</strong> ${criado}</div>
        <div><strong>Conclusão da obra prevista em:</strong> ${dataPrevFimObraFormatada}</div>
      </div>

      <div class="pp-card-footer-row">
        <div class="pp-card-created">
          ${observacaoConclusao}
        </div>

        <div class="pp-card-actions">
          <div class="pp-card-options"></div>

        <button type="button"
        class="btn-ellipsis has-tooltip pp-card-view-btn"
        data-tooltip="Visualizar solicitação"
        data-row-index="${index}"
        aria-label="Visualizar solicitação">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
</svg>
</button>
            </div>
    </div>
  `;

 if (actionsClone) {
  const menu = actionsClone.querySelector(".actions-menu");
  const destino = card.querySelector(".pp-card-options");

  if (menu && destino) {
    const statusItem = menu.querySelector('.am-item[data-action="status"]');
    const outrasOpcoes = Array.from(menu.querySelectorAll(".am-item"))
      .filter(item => item.dataset.action !== "status");

    if (statusItem) {
  const btnStatus = statusItem.cloneNode(true);

  const btnOriginalTresPontos = actionsClone.querySelector(".btn-ellipsis");

  const urlStatus = btnOriginalTresPontos
    ? btnOriginalTresPontos.getAttribute("data-status-url")
    : "";

  const recordId = btnOriginalTresPontos
    ? btnOriginalTresPontos.getAttribute("data-record-id")
    : statusItem.getAttribute("data-record-id");

  const statusValue = btnOriginalTresPontos
    ? btnOriginalTresPontos.getAttribute("data-status-value")
    : statusItem.getAttribute("data-status-value");

  btnStatus.classList.remove("am-item");
  btnStatus.classList.add("pp-card-action-icon", "has-tooltip");

  btnStatus.setAttribute("data-action", "status");
  btnStatus.setAttribute("data-tooltip", "Ver Status");
  btnStatus.setAttribute("aria-label", "Ver Status");

  if (urlStatus) {
    btnStatus.setAttribute("data-status-url", urlStatus);
  }

  if (recordId) {
    btnStatus.setAttribute("data-record-id", recordId);
  }

  if (statusValue) {
    btnStatus.setAttribute("data-status-value", statusValue);
  }

  btnStatus.innerHTML = "📝";
  destino.appendChild(btnStatus);
}

    if (outrasOpcoes.length > 0) {
      const moreWrap = document.createElement("div");
      moreWrap.className = "pp-card-more-wrap";

      const btnMore = document.createElement("button");
      btnMore.type = "button";
      btnMore.className = "pp-card-more-btn has-tooltip";
      btnMore.setAttribute("data-tooltip", "Mais opções");
      btnMore.setAttribute("aria-label", "Mais opções");
      btnMore.innerHTML = "⋯";

      const dropdown = document.createElement("div");
      dropdown.className = "pp-card-more-menu";

      outrasOpcoes.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add("pp-card-more-item");
        dropdown.appendChild(clone);
      });

      moreWrap.appendChild(btnMore);
      moreWrap.appendChild(dropdown);
      destino.appendChild(moreWrap);
    }
  }
}

    cardsGallery.appendChild(card);
  });

  sincronizarCardsComTabela();
}

function sincronizarCardsComTabela() {
  if (!cardsGallery) return;

  cardsGallery.querySelectorAll(".pp-request-card").forEach(card => {
    const index = Number(card.dataset.rowIndex);
    const linha = linhas[index];

    card.style.display =
      !linha || linha.style.display === "none"
        ? "none"
        : "";
  });
}

function alternarVisualizacao(tipo) {
  const usarCards = tipo === "cards";
 
   
  tableWrapper.classList.toggle("is-hidden", usarCards);
  cardsGalleryWrapper.classList.toggle("is-hidden", !usarCards);

  btnViewLista.classList.toggle("is-active", !usarCards);
  btnViewCards.classList.toggle("is-active", usarCards);

  document.querySelector(".pp-view-toggle")?.classList.toggle("is-cards", usarCards);

  if (usarCards) sincronizarCardsComTabela();
}

function aplicarVisualizacaoResponsiva() {
  const isMobile = window.matchMedia("(max-width: 640px)").matches;

  if (isMobile) {
    alternarVisualizacao("cards");
    return;
  }

  // No PC, sempre deixa o usuário escolher no toggle.
  // Abre inicialmente em lista.
  alternarVisualizacao("lista");
}

aplicarVisualizacaoResponsiva();

window.addEventListener("resize", aplicarVisualizacaoResponsiva);
function abrirModalVisualizar(index) {
  const linha = linhas[index];
  if (!linha || !conteudoVisualizar) return;

  const headers = Array.from(tabela.querySelectorAll("thead th"));
  conteudoVisualizar.innerHTML = "";

  const tipoCadastro = obterValorPorTitulo(linha, "TIPO CADASTRO").toUpperCase().trim();

  const ocultarSeCpf = [
    "NOME CONSTRUTORA",
    "CNPJ CONSTRUTORA",
    "RESPONSÁVEL FATURAMENTO"
  ];

  headers.forEach((th, i) => {
    const label = th.querySelector(".th-label");
    const titulo = label ? label.textContent.trim() : "";

    if (!titulo) return;

    if (tipoCadastro === "CPF" && ocultarSeCpf.includes(titulo.toUpperCase())) {
      return;
    }

    const valor = linha.children[i]?.innerText.trim() || "";

    if (!valor || valor === "-") return;

    const item = document.createElement("div");
    item.className = "pp-view-item";
    item.innerHTML = `
      <span>${titulo}</span>
      <strong>${valor}</strong>
    `;

    conteudoVisualizar.appendChild(item);
  });

  modalVisualizar.style.display = "flex";
}

function fecharModalVisualizar() {
  modalVisualizar.style.display = "none";
}

if (btnViewLista && btnViewCards) {
  btnViewLista.addEventListener("click", () => alternarVisualizacao("lista"));
  btnViewCards.addEventListener("click", () => alternarVisualizacao("cards"));
}

if (cardsGallery) {
  cardsGallery.addEventListener("click", function (e) {
    const btn = e.target.closest(".pp-card-view-btn");

      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      abrirModalVisualizar(Number(btn.dataset.rowIndex));
        });
      }

document.addEventListener("click", function (e) {
  const btnMore = e.target.closest(".pp-card-more-btn");

  if (btnMore) {
    e.preventDefault();
    e.stopPropagation();

    const wrap = btnMore.closest(".pp-card-more-wrap");
    const estavaAberto = wrap.classList.contains("is-open");

    document.querySelectorAll(".pp-card-more-wrap.is-open")
      .forEach(el => el.classList.remove("is-open"));

    if (!estavaAberto) {
      wrap.classList.add("is-open");
    }

    return;
  }

  if (!e.target.closest(".pp-card-more-wrap")) {
    document.querySelectorAll(".pp-card-more-wrap.is-open")
      .forEach(el => el.classList.remove("is-open"));
  }
});
      
      if (cardsGallery) {
  cardsGallery.addEventListener("click", function (e) {
    if (e.target.closest(".pp-card-more-btn")) return;

    const btn = e.target.closest(".pp-card-action-icon");
          if (!btn) return;

          e.preventDefault();
          e.stopPropagation();

          const action = btn.dataset.action;
          const card = btn.closest(".pp-request-card");
          const index = Number(card?.dataset.rowIndex);
          const linha = linhas[index];

          if (!linha || !action) return;

          const itemOriginal = linha.querySelector(`.am-item[data-action="${action}"]`);

          if (!itemOriginal) {
            console.warn("Ação original não encontrada:", action);
            return;
          }

          itemOriginal.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window
            })
          );
        });
      }
  


if (modalVisualizar) {
  modalVisualizar.addEventListener("click", function (e) {
    if (e.target === modalVisualizar) fecharModalVisualizar();
  });

  btnFecharVisualizar?.addEventListener("click", fecharModalVisualizar);
  btnFecharVisualizarRodape?.addEventListener("click", fecharModalVisualizar);
}

montarCards();

  filtrarTabela();
});

(function () {
  const FLOW_URL = "/_api/cloudflow/v1.0/trigger/7be5052b-ed4a-f111-bec7-7ced8da81546";

  let recordIDSelecionado = "";

  const wait = setInterval(function () {
    const modalConfirmar = document.getElementById("modalCancelarOrcamentoProjeto");
    const modalSucesso = document.getElementById("modalSucessoCancelarOrcamentoProjeto");

    const btnFechar = document.getElementById("btnFecharCancelarOrcamentoProjeto");
    const btnCancelar = document.getElementById("btnCancelarCancelarOrcamentoProjeto");
    const btnConfirmar = document.getElementById("btnConfirmarCancelarOrcamentoProjeto");
    const btnOk = document.getElementById("btnOkCancelarOrcamentoProjeto");

    if (
      !modalConfirmar ||
      !modalSucesso ||
      !btnFechar ||
      !btnCancelar ||
      !btnConfirmar ||
      !btnOk ||
      !window.shell ||
      typeof shell.ajaxSafePost !== "function"
    ) {
      return;
    }

    clearInterval(wait);

    function abrirModal(el) {
      el.style.display = "flex";
    }

    function fecharModal(el) {
      el.style.display = "none";
    }

    function fecharMenus() {
      document.querySelectorAll(".actions-wrap.open").forEach(function (el) {
        el.classList.remove("open");
      });
    }

    document.addEventListener("click", function (e) {
      const btn = e.target.closest('[data-action="cancelar-orcamento-enviar-projeto"]');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      recordIDSelecionado = btn.dataset.recordId || "";

      if (!recordIDSelecionado) {
        alert("ID da solicitação não encontrado.");
        return;
      }

      fecharMenus();
      abrirModal(modalConfirmar);
    });

    function cancelar() {
      fecharModal(modalConfirmar);
      recordIDSelecionado = "";
    }

    btnFechar.addEventListener("click", cancelar);
    btnCancelar.addEventListener("click", cancelar);

    btnConfirmar.addEventListener("click", function () {
      if (btnConfirmar.dataset.executando === "true") return;

      if (!recordIDSelecionado) {
        alert("ID da solicitação não encontrado.");
        return;
      }

      btnConfirmar.dataset.executando = "true";
      btnConfirmar.disabled = true;

      const textoOriginal = btnConfirmar.innerText;
      btnConfirmar.innerText = "PROCESSANDO...";

      const payload = {
        eventData: JSON.stringify({
          RecordId: recordIDSelecionado
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
          fecharModal(modalConfirmar);
          abrirModal(modalSucesso);
        })
        .fail(function (xhr) {
          console.error("❌ Erro ao executar flow:", xhr);
          alert("Erro ao cancelar o pedido de orçamento.");
        })
        .always(function () {
          btnConfirmar.dataset.executando = "false";
          btnConfirmar.disabled = false;
          btnConfirmar.innerText = textoOriginal;
        });
    });

    btnOk.addEventListener("click", function () {
      fecharModal(modalSucesso);

      const url = new URL(window.location.href);
      url.searchParams.set("nocache", Date.now());
      window.location.replace(url.toString());
    });
  }, 200);
})();


(function () {

  function fecharMenusOpcoes() {
    document.querySelectorAll(".actions-wrap.open").forEach(function (wrap) {
      wrap.classList.remove("open");

      const btn = wrap.querySelector(".btn-ellipsis");
      if (btn) {
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function estaDentroDoMenuOuBotao(el) {
    return !!(
      el.closest(".actions-wrap") ||
      el.closest(".actions-menu") ||
      el.closest(".btn-ellipsis")
    );
  }

  function estaDentroDaLista(el) {
    return !!el.closest(".pp-table-wrapper");
  }

  /*
    Fecha quando o mouse vai para qualquer área fora:
    - título da página
    - cards superiores
    - botões baixar/filtrar
    - fundo da página
    - cabeçalho externo
  */
  document.addEventListener("mousemove", function (e) {
    const alvo = e.target;

    if (estaDentroDoMenuOuBotao(alvo)) return;

    if (!estaDentroDaLista(alvo)) {
      fecharMenusOpcoes();
    }
  });

  /*
    Fecha também quando passa o mouse no cabeçalho da tabela
    ou em uma linha diferente sem estar no menu.
  */
  document.addEventListener("mouseover", function (e) {
    const alvo = e.target;

    if (estaDentroDoMenuOuBotao(alvo)) return;

    if (
      alvo.closest(".pp-table-wrapper thead") ||
      alvo.closest(".pp-list-actions") ||
      alvo.closest(".pp-filter-tags-row") ||
      alvo.closest(".sectionBlockLayout")
    ) {
      fecharMenusOpcoes();
    }
  });

  /*
    Fecha ao rolar a tabela ou a página.
  */
  document.addEventListener("scroll", function () {
    fecharMenusOpcoes();
  }, true);

})();