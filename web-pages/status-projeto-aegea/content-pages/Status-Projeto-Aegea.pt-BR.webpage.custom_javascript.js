



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


/* =====================================================
   ATUALIZAR INFORMAÇÕES FSA
   ===================================================== */
(function configurarAtualizacaoFsa() {

  const FLOW_ATUALIZAR_FSA =
    "/_api/cloudflow/v1.0/trigger/b9a1abc5-d0df-f011-8543-000d3a5ae560";

  function el(id) {
    return document.getElementById(id);
  }

  function abrirModal(modal) {
    if (!modal) {
      return;
    }

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function fecharModal(modal) {
    if (!modal) {
      return;
    }

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  function valor(id) {
    const campo = el(id);

    return campo
      ? String(campo.value || "").trim()
      : "";
  }

  function formatarCpf(valorCampo) {
    const numeros = String(valorCampo || "")
      .replace(/\D/g, "")
      .slice(0, 11);

    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }


  function iniciar() {

    const btnAbrir =
      el("btnAtualizarSolicitacao");

    const modalFormulario =
      el("modalAtualizarDadosFsa");

    const form =
      el("formAtualizarDadosFsa");

    const btnFechar =
      el("btnFecharModalAtualizarDados");

    const btnCancelar =
      el("btnCancelarAtualizacaoFsa");

    const btnSalvar =
      el("btnSalvarAtualizacaoFsa");

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

    if (
      btnAbrir.dataset.fsaConfigurado === "true"
    ) {
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

const blocoDadosComplementares =
  el("blocoDadosComplementaresFsa");

const inputDataPrevisao =
  el("fsaDataPrevisao");



/* =====================================================
   MÁSCARAS
   ===================================================== */

function formatarCpf(valorCampo) {

  const numeros =
    String(valorCampo || "")
      .replace(/\D/g, "")
      .slice(0, 11);

  return numeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}


function formatarRg(valorCampo) {

  return String(valorCampo || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 11);
}


function formatarCnpj(valorCampo) {

  let texto =
    String(valorCampo || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 14);

  /*
    Os 12 primeiros caracteres podem ser
    letras ou números.

    Os dois últimos, referentes aos dígitos
    verificadores, precisam ser números.
  */
  if (texto.length > 12) {

    const base =
      texto.substring(0, 12);

    const digitos =
      texto
        .substring(12, 14)
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
   VALIDAÇÃO DO CPF
   ===================================================== */

function validarCpfFsa(valorCampo) {

  const cpf =
    String(valorCampo || "")
      .replace(/\D/g, "");

  if (
    cpf.length !== 11 ||
    /^(\d)\1+$/.test(cpf)
  ) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let primeiroDigito =
    11 - (soma % 11);

  if (primeiroDigito >= 10) {
    primeiroDigito = 0;
  }

  if (
    primeiroDigito !== Number(cpf[9])
  ) {
    return false;
  }

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  let segundoDigito =
    11 - (soma % 11);

  if (segundoDigito >= 10) {
    segundoDigito = 0;
  }

  return (
    segundoDigito === Number(cpf[10])
  );
}


/* =====================================================
   VALIDAÇÃO DO RG
   ===================================================== */

function validarRgFsa(valorCampo) {

  const rg =
    String(valorCampo || "")
      .trim()
      .toUpperCase();

  return /^[A-Z0-9]{2,11}$/.test(rg);
}


/* =====================================================
   VALIDAÇÃO DO CNPJ
   ===================================================== */
function validarCnpjFsa(valorCampo) {

  const cnpj =
    String(valorCampo || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  if (cnpj.length !== 14) {
    return false;
  }

  /*
    Os 12 primeiros caracteres podem ser
    letras ou números.

    Os dois últimos precisam ser números.
  */
  const base =
    cnpj.substring(0, 12);

  const digitos =
    cnpj.substring(12, 14);

  if (
    !/^[A-Z0-9]{12}$/.test(base) ||
    !/^\d{2}$/.test(digitos)
  ) {
    return false;
  }

  /*
    Caso tenha alguma letra, aceita o formato
    alfanumérico depois de validar estrutura
    e tamanho.
  */
  if (/[A-Z]/.test(base)) {
    return true;
  }

  /*
    A partir daqui, o CNPJ é exclusivamente
    numérico e terá os dígitos validados.
  */
  if (/^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  let tamanho =
    cnpj.length - 2;

  let numeros =
    cnpj.substring(0, tamanho);

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


/* =====================================================
   VERIFICA SE O CAMPO ESTÁ VISÍVEL
   ===================================================== */

function campoEstaVisivelNoBloco(campo) {

  if (
    !campo ||
    campo.disabled ||
    campo.type === "hidden"
  ) {
    return false;
  }

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

  return (
    elementoAtual ===
    blocoDadosComplementares
  );
}


/* =====================================================
   EXIBE OU REMOVE A MENSAGEM DE ERRO
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

  campo.setCustomValidity(
    mensagem || ""
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


/* =====================================================
   VALIDA A DATA
   A data deve ser posterior ao dia atual
   ===================================================== */

function validarDataPrevisaoFsa() {

  if (!inputDataPrevisao) {
    return true;
  }

  const valor =
    String(
      inputDataPrevisao.value || ""
    ).trim();

  let dataInvalida = false;

  if (valor) {

    const partes =
      valor.split("-").map(Number);

    if (partes.length !== 3) {

      dataInvalida = true;

    } else {

      const dataSelecionada =
        new Date(
          partes[0],
          partes[1] - 1,
          partes[2]
        );

      dataSelecionada.setHours(
        0,
        0,
        0,
        0
      );

      const hoje = new Date();

      hoje.setHours(
        0,
        0,
        0,
        0
      );

      dataInvalida =
        dataSelecionada <= hoje;
    }
  }

  definirErroDocumento(
    inputDataPrevisao,
    dataInvalida
      ? "Não pode selecionar uma data menor ou igual ao dia de hoje."
      : ""
  );

  return !dataInvalida;
}


/* =====================================================
   VALIDA CPF, RG, CNPJ E FATURAMENTO
   ===================================================== */

function validarCamposEspecificosFsa() {

  let tudoValido = true;

  if (
    inputCpf &&
    campoEstaVisivelNoBloco(inputCpf)
  ) {

    const cpf =
      String(inputCpf.value || "").trim();

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
      tudoValido = false;
    }
  }

  if (
    inputRg &&
    campoEstaVisivelNoBloco(inputRg)
  ) {

    const rg =
      String(inputRg.value || "").trim();

    const rgInvalido =
      rg !== "" &&
      !validarRgFsa(rg);

    definirErroDocumento(
      inputRg,
      rgInvalido
        ? "RG inválido. Use somente letras e números."
        : ""
    );

    if (rgInvalido) {
      tudoValido = false;
    }
  }

  if (
    inputCnpj &&
    campoEstaVisivelNoBloco(inputCnpj)
  ) {

    const cnpj =
      String(inputCnpj.value || "").trim();

    const cnpjInvalido =
      cnpj !== "" &&
      !validarCnpjFsa(cnpj);

    definirErroDocumento(
      inputCnpj,
      cnpjInvalido
        ? "CNPJ inválido."
        : ""
    );

    if (cnpjInvalido) {
      tudoValido = false;
    }
  }

  if (
    selectRespFaturamento &&
    campoEstaVisivelNoBloco(
      selectRespFaturamento
    )
  ) {

    const naoSelecionado =
      String(
        selectRespFaturamento.value || ""
      ).trim() === "";

    definirErroDocumento(
      selectRespFaturamento,
      naoSelecionado
        ? "Selecione uma opção da lista"
        : ""
    );

    if (naoSelecionado) {
      tudoValido = false;
    }
  }

  if (!validarDataPrevisaoFsa()) {
    tudoValido = false;
  }

  return tudoValido;
}


/* =====================================================
   VERIFICA PREENCHIMENTO DOS OBRIGATÓRIOS
   ===================================================== */

function campoObrigatorioPreenchido(campo) {

  if (
    campo.type === "checkbox" ||
    campo.type === "radio"
  ) {
    return campo.checked;
  }

  return (
    String(campo.value || "").trim() !== ""
  );
}


/* =====================================================
   HABILITA OU DESABILITA O BOTÃO SALVAR
   ===================================================== */

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
    ).filter(function (campo) {

      return (
        !campo.disabled &&
        campoEstaVisivelNoBloco(campo)
      );
    });

  const obrigatoriosPreenchidos =
    camposObrigatorios.every(
      campoObrigatorioPreenchido
    );

    const camposObrigatoriosVisiveis =
  Array.from(
    blocoDadosComplementares.querySelectorAll(
      "input[required], " +
      "select[required], " +
      "textarea[required]"
    )
  ).filter(function (campo) {
    return campoEstaVisivelNoBloco(campo);
  });
  
  const camposValidos =
    validarCamposEspecificosFsa();

  const podeSalvar =
    obrigatoriosPreenchidos &&
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
}


/* =====================================================
   CONFIGURA AS MÁSCARAS
   ===================================================== */

function configurarCampo(
  campo,
  funcaoMascara
) {

  if (!campo) {
    return;
  }

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

  campo.addEventListener(
    "blur",
    atualizarEstadoBotaoSalvarFsa
  );
}


configurarCampo(
  inputCpf,
  formatarCpf
);

configurarCampo(
  inputRg,
  formatarRg
);

configurarCampo(
  inputCnpj,
  formatarCnpj
);


/* =====================================================
   ACOMPANHA TODOS OS CAMPOS DO BLOCO
   ===================================================== */

blocoDadosComplementares
  ?.querySelectorAll(
    "input, select, textarea"
  )
  .forEach(function (campo) {

    campo.addEventListener(
      "input",
      atualizarEstadoBotaoSalvarFsa
    );

    campo.addEventListener(
      "change",
      atualizarEstadoBotaoSalvarFsa
    );

    campo.addEventListener(
      "blur",
      atualizarEstadoBotaoSalvarFsa
    );
  });


/* Primeira validação */
atualizarEstadoBotaoSalvarFsa();



    if (inputCpf) {
      inputCpf.value =
        formatarCpf(inputCpf.value);

      inputCpf.addEventListener(
        "input",
        function () {
          this.value =
            formatarCpf(this.value);
        }
      );
    }

    if (inputCnpj) {
      inputCnpj.value =
        formatarCnpj(inputCnpj.value);

      inputCnpj.addEventListener(
        "input",
        function () {
          this.value =
            formatarCnpj(this.value);
        }
      );
    }

    btnAbrir.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        abrirModal(modalFormulario);
      }
    );

    function cancelarFormulario(event) {

      event?.preventDefault();
      event?.stopPropagation();

      form.reset();

      if (inputCpf) {
        inputCpf.value =
          formatarCpf(inputCpf.value);
      }

      if (inputCnpj) {
        inputCnpj.value =
          formatarCnpj(inputCnpj.value);
      }

      fecharModal(modalConfirmacao);
      fecharModal(modalFormulario);

      document.body.style.removeProperty(
        "overflow"
      );
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

        if (
          btnConfirmar.dataset.executando ===
          "true"
        ) {
          return;
        }

        const recordID =
          el("pp-recordid")?.value ||
          new URLSearchParams(
            window.location.search
          ).get("id") ||
          "";

        if (!recordID) {
          alert(
            "ID da solicitação não encontrado."
          );

          return;
        }

        if (
          !window.shell ||
          typeof shell.ajaxSafePost !==
            "function"
        ) {
          alert(
            "Contexto de segurança não disponível."
          );

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

        btnConfirmar.dataset.executando =
          "true";

        btnConfirmar.disabled = true;

        btnConfirmar.innerText =
          "PROCESSANDO...";

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
              statusText: xhr?.statusText,
              responseText: xhr?.responseText
            }
          );

          alert(
            "Não foi possível atualizar as informações. " +
            "Verifique a execução do fluxo e tente novamente."
          );

        })
        .always(function () {

          btnConfirmar.dataset.executando =
            "false";

          btnConfirmar.disabled = false;

          btnConfirmar.innerText =
            textoOriginal;

        });
      }
    );

    btnOk?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        btnOk.disabled = true;
        btnOk.innerText = "ATUALIZANDO...";

        fecharModal(modalSucesso);
        fecharModal(modalConfirmacao);
        fecharModal(modalFormulario);

        document.body.style.removeProperty(
          "overflow"
        );

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
          modalConfirmacao?.style.display ===
          "flex"
        ) {
          fecharModal(modalConfirmacao);
          return;
        }

        if (
          modalFormulario?.style.display ===
          "flex"
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

/* =====================================================
   AVANÇAR ETAPA
   ===================================================== */
(function configurarAvancoEtapa() {

  const FLOW_AVANCAR_ETAPA =
    "/_api/cloudflow/v1.0/trigger/46fad9d8-5a18-f111-8341-7ced8da81546";

  function el(id) {
    return document.getElementById(id);
  }

  function abrirModal(id) {
    const modal = el(id);

    if (modal) {
      modal.style.display = "flex";
    }
  }

  function fecharModal(id) {
    const modal = el(id);

    if (modal) {
      modal.style.display = "none";
    }
  }

  function iniciarAvancoEtapa() {

    const btnAvancar =
      el("btnAvancarEtapa");

    const btnCancelar =
      el("btnCancelarAvancoEtapa");

    const btnConfirmar =
      el("btnConfirmarAvancoEtapa");

    const btnOk =
      el("btnOkAvancoEtapa");

    if (!btnAvancar) {
      return;
    }

    if (
      btnAvancar.dataset.configurado ===
      "true"
    ) {
      return;
    }

    btnAvancar.dataset.configurado =
      "true";

    btnAvancar.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        abrirModal(
          "modalConfirmarAvancoEtapa"
        );
      }
    );

    btnCancelar?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        fecharModal(
          "modalConfirmarAvancoEtapa"
        );
      }
    );

    btnConfirmar?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        if (
          btnConfirmar.dataset.executando ===
          "true"
        ) {
          return;
        }

        const recordID =
          el("pp-recordid")?.value ||
          new URLSearchParams(
            window.location.search
          ).get("id") ||
          "";

        if (!recordID) {
          alert(
            "ID da solicitação não encontrado."
          );

          return;
        }

        if (
          !window.shell ||
          typeof shell.ajaxSafePost !==
            "function"
        ) {
          alert(
            "Contexto de segurança não disponível."
          );

          return;
        }

        const textoOriginal =
          btnConfirmar.innerText;

        btnConfirmar.dataset.executando =
          "true";

        btnConfirmar.disabled = true;

        btnConfirmar.innerText =
          "PROCESSANDO...";

        const payload = {
          eventData: JSON.stringify({
            RecordID: recordID
          })
        };

        shell.ajaxSafePost({
          type: "POST",
          contentType: "application/json",
          url: FLOW_AVANCAR_ETAPA,
          data: JSON.stringify(payload),
          processData: false,
          global: false
        })
        .done(function () {

          fecharModal(
            "modalConfirmarAvancoEtapa"
          );

          abrirModal(
            "modalSucessoAvancoEtapa"
          );

        })
        .fail(function (xhr) {

          console.error(
            "Erro ao avançar etapa:",
            {
              status: xhr?.status,
              statusText: xhr?.statusText,
              responseText: xhr?.responseText
            }
          );

          alert(
            "Não foi possível avançar a etapa."
          );

        })
        .always(function () {

          btnConfirmar.dataset.executando =
            "false";

          btnConfirmar.disabled = false;

          btnConfirmar.innerText =
            textoOriginal;

        });
      }
    );

    btnOk?.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        btnOk.disabled = true;
        btnOk.innerText =
          "ATUALIZANDO...";

        fecharModal(
          "modalSucessoAvancoEtapa"
        );

        fecharModal(
          "modalConfirmarAvancoEtapa"
        );

        window.location.reload();
      }
    );
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      iniciarAvancoEtapa
    );

  } else {

    iniciarAvancoEtapa();

  }

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