import { PlayerCar } from "../objects/PlayerCar.js";
import { PoliceCar } from "../objects/PoliceCar.js";
import { Bonus } from "../objects/Bonus.js";
import { Mine } from "../objects/Mine.js";

export class GameManager {
  constructor(ctx = null, canvas = null) {
    this.ctx = ctx;
    this.canvas = canvas || (ctx ? ctx.canvas : null);

    // Менеджеры
    this.spriteManager = null;
    this.mapManager = null;
    this.eventsManager = null;
    this.physicManager = null;
    this.soundManager = null;

    // Путь к уровням
    this.levelPaths = null;

    // Флаги
    this._running = false; // Запуска
    this._paused = false; // Паузы
    this._raf = 0;
    this._lastTs = 0; // Для вычисления dt

    // Все объекты
    this.cars = [];
    this.bonuses = [];
    this.mines = [];
    this.laterKill = []; // Отложенное убийство
    this.effects = []; // Для взрывов

    this.player = null; // Объект игрока

    this.level = 1; // Уровень
    this.requiredKills = 5; 
    this.policeKilled = 0;

    this.exitActive = false;
    this.exitX = 0; // Координаты проезда
    this.exitY = 0; // Координаты проезда

    // Для вычисления времени
    this.runStartMs = 0; // Начало игры
    this.timeMs = 0; // Текущее время без пауз
    this._pauseStartMs = 0; // Когда поставили на паузу
    this._pausedTotalMs = 0; // Суммарное время пауз

    // Зацикленные звуки
    this._engineLoop = null;
    this._sirenLoop = null;

    // Одноразовые нажатия
    this._actionConsumed = Object.create(null);
    this._transitioning = false; // Переход уровня

    // Планировщик респавнов
    this.respawns = [];
    this._policeSpawnCount = 0;
    this.POLICE_RESPAWN_MS = 5000;
    this.BONUS_RESPAWN_MS = 10000;
  }

  init = (ctx, canvas = null) => {
    this.ctx = ctx;
    this.canvas = canvas || ctx.canvas;
  };

  // Сохраняет пути к уровням
  setLevelPaths = (paths) => {
    this.levelPaths = paths;
  };

  // Устанавливает все менеджеры, проводит необходимые зависимости
  setManager = (spriteManager, mapManager, eventsManager, physicManager, soundManager) => {
    this.spriteManager = spriteManager;
    this.mapManager = mapManager;
    this.eventsManager = eventsManager;
    this.physicManager = physicManager;
    this.soundManager = soundManager;

    this.mapManager.setManager(this.spriteManager, this, this.physicManager);
    this.spriteManager.setManager(this.mapManager);
    this.physicManager.setManager(this, this.mapManager);
    this.soundManager.setManager(this);
  };

  // Обертки для звука
  playSoundOnce = (path, volume = 1) => { // Проиграть один раз
    try { return this.soundManager.playOnce(path, volume); } catch { return null; }
  };

  playSoundLoop = (path, volume = 1) => { // Запустить цикл
    try { return this.soundManager.playLoop(path, volume); } catch { return null; }
  };

  unlockAudio = () => { // Разблокировать
    this.soundManager?.unlock?.();
  };

  // Обертки для физики
  onCarCollision = (a, b) => this.physicManager.onCarCollision(a, b);
  _pickups = () => this.physicManager.pickups();
  _minesDamagePolice = () => this.physicManager.minesDamagePolice();
  getSpeedFor = (car) => this.physicManager.getSpeedFor(car);

  // Для срабатывания один раз за нажатие
  consumeActionOnce = (name) => {
    const cur = !!this.eventsManager.action[name];
    const prev = !!this._actionConsumed[name];

    if (cur && !prev) { // Если клавишу нажали только что
      this._actionConsumed[name] = true;
      return true;
    }
    if (!cur) this._actionConsumed[name] = false;
    // Если клавишу держат
    return false;
  };

  // Планировщик респавнов
  _addRespawn = (id, delayMs, spawnFn, repeat = false) => {
    for (let i = 0; i < this.respawns.length; i++) {
      if (this.respawns[i].id === id) {
        this.respawns.splice(i, 1); // Удаляет старую задачу с таким же ID
        break;
      }
    }
    const now = performance.now();
    // Добавляет запланированную новую
    this.respawns.push({ id, at: now + delayMs, delayMs, repeat, spawnFn });
  };

