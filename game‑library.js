/* ================================
   Mini Biblioteca de Juegos (20)
   ================================ */

const GAMES = [
  "Culebrita", "3 en Raya", "Ajedrez", "Memoria", "Piedra Papel Tijera",
  "Ahorcado", "Buscaminas Lite", "Laberinto", "2048 Lite", "Sudoku Mini",
  "Conecta 4 Mini", "Rompecabezas 8", "Quiz Rápido", "Simon Dice",
  "Whack-a-Mole", "Reacción", "Gato y Ratón", "Torre de Hanoi",
  "Damas Mini", "Tetris Lite"
];

const STORAGE_KEY = "mini_biblioteca_juegos_v1";
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

let state = loadState();
let currentUser = null;
let isAdmin = false;

let selectedGame = null;
let gameStartTimestamp = null;

const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const currentUserInfo = document.getElementById("currentUserInfo");
const adminInfo = document.getElementById("adminInfo");

const gamesGrid = document.getElementById("gamesGrid");
const gameStatus = document.getElementById("gameStatus");
const startGameBtn = document.getElementById("startGameBtn");
const endGameBtn = document.getElementById("endGameBtn");
const gameArea = document.getElementById("gameArea");

const refreshStatsBtn = document.getElementById("refreshStatsBtn");
const mostPlayedGame = document.getElementById("mostPlayedGame");
const statsTableContainer = document.getElementById("statsTableContainer");

const userRecord = document.getElementById("userRecord");

const adminPanel = document.getElementById("adminPanel");
const adminUser = document.getElementById("adminUser");
const adminGameSelect = document.getElementById("adminGameSelect");
const adminMinutes = document.getElementById("adminMinutes");
const adminUpdateBtn = document.getElementById("adminUpdateBtn");
const adminMsg = document.getElementById("adminMsg");

// ---------- Inicialización ----------
renderGames();
renderAdminGameOptions();
renderStats();
renderUserRecord();
updateAuthUI();

loginBtn.addEventListener("click", login);
startGameBtn.addEventListener("click", startGameSession);
endGameBtn.addEventListener("click", endGameSession);
refreshStatsBtn.addEventListener("click", renderStats);
adminUpdateBtn.addEventListener("click", adminUpdateTime);

// ---------- Estado ----------
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: {} };
  try { return JSON.parse(raw); } catch { return { users: {} }; }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function ensureUser(username) {
  if (!state.users[username]) {
    state.users[username] = {
      username,
      games: {} // gameName: { totalMinutes, loginCount, lastPlayedAt }
    };
  }
  GAMES.forEach(g => {
    if (!state.users[username].games[g]) {
      state.users[username].games[g] = { totalMinutes: 0, loginCount: 0, lastPlayedAt: null };
    }
  });
}

// ---------- Login ----------
function login() {
  const username = usernameInput.value.trim().toLowerCase();
  if (!username) return alert("Ingresa un nombre de usuario.");

  if (username === ADMIN_USER) {
    const pass = prompt("Clave de administrador:");
    if (pass !== ADMIN_PASS) {
      alert("Clave incorrecta.");
      return;
    }
    isAdmin = true;
  } else {
    isAdmin = false;
  }

  currentUser = username;
  ensureUser(currentUser);
  saveState();
  updateAuthUI();
  renderUserRecord();
  alert(`Bienvenido/a ${currentUser}`);
}
function updateAuthUI() {
  currentUserInfo.innerHTML = `Usuario actual: <strong>${currentUser || "Ninguno"}</strong>`;
  adminInfo.innerHTML = `Modo admin: <strong>${isAdmin ? "Sí" : "No"}</strong>`;
  adminPanel.hidden = !isAdmin;
}

