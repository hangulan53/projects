export class CarBase {
  constructor(game, opts = {}) {
    this.game = game; // Ссылка на GameManager
    this.id = game._nextEntityId++; // Уникальный ID
    this.kind = opts.kind || "car"; // Тип сущности || по умолчанию
    this.spritePrefix = opts.spritePrefix || "musclecar"; // Префикс имени в спрайте

    this.x = opts.x || 0; // Координаты центра
    this.y = opts.y || 0; // Координаты центра
    this.w = opts.w ?? 56; // Примерный хитбокс
    this.h = opts.h ?? 56; // Примерный хитбокс

    this.maxHp = opts.maxHp ?? 1; // Макс. здоровье
    this.hp = opts.hp ?? this.maxHp; // Текущее здоровье
    this.baseSpeed = opts.speed ?? 200; // Скорость в px/sec
    this.ramDamage = opts.ramDamage ?? 1; // Урон от тарана

    this.vx = 0; // Вектор направления
    this.vy = 0; // Вектор направления
    this.angle = 0; // Текущий угол для спрайта

    this.solid = true; // Флаг "твердости"
    this.destroyed = false; // Флаг "разрушенности"

    // Параметры "отката"
    this._knockbackTime = 0;
    this._knockbackVx = 0;
    this._knockbackVy = 0;
  }

  // Границы хитбокса
  get left() { return this.x - this.w / 2; }
  get right() { return this.x + this.w / 2; }
  get top() { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }

  // Получаем угол в градусах из вектора (кратно 45)
  setDirFromVector(dx, dy) {
    if (!dx && !dy) return;

    // ВАЖНО: инвертируем dy (тк начало координат слева сверху)
    const ang = (Math.atan2(-dy, dx) * 180 / Math.PI + 360) % 360;
    const snapped = (Math.round(ang / 45) * 45) % 360;
    this.angle = snapped;
  }

  // Получаем направление (единичный вектор), куда смотрит перед авто
  getFacingVector() {
    // Вытаскиваем обратно радианы
    const rad = this.angle * Math.PI / 180;
    // sin с минусом для инвертирования
    return { fx: Math.cos(rad), fy: -Math.sin(rad) };
  }

  // Имя спрайта: префикс + угол 
  getSpriteName() {
    return `${this.spritePrefix}_${this.angle}`;
  }

  // Наносим урон
  damage(amount) {
    if (this.destroyed) return false;
    this.hp -= amount; // Отнимаем здоровье
    if (this.hp <= 0) { // Если меньше нуля
      this.hp = 0;
      this.onDeath(); // Убиваем
      return true;
    }
    return false;
  }

  // Параметры отката назад при таране
  knockbackBack(distance = 25) {
    const { fx, fy } = this.getFacingVector();
    // Время отката
    this._knockbackTime = 0.25;
    // Скорость отката
    this._knockbackVx = -fx * (distance / this._knockbackTime);
    this._knockbackVy = -fy * (distance / this._knockbackTime);
  }

  update(dt) {
    if (this.destroyed) return;

    // Применяем откат
    if (this._knockbackTime > 0) {
      const step = Math.min(dt, this._knockbackTime); // На сколько нужно откатиться
      this._knockbackTime -= step; // Время отката
      this.game.physicManager.move(this, this._knockbackVx, this._knockbackVy, step, { allowRam: false });
      return;
    }

    // Обычное движение
    const sp = this.game.getSpeedFor(this);
    this.game.physicManager.move(this, this.vx * sp, this.vy * sp, dt, { allowRam: true });
  }

  // Отрисовка
  draw(ctx) {
    const name = this.getSpriteName();
    this.game.spriteManager.drawSprite(ctx, name, this.x, this.y, 1, true);
  }

  // Поведение при смерти по умолчанию
  onDeath() {
    this.game.kill(this); // На отложенное убийство
  }
}
