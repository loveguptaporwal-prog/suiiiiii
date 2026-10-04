import { gsap } from 'gsap';

/**
 * Discovery Framework
 * Manages reusable, un-opinionated interactive anchors in the environment.
 * In Phase 1, it establishes the interaction architecture (proximity affordance,
 * camera focus glide, content reveal canvas, and return transition) without
 * assigning premature personal symbolism or cliché text.
 */
export class DiscoverySystem {
  constructor(camera, containerId = 'discovery-layer', modalId = 'discovery-modal') {
    this.camera = camera;
    this.container = document.getElementById(containerId);
    this.modal = document.getElementById(modalId);
    this.cardBody = document.getElementById('discovery-card-body');
    this.returnBtn = document.getElementById('discovery-return-btn');
    this.backdrop = this.modal?.querySelector('.discovery-backdrop');

    this.entities = [];
    this.activeEntity = null;

    this.initDefaultEntities();
    this.bindEvents();
  }

  initDefaultEntities() {
    // Two restrained, neutral interactive anchors for Phase 1 demonstration
    const defaultData = [
      {
        id: 'anchor-celestial',
        xPct: 32,
        yPct: 26,
        variant: 'cool',
        index: 'I',
        title: 'Celestial Anchor',
        annotation: 'Reserved for a future memory, photograph, or personal observation.',
      },
      {
        id: 'anchor-terrestrial',
        xPct: 76,
        yPct: 65,
        variant: 'warm',
        index: 'II',
        title: 'Atmospheric Anchor',
        annotation: 'Reserved for a future video fragment, secret message, or note.',
      },
    ];

    defaultData.forEach((item) => this.registerEntity(item));
  }

  registerEntity(config) {
    if (!this.container) return;

    const el = document.createElement('div');
    el.className = 'discovery-anchor';
    el.setAttribute('data-id', config.id);
    el.setAttribute('data-variant', config.variant || 'cool');
    el.style.left = `${config.xPct}%`;
    el.style.top = `${config.yPct}%`;

    el.innerHTML = `
      <div class="entity-pulse-ring"></div>
      <div class="entity-core"></div>
    `;

    this.container.appendChild(el);

    const entity = {
      config,
      element: el,
      xPct: config.xPct,
      yPct: config.yPct,
    };

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.inspect(entity);
    });

    this.entities.push(entity);
  }

  bindEvents() {
    // Proximity feedback: as cursor nears an anchor, it subtly swells
    window.addEventListener('mousemove', (e) => {
      if (this.activeEntity) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      for (let i = 0; i < this.entities.length; i++) {
        const ent = this.entities[i];
        const rect = ent.element.getBoundingClientRect();
        const anchorX = rect.left + rect.width / 2;
        const anchorY = rect.top + rect.height / 2;

        const dist = Math.hypot(mouseX - anchorX, mouseY - anchorY);
        if (dist < 130) {
          ent.element.classList.add('proximity');
        } else {
          ent.element.classList.remove('proximity');
        }
      }
    });

    // Dismissal
    this.returnBtn?.addEventListener('click', () => this.dismiss());
    this.backdrop?.addEventListener('click', () => this.dismiss());
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeEntity) this.dismiss();
    });
  }

  inspect(entity) {
    if (this.activeEntity) return;
    this.activeEntity = entity;

    // Retrieve screen coordinates for camera glide
    const rect = entity.element.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    // Glide camera toward object
    this.camera.focusOn(targetX, targetY, 1.2, 1.8);

    // Populate neutral discovery card
    if (this.cardBody) {
      this.cardBody.innerHTML = `
        <span class="card-index">${entity.config.index}</span>
        <h2 class="card-title">${entity.config.title}</h2>
        <p class="card-annotation">${entity.config.annotation}</p>
      `;
    }

    // Reveal modal after slight camera ingress
    gsap.delayedCall(0.8, () => {
      this.modal.classList.add('active');
      this.modal.setAttribute('aria-hidden', 'false');
    });
  }

  dismiss() {
    if (!this.activeEntity) return;

    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');

    // Restore camera
    this.camera.resetFocus(1.6);
    this.activeEntity = null;
  }
}
