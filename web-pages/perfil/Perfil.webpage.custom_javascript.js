/*
<script>
$(document).ready(function() {
    var varEndereco = localStorage.getItem("end");
    if (varEndereco) {
        $("#address1_line1").val(varEndereco);
        console.log("Endereço aplicado: " + varEndereco);
    } else {
        console.log("Nada no localStorage");
    }
    localStorage.clear();
});
</script>
*/
<script>
(function () {

  function onlyNumbers(v) {
    return String(v || "").replace(/\D/g, "");
  }

  function maskPhone(v) {
    v = onlyNumbers(v).substring(0, 11);

    if (v.length <= 2) return v;
    if (v.length <= 7) return "(" + v.substring(0, 2) + ") " + v.substring(2);

    return "(" + v.substring(0, 2) + ") " +
      v.substring(2, 7) + "-" +
      v.substring(7, 11);
  }

  function maskCep(v) {
    v = onlyNumbers(v).substring(0, 8);

    if (v.length <= 5) return v;

    return v.substring(0, 5) + "-" + v.substring(5, 8);
  }

  function aplicarMascaras() {
    var tel = document.getElementById("telephone1");
    var cep = document.getElementById("address1_postalcode");

    if (!tel && !cep) {
      setTimeout(aplicarMascaras, 500);
      return;
    }

    if (tel && !tel.dataset.maskApplied) {
      tel.dataset.maskApplied = "true";
      tel.setAttribute("maxlength", "15");
      tel.setAttribute("inputmode", "numeric");

      tel.addEventListener("input", function () {
        this.value = maskPhone(this.value);
      });

      tel.value = maskPhone(tel.value);
    }

    if (cep && !cep.dataset.maskApplied) {
      cep.dataset.maskApplied = "true";
      cep.setAttribute("maxlength", "9");
      cep.setAttribute("inputmode", "numeric");

      cep.addEventListener("input", function () {
        this.value = maskCep(this.value);
      });

      cep.value = maskCep(cep.value);
    }
  }

  document.addEventListener("DOMContentLoaded", aplicarMascaras);
  window.addEventListener("load", aplicarMascaras);
  setTimeout(aplicarMascaras, 1000);

})();
</script>