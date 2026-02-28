import { CarBase } from "./CarBase.js";

export class PlayerCar extends CarBase {
  constructor(game, opts = {}) {
    // super - вызов конструктора базового класса
    super(game, { ...opts, kind: "player", spritePrefix: "musclecar", maxHp: 10, hp: 10, speed: 300, ramDamage: 1 });

    this.mines = 0; // Кол-во мин
    this.nitro = 0; // Кол-во нитро
    this.repairs = 0; // Кол-во ремкомплектов

    this._moving = false; // Флаг "в движении"
    this._idleSrc = null; // Флаг холостого хода
    this._accelSrc = null; // Флаг ускорения
    this._nitroTime = 0; // Время нитро
  }

  // Холостой ход или ускорение
  _setMovingSound = (isMoving) => {
    if (this._moving === isMoving) return;
    this._moving = isMoving;

    if (isMoving) {
      // Переходим на разгон
      try { this._idleSrc?.stop(0); } catch {} // Останавливаем звук холостого хода
      this._idleSrc = null; // Сбрасываем ссылку
      // Запускаем цикл со звуком ускорения
      this._accelSrc = this.game.playSoundLoop("../assets/audio/engine_accel.wav", 0.25);
    } else {
      // Переходим на холостой ход
      try { this._accelSrc?.stop(0); } catch {} // Останавливаем звук ускорения
      this._accelSrc = null; // Сбрасываем ссылку
      // Запускаем цикл со звуком холостого хода
      this._idleSrc = this.game.playSoundLoop("../assets/audio/engine.wav", 0.75);
    }
  };

  // Активно ли сейчас нитро
  hasNitroActive() {
    return this._nitroTime > 0;
  }

  // Используем нитро
  useNitro() {
    if (this._nitroTime > 0) return;
    if (this.nitro <= 0) return;
    this.nitro--;

    this._nitroTime = 2.0; // Время действия
    this.game.playSoundOnce("../assets/audio/nitro.wav", 0.9);
  }

  // Используем ремкомплект
  useRepair() {
    if (this.repairs <= 0) return;
    if (this.hp >= this.maxHp) return;
    this.repairs--;
    this.hp = Math.min(this.maxHp, this.hp + 1);
    this.game.playSoundOnce("../assets/audio/heal.wav", 0.7);
  }

  // Оставить мину
  dropMine() {
    if (this.mines <= 0) return;
    this.mines--;

    const { fx, fy } = this.getFacingVector();
    // Оставляем за машиной
    const mx = this.x - fx * (this.w * 0.6);
    const my = this.y - fy * (this.h * 0.6);
    this.game.spawnMine(mx, my); // Спавним
  }

  update(dt) {
    // Берем менеджер ввода
    const em = this.game.eventsManager;

    // Направление с поддержкой диагоналей
    let dx = 0, dy = 0;
    if (em.action["up"]) dy -= 1;
    if (em.action["down"]) dy += 1;
    if (em.action["left"]) dx -= 1;
    if (em.action["right"]) dx += 1;

    // Нормализация для диагонали
    // (чтобы не было 1.41 по диагонали вместо 1)
    if (dx && dy) {
      const inv = 1 / Math.sqrt(2); // примерно 0.707
      dx *= inv; dy *= inv; // Домножаем и получаем примерно 1
    }

    this.vx = dx;
    this.vy = dy;
    this.setDirFromVector(dx, dy);

    const moving = (this.vx !== 0 || this.vy !== 0);
    this._setMovingSound(moving);

    // Действия (триггеры)
    if (this.game.consumeActionOnce("mine")) this.dropMine();
    if (this.game.consumeActionOnce("nitro")) this.useNitro();
    if (this.game.consumeActionOnce("repair")) this.useRepair();

    if (this._nitroTime > 0) this._nitroTime = Math.max(0, this._nitroTime - dt);

    super.update(dt); // Вызываем метод в базовом классе
  }
}
