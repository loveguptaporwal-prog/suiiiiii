import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { birthdayData } from '../data/birthdayData.js';
import { PhysicalDoor } from './PhysicalDoor.jsx';

// Architectural Column with molded base, fluted shaft, and capital
function ArchitecturalColumn({ position, isRight = false }) {
  const columnMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF9F5',
    roughness: 0.32,
    metalness: 0.04,
  }), []);

  const goldTrimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8BF70',
    roughness: 0.22,
    metalness: 0.88,
  }), []);

  return (
    <group position={position}>
      {/* Plinth Base - Stepped Moldings */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow material={columnMaterial}>
        <boxGeometry args={[0.54, 0.2, 0.54]} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow material={goldTrimMaterial}>
        <boxGeometry args={[0.50, 0.05, 0.50]} />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow material={columnMaterial}>
        <boxGeometry args={[0.44, 0.15, 0.44]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow material={goldTrimMaterial}>
        <cylinderGeometry args={[0.20, 0.23, 0.06, 32]} />
      </mesh>

      {/* Main Fluted Column Shaft */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow material={columnMaterial}>
        <cylinderGeometry args={[0.17, 0.19, 2.0, 32]} />
      </mesh>

      {/* Classical Fluting Ridges */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const r = 0.185;
        return (
          <mesh
            key={i}
            position={[Math.sin(rad) * r, 1.45, Math.cos(rad) * r]}
            castShadow
            material={columnMaterial}
          >
            <cylinderGeometry args={[0.012, 0.014, 1.96, 8]} />
          </mesh>
        );
      })}

      {/* Column Capital (Crown) */}
      <mesh position={[0, 2.48, 0]} castShadow receiveShadow material={goldTrimMaterial}>
        <cylinderGeometry args={[0.24, 0.18, 0.08, 32]} />
      </mesh>
      <mesh position={[0, 2.58, 0]} castShadow receiveShadow material={columnMaterial}>
        <boxGeometry args={[0.46, 0.12, 0.46]} />
      </mesh>
      <mesh position={[0, 2.68, 0]} castShadow receiveShadow material={goldTrimMaterial}>
        <boxGeometry args={[0.50, 0.08, 0.50]} />
      </mesh>
    </group>
  );
}

