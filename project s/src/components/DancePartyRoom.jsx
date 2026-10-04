import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles } from '@react-three/drei';
import { soundEngine } from '../systems/SoundSystem.js';

// Pre-instantiated Color objects to eliminate 32 per-frame allocations during dance-floor animation
const DANCE_FLOOR_COLORS = [
  new THREE.Color('#E91E63'),
  new THREE.Color('#9C27B0'),
  new THREE.Color('#2196F3'),
  new THREE.Color('#00BCD4'),
  new THREE.Color('#4CAF50'),
  new THREE.Color('#FFEB3B'),
  new THREE.Color('#FF9800'),
  new THREE.Color('#FF4081'),
];

// Interactive Animated LED Dance Floor Tile
function DanceFloorTile({ position, index }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const colorIndex = Math.floor((t * 2.8 + index * 0.45) % DANCE_FLOOR_COLORS.length);
    const targetColor = DANCE_FLOOR_COLORS[colorIndex];
    meshRef.current.material.color.lerp(targetColor, 0.15);
    meshRef.current.material.emissive.lerp(targetColor, 0.15);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[0.78, 0.78]} />
      <meshStandardMaterial
        color="#E91E63"
        emissive="#E91E63"
        emissiveIntensity={0.85}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

// Sweeping Volumetric Club Laser Beams
function ClubLaserRig({ position = [0, 4.6, 0] }) {
  const rigRef = useRef();
  const laserRefs = useRef([]);

  useFrame((state) => {
    if (!rigRef.current) return;
    const t = state.clock.getElapsedTime();
    rigRef.current.rotation.y = t * 0.75;
    laserRefs.current.forEach((laser, idx) => {
      if (laser) {
        laser.rotation.z = Math.sin(t * 2.2 + idx * 1.5) * 0.45;
        laser.rotation.x = Math.cos(t * 1.8 + idx * 1.2) * 0.35;
      }
    });
  });

  const laserColors = ['#00E5FF', '#FF007F', '#76FF03', '#FFD700'];

  return (
    <group ref={rigRef} position={position}>
      {laserColors.map((col, idx) => {
        const angle = (idx * Math.PI) / 2;
        return (
          <group
            key={`laser-${idx}`}
            position={[Math.sin(angle) * 0.6, 0, Math.cos(angle) * 0.6]}
            ref={(el) => (laserRefs.current[idx] = el)}
          >
            {/* Projector Pod */}
            <mesh>
              <cylinderGeometry args={[0.06, 0.08, 0.12, 12]} />
              <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Laser Beam Cone */}
            <mesh position={[0, -2.2, 0]}>
              <cylinderGeometry args={[0.015, 0.35, 4.4, 16, 1, true]} />
              <meshBasicMaterial
                color={col}
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Spot light throwing neon beam onto the floor */}
            <pointLight position={[0, -0.2, 0]} color={col} intensity={1.8} distance={6.0} />
          </group>
        );
      })}
    </group>
  );
}

// Rotating Mirror Disco Ball with dancing sparkle points
function DiscoBall({ position = [0, 4.2, 0] }) {
  const ballRef = useRef();
  const discoLightRef = useRef();

  useFrame((state, delta) => {
    if (ballRef.current) {
      ballRef.current.rotation.y += delta * 1.2;
      ballRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.6) * 0.10;
    }
    if (discoLightRef.current) {
      discoLightRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 2.2) * 1.5;
      discoLightRef.current.position.z = Math.cos(state.clock.getElapsedTime() * 2.2) * 1.5;
    }
  });

  const mirrorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ECEFF1',
    metalness: 0.98,
    roughness: 0.05,
    envMapIntensity: 3.5,
  }), []);

  return (
    <group position={position}>
      {/* Support cable */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.9, 8]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      {/* Mirror sphere */}
      <mesh ref={ballRef} castShadow material={mirrorMat}>
        <sphereGeometry args={[0.42, 28, 28]} />
      </mesh>
      {/* Dynamic color-shifting disco spot */}
      <pointLight
        ref={discoLightRef}
        position={[0, -0.2, 0]}
        color="#FF007F"
        intensity={1.4}
        distance={7.5}
      />
    </group>
  );
}

