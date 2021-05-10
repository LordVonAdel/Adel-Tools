window.MDL = require('source-mdl');
window.Buffer = require('buffer/').Buffer;
window.Struct = require('structron');
window.JSZip = require('jszip');
window.DXTN = require('dxtn');

window.onload = async function() {
  let toolId = location.href.split("=")[1];

  if (!toolId) toolId = "home";

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

  await Tool.loadScript("./tools/" + toolId + ".js");
  document.getElementById("spinner").classList.add("hidden");
}