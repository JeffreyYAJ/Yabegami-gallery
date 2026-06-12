
const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let W, H, SCALE = 3;
let PW, PH; // pixel dimensions

function resize() {
  const wrap = canvas.parentElement;
  W = wrap.clientWidth;
  H = wrap.clientHeight;
  canvas.width = W;
  canvas.height = H;
  PW = Math.ceil(W / SCALE);
  PH = Math.ceil(H / SCALE);
  ctx.imageSmoothingEnabled = false;
}
resize();
window.addEventListener('resize', resize);

// ─── Color palette ───
const PAL = {
  // Sky/water zones
  SKY_TOP:    '#1a2a5e',
  SKY_MID:    '#1e3570',
  HORIZON:    '#2a4a8a',
  WATER_SURF: '#1a6a8a',
  WATER_MID:  '#0f4a6a',
  WATER_DEEP: '#0a2a4a',
  SAND:       '#c8a860',
  SAND_DARK:  '#9a7838',
  ROCK:       '#445566',
  ROCK_DARK:  '#2a3544',
  FOAM:       '#c8eeff',
  BUBBLE:     '#88ccffaa',
  // Creature palettes
  FISH_A:     ['#ff8840','#ffaa60','#ff5520','#ffffff','#000000'],
  FISH_B:     ['#4488ff','#66aaff','#2266dd','#ffffff','#000000'],
  FISH_C:     ['#ff44aa','#ff66cc','#cc2288','#ffffff','#000000'],
  CRAB:       ['#dd4422','#ff6644','#aa2200','#ffffff','#000000'],
  JELLYFISH:  ['#aa66ff','#cc88ff','#8844dd','#ffccff','#ffffff'],
  SEAHORSE:   ['#44cc88','#66ffaa','#228844','#ffffff','#000000'],
  TURTLE:     ['#448833','#66aa44','#226622','#ccaa66','#000000'],
  CORAL_R:    '#dd4455',
  CORAL_G:    '#44dd88',
  SEAWEED:    '#226633',
  SEAWEED_L:  '#338844',
};

