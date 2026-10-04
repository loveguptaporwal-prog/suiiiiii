// Project S — Reusable Character Animation State Machine & Blending Controller
// Prepares future family characters for smooth behavioral transitions without abrupt popping

export const CharacterStates = Object.freeze({
  IDLE: 'IDLE',
  LOOK: 'LOOK',
  NOTICE: 'NOTICE',
  INTERACT: 'INTERACT',
  REACT: 'REACT',
  CELEBRATE: 'CELEBRATE',
  EAT: 'EAT',
  RETURN_TO_IDLE: 'RETURN_TO_IDLE',
});

export class CharacterAnimationController {
  constructor(characterId, options = {}) {
    this.id = characterId;
    this.currentState = CharacterStates.IDLE;
    this.previousState = CharacterStates.IDLE;
    this.targetState = CharacterStates.IDLE;

    // Transition blending
    this.transitionDuration = options.transitionDuration || 0.45; // seconds
    this.transitionProgress = 1.0; // 0 = start of blend, 1 = blend complete
    this.blendWeight = 1.0;

    // Procedural look-at & tracking
    this.lookTarget = { x: 0, y: 1.6, z: 0 };
    this.currentLook = { x: 0, y: 1.6, z: 0 };
    this.lookDamping = options.lookDamping || 3.5;

    // Breathing & idle micro-variation offsets
    this.timeOffset = Math.random() * 100;
    this.breathingSpeed = options.breathingSpeed || 0.7 + Math.random() * 0.3;

    // Event hooks
    this.onStateChange = options.onStateChange || null;
  }

  // Transition smoothly to a new state
  setState(newState, customDuration = null) {
    if (!CharacterStates[newState] || newState === this.currentState) return;

    this.previousState = this.currentState;
    this.targetState = newState;
    this.transitionProgress = 0.0;
    this.transitionDuration = customDuration || this.transitionDuration;

    if (this.onStateChange) {
      this.onStateChange(this.previousState, this.targetState);
    }
  }

  // Smoothly update state blending each frame
  update(delta) {
    if (this.transitionProgress < 1.0) {
      this.transitionProgress += delta / Math.max(0.001, this.transitionDuration);
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.currentState = this.targetState;

        // Auto-return to IDLE if finishing a transient action like REACT or CELEBRATE
        if (this.currentState === CharacterStates.RETURN_TO_IDLE) {
          this.setState(CharacterStates.IDLE, 0.6);
        }
      }
    }

    // Smooth hermite cubic blend curve for organic transitions
    const t = this.transitionProgress;
    this.blendWeight = t * t * (3 - 2 * t);

    // Smooth look-at damping
    const lerpFactor = 1 - Math.exp(-this.lookDamping * delta);
    this.currentLook.x += (this.lookTarget.x - this.currentLook.x) * lerpFactor;
    this.currentLook.y += (this.lookTarget.y - this.currentLook.y) * lerpFactor;
    this.currentLook.z += (this.lookTarget.z - this.currentLook.z) * lerpFactor;
  }

  // Helper to trigger reaction to user proximity or door opening
  noticeUser(userPosition) {
    this.lookTarget = { ...userPosition };
    this.setState(CharacterStates.NOTICE, 0.35);
  }

  celebrate(duration = 2.5) {
    this.setState(CharacterStates.CELEBRATE, 0.3);
    setTimeout(() => {
      this.setState(CharacterStates.RETURN_TO_IDLE, 0.8);
    }, duration * 1000);
  }

  getStateInfo() {
    return {
      current: this.currentState,
      previous: this.previousState,
      weight: this.blendWeight,
      lookAt: this.currentLook,
    };
  }
}