  _tickRespawns = () => {
    const now = performance.now();
    for (let i = 0; i < this.respawns.length; i++) {
      // Смотрим, какие задачи подходят
      const r = this.respawns[i];
      if (now < r.at) continue;

      r.spawnFn(); // Выполняем

      if (r.repeat) { // Если с повторением - заносим опять
        r.at = now + r.delayMs;
      } else { // Иначе - удаляем
        this.respawns.splice(i, 1);
        i--;
      }
    }
  };

  // Ждем, пока все подгрузится
  _waitReady = () => {
    return new Promise((resolve) => {
      const tick = () => {
        const mapOk = this.mapManager.imgLoaded && this.mapManager.jsonLoaded;
        const sprOk = this.spriteManager.imgLoaded && this.spriteManager.jsonLoaded;
        const sndOk = this.soundManager.loaded;
        if (mapOk && sprOk && sndOk) resolve();
        else setTimeout(tick, 50);
      };
      tick();
    });
  };

  // Создаем и спавним игрока, бонусы
  _spawnFromMap = () => {
    const spP = this.mapManager.getObject("SpawnPlayer");
    const spC = this.mapManager.getObject("SpawnPolice");
    const ex = this.mapManager.getObject("Exit");

    if (!spP) throw new Error("На карте нет объекта SpawnPlayer");
    if (!spC) throw new Error("На карте нет объекта SpawnPolice");
    if (!ex)  throw new Error("На карте нет объекта Exit");

    // Создаем игрока
    this.player = new PlayerCar(this, { x: spP.x, y: spP.y });
    this.cars.push(this.player);

    // Выезд
    this.exitX = ex.x;
    this.exitY = ex.y;

    // Бонусы - сохраняем места
    const mines = this.mapManager.getObjectsByPrefix("Mine");
    const nitro = this.mapManager.getObjectsByPrefix("Nitro");
    const heal  = this.mapManager.getObjectsByPrefix("Heal");

    const spawnBonus = (kind, x, y) => { // Спавн бонуса
      const b = new Bonus(this, kind, x, y);
      b.spawnKind = kind;
      b.spawnX = x;
      b.spawnY = y;
      this.bonuses.push(b);
    };

    // Спавним все бонусы
    mines.forEach(o => spawnBonus("mine", o.x, o.y));
    nitro.forEach(o => spawnBonus("nitro", o.x, o.y));
    heal.forEach(o  => spawnBonus("heal",  o.x, o.y));
  };

  // Загрузка уровня
  loadAll = async (levelMap, lvl = 1, keepTimer = false) => {
    if (!this.ctx) throw new Error("Сначала вызови gameManager.init(ctx)");

    // Останавливаем игру и звуки
    this.stop();
    this.soundManager?.stopAll?.();

    // Устанавливаем уровень и кол-во уничтожений 
    this.level = lvl;
    this.requiredKills = (lvl === 1) ? 5 : 5;

    this.policeKilled = 0;
    this.exitActive = false;

    // Сбрасываем все объекты
    this.cars = [];
    this.bonuses = [];
    this.mines = [];
    this.laterKill = [];
    this.respawns = [];

    // Очищаем список коллизий
    this.physicManager?.clearCollisionPairs?.();

    // Таймер: стартуем только в начале игры
    if (!keepTimer) {
      this.runStartMs = performance.now();
      this.timeMs = 0;
      this._pausedTotalMs = 0;
      this._pauseStartMs = 0;
    }

    // Загружаем карту/атлас/звуки
    this.mapManager.loadMap(levelMap);
    this.spriteManager.loadAtlas("../assets/sprites/sprites.json", "../assets/sprites/spritesheet.png");
    this.soundManager.loadAll();

    await this._waitReady();

    // Спавним игрока/бонусы/проезд
    this._spawnFromMap();

    // Начальный полицейский
    this._spawnPolice();

    // Респавн полицейских (через общий планировщик)
    this._addRespawn("police", this.POLICE_RESPAWN_MS, () => this._spawnPolice(), true);
  };

