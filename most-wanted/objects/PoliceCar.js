import { CarBase } from "./CarBase.js";

export class PoliceCar extends CarBase {
  constructor(game, opts = {}) {
    const kind = opts.kind || "police"; // Вид полиции
    const isSport = kind === "sportpolice"; // Спортивная или нет
    
    // super - вызов конструктора базового класса
    super(game, {
      ...opts,
      kind,
      spritePrefix: isSport ? "sportpolice" : "police",
      maxHp: isSport ? 3 : 2,
      hp: isSport ? 2 : 3,
      speed: isSport ? 400 : 200,
      ramDamage: isSport ? 2 : 1
    });

    this._think = 0; // Таймер "обдумывания"
    this._sirenSrc = null; // Ссылка на буфер с сиренами
    this.dead = false;
  }

  // Запуск сиерны
  _ensureSiren = () => {
    if (this._sirenSrc) return;

    const ctx = this.game.soundManager?.context;
    if (!ctx || ctx.state !== "running") return;

    // Если спортивная - 2-й вид сирены, иначе - 1-й
    const path = (this.kind === "sportpolice")
      ? "../assets/audio/siren2.wav"
      : "../assets/audio/siren1.wav";

    // Запуск цикла с сиреной 
    this._sirenSrc = this.game.playSoundLoop(path, 0.4);
  };

  // Таблица с 8 направлениями (угол, х, у)
  _dirs8 = () => ([
    { a: 0,   vx:  1, vy:  0 },
    { a: 45,  vx:  Math.SQRT1_2, vy: -Math.SQRT1_2 },
    { a: 90,  vx:  0, vy: -1 },
    { a: 135, vx: -Math.SQRT1_2, vy: -Math.SQRT1_2 },
    { a: 180, vx: -1, vy:  0 },
    { a: 225, vx: -Math.SQRT1_2, vy:  Math.SQRT1_2 },
    { a: 270, vx:  0, vy:  1 },
    { a: 315, vx:  Math.SQRT1_2, vy:  Math.SQRT1_2 },
  ]);

  // Можно ли поехать в направлении
  _canStep = (vx, vy) => {
    const pm = this.game.physicManager;
    if (!pm) return true;

    const oldX = this.x, oldY = this.y;

    // Небольшой шаг, чтобы проверить коллизии
    const testDt = 0.08;
    const sp = this.game.getSpeedFor(this);
    pm.move(this, vx * sp, vy * sp, testDt, { allowRam: false });

    // Получилось ли сдвинуться
    const moved = (this.x !== oldX || this.y !== oldY);

    // Откат
    this.x = oldX; this.y = oldY;

    return moved;
  };

  // Лучшее направление по отношению к игроку
  _pickBestDirToPlayer = (dx, dy) => {
    const wantAng = (Math.atan2(-dy, dx) * 180 / Math.PI + 360) % 360;
    const want = (Math.round(wantAng / 45) * 45) % 360;

    // Порядок попыток - сначала небольшие углы, в конце разворот
    const offsets = [0, 45, -45, 90, -90, 135, -135, 180];

    const dirs = this._dirs8();
    // Словарь вида "угол - значение"
    const byAngle = new Map(dirs.map(d => [d.a, d]));

    for (const off of offsets) {
      const a = (want + off + 360) % 360; // Угол
      const d = byAngle.get(a); // Вектор
      if (!d) continue; // Если нет - продолжаем
      // Если можем двигаться на игрока - двигаемся
      if (this._canStep(d.vx, d.vy)) return d;
    }

    return { a: this.angle, vx: 0, vy: 0 };
  };


  update(dt) {
    if (this.dead) return;

    const p = this.game.player; // Берем игрока
    if (!p) return;

    this._ensureSiren(); // Запускаем сирену

    this._think -= dt;
    if (this._think <= 0) {
      this._think = 0.35; // "Думаем" раз в 35 мс

      // Вектор до игрока
      const dx = p.x - this.x;
      const dy = p.y - this.y;

      // Теорема пифагора
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 4) { // Если слишком близко - не двигаемся
        this.vx = 0; this.vy = 0;
      } else {
        // Подбираем лучшее направление
        const d = this._pickBestDirToPlayer(dx, dy);
        // Обновляем значения
        this.vx = d.vx;
        this.vy = d.vy;
        this.angle = d.a;
      }
    }

    super.update(dt);
  }

  onDeath() {
    if (this.dead) return;
    this.dead = true;

    this.game.onPoliceKilled(this); // Добавляем в счет игрока
    this.game.spawnExplosion(this.x, this.y); // Взрыв
    this.game.playSoundOnce("../assets/audio/explosion.wav", 0.55); // Звук

    if (this._sirenSrc) { // Прерываем цикл с сиреной
      try { this._sirenSrc.stop(0); } catch {}
      this._sirenSrc = null;
    }

    this.game.kill(this); // На отложенное убийство
  }
}
