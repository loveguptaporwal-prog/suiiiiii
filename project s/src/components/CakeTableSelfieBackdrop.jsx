import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles } from '@react-three/drei';
import { soundEngine } from '../systems/SoundSystem.js';
import { worldEventBus } from '../systems/WorldEventBus.js';

// Mini 3D Confetti Particle Burst on Balloon Pop
function ArchConfettiBurst({ color, position }) {
  const groupRef = useRef();
  const particles = useMemo(() => {
    const list = [];
    const colors = [color, '#FFD700', '#FFFFFF', '#FF4081', '#00E5FF', '#FF9100'];
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 0.5 + Math.random() * 1.2;
      list.push({
        pos: [0, 0, 0],
        vel: [
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 0.25,
          Math.cos(phi) * speed,
        ],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3],
        rotSpeed: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8],
        size: 0.018 + Math.random() * 0.02,
        c: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return list;
  }, [color]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      p.pos[0] += p.vel[0] * dt;
      p.pos[1] += p.vel[1] * dt;
      p.pos[2] += p.vel[2] * dt;
      p.vel[1] -= 1.6 * dt;
      p.rot[0] += p.rotSpeed[0] * dt;
      child.position.set(p.pos[0], p.pos[1], p.pos[2]);
      child.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
      child.scale.multiplyScalar(0.96);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, idx) => (
        <mesh key={`ap-${idx}`}>
          <planeGeometry args={[p.size * 1.5, p.size * 0.6]} />
          <meshBasicMaterial color={p.c} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// 1. Interactive Poppable Balloon on the Arch
// --------------------------------------------------------------------------
function ArchBalloon({ position, color, scale = 0.28, rot = [0, 0, 0] }) {
  const [popped, setPopped] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const meshRef = useRef();

  const balloonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    metalness: 0.45,
    roughness: 0.16,
    envMapIntensity: 1.8,
  }), [color]);

  const handlePop = (e) => {
    e.stopPropagation();
    if (popped) return;
    soundEngine.playBalloonPop();
    setPopped(true);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 1200);
    setTimeout(() => setPopped(false), 9000); // Re-inflates after 9s
  };

  if (popped) {
    return showBurst ? <ArchConfettiBurst color={color} position={position} /> : null;
  }

  return (
    <group position={position} rotation={rot}>
      <mesh
        ref={meshRef}
        scale={[scale, scale * 1.25, scale]}
        onClick={handlePop}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        castShadow
      >
        <sphereGeometry args={[1, 16, 16]} />
        <primitive object={balloonMat} attach="material" />
      </mesh>
      {/* Specular sheen spot */}
      <mesh position={[scale * 0.28, scale * 0.38, scale * 0.58]} scale={[scale * 0.2, scale * 0.3, scale * 0.1]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>
      {/* Balloon tie knot */}
      <mesh position={[0, -scale * 1.22, 0]} material={balloonMat}>
        <coneGeometry args={[scale * 0.16, scale * 0.18, 8]} />
      </mesh>
    </group>
  );
}

