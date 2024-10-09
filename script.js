let y = 0;
let autoRotateInterval, mouseMoveTimeout;
const sensitivity = 0.9,
  touchSensitivity = 0.05;
const fusifyTag = document.querySelector("fusifytag");
const dataItems = JSON.parse(getValue("data-items", fusifyTag.attributes));
const autoSpeed = getValue("auto-speed", fusifyTag.attributes) || 100;
const resetTimeout =
  parseInt(getValue("reset-timeout", fusifyTag.attributes)) || 3000;
const autoRotationMultiplier =
  (getValue("rotation-direction", fusifyTag.attributes) || "right") === "right"
    ? 1
    : -1;

function makeHTML() {
  const faces = ["front", "back", "left", "right"]
    .map(
      (side, index) => `
    <a href="${
      dataItems[index].link
    }" class="side ${side}" target="_blank" style="background-color:${
        dataItems[index]["background-color"]
      }; background-size:${
        dataItems[index]["background-size"]
      }; background-position:${dataItems[index]["background-position"]};">
      <div style="width:100%; height:100%;">${getContent(
        dataItems[index]["content"]
      )}</div>
    </a>`
    )
    .join("");
  fusifyTag.innerHTML = `<div class="cube">${faces}</div>`;
  addButtonsToFace();
}

function getContent(content) {
  return content
    .map(
      (item) => `
    <${item.type} src="${item.path}" style="position:absolute; top:${
        item.top
      }; left:${item.left}; width:${item.width}; height:${item.height};" ${
        item.type === "video" ? "controls" : ""
      }>
    </${item.type}>`
    )
    .join("");
}

function addButtonsToFace() {
  const frontFace = document.querySelector(".front");
  ["play-pause-button", "sound-button"].forEach((btn) => {
    let button = document.createElement("img");
    Object.assign(button.style, {
      width: dataItems[0][btn].width,
      height: dataItems[0][btn].height,
      position: "absolute",
      bottom: "10px",
      [btn === "play-pause-button" ? "left" : "right"]: "10px",
      cursor: "pointer",
    });
    button.src = dataItems[0][btn].url;
    frontFace.appendChild(button);
  });
}

function getValue(name, attr) {
  return [...attr].find((a) => a.name === name)?.value || null;
}

function replaceCSS() {
  document.body.style.cssText =
    "height: 100vh; display: flex; justify-content: center; align-items: center; perspective: 1500px; margin: 0; padding: 0; box-sizing: border-box;";
  const cube = document.querySelector(".cube");
  cube.style.cssText =
    "width: 300px; height: 300px; position: relative; transform-style: preserve-3d;";
  document
    .querySelectorAll(".side")
    .forEach(
      (side) =>
        (side.style.cssText =
          "width: 100%; height: 100%; position: absolute; backface-visibility: hidden; background-repeat: no-repeat;")
    );
  setCubeSize();
}

function setCubeSize() {
  const cubeSize =
    window.innerWidth <= 600 ? 150 : window.innerWidth <= 1024 ? 200 : 300;
  const translateZ = cubeSize / 2;
  document.querySelector(".cube").style.width = cubeSize + "px";
  document.querySelector(".cube").style.height = cubeSize + "px";
  [
    [".front", ""],
    [".back", "rotateY(180deg)"],
    [".left", "rotateY(-90deg)"],
    [".right", "rotateY(90deg)"],
  ].forEach(([side, rotation]) => {
    document.querySelector(
      side
    ).style.transform = `${rotation} translateZ(${translateZ}px)`;
  });
}

function updateCubeRotation() {
  document.querySelector(".cube").style.transform = `rotateY(${y}deg)`;
}

function startAutoRotate() {
  function rotate() {
    y += (autoSpeed / 100) * autoRotationMultiplier;
    updateCubeRotation();
    autoRotateInterval = requestAnimationFrame(rotate);
  }
  autoRotateInterval = requestAnimationFrame(rotate);
}

function resetAutoRotate() {
  clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(startAutoRotate, resetTimeout);
}

function stopAutoRotate() {
  cancelAnimationFrame(autoRotateInterval);
}

window.onload = () => {
  makeHTML();
  replaceCSS();
  startAutoRotate();
};
window.onresize = setCubeSize;
document.addEventListener("mousemove", (e) => {
  stopAutoRotate();
  y += e.movementX * sensitivity;
  updateCubeRotation();
  resetAutoRotate();
});
document.addEventListener("touchmove", (e) => {
  stopAutoRotate();
  y += (e.touches[0].clientX - window.innerWidth / 2) * touchSensitivity;
  updateCubeRotation();
  resetAutoRotate();
});
