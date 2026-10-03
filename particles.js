/* particles.js — canvas particle system.
   Starfield, fairy dust, falling rose petals, touch trails, confetti, candle smoke. */
class ParticleCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = []; this.ambient = []; this.sparkles = []; this.confetti = []; this.petals = []; this.smoke = [];
    this.width = innerWidth; this.height = innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    let rt = null;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => this.resize(), 150); });
    this.initStars(); this.initAmbient(); this.initTouch();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }
  resize() {
    this.width = innerWidth; this.height = innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }
    this.initStars();
    this.initAmbient();
  }
  initStars() {
    this.stars = [];
    const n = Math.min(160, Math.max(45, Math.floor(this.width / 10)));
    for (let i = 0; i < n; i++) {
      this.stars.push({
        x: Math.random() * this.width, y: Math.random() * this.height,
        r: Math.random() * 1.1 + 0.3, base: Math.random() * 0.35 + 0.15,
        amp: Math.random() * 0.3 + 0.1, speed: Math.random() * 0.0015 + 0.0005,
        phase: Math.random() * Math.PI * 2, gold: Math.random() > 0.7
      });
    }
  }
  initAmbient() {
    this.ambient = [];
    const count = Math.min(38, Math.max(16, Math.floor(this.width / 24)));
    for (let i = 0; i < count; i++) {
      this.ambient.push({
        x: Math.random() * this.width, y: Math.random() * this.height,
        size: Math.random() * 2.2 + 0.8,
        sx: (Math.random() - 0.5) * 0.35, sy: -Math.random() * 0.4 - 0.12,
        base: Math.random() * 0.35 + 0.25, amp: Math.random() * 0.2 + 0.1,
        speed: Math.random() * 0.002 + 0.001, phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.45 ? 45 : 340
      });
    }
  }
  initTouch() {
    let lx = 0, ly = 0;
    const move = (x, y) => {
      if (Math.hypot(x - lx, y - ly) < 8) return;
      lx = x; ly = y;
      if (this.sparkles.length < 35) {
        for (let i = 0; i < 2; i++) this.sparkles.push(this.mkSparkle(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12));
      }
    };
    addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
        for (let i = 0; i < 3; i++) this.sparkles.push(this.mkSparkle(lx + (Math.random() - 0.5) * 14, ly + (Math.random() - 0.5) * 14));
      }
    }, { passive: true });
    addEventListener('touchmove', (e) => { if (e.touches && e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
  }
  mkSparkle(x, y) {
    return { x, y, size: Math.random() * 2.8 + 1.2, vx: (Math.random() - 0.5) * 1.8, vy: (Math.random() - 0.5) * 1.8 - 0.8,
      color: Math.random() > 0.5 ? '#e8c476' : '#ffcad4', life: 1, decay: Math.random() * 0.045 + 0.035 };
  }
  createConfetti(x = this.width / 2, y = this.height / 2, count = 85) {
    const colors = ['#ff758f', '#ffb3c1', '#e8c476', '#06d6a0', '#118ab2', '#c77dff', '#fff0f3', '#ffe494', '#d4af37'];
    const shapes = ['rect', 'rect', 'heart', 'star', 'ribbon'];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 11 + 3.5;
      this.confetti.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3.8,
        size: Math.random() * 7 + 4, shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 8,
        flip: Math.random() * Math.PI * 2, flipSpeed: Math.random() * 0.12 + 0.04,
        gravity: 0.3, drag: 0.965, life: 1, decay: Math.random() * 0.014 + 0.008 });
    }
  }
  createPetals(x = this.width / 2, y = this.height / 3, count = 16) {
    const colors = ['#ffb3c1', '#ff9ebb', '#ffc2d1', '#ffd1dc', '#ff8fab'];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 3 + 1;
      this.petals.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5,
        size: Math.random() * 5 + 4, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2, color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.95, decay: Math.random() * 0.004 + 0.002 });
    }
  }
  createWaxCrumbBurst(x, y, count = 30) {
    const colors = ['#8a1c1e', '#b5383a', '#ffd700', '#d4af37', '#6e1a1b'];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = Math.random() * 7 + 2;
      this.confetti.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2,
        size: Math.random() * 4 + 2, shape: 'rect', color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 12, gravity: 0.35, drag: 0.94,
        life: 1, decay: Math.random() * 0.02 + 0.015 });
    }
  }
  createShootingStar(x, y) {
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2, sp = Math.random() * 6 + 4;
      this.sparkles.push({ x, y, size: Math.random() * 3.5 + 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        color: Math.random() > 0.3 ? '#e8c476' : '#fff', life: 1, decay: Math.random() * 0.03 + 0.02 });
    }
  }
  createCandleSmoke(x, y, count = 22) {
    for (let i = 0; i < count; i++) {
      this.smoke.push({ x: x + (Math.random() - 0.5) * 8, y,
        vx: (Math.random() - 0.5) * 0.7, vy: -Math.random() * 1.6 - 0.8,
        size: Math.random() * 4 + 2, alpha: 0.65, decay: Math.random() * 0.012 + 0.008,
        curl: (Math.random() - 0.5) * 0.04 });
    }
  }
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const now = Date.now();
    /* starfield */
    for (const s of this.stars) {
      const a = Math.max(0.05, s.base + Math.sin(now * s.speed + s.phase) * s.amp);
      this.ctx.fillStyle = s.gold ? `rgba(232,196,118,${a})` : `rgba(255,255,255,${a})`;
      this.ctx.beginPath(); this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); this.ctx.fill();
    }
    /* fairy dust */
    for (const p of this.ambient) {
      p.x += p.sx; p.y += p.sy;
      if (p.y < -10) { p.y = this.height + 10; p.x = Math.random() * this.width; }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      const a = Math.max(0.12, Math.min(0.85, p.base + Math.sin(now * p.speed + p.phase) * p.amp));
      this.ctx.fillStyle = `hsla(${p.hue},90%,75%,${a})`;
      this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); this.ctx.fill();
    }
    /* ambient falling petals */
    if (this.petals.length < 9 && Math.random() < 0.012) {
      this.petals.push({ x: Math.random() * this.width, y: -14, vx: 0, vy: Math.random() * 0.4 + 0.35,
        size: Math.random() * 5 + 4, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.04,
        phase: Math.random() * Math.PI * 2, color: ['#ffb3c1', '#ff9ebb', '#ffc2d1'][Math.floor(Math.random() * 3)],
        alpha: 0.8, decay: 0.0006 });
    }
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      p.phase += 0.03;
      p.x += p.vx + Math.sin(p.phase) * 0.7; p.vx *= 0.98;
      p.y += p.vy; p.vy = Math.min(p.vy + 0.01, 1.1);
      p.rot += p.vr; p.alpha -= p.decay;
      if (p.alpha <= 0 || p.y > this.height + 20) { this.petals.splice(i, 1); continue; }
      this.ctx.save();
      this.ctx.translate(p.x, p.y); this.ctx.rotate(p.rot);
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -p.size);
      this.ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.4, p.size * 0.7, p.size * 0.5, 0, p.size);
      this.ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.9, -p.size * 0.4, 0, -p.size);
      this.ctx.fill(); this.ctx.restore();
    }
    /* touch sparkles */
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      if (s.life <= 0) { this.sparkles.splice(i, 1); continue; }
      const r = s.size * s.life;
      this.ctx.save(); this.ctx.globalAlpha = Math.max(0, s.life); this.ctx.fillStyle = s.color;
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y - r * 1.5);
      this.ctx.lineTo(s.x + r * 0.4, s.y - r * 0.4);
      this.ctx.lineTo(s.x + r * 1.5, s.y);
      this.ctx.lineTo(s.x + r * 0.4, s.y + r * 0.4);
      this.ctx.lineTo(s.x, s.y + r * 1.5);
      this.ctx.lineTo(s.x - r * 0.4, s.y + r * 0.4);
      this.ctx.lineTo(s.x - r * 1.5, s.y);
      this.ctx.lineTo(s.x - r * 0.4, s.y - r * 0.4);
      this.ctx.closePath(); this.ctx.fill(); this.ctx.restore();
    }
    /* confetti */
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx; c.y += c.vy; c.vx *= c.drag; c.vy *= c.drag; c.vy += c.gravity;
      c.rot += c.rotSpeed; c.life -= c.decay;
      if (c.life <= 0 || c.y > this.height + 25) { this.confetti.splice(i, 1); continue; }
      this.ctx.save(); this.ctx.globalAlpha = Math.max(0, c.life);
      this.ctx.translate(c.x, c.y); this.ctx.rotate(c.rot * Math.PI / 180);
      if (c.flipSpeed) { c.flip += c.flipSpeed; this.ctx.scale(1, Math.cos(c.flip)); }
      this.ctx.fillStyle = c.color;
      if (c.shape === 'heart') {
        const s = c.size * 0.45;
        this.ctx.beginPath();
        this.ctx.moveTo(0, s * 0.3);
        this.ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.5, 0, s * 1.3);
        this.ctx.bezierCurveTo(s * 1.2, s * 0.5, s, -s * 0.5, 0, s * 0.3);
        this.ctx.fill();
      } else if (c.shape === 'star') {
        const s = c.size * 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s); this.ctx.lineTo(s * 0.3, -s * 0.3); this.ctx.lineTo(s, 0);
        this.ctx.lineTo(s * 0.3, s * 0.3); this.ctx.lineTo(0, s); this.ctx.lineTo(-s * 0.3, s * 0.3);
        this.ctx.lineTo(-s, 0); this.ctx.lineTo(-s * 0.3, -s * 0.3);
        this.ctx.closePath(); this.ctx.fill();
      } else if (c.shape === 'ribbon') {
        this.ctx.fillRect(-c.size / 2, -c.size * 0.2, c.size, c.size * 0.4);
      } else {
        this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.65);
      }
      this.ctx.restore();
    }
    /* candle smoke */
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const sm = this.smoke[i];
      sm.x += sm.vx + Math.sin(sm.y * sm.curl); sm.y += sm.vy;
      sm.size += 0.28; sm.alpha -= sm.decay;
      if (sm.alpha <= 0) { this.smoke.splice(i, 1); continue; }
      this.ctx.save(); this.ctx.globalAlpha = Math.max(0, sm.alpha);
      const g = this.ctx.createRadialGradient(sm.x, sm.y, 0, sm.x, sm.y, sm.size);
      g.addColorStop(0, 'rgba(235,235,245,0.65)');
      g.addColorStop(0.7, 'rgba(215,215,230,0.25)');
      g.addColorStop(1, 'rgba(200,200,220,0)');
      this.ctx.fillStyle = g;
      this.ctx.beginPath(); this.ctx.arc(sm.x, sm.y, sm.size, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.restore();
    }
    requestAnimationFrame(this.animate);
  }
}