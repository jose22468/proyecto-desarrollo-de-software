const KEY='mini_biblio_20_v1';
const user=localStorage.getItem('usuario_actual');
if(!user)location.href='index.html';
let state=JSON.parse(localStorage.getItem(KEY)||'{"users":{}}');
let startTs=null; const $=id=>document.getElementById(id);
$('title').textContent=GAME_NAME; $('gameName').textContent=GAME_NAME;
if(!state.users[user])state.users[user]={username:user,games:{}};
if(!state.users[user].games[GAME_NAME])state.users[user].games[GAME_NAME]={totalMinutes:0,loginCount:0,lastPlayedAt:null};
const rec=state.users[user].games[GAME_NAME];
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
$('startBtn').onclick=()=>{if(startTs)return;startTs=Date.now();rec.loginCount++;rec.lastPlayedAt=new Date().toISOString();save();$('sessionMsg').textContent=`Jugando ${GAME_NAME} - Ingreso ${rec.loginCount}`;};
$('endBtn').onclick=()=>{if(!startTs)return;const m=Math.max(1,Math.round((Date.now()-startTs)/60000));rec.totalMinutes+=m;rec.lastPlayedAt=new Date().toISOString();save();startTs=null;$('sessionMsg').textContent=`Sesión terminada (+${m} min)`;};