// ─── Sprite definitions (8x8 pixel maps) ───
// 0=transparent, 1-5=palette indices
const SPRITES = {
  fish_r: [
    [0,0,1,1,1,0,0,2],
    [0,1,1,3,1,1,0,2],
    [1,1,1,1,1,1,2,2],
    [1,1,3,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,2],
    [0,1,1,1,1,1,0,2],
    [0,0,1,1,1,0,0,2],
  ],
  fish_l: [
    [2,0,0,1,1,1,0,0],
    [2,0,1,1,3,1,1,0],
    [2,2,1,1,1,1,1,1],
    [1,1,1,1,1,3,1,1],
    [1,1,1,1,1,1,1,1],
    [2,2,1,1,1,1,1,1],
    [2,0,1,1,1,1,1,0],
    [2,0,0,1,1,1,0,0],
  ],
  crab: [
    [0,2,0,1,1,0,2,0],
    [2,0,1,1,1,1,0,2],
    [0,1,1,2,2,1,1,0],
    [1,1,2,3,3,2,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,2,1,1,2,1,0],
    [0,2,0,1,1,0,2,0],
    [0,0,2,0,0,2,0,0],
  ],
  jellyfish: [
    [0,0,1,1,1,1,0,0],
    [0,1,2,2,2,2,1,0],
    [1,2,2,3,3,2,2,1],
    [1,1,2,2,2,2,1,1],
    [0,1,1,1,1,1,1,0],
    [0,1,0,1,1,0,1,0],
    [0,1,0,0,0,0,1,0],
    [0,0,0,1,1,0,0,0],
  ],
  seahorse: [
    [0,0,1,1,0,0,0,0],
    [0,1,2,2,1,0,0,0],
    [0,1,3,1,1,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,1,1,1,1,0,0,0],
    [1,1,0,0,1,1,0,0],
    [0,1,1,0,0,1,0,0],
    [0,0,1,1,1,0,0,0],
  ],
  turtle: [
    [0,2,2,0,0,2,2,0],
    [2,1,1,2,2,1,1,2],
    [2,1,3,1,1,3,1,2],
    [1,1,1,1,1,1,1,1],
    [1,1,1,2,2,1,1,1],
    [2,1,1,1,1,1,1,2],
    [2,1,1,2,2,1,1,2],
    [0,2,2,0,0,2,2,0],
  ],
  bubble: [
    [0,0,1,1,0,0,0,0],
    [0,1,2,2,1,0,0,0],
    [1,2,2,2,2,1,0,0],
    [1,2,2,2,2,1,0,0],
    [0,1,1,1,1,1,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  star: [
    [0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [1,1,2,1,1,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  zzz: [
    [0,1,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  sweat: [
    [0,0,0,1,0,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  heart: [
    [0,1,0,1,0,0,0,0],
    [1,2,1,2,1,0,0,0],
    [1,2,2,2,1,0,0,0],
    [0,1,2,1,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  excl: [
    [0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
};

// Draw a sprite at pixel position
function drawSprite(sprite, px, py, palette, flip=false, alpha=1) {
  ctx.globalAlpha = alpha;
  for(let row=0; row<8; row++) {
    for(let col=0; col<8; col++) {
      const ci = sprite[row][flip ? 7-col : col];
      if(ci === 0) continue;
      const color = palette[ci-1];
      if(!color || color==='0') continue;
      ctx.fillStyle = color;
      ctx.fillRect((px+col)*SCALE, (py+row)*SCALE, SCALE, SCALE);
    }
  }
  ctx.globalAlpha = 1;
}

// ─── World state ───
let creatures = [];
let bubbles = [];
let particles = [];
let corals = [];
let seaweeds = [];
let frame = 0;
let simStress = false;
let cpuStress = 0; // 0-100

// Simulated CPU data
let fakeCPU = 20;
let fakeTemp = 42;

// ─── Background ───
function drawBackground() {
  // Sky gradient (pixel bands)
  const skyColors = ['#0d1a3a','#122040','#162648','#1a2c50','#1e3258','#223860','#263e68'];
  const skyH = Math.floor(PH * 0.38);
  skyColors.forEach((c, i) => {
    ctx.fillStyle = c;
    const bandH = Math.ceil(skyH / skyColors.length);
    ctx.fillRect(0, i*bandH*SCALE, W, bandH*SCALE);
  });

  // Stars (static, based on position)
  ctx.fillStyle = '#ffffff';
  for(let i=0; i<40; i++) {
    const sx = (i * 173 % PW);
    const sy = (i * 97 % (skyH - 4));
    const blink = Math.sin(frame*0.05 + i*1.7);
    if(blink > 0.3) {
      ctx.globalAlpha = 0.4 + blink*0.5;
      ctx.fillRect(sx*SCALE, sy*SCALE, SCALE, SCALE);
    }
  }
  ctx.globalAlpha = 1;

  // Moon
  ctx.fillStyle = '#ffffc0';
  const moonX = Math.floor(PW * 0.82), moonY = 6;
  for(let my=0; my<6; my++) for(let mx=0; mx<6; mx++) {
    const d = Math.sqrt((mx-3)**2 + (my-3)**2);
    if(d < 3) { ctx.fillRect((moonX+mx)*SCALE, (moonY+my)*SCALE, SCALE, SCALE); }
  }
  ctx.fillStyle = '#ddddaa';
  ctx.fillRect((moonX+1)*SCALE, (moonY+1)*SCALE, SCALE, SCALE);
  ctx.fillRect((moonX+4)*SCALE, (moonY+4)*SCALE, SCALE, SCALE);

  // Water surface (shimmer)
  const waterY = Math.floor(PH * 0.38);
  const waterColors = ['#1a5a7a','#1a6a8a','#1e7090','#228898'];
  for(let row=0; row<4; row++) {
    ctx.fillStyle = waterColors[row];
    ctx.fillRect(0, (waterY+row)*SCALE, W, SCALE);
  }

  // Foam / wave highlights
  ctx.fillStyle = '#c8eeff';
  for(let wx=0; wx<PW; wx++) {
    const wave = Math.sin(wx*0.15 + frame*0.04) * 1.5;
    if((wx + frame) % 7 < 3) {
      ctx.globalAlpha = 0.5 + Math.sin(frame*0.06+wx)*0.3;
      ctx.fillRect(wx*SCALE, (waterY + 1 + Math.round(wave))*SCALE, SCALE, SCALE);
    }
  }
  ctx.globalAlpha = 1;

  // Deep water
  const deepColors = ['#0f4a6a','#0d4060','#0b3858','#093050','#07284a','#052040'];
  for(let row=0; row<deepColors.length; row++) {
    ctx.fillStyle = deepColors[row];
    const y = waterY + 4 + row * Math.floor((PH - waterY - 4) / deepColors.length);
    const h = Math.ceil((PH - waterY - 4) / deepColors.length);
    ctx.fillRect(0, y*SCALE, W, h*SCALE);
  }

  // Sand bottom
  const sandY = Math.floor(PH * 0.85);
  for(let sx=0; sx<PW; sx++) {
    const wave = Math.sin(sx * 0.08 + frame * 0.01) * 1;
    const sy = sandY + Math.round(wave);
    ctx.fillStyle = PAL.SAND_DARK;
    ctx.fillRect(sx*SCALE, sy*SCALE, SCALE, (PH-sy)*SCALE);
    ctx.fillStyle = PAL.SAND;
    ctx.fillRect(sx*SCALE, sy*SCALE, SCALE, 2*SCALE);
  }
}

// Draw corals
function drawCorals() {
  corals.forEach(c => {
    const sway = Math.sin(frame*0.03 + c.phase) * 1;
    // Stem
    for(let i=0; i<c.height; i++) {
      ctx.fillStyle = i%2===0 ? c.color : c.color2;
      ctx.fillRect((c.x + Math.round(sway*i/c.height))*SCALE, (c.y - i)*SCALE, 2*SCALE, SCALE);
    }
    // Top bloom
    const bx = c.x + Math.round(sway);
    const by = c.y - c.height;
    for(let dx=-2; dx<=2; dx++) {
      for(let dy=-2; dy<=1; dy++) {
        const d = Math.abs(dx)+Math.abs(dy);
        if(d < 3) {
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = d===0 ? '#ffffff' : c.color;
          ctx.fillRect((bx+dx)*SCALE, (by+dy)*SCALE, SCALE, SCALE);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
}

// Draw seaweeds
function drawSeaweeds() {
  seaweeds.forEach(s => {
    for(let i=0; i<s.height; i++) {
      const sway = Math.sin(frame*0.04 + s.phase + i*0.3) * 2;
      const alt = (i%2===0) ? 1 : -1;
      ctx.fillStyle = i%3===0 ? PAL.SEAWEED_L : PAL.SEAWEED;
      ctx.fillRect((s.x + Math.round(sway) + alt)*SCALE, (s.y - i)*SCALE, 2*SCALE, SCALE);
      // Leaf
      if(i % 3 === 1) {
        ctx.fillStyle = PAL.SEAWEED_L;
        ctx.fillRect((s.x + Math.round(sway) + alt + 2)*SCALE, (s.y - i)*SCALE, 2*SCALE, SCALE);
      }
    }
  });
}

// ─── Creature class ───
class Creature {
  constructor(type, x, y) {
    this.type = type;
    this.x = x; // pixel coords
    this.y = y;
    this.vx = (Math.random()-0.5)*0.4;
    this.vy = (Math.random()-0.5)*0.2;
    this.facing = this.vx > 0 ? 1 : -1;
    this.state = 'swim'; // swim, idle, sleep, stressed, love, chase
    this.stateTimer = 0;
    this.stateMax = 180 + Math.random()*300;
    this.energy = 80 + Math.random()*20;
    this.happiness = 80 + Math.random()*20;
    this.age = 0;
    this.phase = Math.random()*Math.PI*2;
    this.target = null;
    this.emotion = null; // 'zzz','heart','sweat','excl'
    this.emotionTimer = 0;
    this.name = this.genName();
    this.id = Math.random().toString(36).slice(2,7);
    this.bobOffset = Math.random()*Math.PI*2;
    this.scale = 1 + Math.random()*0.3;
    this.lastBubble = 0;
    // Bounds based on zone
    this.zone = this.getZone();
    this.setZoneBounds();
  }
  genName() {
    const n = {fish:['Nemo','Dory','Bubbles','Flash','Flip'],crab:['Craby','Pinch','Sandy','Red'],jellyfish:['Glow','Float','Wisp','Bliss'],seahorse:['Swirl','Curly','Pip','Neo'],turtle:['Crush','Zen','Slow','Sage']};
    const arr = n[this.type]||['Buddy'];
    return arr[Math.floor(Math.random()*arr.length)] + (Math.random()>0.6 ? (Math.floor(Math.random()*9)+1) : '');
  }
  getZone() {
    if(this.type==='jellyfish') return 'surface';
    if(this.type==='crab' || this.type==='turtle') return 'bottom';
    return 'mid';
  }
  setZoneBounds() {
    const wY = Math.floor(PH*0.38)+4;
    const sandY = Math.floor(PH*0.85);
    if(this.zone==='surface') { this.yMin=wY; this.yMax=wY+Math.floor(PH*0.2); }
    else if(this.zone==='bottom') { this.yMin=sandY-12; this.yMax=sandY-2; }
    else { this.yMin=wY+Math.floor(PH*0.1); this.yMax=sandY-15; }
  }
  getPalette() {
    const pal = {fish:PAL.FISH_A,fish_b:PAL.FISH_B,fish_c:PAL.FISH_C,crab:PAL.CRAB,jellyfish:PAL.JELLYFISH,seahorse:PAL.SEAHORSE,turtle:PAL.TURTLE};
    if(this.type==='fish') {
      const variants=[PAL.FISH_A,PAL.FISH_B,PAL.FISH_C];
      if(!this._palIdx) this._palIdx=Math.floor(Math.random()*3);
      return variants[this._palIdx];
    }
    return pal[this.type]||PAL.FISH_A;
  }
  getSprite() {
    if(this.type==='crab') return SPRITES.crab;
    if(this.type==='jellyfish') return SPRITES.jellyfish;
    if(this.type==='seahorse') return SPRITES.seahorse;
    if(this.type==='turtle') return SPRITES.turtle;
    return this.facing>0 ? SPRITES.fish_r : SPRITES.fish_l;
  }
  update(stress) {
    this.age++;
    this.stateTimer++;
    if(this.emotionTimer>0) this.emotionTimer--;
    // Energy drain
    this.energy -= 0.01 + stress*0.03;
    if(this.energy < 0) this.energy = 0;
    this.happiness -= stress*0.02;
    this.happiness = Math.max(0, Math.min(100, this.happiness));
    // State machine
    if(this.stateTimer > this.stateMax) {
      this.stateTimer = 0;
      this.stateMax = 100+Math.random()*300;
      const r = Math.random();
      if(stress > 60) {
        this.state = r < 0.5 ? 'stressed' : 'swim';
        if(this.state==='stressed'){ this.emotion='sweat'; this.emotionTimer=60; }
      } else if(this.energy < 30) {
        this.state = 'sleep';
        this.emotion='zzz'; this.emotionTimer=200;
      } else {
        if(r<0.4) this.state='swim';
        else if(r<0.6) this.state='idle';
        else if(r<0.75) this.state='love';
        else { this.state='swim'; }
      }
    }
    // Movement
    const bob = Math.sin(frame*0.06+this.bobOffset)*0.15;
    if(this.state==='swim' || this.state==='stressed') {
      const spd = this.state==='stressed' ? 1.2 : (this.type==='turtle'?0.18:0.35);
      if(this.state==='stressed') {
        this.vx += (Math.random()-0.5)*0.3;
        this.vy += (Math.random()-0.5)*0.2;
      }
      this.x += this.vx * spd + (Math.random()-0.5)*0.1;
      this.y += this.vy * spd + bob;
      // Boundaries
      const margin = 8;
      if(this.x < margin) { this.vx += 0.08; }
      if(this.x > PW - 10) { this.vx -= 0.08; }
      if(this.y < this.yMin) { this.vy += 0.05; }
      if(this.y > this.yMax) { this.vy -= 0.08; }
      // Damp
      this.vx *= 0.97;
      this.vy *= 0.97;
      // Clamp speed
      const spmax = this.state==='stressed' ? 1.0 : 0.6;
      const sp = Math.sqrt(this.vx**2+this.vy**2);
      if(sp>spmax){ this.vx*=spmax/sp; this.vy*=spmax/sp; }
      if(Math.abs(this.vx)>0.05) this.facing = this.vx>0?1:-1;
    } else if(this.state==='idle') {
      this.x += bob*0.3;
      this.y += bob*0.5;
    } else if(this.state==='sleep') {
      this.vy *= 0.95;
      this.vx *= 0.95;
      this.y += Math.sin(frame*0.02+this.bobOffset)*0.1;
    } else if(this.state==='love') {
      if(this.age%120===0){ this.emotion='heart'; this.emotionTimer=40; }
      this.x += this.vx*0.2;
      this.y += bob*0.3;
    }
    this.x = Math.max(0, Math.min(PW-10, this.x));
    this.y = Math.max(this.yMin, Math.min(this.yMax, this.y));
    // Bubbles
    if(frame - this.lastBubble > 60+Math.random()*120) {
      this.lastBubble = frame;
      bubbles.push({ x:this.x+4, y:this.y, vy:-0.3-Math.random()*0.2, alpha:0.8, r:1+Math.random()*1.5 });
    }
  }
  draw() {
    const px = Math.round(this.x);
    const py = Math.round(this.y);
    const pal = this.getPalette();
    // Heat tint
    if(cpuStress>60) {
      const hotPal = pal.map((c,i)=>i===0?blendHex(c,'#ff4400',Math.min(0.4,(cpuStress-60)/80)):c);
      drawSprite(this.getSprite(), px, py, hotPal, this.type!=='fish' && this.facing<0);
    } else {
      drawSprite(this.getSprite(), px, py, pal, this.type!=='fish' && this.facing<0);
    }
    // Emotion icon
    if(this.emotionTimer>0 && this.emotion) {
      const emAlpha = Math.min(1, this.emotionTimer/15);
      const emColors = {
        zzz:['#aaddff','#88bbdd'],heart:['#ff4488','#ff88aa'],
        sweat:['#44aaff','#2288dd'],excl:['#ffdd00','#ffaa00']
      };
      const ec = emColors[this.emotion]||['#ffffff','#cccccc'];
      drawSprite(SPRITES[this.emotion], px-2, py-6, [ec[0],ec[1],'#ffffff','#000000','#ffffff'], false, emAlpha);
    }
  }
}

function blendHex(hex, tgt, t) {
  const r1=parseInt(hex.slice(1,3),16),g1=parseInt(hex.slice(3,5),16),b1=parseInt(hex.slice(5,7),16);
  const r2=parseInt(tgt.slice(1,3),16),g2=parseInt(tgt.slice(3,5),16),b2=parseInt(tgt.slice(5,7),16);
  const r=Math.round(r1+(r2-r1)*t).toString(16).padStart(2,'0');
  const g=Math.round(g1+(g2-g1)*t).toString(16).padStart(2,'0');
  const b=Math.round(b1+(b2-b1)*t).toString(16).padStart(2,'0');
  return `#${r}${g}${b}`;
}

// ─── Init world ───
function initWorld() {
  // Corals
  const sandY = Math.floor(PH*0.85);
  for(let i=0;i<8;i++) {
    corals.push({
      x: Math.floor(PW*(0.05+i*0.12+Math.random()*0.06)),
      y: sandY-1,
      height: 3+Math.floor(Math.random()*6),
      color: [PAL.CORAL_R, PAL.CORAL_G, '#ffaa44','#aa44ff'][Math.floor(Math.random()*4)],
      color2: '#ffffff',
      phase: Math.random()*Math.PI*2
    });
  }
  // Seaweeds
  for(let i=0;i<12;i++) {
    seaweeds.push({
      x: Math.floor(PW*(Math.random()*0.95)+1),
      y: sandY-1,
      height: 5+Math.floor(Math.random()*10),
      phase: Math.random()*Math.PI*2
    });
  }
  // Initial creatures
  spawnCreature('fish'); spawnCreature('fish'); spawnCreature('fish');
  spawnCreature('crab');
  spawnCreature('jellyfish'); spawnCreature('jellyfish');
  spawnCreature('seahorse');
  spawnCreature('turtle');
}

function spawnCreature(type) {
  const wY = Math.floor(PH*0.38)+4;
  const sandY = Math.floor(PH*0.85);
  let y;
  if(type==='crab'||type==='turtle') y = sandY-8+Math.random()*4;
  else if(type==='jellyfish') y = wY+Math.random()*Math.floor(PH*0.18);
  else y = wY + Math.floor(PH*0.15) + Math.random()*Math.floor(PH*0.35);
  const c = new Creature(type, Math.random()*(PW-12)+2, y);
  creatures.push(c);
  document.getElementById('val-pop').textContent = creatures.length;
}
window.spawnCreature = spawnCreature;

// Bubbles
function updateBubbles() {
  bubbles = bubbles.filter(b=>b.alpha>0.05);
  bubbles.forEach(b=>{
    b.y += b.vy;
    b.x += Math.sin(frame*0.08+b.y)*0.2;
    b.alpha *= 0.995;
    // Pop at surface
    const surfY = Math.floor(PH*0.38)+2;
    if(b.y < surfY) b.alpha = 0;
  });
}

function drawBubbles() {
  bubbles.forEach(b=>{
    const bx=Math.round(b.x), by=Math.round(b.y);
    const r=Math.ceil(b.r);
    ctx.globalAlpha=b.alpha*0.6;
    ctx.fillStyle='#88ccff';
    ctx.fillRect(bx*SCALE, by*SCALE, r*SCALE, r*SCALE);
    ctx.fillStyle='#ffffff';
    ctx.fillRect(bx*SCALE, by*SCALE, SCALE, SCALE);
    ctx.globalAlpha=1;
  });
}

// ─── CPU simulation ───
function toggleStress() {
  simStress = !simStress;
  const btn = document.getElementById('sim-speed');
  btn.textContent = simStress ? '❄️ ARRÊTER STRESS' : '⚡ SIMULER CHALEUR';
  btn.style.borderColor = simStress ? '#ff4422' : '#334455';
  btn.style.color = simStress ? '#ff4422' : '#88aacc';
}
window.toggleStress = toggleStress;

function updateStats() {
  // Fake CPU drift
  if(simStress) {
    fakeCPU = Math.min(95, fakeCPU + (Math.random()*5-1));
    fakeTemp = Math.min(85, fakeTemp + (Math.random()*2-0.3));
  } else {
    fakeCPU = Math.max(10, fakeCPU + (Math.random()*4-2.5));
    fakeTemp = Math.max(35, fakeTemp + (Math.random()*2-1.2));
  }
  cpuStress = fakeCPU;
  const cpuEl = document.getElementById('val-cpu');
  const tempEl = document.getElementById('val-temp');
  const statCpu = document.getElementById('stat-cpu');
  const statTemp = document.getElementById('stat-temp');
  cpuEl.textContent = Math.round(fakeCPU)+'%';
  tempEl.textContent = Math.round(fakeTemp)+'°C';
  statCpu.className = 'stat-pill' + (fakeCPU>80?' hot':fakeCPU>60?' warn':'');
  statTemp.className = 'stat-pill' + (fakeTemp>75?' hot':fakeTemp>60?' warn':'');
  document.getElementById('hbar-fill').style.width = fakeCPU+'%';
  document.getElementById('hbar-fill').style.background = fakeCPU>75?'#ff4422':fakeCPU>50?'#ffaa00':'#00ffcc';
  // Time
  const now=new Date();
  document.getElementById('val-time').textContent=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  // Mood
  const avgHappy = creatures.reduce((a,c)=>a+c.happiness,0)/(creatures.length||1);
  const moodEl = document.getElementById('mood-indicator');
  if(cpuStress>75) moodEl.textContent='😰';
  else if(cpuStress>55) moodEl.textContent='😓';
  else if(avgHappy>70) moodEl.textContent='😊';
  else if(avgHappy>50) moodEl.textContent='😐';
  else moodEl.textContent='😴';
}

// ─── Tooltip on hover ───
canvas.addEventListener('mousemove', e=>{
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX-rect.left)/SCALE;
  const my = (e.clientY-rect.top)/SCALE;
  const tip = document.getElementById('tooltip');
  let found = null;
  for(const c of creatures) {
    if(Math.abs(c.x-mx)<8 && Math.abs(c.y-my)<8) { found=c; break; }
  }
  if(found) {
    tip.style.display='block';
    tip.style.left=(e.clientX+12)+'px';
    tip.style.top=(e.clientY-10)+'px';
    const stateEmoji={swim:'🏊',idle:'🌊',sleep:'💤',stressed:'😰',love:'💕'}[found.state]||'?';
    tip.innerHTML=`<b style="color:#00ffcc">${found.name}</b><br>TYPE: ${found.type.toUpperCase()}<br>ÉTAT: ${stateEmoji} ${found.state.toUpperCase()}<br>ÉNERGIE: ${'█'.repeat(Math.floor(found.energy/10))}${'░'.repeat(10-Math.floor(found.energy/10))}<br>HUMEUR: ${Math.round(found.happiness)}%`;
  } else {
    tip.style.display='none';
  }
});
canvas.addEventListener('mouseleave',()=>{ document.getElementById('tooltip').style.display='none'; });

// ─── Interaction on click (feed/pet) ───
canvas.addEventListener('click', e=>{
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX-rect.left)/SCALE;
  const my = (e.clientY-rect.top)/SCALE;
  let found = null;
  for(const c of creatures) {
    if(Math.abs(c.x-mx)<10 && Math.abs(c.y-my)<10) { found=c; break; }
  }
  if(found) {
    found.happiness = Math.min(100, found.happiness+15);
    found.energy = Math.min(100, found.energy+10);
    found.emotion='heart'; found.emotionTimer=60;
    found.state='swim';
  } else {
    // Ripple effect — spawn a few bubbles
    for(let i=0;i<4;i++) {
      bubbles.push({x:mx+(Math.random()-0.5)*4, y:my, vy:-0.4-Math.random()*0.3, alpha:1, r:1+Math.random()});
    }
  }
});

// ─── Main loop ───
function loop() {
  requestAnimationFrame(loop);
  frame++;
  if(frame % 6 === 0) updateStats();

  // Clear
  ctx.clearRect(0,0,W,H);
  drawBackground();
  drawSeaweeds();
  drawCorals();
  updateBubbles();
  drawBubbles();

  // Update + draw creatures
  const stress = cpuStress;
  creatures.forEach(c=>c.update(stress));
  // Sort by y for depth
  creatures.sort((a,b)=>a.y-b.y);
  creatures.forEach(c=>c.draw());

  // Heat shimmer overlay
  if(cpuStress>70) {
    const shimmerAlpha = (cpuStress-70)/200;
    ctx.globalAlpha=shimmerAlpha;
    ctx.fillStyle=`#ff220011`;
    ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=1;
  }
}

initWorld();
loop();