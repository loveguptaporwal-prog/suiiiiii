import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { worldEventBus } from '../systems/WorldEventBus.js';
import { soundEngine } from '../systems/SoundSystem.js';

import { BirthdayCakeTable } from './BirthdayCakeTable.jsx';
import { FamilyMembers } from './FamilyMembers.jsx';
import { MemoryGalleryWall } from './MemoryGalleryWall.jsx';
import { GiftLoungeArea } from './GiftLoungeArea.jsx';
import { MusicLoungeArea } from './MusicLoungeArea.jsx';
import { RoomHubDoors } from './RoomHubDoors.jsx';
import { FirstPersonInteractionHand } from './FirstPersonInteractionHand.jsx';
import { GiftLoungeRoom } from './GiftLoungeRoom.jsx';
import { DancePartyRoom } from './DancePartyRoom.jsx';
import { StarryTerraceRoom } from './StarryTerraceRoom.jsx';
import { BallroomPartyDecorations } from './BallroomPartyDecorations.jsx';
import { CakeTableSelfieBackdrop } from './CakeTableSelfieBackdrop.jsx';
import { BirthdayPortrait } from './BirthdayPortrait.jsx';
import cakePortraitImage from '../../her/images/photo2.jpeg';
import entrancePhotoLeft from '../../her/images/photo15.jpeg';
import entrancePhotoRight from '../../her/images/photo25.jpeg';

