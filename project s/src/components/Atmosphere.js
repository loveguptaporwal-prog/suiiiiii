/**
 * Atmosphere Component
 * Manages subtle floating dust/light motes drifting in the night air.
 * Designed to feel like atmospheric particles rather than video-game fireflies.
 */
export class Atmosphere {
  constructor(canvasId = 'particles-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.motes = [];
    this.animationFrameId = null;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.initMotes();
    this.start();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.parentElement.clientWidth || window.innerWidth;
    this.height = this.canvas.parentElement.clientHeight || window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.dpr = dpr;

    if (this.motes.length) {
      this.initMotes();
    }
  }

  initMotes() {
    // Restrained count: desktop ~40, mobile ~22
    const count = window.innerWidth < 768 ? 22 : 42;
    this.motes = [];

    for (let i = 0; i < count; i++) {
      this.motes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 0.8 + Math.random() * 1.5,
        baseAlpha: 0.12 + Math.random() * 0.28,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.15 - Math.random() * 0.25, // Gentle slow upward/diagonal drift
        swaySpeed: 0.001 + Math.random() * 0.002,
        swayAngle: Math.random() * Math.PI * 2,
        swayMagnitude: 0.35 + Math.random() * 0.5,
      });
    }
  }

  render(time) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const len = this.motes.length;
    for (let i = 0; i < len; i++) {
      const m = this.motes[i];

      // Organic drift with subtle sinusoidal air currents
      m.swayAngle += m.swaySpeed;
      m.x += m.vx + Math.sin(m.swayAngle) * m.swayMagnitude;
      m.y += m.vy;

      // Screen wrapping
      if (m.y < -10) m.y = this.height + 10;
      if (m.x < -10) m.x = this.width + 10;
      if (m.x > this.width + 10) m.x = -10;

      // Soft ambient glow
      const gradient = this.ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius * 2.8);
      gradient.addColorStop(0, `rgba(235, 245, 255, ${m.baseAlpha})`);
      gradient.addColorStop(0.5, `rgba(215, 230, 255, ${m.baseAlpha * 0.4})`);
      gradient.addColorStop(1, 'rgba(215, 230, 255, 0)');

      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.radius * 2.8, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  }

  start() {
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.render);
    }
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
