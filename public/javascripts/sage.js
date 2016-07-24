
"use strict";

window.onload = setup;

function setup() {
  var sageButtons = document.getElementById("test_request");
  sageButtons.onclick = sageRequest;
}

function sageAjax(input, func) {
  var server = "http://aleph.sagemath.org/service";
  var formData = new FormData();
  formData.append("code", input);
  var ajax = new XMLHttpRequest();
  ajax.onreadystatechange = func;
  ajax.open("POST", server, true);
  ajax.send(formData);
}

function sageRequest() {
  // alert("called");
  // var selected = this.className.charAt(this.className.length - 1);
  // var sage_input = document.querySelector(".sage " + selected).value;
  sageAjax("print diff(sin(x^2), x, 6)", displayAns);
}

function displayAns() {
  alert(this.responseText);
}


