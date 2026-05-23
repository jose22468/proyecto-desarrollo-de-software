const ADMIN_USER='admin',ADMIN_PASS='1234',KEY='mini_biblio_20_v1';
const GAMES=[
['Culebrita','01-culebrita.html'],['3 en Raya','02-tres-en-raya.html'],['Ajedrez Mini','03-ajedrez-mini.html'],['Memoria','04-memoria.html'],['Piedra Papel Tijera','05-piedra-papel-tijera.html'],['Ahorcado','06-ahorcado.html'],['Buscaminas Lite','07-buscaminas-lite.html'],['Laberinto','08-laberinto.html'],['2048 Lite','09-2048-lite.html'],['Sudoku Mini','10-sudoku-mini.html'],['Conecta 4 Mini','11-conecta4-mini.html'],['Rompecabezas 8','12-rompecabezas-8.html'],['Quiz Rápido','13-quiz-rapido.html'],['Simon Dice','14-simon-dice.html'],['Whack-a-Mole','15-whack-a-mole.html'],['Reacción','16-reaccion.html'],['Gato y Ratón','17-gato-y-raton.html'],['Torre Hanoi','18-torre-hanoi.html'],['Damas Mini','19-damas-mini.html'],['Tetris Lite','20-tetris-lite.html']
];
let state=JSON.parse(localStorage.getItem(KEY)||'{"users":{}}');
let currentUser=localStorage.getItem('usuario_actual')||'';
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function ensureUser(u){if(!state.users[u])state.users[u]={username:u,games:{}};GAMES.forEach(([g])=>state.users[u].games[g]??={totalMinutes:0,loginCount:0,lastPlayedAt:null});}
function render(){
 $('gamesGrid').innerHTML=GAMES.map(([n,u])=>`<div class='card'><h4>${n}</h4><button onclick="playGame('${u}')">Jugar</button></div>`).join('');
 if(currentUser){ensureUser(currentUser);const rows=GAMES.map(([g])=>{const r=state.users[currentUser].games[g];return `<tr><td>${g}</td><td>${r.totalMinutes}</td><td>${r.loginCount}</td><td>${r.lastPlayedAt?new Date(r.lastPlayedAt).toLocaleString():'-'}</td></tr>`;}).join('');$('myRecord').innerHTML=`<table><tr><th>Juego</th><th>Min</th><th>Ingresos</th><th>Última vez</th></tr>${rows}</table>`;}else $('myRecord').innerHTML='Inicia sesión';
 $('sessionInfo').textContent=`Usuario actual: ${currentUser||'ninguno'}`;
}
window.playGame=(url)=>{if(!currentUser)return alert('Inicia sesión primero');location.href=url;};
$('loginBtn').onclick=()=>{const u=$('username').value.trim().toLowerCase(),p=$('password').value.trim();if(!u)return; if(u===ADMIN_USER&&p!==ADMIN_PASS)return alert('Clave admin incorrecta'); currentUser=u; localStorage.setItem('usuario_actual',u); ensureUser(u); save(); render();};
render();