// ---------- Juegos ----------
function renderGames() {
  gamesGrid.innerHTML = "";
  GAMES.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <h4>${game}</h4>
      <button data-game="${game}">Seleccionar</button>
    `;
    card.querySelector("button").addEventListener("click", () => selectGame(game));
    gamesGrid.appendChild(card);
  });
}
function selectGame(game) {
  selectedGame = game;
  gameStatus.textContent = `Juego seleccionado: ${game}`;
  startGameBtn.disabled = !currentUser;
  endGameBtn.disabled = true;
  gameStartTimestamp = null;

  document.querySelectorAll(".game-card").forEach(c => c.classList.remove("active"));
  [...document.querySelectorAll(".game-card h4")].forEach(h => {
    if (h.textContent === game) h.parentElement.classList.add("active");
  });

  renderSimpleGameUI(game);
}

// UI mínima funcional de juegos (interactivos simples)
function renderSimpleGameUI(game) {
  const gameUIs = {
    "3 en Raya": ticTacToeUI,
    "Piedra Papel Tijera": rpsUI,
    "Ahorcado": hangmanUI,
    "Quiz Rápido": quizUI
  };
  if (gameUIs[game]) gameUIs[game]();
  else gameArea.innerHTML = `<p>Este juego está disponible en modo rápido: inicia y finaliza para registrar tiempo.</p>`;
}

function startGameSession() {
  if (!currentUser) return alert("Debes iniciar sesión.");
  if (!selectedGame) return alert("Selecciona un juego.");
  if (gameStartTimestamp) return alert("Ya hay una sesión activa.");

  gameStartTimestamp = Date.now();

  // ingreso consecutivo por juego
  const rec = state.users[currentUser].games[selectedGame];
  rec.loginCount += 1;
  rec.lastPlayedAt = new Date().toISOString();

  saveState();
  renderUserRecord();

  gameStatus.innerHTML = `Jugando <strong>${selectedGame}</strong> - Ingreso #${rec.loginCount}`;
  startGameBtn.disabled = true;
  endGameBtn.disabled = false;
}

function endGameSession() {
  if (!gameStartTimestamp || !selectedGame || !currentUser) return;

  const end = Date.now();
  const minutes = Math.max(1, Math.round((end - gameStartTimestamp) / 60000));

  const rec = state.users[currentUser].games[selectedGame];
  rec.totalMinutes += minutes;
  rec.lastPlayedAt = new Date().toISOString();

  gameStartTimestamp = null;
  saveState();

  gameStatus.innerHTML = `Finalizaste ${selectedGame}. Tiempo sumado: <strong>${minutes} min</strong>`;
  startGameBtn.disabled = false;
  endGameBtn.disabled = true;

  renderStats();
  renderUserRecord();
}

// ---------- Estadísticas ----------
function buildGlobalStats() {
  const gameTotals = {};
  const uniqueUsersByGame = {};
  GAMES.forEach(g => {
    gameTotals[g] = 0;
    uniqueUsersByGame[g] = new Set();
  });

  Object.values(state.users).forEach(user => {
    GAMES.forEach(g => {
      const rec = user.games[g];
      if (rec.totalMinutes > 0 || rec.loginCount > 0) uniqueUsersByGame[g].add(user.username);
      gameTotals[g] += rec.totalMinutes;
    });
  });

  return { gameTotals, uniqueUsersByGame };
}

function renderStats() {
  const { gameTotals, uniqueUsersByGame } = buildGlobalStats();

  let topGame = "-";
  let topMinutes = -1;
  GAMES.forEach(g => {
    if (gameTotals[g] > topMinutes) {
      topMinutes = gameTotals[g];
      topGame = g;
    }
  });

  mostPlayedGame.textContent = `Juego más jugado: ${topGame} (${Math.max(0, topMinutes)} min)`;

  let html = `<table>
    <thead><tr><th>Juego</th><th>Minutos totales</th><th>Usuarios que jugaron</th></tr></thead>
    <tbody>`;
  GAMES.forEach(g => {
    html += `<tr>
      <td>${g}</td>
      <td>${gameTotals[g]}</td>
      <td>${uniqueUsersByGame[g].size}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  statsTableContainer.innerHTML = html;
}

// ---------- Registro usuario ----------
function renderUserRecord() {
  if (!currentUser) {
    userRecord.innerHTML = "<p>Inicia sesión para ver tu registro.</p>";
    return;
  }
  const data = state.users[currentUser];
  let html = `<table>
    <thead><tr><th>Juego</th><th>Tiempo acumulado (min)</th><th>Ingresos</th><th>Última vez</th></tr></thead>
    <tbody>`;

  GAMES.forEach(g => {
    const rec = data.games[g];
    html += `<tr>
      <td>${g}</td>
      <td>${rec.totalMinutes}</td>
      <td>Ingreso ${rec.loginCount}</td>
      <td>${rec.lastPlayedAt ? new Date(rec.lastPlayedAt).toLocaleString() : "-"}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  userRecord.innerHTML = html;
}

// ---------- Admin ----------
function renderAdminGameOptions() {
  adminGameSelect.innerHTML = "";
  GAMES.forEach(g => {
    const op = document.createElement("option");
    op.value = g;
    op.textContent = g;
    adminGameSelect.appendChild(op);
  });
}

function adminUpdateTime() {
  if (!isAdmin) return alert("Solo el administrador puede editar.");
  const u = adminUser.value.trim().toLowerCase();
  const g = adminGameSelect.value;
  const m = Number(adminMinutes.value);

  if (!u || !g || Number.isNaN(m) || m < 0) {
    adminMsg.textContent = "Datos inválidos.";
    adminMsg.className = "warning";
    return;
  }

  ensureUser(u);
  state.users[u].games[g].totalMinutes = m;
  saveState();
  renderStats();
  if (currentUser === u) renderUserRecord();

  adminMsg.textContent = `Actualizado: ${u} ahora tiene ${m} min en ${g}.`;
  adminMsg.className = "success";
}

// ---------- Mini juegos simples funcionales ----------
function ticTacToeUI() {
  let board = Array(9).fill("");
  let turn = "X";
  gameArea.innerHTML = `
    <p>3 en Raya (X/O)</p>
    <div id="ttt" style="display:grid;grid-template-columns:repeat(3,60px);gap:4px;"></div>
    <p id="tttMsg">Turno: X</p>
  `;
  const grid = document.getElementById("ttt");
  const msg = document.getElementById("tttMsg");

  board.forEach((_, i) => {
    const b = document.createElement("button");
    b.style.height = "60px";
    b.textContent = "";
    b.onclick = () => {
      if (board[i]) return;
      board[i] = turn;
      b.textContent = turn;
      if (checkWinner(board, turn)) {
        msg.textContent = `Ganó ${turn}`;
        grid.querySelectorAll("button").forEach(btn => btn.disabled = true);
        return;
      }
      if (board.every(c => c)) {
        msg.textContent = "Empate";
        return;
      }
      turn = turn === "X" ? "O" : "X";
      msg.textContent = `Turno: ${turn}`;
    };
    grid.appendChild(b);
  });
}
function checkWinner(b, t) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
  ];
  return wins.some(w => w.every(i => b[i] === t));
}

