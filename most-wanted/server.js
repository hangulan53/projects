const express = require('express'); // Подключаем библиотеку express
const path = require('path'); // Подключаем встроенный модуль path

const app = express(); // Создаем экземпляр приложения Express
const PORT = process.env.PORT || 3000; // Либо переменная окружения, либо 3000

// Раздача статических файлов
app.use(express.static(
    path.resolve(__dirname) // Делает абсолютные пути
));

app.listen(PORT, () => { // Запускаем сервер
    console.log(`Server started and running at http://localhost:${PORT}`)
});