import { gameManager } from "../managers/gameManager.js";
import { SpriteManager } from "../managers/spriteManager.js";
import { MapManager } from "../managers/mapManager.js";
import { EventsManager } from "../managers/eventsManager.js";
import { PhysicManager } from "../managers/physicManager.js";
import { SoundManager } from "../managers/soundManager.js";

// Получаем канвас и контекст рисования
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Создание менеджеров
const spriteManager = new SpriteManager();
const mapManager = new MapManager();
const eventsManager = new EventsManager();
const physicManager = new PhysicManager();
const soundManager = new SoundManager();

// Передаем параметры, инициализируем
gameManager.init(ctx, canvas);
// Задаем пути к уровням
gameManager.setLevelPaths({
  1: "../levels/lvl1.json",
  2: "../levels/lvl2.json",
});
gameManager.setManager(spriteManager, mapManager, eventsManager, physicManager, soundManager);

// Кнопки
const pauseBtn = document.getElementById("pauseBtn");
const backBtn = document.getElementById("backBtn");

let paused = false;

// Обработчки кнопки паузы
pauseBtn?.addEventListener("click", () => {
  gameManager.unlockAudio();

  paused = !paused;
  pauseBtn.textContent = paused ? "Продолжить" : "Пауза";
  if (paused) gameManager.pause();
  else gameManager.resume();
});

// Обработчик кнопки в меню
backBtn?.addEventListener("click", () => {
  gameManager.stop();
  location.href = "login.html";
});

const unlock = () => gameManager.unlockAudio();
// once: true - обработчик сработает один раз и сам снимется
window.addEventListener("click", unlock, { once: true });
window.addEventListener("keydown", unlock, { once: true });

eventsManager.setup();


// Загрузка уровня и старт игры
await gameManager.loadAll("../levels/lvl1.json", 1, false);
gameManager.play();