function rpsUI() {
  gameArea.innerHTML = `
    <p>Piedra, Papel o Tijera</p>
    <div class="row">
      <button data-v="piedra">Piedra</button>
      <button data-v="papel">Papel</button>
      <button data-v="tijera">Tijera</button>
    </div>
    <p id="rpsMsg">Elige una opción.</p>
  `;
  const opts = ["piedra", "papel", "tijera"];
  const msg = document.getElementById("rpsMsg");
  gameArea.querySelectorAll("button[data-v]").forEach(btn => {
    btn.onclick = () => {
      const you = btn.dataset.v;
      const cpu = opts[Math.floor(Math.random() * 3)];
      let res = "Empate";
      if (
        (you === "piedra" && cpu === "tijera") ||
        (you === "papel" && cpu === "piedra") ||
        (you === "tijera" && cpu === "papel")
      ) res = "Ganaste";
      else if (you !== cpu) res = "Perdiste";
      msg.textContent = `Tú: ${you} | CPU: ${cpu} => ${res}`;
    };
  });
}

function hangmanUI() {
  const words = ["ajedrez", "culebra", "javascript", "biblioteca"];
  const word = words[Math.floor(Math.random() * words.length)];
  let guessed = new Set();
  let tries = 6;

  gameArea.innerHTML = `
    <p>Ahorcado (intentos: <span id="tries">${tries}</span>)</p>
    <p id="mask"></p>
    <input id="letter" maxlength="1" placeholder="letra" />
    <button id="guessBtn">Probar</button>
    <p id="hangMsg"></p>
  `;

  const maskEl = document.getElementById("mask");
  const triesEl = document.getElementById("tries");
  const letterEl = document.getElementById("letter");
  const msg = document.getElementById("hangMsg");

  function draw() {
    maskEl.textContent = word.split("").map(ch => guessed.has(ch) ? ch : "_").join(" ");
  }
  draw();

  document.getElementById("guessBtn").onclick = () => {
    const l = letterEl.value.toLowerCase();
    letterEl.value = "";
    if (!l.match(/[a-zñ]/)) return;
    if (guessed.has(l)) return;

    guessed.add(l);
    if (!word.includes(l)) tries--;
    triesEl.textContent = tries;
    draw();

    const won = word.split("").every(ch => guessed.has(ch));
    if (won) msg.textContent = "¡Ganaste!";
    else if (tries <= 0) msg.textContent = `Perdiste. Palabra: ${word}`;
  };
}

function quizUI() {
  const q = {
    text: "¿Cuál estructura funciona FIFO?",
    options: ["Pila", "Cola", "Árbol", "Grafo"],
    answer: "Cola"
  };
  gameArea.innerHTML = `
    <p>${q.text}</p>
    <div id="quizOps"></div>
    <p id="quizMsg"></p>
  `;
  const box = document.getElementById("quizOps");
  const msg = document.getElementById("quizMsg");

  q.options.forEach(op => {
    const b = document.createElement("button");
    b.textContent = op;
    b.onclick = () => {
      msg.textContent = (op === q.answer) ? "Correcto ✅" : "Incorrecto ❌";
    };
    box.appendChild(b);
  });
}
