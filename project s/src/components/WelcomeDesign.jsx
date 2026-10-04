import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { birthdayData } from '../data/birthdayData.js';

// --------------------------------------------------------------------------
// 1. Luxury Velvet & Gold "WELCOME" Threshold Entrance Mat
// Placed on the red carpet runner right in front of the gate doors
// --------------------------------------------------------------------------
function WelcomeEntranceMat({ position = [0, 0.008, 1.05] }) {
  const velvetMatMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#7F0E2A', // Deep royal ruby velvet
    roughness: 0.78,
    metalness: 0.02,
  }), []);

  const goldTrimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.90,
    roughness: 0.20,
  }), []);

  const innerPanelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#650A20', // Slightly deeper recessed field
    roughness: 0.82,
    metalness: 0.02,
  }), []);

  return (
    <group position={position}>
      {/* Main Velvet Mat Base (1.34m wide x 0.64m deep) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={velvetMatMaterial}>
        <planeGeometry args={[1.34, 0.64]} />
      </mesh>

      {/* Raised Gold Braided Border (outer rim) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldTrimMaterial}>
        {/* Top & bottom borders */}
        <planeGeometry args={[1.36, 0.66]} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={velvetMatMaterial}>
        <planeGeometry args={[1.30, 0.60]} />
      </mesh>

      {/* Inner Recessed Center Velvet Field */}
      <mesh position={[0, 0.0025, 0]} rotation={[-Math.PI / 2, 0, 0]} material={innerPanelMaterial}>
        <planeGeometry args={[1.22, 0.52]} />
      </mesh>

      {/* Fine Inner Gilded Filigree Pinstripe */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldTrimMaterial}>
        <planeGeometry args={[1.16, 0.46]} />
      </mesh>
      <mesh position={[0, 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]} material={innerPanelMaterial}>
        <planeGeometry args={[1.13, 0.43]} />
      </mesh>

      {/* Four Gilded Classical Corner Scroll Accents */}
      {[
        [-0.56, -0.21],
        [0.56, -0.21],
        [-0.56, 0.21],
        [0.56, 0.21],
      ].map(([cx, cz], i) => (
        <group key={`mat-corner-${i}`} position={[cx, 0.004, cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh material={goldTrimMaterial}>
            <torusGeometry args={[0.035, 0.006, 8, 16]} />
          </mesh>
          <mesh position={[0, 0, 0]} material={goldTrimMaterial}>
            <circleGeometry args={[0.012, 12]} />
          </mesh>
        </group>
      ))}

      {/* Embossed Gold Lettering: ✦ WELCOME ✦ */}
      <Text
        position={[0, 0.0045, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.115}
        letterSpacing={0.22}
        color="#FCE19C"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.006}
        outlineColor="#4A0617"
      >
        ✦ WELCOME ✦
      </Text>

      {/* Subtle Laurel Sprig Accents flanking the welcome text */}
      {[-0.42, 0.42].map((lx, i) => (
        <group key={`mat-laurel-${i}`} position={[lx, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh material={goldTrimMaterial}>
            <torusGeometry args={[0.045, 0.004, 6, 16, Math.PI * 0.9]} />
          </mesh>
          <mesh position={[lx > 0 ? -0.025 : 0.025, 0.02, 0]} material={goldTrimMaterial}>
            <circleGeometry args={[0.008, 8]} />
          </mesh>
          <mesh position={[lx > 0 ? -0.025 : 0.025, -0.02, 0]} material={goldTrimMaterial}>
            <circleGeometry args={[0.008, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// 2. Real-Life Luxury Birthday Welcome Easel Stand
// An authentic standing brass/gilded artist easel holding a framed sign with
// fresh roses, eucalyptus leaves, satin ribbon, and warm gallery lighting
// --------------------------------------------------------------------------
function WelcomeEaselStand({
  position = [1.32, 0, 1.45],
  rotation = [0, -0.38, 0],
  name = birthdayData.name,
}) {
  const brassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.88,
    roughness: 0.22,
  }), []);

  const goldFrameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8C172',
    metalness: 0.85,
    roughness: 0.25,
  }), []);

  const boardCanvasMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF9', // Fine warm linen/parchment canvas
    roughness: 0.48,
    metalness: 0.02,
  }), []);

  const blushRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF8CA3',
    roughness: 0.40,
    metalness: 0.04,
  }), []);

  const creamRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8F2',
    roughness: 0.38,
    metalness: 0.02,
  }), []);

  const rubyRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D81B60',
    roughness: 0.36,
    metalness: 0.04,
  }), []);

  const eucalyptusMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#557252', // Soft eucalyptus sage green
    roughness: 0.52,
    metalness: 0.02,
  }), []);

  const satinRibbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C2185B', // Ruby-pink satin ribbon
    roughness: 0.32,
    metalness: 0.22,
  }), []);

  return (
    <group position={position} rotation={rotation}>
      {/* --- A. Tripod Brass Easel Legs --- */}
      {/* Front Left Leg */}
      <mesh position={[-0.26, 0.76, 0.12]} rotation={[0.10, 0, -0.16]} castShadow material={brassMaterial}>
        <cylinderGeometry args={[0.014, 0.016, 1.58, 12]} />
      </mesh>
      {/* Front Right Leg */}
      <mesh position={[0.26, 0.76, 0.12]} rotation={[0.10, 0, 0.16]} castShadow material={brassMaterial}>
        <cylinderGeometry args={[0.014, 0.016, 1.58, 12]} />
      </mesh>
      {/* Rear Support Strut Leg */}
      <mesh position={[0, 0.74, -0.32]} rotation={[-0.32, 0, 0]} castShadow material={brassMaterial}>
        <cylinderGeometry args={[0.014, 0.016, 1.56, 12]} />
      </mesh>

      {/* Top Hinge Finial */}
      <mesh position={[0, 1.52, 0.02]} castShadow material={brassMaterial}>
        <sphereGeometry args={[0.032, 16, 16]} />
      </mesh>

      {/* Horizontal Picture Support Shelf / Crossbar at y = 0.70 */}
      <mesh position={[0, 0.70, 0.12]} castShadow material={brassMaterial}>
        <boxGeometry args={[0.74, 0.035, 0.07]} />
      </mesh>
      {/* Brass pegs locking the frame */}
      <mesh position={[-0.32, 0.73, 0.15]} material={brassMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
      </mesh>
      <mesh position={[0.32, 0.73, 0.15]} material={brassMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
      </mesh>

      {/* --- B. Ornate Gilded Framed Welcome Board --- */}
      {/* Positioned on the shelf at y = 1.10, tilted back ~8 degrees */}
      <group position={[0, 1.12, 0.13]} rotation={[-0.14, 0, 0]}>
        {/* Outer Baroque Gilded Picture Frame (0.64m wide x 0.82m high) */}
        <mesh castShadow receiveShadow material={goldFrameMaterial}>
          <boxGeometry args={[0.64, 0.82, 0.03]} />
        </mesh>
        {/* Inner Molded Reveal */}
        <mesh position={[0, 0, 0.014]} material={goldFrameMaterial}>
          <boxGeometry args={[0.60, 0.78, 0.01]} />
        </mesh>
        {/* Parchment / Canvas Inner Face */}
        <mesh position={[0, 0, 0.018]} material={boardCanvasMaterial}>
          <boxGeometry args={[0.54, 0.72, 0.006]} />
        </mesh>

        {/* Fine Gilded Pinstripe Inner Border on Canvas */}
        <mesh position={[0, 0, 0.022]} material={goldFrameMaterial}>
          <boxGeometry args={[0.49, 0.67, 0.002]} />
        </mesh>
        <mesh position={[0, 0, 0.023]} material={boardCanvasMaterial}>
          <boxGeometry args={[0.47, 0.65, 0.002]} />
        </mesh>

        {/* --- Calligraphic Welcome Board Typography --- */}
        {/* Line 1: Header */}
        <Text
          position={[0, 0.24, 0.026]}
          fontSize={0.046}
          letterSpacing={0.16}
          color="#D81B60"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          ✦ WELCOME ✦
        </Text>

        {/* Line 2: Subtitle */}
        <Text
          position={[0, 0.16, 0.026]}
          fontSize={0.028}
          letterSpacing={0.14}
          color="#6D4A52"
          anchorX="center"
          anchorY="middle"
        >
          TO THE BIRTHDAY CELEBRATION OF
        </Text>

        {/* Line 3: Honoree Name with Rich Ruby Velvet & Gold Highlight */}
        <group position={[0, 0.06, 0.026]}>
          <mesh position={[0, 0, -0.002]} material={goldFrameMaterial}>
            <boxGeometry args={[0.38, 0.09, 0.002]} />
          </mesh>
          <mesh position={[0, 0, -0.001]}>
            <boxGeometry args={[0.36, 0.074, 0.002]} />
            <meshStandardMaterial color="#8A1438" roughness={0.5} />
          </mesh>
          <Text
            position={[0, 0, 0.003]}
            fontSize={0.054}
            letterSpacing={0.18}
            color="#FFF8F2"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0.003}
            outlineColor="#4A0617"
          >
            {name}
          </Text>
        </group>

        {/* Line 4: Decorative Divider Flourish */}
        <group position={[0, -0.03, 0.026]}>
          <mesh material={goldFrameMaterial}>
            <boxGeometry args={[0.24, 0.004, 0.002]} />
          </mesh>
          <mesh position={[0, 0, 0.001]} material={goldFrameMaterial}>
            <sphereGeometry args={[0.008, 8, 8]} />
          </mesh>
        </group>

        {/* Line 5: Romantic Hospitality Tagline */}
        <Text
          position={[0, -0.11, 0.026]}
          fontSize={0.026}
          letterSpacing={0.12}
          color="#7A4E58"
          anchorX="center"
          anchorY="middle"
        >
          ENTER & CELEBRATE
        </Text>
        <Text
          position={[0, -0.18, 0.026]}
          fontSize={0.022}
          letterSpacing={0.10}
          color="#A86B79"
          anchorX="center"
          anchorY="middle"
        >
          A NIGHT TO REMEMBER
        </Text>

        {/* --- C. Lush Hand-Arranged Floral Spray on Top-Left Corner --- */}
        <group position={[-0.27, 0.38, 0.035]}>
          {/* Eucalyptus Leaf Sprays */}
          {[
            { pos: [-0.08, 0.06, 0.01], rot: [0.1, 0.2, 0.8] },
            { pos: [-0.04, 0.09, 0.01], rot: [-0.2, 0.1, 1.1] },
            { pos: [0.06, 0.07, 0.01], rot: [0.2, -0.1, -0.4] },
            { pos: [-0.09, -0.05, 0.01], rot: [0.1, 0.1, 2.2] },
          ].map((leaf, idx) => (
            <mesh key={`leaf-${idx}`} position={leaf.pos} rotation={leaf.rot} material={eucalyptusMat}>
              <boxGeometry args={[0.04, 0.09, 0.004]} />
            </mesh>
          ))}

          {/* Fresh Rose Cluster */}
          <mesh position={[0, 0.01, 0.025]} castShadow material={blushRoseMat}>
            <sphereGeometry args={[0.042, 14, 14]} />
          </mesh>
          <mesh position={[-0.05, 0.03, 0.02]} castShadow material={creamRoseMat}>
            <sphereGeometry args={[0.036, 12, 12]} />
          </mesh>
          <mesh position={[0.05, -0.01, 0.02]} castShadow material={rubyRoseMat}>
            <sphereGeometry args={[0.034, 12, 12]} />
          </mesh>
          <mesh position={[-0.02, -0.04, 0.022]} castShadow material={blushRoseMat}>
            <sphereGeometry args={[0.032, 12, 12]} />
          </mesh>

          {/* Satin Ribbon Knot & Cascading Tails */}
          <mesh position={[0.02, -0.06, 0.028]} material={satinRibbonMat}>
            <sphereGeometry args={[0.016, 10, 10]} />
          </mesh>
          <mesh position={[0.01, -0.12, 0.026]} rotation={[0.1, 0, 0.15]} material={satinRibbonMat}>
            <boxGeometry args={[0.018, 0.11, 0.003]} />
          </mesh>
          <mesh position={[0.035, -0.10, 0.027]} rotation={[-0.1, 0, -0.22]} material={satinRibbonMat}>
            <boxGeometry args={[0.018, 0.09, 0.003]} />
          </mesh>
        </group>

        {/* Soft, gentle gallery illumination on the welcome sign */}
        <pointLight
          position={[0, 0.15, 0.35]}
          color="#FFE9CA"
          intensity={0.32}
          distance={1.6}
        />
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// 3. Scattered Fresh Rose Petals on the Carpet
// Authentic scattered celebratory rose petals along the red carpet runner
// --------------------------------------------------------------------------
function ScatteredRosePetals() {
  const petals = useMemo(() => {
    const list = [];
    const colors = ['#9C1A42', '#D81B60', '#FF8CA3', '#FFF5EB', '#C2185B'];
    // 32 naturally scattered petals
    const rawData = [
      // Left side of carpet runner
      [-0.68, 0.85, 0.4],
      [-0.58, 1.15, 1.2],
      [-0.72, 1.45, 2.1],
      [-0.62, 1.80, 0.8],
      [-0.70, 2.20, 2.7],
      [-0.56, 2.65, 1.5],
      [-0.66, 3.10, 3.1],
      [-0.60, 3.55, 0.6],
      // Right side of carpet runner
      [0.64, 0.88, 1.8],
      [0.72, 1.18, 0.3],
      [0.58, 1.52, 2.4],
      [0.68, 1.95, 1.1],
      [0.62, 2.38, 2.9],
      [0.74, 2.82, 0.9],
      [0.60, 3.25, 2.2],
      [0.66, 3.70, 1.4],
      // Near base of Welcome Easel & Gift clusters
      [0.98, 1.35, 1.7],
      [1.12, 1.55, 0.5],
      [1.24, 1.25, 2.8],
      [1.05, 1.68, 1.3],
      [-0.92, 1.10, 2.0],
      [-1.15, 1.30, 0.9],
      // Threshold scattering in front of doors
      [-0.32, 0.65, 0.7],
      [0.28, 0.62, 2.5],
      [-0.15, 0.55, 1.9],
      [0.18, 0.52, 0.4],
    ];

    rawData.forEach(([x, z, r], i) => {
      list.push({
        pos: [x, 0.007, z],
        rot: [-Math.PI / 2, 0, r],
        color: colors[i % colors.length],
        scale: 0.85 + (i % 4) * 0.12,
      });
    });

    return list;
  }, []);

  return (
    <group name="scattered-rose-petals">
      {petals.map((p, idx) => (
        <mesh
          key={idx}
          position={p.pos}
          rotation={p.rot}
          scale={p.scale}
        >
          <circleGeometry args={[0.032, 7]} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// Main Composite Component: WelcomeDesign
// Combines the Threshold Mat, Luxury Easel Stand, and Scattered Petals
// --------------------------------------------------------------------------
export function WelcomeDesign({ name = birthdayData.name }) {
  return (
    <group name="welcome-design-near-gate">
      {/* 1. Luxury Embroidered Velvet & Gold "✦ WELCOME ✦" Threshold Mat */}
      <WelcomeEntranceMat position={[0, 0.008, 0.95]} />

      {/* 2. Real-Life Luxury Birthday Welcome Easel Stand with Flowers */}
      <WelcomeEaselStand
        position={[1.28, 0, 1.42]}
        rotation={[0, -0.38, 0]}
        name={name}
      />

      {/* 3. Fresh Scattered Celebratory Rose Petals */}
      <ScatteredRosePetals />
    </group>
  );
}