// --------------------------------------------------------------------------
// 2. Organic Multi-Tier Balloon Arch framing the Celebration Table
// (Curves gently over the table from x = -2.6 to x = +2.6, rising up to y = 3.6)
// --------------------------------------------------------------------------
function OrganicCelebrationArch() {
  const balloonData = useMemo(() => {
    const list = [];
    const palette = ['#FF4081', '#F4CF7F', '#FFF8F4', '#D81B60', '#FF80AB', '#FFE082', '#9C27B0'];
    const count = 38;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1); // 0 to 1
      const angle = Math.PI * (1 - t); // PI to 0
      const radiusX = 2.45;
      const radiusY = 2.65;
      const x = Math.cos(angle) * radiusX + (Math.sin(i * 3.5) * 0.12);
      const y = Math.sin(angle) * radiusY + 1.1 + (Math.cos(i * 2.7) * 0.12);
      const z = -10.8 + (Math.sin(i * 1.8) * 0.18);
      const scale = 0.24 + (Math.sin(i * 4.2) * 0.08);
      const color = palette[i % palette.length];
      list.push({ pos: [x, y, z], color, scale });
    }
    return list;
  }, []);

  // Frame structure golden pipe
  const goldPipeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.92,
    roughness: 0.18,
  }), []);

  return (
    <group name="organic-celebration-arch">
      {/* Supporting Slender Golden Arch Frame Guide */}
      {[-2.4, 2.4].map((px, i) => (
        <group key={`arch-post-${i}`} position={[px, 0, -10.8]}>
          <mesh position={[0, 1.3, 0]} material={goldPipeMat}>
            <cylinderGeometry args={[0.018, 0.018, 2.6, 12]} />
          </mesh>
          <mesh position={[0, 0.02, 0]} material={goldPipeMat}>
            <cylinderGeometry args={[0.18, 0.22, 0.04, 16]} />
          </mesh>
        </group>
      ))}

      {/* Array of clustered organic balloons */}
      {balloonData.map((b, idx) => (
        <ArchBalloon key={`ab-${idx}`} position={b.pos} color={b.color} scale={b.scale} />
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// 3. Glowing Neon "Happy Birthday" Script Sign
// --------------------------------------------------------------------------
function NeonHappyBirthdaySign({ position = [0, 3.65, -12.8] }) {
  const signRef = useRef();

  useFrame((state) => {
    if (!signRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle neon shimmer breathe
    const intensity = 0.92 + Math.sin(t * 3.5) * 0.08;
    signRef.current.children.forEach((child) => {
      if (child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = intensity;
      }
    });
  });

  return (
    <group ref={signRef} position={position}>
      {/* Backing Acrylic Plaque with Rose-Gold Trim */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[3.2, 0.8, 0.02]} />
        <meshPhysicalMaterial
          color="#1A0A14"
          transmission={0.85}
          roughness={0.12}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[3.24, 0.84, 0.008]} />
        <meshStandardMaterial color="#D8AF50" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Line 1: "Happy Birthday" script */}
      <Text
        position={[0, 0.13, 0.01]}
        fontSize={0.25}
        color="#FFF0F5"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.06}
      >
        Happy Birthday
      </Text>

      {/* Line 2: Elegant cursive celebration subtitle */}
      <Text
        position={[0, -0.16, 0.01]}
        fontSize={0.17}
        color="#F4CF7F"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.18}
      >
        ✦ SNEHA ✦
      </Text>

      {/* Warm Golden-Pink Neon Glow Light */}
      <pointLight position={[0, 0, 0.35]} color="#FF80AB" intensity={1.2} distance={3.8} />
      <pointLight position={[0, 0, 0.35]} color="#FFD54F" intensity={0.9} distance={2.5} />
    </group>
  );
}

// --------------------------------------------------------------------------
// 4. Fairy Light Curtain with Twinkling LEDs behind the Cutting Table (Instanced)
// --------------------------------------------------------------------------
function TwinklingFairyLightCurtain({ position = [0, 2.5, -13.1] }) {
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#D8AF50' }), []);
  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8E7',
    emissive: '#FFB300',
    emissiveIntensity: 1.8,
    roughness: 0.15,
  }), []);

  const wireGeom = useMemo(() => new THREE.CylinderGeometry(0.002, 0.002, 2.9, 4), []);
  const bulbGeom = useMemo(() => new THREE.SphereGeometry(0.022, 8, 8), []);

  const strands = useMemo(() => {
    const list = [];
    for (let s = -4.5; s <= 4.5; s += 0.9) {
      if (Math.abs(s) >= 2.7) list.push(s);
    }
    return list;
  }, []);

  const wireMeshRef = useRef();
  const bulbMeshRef = useRef();

  useEffect(() => {
    const dummy = new THREE.Object3D();
    if (wireMeshRef.current) {
      strands.forEach((sx, i) => {
        dummy.position.set(sx, 0.4, 0);
        dummy.updateMatrix();
        wireMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      wireMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (bulbMeshRef.current) {
      let idx = 0;
      const bulbYs = [-0.9, -0.5, -0.1, 0.3, 0.7, 1.1, 1.5];
      strands.forEach((sx) => {
        bulbYs.forEach((by) => {
          dummy.position.set(sx, by, 0.008);
          dummy.updateMatrix();
          bulbMeshRef.current.setMatrixAt(idx++, dummy.matrix);
        });
      });
      bulbMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [strands]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    bulbMat.emissiveIntensity = 1.2 + Math.sin(t * 3.2) * 0.8;
  });

  const totalBulbs = strands.length * 7;

  return (
    <group position={position}>
      {/* Top horizontal suspension cord */}
      <mesh position={[0, 1.85, 0]} material={wireMat}>
        <cylinderGeometry args={[0.005, 0.005, 9.4, 8]} rotation={[0, 0, Math.PI / 2]} />
      </mesh>

      {/* Instanced vertical wires (1 draw call instead of 11) */}
      <instancedMesh
        ref={wireMeshRef}
        args={[wireGeom, wireMat, strands.length]}
      />

      {/* Instanced twinkling LED micro-bulbs (1 draw call instead of 77) */}
      <instancedMesh
        ref={bulbMeshRef}
        args={[bulbGeom, bulbMat, totalBulbs]}
      />
    </group>
  );
}

// --------------------------------------------------------------------------
// 5. Deluxe Fresh Flower Garland Spanning the Table Back Edge (Instanced)
// --------------------------------------------------------------------------
function TableRunnerFlowerGarland({ position = [0, 0.885, -8.7] }) {
  const foliageMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2E7D32',
    roughness: 0.65,
  }), []);

  const pinkRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF4081',
    roughness: 0.4,
  }), []);

  const creamRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8F2',
    roughness: 0.45,
  }), []);

  const goldEucalyptusMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.8,
    roughness: 0.25,
  }), []);

  const roseGeom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.045, 10, 10);
    g.scale(1, 0.8, 1);
    return g;
  }, []);

  const eucGeom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.032, 8, 8);
    g.scale(1.2, 0.3, 1);
    return g;
  }, []);

  const foliageGeom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.035, 8, 8);
    g.scale(1.2, 0.3, 1);
    return g;
  }, []);

  const clusterXs = useMemo(() => [-1.4, -1.0, -0.6, -0.2, 0.2, 0.6, 1.0, 1.4], []);
  const pinkRef = useRef();
  const creamRef = useRef();
  const eucRef = useRef();
  const folRef = useRef();

  useEffect(() => {
    const dummy = new THREE.Object3D();
    let pinkIdx = 0;
    let creamIdx = 0;

    clusterXs.forEach((bx, i) => {
      // Rose
      dummy.position.set(bx, 0.05, 0.02);
      dummy.updateMatrix();
      if (i % 2 === 0) {
        if (pinkRef.current) pinkRef.current.setMatrixAt(pinkIdx++, dummy.matrix);
      } else {
        if (creamRef.current) creamRef.current.setMatrixAt(creamIdx++, dummy.matrix);
      }

      // Eucalyptus
      dummy.position.set(bx - 0.05, 0.04, -0.02);
      dummy.updateMatrix();
      if (eucRef.current) eucRef.current.setMatrixAt(i, dummy.matrix);

      // Foliage
      dummy.position.set(bx + 0.05, 0.04, 0.02);
      dummy.updateMatrix();
      if (folRef.current) folRef.current.setMatrixAt(i, dummy.matrix);
    });

    if (pinkRef.current) pinkRef.current.instanceMatrix.needsUpdate = true;
    if (creamRef.current) creamRef.current.instanceMatrix.needsUpdate = true;
    if (eucRef.current) eucRef.current.instanceMatrix.needsUpdate = true;
    if (folRef.current) folRef.current.instanceMatrix.needsUpdate = true;
  }, [clusterXs]);

  return (
    <group position={position}>
      {/* Instanced pink and cream roses (2 draw calls instead of 8) */}
      <instancedMesh ref={pinkRef} args={[roseGeom, pinkRoseMat, 4]} castShadow />
      <instancedMesh ref={creamRef} args={[roseGeom, creamRoseMat, 4]} castShadow />

      {/* Instanced eucalyptus and foliage sprigs (2 draw calls instead of 16) */}
      <instancedMesh ref={eucRef} args={[eucGeom, goldEucalyptusMat, 8]} />
      <instancedMesh ref={folRef} args={[foliageGeom, foliageMat, 8]} />
    </group>
  );
}

