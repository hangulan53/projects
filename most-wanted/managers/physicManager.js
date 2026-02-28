export class PhysicManager {
  constructor() {
    // Чтобы один и тот же таран не наносил урон много раз за кадр
    this._collisionPairs = new Set();
  }

  // Привязка других менеджеров
  setManager = (gameManager, mapManager) => {
    this.gameManager = gameManager;
    this.mapManager = mapManager;
  };

  // Можно ли поставить объект такого размера в точку (x,y) на карте
  _mapFreeAt = (x, y, w, h) => {
    const mm = this.mapManager;
    const halfW = w / 2;
    const halfH = h / 2;
    const pad = 2; // Небольшой отступ

    // 4 угла
    const pts = [
      { x: x - halfW + pad, y: y - halfH + pad },
      { x: x + halfW - pad, y: y - halfH + pad },
      { x: x - halfW + pad, y: y + halfH - pad },
      { x: x + halfW - pad, y: y + halfH - pad },
    ];

    for (const p of pts) {
      if (mm.isBlocked(p.x, p.y)) return false;
    }
    return true;
  };

  // Будет ли машина пересекаться с другой, если поставить её в (nx, ny)
  _hitCarAt = (self, nx, ny) => {
    const gm = this.gameManager;
    for (const e of gm.cars) {
      if (e === self) continue;
      const sx0 = nx - self.w / 2, sx1 = nx + self.w / 2;
      const sy0 = ny - self.h / 2, sy1 = ny + self.h / 2;
      const ex0 = e.left, ex1 = e.right;
      const ey0 = e.top, ey1 = e.bottom;
      const sep = (sx1 <= ex0) || (sx0 >= ex1) || (sy1 <= ey0) || (sy0 >= ey1);
      if (!sep) return e;
    }
    return null;
  };

  // Скорость движения
  getSpeedFor = (car) => {
    // Нитро только у игрока
    if (car.kind === "player" && car.hasNitroActive && car.hasNitroActive()) {
      return car.baseSpeed * 1.65;
    }
    return car.baseSpeed;
  };

  // Очистка хранилища столкновений
  clearCollisionPairs = () => {
    this._collisionPairs.clear();
  };

  // Проверка пересечения прямоугольников
  overlapAABB = (a, b) => {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  };

  // Столкновение машин и таран
  onCarCollision = (a, b) => {
    //if (a.kind === b.kind) return;

    const gm = this.gameManager;
    if (!a || !b) return;
    if (a.hp <= 0 || b.hp <= 0) return;

    const k1 = a.id < b.id ? a.id : b.id;
    const k2 = a.id < b.id ? b.id : a.id;
    const key = `${k1}-${k2}`;
    if (this._collisionPairs.has(key)) return;
    this._collisionPairs.add(key);

    // Вектор от A к B
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // Нормированный вектор (единичный)
    const nx = dx / len;
    const ny = dy / len;

    // Куда направлены авто
    const fa = a.getFacingVector();
    const fb = b.getFacingVector();

    // Скалярные произведения
    const dotA = nx * fa.fx + ny * fa.fy; // B перед A?
    const dotB = (-nx) * fb.fx + (-ny) * fb.fy; // A перед B?

    const aFront = dotA > 0.6; // А идет на таран
    const bFront = dotB > 0.6; // В идет на таран

    const applyHit = (att, vic) => {
      const died = vic.damage(att.ramDamage); // Наносим урон
      gm.playSoundOnce("../assets/audio/crash.wav", 0.35);
      att.knockbackBack(14); // Откат
      if (died && vic.kind === "player") gm.gameOver(); // Если умер игрок
    };

    if (aFront && bFront) { // Встречное столкновение
      const aDied = a.damage(b.ramDamage); // Наносим урон
      const bDied = b.damage(a.ramDamage); // Наносим урон
      gm.playSoundOnce("../assets/audio/crash.wav", 0.45);
      a.knockbackBack(14); // Откат
      b.knockbackBack(14); // Откат

      // Если один из участников умер и это был игрок
      if (aDied && a.kind === "player") gm.gameOver();
      if (bDied && b.kind === "player") gm.gameOver();
      return;
    }

    if (aFront) { applyHit(a, b); return; }
    if (bFront) { applyHit(b, a); return; }
  };

  // Подбор бонусов
  pickups = () => {
    const gm = this.gameManager;
    const p = gm.player;
    if (!p) return;

    for (const b of gm.bonuses) {
      if (this.overlapAABB( // Если есть пересечение
        { left: p.left, right: p.right, top: p.top, bottom: p.bottom },
        { left: b.left, right: b.right, top: b.top, bottom: b.bottom }
      )) {
        if (b.kind === "mine") p.mines++;
        if (b.kind === "nitro") p.nitro++;
        if (b.kind === "heal") p.repairs++;

        gm.onBonusPicked(b);
      }
    }
  };

  //Наезд полицейских на мины
  minesDamagePolice = () => {
    const gm = this.gameManager;
    for (const m of gm.mines) {
      for (const c of gm.cars) {
        if (c.kind !== "police" && c.kind !== "sportpolice") continue;

        const hit = !(c.right <= m.left || c.left >= m.right || c.bottom <= m.top || c.top >= m.bottom);
        if (hit) {
          c.damage(2);
          m.explode();
          break;
        }
      }
    }
  };

  // Движение
  move = (obj, vx, vy, dt, opts = {}) => {
    // Если allowRam = false - не вызываем логику тарана (нужна для "отката")
    const allowRam = opts.allowRam !== false;

    // Шаг за кадр
    const stepX = vx * dt;
    const stepY = vy * dt;

    // Если не движется
    if (!stepX && !stepY) return;

    // Двигаем по X
    if (stepX) {
      const nx = obj.x + stepX;
      const ny = obj.y;

      // Возвращается машина которую ударим, если она есть
      const hit = this._hitCarAt(obj, nx, ny);
      if (hit) {
        // Если разрешен таран - тараним
        if (allowRam) this.onCarCollision(obj, hit);
      }
      // Иначе если можно передвинуться
      else if (this._mapFreeAt(nx, ny, obj.w, obj.h)) {
        obj.x = nx;
      }
    }

    // Двигаем по Y
    if (stepY) {
      const nx = obj.x;
      const ny = obj.y + stepY;

      // Возвращается машина которую ударим, если она есть
      const hit = this._hitCarAt(obj, nx, ny);
      if (hit) {
        // Если разрешен таран - тараним
        if (allowRam) this.onCarCollision(obj, hit);
      }
      // Иначе если можно передвинуться
      else if (this._mapFreeAt(nx, ny, obj.w, obj.h)) {
        obj.y = ny;
      }
    }
  };
}
