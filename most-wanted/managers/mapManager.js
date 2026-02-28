export class MapManager {
  mapData = null; // Объект карты

  xCount = 0; // Кол-во тайлов по оси Х
  yCount = 0; // Кол-во тайлов по оси У
  tSize = { x: 32, y: 32 }; // Размер одного тайла
  mapSize = { x: 32, y: 32 }; // Размер всей карты

  tilesets = []; // Массив тайлсетов

  imgLoadCount = 0;
  imgLoaded = false;
  jsonLoaded = false;

  ground1Layer = null; // Слой земли 1
  ground2Layer = null; // Слой земли 2
  obstaclesLayer = null; // Слой препятствий

  objects = []; // Объекты
  tileProps = new Map(); // Св-ва тайлов

  // Привязка других менеджеров
  setManager = (spriteManager, gameManager, physicManager) => {
    this.spriteManager = spriteManager;
    this.gameManager = gameManager;
    this.physicManager = physicManager;
  };

  // Парсинг карты
  parseMap = (tilesJSON) => {
    this.mapData = JSON.parse(tilesJSON);
    const m = this.mapData;

    this.xCount = m.width | 0;
    this.yCount = m.height | 0;
    this.tSize = { x: m.tilewidth | 0, y: m.tileheight | 0 };
    this.mapSize = { x: this.xCount * this.tSize.x, y: this.yCount * this.tSize.y };

    (m.layers || []).forEach((layer) => { // Проходим по слоям
      // Сохраняем слои
      if (layer.type === "tilelayer" && layer.name === "Ground1") this.ground1Layer = layer;
      if (layer.type === "tilelayer" && layer.name === "Ground2") this.ground2Layer = layer;
      if (layer.type === "tilelayer" && layer.name === "Obstacles") this.obstaclesLayer = layer;

      // Слой с объектами
      if (layer.type === "objectgroup" && layer.name === "Objects") {
        this.objects = (layer.objects || []).map(o => ({ // Приводим к удобному виду
          name: o.name || "",
          x: Number(o.x) || 0,
          y: Number(o.y) || 0,
          w: Number(o.width) || 0,
          h: Number(o.height) || 0,
          point: !!o.point,
          properties: o.properties || []
        }));
      }
    });

    // Идем по тайлсетам
    (m.tilesets || []).forEach((t) => {
      const img = new Image(); // Создаем элемент под картинку тайлсета
      img.onload = () => { // Когда картинка загрузилась
        this.imgLoadCount++; // Увеличиваем счетчик
        if (this.imgLoadCount === (m.tilesets || []).length) this.imgLoaded = true;
      };

      img.src = this.baseUrl + t.image;

      const ts = {
        firstgid: t.firstgid | 0, // Глобальный ID
        image: img, // Картинка для этого тайлсета
        // Сколько тайлов в одной строке
        Count: Math.floor((t.imagewidth | 0) / this.tSize.x) | 0
      };
      this.tilesets.push(ts);

      // Свойства тайлов (passable=true)
      const tiles = t.tiles || [];
      const first = t.firstgid | 0;
      // Обработка свойств
      tiles.forEach(tile => {
        if (!tile.properties || !tile.properties.length) return;
        const gid = first + (tile.id | 0); // global ID
        const props = {};
        tile.properties.forEach(p => props[p.name] = p.value);
        this.tileProps.set(gid, props);
      });
    });

    this.jsonLoaded = true;
  };

  // Загрузка карты
  loadMap = (path) => {
    this.baseUrl = path.substring(0, path.lastIndexOf("/") + 1);

    // Сброс состояния
    // (чтобы можно было грузить несколько уровней одним экземпляром)
    this.mapData = null;
    this.tilesets = [];
    this.objects = [];
    this.tileProps = new Map();

    this.imgLoadCount = 0;
    this.imgLoaded = false;
    this.jsonLoaded = false;

    this.ground1Layer = null;
    this.ground2Layer = null;
    this.obstaclesLayer = null;

    const request = new XMLHttpRequest();
    // Вызывается при изменении состояния запроса
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        this.parseMap(request.responseText);
      }
    };
    request.open("GET", path, true); // Готовим запрос
    request.send(); // Отправляем
  };

  // Найти тайлсет по глобальному ID
  getTileset = (gid) => {
    for (let i = this.tilesets.length - 1; i >= 0; i--) {
      // Ищем tileset с максимальным firstgid, который <= gid (с конца массива)
      if (this.tilesets[i].firstgid <= gid) return this.tilesets[i];
    }
    return null;
  };

  // Найти конкретный тайл
  getTile = (gid) => {
    const tileset = this.getTileset(gid);
    if (!tileset) return null;

    // Получаем ID и координаты
    const id = (gid - tileset.firstgid) | 0;
    const x = id % tileset.Count;
    const y = Math.floor(id / tileset.Count);

    return {
      img: tileset.image,
      px: x * this.tSize.x,
      py: y * this.tSize.y
    };
  };

  // Отрисовка слоя
  drawTileLayer = (ctx, layer) => {
    const data = layer.data || [];
    for (let j = 0; j < data.length; j++) {
      const gid = data[j] | 0;
      if (!gid) continue;

      const tile = this.getTile(gid);
      if (!tile) continue;

      // Получаем координаты тайла
      const pX = (j % this.xCount) * this.tSize.x;
      const pY = Math.floor(j / this.xCount) * this.tSize.y;

      ctx.drawImage( // Отрисовываем тайл
        tile.img,
        tile.px, tile.py, this.tSize.x, this.tSize.y,
        pX, pY, this.tSize.x, this.tSize.y
      );
    }
  };

  // Отрисовка карты
  draw = (ctx) => {
    if (!this.imgLoaded || !this.jsonLoaded) {
      setTimeout(() => this.draw(ctx), 60);
      return;
    }

    // Рисуем 2 слоя земли
    if (this.ground1Layer) this.drawTileLayer(ctx, this.ground1Layer);
    if (this.ground2Layer) this.drawTileLayer(ctx, this.ground2Layer);
  };

  // Проверка проходимости
  isBlocked = (px, py) => {
    // Получаем координаты тайла
    const col = Math.floor(px / this.tSize.x);
    const row = Math.floor(py / this.tSize.y);

    if (col < 0 || row < 0 || col >= this.xCount || row >= this.yCount) return true;
    if (!this.obstaclesLayer) return false;

    // Находим индекс в массиве data
    const idx = row * this.xCount + col;
    // Получаем глобальный индекс
    const gid = (this.obstaclesLayer.data[idx] | 0);

    if (!gid) return false; // Нет препятствия

    // если у тайла obstacles есть passable=true - не блокируем
    const props = this.tileProps.get(gid);
    if (props && props.passable === true) return false;

    return true; // Иначе блокируем
  };

  // Обертки
  getObject = (name) => this.objects.find(o => o.name === name) || null;
  getObjectsByPrefix = (prefix) => this.objects.filter(o => o.name.startsWith(prefix));
}
