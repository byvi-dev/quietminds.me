const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const BG = '#5BB8D0';
const P = 6;
const pads = [];
const ripples = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function makePad() {
  const sizeClass = Math.random();
  const cols = sizeClass > 0.6 ? Math.floor(Math.random() * 3) + 6
      : sizeClass > 0.3 ? Math.floor(Math.random() * 2) + 4
          : 3;
  const w = cols * P * 2;
  const h = w * 0.45;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.4 + Math.random() * 0.5;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    w, h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    cols,
    opacity: 0.7 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
    flip: Math.random() > 0.5,
    slitSide: Math.random() > 0.5 ? 0.35 : 0.55
  };
}

const PAD_COUNT = 22;
for (let i = 0; i < PAD_COUNT; i++) pads.push(makePad());

function drawPixelPad(p, t) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  const bob = Math.sin(t * 0.0006 + p.phase) * 1.5;
  const cx = Math.round(p.x);
  const cy = Math.round(p.y + bob);
  const pw = p.w;
  const ph = Math.round(p.h / P) * P;
  const px = cx - pw / 2;
  const py = cy - ph / 2;
  const rows = Math.round(ph / P);
  const cols = Math.round(pw / P);

  ctx.fillStyle = '#5BAF82';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const margin = Math.floor((rows - r) * 0.28);
      if (c < margin || c >= cols - margin) continue;
      ctx.fillRect(px + c * P, py + r * P, P - 1, P - 1);
    }
  }

  ctx.fillStyle = '#4A9B70';
  for (let r = 0; r < rows; r++) {
    const margin = Math.floor((rows - r) * 0.28);
    ctx.fillRect(px + margin * P, py + r * P, P - 1, P - 1);
    ctx.fillRect(px + (cols - margin - 1) * P, py + r * P, P - 1, P - 1);
  }
  for (let c = 0; c < cols; c++) {
    const margin = Math.floor(rows * 0.28);
    if (c < margin || c >= cols - margin) continue;
    ctx.fillRect(px + c * P, py, P - 1, P - 1);
    ctx.fillRect(px + c * P, py + (rows - 1) * P, P - 1, P - 1);
  }

  const slitX = px + Math.floor(cols * p.slitSide) * P;
  for (let sr = 0; sr < Math.floor(rows * 0.5); sr++) {
    ctx.fillStyle = BG;
    ctx.fillRect(slitX, py + sr * P, P, P);
    if (sr < 2) ctx.fillRect(slitX + (p.flip ? -P : P), py + sr * P, P, P);
  }

  ctx.fillStyle = '#F4A7B9';
  ctx.fillRect(cx - P, cy - P, P * 2, P);
  ctx.fillRect(cx, cy, P, P * 2);

  ctx.restore();
}

function drawRipple(r) {
  ctx.save();
  ctx.globalAlpha = r.alpha;
  ctx.strokeStyle = '#4AAABF';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const s = r.size + i * P * 2;
    ctx.strokeRect(Math.round(r.x - s/2), Math.round(r.y - s/4), Math.round(s), Math.round(s/2));
  }
  ctx.restore();
}

function checkCollisions() {
  for (let i = 0; i < pads.length; i++) {
    const a = pads[i];
    const aLeft = a.x - a.w / 2;
    const aRight = a.x + a.w / 2;
    const aTop = a.y - a.h / 2;
    const aBottom = a.y + a.h / 2;

    for (let j = i + 1; j < pads.length; j++) {
      const b = pads[j];
      const bLeft = b.x - b.w / 2;
      const bRight = b.x + b.w / 2;
      const bTop = b.y - b.h / 2;
      const bBottom = b.y + b.h / 2;

      const overlapX = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
      const overlapY = Math.min(aBottom, bBottom) - Math.max(aTop, bTop);

      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
          const sign = a.x < b.x ? -1 : 1;
          a.vx = Math.abs(a.vx) * sign * (0.8 + Math.random() * 0.4);
          b.vx = Math.abs(b.vx) * -sign * (0.8 + Math.random() * 0.4);
          a.x += sign * (overlapX / 2 + 1);
          b.x -= sign * (overlapX / 2 + 1);
        } else {
          const sign = a.y < b.y ? -1 : 1;
          a.vy = Math.abs(a.vy) * sign * (0.8 + Math.random() * 0.4);
          b.vy = Math.abs(b.vy) * -sign * (0.8 + Math.random() * 0.4);
          a.y += sign * (overlapY / 2 + 1);
          b.y -= sign * (overlapY / 2 + 1);
        }
        ripples.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, size: 4, alpha: 0.4 });
      }
    }

    const margin = 10;
    if (aLeft < margin) { a.vx = Math.abs(a.vx); a.x = a.w/2 + margin; }
    if (aRight > canvas.width - margin) { a.vx = -Math.abs(a.vx); a.x = canvas.width - a.w/2 - margin; }
    if (aTop < margin) { a.vy = Math.abs(a.vy); a.y = a.h/2 + margin; }
    if (aBottom > canvas.height - margin) { a.vy = -Math.abs(a.vy); a.y = canvas.height - a.h/2 - margin; }
  }
}

canvas.addEventListener('click', (e) => {
  ripples.push({ x: e.clientX, y: e.clientY, size: 4, alpha: 0.8 });
  pads.forEach(p => {
    const dx = p.x - e.clientX;
    const dy = p.y - e.clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 150) {
      const force = (150 - dist) / 150 * 2;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
  });
});

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  ripples.push({ x: touch.clientX, y: touch.clientY, size: 4, alpha: 0.8 });
}, { passive: true });

function jumpDot() {
  const frog = document.getElementById('dot');
  frog.classList.remove('jump');
  void frog.offsetWidth;
  frog.classList.add('jump');
  ripples.push({ x: window.innerWidth/2, y: window.innerHeight/2 + 60, size: 4, alpha: 0.9 });
}

window.jumpDot = jumpDot;

const MAX_SPEED = 1.8;
function loop(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pads.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    const spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
    if (spd > MAX_SPEED) { p.vx = (p.vx/spd)*MAX_SPEED; p.vy = (p.vy/spd)*MAX_SPEED; }
    if (spd < 0.3) { p.vx *= 1.01; p.vy *= 1.01; }
    drawPixelPad(p, t);
  });

  checkCollisions();

  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.size += 2.5;
    r.alpha -= 0.016;
    if (r.alpha <= 0) { ripples.splice(i, 1); continue; }
    drawRipple(r);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);