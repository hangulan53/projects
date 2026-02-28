export class SoundManager {
    constructor() {
        this.clips = {}; // Словарь, хранит аудиобуфер и флаг загрузки
        this.context = null; // Аудио-контекст
        this.gainNode = null; // Общий мастер громкости
        this.loaded = false; // Флаг загрузки

        this.sounds = [
            "../assets/audio/beep.wav",
            "../assets/audio/crash.wav",
            "../assets/audio/engine_accel.wav",
            "../assets/audio/engine.wav",
            "../assets/audio/explosion.wav",
            "../assets/audio/heal.wav",
            "../assets/audio/nitro.wav",
            "../assets/audio/siren1.wav",
            "../assets/audio/siren2.wav"
        ];

        this.init();
        this._unlocked = false; // Разрешен ли звук
        this._paused = false; // Флаг паузы
        this._activeSources = new Set(); // Все активные сейчас звуки
    }

    init = () => {
        // Создаем аудио-контекст
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        // Создаем мастер громкости
        this.gainNode = this.context.createGain
            ? this.context.createGain()
            : this.context.createGainNode();
        // И привязываем его к выходу
        this.gainNode.connect(this.context.destination);
    }

    // Привязываем gameManager
    setManager = (gameManager) => {
        this.gameManager = gameManager;
    }

    // Загрузка звука
    load = (path, callback) => {
        // Если звук уже загружен
        if (this.clips[path]) {
            callback(this.clips[path]); // Вызывается моментально
            return;
        }

        // Создает объект
        const clip = { path, buffer: null, loaded: false };

        // Удобная обертка
        clip.play = (volume = 1, loop = false) => {
            this.play(path, { looping: loop, volume });
        };

        // Сохраняем объект
        this.clips[path] = clip;

        const request = new XMLHttpRequest();
        request.open("GET", path, true); // Готовим запрос
        request.responseType = "arraybuffer"; // Тип ответа - "сырой" кусок памяти

        // Декодирование
        request.onload = () => {
            this.context.decodeAudioData(request.response, (buffer) => {
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            });
        };

        request.send(); // Отправляем
    }

    // Загрузка всех звуков
    loadAll = () => {
        this.sounds.forEach((path) => {
            this.load(path, () => {
                // Проверка, что ключей столько же, сколько длина массива с путями
                if (this.sounds.length === Object.keys(this.clips).length) {
                    for (const sd in this.clips) {
                        if (!this.clips[sd].loaded) return;
                    }
                    this.loaded = true; // Если все загрузились
                }
            });
        });
    }

    play = (path, settings) => {
        if (!this.loaded) { setTimeout(() => this.play(path, settings), 200); return; }

        const looping = !!(settings && settings.looping); // Приведение к булевому типу
        const volume  = (settings && settings.volume != null) ? settings.volume : 1;

        const sd = this.clips[path]; // Достаем клип
        if (!sd) return false;

        // Создаем одноразовый проигрыватель AudioBuffer
        const source = this.context.createBufferSource();
        source.buffer = sd.buffer;
        source.loop = looping;

        // Локальный мастер громкости
        const gain = this.context.createGain();
        gain.gain.value = volume;

        // Соединяем
        source.connect(gain);
        gain.connect(this.gainNode);

        // Проигрываем звук
        source.start(0);
        this._activeSources.add(source);

        // Очистка
        source.onended = () => {
            this._activeSources.delete(source);
            try { source.disconnect(); gain.disconnect(); } catch {}
        };

        return source;
    }

    // Разблокировка звука
    unlock = () => {
        if (this._unlocked) return;
        this._unlocked = true;

        if (this._paused) return;

        try { this.context?.resume(); } catch {}
    };

    // Ставим весь контекст на паузу
    pauseAll = () => {
        this._paused = true;
        try { this.context?.suspend(); } catch {}
    };

    // Продолжаем проигрывание всего контекста
    resumeAll = () => {
        this._paused = false;

        if (!this._unlocked) return;
            try { this.context?.resume(); } catch {}
    };

    // Обрубание всех звуков
    stopAll = () => {
        for (const s of this._activeSources) {
            try { s.stop(0); } catch {}
            try { s.disconnect(); } catch {}
        }
        this._activeSources.clear();
    };

    // Обертки
    playOnce = (path, volume = 1) => this.play(path, { looping: false, volume });
    playLoop = (path, volume = 1) => this.play(path, { looping: true, volume });
};