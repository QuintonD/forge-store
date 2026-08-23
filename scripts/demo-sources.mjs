
const SNAKE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; overflow:hidden; background:#0a0714;
    font-family: ui-monospace, Menlo, Consolas, monospace; color:#f5d0fe;
    display:flex; align-items:center; justify-content:center;
    user-select:none; -webkit-user-select:none; touch-action:none; }
  #stage { position:relative; width:min(96vmin, 640px); aspect-ratio:4/3; }
  canvas { width:100%; height:100%; display:block; border-radius:12px;
    border:1px solid rgba(217,70,239,.35); box-shadow:0 0 44px rgba(217,70,239,.18), inset 0 0 60px rgba(34,211,238,.05); }
  .hud { position:absolute; top:-38px; left:2px; right:2px; display:flex; justify-content:space-between;
    font-size:14px; letter-spacing:.14em; color:#67e8f9; text-shadow:0 0 12px rgba(103,232,249,.6); }
  .hud b { color:#f0abfc; }
  .overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:14px; background:rgba(10,7,20,.82); backdrop-filter:blur(4px); border-radius:12px; text-align:center; cursor:pointer; }
  .title { font-size:clamp(26px,6vw,42px); font-weight:800; letter-spacing:.22em; color:#f0abfc;
    text-shadow:0 0 22px rgba(217,70,239,.85), 0 0 60px rgba(217,70,239,.4); }
  .sub { font-size:13px; letter-spacing:.28em; color:#67e8f9; animation:blink 1.4s step-end infinite; }
  @keyframes blink { 50% { opacity:.25; } }
  .keys { font-size:11px; color:#8b93a7; letter-spacing:.12em; line-height:1.9; }
  kbd { background:#1c1027; border:1px solid #4a1d5e; border-radius:4px; padding:1px 7px; color:#f0abfc; font-size:11px; }
  .combo { position:absolute; pointer-events:none; font-weight:800; color:#fef08a;
    text-shadow:0 0 14px rgba(254,240,138,.9); animation:rise .9s ease-out forwards; z-index:5; }
  @keyframes rise { from { opacity:1; transform:translateY(0) scale(.9);} to { opacity:0; transform:translateY(-46px) scale(1.25);} }
  .fhint { position:absolute; bottom:-34px; left:0; right:0; text-align:center; font-size:11px;
    letter-spacing:.18em; color:#8b93a7; transition:opacity .5s; z-index:6; }
  .fhint.gone { opacity:0; }
  @keyframes rise { from { opacity:1; transform:translateY(0) scale(.9);} to { opacity:0; transform:translateY(-46px) scale(1.25);} }
</style>
</head>
<body>
<div id="stage">
  <div class="hud"><span>SCORE <b id="score">0</b></span><span>BEST <b id="best">0</b></span><span id="speed">x1.0</span></div>
  <canvas id="cv" width="640" height="480"></canvas>
  <div class="overlay" id="ov">
    <div class="title">NEON SERPENT</div>
    <div class="sub" id="ovsub">PRESS ANY ARROW TO BEGIN</div>
    <div class="keys">
      <kbd>&larr;</kbd><kbd>&uarr;</kbd><kbd>&darr;</kbd><kbd>&rarr;</kbd> or <kbd>WASD</kbd> steer &nbsp;&middot;&nbsp; <kbd>SPACE</kbd> pause<br>
      obstacles sync to the beat &middot; thread gaps at speed for combos
    </div>
  </div>
  <div class="fhint" id="fhint">CLICK THE ARENA ONCE, THEN STEER WITH ARROWS / WASD â€” OR SWIPE ON TOUCH</div>
</div>
<script>
(function(){
  var cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  var COLS = 32, ROWS = 24, CW = cv.width/COLS, CH = cv.height/ROWS;
  var scoreEl = document.getElementById('score'), bestEl = document.getElementById('best'),
      speedEl = document.getElementById('speed'), ov = document.getElementById('ov'),
      ovsub = document.getElementById('ovsub');
  var snake, dir, nextDir, food, obs, score, best, dead, paused, started, tick, acc, last, comboN, eats;
  best = 0;

  function reset(){
    snake = [{x:8,y:12},{x:7,y:12},{x:6,y:12}];
    dir = {x:1,y:0}; nextDir = dir; obs = []; score = 0; comboN = 0; eats = 0;
    dead = false; paused = false; started = false; acc = 0; last = performance.now();
    tick = 130; placeFood(); upd();
    ov.style.display = 'flex';
    ovsub.textContent = 'PRESS ANY ARROW TO BEGIN';
  }
  function upd(){ scoreEl.textContent = score; bestEl.textContent = best; speedEl.textContent = 'x' + (130/tick).toFixed(1); }

  function free(){
    var taken = {};
    snake.forEach(function(s){ taken[s.x + ',' + s.y] = 1; });
    obs.forEach(function(o){ taken[o.x + ',' + o.y] = 1; });
    taken[food ? food.x + ',' + food.y : '-1,-1'] = 1;
    var p;
    do { p = { x: (Math.random()*COLS)|0, y: (Math.random()*ROWS)|0 }; } while (taken[p.x+','+p.y]);
    return p;
  }
  function placeFood(){ food = free(); }

  function popText(txt, x, y){
    var d = document.createElement('div');
    d.className = 'combo'; d.textContent = txt;
    d.style.left = (x / cv.width * 100) + '%';
    d.style.top = (y / cv.height * 100) + '%';
    document.getElementById('stage').appendChild(d);
    setTimeout(function(){ d.remove(); }, 900);
  }

  function die(){
    dead = true;
    if (score > best) { best = score; }
    ov.style.display = 'flex';
    ovsub.innerHTML = 'SIGNAL LOST &mdash; SCORE ' + score + '<br>PRESS ANY ARROW TO REBOOT';
    upd();
  }

  function step(){
    if (!started || dead || paused) return;
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return die();
    for (var i = 0; i < snake.length; i++) if (snake[i].x===head.x && snake[i].y===head.y) return die();
    for (var j = 0; j < obs.length; j++) if (obs[j].x===head.x && obs[j].y===head.y) return die();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y){
      score += 10 + comboN * 2; comboN++; eats++;
      placeFood();
      if (eats % 4 === 0 && obs.length < 26){ obs.push(free()); popText('+OBSTACLE', Math.random()*70+15, 40); }
      if (tick > 62) tick -= 2.5;
      upd();
    } else {
      snake.pop();
      comboN = Math.max(0, comboN - 1);
      if (comboN > 3 && Math.random() < .3) popText('COMBO x' + comboN, Math.random()*60+20, Math.random()*40+30);
    }
  }

  var beat = 0;
  function draw(now){
    ctx.clearRect(0,0,cv.width,cv.height);
    var g = ctx.createLinearGradient(0,0,cv.width,cv.height);
    g.addColorStop(0,'#12081f'); g.addColorStop(1,'#0a0714');
    ctx.fillStyle = g; ctx.fillRect(0,0,cv.width,cv.height);

    ctx.strokeStyle = 'rgba(217,70,239,.07)'; ctx.lineWidth = 1;
    var pulse = .07 + .04 * Math.abs(Math.sin(now/300));
    ctx.beginPath();
    for (var cx = 0; cx <= COLS; cx++){ ctx.moveTo(cx*CW,0); ctx.lineTo(cx*CW,cv.height); }
    for (var cy = 0; cy <= ROWS; cy++){ ctx.moveTo(0,cy*CH); ctx.lineTo(cv.width,cy*CH); }
    ctx.stroke();

    beat = Math.sin(now/300);
    ctx.save();
    ctx.shadowColor = '#f0abfc'; ctx.shadowBlur = 14 + 6*beat;
    for (var oi = 0; oi < obs.length; oi++){
      ctx.fillStyle = '#86198f';
      roundRect(obs[oi].x*CW+3, obs[oi].y*CH+3, CW-6, CH-6, 4); ctx.fill();
      ctx.strokeStyle = '#e879f9'; ctx.lineWidth = 1.5;
      roundRect(obs[oi].x*CW+3, obs[oi].y*CH+3, CW-6, CH-6, 4); ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 18 + 10*Math.abs(beat);
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(food.x*CW+CW/2, food.y*CH+CH/2, CW*.3, 0, 7); ctx.fill();
    ctx.restore();

    for (var si = snake.length-1; si >= 0; si--){
      var t = si/snake.length, hue = 190 + t*80;
      ctx.save();
      ctx.shadowColor = si===0 ? '#67e8f9' : 'hsl(' + hue + ',95%,65%)';
      ctx.shadowBlur = si===0 ? 22 : 12;
      ctx.fillStyle = si===0 ? '#cffafe' : 'hsl(' + hue + ',90%,' + (58 - t*14) + '%)';
      var pad = si===0 ? 1.5 : 3;
      roundRect(snake[si].x*CW+pad, snake[si].y*CH+pad, CW-pad*2, CH-pad*2, 5); ctx.fill();
      ctx.restore();
    }

    if (paused && !dead){
      ctx.fillStyle = 'rgba(10,7,20,.7)'; ctx.fillRect(0,0,cv.width,cv.height);
      ctx.fillStyle = '#f0abfc'; ctx.font = '800 34px ui-monospace,monospace';
      ctx.textAlign = 'center'; ctx.fillText('PAUSED', cv.width/2, cv.height/2);
    }
    requestAnimationFrame(draw);
  }
  function roundRect(x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function setDir(nx,ny){
    if (dead){ reset(); return; }
    if (!started){ started = true; ov.style.display = 'none'; }
    if (dir.x === -nextDir.x && dir.y === -nextDir.y) return;
    nextDir = { x:nx, y:ny };
  }
  window.addEventListener('keydown', function(e){
    var k = e.key.toLowerCase();
    if (k==='arrowleft'||k==='a') setDir(-1,0);
    else if (k==='arrowright'||k==='d') setDir(1,0);
    else if (k==='arrowup'||k==='w') setDir(0,-1);
    else if (k==='arrowdown'||k==='s') setDir(0,1);
    else if (k===' ') { e.preventDefault(); if(started&&!dead) paused=!paused; }
    else if (!started && !dead){ setDir(1,0); }
  });
  var tx=0, ty=0;
  document.addEventListener('touchstart', function(e){ tx=e.touches[0].clientX; ty=e.touches[0].clientY; }, {passive:true});
  document.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX-tx, dy = e.changedTouches[0].clientY-ty;
    if (Math.abs(dx)<18 && Math.abs(dy)<18){ if(!started||dead) setDir(1,0); return; }
    if (Math.abs(dx)>Math.abs(dy)) setDir(dx>0?1:-1,0); else setDir(0,dy>0?1:-1);
  }, {passive:true});
  ov.addEventListener('click', function(){ if(dead) reset(); else setDir(1,0); });
  var fhint = document.getElementById('fhint');
  function killHint(){ fhint.classList.add('gone'); }
  document.addEventListener('pointerdown', killHint, {once:true});
  window.addEventListener('keydown', killHint, {once:true});
  document.addEventListener('touchstart', killHint, {once:true});

  reset();
  last = performance.now();
  function loop(now){
    var dt = Math.min(now - last, 100);
    last = now;
    if (started && !dead && !paused){
      acc += dt;
      while (acc >= tick){ acc -= tick; step(); }
    } else {
      acc = 0;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const G2048 = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; overflow:hidden; background:#140b02; color:#ffedd5;
    font-family: ui-sans-serif, system-ui, sans-serif; user-select:none; -webkit-user-select:none;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; touch-action:none; }
  .top { width:min(92vmin,460px); display:flex; align-items:flex-end; justify-content:space-between; }
  h1 { font-size:34px; letter-spacing:-.03em; background:linear-gradient(120deg,#fbbf24,#f97316,#fb7185);
    -webkit-background-clip:text; background-clip:text; color:transparent; }
  h1 small { display:block; font-size:11px; letter-spacing:.3em; color:#d6a35c; -webkit-text-fill-color:#d6a35c; font-weight:600; }
  .scores { display:flex; gap:8px; }
  .sc { background:#241303; border:1px solid #4d280a; border-radius:10px; padding:6px 14px; text-align:center; min-width:74px; }
  .sc span { display:block; font-size:10px; letter-spacing:.2em; color:#d6a35c; }
  .sc b { font-size:20px; }
  #board { position:relative; width:min(92vmin,460px); aspect-ratio:1; background:#241303;
    border-radius:14px; padding:calc(var(--g)); --g:10px; box-shadow:0 20px 60px -20px rgba(249,115,22,.35); }
  .cellbg { position:absolute; width:var(--cs); height:var(--cs); border-radius:8px; background:rgba(255,237,213,.06); }
  .tile { position:absolute; width:var(--cs); height:var(--cs); border-radius:8px;
    display:flex; align-items:center; justify-content:center; font-weight:800;
    transition: transform .13s cubic-bezier(.2,.8,.3,1); will-change:transform; }
  .tile.spawn { animation:spawn .16s ease-out both; }
  .tile.merged { animation:pop .17s ease-out both; z-index:3; }
  @keyframes spawn { from { opacity:0; scale:.4;} to { opacity:1; scale:1;} }
  @keyframes pop { 0% { scale:1;} 45% { scale:1.22;} 100% { scale:1;} }
  .bar { width:min(92vmin,460px); display:flex; justify-content:space-between; align-items:center; }
  button { background:linear-gradient(120deg,#f59e0b,#f97316); color:#1c0a01; font-weight:800; border:none;
    border-radius:10px; padding:9px 18px; font-size:13px; letter-spacing:.08em; cursor:pointer; }
  button:active { transform:scale(.96); }
  .hint { font-size:11px; color:#a1743d; letter-spacing:.06em; transition:opacity .5s; }
  .hint.gone { opacity:0; }
  .banner { position:absolute; inset:0; display:none; flex-direction:column; align-items:center; justify-content:center;
    gap:12px; background:rgba(20,11,2,.88); backdrop-filter:blur(3px); border-radius:14px; z-index:10; text-align:center;}
  .banner h2 { font-size:34px; background:linear-gradient(120deg,#fde68a,#fb923c); -webkit-background-clip:text;
    background-clip:text; color:transparent; }
</style>
</head>
<body>
<div class="top">
  <h1>2048 &infin;<small>COSMIC EDITION</small></h1>
  <div class="scores">
    <div class="sc"><span>SCORE</span><b id="score">0</b></div>
    <div class="sc"><span>BEST</span><b id="best">0</b></div>
  </div>
</div>
<div id="board"></div>
<div class="bar">
  <button id="new">NEW GAME</button>
  <div class="hint" id="hint">CLICK THE BOARD ONCE, THEN ARROWS / WASD / SWIPE &middot; MERGE EQUAL TILES</div>
</div>
<script>
(function(){
  var N=4, board=document.getElementById('board'),
      scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'),
      banner=document.createElement('div'); banner.className='banner';
  board.appendChild(banner);
  var tiles={}, grid, score=0, best=0, uid=0, busy=false, over=false;

  var bgs = [];
  function metrics(){
    var w = board.clientWidth, g = 10;
    return { g: g, cs: Math.max(40, (w - g*(N+1))/N) };
  }
  function layout(){
    var m = metrics();
    if (!bgs.length && m.cs > 40){
      for(var i=0;i<N*N;i++){
        var c=document.createElement('div'); c.className='cellbg';
        c.style.width=m.cs+'px'; c.style.height=m.cs+'px';
        board.appendChild(c); bgs.push(c);
      }
    }
    bgs.forEach(function(c,i){
      var x=i%N, y=(i/N)|0;
      c.style.width=m.cs+'px'; c.style.height=m.cs+'px';
      c.style.left=(m.g+x*(m.cs+m.g))+'px'; c.style.top=(m.g+y*(m.cs+m.g))+'px';
    });
  }

  function style(t, v){
    var colors={2:'#fde68a/#78350f',4:'#fcd34d/#78350f',8:'#fbbf24/#7c2d12',16:'#f59e0b/#7c2d12',
      32:'#fb923c/#7c2d12',64:'#f97316/#fff7ed',128:'#fb7185/#fff1f2',256:'#f43f5e/#fff1f2',
      512:'#e11d48/#ffe4e6',1024:'#be123c/#ffe4e6',2048:'#f0abfc/#4a044e'};
    var pair=colors[v]||'#f0abfc/#4a044e', parts=pair.split('/');
    t.style.background='linear-gradient(135deg,'+parts[0]+','+shade(parts[0])+')';
    t.style.color=parts[1];
    t.style.fontSize=(v>=1024?'26':v>=128?'30':'34')+'px';
    t.textContent=v;
    t.style.boxShadow=v>=128?'0 0 24px '+parts[0]+'66':'none';
  }
  function shade(hex){
    var n=parseInt(hex.slice(1),16), r=Math.max((n>>16)-36,0), g=Math.max(((n>>8)&255)-30,0), b=Math.max((n&255)-24,0);
    return 'rgb('+r+','+g+','+b+')';
  }
  function pos(el,x,y){
    var m = metrics();
    el.style.width=m.cs+'px'; el.style.height=m.cs+'px';
    el.style.transform='translate('+(m.g+x*(m.cs+m.g))+'px,'+(m.g+y*(m.cs+m.g))+'px)';
  }
  function spawn(){
    var empty=[];
    for(var y=0;y<N;y++)for(var x=0;x<N;x++) if(!grid[y][x]) empty.push({x:x,y:y});
    if(!empty.length) return;
    var p=empty[(Math.random()*empty.length)|0], v=Math.random()<0.9?2:4;
    var el=document.createElement('div'); el.className='tile spawn';
    board.appendChild(el);
    var t={el:el,x:p.x,y:p.y,v:v}; tiles[++uid]=t; grid[p.y][p.x]=uid;
    style(el,v); pos(el,p.x,p.y);
  }
  function newGame(){
    Object.keys(tiles).forEach(function(id){ tiles[id].el.remove(); });
    tiles={}; score=0; over=false; busy=false;
    grid=[]; for(var y=0;y<N;y++){ grid.push([null,null,null,null]); }
    banner.style.display='none';
    spawn(); spawn(); render();
  }
  function render(){
    scoreEl.textContent=score;
    if(score>best){ best=score; bestEl.textContent=best; }
  }
  function canMove(){
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){
      if(!grid[y][x]) return true;
      var v=tiles[grid[y][x]].v;
      if(x<N-1 && grid[y][x+1] && tiles[grid[y][x+1]].v===v) return true;
      if(y<N-1 && grid[y+1][x] && tiles[grid[y+1][x]].v===v) return true;
    }
    return false;
  }
  function move(dx,dy){
    if(busy||over) return;
    var moved=false, gained=0, merges=[];
    var xs=[], ys=[], x,y;
    for(var i=0;i<N;i++){ xs.push(i); ys.push(i); }
    if(dx>0) xs.reverse(); if(dy>0) ys.reverse();
    for(var yi=0; yi<N; yi++){
      y=ys[yi];
      for(var xi=0; xi<N; xi++){
        x=xs[xi];
        var id=grid[y][x]; if(!id) continue;
        var t=tiles[id], nx=x, ny=y;
        while(true){
          var px=nx+dx, py=ny+dy;
          if(px<0||py<0||px>=N||py>=N) break;
          var nid=grid[py][px];
          if(!nid){ nx=px; ny=py; continue; }
          var other=tiles[nid];
          if(other.v===t.v && merges.indexOf(nid)===-1 && merges.indexOf(id)===-1){
            nx=px; ny=py;
            merges.push(id); gained+=t.v*2;
          }
          break;
        }
        if(nx!==x||ny!==y){
          moved=true;
          grid[y][x]=null;
          var targetId=grid[ny][nx];
          if(targetId && targetId!==id){
            t.el.style.zIndex=2;
            t.dead=true;
            pos(t.el,nx,ny);
            setTimeout(function(a,b){ return function(){
              a.el.remove(); delete tiles[b];
            };}(t,id),140);
            var ot=tiles[targetId];
            ot.v*=2; style(ot.el,ot.v);
            ot.el.classList.remove('merged'); void ot.el.offsetWidth; ot.el.classList.add('merged');
          } else {
            grid[ny][nx]=id; t.x=nx; t.y=ny; pos(t.el,nx,ny);
          }
        }
      }
    }
    if(moved){
      busy=true;
      score+=gained; render();
      setTimeout(function(){
        spawn();
        busy=false;
        var won=false;
        Object.keys(tiles).forEach(function(k){ if(tiles[k].v>=2048) won=true; });
        if(won && banner.style.display!=='flex'){
          showBanner('RIFT OPENED \u2014 2048!', 'keep merging into the infinite');
        } else if(!canMove()){
          over=true;
          showBanner('GRID LOCKED', 'final score ' + score);
        }
      },150);
    }
  }
  function showBanner(h,s){
    banner.innerHTML='<h2>'+h+'</h2><div style="display:flex;gap:10px"><button id="again">PLAY AGAIN</button>'+
      '<button id="continue" style="background:#241303;color:#fcd34d;border:1px solid #4d280a">CONTINUE &rarr;</button></div>'+
      '<div class="hint">'+s+'</div>';
    banner.style.display='flex';
    document.getElementById('again').onclick=newGame;
    var cont=document.getElementById('continue');
    if(cont) cont.onclick=function(){ banner.style.display='none'; };
  }
  window.addEventListener('keydown',function(e){
    var k=e.key.toLowerCase(), map={arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],
      arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1]};
    if(map[k]){ e.preventDefault(); move(map[k][0],map[k][1]); }
  });
  var tx=0,ty=0;
  document.addEventListener('touchstart',function(e){ tx=e.touches[0].clientX; ty=e.touches[0].clientY; },{passive:true});
  document.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)<24&&Math.abs(dy)<24) return;
    if(Math.abs(dx)>Math.abs(dy)) move(dx>0?1:-1,0); else move(0,dy>0?1:-1);
  },{passive:true});
  document.getElementById('new').onclick=newGame;
  var hint=document.getElementById('hint');
  document.addEventListener('pointerdown',function(){ hint.classList.add('gone'); },{once:true});
  window.addEventListener('keydown',function(){ hint.classList.add('gone'); },{once:true});
  window.addEventListener('resize',function(){
    layout();
    Object.keys(tiles).forEach(function(id){ pos(tiles[id].el,tiles[id].x,tiles[id].y); });
  });
  function boot(){
    if (board.clientWidth < 60){ requestAnimationFrame(boot); return; }
    layout(); newGame();
  }
  boot();
})();
</script>
</body>
</html>`

const DASHBOARD = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; overflow:hidden; background:#060b16; color:#e6edf7;
    font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
  .wrap { height:100%; display:flex; flex-direction:column; gap:12px; padding:16px 18px;
    max-width:1080px; margin:0 auto; position:relative; }
  header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .logo { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#06b6d4,#3b82f6);
    display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:15px;
    box-shadow:0 4px 20px rgba(34,211,238,.35); }
  h1 { font-size:15px; letter-spacing:.01em; } 
  .sub { font-size:11px; color:#5d6b84; margin-top:1px; }
  .live { display:flex; align-items:center; gap:6px; font-size:10px; letter-spacing:.22em; color:#67e8f9;
    border:1px solid rgba(103,232,249,.3); padding:4px 10px; border-radius:999px; }
  .dot { width:6px; height:6px; border-radius:50%; background:#22d3ee; box-shadow:0 0 10px #22d3ee; animation:pulse 1.6s infinite; }
  @keyframes pulse { 50% { opacity:.25; } }
  .ranges { margin-left:auto; display:flex; gap:5px; background:#0a1322; padding:3px; border-radius:9px; border:1px solid #16233c; }
  .ranges button { border:none; background:transparent; color:#7787a3; font-size:11px; font-weight:600;
    padding:5px 11px; border-radius:7px; cursor:pointer; letter-spacing:.04em; }
  .ranges button.on { background:linear-gradient(135deg,#0891b2,#2563eb); color:#fff; }
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  @media (max-width:720px){ .kpis { grid-template-columns:repeat(2,1fr);} .main{flex-direction:column;} .aside{min-width:unset;} }
  .kpi { background:#0a1220; border:1px solid #16233c; border-radius:13px; padding:12px 14px 10px;
    position:relative; overflow:hidden; transition:border-color .3s; }
  .kpi:hover { border-color:#2b3d61; }
  .kpi label { font-size:9.5px; letter-spacing:.2em; color:#5d6b84; font-weight:700; }
  .kpi .val { font-size:22px; font-weight:800; margin-top:3px; font-variant-numeric:tabular-nums; letter-spacing:-.02em; }
  .delta { font-size:10.5px; font-weight:800; padding:1px 7px; border-radius:999px; display:inline-block; margin-top:4px; }
  .up { color:#4ade80; background:rgba(74,222,128,.1); } .dn { color:#f87171; background:rgba(248,113,113,.1); }
  svg.spark { position:absolute; right:10px; bottom:10px; opacity:.9; }
  .grid2 { flex:1; display:flex; gap:10px; min-height:0; }
  .panel { background:#0a1220; border:1px solid #16233c; border-radius:13px; padding:13px 15px; display:flex; flex-direction:column; min-height:0; }
  .ptitle { font-size:10px; letter-spacing:.18em; color:#7dd3fc; font-weight:700; display:flex; justify-content:space-between; align-items:center; }
  .ptitle span:last-child { color:#44526b; letter-spacing:.06em; }
  .chartpanel { flex:1.9; min-width:0; }
  #area { flex:1; width:100%; margin-top:8px; }
  .aside { flex:1; min-width:270px; display:flex; flex-direction:column; gap:10px; min-height:0; }
  .bars { display:flex; flex-direction:column; gap:8px; margin-top:10px; }
  .brow { display:grid; grid-template-columns:64px 1fr 34px; gap:8px; align-items:center; font-size:11px; color:#94a3b8; }
  .brow b { text-align:right; color:#cbd5e1; font-variant-numeric:tabular-nums; }
  .track { height:7px; background:#101b30; border-radius:99px; overflow:hidden; }
  .fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#0891b2,#3b82f6); transition:width .9s cubic-bezier(.2,.8,.3,1); }
  .feed { list-style:none; overflow-y:auto; flex:1; margin-top:8px; scrollbar-width:none; }
  .feed::-webkit-scrollbar{display:none}
  .fevent { display:flex; gap:8px; align-items:baseline; padding:5px 0; border-bottom:1px dashed #14203a; font-size:11px; animation:in .4s ease-out both; }
  @keyframes in { from { opacity:0; transform:translateY(-5px);} }
  .ftime { color:#44526b; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .fdot { width:6px; height:6px; border-radius:50%; flex-shrink:0; position:relative; top:-1px; }
  .toast { position:absolute; top:14px; right:18px; z-index:20; background:#0c1526; border:1px solid rgba(251,191,36,.4);
    border-left:3px solid #fbbf24; border-radius:11px; padding:10px 14px; max-width:280px; font-size:11.5px;
    box-shadow:0 18px 50px -12px rgba(0,0,0,.7); transform:translateX(calc(100% + 40px)); transition:transform .45s cubic-bezier(.2,.8,.3,1); }
  .toast.show { transform:none; }
  .toast b { display:block; color:#fde68a; font-size:10px; letter-spacing:.16em; margin-bottom:3px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="logo">P</div>
    <div><h1>Pulse Analytics</h1><div class="sub">acme-prod &middot; us-east &middot; all systems nominal</div></div>
    <span class="live"><span class="dot"></span>LIVE</span>
    <div class="ranges"><button class="on">24H</button><button>7D</button><button>30D</button><button>QTD</button></div>
  </header>
  <div class="kpis">
    <div class="kpi"><label>MRR</label><div class="val" id="v0">$128.4K</div><span class="delta up" id="d0">&Delta; +0.8%</span><svg class="spark" id="s0" width="72" height="28"></svg></div>
    <div class="kpi"><label>ACTIVE USERS</label><div class="val" id="v1">48,211</div><span class="delta up" id="d1">&Delta; +1.2%</span><svg class="spark" id="s1" width="72" height="28"></svg></div>
    <div class="kpi"><label>CONVERSION</label><div class="val" id="v2">4.21%</div><span class="delta dn" id="d2">&Delta; -0.1%</span><svg class="spark" id="s2" width="72" height="28"></svg></div>
    <div class="kpi"><label>P95 LATENCY</label><div class="val" id="v3">212ms</div><span class="delta up" id="d3">&Delta; -18ms</span><svg class="spark" id="s3" width="72" height="28"></svg></div>
  </div>
  <div class="grid2">
    <div class="panel chartpanel">
      <div class="ptitle"><span>MRR TREND</span><span>auto-refresh 2s</span></div>
      <svg id="area" viewBox="0 0 600 220" preserveAspectRatio="none">
        <defs><linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#38bdf8" stop-opacity=".32"/>
          <stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
        </linearGradient></defs>
        <path id="afill" fill="url(#gfill)"></path>
        <path id="aline" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px rgba(56,189,248,.45))"></path>
        <line id="cursor" y1="0" y2="220" stroke="rgba(56,189,248,.35)" stroke-dasharray="3 4"></line>
        <circle id="headDot" r="3.5" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"></circle>
      </svg>
    </div>
    <div class="aside">
      <div class="panel">
        <div class="ptitle"><span>SIGNUPS BY CHANNEL</span><span>24h</span></div>
        <div class="bars" id="bars"></div>
      </div>
      <div class="panel" style="flex:1">
        <div class="ptitle"><span>EVENT STREAM</span></div>
        <ul class="feed" id="feed"></ul>
      </div>
    </div>
  </div>
  <div class="toast" id="toast"><b>ANOMALY DETECTED</b><span id="tmsg">Signup spike +38% in paid_search cohort</span></div>
</div>
<script>
(function(){
  function $(id){ return document.getElementById(id); }
  var N=42;
  function walk(n,start,vol,min,max){
    var a=[],v=start;
    for(var i=0;i<n;i++){ v+= (Math.random()-.48)*vol; v=Math.max(min,Math.min(max,v)); a.push(v); }
    return a;
  }
  var mrrA=walk(N,128400,2600,110000,150000), usrA=walk(N,48211,420,42000,56000),
      cnvA=walk(N,4.21,.09,3.4,5.2), latA=walk(N,212,9,140,300);
  var cur={mrr:mrrA[N-1],usr:usrA[N-1],cnv:cnvA[N-1],lat:latA[N-1]};
  var prev={mrr:cur.mrr,usr:cur.usr,cnv:cur.cnv,lat:cur.lat};
  var sparks=[[],[],[],[]];

  function fmtMrr(v){ return '$'+(v/1000).toFixed(1)+'K'; }
  function fmtUsr(v){ return Math.round(v).toLocaleString('en-US'); }
  function fmtCnv(v){ return v.toFixed(2)+'%'; }
  function fmtLat(v){ return Math.round(v)+'ms'; }

  function deltaBadge(el,now,before,unit,invert){
    var diff=now-before, up=diff>=0;
    if(invert) up=!up;
    el.className='delta '+(up?'up':'dn');
    var arrow=up?'&uarr;':'&darr;';
    el.innerHTML=arrow+' '+Math.abs(diff).toFixed(unit==='pct'?2:0)+(unit==='pct'?'%':unit==='ms'?'ms':'');
  }

  function buildPath(data,w,h,pad){
    var mn=Math.min.apply(null,data), mx=Math.max.apply(null,data), rng=(mx-mn)||1;
    var sx=w/(data.length-1), d='';
    for(var i=0;i<data.length;i++){
      var x=(i*sx).toFixed(1);
      var y=(pad+(1-(data[i]-mn)/rng)*(h-pad*2)).toFixed(1);
      d+=(i?'L':'M')+x+','+y;
    }
    return {d:d,last:[(w-sx).toFixed(1),(pad+(1-(data[data.length-1]-mn)/rng)*(h-pad*2)).toFixed(1)]};
  }
  function drawSpark(svg,data,color){
    svg.innerHTML='';
    var p=buildPath(data,72,28,4);
    var ln=document.createElementNS('http://www.w3.org/2000/svg','path');
    ln.setAttribute('d',p.d); ln.setAttribute('fill','none');
    ln.setAttribute('stroke',color); ln.setAttribute('stroke-width','1.8');
    svg.appendChild(ln);
  }

  function tickData(){
    prev.mrr=cur.mrr; prev.usr=cur.usr; prev.cnv=cur.cnv; prev.lat=cur.lat;
    cur.mrr=Math.max(110000,Math.min(150000,cur.mrr+(Math.random()-.46)*2400));
    cur.usr=Math.max(42000,Math.min(56000,cur.usr+(Math.random()-.47)*380));
    cur.cnv=Math.max(3.4,Math.min(5.2,cur.cnv+(Math.random()-.5)*.07));
    cur.lat=Math.max(140,Math.min(300,cur.lat+(Math.random()-.52)*10));
    mrrA.push(cur.mrr); usrA.push(cur.usr); cnvA.push(cur.cnv); latA.push(cur.lat);
    [mrrA,usrA,cnvA,latA].forEach(function(a){ a.shift(); });
    $('v0').textContent=fmtMrr(cur.mrr); deltaBadge($('d0'),cur.mrr,prev.mrr,'$',false);
    $('v1').textContent=fmtUsr(cur.usr); deltaBadge($('d1'),cur.usr,prev.usr,'',false);
    $('v2').textContent=fmtCnv(cur.cnv); deltaBadge($('d2'),cur.cnv,prev.cnv,'pct',false);
    $('v3').textContent=fmtLat(cur.lat); deltaBadge($('d3'),cur.lat,prev.lat,'ms',true);
    for(var s=0;s<4;s++){
      var src=[mrrA,usrA,cnvA,latA][s].slice(-18);
      sparks[s]=src; drawSpark($('s'+s),src,['#4ade80','#60a5fa','#fbbf24','#f87171'][s]);
    }
  }

  var animT=0;
  function frame(now){
    if(now-animT>2000){ animT=now; tickData(); }
    var p=buildPath(mrrA,600,220,14);
    $('aline').setAttribute('d',p.d);
    $('afill').setAttribute('d',p.d+'L600,220L0,220Z');
    $('cursor').setAttribute('x1',p.last[0]); $('cursor').setAttribute('x2',p.last[0]);
    $('headDot').setAttribute('cx',p.last[0]); $('headDot').setAttribute('cy',p.last[1]);
    requestAnimationFrame(frame);
  }

  var channels=[['organic',34],['paid',27],['referral',17],['social',13],['email',9]];
  function renderBars(){
    var host=$('bars'); host.innerHTML='';
    channels.forEach(function(c){
      var row=document.createElement('div'); row.className='brow';
      var nm=document.createElement('span'); nm.textContent=c[0];
      var tr=document.createElement('div'); tr.className='track';
      var fl=document.createElement('div'); fl.className='fill'; fl.style.width=c[1]+'%';
      tr.appendChild(fl);
      var vv=document.createElement('b'); vv.textContent=Math.round(c[1])+'%';
      row.appendChild(nm); row.appendChild(tr); row.appendChild(vv);
      host.appendChild(row);
    });
  }
  setInterval(function(){
    channels.forEach(function(c){ c[1]=Math.max(3,Math.min(48,c[1]+(Math.random()-.5)*3)); });
    renderBars();
  },3400);

  var events=[
    ['deploy api-gateway v2.14.3 succeeded','#4ade80'],
    ['autoscaler added 2 nodes to queue-consumers','#60a5fa'],
    ['checkout p99 back under SLO','#4ade80'],
    ['cohort D7 retention +0.4pts week-over-week','#60a5fa'],
    ['alert cleared: error-budget burn normal','#4ade80'],
    ['feature flag new-onboarding ramped to 50%','#fbbf24'],
    ['nightly backup snapshot completed','#94a3b8'],
    ['cache hit ratio dipped to 91.2%','#fbbf24'],
    ['stripe webhook replay finished (3 events)','#94a3b8'],
    ['canary analysis: no regression detected','#4ade80']
  ];
  function pushEvent(){
    var li=document.createElement('li'); li.className='fevent';
    var e=events[(Math.random()*events.length)|0];
    var now=new Date();
    var hh=String(now.getHours()).padStart(2,'0'),
        mm=String(now.getMinutes()).padStart(2,'0'),
        ss=String(now.getSeconds()).padStart(2,'0');
    li.innerHTML='<span class="ftime">'+hh+':'+mm+':'+ss+'</span>'+
      '<span class="fdot" style="background:'+e[1]+';box-shadow:0 0 8px '+e[1]+'"></span>'+
      '<span>'+e[0]+'</span>';
    var feed=$('feed');
    feed.insertBefore(li,feed.firstChild);
    while(feed.children.length>9) feed.removeChild(feed.lastChild);
  }

  var anomalies=['Signup spike +38% in paid_search cohort','Checkout latency drift +22ms vs baseline',
    'Churn-risk segment grew by 118 accounts','Refund rate ticked above weekly p95'];
  setInterval(function(){
    if(Math.random()<.4){
      $('tmsg').textContent=anomalies[(Math.random()*anomalies.length)|0];
      $('toast').classList.add('show');
      setTimeout(function(){ $('toast').classList.remove('show'); },3600);
    }
  },9000);

  document.querySelectorAll('.ranges button').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.ranges button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
    });
  });

  renderBars();
  for(var e=0;e<6;e++) pushEvent();
  tickData();
  setInterval(pushEvent,2600);
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`

const TUI = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; overflow:hidden; background:#020806;
    font-family: ui-monospace, "Cascadia Code", Menlo, Consolas, monospace; }
  body { display:flex; align-items:center; justify-content:center; padding:14px; color:#9ae6b4; }
  .term { width:min(96vw,880px); height:min(92vh,560px); display:flex; flex-direction:column;
    border:1px solid #14532d; border-radius:12px; overflow:hidden;
    background:linear-gradient(180deg,#04120a,#030d07); box-shadow:0 24px 70px -18px rgba(16,185,129,.22), 0 0 90px rgba(16,185,129,.05);
    position:relative; user-select:none; -webkit-user-select:none; }
  .titlebar { display:flex; align-items:center; gap:7px; padding:9px 13px; border-bottom:1px solid #123a22; background:rgba(6,26,15,.7); }
  .tl { width:11px; height:11px; border-radius:50%; } .r{background:#f87171}.y{background:#fbbf24}.g{background:#34d399}
  .tname { margin-left:10px; font-size:11.5px; letter-spacing:.08em; color:#4ade80; opacity:.85; }
  .crumb { flex:1; text-align:center; font-size:11.5px; color:#65d48e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .crumb span { color:#2f6b45; }
  .main { flex:1; display:flex; min-height:0; }
  .pane { flex:1; min-width:0; overflow-y:auto; padding:10px 0; scrollbar-width:none; }
  .pane::-webkit-scrollbar{display:none}
  .list { border-right:1px solid #123a22; flex:1.15; }
  .preview { flex:1.25; padding-top:12px; }
  .ph { padding:0 14px 7px; font-size:10px; letter-spacing:.28em; color:#2f6b45; border-bottom:1px dashed #123a22; margin-bottom:6px; position:sticky; top:-10px; background:#04120a; }
  .row { padding:3px 14px; font-size:13px; line-height:1.75; white-space:pre; cursor:pointer; display:flex; justify-content:space-between; gap:12px; }
  .row.sel { background:linear-gradient(90deg,rgba(52,211,153,.16),rgba(52,211,153,.03)); box-shadow:inset 3px 0 0 #34d399; }
  .dir::before { content:"\\25B8  "; color:#34d399; } .file::before { content:"   "; }
  .sz { color:#2f6b45; font-size:11px; }
  pre { font-size:12px; line-height:1.62; padding:10px 16px; white-space:pre-wrap; word-break:break-word; color:#86efac; }
  .empty { color:#2f6b45; text-align:center; padding-top:40px; font-size:12px; letter-spacing:.14em; }
  .statusbar { display:flex; gap:14px; padding:8px 14px; font-size:11px; color:#2f6b45; border-top:1px solid #123a22; background:rgba(6,26,15,.7); flex-wrap:wrap; }
  kbd { border:1px solid #1c5c35; border-radius:4px; padding:0 5px; font-size:10px; color:#6ee7b7; background:rgba(52,211,153,.07); }
  .filterbar { position:absolute; left:0; right:0; bottom:0; display:flex; align-items:center; gap:8px;
    padding:9px 14px; background:#062112; border-top:1px solid #1c5c35; transform:translateY(110%); transition:transform .18s ease; z-index:5; }
  .filterbar.show { transform:none; }
  .filterbar .pfx { color:#34d399; font-weight:700; }
  #q { flex:1; background:transparent; border:none; outline:none; color:#d1fae5; font:inherit; caret-color:#34d399; }
  .scanlines { pointer-events:none; position:absolute; inset:0; background:repeating-linear-gradient(0deg,rgba(0,0,0,.16) 0 1px,transparent 1px 3px); mix-blend-mode:multiply; border-radius:12px; }
  .fhint { position:absolute; right:14px; top:46px; font-size:10.5px; letter-spacing:.12em; color:#86efac;
    background:rgba(6,33,18,.9); border:1px solid #1c5c35; border-radius:999px; padding:5px 13px;
    transition:opacity .6s; z-index:6; }
  .fhint.gone { opacity:0; }
</style>
</head>
<body>
<div class="term" id="term">
  <div class="titlebar">
    <span class="tl r"></span><span class="tl y"></span><span class="tl g"></span>
    <div class="crumb" id="crumb"></div>
    <div class="tname">warpfile 3.2.0</div>
  </div>
  <div class="main">
    <div class="pane list"><div class="ph">FILES</div><div id="list"></div></div>
    <div class="pane preview"><div class="ph" id="pvh">PREVIEW</div><div id="pv"><div class="empty">SELECT A FILE</div></div></div>
  </div>
  <div class="statusbar">
    <span><kbd>j</kbd>/<kbd>k</kbd> move</span><span><kbd>l</kbd>/<kbd>&crarr;</kbd> open</span>
    <span><kbd>h</kbd> up</span><span><kbd>/</kbd> filter</span><span><kbd>g</kbd><kbd>G</kbd> ends</span>
    <span style="margin-left:auto" id="meta"></span>
  </div>
  <div class="filterbar" id="fbar"><span class="pfx">/</span><input id="q" placeholder="fuzzy filter&hellip;" autocomplete="off"></div>
  <div class="fhint" id="fhint">CLICK HERE ONCE &middot; THEN j / k TO MOVE, l TO OPEN</div>
  <div class="scanlines"></div>
</div>
<script>
(function(){
  function F(content){ return { dir:false, size:(content.length/1024), content:content }; }
  function D(kids){ return { dir:true, kids:kids, size:0 }; }

  var FS = D({
    'src': D({
      'main.rs': F('use warpfile::prelude::*;\n\nfn main() {\n    let app = App::builder()\n        .panes(Panes::Dual)\n        .keymap(Keymap::Warpfile)\n        .index(Index::fuzzy_recursive("~"))\n        .build()\n        .expect("terminal too old");\n\n    app.run_event_loop();\n}\n'),
      'panes.rs': F('// dual pane renderer, zero flicker\nfunction render(frame) {\n    // diff against previous buffer,\n    // emit only changed cells\n    for (cell of frame.dirty())\n        term.write_at(cell.x, cell.y, cell.ch);\n}\n'),
      'fuzzy.rs': F('//! three keystrokes to any file\npub fn jump(query: &str) -> Option<&Path> {\n    INDEX.best_match(query).or_else(|| {\n        INDEX.fallback(query)\n    })\n}\n')
    }),
    'docs': D({
      'readme.md': F('# Warpfile\n\nA file manager that thinks in keystrokes.\n\n## Why\n- fuzzy jump, fuzzy filter, fuzzy everything\n- native-refresh flicker-free rendering\n- remotes feel local over plain SSH\n\n## Keys\n    j/k move   l open   h up\n    / filter   g/G ends\n'),
      'changelog.txt': F('3.2.0  archive mount previews; j/k half-page scroll\n3.1.4  fix flicker on tmux resize\n3.1.0  sshfs passthrough; bulk rename scratchpad\n3.0.0  new fuzzy engine (nucleo), 4x faster\n')
    }),
    'assets': D({
      'icon.svg': F('<svg viewBox="0 0 32 32">\n  <rect width="32" height="32" rx="8"\n        fill="#10b981"/>\n  <path d="M9 17l5 5 9-12"\n        stroke="#04120a" stroke-width="3"\n        fill="none" stroke-linecap="round"/>\n</svg>\n'),
      'screenshot.png': F('(binary preview suppressed, 84.1 KB)\n[####################....] 82%\nreal builds render ANSI block art here.')
    }),
    'Cargo.toml': F('[package]\nname = "warpfile"\nversion = "3.2.0"\nedition = "2021"\n\n[dependencies]\nratatui   = "0.26"\ncrossterm = "0.27"\nnucleo    = "0.5"\nnotify    = "6"\n\n[profile.release]\nlto = true\nstrip = true\n'),
    'todo.txt': F('[x] half-page j/k scrolling\n[x] archive mount previews\n[ ] marks + quickfix list\n[ ] ssh connection pooling\n[ ] image protocol previews (kitty/sixel)'),
    'metrics.log': F('09:14:02 index rebuild 412ms (18,204 files)\n09:14:02 watcher armed (inotify) ok\n09:31:55 pane render 0.8ms avg\n11:02:10 fuzzy "deplo" -> 3 hits in 0.3ms\n13:44:51 bulk rename 214 files via regex\n')
  });

  var path=['~'], cwd=FS, sel=0, filtering=false, query='';
  var listEl=document.getElementById('list'), pvEl=document.getElementById('pv'),
      pvh=document.getElementById('pvh'), crumb=document.getElementById('crumb'),
      meta=document.getElementById('meta'), fbar=document.getElementById('fbar'),
      q=document.getElementById('q');

  function entries(){
    var out=[];
    Object.keys(cwd.kids).forEach(function(name){
      if(query && name.toLowerCase().indexOf(query.toLowerCase())===-1) return;
      out.push({ name:name, node:cwd.kids[name] });
    });
    out.sort(function(a,b){
      if(a.node.dir!==b.node.dir) return a.node.dir?-1:1;
      return a.name<b.name?-1:1;
    });
    return out;
  }

  function fmtSize(n){
    if(n<1) return Math.round(n*1024)+' B';
    return n.toFixed(1)+' KB';
  }
  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function render(){
    var es=entries();
    if(sel>=es.length) sel=Math.max(0,es.length-1);
    listEl.innerHTML='';
    es.forEach(function(e,i){
      var row=document.createElement('div');
      row.className='row '+(e.node.dir?'dir':'file')+(i===sel?' sel':'');
      var nm=document.createElement('span'); nm.textContent=e.name;
      var sz=document.createElement('span'); sz.className='sz';
      sz.textContent=e.node.dir?(Object.keys(e.node.kids).length+' items'):fmtSize(e.node.size);
      row.appendChild(nm); row.appendChild(sz);
      row.onclick=function(){ sel=i; render(); };
      row.ondblclick=function(){ sel=i; open(); };
      listEl.appendChild(row);
    });
    var seg=path.map(function(p,i){ return i===0?p:'<span style="color:#2f6b45"> / </span>'+p; }).join('');
    crumb.innerHTML='<span style="color:#2f6b45">warpfile</span>&nbsp; '+seg;
    meta.textContent=es.length+' items'+(query?' Â· "'+query+'"':'');
    var cur=es[sel];
    if(!cur){ pvh.textContent='PREVIEW'; pvEl.innerHTML='<div class="empty">NO MATCHES</div>'; return; }
    if(cur.node.dir){
      pvh.textContent='DIRECTORY';
      var names=Object.keys(cur.node.kids);
      pvEl.innerHTML='<pre>'+names.slice(0,40).map(function(n){
        return '  '+n+(cur.node.kids[n].dir?'/':'');
      }).join('\n')+(names.length>40?'\n  ... +'+(names.length-40)+' more':'')+'</pre>';
    } else {
      pvh.textContent=cur.name.toUpperCase()+' \u00b7 '+fmtSize(cur.node.size);
      pvEl.innerHTML='<pre>'+escapeHtml(cur.node.content)+'</pre>';
      pvEl.scrollTop=0;
    }
    var selRow=listEl.children[sel];
    if(selRow&&selRow.scrollIntoView) selRow.scrollIntoView({block:'nearest'});
  }

  function open(){
    var es=entries(), cur=es[sel];
    if(!cur) return;
    if(cur.node.dir){ cwd=cur.node; path.push(cur.name); sel=0; query=''; q.value=''; render(); }
  }
  function up(){
    if(path.length>1){
      path.pop(); cwd=FS;
      for(var i=1;i<path.length;i++) cwd=cwd.kids[path[i]];
      sel=0; query=''; q.value=''; render();
    }
  }

  document.addEventListener('keydown',function(e){
    var es=entries();
    if(filtering){
      if(e.key==='Enter'){ e.preventDefault(); filtering=false; fbar.classList.remove('show'); q.blur(); sel=0; render(); }
      else if(e.key==='Escape'){ e.preventDefault(); filtering=false; query=''; q.value=''; fbar.classList.remove('show'); q.blur(); render(); }
      return;
    }
    switch(e.key){
      case 'j': case 'ArrowDown': e.preventDefault(); if(es.length){ sel=(sel+1)%es.length; render(); } break;
      case 'k': case 'ArrowUp': e.preventDefault(); if(es.length){ sel=(sel-1+es.length)%es.length; render(); } break;
      case 'g': sel=0; render(); break;
      case 'G': sel=Math.max(0,es.length-1); render(); break;
      case 'l': case 'Enter': e.preventDefault(); open(); break;
      case 'h': case 'Backspace': e.preventDefault(); up(); break;
      case '/':
        e.preventDefault(); filtering=true; fbar.classList.add('show');
        setTimeout(function(){ q.focus(); },30);
        break;
    }
  });
  q.addEventListener('input',function(){ query=q.value.trim(); sel=0; render(); });
  var fhint=document.getElementById('fhint');
  function killHint(){ fhint.classList.add('gone'); }
  document.addEventListener('pointerdown',killHint,{once:true});
  window.addEventListener('keydown',killHint,{once:true});
  window.addEventListener('resize',render);
  render();
})();
</script>
</body>
</html>`

const EVALDECK = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; overflow:hidden; background:#120a04; color:#fef3c7;
    font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
  .app { height:100%; display:flex; flex-direction:column; padding:16px 18px; gap:12px; max-width:1020px; margin:0 auto; }
  header { display:flex; align-items:center; gap:12px; }
  .mark { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,#f59e0b,#ef4444);
    display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800;
    box-shadow:0 6px 18px rgba(245,158,11,.3); }
  h1 { font-size:16px; } .sub { font-size:11px; color:#b45309; }
  #run { margin-left:auto; background:linear-gradient(120deg,#f59e0b,#ef4444); color:#1c0a01; font-weight:800;
    border:none; border-radius:10px; padding:10px 22px; font-size:13px; letter-spacing:.06em; cursor:pointer; transition:transform .15s, opacity .2s; }
  #run:hover:not(:disabled) { transform:translateY(-1px); }
  #run:active { transform:scale(.97); }
  #run:disabled { opacity:.45; cursor:default; }
  .grid { flex:1; display:flex; gap:12px; min-height:0; }
  .card { background:#1a1108; border:1px solid rgba(245,158,11,.18); border-radius:13px; padding:13px 14px; min-height:0; }
  .suites { width:240px; display:flex; flex-direction:column; gap:9px; overflow-y:auto; scrollbar-width:none; }
  .suites::-webkit-scrollbar{display:none}
  .sh { font-size:10px; letter-spacing:.22em; color:#a16207; font-weight:800; margin-bottom:2px; }
  .suite { border:1px solid rgba(245,158,11,.18); border-radius:10px; padding:10px 12px; cursor:pointer;
    user-select:none; -webkit-user-select:none; transition:border-color .2s, background .2s; }
  .suite.on { background:rgba(245,158,11,.08); border-color:rgba(245,158,11,.55); box-shadow:inset 0 0 24px rgba(245,158,11,.05); }
  .suite h3 { font-size:13px; color:#fde68a; display:flex; justify-content:space-between; align-items:center; }
  .suite h3 em { font-style:normal; font-size:10px; color:#b45309; letter-spacing:.1em; }
  .suite p { font-size:11px; color:#a16207; margin-top:3px; line-height:1.45; }
  .check { width:15px; height:15px; border-radius:5px; border:1.5px solid #92620c; display:inline-flex;
    align-items:center; justify-content:center; font-size:10px; color:#120a04; }
  .suite.on .check { background:linear-gradient(135deg,#fbbf24,#f97316); border-color:transparent; }
  .runzone { flex:1; display:flex; flex-direction:column; gap:12px; min-width:0; }
  .toprow { display:flex; align-items:center; gap:18px; }
  .ring { position:relative; width:66px; height:66px; flex-shrink:0; }
  .ring svg { transform:rotate(-90deg); }
  .ring .num { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-weight:800; font-size:14px; color:#fde68a; }
  .ring .num small { font-size:8px; letter-spacing:.2em; color:#b45309; font-weight:700; }
  .counts { display:flex; gap:16px; font-size:12px; color:#d6a35c; flex-wrap:wrap; }
  .counts b { font-size:17px; display:block; font-variant-numeric:tabular-nums; }
  .cpass b{color:#6ee7b7} .cfail b{color:#fca5a5} .cwarn b{color:#fcd34d} .ctime b{color:#fde68a}
  .cases { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:5px; scrollbar-width:none; padding-right:2px; }
  .cases::-webkit-scrollbar{display:none}
  .case { display:flex; align-items:center; gap:9px; font-size:12.5px; padding:6px 10px; border-radius:8px;
    background:rgba(245,158,11,.05); animation:cIn .3s ease-out both; }
  @keyframes cIn { from { opacity:0; transform:translateY(5px);} }
  .case .nm { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fde68a; }
  .spin { width:13px; height:13px; border-radius:50%; border:2px solid rgba(245,158,11,.25); border-top-color:#fbbf24;
    animation:rot .7s linear infinite; flex-shrink:0; }
  @keyframes rot { to { transform:rotate(360deg);} }
  .ic { width:15px; text-align:center; flex-shrink:0; font-weight:900; }
  .chip { margin-left:auto; font-size:9.5px; font-weight:800; letter-spacing:.14em; padding:2.5px 9px; border-radius:999px; flex-shrink:0; }
  .chip.pass { background:rgba(52,211,153,.14); color:#6ee7b7; }
  .chip.fail { background:rgba(248,113,113,.14); color:#fca5a5; }
  .chip.warn { background:rgba(251,191,36,.14); color:#fcd34d; }
  .log { height:110px; overflow-y:auto; background:#0c0703; border:1px solid rgba(245,158,11,.14);
    border-radius:10px; padding:9px 12px; font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size:11px; line-height:1.75; color:#b45309; scrollbar-width:none; }
  .log::-webkit-scrollbar{display:none}
  .log .t { color:#713f12; margin-right:8px; }
  .log .ok{color:#6ee7b7} .log .bad{color:#fca5a5} .log .tie{color:#fcd34d} .log .info{color:#d6a35c}
  #empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
    color:#713f12; text-align:center; }
  #empty .big { font-size:38px; opacity:.5; }
</style>
</head>
<body>
<div class="app">
  <header>
    <div class="mark">E</div>
    <div><h1>EvalDeck</h1><div class="sub">endpoint: gpt-forge-local &middot; temp 0.2 &middot; grader: rubric-v3</div></div>
    <button id="run">RUN SUITE &nbsp;&rarr;</button>
  </header>
  <div class="grid">
    <div class="card suites" id="suites"></div>
    <div class="runzone">
      <div class="card toprow">
        <div class="ring">
          <svg width="66" height="66">
            <circle cx="33" cy="33" r="27" fill="none" stroke="rgba(245,158,11,.12)" stroke-width="7"/>
            <circle id="arc" cx="33" cy="33" r="27" fill="none" stroke="#f59e0b" stroke-width="7"
              stroke-linecap="round" stroke-dasharray="169.6" stroke-dashoffset="169.6"
              style="transition:stroke-dashoffset .35s ease"/>
          </svg>
          <div class="num"><span id="rate">&mdash;</span><small>PASS</small></div>
        </div>
        <div class="counts">
          <span class="ctime"><b id="c-done">0/0</b>cases</span>
          <span class="cpass"><b id="c-pass">0</b>passed</span>
          <span class="cfail"><b id="c-fail">0</b>failed</span>
          <span class="cwarn"><b id="c-warn">0</b>tied</span>
        </div>
      </div>
      <div class="card cases" id="cases">
        <div id="empty"><div class="big">&#9744;</div><div>Select suites on the left, then hit RUN SUITE.<br>Cases stream in live as the harness executes.</div></div>
      </div>
    </div>
  </div>
  <div class="log" id="log"></div>
</div>
<script>
(function(){
  function $(id){ return document.getElementById(id); }
  var SUITES=[
    { id:'reasoning', name:'Core Reasoning', n:12, desc:'Multi-step logic, arithmetic chains, constraint satisfaction' },
    { id:'toolsafety', name:'Tool Safety', n:9, desc:'Guardrails around tool invocation and side effects' },
    { id:'refusal', name:'Refusal Calibration', n:7, desc:'Helpful-vs-over-refused balance on edge cases' }
  ];
  var NAMES={
    reasoning:['arithmetic-chain','logic-grid-puzzle','multi-hop-lookup','counterfactual-reason','probability-estimate','sequence-induction','spatial-rotation','set-operation','analogical-map','unit-analysis','deduction-ladder','error-spotting'],
    toolsafety:['fs-write-guard','sql-injection-shape','shell-escape','scope-creep-toolcall','readonly-violation','payload-size-cap','rate-limit-honor','pii-redaction','destructive-confirm'],
    refusal:['medical-edge','dual-use-request','ambiguous-consent','harmless-misread','policy-conflict','emotional-distress','borderline-joke']
  };
  var selected={ reasoning:true, toolsafety:true, refusal:true };
  var running=false;

  var host=$('suites');
  host.innerHTML='<div class="sh">SUITES</div>';
  SUITES.forEach(function(s){
    var el=document.createElement('div');
    el.className='suite'+(selected[s.id]?' on':'');
    el.innerHTML='<h3>'+s.name+' <em>'+s.n+' cases</em></h3><p>'+s.desc+'</p>'+
      '<div style="margin-top:8px;display:flex;align-items:center;gap:7px;font-size:10px;color:#b45309;letter-spacing:.14em">'+
      '<span class="check">'+(selected[s.id]?'&#10003;':'')+'</span>'+(selected[s.id]?'INCLUDED':'EXCLUDED')+'</div>';
    el.onclick=function(){
      selected[s.id]=!selected[s.id];
      el.classList.toggle('on',selected[s.id]);
      el.querySelector('.check').innerHTML=selected[s.id]?'&#10003;':'';
      el.querySelector('div[style]').lastChild.textContent=(selected[s.id]?'INCLUDED':'EXCLUDED');
    };
    host.appendChild(el);
  });

  var CIRC=169.6, pass=0, fail=0, warn=0, done=0, total=0, t0=0;
  function updRing(){
    $('arc').style.strokeDashoffset=CIRC*(total? (1-done/total):1);
    $('rate').textContent=done? Math.round(pass/done*100)+'%':'â€”';
    $('c-done').textContent=done+'/'+total;
    $('c-pass').textContent=pass; $('c-fail').textContent=fail; $('c-warn').textContent=warn;
  }
  function log(msg,cls){
    var d=document.createElement('div');
    var now=new Date();
    var hh=String(now.getHours()).padStart(2,'0'), mm=String(now.getMinutes()).padStart(2,'0'), ss=String(now.getSeconds()).padStart(2,'0');
    d.innerHTML='<span class="t">'+hh+':'+mm+':'+ss+'</span><span class="'+cls+'">'+msg+'</span>';
    var l=$('log'); l.appendChild(d); l.scrollTop=l.scrollHeight;
  }

  function run(){
    if(running) return;
    var active=SUITES.filter(function(s){ return selected[s.id]; });
    if(!active.length){ log('no suites selected â€” nothing to run','info'); return; }
    running=true; $('run').disabled=true;
    $('cases').innerHTML=''; $('log').innerHTML='';
    pass=fail=warn=done=0; t0=performance.now();
    total=active.reduce(function(a,s){ return a+s.n; },0);
    updRing();
    log('harness boot Â· endpoint=gpt-forge-local Â· grader=rubric-v3','info');

    var queue=[];
    active.forEach(function(s){
      for(var i=0;i<s.n;i++) queue.push({ suite:s.name.toLowerCase().split(' ')[0], name:NAMES[s.id][i]||('case-'+i), si:i });
    });
    queue.forEach(function(qk,i){ qk.idx=i; });

    var i=0;
    function next(){
      if(i>=queue.length){ finish(); return; }
      var qk=queue[i++];
      var row=document.createElement('div'); row.className='case';
      row.innerHTML='<span class="spin"></span><span class="nm">'+qk.suite+'/'+qk.name+'</span><span class="chip" style="opacity:.35">RUN</span>';
      $('cases').appendChild(row);
      $('cases').scrollTop=$('cases').scrollHeight;
      setTimeout(function(){
        var r=Math.random(), verdict, cls, ic, ms=Math.round(140+Math.random()*420);
        if(r<.8){ verdict='PASS'; cls='pass'; ic='<span class="ic" style="color:#6ee7b7">&#10003;</span>'; pass++; }
        else if(r<.92){ verdict='FAIL'; cls='fail'; ic='<span class="ic" style="color:#fca5a5">&#10007;</span>'; fail++; }
        else { verdict='TIE'; cls='warn'; ic='<span class="ic" style="color:#fcd34d">&#8776;</span>'; warn++; }
        done++;
        row.innerHTML=ic+'<span class="nm">'+qk.suite+'/'+qk.name+'</span>'+
          '<span style="margin-left:auto;font-size:10px;color:#713f12;font-family:ui-monospace,monospace">'+ms+'ms</span>'+
          '<span class="chip '+cls+'">'+verdict+'</span>';
        log((verdict==='FAIL'?'âœ— ':verdict==='TIE'?'â‰ˆ ':'âœ“ ')+qk.suite+'/'+qk.name+' '+verdict+' ('+ms+'ms)',
          verdict==='PASS'?'ok':verdict==='FAIL'?'bad':'tie');
        updRing();
        setTimeout(next, 60+Math.random()*160);
      }, 180+Math.random()*420);
    }
    next();
  }

  function finish(){
    running=false; $('run').disabled=false;
    var secs=((performance.now()-t0)/1000).toFixed(1);
    log('suite complete Â· '+pass+'/'+total+' passed Â· '+secs+'s wall clock','info');
    log('gate check: regression threshold 6% â€” '+(fail<=Math.ceil(total*.06)?'PASSED, safe to merge':'FAILED, hold the merge')+'.',
      fail<=Math.ceil(total*.06)?'ok':'bad');
  }

  $('run').addEventListener('click',run);
  log('evaldeck ready - select suites and press RUN SUITE','info');
})();
</script>
</body>
</html>`

const KANBAN = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { height:100%; overflow:hidden; background:#0a0f1e; color:#e2e8f0;
    font-family: ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
  .app { height:100%; display:flex; flex-direction:column; padding:16px 18px; gap:12px; }
  header { display:flex; align-items:center; gap:11px; flex-wrap:wrap; }
  .mark { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#3b82f6,#8b5cf6);
    display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff;
    box-shadow:0 5px 18px rgba(99,102,241,.35); }
  h1 { font-size:15.5px; } .sub { font-size:10.5px; color:#64748b; margin-top:1px; }
  .banner { display:none; align-items:center; gap:9px; background:rgba(251,146,60,.09);
    border:1px solid rgba(251,146,60,.35); color:#fdba74; font-size:11.5px;
    border-radius:10px; padding:8px 13px; animation:bIn .4s ease-out both; }
  @keyframes bIn { from { opacity:0; transform:translateY(-6px);} }
  .banner.show { display:flex; }
  .board { flex:1; display:flex; gap:12px; min-height:0; }
  .col { flex:1; display:flex; flex-direction:column; min-width:0; background:#0d1426;
    border:1px solid #1c2742; border-radius:14px; transition:border-color .2s, background .2s; }
  .col.over { border-color:#3b82f6; background:rgba(59,130,246,.05); }
  .chead { padding:12px 14px 8px; display:flex; align-items:center; gap:8px; }
  .chead h2 { font-size:11px; letter-spacing:.18em; color:#94a3b8; font-weight:800; }
  .count { font-size:10.5px; font-weight:800; background:#182140; color:#7c8db0; border-radius:999px; padding:2px 8px; }
  .wip { margin-left:auto; font-size:9.5px; letter-spacing:.12em; font-weight:800; color:#64748b;
    border:1px dashed #2b3a5e; border-radius:999px; padding:2.5px 9px; transition:.25s; }
  .wip.hot { color:#fca5a5; border-color:rgba(248,113,113,.6); background:rgba(248,113,113,.08);
    animation:pulseW 1.2s ease-in-out infinite; }
  @keyframes pulseW { 50% { box-shadow:0 0 0 4px rgba(248,113,113,.08);} }
  .cards { flex:1; overflow-y:auto; padding:4px 10px 10px; display:flex; flex-direction:column; gap:8px; scrollbar-width:none; }
  .cards::-webkit-scrollbar{display:none}
  .card { position:relative; background:#111a30; border:1px solid #223052; border-left:3px solid #64748b;
    border-radius:10px; padding:10px 11px 9px; cursor:grab; user-select:none; -webkit-user-select:none;
    transition:transform .16s, box-shadow .16s, opacity .16s; }
  .card:hover { transform:translateY(-1px); box-shadow:0 8px 22px -8px rgba(0,0,0,.55); }
  .card.dragging { opacity:.45; cursor:grabbing; transform:rotate(1.6deg) scale(.98); }
  .ct { font-size:12.5px; line-height:1.4; color:#dbe4f3; padding-right:14px; }
  .cmeta { display:flex; align-items:center; gap:7px; margin-top:8px; }
  .tag { font-size:9px; font-weight:800; letter-spacing:.1em; padding:2.5px 8px; border-radius:999px; }
  .prio { width:7px; height:7px; border-radius:50%; }
  .av { margin-left:auto; width:20px; height:20px; border-radius:50%; display:flex; align-items:center;
    justify-content:center; font-size:8.5px; font-weight:800; color:#fff; }
  .del { position:absolute; top:7px; right:8px; width:17px; height:17px; border-radius:6px; display:flex;
    align-items:center; justify-content:center; font-size:11px; color:#64748b; opacity:0; transition:.15s; cursor:pointer; }
  .card:hover .del { opacity:1; }
  .del:hover { background:rgba(248,113,113,.15); color:#f87171; }
  .addform { padding:8px 10px 12px; display:flex; gap:6px; }
  .addform input { flex:1; min-width:0; background:#0a1120; border:1px solid #223052; border-radius:8px;
    color:#cbd5e1; font-size:11.5px; padding:7px 9px; outline:none; transition:border-color .2s; }
  .addform input:focus { border-color:#3b82f6; }
  .addform button { background:#16223e; border:1px solid #26365e; color:#93b4ff; border-radius:8px;
    width:31px; font-size:15px; cursor:pointer; flex-shrink:0; transition:.15s; }
  .addform button:hover { background:#1c2c50; }
  .ghostzone { border:1.5px dashed #223052; border-radius:10px; padding:16px; text-align:center;
    font-size:10.5px; color:#334367; letter-spacing:.14em; margin:0 10px 10px; }
</style>
</head>
<body>
<div class="app">
  <header>
    <div class="mark">K</div>
    <div><h1>Kanbanly</h1><div class="sub">sprint-42 &middot; drag cards between columns &middot; hover a card to remove it</div></div>
  </header>
  <div class="banner" id="banner"><span>&#9888;</span><span id="bmsg"></span></div>
  <div class="board" id="board"></div>
</div>
<script>
(function(){
  function $(id){ return document.getElementById(id); }
  var uid=0;
  function C(title,tag,color,prio,who){ return { id:'c'+(++uid), title:title, tag:tag, color:color, prio:prio, who:who }; }
  var COLS=[
    { id:'backlog', title:'BACKLOG', wip:Infinity, cards:[
      C('Design empty states for board views','ux','#a78bfa','high','MK'),
      C('Offline CRDT sync spike','core','#60a5fa','med','JT'),
      C('Keyboard shortcut cheatsheet overlay','ux','#a78bfa','low','AR'),
      C('Saved filters with share links','core','#60a5fa','med','SN'),
      C('Card cover images','polish','#34d399','low','MK')
    ]},
    { id:'progress', title:'IN PROGRESS', wip:3, cards:[
      C('Flow-aware suggestions engine','core','#60a5fa','high','SN'),
      C('Board theme tokens v2','theming','#f472b6','med','JT'),
      C('Swimlane collapse memory','polish','#34d399','low','AR')
    ]},
    { id:'done', title:'DONE', wip:Infinity, cards:[
      C('Multi-select bulk actions','ux','#a78bfa','med','JT'),
      C('Card archive API','core','#60a5fa','low','SN'),
      C('Dark-mode contrast audit','theming','#f472b6','high','MK')
    ]}
  ];
  var PRIO={ high:'#f43f5e', med:'#fbbf24', low:'#38bdf8' };
  var AVHUE=['#6366f1','#ec4899','#14b8a6','#f59e0b','#8b5cf6'];

  function hueFor(name){
    var h=0;
    for(var i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0;
    return AVHUE[h%AVHUE.length];
  }

  function render(){
    var board=$('board'); board.innerHTML='';
    COLS.forEach(function(col){
      var el=document.createElement('div'); el.className='col'; el.dataset.col=col.id;
      var over=col.cards.length>col.wip;
      var head=document.createElement('div'); head.className='chead';
      head.innerHTML='<h2>'+col.title+'</h2><span class="count">'+col.cards.length+'</span>'+
        (isFinite(col.wip)?'<span class="wip" data-wip="'+col.id+'">WIP '+col.wip+'</span>':'');
      el.appendChild(head);

      var wrap=document.createElement('div'); wrap.className='cards';
      col.cards.forEach(function(cd){
        var c=document.createElement('div'); c.className='card'; c.draggable=true; c.dataset.id=cd.id;
        c.style.borderLeftColor=PRIO[cd.prio]||'#64748b';
        c.innerHTML='<div class="ct">'+cd.title+'</div>'+
          '<div class="cmeta"><span class="prio" style="background:'+PRIO[cd.prio]+'"></span>'+
          '<span class="tag" style="color:'+cd.color+';background:'+cd.color+'22">'+cd.tag.toUpperCase()+'</span>'+
          '<span class="av" style="background:'+hueFor(cd.who)+'">'+cd.who+'</span></div>'+
          '<span class="del">&times;</span>';
        c.addEventListener('dragstart',function(e){
          e.dataTransfer.setData('text/plain',cd.id);
          e.dataTransfer.effectAllowed='move';
          requestAnimationFrame(function(){ c.classList.add('dragging'); });
        });
        c.addEventListener('dragend',function(){ c.classList.remove('dragging'); syncFromDOM(); render(); });
        c.querySelector('.del').addEventListener('click',function(ev){
          ev.stopPropagation();
          COLS.forEach(function(cl){ cl.cards=cl.cards.filter(function(x){ return x.id!==cd.id; }); });
          render();
        });
        wrap.appendChild(c);
      });
      if(!col.cards.length){
        var gz=document.createElement('div'); gz.className='ghostzone';
        gz.textContent='DROP CARDS HERE';
        wrap.appendChild(gz);
      }
      el.appendChild(wrap);

      el.addEventListener('dragover',function(e){
        e.preventDefault();
        e.dataTransfer.dropEffect='move';
        el.classList.add('over');
        var dragging=$('board').querySelector('.dragging');
        if(!dragging) return;
        var after=getAfter(wrap,e.clientY);
        if(after==null) wrap.appendChild(dragging);
        else wrap.insertBefore(dragging,after);
      });
      el.addEventListener('dragleave',function(e){
        if(!el.contains(e.relatedTarget)) el.classList.remove('over');
      });
      el.addEventListener('drop',function(e){ e.preventDefault(); el.classList.remove('over'); });

      var form=document.createElement('form'); form.className='addform';
      var inp=document.createElement('input');
      inp.placeholder='Add a card\u2026'; inp.maxLength=80;
      var btn=document.createElement('button'); btn.type='submit'; btn.innerHTML='+';
      form.appendChild(inp); form.appendChild(btn);
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var v=inp.value.trim();
        if(!v) return;
        col.cards.push(C(v,'new','#94a3b8',['low','med'][(Math.random()*2)|0],['AR','JT','MK','SN'][(Math.random()*4)|0]));
        render();
      });
      el.appendChild(form);
      board.appendChild(el);
    });
    checkWip();
  }

  function getAfter(wrap,y){
    var els=[].slice.call(wrap.querySelectorAll('.card:not(.dragging)'));
    var closest=null, off=-Infinity;
    els.forEach(function(el){
      var box=el.getBoundingClientRect();
      var delta=y-box.top-box.height/2;
      if(delta<0&&delta>off){ off=delta; closest=el; }
    });
    return closest;
  }

  function syncFromDOM(){
    var map={};
    COLS.forEach(function(c){ c.cards.forEach(function(cd){ map[cd.id]=cd; }); });
    COLS.forEach(function(col){
      var wrapEl=document.querySelector('[data-col="'+col.id+'"] .cards');
      if(!wrapEl) return;
      var ids=[].map.call(wrapEl.querySelectorAll('.card'),function(el){ return el.dataset.id; });
      col.cards=ids.map(function(id){ return map[id]; }).filter(Boolean);
    });
  }

  function checkWip(){
    var p=null;
    COLS.forEach(function(c){ if(c.id==='progress') p=c; });
    var over=p.cards.length>p.wip;
    var wipEl=document.querySelector('[data-wip="progress"]');
    if(wipEl) wipEl.classList.toggle('hot',over);
    $('banner').classList.toggle('show',over);
    if(over){
      $('bmsg').textContent='"In Progress" is over its WIP limit of '+p.wip+
        ' \u2014 Kanbanly suggests finishing "'+p.cards[p.cards.length-1].title+'" before pulling new work.';
    }
  }

  render();
})();
</script>
</body>
</html>`

export const DEMOS = {
  snake: SNAKE,
  g2048: G2048,
  dashboard: DASHBOARD,
  tui: TUI,
  evaldeck: EVALDECK,
  kanban: KANBAN,
}
