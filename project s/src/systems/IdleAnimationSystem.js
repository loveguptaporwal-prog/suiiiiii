// Project S — Reusable Idle Environmental Animation System
// Asynchronous phase-shifted micro-animations ensuring organic living world without synthetic unison

export class IdleAnimationCoordinator {
  constructor() {
    this.registry = new Map();
  }

  // Register an idle entity with organic parameters
  register(id, {
    baseSpeed = 1.0,
    speedVariation = 0.3,
    amplitude = 1.0,
    phase = Math.random() * Math.PI * 2,
    secondaryFactor = 0.5,
  } = {}) {
    const config = {
      speed: baseSpeed + (Math.random() - 0.5) * speedVariation * 2,
      amplitude,
      phase,
      secondarySpeed: (baseSpeed * 1.618) + (Math.random() - 0.5) * 0.2, // Golden ratio harmonics
      secondaryPhase: Math.random() * Math.PI * 2,
      secondaryFactor,
    };
    this.registry.set(id, config);
    return config;
  }

  unregister(id) {
    this.registry.delete(id);
  }

  // Evaluate organic dual-harmonic wave at time t for a given entity
  evaluate(id, time) {
    let config = this.registry.get(id);
    if (!config) {
      config = this.register(id);
    }

    const primary = Math.sin(time * config.speed + config.phase);
    const secondary = Math.cos(time * config.secondarySpeed + config.secondaryPhase) * config.secondaryFactor;
    return (primary + secondary) * config.amplitude;
  }

  // Generate 3D sway vector [swayX, bobY, tiltZ]
  evaluate3D(id, time, { xAmp = 0.02, yAmp = 0.03, zAmp = 0.015 } = {}) {
    const v1 = this.evaluate(`${id}_x`, time);
    const v2 = this.evaluate(`${id}_y`, time);
    const v3 = this.evaluate(`${id}_z`, time);
    return [v1 * xAmp, v2 * yAmp, v3 * zAmp];
  }
}

export const idleCoordinator = new IdleAnimationCoordinator();
