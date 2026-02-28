const RECORDS_KEY = "records";

const body = document.getElementById("recordsBody");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

// Получение и обработка данных с localStorage
const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");

body.innerHTML = ""; // Очистка таблицы

for (let i = 0; i < records.length; i++) {
  const r = records[i];
  const tr = document.createElement("tr");
  // Формируем строку таблицы
  tr.innerHTML = `
    <td>${i + 1}</td>
    <td>${r.name ?? ""}</td>
    <td>${r.timeMs ?? ""}</td>
  `;
  body.appendChild(tr); // Добавляем в таблицу
}

if (records.length === 0) {
  const tr = document.createElement("tr");
  // Надпись на все три колонки таблицы
  tr.innerHTML = `<td colspan="3">Рекордов пока нет</td>`;
  body.appendChild(tr);
}

restartBtn.addEventListener("click", () => {
  location.href = "game.html";
});

menuBtn.addEventListener("click", () => {
  location.href = "login.html";
});
