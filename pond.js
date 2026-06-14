const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const BG = '#5BB8D0';
const P = 5;
const pads = [];
const ripples = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function makePad() {
  const cols = Math.floor(Math.random() * 3) + 3;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    cols,
    w: cols * P * 2,
    speed: 0.08 + Math.random() * 0.18,
    drift: (Math.random() - 0.5) * 0.06,
    opacity: 0.55 + Math.random() * 0.45,
    phase: Math.random() * Math.PI * 2,
    flip: Math.random() > 0.5
  };
}

for (let i = 0; i < 16; i++) pads.push(makePad());

function drawPixelPad(p, t) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  const bob = Math.sin(t * 0.0008 + p.phase) * 2.5;
  const cx = Math.round(p.x);
  const cy = Math.round(p.y + bob);
  const pw = p.w;
  const ph = Math.round(pw * 0.42 / P) * P;
  const px = cx - pw / 2;
  const py = cy - ph / 2;
  const rows = Math.round(ph / P);
  const cols = Math.round(pw / P);

  ctx.fillStyle = '#5BAF82';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const margin = Math.floor((rows - r) * 0.25);
      if (c < margin || c >= cols - margin) continue;
      ctx.fillRect(px + c * P, py + r * P, P, P);
    }
  }

  ctx.fillStyle = '#4A9B70';
  for (let r = 0; r < rows; r++) {
    const margin = Math.floor((rows - r) * 0.25);
    ctx.fillRect(px + margin * P, py + r * P, P, P);
    ctx.fillRect(px + (cols - margin) * P - P, py + r * P, P, P);
  }
  for (let c = 0; c < cols; c++) {
    const margin = Math.floor(rows * 0.25);
    if (c < margin || c >= cols - margin) continue;
    ctx.fillRect(px + c * P, py, P, P);
    ctx.fillRect(px + c * P, py + (rows - 1) * P, P, P);
  }

  // slit
  const slitX = p.flip
    ? px + Math.floor(cols * 0.35) * P
    : px + Math.floor(cols * 0.55) * P;
  const slitTopY = py;
  for (let sr = 0; sr < Math.floor(rows * 0.45); sr++) {
    ctx.fillStyle = BG;
    ctx.fillRect(slitX, slitTopY + sr * P, P, P);
    if (sr < 2) ctx.fillRect(slitX + (p.flip ? -P : P), slitTopY + sr * P, P, P);
  }

  // pink salmon detail
  ctx.fillStyle = '#F4A7B9';
  ctx.fillRect(cx - P, cy - P, P * 2, P);
  ctx.fillRect(cx, cy, P, P);

  ctx.restore();
}

function drawRipple(r) {
  ctx.save();
  ctx.globalAlpha = r.alpha;
  ctx.strokeStyle = '#4AAABF';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const s = r.size + i * P * 2;
    ctx.strokeRect(
      Math.round(r.x - s / 2),
      Math.round(r.y - s / 4),
      Math.round(s),
      Math.round(s / 2)
    );
  }
  ctx.restore();
}

canvas.addEventListener('click', (e) => {
  ripples.push({ x: e.clientX, y: e.clientY, size: 4, alpha: 0.8 });
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
  ripples.push({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2 + 60,
    size: 4,
    alpha: 0.9
  });
}

window.jumpDot = jumpDot;

function loop(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pads.forEach(p => {
    p.x += p.speed;
    p.y += p.drift;
    if (p.x > canvas.width + 100) { p.x = -100; p.y = Math.random() * canvas.height; }
    if (p.y < -100) p.y = canvas.height + 100;
    if (p.y > canvas.height + 100) p.y = -100;
    drawPixelPad(p, t);
  });
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
