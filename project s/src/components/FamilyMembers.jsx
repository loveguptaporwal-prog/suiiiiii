import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { worldEventBus } from '../systems/WorldEventBus.js';
import { soundEngine } from '../systems/SoundSystem.js';

// --------------------------------------------------------------------------
// Clean, Joyful Anime/Stylized Face Component
// Features big sparkling anime eyes, bright happy smile, teeth, tongue & rosy cheeks
// --------------------------------------------------------------------------
function StylizedFace({
  skinMat,
  hasBeard = false,
  hasMustache = false,
  hasBindi = false,
  hasEarring = false,
  hairColor = '#24140D',
  isMother = false,
  isFather = false,
  isLittleBoy = false,
  mouthState = 'smile', // 'smile', 'open_happy', 'eat'
}) {
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#160E12' }), []);
  const sparkleMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), []);
  const mouthCavityMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A0F2B',
    roughness: 0.35,
  }), []);
  const tongueMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF6B8B',
    roughness: 0.35,
  }), []);
  const teethMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFFFFA' }), []);

  // Beard material (groomed warm-chestnut charcoal)
  const beardMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#382218',
    roughness: 0.88,
    metalness: 0.05,
  }), []);

  const bindiMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C62828',
    roughness: 0.3,
  }), []);

  const goldJewelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.92,
    roughness: 0.16,
  }), []);

  const earringMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1C1917',
    roughness: 0.4,
  }), []);

  const blushMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF5277',
    roughness: 0.6,
    transparent: true,
    opacity: 0.65,
  }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. SPARKLING BIG HAPPY EYES */}
      {[-0.080, 0.080].map((x, i) => (
        <group key={`eye-${i}`} position={[x, 0.025, 0.224]}>
          <mesh material={eyeMat} scale={[1, isFather ? 1.05 : 1.25, 0.5]}>
            <sphereGeometry args={[0.032, 20, 20]} />
          </mesh>

          {/* Primary High-Gloss Star Sparkle */}
          <mesh position={[0.010, 0.014, 0.018]} material={sparkleMat}>
            <sphereGeometry args={[0.010, 10, 10]} />
          </mesh>
          {/* Secondary Tiny Sparkle */}
          <mesh position={[-0.008, -0.008, 0.016]} material={sparkleMat}>
            <sphereGeometry args={[0.005, 8, 8]} />
          </mesh>

          {/* Eyelash for Mother */}
          {isMother && (
            <mesh
              position={[i === 0 ? -0.026 : 0.026, 0.032, 0.012]}
              rotation={[0, 0, i === 0 ? 0.45 : -0.45]}
              material={eyeMat}
            >
              <boxGeometry args={[0.020, 0.004, 0.004]} />
            </mesh>
          )}

          {/* Happy, friendly arched eyebrows (lifted in joyful celebration) */}
          <mesh
            position={[0, isFather ? 0.054 : 0.050, 0.006]}
            rotation={[0, 0, i === 0 ? -0.10 : 0.10]}
            material={beardMat}
          >
            <capsuleGeometry args={[isFather ? 0.006 : 0.0045, isFather ? 0.052 : 0.044, 6, 8]} rotation={[0, 0, Math.PI / 2]} />
          </mesh>
        </group>
      ))}

      {/* 2. ROSY BLUSHING CHEEKS (Cute, joyous party glow) */}
      {[-0.115, 0.115].map((cx, i) => (
        <mesh key={`blush-${i}`} position={[cx, -0.024, 0.222]} scale={[1.35, 0.75, 0.2]}>
          <sphereGeometry args={[0.026, 14, 14]} />
          <primitive object={blushMat} attach="material" />
        </mesh>
      ))}

      {/* 3. NOSE */}
      <mesh position={[0, -0.012, 0.246]} material={skinMat}>
        <sphereGeometry args={[isFather ? 0.024 : 0.020, 14, 14]} scale={[1, 0.9, 1.2]} />
      </mesh>

      {/* 4. BINDI FOR MOTHER */}
      {hasBindi && (
        <mesh position={[0, 0.075, 0.234]} material={bindiMat}>
          <sphereGeometry args={[0.012, 14, 14]} scale={[1, 1, 0.35]} />
        </mesh>
      )}

      {/* 5. CHEERFUL UPWARD-CURVING SMILE */}
      <group position={[0, -0.076, 0.218]}>
        {mouthState === 'open_happy' || mouthState === 'eat' ? (
          <>
            {/* Open Laughing Mouth */}
            <mesh material={mouthCavityMat} scale={[1.4, 1.1, 0.55]}>
              <sphereGeometry args={[0.038, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} rotation={[0, 0, 0]} />
            </mesh>
            {/* White upper smile teeth line */}
            <mesh position={[0, 0.018, 0.008]} material={teethMat} scale={[1.2, 0.45, 0.5]}>
              <boxGeometry args={[0.044, 0.012, 0.012]} />
            </mesh>
            {/* Happy pink tongue */}
            <mesh position={[0, -0.014, 0.012]} material={tongueMat} scale={[1.0, 0.65, 0.7]}>
              <sphereGeometry args={[0.022, 14, 14]} />
            </mesh>
          </>
        ) : (
          <group scale={[1.2, 1.0, 1]}>
            {/* Upward-curving crescent smile line */}
            <mesh position={[0, 0.008, 0.006]} rotation={[0, 0, -Math.PI * 0.90]}>
              <torusGeometry args={[0.038, 0.005, 8, 24, Math.PI * 0.80]} />
              <meshStandardMaterial color="#8A102A" roughness={0.3} />
            </mesh>
            {/* Pearly white smiling teeth line */}
            <mesh position={[0, 0.010, 0.004]} material={teethMat}>
              <boxGeometry args={[0.034, 0.008, 0.008]} />
            </mesh>
            {/* Soft pink mouth interior */}
            <mesh position={[0, 0.002, 0.002]} material={mouthCavityMat} scale={[1.1, 0.7, 0.35]}>
              <sphereGeometry args={[0.030, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </group>
        )}
      </group>

      {/* 6. EARS & EARRINGS */}
      {[-0.242, 0.242].map((ex, i) => (
        <group key={`ear-${i}`} position={[ex, 0, 0]} rotation={[0, i === 0 ? -0.2 : 0.2, 0]}>
          <mesh material={skinMat}>
            <sphereGeometry args={[0.038, 12, 12]} scale={[0.4, 1.2, 0.8]} />
          </mesh>
          {isMother && (
            <mesh position={[i === 0 ? -0.014 : 0.014, -0.032, 0]} material={goldJewelMat}>
              <sphereGeometry args={[0.010, 8, 8]} />
            </mesh>
          )}
          {hasEarring && (
            <mesh position={[i === 0 ? -0.016 : 0.016, -0.022, 0.008]} material={earringMat}>
              <cylinderGeometry args={[0.007, 0.007, 0.004, 12]} rotation={[0, 0, Math.PI / 2]} />
            </mesh>
          )}
        </group>
      ))}

      {/* 7. FATHER'S TRIMMED BEARD & MUSTACHE */}
      {hasBeard && (
        <group position={[0, -0.065, 0.16]}>
          <mesh position={[0, -0.052, 0.04]} material={beardMat}>
            <cylinderGeometry args={[0.168, 0.148, 0.08, 28]} />
          </mesh>
          <mesh position={[0, -0.086, 0.076]} material={beardMat}>
            <sphereGeometry args={[0.058, 18, 18]} scale={[1.15, 0.75, 1.05]} />
          </mesh>
          {[-0.188, 0.188].map((sx, i) => (
            <group key={`beard-sb-${i}`} position={[sx, 0.035, -0.005]}>
              <mesh material={beardMat}>
                <boxGeometry args={[0.026, 0.115, 0.055]} />
              </mesh>
              <mesh position={[i === 0 ? 0.01 : -0.01, -0.03, 0.025]} rotation={[0, 0, i === 0 ? 0.35 : -0.35]} material={beardMat}>
                <boxGeometry args={[0.018, 0.08, 0.02]} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {hasMustache && (
        <group position={[0, -0.048, 0.244]}>
          <mesh position={[-0.034, 0.003, 0]} rotation={[0, 0, -0.22]} material={beardMat}>
            <capsuleGeometry args={[0.011, 0.044, 6, 10]} rotation={[0, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0.034, 0.003, 0]} rotation={[0, 0, 0.22]} material={beardMat}>
            <capsuleGeometry args={[0.011, 0.044, 6, 10]} rotation={[0, 0, Math.PI / 2]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// 3D Cake Plate held by character when served a slice
// --------------------------------------------------------------------------
function HeldCakePlate({ position = [0, 0.22, 0.22], scale = 0.85 }) {
  const plateMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFDFC', roughness: 0.18 }), []);
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F4CF7F', metalness: 0.92, roughness: 0.16 }), []);
  const redVelvetMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8A1234', roughness: 0.68 }), []);
  const creamMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFBF5', roughness: 0.45 }), []);

  return (
    <group position={position} scale={scale} rotation={[-0.1, 0, 0]}>
      <mesh material={plateMat} receiveShadow>
        <cylinderGeometry args={[0.11, 0.08, 0.014, 20]} />
      </mesh>
      <mesh position={[0, 0.008, 0]} material={goldMat}>
        <torusGeometry args={[0.108, 0.003, 6, 20]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
      <group position={[0, 0.01, 0]} rotation={[0, 0.25, 0]}>
        <mesh material={redVelvetMat}>
          <cylinderGeometry args={[0.09, 0.09, 0.055, 10, 1, false, 0, 0.75]} />
        </mesh>
        <mesh position={[0, 0.032, 0]} material={creamMat}>
          <cylinderGeometry args={[0.09, 0.09, 0.01, 10, 1, false, 0, 0.75]} />
        </mesh>
      </group>
      <mesh position={[0.08, 0.014, 0.02]} rotation={[0, 0.3, 0]} material={goldMat}>
        <boxGeometry args={[0.012, 0.003, 0.09]} />
      </mesh>
      <pointLight color="#FFE082" intensity={0.4} distance={0.6} />
    </group>
  );
}

// Celebration Floating Sparkles/Hearts above Served Character
function CharacterJoyHearts({ active }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      child.position.y = 0.55 + Math.sin(t * 2.5 + i * 1.5) * 0.08 + (i * 0.06);
      child.rotation.y = t * 1.5 + i;
    });
  });
  if (!active) return null;
  return (
    <group ref={groupRef} position={[0, 0.8, 0]}>
      {[-0.14, 0, 0.14].map((hx, i) => (
        <mesh key={`heart-${i}`} position={[hx, 0.55 + i * 0.06, 0]}>
          <octahedronGeometry args={[0.024, 0]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#FF4081' : '#FFD700'} />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// 1. MOTHER CHARACTER (In Royal Indian Saree, Bindi, Gold Jewels)
// --------------------------------------------------------------------------
function MotherCharacter({
  position = [-1.70, 0, -6.15],
  baseRotation = [0, 2.70, 0],
  scale = 0.98,
  ceremonyStage,
  servedTo,
  onTargetClick,
  candlesLooking = false,
}) {
  const rootRef = useRef();
  const spineRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FAD8C3', roughness: 0.60 }), []);
  const sareeRubyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#A81334', roughness: 0.45 }), []);
  const sareeGoldBorderMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F4CF7F', metalness: 0.88, roughness: 0.22 }), []);
  const blouseTealMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#00695C', roughness: 0.45 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1E120B', roughness: 0.50 }), []);

  const isServed = Array.isArray(servedTo) ? servedTo.includes('mom') : servedTo === 'mom';

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const cam = state.camera.position;

    if (headRef.current) {
      let targetYaw = 0;
      if (isServed) {
        targetYaw = 0.15;
        headRef.current.rotation.x = 0.32;
      } else if (candlesLooking) {
        // Briefly look toward cake candles when they light up
        const cakeDx = 0 - position[0];
        const cakeDz = -8.0 - position[2];
        targetYaw = Math.atan2(cakeDx, cakeDz) - baseRotation[1];
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.14, 1 - Math.exp(-4 * dt));
      } else {
        const dx = cam.x - position[0];
        const dz = cam.z - position[2];
        targetYaw = Math.atan2(dx, dz) - baseRotation[1];
        headRef.current.rotation.x = Math.sin(t * 1.8) * 0.025;
      }
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        THREE.MathUtils.clamp(targetYaw, -0.85, 0.85),
        1 - Math.exp(-6 * dt)
      );
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (isServed) {
        leftArmRef.current.rotation.x = -0.75 + Math.sin(t * 2.8) * 0.08;
        rightArmRef.current.rotation.x = -0.90 + Math.sin(t * 3.5) * 0.12;
      } else if (ceremonyStage === 'cut' || ceremonyStage === 'celebrating') {
        leftArmRef.current.rotation.x = -0.60 + Math.sin(t * 5.5) * 0.20;
        rightArmRef.current.rotation.x = -0.60 + Math.sin(t * 5.5 + 0.2) * 0.20;
      } else {
        leftArmRef.current.rotation.x = -0.22 + Math.sin(t * 1.6) * 0.03;
        rightArmRef.current.rotation.x = -0.24 + Math.cos(t * 1.6) * 0.03;
      }
    }

    if (spineRef.current) {
      spineRef.current.position.y = 0.62 + Math.sin(t * 2.0) * 0.007;
    }
  });

  return (
    <group
      ref={rootRef}
      position={position}
      rotation={baseRotation}
      scale={scale}
      onClick={() => onTargetClick('mom')}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Saree Pleats & Skirt */}
      <mesh position={[0, 0.38, 0]} material={sareeRubyMat} castShadow>
        <cylinderGeometry args={[0.22, 0.32, 0.76, 24]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={sareeGoldBorderMat}>
        <cylinderGeometry args={[0.324, 0.324, 0.04, 24]} />
      </mesh>

      {/* Torso & Saree Pallu Drape */}
      <group ref={spineRef} position={[0, 0.62, 0]}>
        <mesh position={[0, 0.24, 0]} material={blouseTealMat} castShadow>
          <cylinderGeometry args={[0.18, 0.21, 0.36, 18]} />
        </mesh>
        <mesh position={[0.04, 0.26, 0.08]} rotation={[0, 0, -0.32]} material={sareeRubyMat}>
          <boxGeometry args={[0.12, 0.40, 0.18]} />
        </mesh>
        <mesh position={[0.04, 0.26, 0.18]} rotation={[0, 0, -0.32]} material={sareeGoldBorderMat}>
          <boxGeometry args={[0.015, 0.40, 0.02]} />
        </mesh>

        {/* Arms */}
        <group ref={leftArmRef} position={[-0.24, 0.38, 0]}>
          <mesh position={[0, -0.16, 0.04]} rotation={[0.2, 0, 0]} material={skinMat}>
            <cylinderGeometry args={[0.04, 0.035, 0.28, 12]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.24, 0.38, 0]}>
          <mesh position={[0, -0.16, 0.04]} rotation={[0.2, 0, 0]} material={skinMat}>
            <cylinderGeometry args={[0.04, 0.035, 0.28, 12]} />
          </mesh>
        </group>

        {isServed && <HeldCakePlate position={[0, 0.22, 0.24]} />}
        {isServed && <CharacterJoyHearts active />}

        {/* Head with Saree Pallu Hood / Bun */}
        <group ref={headRef} position={[0, 0.54, 0]}>
          <mesh material={skinMat} castShadow scale={[1.02, 1.0, 1.02]}>
            <sphereGeometry args={[0.24, 28, 28]} />
          </mesh>
          <mesh position={[0, 0.08, -0.02]} material={hairMat} scale={[1.08, 1.08, 1.08]}>
            <sphereGeometry args={[0.24, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          </mesh>
          <mesh position={[0, 0.06, -0.22]} material={hairMat}>
            <sphereGeometry args={[0.12, 16, 16]} />
          </mesh>
          <StylizedFace
            skinMat={skinMat}
            isMother
            hasBindi
            hasEarring
            hairColor="#1E120B"
            mouthState={isServed ? 'eat' : ceremonyStage === 'cut' ? 'open_happy' : 'smile'}
          />
        </group>
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// 2. CUTE LITTLE BOY CHARACTER (Playful, smiling little brother)
// --------------------------------------------------------------------------
function LittleBoyCharacter({
  position = [-0.60, 0, -5.95],
  baseRotation = [0, 3.10, 0],
  scale = 0.74,
  ceremonyStage,
  servedTo,
  onTargetClick,
  candlesLooking = false,
}) {
  const rootRef = useRef();
  const spineRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFE6D6', roughness: 0.60 }), []);
  const shirtTurquoiseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#00ACC1', roughness: 0.45 }), []);
  const shortsNavyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1A237E', roughness: 0.50 }), []);
  const shoesWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.35 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2B170E', roughness: 0.50 }), []);

  const isServed = Array.isArray(servedTo) ? servedTo.includes('little_boy') : servedTo === 'little_boy';

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const cam = state.camera.position;

    // Cheerful playful little boy head motions
    if (headRef.current) {
      let targetYaw = 0;
      if (isServed) {
        targetYaw = 0.15;
        headRef.current.rotation.x = 0.32;
      } else if (candlesLooking) {
        const cakeDx = 0 - position[0];
        const cakeDz = -8.0 - position[2];
        targetYaw = Math.atan2(cakeDx, cakeDz) - baseRotation[1];
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.18, 1 - Math.exp(-4 * dt));
      } else {
        const dx = cam.x - position[0];
        const dz = cam.z - position[2];
        targetYaw = Math.atan2(dx, dz) - baseRotation[1];
        headRef.current.rotation.x = Math.sin(t * 2.4) * 0.04;
      }
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        THREE.MathUtils.clamp(targetYaw, -0.9, 0.9),
        1 - Math.exp(-6 * dt)
      );
    }

    // Cheerful clapping and jumping bounce
    if (leftArmRef.current && rightArmRef.current) {
      if (isServed) {
        leftArmRef.current.rotation.x = -0.75 + Math.sin(t * 3.2) * 0.09;
        rightArmRef.current.rotation.x = -0.88 + Math.sin(t * 4.0) * 0.14;
      } else if (ceremonyStage === 'cut' || ceremonyStage === 'celebrating') {
        leftArmRef.current.rotation.x = -0.70 + Math.sin(t * 7.5) * 0.28;
        rightArmRef.current.rotation.x = -0.70 + Math.sin(t * 7.5 + 0.2) * 0.28;
      } else {
        leftArmRef.current.rotation.x = -0.28 + Math.sin(t * 2.0) * 0.05;
        rightArmRef.current.rotation.x = -0.28 + Math.cos(t * 2.0) * 0.05;
      }
    }

    if (spineRef.current) {
      // Little boy playful bounce
      spineRef.current.position.y = 0.52 + Math.sin(t * 3.0) * 0.012;
    }
  });

  return (
    <group
      ref={rootRef}
      position={position}
      rotation={baseRotation}
      scale={scale}
      onClick={() => onTargetClick('little_boy')}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Legs & Cute Sneakers */}
      {[-0.09, 0.09].map((lx, i) => (
        <group key={`lb-leg-${i}`} position={[lx, 0, 0]}>
          <mesh position={[0, 0.28, 0]} material={shortsNavyMat} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.36, 16]} />
          </mesh>
          <mesh position={[0, 0.12, 0]} material={skinMat}>
            <cylinderGeometry args={[0.038, 0.036, 0.18, 12]} />
          </mesh>
          <mesh position={[0, 0.035, 0.02]} material={shoesWhiteMat}>
            <boxGeometry args={[0.075, 0.055, 0.14]} />
          </mesh>
        </group>
      ))}

      {/* Torso */}
      <group ref={spineRef} position={[0, 0.52, 0]}>
        <mesh position={[0, 0.18, 0]} material={shirtTurquoiseMat} castShadow>
          <cylinderGeometry args={[0.16, 0.17, 0.34, 18]} />
        </mesh>
        {/* Collar */}
        <mesh position={[0, 0.35, 0.06]} rotation={[0.4, 0, 0]} material={shoesWhiteMat}>
          <boxGeometry args={[0.14, 0.025, 0.06]} />
        </mesh>

        {/* Arms */}
        <group ref={leftArmRef} position={[-0.20, 0.30, 0]}>
          <mesh position={[0, -0.14, 0.04]} rotation={[0.22, 0, 0]} material={skinMat}>
            <cylinderGeometry args={[0.036, 0.032, 0.22, 12]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.20, 0.30, 0]}>
          <mesh position={[0, -0.14, 0.04]} rotation={[0.22, 0, 0]} material={skinMat}>
            <cylinderGeometry args={[0.036, 0.032, 0.22, 12]} />
          </mesh>
        </group>

        {isServed && <HeldCakePlate position={[0, 0.18, 0.22]} scale={0.78} />}
        {isServed && <CharacterJoyHearts active />}

        {/* Cute Little Boy Head */}
        <group ref={headRef} position={[0, 0.46, 0]}>
          <mesh material={skinMat} castShadow scale={[1.05, 1.02, 1.05]}>
            <sphereGeometry args={[0.23, 26, 26]} />
          </mesh>
          {/* Hair with playful fringe */}
          <mesh position={[0, 0.07, -0.02]} material={hairMat} scale={[1.08, 1.08, 1.08]}>
            <sphereGeometry args={[0.23, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.60]} />
          </mesh>
          <mesh position={[0, 0.14, 0.12]} rotation={[0.3, 0, 0]} material={hairMat}>
            <coneGeometry args={[0.06, 0.10, 8]} />
          </mesh>
          <StylizedFace
            skinMat={skinMat}
            isLittleBoy
            hairColor="#2B170E"
            mouthState={isServed ? 'eat' : ceremonyStage === 'cut' ? 'open_happy' : 'smile'}
          />
        </group>
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// 3. BROTHER CHARACTER (Older Brother, energetic & stylish)
// --------------------------------------------------------------------------
function BrotherCharacter({
  position = [0.60, 0, -5.95],
  baseRotation = [0, -3.10, 0],
  scale = 0.96,
  ceremonyStage,
  servedTo,
  onTargetClick,
  candlesLooking = false,
}) {
  const rootRef = useRef();
  const spineRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FCE0CE', roughness: 0.62 }), []);
  const pantsMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#263238', roughness: 0.50 }), []);
  const shoesMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#37474F', roughness: 0.40 }), []);
  const shirtWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.55 }), []);
  const vestBlueMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1565C0', roughness: 0.42 }), []);
  const bowtieRedMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#D81B60', roughness: 0.40 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#24140D', roughness: 0.45 }), []);

  const isServed = Array.isArray(servedTo) ? servedTo.includes('brother') : servedTo === 'brother';

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const cam = state.camera.position;

    if (headRef.current) {
      let targetYaw = 0;
      if (isServed) {
        targetYaw = -0.15;
        headRef.current.rotation.x = 0.32;
      } else if (candlesLooking) {
        const cakeDx = 0 - position[0];
        const cakeDz = -8.0 - position[2];
        targetYaw = Math.atan2(cakeDx, cakeDz) - baseRotation[1];
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.14, 1 - Math.exp(-4 * dt));
      } else {
        const dx = cam.x - position[0];
        const dz = cam.z - position[2];
        targetYaw = Math.atan2(dx, dz) - baseRotation[1];
        headRef.current.rotation.x = Math.sin(t * 1.8) * 0.03;
      }
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        THREE.MathUtils.clamp(targetYaw, -0.9, 0.9),
        1 - Math.exp(-6 * dt)
      );
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (isServed) {
        leftArmRef.current.rotation.x = -0.75 + Math.sin(t * 3.0) * 0.08;
        rightArmRef.current.rotation.x = -0.90 + Math.sin(t * 3.8) * 0.12;
      } else if (ceremonyStage === 'cut' || ceremonyStage === 'celebrating') {
        leftArmRef.current.rotation.x = -0.62 + Math.sin(t * 6.0) * 0.22;
        rightArmRef.current.rotation.x = -0.62 + Math.sin(t * 6.0 + 0.2) * 0.22;
      } else {
        leftArmRef.current.rotation.x = -0.32 + Math.sin(t * 1.8) * 0.04;
        rightArmRef.current.rotation.x = -0.32 + Math.cos(t * 1.8) * 0.04;
      }
    }

    if (spineRef.current) {
      spineRef.current.position.y = 0.68 + Math.sin(t * 2.0) * 0.008;
    }
  });

  return (
    <group
      ref={rootRef}
      position={position}
      rotation={baseRotation}
      scale={scale}
      onClick={() => onTargetClick('brother')}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Legs & Shoes */}
      {[-0.10, 0.10].map((lx, i) => (
        <group key={`b-leg-${i}`} position={[lx, 0, 0]}>
          <mesh position={[0, 0.32, 0]} material={pantsMat} castShadow>
            <cylinderGeometry args={[0.055, 0.050, 0.64, 16]} />
          </mesh>
          <mesh position={[0, 0.04, 0.03]} material={shoesMat}>
            <boxGeometry args={[0.08, 0.065, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* Torso */}
      <group ref={spineRef} position={[0, 0.68, 0]}>
        <mesh position={[0, 0.18, 0]} material={shirtWhiteMat} castShadow>
          <cylinderGeometry args={[0.17, 0.18, 0.36, 18]} />
        </mesh>
        <mesh position={[0, 0.17, 0.01]} material={vestBlueMat}>
          <cylinderGeometry args={[0.176, 0.184, 0.34, 18]} />
        </mesh>
        <group position={[0, 0.34, 0.14]}>
          <mesh material={bowtieRedMat}>
            <sphereGeometry args={[0.014, 8, 8]} />
          </mesh>
          <mesh position={[-0.03, 0, 0]} rotation={[0, 0, 0.2]} material={bowtieRedMat}>
            <boxGeometry args={[0.04, 0.024, 0.015]} />
          </mesh>
          <mesh position={[0.03, 0, 0]} rotation={[0, 0, -0.2]} material={bowtieRedMat}>
            <boxGeometry args={[0.04, 0.024, 0.015]} />
          </mesh>
        </group>

        {/* Arms */}
        <group ref={leftArmRef} position={[-0.22, 0.32, 0]}>
          <mesh position={[0, -0.14, 0.05]} rotation={[0.25, 0, 0]} material={shirtWhiteMat}>
            <cylinderGeometry args={[0.040, 0.035, 0.24, 12]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.22, 0.32, 0]}>
          <mesh position={[0, -0.14, 0.05]} rotation={[0.25, 0, 0]} material={shirtWhiteMat}>
            <cylinderGeometry args={[0.040, 0.035, 0.24, 12]} />
          </mesh>
        </group>

        {isServed && <HeldCakePlate position={[0, 0.18, 0.24]} />}
        {isServed && <CharacterJoyHearts active />}

        {/* Head */}
        <group ref={headRef} position={[0, 0.48, 0]}>
          <mesh material={skinMat} castShadow scale={[1.02, 1.0, 1.02]}>
            <sphereGeometry args={[0.24, 28, 28]} />
          </mesh>
          <mesh position={[0, 0.07, -0.02]} material={hairMat} scale={[1.08, 1.08, 1.08]}>
            <sphereGeometry args={[0.24, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          </mesh>
          <StylizedFace
            skinMat={skinMat}
            hairColor="#24140D"
            mouthState={isServed ? 'eat' : ceremonyStage === 'cut' ? 'open_happy' : 'smile'}
          />
        </group>
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// 4. FATHER CHARACTER (Groomed beard, elegant half-up hair, smiling warmly)
// --------------------------------------------------------------------------
function FatherCharacter({
  position = [1.70, 0, -6.15],
  baseRotation = [0, -2.70, 0],
  scale = 1.05,
  ceremonyStage,
  servedTo,
  onTargetClick,
  candlesLooking = false,
}) {
  const rootRef = useRef();
  const spineRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E8C7B4', roughness: 0.64 }), []);
  const pantsMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1B1C1E', roughness: 0.45 }), []);
  const shoesMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111213', roughness: 0.35 }), []);
  const kurtaBurgundyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5B1422', roughness: 0.50 }), []);
  const goldTrimMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F4CF7F', metalness: 0.88, roughness: 0.22 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1E120B', roughness: 0.55 }), []);

  const isServed = Array.isArray(servedTo) ? servedTo.includes('dad') : servedTo === 'dad';

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const cam = state.camera.position;

    if (headRef.current) {
      let targetYaw = 0;
      if (isServed) {
        targetYaw = -0.15;
        headRef.current.rotation.x = 0.32;
      } else if (candlesLooking) {
        const cakeDx = 0 - position[0];
        const cakeDz = -8.0 - position[2];
        targetYaw = Math.atan2(cakeDx, cakeDz) - baseRotation[1];
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.12, 1 - Math.exp(-3 * dt));
      } else {
        const dx = cam.x - position[0];
        const dz = cam.z - position[2];
        targetYaw = Math.atan2(dx, dz) - baseRotation[1];
        headRef.current.rotation.x = Math.sin(t * 1.6) * 0.025;
      }
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        THREE.MathUtils.clamp(targetYaw, -0.85, 0.85),
        1 - Math.exp(-6 * dt)
      );
    }

    if (leftArmRef.current && rightArmRef.current) {
      if (isServed) {
        leftArmRef.current.rotation.x = -0.75 + Math.sin(t * 2.8) * 0.08;
        rightArmRef.current.rotation.x = -0.90 + Math.sin(t * 3.5) * 0.12;
      } else if (ceremonyStage === 'cut' || ceremonyStage === 'celebrating') {
        leftArmRef.current.rotation.x = -0.58 + Math.sin(t * 5.2) * 0.18;
        rightArmRef.current.rotation.x = -0.58 + Math.sin(t * 5.2 + 0.2) * 0.18;
      } else {
        leftArmRef.current.rotation.x = -0.22 + Math.sin(t * 1.5) * 0.03;
        rightArmRef.current.rotation.x = -0.22 + Math.cos(t * 1.5) * 0.03;
      }
    }

    if (spineRef.current) {
      spineRef.current.position.y = 0.72 + Math.sin(t * 1.8) * 0.007;
    }
  });

  return (
    <group
      ref={rootRef}
      position={position}
      rotation={baseRotation}
      scale={scale}
      onClick={() => onTargetClick('dad')}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Trousers & Leather Shoes */}
      {[-0.11, 0.11].map((lx, i) => (
        <group key={`d-leg-${i}`} position={[lx, 0, 0]}>
          <mesh position={[0, 0.35, 0]} material={pantsMat} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.70, 16]} />
          </mesh>
          <mesh position={[0, 0.045, 0.03]} material={shoesMat}>
            <boxGeometry args={[0.085, 0.07, 0.18]} />
          </mesh>
        </group>
      ))}

      {/* Torso & Kurta */}
      <group ref={spineRef} position={[0, 0.72, 0]}>
        <mesh position={[0, 0.22, 0]} material={kurtaBurgundyMat} castShadow>
          <cylinderGeometry args={[0.19, 0.21, 0.44, 20]} />
        </mesh>
        <mesh position={[0, 0.38, 0.09]} material={goldTrimMat}>
          <boxGeometry args={[0.04, 0.18, 0.015]} />
        </mesh>

        {/* Arms */}
        <group ref={leftArmRef} position={[-0.25, 0.36, 0]}>
          <mesh position={[0, -0.16, 0.05]} rotation={[0.22, 0, 0]} material={kurtaBurgundyMat}>
            <cylinderGeometry args={[0.045, 0.04, 0.28, 12]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.25, 0.36, 0]}>
          <mesh position={[0, -0.16, 0.05]} rotation={[0.22, 0, 0]} material={kurtaBurgundyMat}>
            <cylinderGeometry args={[0.045, 0.04, 0.28, 12]} />
          </mesh>
        </group>

        {isServed && <HeldCakePlate position={[0, 0.22, 0.26]} />}
        {isServed && <CharacterJoyHearts active />}

        {/* Head */}
        <group ref={headRef} position={[0, 0.54, 0]}>
          <mesh material={skinMat} castShadow scale={[1.02, 1.0, 1.02]}>
            <sphereGeometry args={[0.25, 28, 28]} />
          </mesh>
          <mesh position={[0, 0.08, -0.02]} material={hairMat} scale={[1.08, 1.08, 1.08]}>
            <sphereGeometry args={[0.25, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          </mesh>
          <mesh position={[0, 0.18, -0.18]} material={hairMat}>
            <sphereGeometry args={[0.08, 14, 14]} />
          </mesh>
          <StylizedFace
            skinMat={skinMat}
            isFather
            hasBeard
            hasMustache
            hasEarring
            hairColor="#1E120B"
            mouthState={isServed ? 'eat' : ceremonyStage === 'cut' ? 'open_happy' : 'smile'}
          />
        </group>
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// MAIN COMPONENT: FamilyMembers (Exactly 4 People Naturally Surrounding Table)
// 1. Mother (Saree)
// 2. Little Boy (Cute younger brother)
// 3. Older Boy (Brother)
// 4. Father (Groomed beard)
// --------------------------------------------------------------------------
export function FamilyMembers() {
  const [ceremonyStage, setCeremonyStage] = useState('idle'); // 'idle', 'candles_lit', 'celebrating', 'cut'
  const [servedList, setServedList] = useState([]);
  const [candlesLooking, setCandlesLooking] = useState(false); // 'mom', 'dad', 'brother', 'little_boy', 'self'

  useEffect(() => {
    const unsubs = [];

    unsubs.push(
      worldEventBus.on('CANDLES_LIT', () => {
        setCeremonyStage('candles_lit');
        // Brief candle-look reaction -- characters glance at the lit candles for 2.8s
        setCandlesLooking(true);
        setTimeout(() => setCandlesLooking(false), 2800);
      })
    );
    unsubs.push(
      worldEventBus.on('CANDLES_BLOWN', () => {
        setCeremonyStage('celebrating');
        soundEngine.playCelebration();
      })
    );
    unsubs.push(
      worldEventBus.on('CAKE_CUT', () => {
        setCeremonyStage('cut');
        soundEngine.playCelebration();
      })
    );
    unsubs.push(
      worldEventBus.on('SLICE_SERVED', (data) => {
        const recipient = data.recipientId || 'mom';
        setServedList((prev) => (prev.includes(recipient) ? prev : [...prev, recipient]));
        soundEngine.playCelebration();
        setTimeout(() => soundEngine.playBite(), 1200);
      })
    );
    unsubs.push(
      worldEventBus.on('RESET_CAKE', () => {
        setServedList([]);
        setCeremonyStage('idle');
      })
    );

    return () => unsubs.forEach((u) => u && u());
  }, []);

  const handleTargetClick = (targetId) => {
    worldEventBus.emit('FAMILY_MEMBER_CLICKED', { targetId });
  };

  return (
    <group name="celebration-family-members">
      {/* 1. MOTHER (Front-Left Flank, Saree draped gracefully, looking warmly across) */}
      <MotherCharacter
        position={[-1.70, 0, -6.15]}
        baseRotation={[0, 2.70, 0]}
        scale={0.98}
        ceremonyStage={ceremonyStage}
        servedTo={servedList}
        onTargetClick={handleTargetClick}
        candlesLooking={candlesLooking}
      />

      {/* 2. CUTE LITTLE BOY (Front Center-Left, Smiling happily) */}
      <LittleBoyCharacter
        position={[-0.60, 0, -5.95]}
        baseRotation={[0, 3.10, 0]}
        scale={0.74}
        ceremonyStage={ceremonyStage}
        servedTo={servedList}
        onTargetClick={handleTargetClick}
        candlesLooking={candlesLooking}
      />

      {/* 3. OLDER BOY / BROTHER (Front Center-Right, Cheering and excited) */}
      <BrotherCharacter
        position={[0.60, 0, -5.95]}
        baseRotation={[0, -3.10, 0]}
        scale={0.96}
        ceremonyStage={ceremonyStage}
        servedTo={servedList}
        onTargetClick={handleTargetClick}
        candlesLooking={candlesLooking}
      />

      {/* 4. FATHER (Front-Right Flank, looking proudly across at user) */}
      <FatherCharacter
        position={[1.70, 0, -6.15]}
        baseRotation={[0, -2.70, 0]}
        scale={1.05}
        ceremonyStage={ceremonyStage}
        servedTo={servedList}
        onTargetClick={handleTargetClick}
        candlesLooking={candlesLooking}
      />
    </group>
  );
}
