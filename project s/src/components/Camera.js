import { gsap } from 'gsap';

/**
 * Camera Component
 * Cinematic 2.5D inertia camera controller.
 * Translates layered planes with depth-stratified lerping to evoke
 * the feeling of looking through a prime lens into a living physical space.
 */
export class Camera {
  constructor(worldId = 'world') {
    this.world = document.getElementById(worldId);
    this.layers = document.querySelectorAll('.parallax-layer');

    // Target and smoothed coordinates (normalized -1 to 1)
    this.target = { x: 0, y: 0 };
    this.current = { x: 0, y: 0 };
    this.isFocused = false;
    this.focusTransform = { x: 0, y: 0, scale: 1 };

    // Damping factor for weighty, cinematic inertia
    this.lerpFactor = 0.045;
    this.maxDisplacement = { x: 40, y: 28 };

    this.bindEvents();
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  bindEvents() {
    // Desktop Mouse Parallax
    window.addEventListener('mousemove', (e) => {
      if (this.isFocused) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      this.target.x = nx;
      this.target.y = ny;
    });

    // Mobile Touch Parallax
    window.addEventListener('touchmove', (e) => {
      if (this.isFocused || !e.touches[0]) return;
      const touch = e.touches[0];
      const nx = (touch.clientX / window.innerWidth) * 2 - 1;
      const ny = (touch.clientY / window.innerHeight) * 2 - 1;
      this.target.x = nx * 0.75;
      this.target.y = ny * 0.75;
    }, { passive: true });

    // Device Orientation (gentle tilt if supported)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (this.isFocused || e.gamma === null || e.beta === null) return;
        // Clamp gamma (-30 to 30) and beta (-20 to 40)
        const tiltX = Math.max(-30, Math.min(30, e.gamma)) / 30;
        const tiltY = Math.max(-20, Math.min(40, e.beta - 30)) / 30;
        this.target.x = tiltX * 0.6;
        this.target.y = tiltY * 0.6;
      }, { passive: true });
    }
  }

  loop() {
    if (!this.isFocused) {
      // Smooth linear interpolation for inertia
      this.current.x += (this.target.x - this.current.x) * this.lerpFactor;
      this.current.y += (this.target.y - this.current.y) * this.lerpFactor;

      const dx = this.current.x * this.maxDisplacement.x;
      const dy = this.current.y * this.maxDisplacement.y;

      // Apply stratified depth translation to each plane
      for (let i = 0; i < this.layers.length; i++) {
        const layer = this.layers[i];
        const depth = parseFloat(layer.getAttribute('data-depth')) || 0.2;
        const lx = -dx * depth;
        const ly = -dy * depth;
        layer.style.transform = `translate3d(${lx.toFixed(2)}px, ${ly.toFixed(2)}px, 0)`;
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  }

  /**
   * Smoothly glides the camera toward an interactive anchor
   */
  focusOn(screenX, screenY, zoom = 1.15, duration = 1.8) {
    this.isFocused = true;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (centerX - screenX) * 0.35;
    const offsetY = (centerY - screenY) * 0.35;

    gsap.to(this.world, {
      x: offsetX,
      y: offsetY,
      scale: zoom,
      duration,
      ease: 'power3.inOut',
    });
  }

  /**
   * Restores camera to normal floating perspective
   */
  resetFocus(duration = 1.6) {
    gsap.to(this.world, {
      x: 0,
      y: 0,
      scale: 1,
      duration,
      ease: 'power3.out',
      onComplete: () => {
        this.isFocused = false;
        this.current.x = 0;
        this.current.y = 0;
      },
    });
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
