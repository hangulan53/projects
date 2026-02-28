export class Mine {
  constructor(game, x, y) {
    this.game = game; // Ссылка на GameManager
    this.id = game._nextEntityId++; // Уникальный ID
    this.kind = "minePlaced"; // Размещенная мина
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 28;
    this.solid = false;
    // Зацикленный тик мины
    this._beep = this.game.playSoundLoop("../assets/audio/beep.wav", 0.1);
  }

  // Границы хитбокса
  get left() { return this.x - this.w/2; }
  get right() { return this.x + this.w/2; }
  get top() { return this.y - this.h/2; }
  get bottom() { return this.y + this.h/2; }

  // Взрыв
  explode() {
    // Останавливаем тик
    if (this._beep) {
      try { this._beep.stop(0); } catch {}
      this._beep = null;
    }
    this.game.spawnExplosion(this.x, this.y); // Отрисовать взрыв
    this.game.playSoundOnce("../assets/audio/explosion.wav", 0.7); // Звук
    this.game.kill(this); // Отправляем на отложенное убийство
  }

  // Отрисовка
  draw(ctx) {
    this.game.spriteManager.drawSprite(ctx, "mine", this.x, this.y, 0.3, true);
  }
}
