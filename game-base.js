const KEY='mini_biblio_20_v1';
const user=localStorage.getItem('usuario_actual');
if(!user)location.href='index.html';
let state=JSON.parse(localStorage.getItem(KEY)||'{"users":{}}');
let startTs=null; const $=id=>document.getElementById(id);
$('title').textContent=GAME_NAME; $('gameName').textContent=GAME_NAME;

if(!state.users[user])state.users[user]={username:user,games:{}};

function save(){localStorage.setItem(KEY,JSON.stringify(state));}

function createGameState(gameName, defaults={}){
  if(!state.users[user].games[gameName]){
    state.users[user].games[gameName]={
      totalMinutes:0,
      loginCount:0,
      lastPlayedAt:null,
      ...defaults
    };
    save();
  }
  return state.users[user].games[gameName];
}

function loadGameState(gameName){
  return state.users[user].games[gameName]||null;
}

function saveGameState(gameName, partial={}){
  const current=createGameState(gameName);
  state.users[user].games[gameName]={...current,...partial};
  save();
  return state.users[user].games[gameName];
}

function setStatus(text,type='info'){
  const el=$('sessionMsg');
  if(!el)return;
  el.textContent=text;
  el.dataset.type=type;
}

function resetSessionUI(){
  const isRunning=Boolean(startTs);
  if($('startBtn'))$('startBtn').disabled=isRunning;
  if($('endBtn'))$('endBtn').disabled=!isRunning;
}

const rec=createGameState(GAME_NAME);

$('startBtn').onclick=()=>{
  if(startTs)return;
  startTs=Date.now();
  const updated=saveGameState(GAME_NAME,{
    loginCount:rec.loginCount+1,
    lastPlayedAt:new Date().toISOString()
  });
  rec.loginCount=updated.loginCount;
  rec.lastPlayedAt=updated.lastPlayedAt;
  setStatus(`Jugando ${GAME_NAME} - Ingreso ${rec.loginCount}`,'success');
  resetSessionUI();
  document.dispatchEvent(new CustomEvent('game:start',{
    detail:{gameName:GAME_NAME,user,startedAt:updated.lastPlayedAt,state:updated}
  }));
};

$('endBtn').onclick=()=>{
  if(!startTs)return;
  const endedAt=new Date().toISOString();
  const m=Math.max(1,Math.round((Date.now()-startTs)/60000));
  const updated=saveGameState(GAME_NAME,{
    totalMinutes:rec.totalMinutes+m,
    lastPlayedAt:endedAt
  });
  rec.totalMinutes=updated.totalMinutes;
  rec.lastPlayedAt=updated.lastPlayedAt;
  startTs=null;
  setStatus(`Sesión terminada (+${m} min)`,'info');
  resetSessionUI();
  document.dispatchEvent(new CustomEvent('game:end',{
    detail:{gameName:GAME_NAME,user,endedAt,durationMinutes:m,state:updated}
  }));
};

resetSessionUI();