  // Старт игрового цикла
  play = () => {
    this._running = true;
    this._paused = false;
    this._lastTs = performance.now();

    const loop = (ts) => { // Игровой цикл
      if (!this._running) return; // Если остановили

      // Вычисляем dt, он определяет частоту обновления ВСЕГО
      // черещ min ограничиваем, чтобы было примерно минимум 20 FPS
      const dt = Math.min(0.05, (ts - this._lastTs) / 1000);
      this._lastTs = ts;

      // Если не на паузе, вызываем обновление
      if (!this._paused) this.update(dt);

      // Вызываем loop снова
      this._raf = requestAnimationFrame(loop);
    };

    this._raf = requestAnimationFrame(loop); // Вызываем loop
  };

  // Пауза
  pause = () => {
      this._paused = true; 
      this._pauseStartMs = performance.now();
      this.soundManager?.pauseAll?.();
  };

  // Продолжить
  resume = () => {
      this._paused = false;

      if (this._pauseStartMs) {
        this._pausedTotalMs += (performance.now() - this._pauseStartMs);
        this._pauseStartMs = 0;
      }

      this.soundManager?.resumeAll?.();
  };

  // Остановить игру
  stop = () => {
    this._running = false;
    this._paused = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  };

  // Вызвать при подборе бонуса
  onBonusPicked = (b) => {
    // Удаляем текущий объект бонуса
    this.kill(b);

    // Ставим задачу на респавн на том же месте
    const kind = b.spawnKind;
    const x = b.spawnX;
    const y = b.spawnY;

    // id уникален для точки
    const id = `bonus:${kind}:${x}:${y}`;

    this._addRespawn(id, this.BONUS_RESPAWN_MS, () => {
      const nb = new Bonus(this, kind, x, y);
      nb.spawnKind = kind;
      nb.spawnX = x;
      nb.spawnY = y;
      this.bonuses.push(nb);
    }, false);
  };

  // Спавн мины
  spawnMine = (x, y) => {
    const m = new Mine(this, x, y);
    this.mines.push(m);
  };

  // Спавн взрыва
  spawnExplosion = (x, y, ttl = 0.6, scale = 2) => {
    this.effects.push({ x, y, ttl, scale });
  };

  // Спавн полиции
  _spawnPolice = () => {
    const sp = this.mapManager.getObject("SpawnPolice");
    if (!sp) return;

    // На втором уровне - и обычные, и спортивные
    let kind = "police";
    this._policeSpawnCount++;
    if (this.level === 2) {
      // Чередуем
      kind = (this._policeSpawnCount % 2 === 0) ? "police" : "sportpolice";
    }

    // Небольшой случайный сдвиг
    const jitter = () => (Math.random() * 18 - 9);
    const p = new PoliceCar(this, { kind, x: sp.x + jitter(), y: sp.y + jitter() });
    this.cars.push(p);
  };

  // При уничтожении полицейского авто
  onPoliceKilled = (p) => {
    this.policeKilled++; // Увеличиваем счетчик
    if (!this.exitActive && this.policeKilled >= this.requiredKills) {
      this.exitActive = true; // Если достаточно, открываем проезд
      this.playSoundOnce("../assets/audio/heal.wav", 0.35);
    }
  };

  // Отправить на отложенное убийство
  kill = (obj) => {
    this.laterKill.push(obj);
  };

  // Логика выезда
  _checkExit = async () => {
    if (this._transitioning) return;
    if (!this.exitActive) return;
    const p = this.player;
    if (!p) return;

    const dx = p.x - this.exitX;
    const dy = p.y - this.exitY;
    // Если слишком далеко
    if (dx * dx + dy * dy > 32 * 32) return;

    if (this.level === 1) { // Если первый уровень
      const nextPath = this.levelPaths?.[2] || "../levels/lvl2.json";
      this._transitioning = true; // Переход
      await this.loadAll(nextPath, 2, true); // Загружаем второй уровень
      this.play(); // Запускаем цикл
      this._transitioning = false;
    } else { // Если второй уровень
      this._transitioning = true; // Переход
      this.finishGame(); // Завершаем игру
    }
  };

