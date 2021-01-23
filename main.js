window.MDL = require('source-mdl');
window.Buffer = require('buffer/').Buffer;
window.Struct = require('structron');
window.JSZip = require('jszip');

window.onload = async function() {
  const toolId = location.href.split("=")[1] || "Home";
  const toolIndexQuery = await fetch("./tools.json");
  window.toolIndex = await toolIndexQuery.json();

  if (!(toolId in window.toolIndex)) {
    const main = document.getElementById("main");
    main.innerText = "Error! Tool not found!"
    main.classList.add("error");
    document.getElementById("spinner").classList.add("hidden");
    return;
  }

  document.getElementById("title").innerText = "Adel Tools - " + window.toolIndex[toolId].name;

  let script = document.createElement("script");
  script.src = "./tools/" + toolId + ".js";
  document.head.appendChild(script);
  script.onload = function() {
    document.getElementById("spinner").classList.add("hidden");
  }
}