let y = 0; // Змінна для зберігання поточного кута обертання по осі Y.
let autoRotateInterval; // Інтервал для автоматичного обертання куба.
let mouseMoveTimeout; // Таймер для відновлення автоматичного обертання після зупинки руху миші.

const sensitivity = 0.9; // Чутливість миші для контролю обертання куба.
const touchSensitivity = 0.05; // Чутливість сенсорного екрану для обертання.

const fusifyTag = document.querySelector("fusifytag"); // Отримуємо елемент <fusifytag>.
const dataItems = JSON.parse(getValue("data-items", fusifyTag.attributes)); // Парсимо JSON з атрибута data-items.
const autoSpeed = getValue("auto-speed", fusifyTag.attributes) || 100; // Швидкість автоматичного обертання, якщо не задано, використовується 100.
const resetTimeout =
  parseInt(getValue("reset-timeout", fusifyTag.attributes)) || 3000; // Таймер для автоматичного відновлення обертання після зупинки.
const rotationDirection =
  getValue("rotation-direction", fusifyTag.attributes) || "right"; // Напрямок обертання: вправо за замовчуванням.

const autoRotationMultiplier = rotationDirection === "right" ? 1 : -1; // Якщо обертання вправо, множимо на 1, якщо вліво - на -1.

function makeHTML() {
  // Масив з чотирма гранями куба.
  const faces = [
    {
      class: "side front", // Передня грань
      content: dataItems[0]["content"], // Контент (відео або зображення) для передньої грані.
      link: dataItems[0].link, // Посилання для передньої грані.
    },
    {
      class: "side back", // Задня грань
      content: dataItems[1]["content"],
      link: dataItems[1].link,
    },
    {
      class: "side left", // Ліва грань
      content: dataItems[2]["content"],
      link: dataItems[2].link,
    },
    {
      class: "side right", // Права грань
      content: dataItems[3]["content"],
      link: dataItems[3].link,
    },
  ];

  // Генеруємо HTML-структуру куба з гранями та контентом.
  const htmlContent =
    '<div class="cube">' +
    faces
      .map(
        (face, index) =>
          `<a href="${face.link}" class="${
            face.class
          }" target="_blank" style="background-color: ${
            dataItems[index]["background-color"]
          }; background-size: ${
            dataItems[index]["background-size"]
          }; background-position: ${dataItems[index]["background-position"]};">
          <div style="width: 100%; height: 100%;">${getContent(
            face.content
          )}</div></a>`
      )
      .join("") +
    "</div>";

  fusifyTag.innerHTML = htmlContent; // Вставляємо HTML-код куба в елемент <fusifytag>.

  addButtonsToFace(); // Додаємо кнопки на передню грань.
}

function getContent(content) {
  // Генеруємо HTML для кожного елемента контенту (зображення або відео).
  return content
    .map((item) => {
      if (item.type === "image") {
        return `<img src="${item.path}" style="position: absolute; top: ${item.top}; left: ${item.left}; width: ${item.width}; height: ${item.height};"/>`;
      } else if (item.type === "video") {
        return `<video src="${item.path}" style="position: absolute; top: ${item.top}; left: ${item.left}; width: ${item.width}; height: ${item.height};" controls playsinline autoplay muted></video>`;
      }
    })
    .join(""); // Об'єднуємо всі елементи контенту в один рядок.
}

function addButtonsToFace() {
  const frontFace = document.querySelector(".front"); // Отримуємо передню грань куба.

  const playPauseButtonConfig = dataItems[0]["play-pause-button"]; // Конфігурація кнопки Play-Pause.
  const soundButtonConfig = dataItems[0]["sound-button"]; // Конфігурація кнопки звуку.
}

function getValue(name, attr) {
  // Функція для отримання значення з атрибутів елемента за його назвою.
  for (let j = 0; j < attr.length; j++) {
    if (attr[j].name === name) {
      return attr[j].value;
    }
  }
  return null;
}

function replaceCSS() {
  // Змінюємо стилі для body та куба.
  const body = document.querySelector("body");
  body.style.height = "100vh";
  body.style.display = "flex";
  body.style.justifyContent = "center";
  body.style.alignItems = "center";
  body.style.perspective = "1500px"; // Встановлюємо перспективу для 3D.
  body.style.margin = "0";
  body.style.padding = "0";
  body.style.boxSizing = "border-box";

  const cube = document.querySelector(".cube");
  cube.style.width = "300px"; // Встановлюємо розміри куба.
  cube.style.height = "300px";
  cube.style.position = "relative"; // Відносна позиція для гранів куба.
  cube.style.transformStyle = "preserve-3d"; // Дозволяємо 3D-трансформації.

  const sides = document.querySelectorAll(".side");
  sides.forEach((side) => {
    side.style.width = "100%";
    side.style.height = "100%";
    side.style.position = "absolute"; // Абсолютне позиціонування для гранів куба.
    side.style.backfaceVisibility = "hidden"; // Приховуємо зворотній бік грані.
    side.style.backgroundRepeat = "no-repeat"; // Вимикаємо повторення фону.
  });

  setCubeSize(); // Встановлюємо розміри куба залежно від ширини екрану.
}