// --------------------------------------------------------------------------
// 6. Selfie Photo Spot Indicator on Floor
// --------------------------------------------------------------------------
function SelfieSpotFloorDecal({ position = [0, 0.005, -9.2] }) {
  const goldDecalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.9,
    roughness: 0.2,
  }), []);

  const rubyDecalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1032',
    roughness: 0.6,
  }), []);

  return (
    <group position={position}>
      {/* Outer Golden Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={goldDecalMat}>
        <ringGeometry args={[0.55, 0.60, 36]} />
      </mesh>
      {/* Ruby Inner Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={rubyDecalMat}>
        <circleGeometry args={[0.54, 36]} />
      </mesh>
      {/* Camera Icon Ring */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldDecalMat}>
        <ringGeometry args={[0.22, 0.25, 24]} />
      </mesh>
      {/* Text Label */}
      <Text
        position={[0, 0.004, 0.32]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.065}
        color="#FFF9F5"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.12}
      >
        ✦ BEST PHOTO SPOT ✦
      </Text>
      <Text
        position={[0, 0.004, -0.32]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.055}
        color="#F4CF7F"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        SMILE FOR MEMORIES
      </Text>
    </group>
  );
}

// --------------------------------------------------------------------------
// 7. VIP Celebrity Stage Cold Spark Gerb Fountains flanking Cake Table
// --------------------------------------------------------------------------
function StageColdSparks({ position = [-2.2, 0, -8.0] }) {
  const [active, setActive] = useState(false);
  const sparkLightRef = useRef();

  useEffect(() => {
    const unsubs = [];
    unsubs.push(worldEventBus.on('CANDLES_LIT', () => setActive(true)));
    unsubs.push(worldEventBus.on('CANDLES_BLOWN', () => {
      setActive(true);
      setTimeout(() => setActive(false), 12000);
    }));
    return () => unsubs.forEach((u) => u && u());
  }, []);

  const machineMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1A181B',
    metalness: 0.85,
    roughness: 0.25,
  }), []);

  const goldRingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37',
    metalness: 0.9,
    roughness: 0.18,
  }), []);

  return (
    <group position={position}>
      {/* Heavy Stage Gerb Machine Housing */}
      <mesh position={[0, 0.18, 0]} castShadow material={machineMat}>
        <boxGeometry args={[0.32, 0.36, 0.32]} />
      </mesh>
      {/* Top Gilded Discharge Nozzle Ring */}
      <mesh position={[0, 0.365, 0]} material={goldRingMat}>
        <cylinderGeometry args={[0.07, 0.08, 0.03, 16]} />
      </mesh>

      {/* Dynamic Golden Cold Spark Fountain */}
      {active && (
        <group position={[0, 0.40, 0]}>
          <Sparkles
            count={60}
            scale={[0.4, 2.8, 0.4]}
            size={3.8}
            speed={2.2}
            color="#FFE082"
            opacity={0.9}
          />
          <pointLight
            ref={sparkLightRef}
            position={[0, 1.2, 0]}
            color="#FFD54F"
            intensity={2.2}
            distance={5.0}
          />
        </group>
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// MAIN EXPORT: CakeTableSelfieBackdrop
// Seamlessly brings luxury real-world birthday event design to the cake table & back wall
// --------------------------------------------------------------------------
export function CakeTableSelfieBackdrop() {
  return (
    <group name="cake-table-selfie-backdrop">
      {/* 1. Organic Balloon Arch framing the cake table */}
      <OrganicCelebrationArch />

      {/* 2. Neon "Happy Birthday" Illuminated Sign above the table */}
      <NeonHappyBirthdaySign position={[0, 4.76, -12.4]} />

      {/* 3. Twinkling Fairy Light Curtain across the back wall */}
      <TwinklingFairyLightCurtain position={[0, 2.7, -13.38]} />

      {/* 4. Luxury Flower Garland along the table back edge */}
      <TableRunnerFlowerGarland position={[0, 0.885, -8.65]} />

      {/* 5. Interactive "Best Photo Spot" Decal where user stands to cut cake */}
      <SelfieSpotFloorDecal position={[0, 0.005, -9.15]} />

      {/* 6. Dual VIP Stage Cold-Spark Gerb Fountains flanking table */}
      <StageColdSparks position={[-2.2, 0, -8.0]} />
      <StageColdSparks position={[2.2, 0, -8.0]} />

      {/* 7. Dreamy golden ambient sparkles around the selfie backdrop */}
      <group position={[0, 2.6, -10.5]}>
        <Sparkles count={40} scale={[5.0, 3.0, 3.0]} size={3.0} speed={0.5} color="#FFD54F" opacity={0.7} />
        <Sparkles count={25} scale={[4.0, 2.5, 2.5]} size={2.5} speed={0.6} color="#FF80AB" opacity={0.6} />
      </group>
    </group>
  );
}
