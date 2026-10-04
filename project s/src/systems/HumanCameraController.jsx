import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { roomManager, Rooms } from './RoomNavigationManager.js';
import { worldEventBus } from './WorldEventBus.js';

// Pre-allocated reusable vectors for performance and zero-allocation per frame
const _moveVector = new THREE.Vector3();
const _forwardVector = new THREE.Vector3();
const _rightVector = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _forwardDir = new THREE.Vector3();
const BASE_EYE_HEIGHT = 1.22;
const CAKE_EYE_HEIGHT = 1.42;
const MEMORY_GALLERY_EYE_HEIGHT = 1.62;

export function HumanCameraController({
  initialPosition = [0, BASE_EYE_HEIGHT, 5.25],
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    window.__setPlayerPos = (x, y, z) => {
      posRef.current.set(x, y, z);
      camera.position.set(x, y, z);
    };
    window.__setPlayerLook = (yaw, pitch) => {
      yawRef.current = yaw;
      targetYawRef.current = yaw;
      if (pitch !== undefined) {
        pitchRef.current = pitch;
        targetPitchRef.current = pitch;
      }
    };
    window.__playerPos = posRef;
    window.__yawRef = yawRef;
    window.__pitchRef = pitchRef;
  }, [camera]);

  // Position & Velocity
  const posRef = useRef(new THREE.Vector3(...initialPosition));
  const velRef = useRef(new THREE.Vector3(0, 0, 0));

  // Look angles (yaw = horizontal 360, pitch = vertical clamped)
  // Slightly downward (-0.06 rad) for an immersive eye view through the doorway
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.06);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(-0.06);

  // Drag interaction tracking with momentum
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  // Passive parallax offset (subtle natural sway)
  const parallaxRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Keyboard navigation state
  const keysRef = useRef({
    forward: false,
    backward: false,
    strafeLeft: false,
    strafeRight: false,
    turnLeft: false,
    turnRight: false,
  });

  // Human footfall & head-bob state
  const walkPhaseRef = useRef(0);
  const headBobWeightRef = useRef(0);

  // Throttled event emission refs (prevents React render saturation)
  const lastEmitTimeRef = useRef(0);
  const lastEmitPosRef = useRef(new THREE.Vector3(999, 999, 999));

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handlePointerDown = (e) => {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      startX = e.clientX;
      startY = e.clientY;
      startTime = performance.now();
    };

    const handlePointerMove = (e) => {
      // Passive parallax tracking
      const px = (e.clientX / window.innerWidth) * 2 - 1;
      const py = -(e.clientY / window.innerHeight) * 2 + 1;
      parallaxRef.current.targetX = px;
      parallaxRef.current.targetY = py;

      if (!isDraggingRef.current) return;

      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      // Pure, responsive, game-grade sensitivity (natural, silky, immediate feel)
      const lookSensitivity = 0.0020;
      targetYawRef.current -= dx * lookSensitivity;
      // Inverted correctly: dragging down (dy > 0) pulls view down, dragging up (dy < 0) pulls view up
      targetPitchRef.current = THREE.MathUtils.clamp(
        targetPitchRef.current - dy * lookSensitivity,
        -0.55, // Look down at floor, welcome mat, runner, and petals comfortably
        0.48   // Look up at sign, arch, chandelier, and ceiling comfortably
      );
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    // Wheel navigation (smooth, slow, game-like forward glide)
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 60) * 0.0022;

      _forwardDir.set(
        -Math.sin(yawRef.current),
        0,
        -Math.cos(yawRef.current)
      ).normalize();

      velRef.current.addScaledVector(_forwardDir, -delta * 8.0);
    };

    // Keyboard navigation (WASD / Arrows / QE) - supports both e.code and e.key
    const handleKeyDown = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') {
        keysRef.current.forward = true;
      }
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') {
        keysRef.current.backward = true;
      }
      if (code === 'KeyA' || key === 'a') {
        keysRef.current.strafeLeft = true;
      }
      if (code === 'KeyD' || key === 'd') {
        keysRef.current.strafeRight = true;
      }
      if (code === 'ArrowLeft' || code === 'KeyQ' || key === 'arrowleft' || key === 'q') {
        keysRef.current.turnLeft = true;
      }
      if (code === 'ArrowRight' || code === 'KeyE' || key === 'arrowright' || key === 'e') {
        keysRef.current.turnRight = true;
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') {
        keysRef.current.forward = false;
      }
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') {
        keysRef.current.backward = false;
      }
      if (code === 'KeyA' || key === 'a') {
        keysRef.current.strafeLeft = false;
      }
      if (code === 'KeyD' || key === 'd') {
        keysRef.current.strafeRight = false;
      }
      if (code === 'ArrowLeft' || code === 'KeyQ' || key === 'arrowleft' || key === 'q') {
        keysRef.current.turnLeft = false;
      }
      if (code === 'ArrowRight' || code === 'KeyE' || key === 'arrowright' || key === 'e') {
        keysRef.current.turnRight = false;
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // GSAP candle micro-reaction: player instinctively glances up when candles light
    const unsubCandles = worldEventBus.on('CANDLES_LIT', () => {
      const proxy = { pitch: targetPitchRef.current };
      const originalPitch = targetPitchRef.current;
      gsap.to(proxy, {
        pitch: originalPitch + 0.10,
        duration: 0.22,
        ease: 'power2.out',
        onUpdate: () => { targetPitchRef.current = proxy.pitch; },
        onComplete: () => {
          gsap.to(proxy, {
            pitch: originalPitch,
            duration: 0.55,
            ease: 'power2.inOut',
            onUpdate: () => { targetPitchRef.current = proxy.pitch; },
          });
        },
      });
    });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (unsubCandles) unsubCandles();
    };
  }, [gl]);


  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // 1. Keyboard rotation (Turn Left / Turn Right via Arrow keys or Q/E)
    const turnSpeed = 1.35; // Cinematic, smooth turn speed (rad/s)
    if (keysRef.current.turnLeft) targetYawRef.current += turnSpeed * dt;
    if (keysRef.current.turnRight) targetYawRef.current -= turnSpeed * dt;

    // Silky, consistent exponential damping for camera rotation
    // Clamping the look delta step to 1/60s (0.0167s) prevents sudden angular lurching during frame spikes
    // while perfectly preserving the 0.0020 sensitivity, responsiveness, and natural feel
    const lookDt = Math.min(delta, 1 / 60);
    const lookDamping = 1 - Math.exp(-32.0 * lookDt);
    yawRef.current = THREE.MathUtils.lerp(yawRef.current, targetYawRef.current, lookDamping);
    pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, targetPitchRef.current, lookDamping);

    // 2. Keyboard & Input Acceleration (Smooth, realistic walking momentum without sluggishness)
    _moveVector.set(0, 0, 0);
    _forwardVector.set(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current)).normalize();
    _rightVector.set(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current)).normalize();

    if (keysRef.current.forward) _moveVector.add(_forwardVector);
    if (keysRef.current.backward) _moveVector.sub(_forwardVector);
    if (keysRef.current.strafeRight) _moveVector.add(_rightVector);
    if (keysRef.current.strafeLeft) _moveVector.sub(_rightVector);

    const isMoving = _moveVector.lengthSq() > 0;
    const walkSpeed = 2.4; // Comfortable, realistic human walking pace (m/s)

    if (isMoving) {
      _moveVector.normalize();
      const targetVelX = _moveVector.x * walkSpeed;
      const targetVelZ = _moveVector.z * walkSpeed;
      const accelFactor = 1 - Math.exp(-14.0 * dt);
      velRef.current.x = THREE.MathUtils.lerp(velRef.current.x, targetVelX, accelFactor);
      velRef.current.z = THREE.MathUtils.lerp(velRef.current.z, targetVelZ, accelFactor);
    } else {
      // Natural ground friction deceleration
      const frictionFactor = Math.exp(-14.0 * dt);
      velRef.current.x *= frictionFactor;
      velRef.current.z *= frictionFactor;
    }

    // Apply velocity to position
    posRef.current.x += velRef.current.x * dt;
    posRef.current.z += velRef.current.z * dt;

    // 3. Continuous Physical World Boundaries with Multi-Room Corridors & Seamless Doorways
    // Main ballroom: X in [-5.8, 5.8], Z in [-12.5, 0.8]
    // Foyer: X in [-1.65, 1.65], Z in [0.8, 5.25]
    // Doorway 1 (West Door to VIP Gift Lounge): Door at [-6.92, -4.5]. Doorway opening Z in [-5.3, -3.7].
    //   Allows X down to -12.2 and Z in [-6.8, -2.2] inside Gift Lounge.
    // Doorway 2 (East Door to Disco Dance Club): Door at [6.92, -4.5]. Doorway opening Z in [-5.3, -3.7].
    //   Allows X up to 12.2 and Z in [-6.8, -2.2] inside Dance Club.
    // Doorway 3 (North Door to Memory Gallery): Door at [-5.2, -13.42].
    //   The gallery spans X [-10.6, 0.2] and Z [-31.8, -13.6].

    let clampedX = posRef.current.x;
    let clampedZ = posRef.current.z;

    // Check which sub-zone player is in:
    const inWestCorridor = (clampedX <= -5.5 && clampedZ >= -5.4 && clampedZ <= -3.6);
    const inWestRoom = (clampedX < -6.8 && clampedZ >= -6.8 && clampedZ <= -2.2);

    const inEastCorridor = (clampedX >= 5.5 && clampedZ >= -5.4 && clampedZ <= -3.6);
    const inEastRoom = (clampedX > 6.8 && clampedZ >= -6.8 && clampedZ <= -2.2);

    const inNorthCorridor = (clampedZ <= -12.2 && clampedX >= -5.9 && clampedX <= -4.5);
    const inNorthStudio = (clampedZ < -13.3 && clampedX >= -10.4 && clampedX <= 0.0);

    if (inWestRoom) {
      // Confined inside VIP Gift Lounge
      clampedX = THREE.MathUtils.clamp(clampedX, -12.2, -5.5);
      clampedZ = THREE.MathUtils.clamp(clampedZ, -6.6, -2.4);
    } else if (inWestCorridor) {
      // Transition corridor through West Doorway
      clampedX = THREE.MathUtils.clamp(clampedX, -12.2, 5.8);
      clampedZ = THREE.MathUtils.clamp(clampedZ, -5.2, -3.8);
    } else if (inEastRoom) {
      // Confined inside Disco & Dance Party Club
      clampedX = THREE.MathUtils.clamp(clampedX, 5.5, 12.2);
      clampedZ = THREE.MathUtils.clamp(clampedZ, -6.6, -2.4);
    } else if (inEastCorridor) {
      // Transition corridor through East Doorway
      clampedX = THREE.MathUtils.clamp(clampedX, -5.8, 12.2);
      clampedZ = THREE.MathUtils.clamp(clampedZ, -5.2, -3.8);
    } else if (inNorthStudio) {
      // Funnel the final stretch toward the centered doorway so the gallery exit is reachable from either side.
      clampedZ = THREE.MathUtils.clamp(clampedZ, -31.5, -13.0);
      const exitApproach = THREE.MathUtils.smoothstep(clampedZ, -16.5, -13.75);
      const availableHalfWidth = THREE.MathUtils.lerp(5.1, 0.48, exitApproach);
      clampedX = THREE.MathUtils.clamp(
        clampedX,
        -5.2 - availableHalfWidth,
        -5.2 + availableHalfWidth
      );
    } else if (inNorthCorridor) {
      // Transition corridor through North Doorway
      clampedZ = THREE.MathUtils.clamp(clampedZ, -22.4, 0.8);
      clampedX = THREE.MathUtils.clamp(clampedX, -5.68, -4.72);
    } else {
      // Ballroom & Foyer Standard Envelopes
      clampedZ = THREE.MathUtils.clamp(clampedZ, -12.5, 5.25);
      let maxLateralX = 1.65;
      if (clampedZ > 0.8) {
        maxLateralX = 1.65;
      } else if (clampedZ >= -0.8 && clampedZ <= 0.8) {
        const thresholdFactor = Math.abs(clampedZ) / 0.8;
        maxLateralX = THREE.MathUtils.lerp(0.82, 1.65, thresholdFactor);
      } else {
        maxLateralX = 5.8;
      }
      clampedX = THREE.MathUtils.clamp(clampedX, -maxLateralX, maxLateralX);
    }

    posRef.current.x = clampedX;
    posRef.current.z = clampedZ;

    // 4. Smooth Rounded-Box Collision around Banquet Table at [0, 0, -8.0]
    // Table dimensions: width 3.4m (halfWidth 1.70m), depth 1.3m (halfDepth 0.65m)
    // Seamless sliding physics around corners to the backwall cutting side (z ≈ -8.8 to -9.5)
    const tableX = 0;
    const tableZ = -8.0;
    const boxHalfW = 1.70;
    const boxHalfD = 0.65;
    const playerRadius = 0.22;

    const tableClampedX = THREE.MathUtils.clamp(posRef.current.x - tableX, -boxHalfW, boxHalfW);
    const tableClampedZ = THREE.MathUtils.clamp(posRef.current.z - tableZ, -boxHalfD, boxHalfD);
    const diffX = (posRef.current.x - tableX) - tableClampedX;
    const diffZ = (posRef.current.z - tableZ) - tableClampedZ;
    const distSq = diffX * diffX + diffZ * diffZ;

    if (distSq < playerRadius * playerRadius) {
      const dist = Math.sqrt(distSq);
      if (dist > 0.0001) {
        const nx = diffX / dist;
        const nz = diffZ / dist;
        const push = playerRadius - dist;
        posRef.current.x += nx * push;
        posRef.current.z += nz * push;

        // Project velocity onto tangent plane to slide smoothly without sticking
        const normalDotVel = velRef.current.x * nx + velRef.current.z * nz;
        if (normalDotVel < 0) {
          velRef.current.x -= normalDotVel * nx;
          velRef.current.z -= normalDotVel * nz;
        }
      } else {
        const overlapX = (boxHalfW + playerRadius) - Math.abs(posRef.current.x - tableX);
        const overlapZ = (boxHalfD + playerRadius) - Math.abs(posRef.current.z - tableZ);
        if (overlapX < overlapZ) {
          const signX = (posRef.current.x - tableX) >= 0 ? 1 : -1;
          posRef.current.x = tableX + signX * (boxHalfW + playerRadius);
          if (velRef.current.x * signX < 0) velRef.current.x = 0;
        } else {
          const signZ = (posRef.current.z - tableZ) >= 0 ? 1 : -1;
          posRef.current.z = tableZ + signZ * (boxHalfD + playerRadius);
          if (velRef.current.z * signZ < 0) velRef.current.z = 0;
        }
      }
    }

    // 5. Grounded Human Eye Height with Dual-Harmonic Footfall Bobbing
    const speed = Math.hypot(velRef.current.x, velRef.current.z);
    const speedRatio = Math.min(speed / walkSpeed, 1.0);

    // Smooth head-bob ramp
    headBobWeightRef.current = THREE.MathUtils.lerp(
      headBobWeightRef.current,
      speedRatio,
      1 - Math.exp(-8.0 * delta)
    );

    walkPhaseRef.current += speed * delta * 4.2; // ~2 steps per meter
    const verticalBob = Math.sin(walkPhaseRef.current * 2) * 0.015 * headBobWeightRef.current;
    const lateralSway = Math.cos(walkPhaseRef.current) * 0.007 * headBobWeightRef.current;
    const idleBreath = Math.sin(state.clock.getElapsedTime() * 0.65) * 0.008 * (1.0 - headBobWeightRef.current);

    const cakeDistance = Math.hypot(posRef.current.x, posRef.current.z + 8.0);
    const cakeHeightBlend = roomManager.getCurrentRoom() === Rooms.MAIN_BIRTHDAY_ROOM
      ? 1 - THREE.MathUtils.smoothstep(cakeDistance, 3.0, 5.0)
      : 0;
    const galleryHeightBlend = posRef.current.z < -13.3
      && posRef.current.x >= -10.4
      && posRef.current.x <= 0.0
      ? 1
      : 0;
    const cakeAdjustedHeight = THREE.MathUtils.lerp(BASE_EYE_HEIGHT, CAKE_EYE_HEIGHT, cakeHeightBlend);
    const eyeHeight = THREE.MathUtils.lerp(cakeAdjustedHeight, MEMORY_GALLERY_EYE_HEIGHT, galleryHeightBlend);
    posRef.current.y = eyeHeight + verticalBob + idleBreath;

    // 6. Update Three.js Camera Transform
    camera.position.x = posRef.current.x + lateralSway;
    camera.position.y = posRef.current.y;
    camera.position.z = posRef.current.z;

    // Direct, true, lag-free look direction from yaw and pitch (zero allocations)
    _lookTarget.set(
      camera.position.x - Math.sin(yawRef.current) * Math.cos(pitchRef.current),
      camera.position.y + Math.sin(pitchRef.current),
      camera.position.z - Math.cos(yawRef.current) * Math.cos(pitchRef.current)
    );
    camera.lookAt(_lookTarget);

    // 7. Notify Room Navigation Manager & HUD of continuous spatial tracking (throttled)
    roomManager.updateCameraPosition(posRef.current);
    const now = performance.now();
    if (now - lastEmitTimeRef.current > 150) {
      if (posRef.current.distanceToSquared(lastEmitPosRef.current) > 0.015) {
        lastEmitTimeRef.current = now;
        lastEmitPosRef.current.copy(posRef.current);
        worldEventBus.emit('CAMERA_POSITION', {
          x: posRef.current.x,
          y: posRef.current.y,
          z: posRef.current.z,
        });
      }
    }
  });

  return null;
}