// Classical Roman Arch spanning across columns
function RomanArchTop() {
  const archMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF9F5',
    roughness: 0.34,
    metalness: 0.04,
  }), []);

  const goldTrimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8BF70',
    roughness: 0.22,
    metalness: 0.88,
  }), []);

  return (
    <group position={[0, 2.7, 0]}>
      {/* Architrave Beam */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow material={archMaterial}>
        <boxGeometry args={[2.84, 0.14, 0.46]} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow material={goldTrimMaterial}>
        <boxGeometry args={[2.90, 0.05, 0.50]} />
      </mesh>

      {/* Semicircular Molded Arch Ring */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow material={archMaterial}>
        <torusGeometry args={[1.14, 0.14, 20, 64, Math.PI]} />
      </mesh>
      {/* Gold Concentric Arch Accent */}
      <mesh position={[0, 0.18, 0.08]} castShadow receiveShadow material={goldTrimMaterial}>
        <torusGeometry args={[1.24, 0.03, 16, 64, Math.PI]} />
      </mesh>
      <mesh position={[0, 0.18, -0.08]} castShadow receiveShadow material={goldTrimMaterial}>
        <torusGeometry args={[1.24, 0.03, 16, 64, Math.PI]} />
      </mesh>

      {/* Ornate Keystone at Arch Apex */}
      <group position={[0, 1.40, 0]}>
        <mesh castShadow receiveShadow material={goldTrimMaterial}>
          <boxGeometry args={[0.30, 0.36, 0.42]} />
        </mesh>
        <mesh position={[0, 0, 0.22]} castShadow material={goldTrimMaterial}>
          <sphereGeometry args={[0.08, 20, 20]} />
        </mesh>
      </group>
    </group>
  );
}

// Grand Luxury Birthday Sign with Glowing Highlighted Name (Configurable from birthdayData)
function BirthdaySignCartouche({ name = birthdayData.name, title = birthdayData.title }) {
  const nameGlowLightRef = useRef();

  const plaqueMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF9',
    roughness: 0.25,
    metalness: 0.04,
  }), []);

  const goldFrameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.92,
    roughness: 0.16,
  }), []);

  const fairyBulbMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8E0',
    emissive: '#FFB84D',
    emissiveIntensity: 2.8,
    roughness: 0.1,
  }), []);

  const namePlaqueMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1438',
    emissive: '#4A081C',
    emissiveIntensity: 0.22,
    roughness: 0.44,
    metalness: 0.06,
  }), []);

  // Subtle breathing pulsation on the name's dedicated diffuse glow
  useFrame((state) => {
    if (nameGlowLightRef.current) {
      const t = state.clock.getElapsedTime();
      nameGlowLightRef.current.intensity = 0.35 + Math.sin(t * 2.0) * 0.06;
    }
  });

  // Fairy light positions around the cartouche border
  const bulbPositions = useMemo(() => {
    const list = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = (i / (count - 1)) * Math.PI;
      const x = Math.cos(angle) * 1.06;
      const y = Math.sin(angle) * 0.38 + 0.08;
      list.push([x, y, 0.14]);
    }
    return list;
  }, []);

  return (
    <group position={[0, 2.74, 0.32]}>
      {/* Plaque Backplate with Gilded Molding */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow material={plaqueMaterial}>
        <boxGeometry args={[2.14, 0.70, 0.08]} />
      </mesh>
      {/* Outer Gilded Rim */}
      <mesh position={[0, 0.12, 0.045]} castShadow material={goldFrameMaterial}>
        <boxGeometry args={[2.22, 0.76, 0.025]} />
      </mesh>
      {/* Inner Recessed Luxury Panel */}
      <mesh position={[0, 0.12, 0.055]} material={plaqueMaterial}>
        <boxGeometry args={[2.04, 0.62, 0.015]} />
      </mesh>

      {/* Decorative Gold Crown / Ribbon Swag at Top */}
      <mesh position={[0, 0.54, 0.06]} castShadow material={goldFrameMaterial}>
        <torusGeometry args={[0.24, 0.032, 16, 32, Math.PI]} />
      </mesh>

      {/* Golden Hanging Chains attaching sign physically to the arch */}
      <mesh position={[-0.85, 0.52, 0]} castShadow material={goldFrameMaterial}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
      </mesh>
      <mesh position={[0.85, 0.52, 0]} castShadow material={goldFrameMaterial}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
      </mesh>

      {/* Fairy Light Bulbs Bordering the Sign */}
      {bulbPositions.map((pos, idx) => (
        <mesh key={idx} position={pos} material={fairyBulbMaterial}>
          <sphereGeometry args={[0.028, 14, 14]} />
        </mesh>
      ))}

      {/* Line 1: Title (e.g. ✦ HAPPY BIRTHDAY ✦) */}
      <Text
        position={[0, 0.26, 0.075]}
        fontSize={0.14}
        letterSpacing={0.15}
        color="#D81B60"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor="#FFFDF9"
      >
        ✦ {title} ✦
      </Text>

      {/* Line 2: Glowing Highlighted Name (e.g. "SNEHA") */}
      <group position={[0, 0.01, 0.07]}>
        {/* Outer Gilded Frame Plaque */}
        <mesh position={[0, 0, 0]} castShadow material={goldFrameMaterial}>
          <boxGeometry args={[1.56, 0.27, 0.016]} />
        </mesh>
        {/* Deep Royal Ruby Velvet Field with Soft Inner Glow */}
        <mesh position={[0, 0, 0.01]} material={namePlaqueMat}>
          <boxGeometry args={[1.50, 0.21, 0.01]} />
        </mesh>

        {/* Soft, diffuse backplate illumination without any bright glare spots */}
        <pointLight
          ref={nameGlowLightRef}
          position={[0, 0, 0.05]}
          color="#FF85A2"
          distance={1.2}
          intensity={0.35}
        />

        {/* Crisp, beautiful, legible name lettering */}
        <Text
          position={[0, 0, 0.024]}
          fontSize={0.165}
          letterSpacing={0.18}
          color="#FFFDF9"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.008}
          outlineColor="#4A081C"
        >
          {name}
        </Text>
      </group>
    </group>
  );
}

export function OrnateGate({ name, onGateClick }) {
  const gateRef = useRef();

  return (
    <group ref={gateRef} name="ornate-party-gate" position={[0, 0, 0]}>
      {/* Neoclassical Architectural Columns */}
      <ArchitecturalColumn position={[-1.25, 0, 0]} />
      <ArchitecturalColumn position={[1.25, 0, 0]} isRight />

      {/* Grand Classical Arch */}
      <RomanArchTop />

      {/* French Doors (Controlled teaser angle with smooth hinge physics & subtle tactile response) */}
      <PhysicalDoor isRight={false} initialState="partially_open" />
      <PhysicalDoor isRight={true} initialState="partially_open" />

      {/* Luxury Birthday Plaque & Sign with Configurable Name */}
      <BirthdaySignCartouche name={name} />
    </group>
  );
}
