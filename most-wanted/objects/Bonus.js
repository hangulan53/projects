export class Bonus {
  constructor(game, kind, x, y) {
    this.game = game; // Ссылка на GameManager
    this.id = game._nextEntityId++; // Уникальный ID
    this.kind = kind; // Вид бонуса
    this.x = x; // Координаты центра
    this.y = y; // Координаты центра
    this.w = 32; // Размер хитбокса
    this.h = 32; // Размер хитбокса
    this.solid = false; // Флаг "твердости"
  }

  // Границы хитбокса
  get left() { return this.x - this.w/2; }
  get right() { return this.x + this.w/2; }
  get top() { return this.y - this.h/2; }
  get bottom() { return this.y + this.h/2; }

  // Выбор спрайта по типу
  spriteName() {
    if (this.kind === "mine") return "mine";
    if (this.kind === "nitro") return "nitro";
    return "heal";
  }

  // Отрисовка
  draw(ctx) {
    this.game.spriteManager.drawSprite(ctx, this.spriteName(), this.x, this.y, 0.5, true);
  }
}