// DJ Booth with Equalizer Bars & Interactive Turntables
function DJPartyBooth({ position = [0, 0, -2.0] }) {
  const barsRef = useRef([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const height = 0.08 + Math.abs(Math.sin(t * 7.5 + i * 0.9)) * 0.38;
        bar.scale.y = height / 0.1;
        bar.position.y = 0.55 + height / 2;
      }
    });
  });

  const boothMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1A0B1A',
    roughness: 0.3,
    metalness: 0.4,
    side: THREE.DoubleSide,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.9,
    roughness: 0.18,
    side: THREE.DoubleSide,
  }), []);

  const vinylMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111111',
    roughness: 0.15,
    metalness: 0.85,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group position={position}>
      {/* Main DJ Console Desk */}
      <mesh position={[0, 0.48, 0]} castShadow material={boothMat}>
        <boxGeometry args={[2.4, 0.96, 0.85]} />
      </mesh>
      <mesh position={[0, 0.965, 0]} material={goldMat}>
        <boxGeometry args={[2.44, 0.02, 0.88]} />
      </mesh>

      {/* Dual Vinyl Turntables (Interactive: click to drop beat!) */}
      {[-0.65, 0.65].map((tx, i) => (
        <group
          key={`tt-${i}`}
          position={[tx, 0.98, 0]}
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playDanceBeat();
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={boothMat}>
            <circleGeometry args={[0.24, 24]} />
          </mesh>
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={vinylMat}>
            <circleGeometry args={[0.22, 24]} />
          </mesh>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldMat}>
            <circleGeometry args={[0.07, 16]} />
          </mesh>
        </group>
      ))}

      {/* Center Equalizer Display Bars */}
      <group position={[0, 0.98, -0.15]}>
        {[-0.28, -0.20, -0.12, -0.04, 0.04, 0.12, 0.20, 0.28].map((bx, i) => (
          <mesh
            key={`eq-${i}`}
            ref={(el) => (barsRef.current[i] = el)}
            position={[bx, 0.60, 0]}
          >
            <boxGeometry args={[0.055, 0.1, 0.02]} />
            <meshStandardMaterial
              color={i < 3 ? '#00E676' : i < 6 ? '#FFD600' : '#FF1744'}
              emissive={i < 3 ? '#00E676' : i < 6 ? '#FFD600' : '#FF1744'}
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
      </group>

      {/* Floating DJ HUD Action Hint */}
      <group position={[0, 1.45, 0]}>
        <Text
          fontSize={0.075}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.06}
        >
          ✦ CLICK TURNTABLE: DROP BEAT ✦
        </Text>
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// Electric Disco & Dance Party Club Room
// Positioned at X: [7.0, 12.6], Z: [-7.0, -2.0], Y: [0, 5.0]
// Center: [9.8, 0, -4.5]
// --------------------------------------------------------------------------
export function DancePartyRoom() {
  const roomCenter = [9.8, 0, -4.5];

  const clubFloorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#120516',
    roughness: 0.15,
    metalness: 0.2,
    side: THREE.DoubleSide,
  }), []);

  const clubWallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#180B22',
    roughness: 0.65,
    metalness: 0.15,
    side: THREE.FrontSide, // FrontSide prevents back-face bleed into ballroom
  }), []);

  const neonTrimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E040FB',
    emissive: '#E040FB',
    emissiveIntensity: 0.65,
    side: THREE.DoubleSide,
  }), []);

  const cyanTrimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00E5FF',
    emissive: '#00E5FF',
    emissiveIntensity: 0.65,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group name="dance-party-room" position={roomCenter}>
      {/* 1. Main Dark Reflective Floor (5.6m wide x 5.0m deep) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={clubFloorMat}>
        <planeGeometry args={[5.6, 5.0]} />
      </mesh>

      {/* 2. Interactive LED Dance Floor Matrix (4x4 Grid) */}
      <group position={[0, 0.005, 0.2]}>
        {[-1.2, -0.4, 0.4, 1.2].map((gx, col) =>
          [-1.2, -0.4, 0.4, 1.2].map((gz, row) => (
            <DanceFloorTile
              key={`tile-${col}-${row}`}
              position={[gx, 0, gz]}
              index={col * 4 + row}
            />
          ))
        )}
      </group>

      {/* 3. Ceiling with Disco Ball & Laser Rig */}
      <mesh position={[0, 5.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={clubWallMat}>
        <planeGeometry args={[5.6, 5.0]} />
      </mesh>
      <DiscoBall position={[0, 4.3, 0.2]} />
      <ClubLaserRig position={[0, 4.6, 0.2]} />

      {/* 4. East Wall (at x = 2.8) with Glowing Neon Logo */}
      <group position={[2.8, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow material={clubWallMat}>
          <planeGeometry args={[5.0, 5.0]} />
        </mesh>
        <mesh position={[0, -2.35, 0.02]} material={neonTrimMat}>
          <boxGeometry args={[5.0, 0.08, 0.04]} />
        </mesh>
        <mesh position={[0, 2.35, 0.02]} material={neonTrimMat}>
          <boxGeometry args={[5.0, 0.08, 0.04]} />
        </mesh>
        {/* Equalizer Accent Wall */}
        <group position={[0, 0.2, 0.03]}>
          <Text
            fontSize={0.24}
            color="#00E5FF"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.12}
          >
            FEEL THE RHYTHM
          </Text>
        </group>
      </group>

      {/* 5. North Wall with DJ Booth (at z = -2.5) */}
      <group position={[0, 2.5, -2.5]}>
        <mesh receiveShadow material={clubWallMat}>
          <planeGeometry args={[5.6, 5.0]} />
        </mesh>
        <mesh position={[0, -2.35, 0.02]} material={cyanTrimMat}>
          <boxGeometry args={[5.6, 0.08, 0.04]} />
        </mesh>
        {/* Glowing Party Neon Sign */}
        <group position={[0, 1.5, 0.05]}>
          <Text
            fontSize={0.25}
            color="#FF4081"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.08}
          >
            DANCE & DISCO CLUB
          </Text>
        </group>
      </group>

      {/* DJ Party Booth placed along North Wall */}
      <DJPartyBooth position={[0, 0, -1.85]} />

      {/* 6. South Wall (at z = 2.5) */}
      <group position={[0, 2.5, 2.5]} rotation={[0, Math.PI, 0]}>
        <mesh receiveShadow material={clubWallMat}>
          <planeGeometry args={[5.6, 5.0]} />
        </mesh>
        <mesh position={[0, -2.35, 0.02]} material={neonTrimMat}>
          <boxGeometry args={[5.6, 0.08, 0.04]} />
        </mesh>
        <mesh position={[0, 2.35, 0.02]} material={neonTrimMat}>
          <boxGeometry args={[5.6, 0.08, 0.04]} />
        </mesh>
      </group>

      {/* 7. West Wall (with doorway opening leading back to ballroom at x = -2.76, perfectly aligned 1.2m width) */}
      <group position={[-2.76, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Wall segment right of door (world z = -3.9 to -2.0) */}
        <mesh position={[-1.55, 0, 0]} receiveShadow material={clubWallMat}>
          <planeGeometry args={[1.9, 5.0]} />
        </mesh>
        {/* Wall segment left of door (world z = -7.0 to -5.1) */}
        <mesh position={[1.55, 0, 0]} receiveShadow material={clubWallMat}>
          <planeGeometry args={[1.9, 5.0]} />
        </mesh>
        {/* Header above doorway (world z = -5.1 to -3.9, y = 2.45 to 5.0) */}
        <mesh position={[0, 1.225, 0]} receiveShadow material={clubWallMat}>
          <planeGeometry args={[1.2, 2.55]} />
        </mesh>
        <mesh position={[0, 2.35, 0.02]} material={cyanTrimMat}>
          <boxGeometry args={[5.0, 0.08, 0.04]} />
        </mesh>
      </group>

      {/* Dance Club Fog & Strobe Sparkles */}
      <Sparkles count={55} scale={[5.2, 3.8, 4.6]} size={3.2} speed={0.9} color="#FF007F" opacity={0.65} />
      <Sparkles count={45} scale={[5.2, 3.8, 4.6]} size={2.8} speed={0.7} color="#00E5FF" opacity={0.65} />
    </group>
  );
}