// Grand Multi-Tiered Chandelier hanging centered above the banquet table
function GrandChandelier({ position = [0, 4.2, -8.0] }) {
  const chandelierLightRef = useRef();
  const groupRef = useRef();

  const brassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 2.2,
  }), []);

  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF6D8',
    emissive: '#FFB84D',
    emissiveIntensity: 1.8,
    roughness: 0.15,
    envMapIntensity: 0.8,
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (chandelierLightRef.current) {
      chandelierLightRef.current.intensity = 0.95 + Math.sin(t * 1.5) * 0.1;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.02;
    }
  });

  // Softly dim the chandelier when candles are lit to create an intimate celebration mood
  const [targetIntensity, setTargetIntensity] = useState(0.95);

  useEffect(() => {
    const unsubs = [];
    unsubs.push(worldEventBus.on('CANDLES_LIT', () => setTargetIntensity(0.45)));
    unsubs.push(worldEventBus.on('CANDLES_BLOWN', () => setTargetIntensity(0.95)));
    return () => unsubs.forEach((u) => u && u());
  }, []);

  useFrame((state, delta) => {
    if (chandelierLightRef.current) {
      chandelierLightRef.current.intensity = THREE.MathUtils.lerp(
        chandelierLightRef.current.intensity,
        targetIntensity,
        1 - Math.exp(-3 * delta)
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Suspension Chain */}
      <mesh material={brassMat}>
        <cylinderGeometry args={[0.018, 0.018, 0.6, 8]} />
      </mesh>

      {/* Main Chandelier Crown & Body */}
      <mesh position={[0, -0.35, 0]} castShadow material={brassMat}>
        <sphereGeometry args={[0.22, 20, 20]} />
      </mesh>
      <mesh position={[0, -0.42, 0]} material={brassMat}>
        <torusGeometry args={[0.55, 0.020, 12, 32]} />
      </mesh>

      {/* Tier 1: Outer Bulb Ring (8 lights) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = 0.55;
        return (
          <group key={`t1-${i}`} position={[Math.sin(rad) * r, -0.40, Math.cos(rad) * r]}>
            <mesh material={bulbMat}>
              <sphereGeometry args={[0.038, 14, 14]} />
            </mesh>
            <mesh position={[0, -0.05, 0]} material={brassMat}>
              <cylinderGeometry args={[0.014, 0.010, 0.05, 10]} />
            </mesh>
          </group>
        );
      })}

      {/* Tier 2: Lower Center Cluster */}
      <mesh position={[0, -0.55, 0]} material={bulbMat}>
        <sphereGeometry args={[0.048, 16, 16]} />
      </mesh>

      {/* Grand Chandelier Light washing the room with soft warm ambiance */}
      <pointLight
        ref={chandelierLightRef}
        position={[0, -0.45, 0]}
        color="#FFA838"
        intensity={0.95}
        distance={7.5}
      />
    </group>
  );
}

// Celebration Balloons drifting throughout the grand ballroom (clickable & poppable!)
function GrandRoomBalloons() {
  const groupRef = useRef();
  const [poppedMap, setPoppedMap] = useState({});

  const balloons = useMemo(() => [
    { pos: [-3.2, 2.6, -6.5], color: '#FF7597', s: 0.42, speed: 0.55, phase: 0.2 },
    { pos: [3.4, 2.9, -7.2], color: '#F4CF7F', s: 0.44, speed: 0.68, phase: 1.8 },
    { pos: [-2.0, 3.4, -9.5], color: '#FFCCD8', s: 0.38, speed: 0.48, phase: 3.2 },
    { pos: [2.2, 3.2, -9.2], color: '#D81B60', s: 0.40, speed: 0.72, phase: 4.5 },
    { pos: [-4.2, 2.8, -10.5], color: '#FFF8F2', s: 0.45, speed: 0.60, phase: 2.3 },
    { pos: [4.0, 2.7, -10.8], color: '#FF8FA3', s: 0.42, speed: 0.64, phase: 0.9 },
    { pos: [-3.8, 3.6, -11.5], color: '#F4CF7F', s: 0.48, speed: 0.52, phase: 5.1 },
    // Additional vibrant celebration balloons across room
    { pos: [-1.4, 2.5, -4.5], color: '#9C27B0', s: 0.38, speed: 0.62, phase: 1.1 },
    { pos: [1.6, 2.7, -4.2], color: '#E91E63', s: 0.42, speed: 0.58, phase: 2.7 },
    { pos: [-4.8, 3.3, -8.2], color: '#00BCD4', s: 0.40, speed: 0.49, phase: 3.8 },
    { pos: [4.8, 3.1, -8.0], color: '#FF4081', s: 0.43, speed: 0.65, phase: 4.9 },
    { pos: [-3.8, 3.5, -3.8], color: '#FFD54F', s: 0.39, speed: 0.53, phase: 0.7 },
    { pos: [3.8, 3.4, -3.6], color: '#FF80AB', s: 0.41, speed: 0.71, phase: 2.1 },
    { pos: [-4.6, 3.8, -10.5], color: '#D81B60', s: 0.44, speed: 0.45, phase: 3.5 },
    { pos: [4.4, 3.7, -10.5], color: '#F4CF7F', s: 0.40, speed: 0.57, phase: 5.4 },
    { pos: [-4.8, 2.9, -13.1], color: '#E040FB', s: 0.38, speed: 0.63, phase: 1.4 },
    { pos: [4.8, 2.8, -13.1], color: '#00E5FF', s: 0.39, speed: 0.59, phase: 4.2 },
    { pos: [0.0, 4.9, -6.0], color: '#FF1744', s: 0.46, speed: 0.50, phase: 0.5 },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const b = balloons[i];
      if (b && child) {
        child.position.y = b.pos[1] + Math.sin(t * b.speed + b.phase) * 0.06;
      }
    });
  });

  const handlePop = (i, e) => {
    e.stopPropagation();
    soundEngine.playBalloonPop();
    setPoppedMap((prev) => ({ ...prev, [i]: true }));
    setTimeout(() => {
      setPoppedMap((prev) => ({ ...prev, [i]: false }));
    }, 7000);
  };

  return (
    <group ref={groupRef}>
      {balloons.map((b, i) => {
        if (poppedMap[i]) return null;
        return (
          <mesh
            key={i}
            position={b.pos}
            castShadow
            onClick={(e) => handlePop(i, e)}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <sphereGeometry args={[b.s, 24, 24]} />
            <meshStandardMaterial
              color={b.color}
              metalness={0.35}
              roughness={0.22}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function InteriorPartyGlimpse() {
  // Track open/closed state of the three adjacent room doors
  const [doorsOpen, setDoorsOpen] = useState({
    west_corridor_door: false,
    east_corridor_door: false,
    north_corridor_door: false,
  });
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 0 });

  useEffect(() => {
    const unsubs = [];
    unsubs.push(
      worldEventBus.on('DOOR_STATE_CHANGED', ({ doorId, state }) => {
        setDoorsOpen((prev) => ({
          ...prev,
          [doorId]: state === 'open' || state === 'ajar',
        }));
      })
    );
    unsubs.push(
      worldEventBus.on('CAMERA_POSITION', (coords) => {
        setPlayerCoords({ x: coords.x, z: coords.z });
      })
    );
    return () => unsubs.forEach((u) => u && u());
  }, []);

  // Room is rendered if its door is open OR if player is physically inside that room
  const isWestVisible = doorsOpen.west_corridor_door || playerCoords.x <= -6.0;
  const isEastVisible = doorsOpen.east_corridor_door || playerCoords.x >= 6.0;
  const isNorthVisible = doorsOpen.north_corridor_door || playerCoords.z <= -13.0;

  const floorWoodMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#7A2E40',
    roughness: 0.22,
    metalness: 0.12,
    envMapIntensity: 1.4, // polished parquet catches IBL reflections
  }), []);

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8DED8', // Elegant warm architectural champagne cream (rich, non-glare, non-white)
    roughness: 0.65,
    metalness: 0.02,
    envMapIntensity: 0.35,
    side: THREE.FrontSide, // FrontSide prevents back-face bleed into adjacent rooms
  }), []);

  const entranceWallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8DED8',
    roughness: 0.65,
    metalness: 0.02,
    envMapIntensity: 0.35,
    side: THREE.DoubleSide,
  }), []);

  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37', // Gilded Neoclassical molding trim
    metalness: 0.88,
    roughness: 0.22,
    envMapIntensity: 1.8,
  }), []);

  const boiserieMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8CBC4', // Warm French salon acoustic inset tone
    roughness: 0.58,
    metalness: 0.02,
    envMapIntensity: 0.4,
  }), []);

  const goldAccentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 2.8, // rich gold responds strongly to IBL
  }), []);

  const runnerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#9C1A42',
    roughness: 0.72,
    metalness: 0.02,
    envMapIntensity: 0.2,
  }), []);

  return (
    <group name="interior-party-glimpse">
      {/* 1. Grand Ballroom Floor (14.0m wide x 14.0m deep) */}
      <mesh position={[0, -0.01, -7.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={floorWoodMat}>
        <planeGeometry args={[14.0, 14.0]} />
      </mesh>

      {/* Hero Visual Center Zone: Opulent Marquetry Floor Medallion Beneath Cake Table */}
      <group position={[0, 0.001, -8.0]}>
        {/* Outer Inlaid Rosewood Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={runnerMat}>
          <ringGeometry args={[2.55, 2.65, 48]} />
        </mesh>
        {/* Fine Brass Inlay Fillet */}
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldAccentMat}>
          <ringGeometry args={[2.65, 2.70, 48]} />
        </mesh>
        {/* Concentric Centerzone Parquet Accent */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.54, 48]} />
          <meshStandardMaterial color="#6E2334" roughness={0.32} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldAccentMat}>
          <ringGeometry args={[1.35, 1.38, 36]} />
        </mesh>
      </group>

      {/* Celebratory Velvet Carpet Runner continuing from Party Gate toward the Table */}
      <group position={[0, 0.003, -4.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={runnerMat}>
          <planeGeometry args={[1.56, 8.0]} />
        </mesh>
        <mesh position={[-0.80, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldAccentMat}>
          <planeGeometry args={[0.04, 8.0]} />
        </mesh>
        <mesh position={[0.80, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldAccentMat}>
          <planeGeometry args={[0.04, 8.0]} />
        </mesh>
      </group>

      {/* 2. Grand Ballroom Back Wall at z = -13.5 (with doorway opening at x = -5.2 leading to Starry Terrace) */}
      <group position={[0, 2.7, -13.5]}>
        {/* Wall left of door (from x = -7.05 to -5.8, perfectly flush with corner) */}
        <mesh position={[-6.425, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[1.25, 5.4]} />
        </mesh>
        {/* Wall right of door (from x = -4.6 to 7.0) */}
        <mesh position={[1.2, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[11.6, 5.4]} />
        </mesh>
        {/* Header above door (from x = -5.8 to -4.6, y = 2.5 to 5.4) */}
        <mesh position={[-5.2, 1.35, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[1.2, 2.7]} />
        </mesh>

        {/* Baseboard along entire back wall including left of door */}
        <mesh position={[-6.425, -2.56, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[1.25, 0.28, 0.06]} />
        </mesh>
        <mesh position={[1.2, -2.56, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[11.6, 0.28, 0.06]} />
        </mesh>
        {/* Dado rail */}
        <mesh position={[-6.425, -1.62, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[1.25, 0.08, 0.05]} />
        </mesh>
        <mesh position={[1.2, -1.62, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[11.6, 0.08, 0.05]} />
        </mesh>
        {/* Crown Molding across entire top */}
        <mesh position={[0, 2.60, 0.04]} castShadow material={trimMat}>
          <boxGeometry args={[14.0, 0.20, 0.08]} />
        </mesh>

      </group>

      {/* 3. Left Ballroom Wall at x = -7.0 (with doorway opening at world z = -4.5 / local x = -2.5 leading to VIP Gift Lounge) */}
      <group position={[-7.0, 2.7, -7.0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Wall segment before door (local x = -7.0 to -3.1, world z = 0 to -3.9) */}
        <mesh position={[-5.05, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[3.9, 5.4]} />
        </mesh>
        {/* Wall segment after door (local x = -1.9 to 7.0, world z = -5.1 to -14.0) */}
        <mesh position={[2.55, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[8.9, 5.4]} />
        </mesh>
        {/* Header above doorway (local x = -3.1 to -1.9, world z = -3.9 to -5.1) */}
        <mesh position={[-2.5, 1.35, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[1.2, 2.7]} />
        </mesh>

        {/* Baseboard */}
        <mesh position={[-5.05, -2.56, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[3.9, 0.28, 0.06]} />
        </mesh>
        <mesh position={[2.55, -2.56, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[8.9, 0.28, 0.06]} />
        </mesh>
        {/* Crown Molding across entire top */}
        <mesh position={[0, 2.60, 0.04]} castShadow material={trimMat}>
          <boxGeometry args={[14.0, 0.20, 0.08]} />
        </mesh>

      </group>

      {/* 4. Right Ballroom Wall at x = +7.0 (with doorway opening at world z = -4.5 / local x = 2.5 leading to Disco Dance Club) */}
      <group position={[7.0, 2.7, -7.0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Wall segment before door (local x = -7.0 to 1.9, world z = -14.0 to -5.1) */}
        <mesh position={[-2.55, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[8.9, 5.4]} />
        </mesh>
        {/* Wall segment after door (local x = 3.1 to 7.0, world z = -3.9 to 0) */}
        <mesh position={[5.05, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[3.9, 5.4]} />
        </mesh>
        {/* Header above doorway (local x = 1.9 to 3.1, world z = -5.1 to -3.9) */}
        <mesh position={[2.5, 1.35, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[1.2, 2.7]} />
        </mesh>

        {/* Baseboard */}
        <mesh position={[-2.55, -2.56, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[8.9, 0.28, 0.06]} />
        </mesh>
        <mesh position={[5.05, -2.56, 0.03]} castShadow material={trimMat}>
          <boxGeometry args={[3.9, 0.28, 0.06]} />
        </mesh>
        {/* Crown Molding across entire top */}
        <mesh position={[0, 2.60, 0.04]} castShadow material={trimMat}>
          <boxGeometry args={[14.0, 0.20, 0.08]} />
        </mesh>

      </group>

      {/* 4b. Grand Ballroom Front Entrance Enclosure Wall at z = -0.05 (100% Solid Enclosure, No White Void) */}
      <group position={[0, 2.7, -0.05]}>
        {/* Left Wing (from x = -7.0 to -1.25) */}
        <group position={[-4.125, 0, 0]}>
          <mesh receiveShadow rotation={[0, Math.PI, 0]} material={entranceWallMat}>
            <planeGeometry args={[5.75, 5.4]} />
          </mesh>
          <mesh position={[0, -2.56, -0.03]} castShadow material={trimMat}>
            <boxGeometry args={[5.75, 0.28, 0.06]} />
          </mesh>
          <mesh position={[0, -1.62, -0.03]} castShadow material={trimMat}>
            <boxGeometry args={[5.75, 0.08, 0.05]} />
          </mesh>
          <mesh position={[0, 2.60, -0.04]} castShadow material={trimMat}>
            <boxGeometry args={[5.75, 0.20, 0.08]} />
          </mesh>
        </group>

        {/* Right Wing (from x = 1.25 to 7.0) */}
        <group position={[4.125, 0, 0]}>
          <mesh receiveShadow rotation={[0, Math.PI, 0]} material={entranceWallMat}>
            <planeGeometry args={[5.75, 5.4]} />
          </mesh>
          <mesh position={[0, -2.56, -0.03]} castShadow material={trimMat}>
            <boxGeometry args={[5.75, 0.28, 0.06]} />
          </mesh>
          <mesh position={[0, -1.62, -0.03]} castShadow material={trimMat}>
            <boxGeometry args={[5.75, 0.08, 0.05]} />
          </mesh>
          <mesh position={[0, 2.60, -0.04]} castShadow material={trimMat}>
            <boxGeometry args={[5.75, 0.20, 0.08]} />
          </mesh>
        </group>

        {/* Archway Header (above doorway between x = -1.25 and 1.25, y = 3.35 to 5.4) */}
        <group position={[0, 1.675, 0]}>
          <mesh receiveShadow rotation={[0, Math.PI, 0]} material={entranceWallMat}>
            <planeGeometry args={[2.50, 2.05]} />
          </mesh>
          <mesh position={[0, 0.925, -0.04]} castShadow material={trimMat}>
            <boxGeometry args={[2.50, 0.20, 0.08]} />
          </mesh>
        </group>

        <BirthdayPortrait
          name="entrance-left-photo"
          imageSrc={entrancePhotoRight}
          position={[-4.125, -0.1, -0.12]}
          rotation={[0, Math.PI, 0]}
          photoHeight={2.35}
        />
        <BirthdayPortrait
          name="entrance-right-photo"
          imageSrc={entrancePhotoLeft}
          position={[4.125, -0.1, -0.12]}
          rotation={[0, Math.PI, 0]}
          photoHeight={2.35}
        />
      </group>

      {/* Classical Corner Pilasters */}
      {[
        [-6.86, -13.36],
        [6.86, -13.36],
        [-6.86, -0.64],
        [6.86, -0.64],
      ].map(([px, pz], i) => (
        <group key={`pilaster-${i}`} position={[px, 2.7, pz]}>
          <mesh castShadow material={trimMat}>
            <boxGeometry args={[0.26, 5.4, 0.26]} />
          </mesh>
          <mesh position={[0, 2.50, 0]} material={goldAccentMat}>
            <boxGeometry args={[0.30, 0.16, 0.30]} />
          </mesh>
          <mesh position={[0, -2.50, 0]} material={goldAccentMat}>
            <boxGeometry args={[0.30, 0.16, 0.30]} />
          </mesh>
        </group>
      ))}

      {/* 5. Grand Coffered Ballroom Ceiling at y = 5.2 */}
      <group position={[0, 5.2, -7.0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14.0, 14.0]} />
          <meshStandardMaterial color="#FFF9F5" roughness={0.65} />
        </mesh>
        {/* Coffered Ceiling Longitudinal Beams */}
        {[-3.5, 0, 3.5].map((bx, i) => (
          <mesh key={`c-beam-x-${i}`} position={[bx, -0.08, 0]} material={trimMat}>
            <boxGeometry args={[0.24, 0.16, 14.0]} />
          </mesh>
        ))}
        {/* Coffered Ceiling Transverse Beams */}
        {[-3.5, 0, 3.5].map((bz, i) => (
          <mesh key={`c-beam-z-${i}`} position={[0, -0.08, bz]} material={trimMat}>
            <boxGeometry args={[14.0, 0.16, 0.24]} />
          </mesh>
        ))}
        {/* Central Chandelier Ceiling Medallion */}
        <mesh position={[0, -0.02, -1.0]} rotation={[Math.PI / 2, 0, 0]} material={trimMat}>
          <torusGeometry args={[0.85, 0.04, 12, 36]} />
        </mesh>
      </group>

      {/* 6. CENTERPIECE: Grand 3-Tier Birthday Cake Table with Physical Knife */}
      <BirthdayCakeTable position={[0, 0, -8.0]} />

      {/* 7. FIVE FAMILY MEMBERS: Asynchronously Animated Around the Cake */}
      <FamilyMembers />

      {/* 7b. FIRST-PERSON INTERACTION HAND: Holding Knife / Serving Slice / Eating */}
      <FirstPersonInteractionHand />

      {/* 8. BACK WALL: Physical Memory Gallery with Curated Frames & Picture Lamps */}
      <MemoryGalleryWall />
      <BirthdayPortrait
        imageSrc={cakePortraitImage}
        framed
        position={[0, 2.55, -13.32]}
        photoHeight={2.95}
      />

      {/* 9. LEFT WALL: Birthday Gift Lounge Area with Interactive Mystery Box */}
      <GiftLoungeArea />

      {/* 10. RIGHT WALL: Party & Music Lounge with Interactive Spinning Turntable */}
      <MusicLoungeArea />

      {/* 11. ROOM HUB DOORS: Architectural Interior Doors Leading to Themed Rooms */}
      <RoomHubDoors />

      {/* 11b. THE THREE THEMED ROOMS ACCESSIBLE THROUGH THE OPENING DOORS */}
      {/* Room 1 (West Door at x = -7.0, z = -4.5): VIP Birthday Gift & Surprise Lounge */}
      <group visible={isWestVisible}>
        <GiftLoungeRoom />
      </group>

      {/* Room 2 (East Door at x = +7.0, z = -4.5): Electric Disco & Dance Party Club Room */}
      <group visible={isEastVisible}>
        <DancePartyRoom />
      </group>

      {/* Room 3 (North Door at x = -5.2, z = -13.5): Memories Gallery */}
      <group visible={isNorthVisible}>
        <StarryTerraceRoom />
      </group>

      {/* 12. Grand Multi-Tiered Chandelier hanging centered above the cake table */}
      <GrandChandelier position={[0, 4.65, -8.0]} />

      {/* 13. Celebration Balloons drifting in the grand ballroom */}
      <GrandRoomBalloons />

      {/* 14. OPULENT PARTY DECOR: Balloon Bouquet Stands, Bunting Garland, Ceiling Ribbons, Urns & Champagne */}
      <BallroomPartyDecorations />

      {/* 15. CAKE CUTTING BACKDROP & SELFIE PHOTO SPOT: Balloon Arch, Fairy Lights, Neon Sign & Flower Runner */}
      <CakeTableSelfieBackdrop />

      {/* Warm celebration doorway fill light pouring into the foyer */}
      <pointLight
        position={[0, 2.0, -1.8]}
        color="#FFA838"
        intensity={0.9}
        distance={4.5}
      />
    </group>
  );
}