  update = (dt) => {
    // Вычисляем время
    const now = performance.now();
    this.timeMs = Math.floor(now - this.runStartMs - this._pausedTotalMs);

    // Очищаем массив столкновений
    this.physicManager?.clearCollisionPairs?.();

    // Обновляем все авто
    for (const c of this.cars) c.update(dt);

    // Обновляем и убираем временные эффекты
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].ttl -= dt;
      if (this.effects[i].ttl <= 0) this.effects.splice(i, 1);
    }

    // Бонусы/мины
    this.physicManager.pickups();
    this.physicManager.minesDamagePolice();

    this._tickRespawns();

    // Чистим удалённые объекты
    if (this.laterKill.length) {
      const dead = new Set(this.laterKill);
      this.cars = this.cars.filter(e => !dead.has(e));
      this.bonuses = this.bonuses.filter(e => !dead.has(e));
      this.mines = this.mines.filter(e => !dead.has(e));
      this.laterKill.length = 0;

      if (this.player && this.player.hp <= 0) {
        this.gameOver();
        return;
      }
    }

    // Вызываем рендер
    this.render();

    // Проверка выезда
    this._checkExit();
  };

  // Рендер
  render = () => {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Очищаем карту
    ctx.clearRect(0, 0, w, h);

    // Отрисовываем кадр
    this.mapManager.draw(ctx);

    // Отрисовываем машины, бонусы, мины
    for (const b of this.bonuses) b.draw(ctx);
    for (const m of this.mines) m.draw(ctx);
    for (const c of this.cars) c.draw(ctx);

    // Отрисовываем взрывы
    for (const e of this.effects) {
      this.spriteManager.drawSprite(ctx, "explosion", e.x, e.y, 0.2, true);
    }

    const p = this.player;

    // Для отрисовки HUD
    const drawHudLine = (text, x, y) => {
      ctx.strokeText(text, x, y); // Обводка
      ctx.fillText(text, x, y); // Залитый текст
    };

    ctx.font = "bold 18px system-ui, sans-serif"; // Шрифт
    ctx.fillStyle = "orange"; // Цвет текста
    ctx.strokeStyle = "black"; // Цвет обводки
    ctx.lineWidth = 4; // Толщина обводки
    ctx.lineJoin = "round"; // Скругление

    // Координаты начала HUD
    let y = 26;
    const x = 12;
    const step = 24;

    // Отрисовываем HUD
    drawHudLine(`Уровень: ${this.level}`, x, y); y += step;
    drawHudLine(`Время: ${this.timeMs} ms`, x, y); y += step;

    if (p) {
      drawHudLine(`Здоровье: ${p.hp}/${p.maxHp}`, x, y); y += step;
      drawHudLine(`Мины: ${p.mines}  Нитро: ${p.nitro}  Рем: ${p.repairs}`, x, y); y += step;
      drawHudLine(`Уничтожено: ${this.policeKilled}/${this.requiredKills}`, x, y); y += step;
      drawHudLine(this.exitActive ? `Гоните к выезду!` : ``, x, y); y += step;
    }
  };

  gameOver = () => {
    this.stop(); // Останавливаем
    this.soundManager?.pauseAll?.(); // Ставим все на паузу
    location.href = "login.html";
  };

  // Завершение игры
  finishGame = () => {
    this.stop(); // Останавливаем игру

    // Вычисляем время
    const now = performance.now();
    const timeMs = Math.floor(now - this.runStartMs - this._pausedTotalMs);

    // Получаем имя
    const nameRaw = localStorage.getItem("playerName");
    const name = (nameRaw && nameRaw.trim()) ? nameRaw.trim() : "Player";

    const key = "records";
    let list = [];
    try {
      // Парсим рекорды
      list = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }

    const existing = list.find(r => r && r.name === name);

    if (!existing) { // Если такого игрока еще нет в таблице
      list.push({ name, timeMs });
    } else if (timeMs < Number(existing.timeMs)) { // Иначе если это новый рекорд
      existing.timeMs = timeMs;
    }

    // Сортируем
    list.sort((a, b) => Number(a.timeMs) - Number(b.timeMs));
    localStorage.setItem(key, JSON.stringify(list));

    location.href = "records.html";
  };
}

export const gameManager = new GameManager();
