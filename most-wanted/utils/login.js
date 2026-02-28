const NAME_KEY = "playerName";

// Ищем элемент с id="nameInput"
const input = document.getElementById("nameInput");
// Ищем элемент с id="startBtn"
const btn = document.getElementById("startBtn");

const saved = localStorage.getItem(NAME_KEY);
// Если есть сохраненное имя - используем
if (saved) input.value = saved;

function start() {
  const name = input.value.trim(); // Удаляем пробелы
  if (!name) return;

  // Сохраняем имя
  localStorage.setItem(NAME_KEY, name);
  // Переходим на страницу игры
  location.href = "game.html";
}

// Слушаем клики
btn.addEventListener("click", start);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") start(); // Или нажатие Enter
});
