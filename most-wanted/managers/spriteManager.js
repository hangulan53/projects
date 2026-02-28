export class SpriteManager {
    constructor() {
      this.image = new Image(); // Для атласа
      this.sprites = []; // Массив спрайтов
      this.imgLoaded = false; // Атлас загружен
      this.jsonLoaded = false; // JSON загружен
      this.mapManager = null;
    }

    // Закрепляем mapManager
    setManager = (mapManager) => {
      this.mapManager = mapManager;
    }

    // Загружаем атлас (img)
    loadImg = (imgName) => {
      this.image.addEventListener("load", () => {
        this.imgLoaded = true;
      });
      this.image.src = imgName;
    }

    // Парсим атлас (JSON)
    parseAtlas = (atlasJson) => {
      const atlas = JSON.parse(atlasJson); // Парсим JSON
      for (const name in atlas.frames) {
        const frame = atlas.frames[name].frame; // Достаем спрайт
        this.sprites.push({name, x: frame.x, y: frame.y, w: frame.w, h: frame.h});
      }

      this.jsonLoaded = true; // Устанавливаем флаг
    }

    // Загружаем атлас (JSON)
    loadAtlas = (atlasJson, atlasImg) => {
      const request = new XMLHttpRequest(); // Загружаем

      request.addEventListener("load", () => {
        if (request.readyState === 4 && request.status === 200) {
          this.parseAtlas(request.responseText); // Если успешно, парсим
        }
      });

      request.open("GET", atlasJson, true); // Готовим запрос
      request.send(); // Отправляем

      this.loadImg(atlasImg); // Загружаем картинку
    }

    // Получаем спрайт по имени
    getSprite = (name) => {
      return this.sprites.find(s => s.name === name) || null;
    }

    // Отрисовка спрайта
    drawSprite = (ctx, name, x, y, scale = 1, centered = false) => {
      // Если не все подгрузилось - ждем и пробуем снова
      if (!this.imgLoaded || !this.jsonLoaded) {
        setTimeout(() => this.drawSprite(ctx, name, x, y, scale, centered), 100);
      }
      else {
        const sprite = this.getSprite(name);
        if (!sprite) return;

        // Масштабируем, если надо
        const dw = sprite.w * scale;
        const dh = sprite.h * scale;

        // Центрируем, если надо
        const dx = centered ? x - dw / 2 : x;
        const dy = centered ? y - dh / 2 : y;

        // Рисуем
        ctx.drawImage(
          this.image,
          sprite.x, sprite.y, sprite.w, sprite.h,
          dx, dy, dw, dh
        );
      }
    }
}
