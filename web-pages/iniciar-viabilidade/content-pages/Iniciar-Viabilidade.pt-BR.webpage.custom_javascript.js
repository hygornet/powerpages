 document.addEventListener("DOMContentLoaded", function () {
  const STORAGE_KEY = "aegea_unidade_selecionada";
  const midImage = document.getElementById("midImageUnidade");

  if (!midImage) return;

  function getSelectedUnit() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "default";
    } catch (e) {
      return "default";
    }
  }

  const unidadeSelecionada = getSelectedUnit();
  const defaultMidImage = midImage.getAttribute("data-default-mid-image") || "";

  if (!unidadeSelecionada || unidadeSelecionada.toLowerCase() === "default") {
    midImage.src = defaultMidImage;
    return;
  }

  const imageMap = {
    "águas de guariroba": "/centro_guariroba.png",
    "aguas de guariroba": "/centro_guariroba.png",

    "águas de manaus": "/centro_manaus.png",
    "aguas de manaus": "/centro_manaus.png",

    "águas do pará": "/centro_para.png",
    "aguas do para": "/centro_para.png",
    "águas do para": "/centro_para.png",
    "aguas do pará": "/centro_para.png",

    "prolagos": "/centro_prolagos.png",

    "corsan": "/corsan-centralized.png"
  };

  const key = String(unidadeSelecionada).trim().toLowerCase();

  if (imageMap[key]) {
    midImage.src = imageMap[key];
  } else {
    midImage.src = defaultMidImage;
  }
});
// =============================
// LOCALIZAR BOTÃO ENVIAR DO FORM
// =============================
function getSubmitFormAtual() {
  const container = document.querySelector(".power-pages-form-container");
  if (!container) return null;

  return container.querySelector("#UpdateButton")
      || container.querySelector("#InsertButton")
      || container.querySelector('input[id$="UpdateButton"]')
      || container.querySelector('input[id$="InsertButton"]')
      || container.querySelector('button[type="submit"]')
      || container.querySelector('input[type="submit"]');
}

// =============================
// PAGE REQUEST MANAGER
// =============================
function getPRM() {
  try {
    if (
      window.Sys &&
      Sys.WebForms &&
      Sys.WebForms.PageRequestManager
    ) {
      return Sys.WebForms.PageRequestManager.getInstance();
    }
  } catch (e) {}
  return null;
}

// =============================
// EXISTE ERRO NO FORM?
// =============================
function formTemErro() {
  const container = document.querySelector(".power-pages-form-container");
  if (!container) return false;

  const resumoErro = container.querySelector(
    ".validation-summary-errors, .alert-danger, .notification.error"
  );

  if (
    resumoErro &&
    resumoErro.innerText &&
    resumoErro.innerText.trim().length > 0 &&
    (resumoErro.offsetWidth > 0 || resumoErro.offsetHeight > 0)
  ) {
    return true;
  }

  const campoErro = container.querySelector(
    ".input-validation-error, .field-validation-error, .has-error"
  );

  return !!campoErro;
}

// =============================
// RESTAURA POSIÇÃO SEM SUBIR
// =============================
function restaurarScroll(posY) {
  window.scrollTo({
    top: posY,
    behavior: "auto"
  });
}

// =============================
// FOCA O PRIMEIRO CAMPO COM ERRO
// =============================
function focarPrimeiroCampoComErroSemScroll(posY) {
  const container = document.querySelector(".power-pages-form-container");
  if (!container) return;

  let alvo =
    container.querySelector("input.input-validation-error, select.input-validation-error, textarea.input-validation-error")
    || container.querySelector(".has-error input, .has-error select, .has-error textarea");

  if (!alvo) return;

  try {
    alvo.focus({ preventScroll: true });
  } catch (e) {
    alvo.focus();
    restaurarScroll(posY);
  }
}

