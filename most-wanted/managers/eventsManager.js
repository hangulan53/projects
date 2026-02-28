export class EventsManager {
    constructor() {
        this.bind = {
            87: "up", // W
            83: "down", // S
            65: "left", // A
            68: "right", // D

            32: "mine", // Space
            16: "nitro", // Shift
            69: "repair" // E
        };

        // Состояние действий
        this.action = {};

        // Подключение обработчиков клавиатуры
        this.setup = () => {
            document.body.addEventListener("keydown", this.onKeyDown);
            document.body.addEventListener("keyup", this.onKeyUp);
        };

        // Обработчик нажатия клавиш
        this.onKeyDown = (e) => {
            const action = this.bind[e.keyCode];
            if (action) {
                this.action[action] = true;
                e.preventDefault();
            }
        };

        // Обработчик отпускания клавиш
        this.onKeyUp = (e) => {
            const action = this.bind[e.keyCode];
            if (action) {
                this.action[action] = false;
                e.preventDefault();
            }
        };
    }
}