function setCubeSize() {
  const cube = document.querySelector(".cube");
  const front = document.querySelector(".front");
  const back = document.querySelector(".back");
  const left = document.querySelector(".left");
  const right = document.querySelector(".right");

  let cubeSize; // Розмір куба.
  let translateZ; // Відстань трансляції по осі Z.

  // Встановлюємо розміри куба в залежності від ширини вікна.
  if (window.innerWidth <= 600) {
    cubeSize = 150;
    translateZ = 75;
  } else if (window.innerWidth <= 1024) {
    cubeSize = 200;
    translateZ = 100;
  } else {
    cubeSize = 300;
    translateZ = 150;
  }

  cube.style.width = `${cubeSize}px`;
  cube.style.height = `${cubeSize}px`;

  // Встановлюємо трансформації для кожної грані куба.
  front.style.transform = `translateZ(${translateZ}px)`;
  back.style.transform = `rotateY(180deg) translateZ(${translateZ}px)`;
  left.style.transform = `rotateY(-90deg) translateZ(${translateZ}px)`;
  right.style.transform = `rotateY(90deg) translateZ(${translateZ}px)`;
}

window.onload = function () {
  makeHTML(); // Створюємо HTML-контент при завантаженні сторінки.
  replaceCSS(); // Застосовуємо стилі при завантаженні сторінки.
  startAutoRotate(); // Починаємо автоматичне обертання куба.
};

window.onresize = function () {
  setCubeSize(); // Оновлюємо розміри куба при зміні розміру вікна.
};

function startAutoRotate() {
  function rotate() {
    y += (autoSpeed / 100) * autoRotationMultiplier; // Обчислюємо новий кут обертання.
    updateCubeRotation(); // Оновлюємо стиль трансформації куба.
    autoRotateInterval = requestAnimationFrame(rotate); // Продовжуємо обертання.
  }
  autoRotateInterval = requestAnimationFrame(rotate); // Запускаємо цикл обертання.
}

function stopAutoRotate() {
  cancelAnimationFrame(autoRotateInterval); // Зупиняємо обертання.
}

function resetAutoRotate() {
  clearTimeout(mouseMoveTimeout); // Очищаємо таймер для відновлення обертання.
  mouseMoveTimeout = setTimeout(startAutoRotate, resetTimeout); // Встановлюємо новий таймер для відновлення обертання.
}

function updateCubeRotation() {
  document.querySelector(".cube").style.transform = `rotateY(${y}deg)`; // Оновлюємо обертання куба на основі значення 'y'.
}

// Обробляємо подію руху миші для ручного обертання куба.
document.addEventListener("mousemove", function (e) {
  stopAutoRotate(); // Зупиняємо автоматичне обертання при русі миші.
  y += e.movementX * sensitivity; // Оновлюємо значення кута обертання в залежності від руху миші.
  updateCubeRotation(); // Оновлюємо обертання куба.
  resetAutoRotate(); // Запускаємо таймер для автоматичного відновлення обертання.
});

// Обробляємо подію руху пальцем для сенсорних пристроїв.
document.addEventListener("touchmove", function (e) {
  const touch = e.touches[0]; // Отримуємо перший дотик.
  stopAutoRotate(); // Зупиняємо автоматичне обертання.
  y += (touch.clientX - window.innerWidth / 2) * touchSensitivity; // Оновлюємо обертання куба в залежності від руху пальця.
  updateCubeRotation(); // Оновлюємо обертання куба.
  resetAutoRotate(); // Запускаємо таймер для автоматичного відновлення обертання.
});
// Налаштування стилів для кнопок Video.js за допомогою JavaScript
const video = document.querySelector("video");
video.style.display = "none"; // Приховуємо відео

const playPauseButton = document.createElement("button");
playPauseButton.textContent = "Play/Pause";
playPauseButton.style.width = video.getAttribute("data-playpause-width");
playPauseButton.style.height = video.getAttribute("data-playpause-height");
playPauseButton.style.backgroundColor = video.getAttribute("data-playpause-bg");
playPauseButton.style.color = video.getAttribute("data-playpause-color");
playPauseButton.style.position = "absolute";
playPauseButton.style.bottom = "10px";
playPauseButton.style.left = "10px";
document.body.appendChild(playPauseButton);

const soundButton = document.createElement("button");
soundButton.textContent = "Sound";
soundButton.style.width = video.getAttribute("data-sound-width");
soundButton.style.height = video.getAttribute("data-sound-height");
soundButton.style.backgroundColor = video.getAttribute("data-sound-bg");
soundButton.style.color = video.getAttribute("data-sound-color");
soundButton.style.position = "absolute";
soundButton.style.bottom = "10px";
soundButton.style.right = "10px";
document.body.appendChild(soundButton);

// Функція для пошуку всіх відео на гранях куба
function getAllCubeVideos() {
  return document.querySelectorAll(".cube video");
}

// Функція для керування Play/Pause
playPauseButton.onclick = function () {
  const videos = getAllCubeVideos(); // Отримуємо всі відео на гранях куба
  videos.forEach((video) => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
};

// Функція для керування Mute/Unmute
soundButton.onclick = function () {
  const videos = getAllCubeVideos(); // Отримуємо всі відео на гранях куба
  videos.forEach((video) => {
    video.muted = !video.muted;
  });
};
