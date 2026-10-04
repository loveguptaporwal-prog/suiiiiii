// Project S — Reusable World Event Bus
// Decoupled interaction -> object response -> world reaction pipeline

class WorldEventBus {
  constructor() {
    this.listeners = new Map();
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  // Unsubscribe
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Dispatch an event through the pipeline
  emit(event, payload = {}) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[WorldEventBus] Error in handler for "${event}":`, err);
        }
      });
    }
  }

  // Standard Pipeline: USER_INTERACT -> OBJECT_RESPOND -> WORLD_REACT -> SETTLE
  triggerInteractionPipeline(targetId, interactionType, details = {}) {
    // 1. User initiates interaction
    this.emit('USER_INTERACT', {
      targetId,
      interactionType,
      timestamp: performance.now(),
      ...details,
    });

    // 2. Object directly responds physically/visually
    this.emit('OBJECT_RESPOND', {
      targetId,
      interactionType,
      responseState: 'active',
      ...details,
    });

    // 3. World / surroundings react (lighting nuance, ambient sound cues, character awareness)
    this.emit('WORLD_REACT', {
      sourceId: targetId,
      interactionType,
      ...details,
    });
  }
}

export const worldEventBus = new WorldEventBus();
