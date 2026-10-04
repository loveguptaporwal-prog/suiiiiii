import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { worldEventBus } from '../systems/WorldEventBus.js';

// --------------------------------------------------------------------------
// Interactive 3D Vintage Vinyl Turntable
// Clicking swings the tonearm onto the record, starts spinning, and emits musical glow
// --------------------------------------------------------------------------
function InteractiveTurntable({ position = [0, 0.88, 0] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const vinylRef = useRef();
  const tonearmRef = useRef();
  const notesRef = useRef();

  const woodCaseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#422216', // Rich walnut case
    roughness: 0.38,
    metalness: 0.05,
  }), []);

  const brassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.90,
    roughness: 0.18,
  }), []);

  const vinylMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1A181B', // Deep black vinyl with grooved sheen
    roughness: 0.28,
    metalness: 0.40,
  }), []);

  const labelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D81B60', // Ruby center record label
    roughness: 0.5,
  }), []);

  const tubeGlowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFE2B8',
    emissive: '#FF9100',
    emissiveIntensity: 2.8,
    roughness: 0.1,
  }), []);

  useFrame((state, delta) => {
    // Spin vinyl when playing
    if (vinylRef.current && isPlaying) {
      vinylRef.current.rotation.y += delta * 3.2;
    }
    // Smooth tonearm transition
    if (tonearmRef.current) {
      const targetRotY = isPlaying ? 0.42 : 0.0;
      tonearmRef.current.rotation.y = THREE.MathUtils.lerp(
        tonearmRef.current.rotation.y,
        targetRotY,
        1 - Math.exp(-6 * delta)
      );
    }
    // Floating music particles
    if (notesRef.current && isPlaying) {
      notesRef.current.rotation.y += delta * 0.8;
      notesRef.current.position.y = 0.35 + Math.sin(state.clock.getElapsedTime() * 2.0) * 0.04;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    worldEventBus.triggerInteractionPipeline('vintage_turntable', 'toggle_play', { isPlaying: !isPlaying });
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
      {/* Turntable Plinth / Wood Chassis */}
      <mesh castShadow receiveShadow material={woodCaseMat}>
        <boxGeometry args={[0.56, 0.08, 0.44]} />
      </mesh>
      {/* Brass Edge Bezel */}
      <mesh position={[0, 0.041, 0]} material={brassMat}>
        <boxGeometry args={[0.54, 0.005, 0.42]} />
      </mesh>

      {/* Rotating Aluminum Platter & Vinyl Record */}
      <group position={[-0.08, 0.05, 0]}>
        {/* Metal Platter */}
        <mesh material={brassMat}>
          <cylinderGeometry args={[0.18, 0.18, 0.015, 32]} />
        </mesh>
        {/* Spinning Vinyl Record Disc */}
        <group ref={vinylRef} position={[0, 0.009, 0]}>
          <mesh castShadow material={vinylMat}>
            <cylinderGeometry args={[0.175, 0.175, 0.004, 36]} />
          </mesh>
          {/* Ruby Record Center Label */}
          <mesh position={[0, 0.003, 0]} material={labelMat}>
            <cylinderGeometry args={[0.065, 0.065, 0.002, 24]} />
          </mesh>
          {/* Spindle */}
          <mesh position={[0, 0.01, 0]} material={brassMat}>
            <cylinderGeometry args={[0.006, 0.006, 0.02, 10]} />
          </mesh>
        </group>
      </group>

      {/* Pivoting Tonearm Base & Arm */}
      <group position={[0.18, 0.06, -0.12]}>
        {/* Gimbal Pivot Base */}
        <mesh material={brassMat}>
          <cylinderGeometry args={[0.022, 0.025, 0.03, 16]} />
        </mesh>
        {/* Rotating Arm Assembly */}
        <group ref={tonearmRef}>
          {/* Counterweight */}
          <mesh position={[0, 0.018, -0.04]} material={brassMat}>
            <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Arm Wand */}
          <mesh position={[-0.08, 0.018, 0.06]} rotation={[0, 0.45, 0]} material={brassMat}>
            <cylinderGeometry args={[0.004, 0.004, 0.20, 8]} rotation={[0, 0, Math.PI / 2]} />
          </mesh>
          {/* Cartridge & Stylus Head */}
          <mesh position={[-0.14, 0.012, 0.14]} material={brassMat}>
            <boxGeometry args={[0.018, 0.015, 0.03]} />
          </mesh>
        </group>
      </group>

      {/* Glowing Amplifier Vacuum Tubes (retro audiophile warmth) */}
      <group position={[0.18, 0.06, 0.10]}>
        {[-0.03, 0.03].map((tx, idx) => (
          <group key={idx} position={[tx, 0, 0]}>
            <mesh material={brassMat}>
              <cylinderGeometry args={[0.016, 0.016, 0.01, 12]} />
            </mesh>
            <mesh position={[0, 0.03, 0]} material={tubeGlowMat}>
              <cylinderGeometry args={[0.012, 0.012, 0.05, 12]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Floating Music Notes / Celebration Glow when playing */}
      {isPlaying && (
        <group ref={notesRef} position={[0, 0.35, 0]}>
          {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.28, Math.sin(angle * 2) * 0.08, Math.sin(angle) * 0.28]}
              material={brassMat}
            >
              <torusGeometry args={[0.024, 0.005, 6, 12]} />
            </mesh>
          ))}
          <pointLight
            position={[0, 0.2, 0]}
            color="#FFD54F"
            intensity={0.8}
            distance={2.0}
          />
        </group>
      )}

      {/* Hover prompt hint */}
      {isHovered && !isPlaying && (
        <pointLight
          position={[0, 0.2, 0]}
          color="#FFE0B2"
          intensity={0.25}
          distance={0.8}
        />
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// Main Component: MusicLoungeArea (Right Wall at x = 6.85, z = -8.0)
// --------------------------------------------------------------------------
export function MusicLoungeArea() {
  const consoleWoodMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3E1C12', // Dark mid-century rosewood
    roughness: 0.35,
    metalness: 0.04,
  }), []);

  const goldBrassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.88,
    roughness: 0.20,
  }), []);

  const velvetArmchairMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1438', // Deep royal ruby velvet armchair
    roughness: 0.72,
    metalness: 0.02,
  }), []);

  const blankFrameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#B78A3D',
    metalness: 0.62,
    roughness: 0.32,
  }), []);

  const blankCanvasMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4EBDD',
    roughness: 0.82,
  }), []);

  const recordJacketColors = ['#D81B60', '#3949AB', '#00897B', '#FDD835', '#FB8C00'];

  return (
    <group position={[6.55, 0, -8.0]} rotation={[0, -Math.PI / 2, 0]} name="music-lounge-area">
      <group position={[0, 2.65, -0.42]} name="blank-music-lounge-wall-frame">
        <mesh position={[0, 0, -0.01]} castShadow receiveShadow material={blankFrameMat}>
          <boxGeometry args={[1.72, 2.32, 0.08]} />
        </mesh>
        <mesh position={[0, 0, 0.032]} material={blankCanvasMat}>
          <planeGeometry args={[1.48, 2.08]} />
        </mesh>
        {[
          [0, 1.09, 1.72, 0.12],
          [0, -1.09, 1.72, 0.12],
          [-0.80, 0, 0.12, 2.08],
          [0.80, 0, 0.12, 2.08],
        ].map(([x, y, width, height], index) => (
          <mesh
            key={`blank-frame-rail-${index}`}
            position={[x, y, 0.055]}
            castShadow
            material={blankFrameMat}
          >
            <boxGeometry args={[width, height, 0.10]} />
          </mesh>
        ))}
      </group>

      {/* 1. Vintage Mid-Century Audio Credenza (2.4m long x 0.65m deep x 0.82m high) */}
      <group position={[0, 0, 0]}>
        {/* Tabletop */}
        <mesh position={[0, 0.82, 0]} castShadow receiveShadow material={consoleWoodMat}>
          <boxGeometry args={[2.4, 0.04, 0.65]} />
        </mesh>
        {/* Cabinet Body with Speaker Fabric Grille */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow material={consoleWoodMat}>
          <boxGeometry args={[2.34, 0.72, 0.60]} />
        </mesh>
        {/* Left & Right Speaker Grilles (vintage acoustic weave) */}
        {[-0.75, 0.75].map((gx, i) => (
          <mesh key={`grille-${i}`} position={[gx, 0.44, 0.305]}>
            <boxGeometry args={[0.60, 0.58, 0.005]} />
            <meshStandardMaterial color="#E8D5B5" roughness={0.8} />
          </mesh>
        ))}
        {/* Tapered brass legs */}
        {[
          [-1.1, -0.24],
          [1.1, -0.24],
          [-1.1, 0.24],
          [1.1, 0.24],
        ].map(([lx, lz], i) => (
          <mesh key={`leg-${i}`} position={[lx, 0.06, lz]} material={goldBrassMat}>
            <cylinderGeometry args={[0.016, 0.010, 0.12, 10]} />
          </mesh>
        ))}
      </group>

      {/* 2. HERO INTERACTIVE OBJECT: The Vintage Turntable on the console */}
      <InteractiveTurntable position={[-0.45, 0.86, 0]} />

      {/* 3. Wood Crate of Vintage Vinyl Record Jackets */}
      <group position={[0.62, 0.84, 0]}>
        {/* Crate sides */}
        <mesh position={[0, 0.08, 0]} material={consoleWoodMat}>
          <boxGeometry args={[0.38, 0.16, 0.34]} />
        </mesh>
        {/* Leaning vinyl jackets inside crate */}
        {[-0.10, -0.05, 0, 0.05, 0.10].map((jx, i) => (
          <mesh
            key={`jacket-${i}`}
            position={[jx, 0.14, 0]}
            rotation={[0, 0, -0.15]}
            castShadow
          >
            <boxGeometry args={[0.012, 0.28, 0.28]} />
            <meshStandardMaterial color={recordJacketColors[i % recordJacketColors.length]} roughness={0.45} />
          </mesh>
        ))}
      </group>

      {/* 4. Luxury Tufted Velvet Armchair in Music Corner */}
      <group position={[1.85, 0, 0.35]} rotation={[0, -0.35, 0]}>
        {/* Seat Cushion */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow material={velvetArmchairMat}>
          <boxGeometry args={[0.82, 0.22, 0.78]} />
        </mesh>
        {/* Tufted Backrest */}
        <mesh position={[0, 0.82, -0.32]} rotation={[-0.12, 0, 0]} castShadow material={velvetArmchairMat}>
          <boxGeometry args={[0.82, 0.65, 0.22]} />
        </mesh>
        {/* Left Armrest */}
        <mesh position={[-0.42, 0.60, 0]} castShadow material={velvetArmchairMat}>
          <boxGeometry args={[0.16, 0.32, 0.76]} />
        </mesh>
        {/* Right Armrest */}
        <mesh position={[0.42, 0.60, 0]} castShadow material={velvetArmchairMat}>
          <boxGeometry args={[0.16, 0.32, 0.76]} />
        </mesh>
        {/* Gold Tapered Chair Feet */}
        {[
          [-0.34, -0.30],
          [0.34, -0.30],
          [-0.34, 0.30],
          [0.34, 0.30],
        ].map(([cx, cz], i) => (
          <mesh key={`chair-foot-${i}`} position={[cx, 0.12, cz]} material={goldBrassMat}>
            <cylinderGeometry args={[0.02, 0.012, 0.24, 10]} />
          </mesh>
        ))}
      </group>

      {/* 5. Vintage Floor Reading / Music Mood Lamp */}
      <group position={[1.15, 0, -0.45]}>
        {/* Heavy brass round base */}
        <mesh position={[0, 0.02, 0]} material={goldBrassMat}>
          <cylinderGeometry args={[0.18, 0.20, 0.04, 20]} />
        </mesh>
        {/* Slender stem pole */}
        <mesh position={[0, 0.95, 0]} material={goldBrassMat}>
          <cylinderGeometry args={[0.014, 0.014, 1.86, 12]} />
        </mesh>
        {/* Flared fabric shade */}
        <mesh position={[0, 1.88, 0]} castShadow>
          <coneGeometry args={[0.24, 0.28, 20, 1, true]} />
          <meshStandardMaterial color="#FFF8E7" roughness={0.6} />
        </mesh>
        {/* Warm lamp glow pool */}
        <pointLight
          position={[0, 1.80, 0]}
          color="#FFA726"
          intensity={1.1}
          distance={3.2}
        />
      </group>
    </group>
  );
}
