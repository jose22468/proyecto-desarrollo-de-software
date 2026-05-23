const ADMIN_USER="admin", ADMIN_PASS="1234";
const STORAGE_KEY="mini_biblio_20_v1";

const GAMES = [
  ["Culebrita","01-culebrita.html"],
  ["3 en Raya","02-tres-en-raya.html"],
  ["Ajedrez Mini","03-ajedrez-mini.html"],
  ["Memoria","04-memoria.html"],
  ["Piedra Papel Tijera","05-piedra-papel-tijera.html"],
  ["Ahorcado","06-ahorcado.html"],
  ["Buscaminas Lite","07-buscaminas-lite.html"],
  ["Laberinto","08-laberinto.html"],
  ["2048 Lite","09-2048-lite.html"],
  ["Sudoku Mini","10-sudoku-mini.html"],
  ["Conecta 4 Mini","11-conecta4-mini.html"],
  ["Rompecabezas 8","12-rompecabezas-8.html"],
  ["Quiz Rápido","13-quiz-rapido.html"],
  ["Simon Dice","14-simon-dice.html"],
  ["Whack-a-Mole","15-whack-a-mole.html"],
  ["Reacción","16-reaccion.html"],
  ["Gato y Ratón","17-gato-y-raton.html"],
  ["Torre Hanoi","18-torre-hanoi.html"],
  ["Damas Mini","19-damas-mini.html"],
  ["Tetris Lite","20-tetris-lite.html"]
];

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"users":{}}');
let currentUser = localStorage.getItem("usuario_actual") || "";
let isAdmin = localStorage.getItem("is_admin")==="1";

const $ = id => document.getElementById(id);
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function ensureUser(u){
  if(!state.users[u]) state.users[u]={username:u,games:{}};
  GAMES.forEach(([g])=>{
    if(!state.users[u].games[g]) state.users[u].games[g]={totalMinutes:0,loginCount:0,lastPlayedAt:null};
  });
}

function renderGames(){
  $("gamesGrid").innerHTML = GAMES.map(([name,url])=>`
    <div class="card"><h4>${name}</h4><button onclick="playGame('${url}')">Jugar</button></div>
  `).join("");
  $("editGame").innerHTML = GAMES.map(([g])=>`<option>${g}</option>`).join("");
}
function playGame(url){
  if(!currentUser){ alert("Inicia sesión primero."); return; }
  location.href = url;
}
window.playGame = playGame;

$("loginBtn").onclick=()=>{
  const u=$("username").value.trim().toLowerCase();
  const p=$("password").value.trim();
  if(!u) return alert("Escribe usuario");
  if(u===ADMIN_USER && p!==ADMIN_PASS) return alert("Clave admin incorrecta");
  currentUser=u; isAdmin=(u===ADMIN_USER);
  localStorage.setItem("usuario_actual", currentUser);
  localStorage.setItem("is_admin", isAdmin?"1":"0");
  ensureUser(currentUser); save(); renderAll();
};

function renderMyRecord(){
  if(!currentUser){ $("myRecord").innerHTML="Inicia sesión."; return; }
  ensureUser(currentUser);
  const rows = GAMES.map(([g])=>{
    const r=state.users[currentUser].games[g];
    return `<tr><td>${g}</td><td>${r.totalMinutes}</td><td>Ingreso ${r.loginCount}</td><td>${r.lastPlayedAt?new Date(r.lastPlayedAt).toLocaleString():"-"}</td></tr>`;
  }).join("");
  $("myRecord").innerHTML=`<table><thead><tr><th>Juego</th><th>Min</th><th>Ingresos</th><th>Última vez</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function renderStats(){
  let totals={}, usersBy={};
  GAMES.forEach(([g])=>{totals[g]=0; usersBy[g]=new Set();});
  Object.values(state.users).forEach(u=>{
    GAMES.forEach(([g])=>{
      const r=u.games[g];
      totals[g]+=r.totalMinutes;
      if(r.loginCount>0||r.totalMinutes>0) usersBy[g].add(u.username);
    });
  });
  let top=["-", -1];
  GAMES.forEach(([g])=>{ if(totals[g]>top[1]) top=[g,totals[g]]; });
  $("topGame").textContent=`Juego más jugado: ${top[0]} (${Math.max(0,top[1])} min)`;
  $("stats").innerHTML=`<table><thead><tr><th>Juego</th><th>Minutos</th><th>Usuarios</th></tr></thead><tbody>${
    GAMES.map(([g])=>`<tr><td>${g}</td><td>${totals[g]}</td><td>${usersBy[g].size}</td></tr>`).join("")
  }</tbody></table>`;
}
$("saveEdit").onclick=()=>{
  if(!isAdmin) return alert("Solo admin");
  const u=$("editUser").value.trim().toLowerCase();
  const g=$("editGame").value;
  const m=Number($("editMinutes").value);
  if(!u || isNaN(m) || m<0) return alert("Datos inválidos");
  ensureUser(u);
  state.users[u].games[g].totalMinutes=m;
  save(); renderAll();
  $("adminMsg").textContent=`Actualizado ${u} en ${g}: ${m} min`;
};
function renderAll(){
  $("sessionInfo").textContent=`Usuario actual: ${currentUser||"ninguno"} ${isAdmin?"(admin)":""}`;
  $("adminPanel").hidden=!isAdmin;
  renderMyRecord(); renderStats();
}
renderGames(); renderAll();
