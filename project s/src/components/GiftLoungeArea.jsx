import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { worldEventBus } from '../systems/WorldEventBus.js';

// --------------------------------------------------------------------------
// Interactive Mystery Birthday Gift
// Hover shimmer, click to untie ribbon & lift lid with golden celebration sparkle
// --------------------------------------------------------------------------
function InteractiveMysteryGift({ position = [0, 0.92, 0] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lidRef = useRef();
  const sparkleRef = useRef();

  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D81B60', // Royal magenta velvet
    roughness: 0.65,
    metalness: 0.08,
  }), []);

  const goldRibbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.90,
    roughness: 0.18,
  }), []);

  const innerGoldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8E7',
    emissive: '#FFB84D',
    emissiveIntensity: 2.2,
    roughness: 0.2,
  }), []);

  useFrame((state, delta) => {
    // Lift and tilt lid when opened
    if (lidRef.current) {
      const targetLidY = isOpen ? 0.38 : 0.16;
      const targetLidRotZ = isOpen ? 0.45 : 0.0;
      lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, targetLidY, 1 - Math.exp(-6 * delta));
      lidRef.current.rotation.z = THREE.MathUtils.lerp(lidRef.current.rotation.z, targetLidRotZ, 1 - Math.exp(-6 * delta));
    }
    if (sparkleRef.current && isOpen) {
      sparkleRef.current.rotation.y += delta * 1.5;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    worldEventBus.triggerInteractionPipeline('mystery_gift', 'open', { isOpen: !isOpen });
  };

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onPointerDown={handleClick}
    >
      {/* Gift Box Base (0.42m x 0.32m x 0.42m) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow material={boxMat}>
        <boxGeometry args={[0.42, 0.30, 0.42]} />
      </mesh>
      {/* Base Ribbon Wraps */}
      <mesh position={[0, 0, 0]} material={goldRibbonMat}>
        <boxGeometry args={[0.08, 0.305, 0.425]} />
      </mesh>
      <mesh position={[0, 0, 0]} material={goldRibbonMat}>
        <boxGeometry args={[0.425, 0.305, 0.08]} />
      </mesh>

      {/* Interior Glowing Keepsake when opened */}
      {isOpen && (
        <group ref={sparkleRef} position={[0, 0.08, 0]}>
          <mesh material={innerGoldMat}>
            <octahedronGeometry args={[0.08, 0]} />
          </mesh>
          <pointLight
            position={[0, 0.10, 0]}
            color="#FFD54F"
            intensity={1.2}
            distance={1.5}
          />
        </group>
      )}

      {/* Liftable Lid with Big Tied Bow */}
      <group ref={lidRef} position={[0, 0.16, 0]}>
        <mesh castShadow material={boxMat}>
          <boxGeometry args={[0.44, 0.06, 0.44]} />
        </mesh>
        <mesh position={[0, 0, 0]} material={goldRibbonMat}>
          <boxGeometry args={[0.082, 0.065, 0.445]} />
        </mesh>
        <mesh position={[0, 0, 0]} material={goldRibbonMat}>
          <boxGeometry args={[0.445, 0.065, 0.082]} />
        </mesh>

        {/* 3D Tied Bow knot on lid */}
        <mesh position={[0, 0.05, 0]} castShadow material={goldRibbonMat}>
          <sphereGeometry args={[0.038, 12, 12]} />
        </mesh>
        <mesh position={[-0.06, 0.07, 0]} rotation={[0.2, 0.1, Math.PI / 4]} castShadow material={goldRibbonMat}>
          <torusGeometry args={[0.055, 0.016, 10, 24]} />
        </mesh>
        <mesh position={[0.06, 0.07, 0]} rotation={[0.2, -0.1, -Math.PI / 4]} castShadow material={goldRibbonMat}>
          <torusGeometry args={[0.055, 0.016, 10, 24]} />
        </mesh>
      </group>

      {/* Subtle hover prompt glow */}
      {isHovered && !isOpen && (
        <pointLight
          position={[0, 0.25, 0]}
          color="#FFE0B2"
          intensity={0.3}
          distance={0.8}
        />
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// Main Component: GiftLoungeArea (Left Wall at x = -6.85, z = -8.0)
// --------------------------------------------------------------------------
export function GiftLoungeArea() {
  const marbleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8F4',
    roughness: 0.18,
    metalness: 0.08,
  }), []);

  const woodConsoleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#651E2E', // Deep rosewood cabinetry
    roughness: 0.35,
    metalness: 0.06,
  }), []);

  const goldTrimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.88,
    roughness: 0.20,
  }), []);

  return (
    <group position={[-6.55, 0, -8.0]} rotation={[0, Math.PI / 2, 0]} name="gift-lounge-area">
      {/* 1. Neoclassical Marble-Top Credenza (2.8m long x 0.72m deep x 0.88m high) */}
      <group position={[0, 0, 0]}>
        {/* Polished White Marble Top */}
        <mesh position={[0, 0.86, 0]} castShadow receiveShadow material={marbleMat}>
          <boxGeometry args={[2.8, 0.06, 0.72]} />
        </mesh>
        {/* Gold Inset Reveal */}
        <mesh position={[0, 0.825, 0]} material={goldTrimMat}>
          <boxGeometry args={[2.76, 0.015, 0.68]} />
        </mesh>
        {/* Main Rosewood Cabinet Body */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow material={woodConsoleMat}>
          <boxGeometry args={[2.68, 0.76, 0.64]} />
        </mesh>
        {/* Cabinet Door Moldings */}
        {[-0.9, -0.3, 0.3, 0.9].map((cx, i) => (
          <group key={`door-panel-${i}`} position={[cx, 0.44, 0.325]}>
            <mesh material={goldTrimMat}>
              <boxGeometry args={[0.52, 0.64, 0.008]} />
            </mesh>
            <mesh position={[0, 0, 0.006]} material={woodConsoleMat}>
              <boxGeometry args={[0.48, 0.60, 0.008]} />
            </mesh>
            {/* Brass knob */}
            <mesh position={[cx > 0 ? -0.18 : 0.18, 0, 0.018]} material={goldTrimMat}>
              <sphereGeometry args={[0.014, 10, 10]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. Gilded Wall Mirror mounted on wall above credenza */}
      <group position={[0, 2.2, -0.34]}>
        {/* Gilded Arch Frame */}
        <mesh castShadow material={goldTrimMat}>
          <boxGeometry args={[1.8, 1.8, 0.04]} />
        </mesh>
        {/* Mirror Glass Surface */}
        <mesh position={[0, 0, 0.025]} material={marbleMat}>
          <boxGeometry args={[1.64, 1.64, 0.01]} />
        </mesh>
      </group>

      {/* 3. HERO INTERACTIVE GIFT: Centerpiece on Credenza */}
      <InteractiveMysteryGift position={[0, 0.90, 0]} />

      {/* 4. Surrounding Stacks of Luxury Gifts on Credenza */}
      {/* Left gift stack */}
      <group position={[-0.85, 0.89, 0]}>
        <mesh castShadow material={goldTrimMat}>
          <boxGeometry args={[0.40, 0.22, 0.32]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.26, 0.16, 0.24]} />
          <meshStandardMaterial color="#FFF8F4" roughness={0.4} />
        </mesh>
      </group>

      {/* Right gift stack with round hatbox */}
      <group position={[0.85, 0.89, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.25, 24]} />
          <meshStandardMaterial color="#F48FB1" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.13, 0]} material={goldTrimMat}>
          <torusGeometry args={[0.182, 0.012, 8, 24]} />
        </mesh>
      </group>

      {/* 5. Tall Neoclassical Floor Vase with Cascading Roses (beside credenza) */}
      <group position={[1.85, 0, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow material={marbleMat}>
          <cylinderGeometry args={[0.22, 0.14, 0.90, 20]} />
        </mesh>
        <mesh position={[0, 0.92, 0]} material={goldTrimMat}>
          <torusGeometry args={[0.22, 0.02, 10, 24]} />
        </mesh>
        {/* Floral spray */}
        {[-0.08, 0.08, 0].map((ox, i) => (
          <mesh key={i} position={[ox, 1.05 + i * 0.06, 0]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#FF8CA3' : '#FFF8F2'} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Ambient warm light pool on credenza */}
      <pointLight
        position={[0, 1.6, 0.2]}
        color="#FFE0B2"
        intensity={0.65}
        distance={2.8}
      />
    </group>
  );
}