// =============================
// HELPERS DAS REGRAS
// =============================
function normalizarTexto(texto) {
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function obterElementoCampo(selector) {
  return document.querySelector(selector);
}

function obterTextoCampo(selector) {
  const el = obterElementoCampo(selector);
  if (!el) return "";

  if (el.tagName === "SELECT") {
    const opt = el.options[el.selectedIndex];
    return opt ? (opt.text || "") : "";
  }

  return el.value || el.getAttribute("value") || "";
}

function obterNumeroCampo(selector) {
  const el = obterElementoCampo(selector);
  if (!el) return 0;

  let valor = (el.value || "").toString().trim();
  if (!valor) return 0;

  valor = valor.replace(/[^\d,.-]/g, "");

  if (valor.indexOf(",") > -1) {
    valor = valor.replace(/\./g, "").replace(",", ".");
  }

  const numero = parseFloat(valor);
  return isNaN(numero) ? 0 : numero;
}

function obterBooleanRadio(baseId) {
  let radioMarcado = null;

  const container = document.getElementById(baseId);
  if (container) {
    radioMarcado = container.querySelector("input[type='radio']:checked");
  }

  if (!radioMarcado) {
    radioMarcado = document.querySelector("#" + baseId + " input[type='radio']:checked");
  }

  if (!radioMarcado) {
    radioMarcado = document.querySelector("input[name='" + baseId + "']:checked");
  }

  if (!radioMarcado) return false;

  const valor = normalizarTexto(radioMarcado.value);
  return valor === "TRUE" || valor === "1" || valor === "SIM" || valor === "YES";
}

// =============================
// VALIDAÇÃO VISUAL DOS CAMPOS OBRIGATÓRIOS
// SEM SUBMETER O FORM
// =============================
function campoVisivel(el) {
  if (!el) return false;

  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function obterCamposObrigatoriosVisiveis() {
  const container = document.querySelector(".power-pages-form-container");
  if (!container) return [];

  let campos = Array.from(
    container.querySelectorAll(
      "input[required], select[required], textarea[required], .required input, .required select, .required textarea"
    )
  );

  campos = campos.filter(function (el, index, arr) {
    return arr.indexOf(el) === index && campoVisivel(el);
  });

  return campos;
}

function campoObrigatorioPreenchido(el) {
  if (!el || el.disabled) return true;

  const tipo = (el.type || "").toLowerCase();
  const tag = (el.tagName || "").toLowerCase();

  if (tipo === "radio") {
    const nome = el.name;
    if (!nome) return !!el.checked;

    const radios = document.querySelectorAll('input[type="radio"][name="' + nome + '"]');
    return Array.from(radios).some(function (r) { return r.checked; });
  }

  if (tipo === "checkbox") {
    return el.checked;
  }

  if (tag === "select") {
    const valor = (el.value || "").trim();
    return valor !== "" && valor !== "null";
  }

  const valor = (el.value || "").trim();

if (
  el.id === "cloud_consumo_mensal" ||
  el.id === "cloud_area_construida_total" ||
  el.id === "cloud_volume_agua_processo" ||
  el.id === "cloud_numero_economias"
) {
  const somenteNumeros = valor.replace(/\D/g, "");
  return somenteNumeros !== "" && parseInt(somenteNumeros, 10) > 0;
}
  

return valor !== "";
}

function numeroEconomiasMaiorQueZero() {
  const campoEconomias = document.querySelector("#cloud_numero_economias");

  if (!campoEconomias) return true;

  const valor = (campoEconomias.value || "").toString().trim();

  if (!valor) return false;

  const somenteNumeros = valor.replace(/\D/g, "");
  const numero = parseInt(somenteNumeros, 10);

  return !isNaN(numero) && numero > 0;
}


function todosObrigatoriosPreenchidos() {
    if (!numeroEconomiasMaiorQueZero()) {
    return false;
  }
  const finalidadeId = document.querySelector("#cloud_fk_finalidades_solicitacao");
  const finalidadeNome = document.querySelector("#cloud_fk_finalidades_solicitacao_name");
  

  const municipioId = document.querySelector("#cloud_fk_municipios");
  const municipioNome = document.querySelector("#cloud_fk_municipios_name");

  const finalidadeOk =
    !!(
      (finalidadeId && finalidadeId.value && finalidadeId.value.trim() !== "") ||
      (finalidadeNome && finalidadeNome.value && finalidadeNome.value.trim() !== "")
    );

  const municipioOk =
    !!(
      (municipioId && municipioId.value && municipioId.value.trim() !== "") ||
      (municipioNome && municipioNome.value && municipioNome.value.trim() !== "")
    );

  if (!finalidadeOk || !municipioOk) {
    return false;
  }

  const campos = obterCamposObrigatoriosVisiveis();

  if (!campos.length) return false;

  for (let i = 0; i < campos.length; i++) {
    if (!campoObrigatorioPreenchido(campos[i])) {
      return false;
    }
  }

  return true;
}
function atualizarEstadoBotaoAvancar() {
  const btnNext = document.getElementById("btnNext");
  if (!btnNext) return;

  if (btnNext.dataset.processing === "true") return;

  const habilitar = todosObrigatoriosPreenchidos();

  btnNext.disabled = !habilitar;

  if (habilitar) {
    btnNext.classList.remove("btn-cloud-disabled");
  } else {
    btnNext.classList.add("btn-cloud-disabled");
  }
}

function marcarBotaoComoProcessando() {
  const btnNext = document.getElementById("btnNext");
  if (!btnNext) return;

  btnNext.dataset.processing = "true";
  btnNext.disabled = true;
  btnNext.classList.remove("btn-cloud-disabled");
  btnNext.classList.add("btn-cloud-processing");
  btnNext.textContent = "PROCESSANDO...";
}

function restaurarBotaoAvancar() {
  const btnNext = document.getElementById("btnNext");
  if (!btnNext) return;

  btnNext.dataset.processing = "false";
  btnNext.classList.remove("btn-cloud-processing");
  btnNext.textContent = "AVANÇAR";
  atualizarEstadoBotaoAvancar();
}

// =============================
// VALIDA FORM ANTES DE SEGUIR
// =============================
function validarFormAntesDeSeguir(scrollAntes) {
  let valido = true;

  try {
    if (typeof window.entityFormClientValidate === "function") {
      valido = window.entityFormClientValidate();
    } else if (typeof window.Page_ClientValidate === "function") {
      valido = window.Page_ClientValidate();
    }
  } catch (e) {
    valido = true;
  }

  if (valido === false || formTemErro()) {
    restaurarScroll(scrollAntes);

    setTimeout(function () {
      focarPrimeiroCampoComErroSemScroll(scrollAntes);
      restaurarScroll(scrollAntes);
    }, 20);

    return false;
  }

  return true;
}

// =============================
// REGRAS DE NEGÓCIO - GRANDE CLIENTE
// =============================
function avaliarRegraGrandeCliente() {
  const finalidade = normalizarTexto(
    obterTextoCampo("#cloud_fk_finalidades_solicitacao_name") ||
    obterTextoCampo("#cloud_fk_finalidades_solicitacao")
  );

  const tipoCadastro = normalizarTexto(
    obterTextoCampo("#cloud_tipo_cadastro")
  );

  const consumoMensal = obterNumeroCampo("#cloud_consumo_mensal");
  const numeroEconomias = parseInt(obterNumeroCampo("#cloud_numero_economias"), 10) || 0;
  const areaConstruidaTotal = obterNumeroCampo("#cloud_area_construida_total");
  const isConglomeradoEmpresarial = obterBooleanRadio("cloud_is_conglomerado_empresarial");

  const regrasDisparadas = [];

  const regraFinalidadeGrande =
    finalidade.indexOf("CONDOMINIO") > -1 ||
    finalidade.indexOf("LOTEAMENTO RESIDENCIAL") > -1 ||
    finalidade.indexOf("LOTEAMENTO INDUSTRIAL") > -1 ||
    finalidade.indexOf("INDUSTRIAL") > -1 ||
    finalidade.indexOf("INSTITUCIONAL") > -1;

  if (regraFinalidadeGrande) {
    regrasDisparadas.push("Finalidade enquadrada como grande cliente");
  }

  const regraCnpjConsumo =
    tipoCadastro === "CNPJ" &&
    consumoMensal >= 100;

  if (regraCnpjConsumo) {
    regrasDisparadas.push("CNPJ com consumo mensal >= 100");
  }

  const regraConsumo = consumoMensal > 100;
  if (regraConsumo) {
    regrasDisparadas.push("Consumo mensal > 100");
  }

  const regraNumeroEconomias = numeroEconomias >= 10;
  if (regraNumeroEconomias) {
    regrasDisparadas.push("Número de economias >= 10");
  }

  const regraNumeroEconomiasEConsumo =
    numeroEconomias >= 1 &&
    consumoMensal >= 100;

  if (regraNumeroEconomiasEConsumo) {
    regrasDisparadas.push("Número de economias >= 1 com consumo mensal >= 100");
  }

  const regraAreaConstruida = areaConstruidaTotal > 750;
  if (regraAreaConstruida) {
    regrasDisparadas.push("Área construída total > 750");
  }

  const regraComercialConglomerado =
    finalidade.indexOf("COMERCIAL") > -1 &&
    isConglomeradoEmpresarial === true;

  if (regraComercialConglomerado) {
    regrasDisparadas.push("Finalidade comercial com conglomerado empresarial");
  }

  const isGrandeCliente =
    regraFinalidadeGrande ||
    regraCnpjConsumo ||
    regraConsumo ||
    regraNumeroEconomias ||
    regraNumeroEconomiasEConsumo ||
    regraAreaConstruida ||
    regraComercialConglomerado;

  return {
    isGrandeCliente: isGrandeCliente,
    regrasDisparadas: regrasDisparadas,
    dados: {
      finalidade: finalidade,
      tipoCadastro: tipoCadastro,
      consumoMensal: consumoMensal,
      numeroEconomias: numeroEconomias,
      areaConstruidaTotal: areaConstruidaTotal,
      isConglomeradoEmpresarial: isConglomeradoEmpresarial
    }
  };
}

// =============================
// OBSERVAR MUDANÇAS NO FORM
// =============================
function registrarEventosDeValidacao() {
  const container = document.querySelector(".power-pages-form-container");
  if (!container) return;

  container.addEventListener("input", function () {
    atualizarEstadoBotaoAvancar();
  });

  container.addEventListener("change", function () {
    atualizarEstadoBotaoAvancar();
  });

  container.addEventListener("keyup", function () {
    atualizarEstadoBotaoAvancar();
  });

  setInterval(function () {
    atualizarEstadoBotaoAvancar();
  }, 800);
}

// =============================
// BOTÃO AVANÇAR
// =============================
document.addEventListener("DOMContentLoaded", function () {
  const btnNext = document.getElementById("btnNext");
  if (!btnNext) return;

  registrarEventosDeValidacao();

  setTimeout(function () {
    atualizarEstadoBotaoAvancar();
  }, 500);

  setTimeout(function () {
    atualizarEstadoBotaoAvancar();
  }, 1200);

  btnNext.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (btnNext.disabled || btnNext.dataset.processing === "true") {
      return;
    }

    const submitButton = getSubmitFormAtual();

    if (!submitButton) {
      console.warn("Botão de envio do formulário não encontrado.");
      return;
    }

    const scrollAntes = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (!validarFormAntesDeSeguir(scrollAntes)) {
      restaurarBotaoAvancar();
      return;
    }

    const resultado = avaliarRegraGrandeCliente();
    console.log("Resultado regra Grande Cliente:", resultado);

    // NÃO É GRANDE CLIENTE -> redireciona sem salvar
    if (!resultado.isGrandeCliente) {
      marcarBotaoComoProcessando();
      window.location.href = "/unidade-de-servico/";
      return;
    }

    // É GRANDE CLIENTE -> processa e salva
    marcarBotaoComoProcessando();

    const prm = getPRM();

    setTimeout(function () {
      if (formTemErro()) {
        restaurarScroll(scrollAntes);
        setTimeout(function () {
          focarPrimeiroCampoComErroSemScroll(scrollAntes);
        }, 20);
        restaurarBotaoAvancar();
      }
    }, 80);

    if (prm) {
      const handler = function () {
        prm.remove_endRequest(handler);

        if (formTemErro()) {
          restaurarScroll(scrollAntes);

          setTimeout(function () {
            focarPrimeiroCampoComErroSemScroll(scrollAntes);
            restaurarScroll(scrollAntes);
          }, 20);

          restaurarBotaoAvancar();
        }
      };

      prm.add_endRequest(handler);
    }

    submitButton.click();
  });
});
