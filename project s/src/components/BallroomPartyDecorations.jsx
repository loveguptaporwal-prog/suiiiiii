import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles, Float } from '@react-three/drei';
import { soundEngine } from '../systems/SoundSystem.js';

// --------------------------------------------------------------------------
// 1. Confetti Burst Spawner for Popped Balloons
// --------------------------------------------------------------------------
function MiniConfettiBurst({ color, position }) {
  const groupRef = useRef();
  const particles = useMemo(() => {
    const list = [];
    const colors = [color, '#FFD700', '#FFFFFF', '#FF4081', '#00E5FF', '#FF9100'];
    for (let i = 0; i < 24; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 0.6 + Math.random() * 1.4;
      list.push({
        pos: [0, 0, 0],
        vel: [
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 0.3,
          Math.cos(phi) * speed,
        ],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3],
        rotSpeed: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10],
        size: 0.02 + Math.random() * 0.025,
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
      p.vel[1] -= 1.8 * dt; // gentle gravity
      p.rot[0] += p.rotSpeed[0] * dt;
      child.position.set(p.pos[0], p.pos[1], p.pos[2]);
      child.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
      child.scale.multiplyScalar(0.96);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, idx) => (
        <mesh key={`p-${idx}`}>
          <planeGeometry args={[p.size * 1.5, p.size * 0.6]} />
          <meshBasicMaterial color={p.c} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// 2. Interactive Teardrop Balloon with Wavy String & Click-to-Blast
// --------------------------------------------------------------------------
function InteractiveDecorBalloon({
  position = [0, 2, 0],
  color = '#FF4081',
  scale = 0.38,
  stringLength = 1.1,
  swaySpeed = 0.7,
  swayOffset = 0,
}) {
  const [popped, setPopped] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current || popped) return;
    const t = state.clock.getElapsedTime() * swaySpeed + swayOffset;
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.05;
    groupRef.current.position.x = position[0] + Math.cos(t * 0.65) * 0.03;
    groupRef.current.rotation.z = Math.cos(t * 0.8) * 0.06;
    groupRef.current.rotation.x = Math.sin(t * 0.7) * 0.04;
  });

  const handlePop = (e) => {
    e.stopPropagation();
    if (popped) return;
    soundEngine.playBalloonPop();
    setPopped(true);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 1400);
    // Auto re-inflate fresh balloon after 10 seconds for infinite fun!
    setTimeout(() => setPopped(false), 10000);
  };

  const balloonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.16,
    metalness: 0.35,
    envMapIntensity: 1.6,
  }), [color]);

  const goldStringMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.8,
    roughness: 0.3,
  }), []);

  if (popped) {
    return showBurst ? <MiniConfettiBurst color={color} position={position} /> : null;
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handlePop}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Balloon Egg/Teardrop Shape */}
      <mesh castShadow scale={[scale, scale * 1.25, scale]}>
        <sphereGeometry args={[1, 24, 24]} />
        <primitive object={balloonMat} attach="material" />
      </mesh>

      {/* Glossy Highlight Reflection Dome */}
      <mesh position={[scale * 0.28, scale * 0.45, scale * 0.55]} scale={[scale * 0.22, scale * 0.35, scale * 0.15]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>

      {/* Bottom Tie Knot */}
      <mesh position={[0, -scale * 1.25, 0]} material={balloonMat}>
        <coneGeometry args={[scale * 0.14, scale * 0.18, 12]} />
      </mesh>

      {/* Hanging Golden Ribbon */}
      <mesh position={[0, -scale * 1.25 - stringLength * 0.5, 0]} material={goldStringMat}>
        <cylinderGeometry args={[0.003, 0.003, stringLength, 6]} />
      </mesh>

      {/* Hover Micro Halo */}
      {hovered && (
        <pointLight position={[0, 0, scale * 1.2]} color={color} intensity={0.4} distance={0.8} />
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// 3. Luxurious Standing Balloon Bouquet Pillar (Floor weight + 5 Tied Balloons)
// --------------------------------------------------------------------------
function BalloonBouquetStand({ position = [0, 0, 0], colors = ['#D81B60', '#FF8FA3', '#F4CF7F', '#FFF8F4', '#9C27B0'] }) {
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.9,
    roughness: 0.2,
  }), []);

  return (
    <group position={position}>
      {/* Decorative Golden Base Floor Weight */}
      <mesh position={[0, 0.04, 0]} castShadow material={goldMat}>
        <cylinderGeometry args={[0.18, 0.22, 0.08, 20]} />
      </mesh>
      <mesh position={[0, 0.10, 0]} material={goldMat}>
        <sphereGeometry args={[0.06, 12, 12]} />
      </mesh>

      {/* 5 Layered Balloons Rising at Staggered Heights */}
      <InteractiveDecorBalloon position={[-0.14, 1.25, -0.12]} color={colors[0]} scale={0.32} stringLength={1.05} swayOffset={0.2} />
      <InteractiveDecorBalloon position={[0.14, 1.45, 0.10]} color={colors[1]} scale={0.34} stringLength={1.22} swayOffset={1.4} />
      <InteractiveDecorBalloon position={[-0.12, 1.70, 0.12]} color={colors[2]} scale={0.33} stringLength={1.48} swayOffset={2.8} />
      <InteractiveDecorBalloon position={[0.12, 1.95, -0.10]} color={colors[3]} scale={0.35} stringLength={1.72} swayOffset={4.1} />
      {/* Top Hero Star/Balloon */}
      <InteractiveDecorBalloon position={[0.0, 2.30, 0.0]} color={colors[4]} scale={0.40} stringLength={2.05} swayOffset={5.5} />
    </group>
  );
}

// --------------------------------------------------------------------------
// 4. Shimmering Ceiling Ribbon Canopy & Golden Streamers
// --------------------------------------------------------------------------
function CeilingStreamers() {
  const goldRibbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.85,
    roughness: 0.25,
    side: THREE.DoubleSide,
  }), []);

  const pinkRibbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF6584',
    roughness: 0.4,
    side: THREE.DoubleSide,
  }), []);

  const streamerSpans = useMemo(() => [
    // Radiating from center medallion (z = -8.0) to ballroom corners
    { start: [0, 5.0, -8.0], end: [-6.4, 4.8, -13.0], c: pinkRibbonMat },
    { start: [0, 5.0, -8.0], end: [6.4, 4.8, -13.0], c: goldRibbonMat },
    { start: [0, 5.0, -8.0], end: [-6.4, 4.8, -1.5], c: goldRibbonMat },
    { start: [0, 5.0, -8.0], end: [6.4, 4.8, -1.5], c: pinkRibbonMat },
  ], [goldRibbonMat, pinkRibbonMat]);

  return (
    <group>
      {streamerSpans.map((s, idx) => {
        const midX = (s.start[0] + s.end[0]) / 2;
        const midY = (s.start[1] + s.end[1]) / 2 - 0.35; // gentle catenary drape dip
        const midZ = (s.start[2] + s.end[2]) / 2;
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(...s.start),
          new THREE.Vector3(midX, midY, midZ),
          new THREE.Vector3(...s.end)
        );
        const tubeGeom = new THREE.TubeGeometry(curve, 28, 0.022, 6, false);
        return (
          <mesh key={`streamer-${idx}`} geometry={tubeGeom} material={s.c} />
        );
      })}
    </group>
  );
}

// --------------------------------------------------------------------------
// 5. Celebration Bunting Garland ("HAPPY BIRTHDAY") across back wall
// --------------------------------------------------------------------------
function BackWallCelebrationGarland() {
  const pennantMatA = useMemo(() => new THREE.MeshStandardMaterial({ color: '#D81B60', roughness: 0.3 }), []);
  const pennantMatB = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F4CF7F', metalness: 0.6, roughness: 0.2 }), []);
  const pennantMatC = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9C27B0', roughness: 0.35 }), []);

  const mats = [pennantMatA, pennantMatB, pennantMatC];
  const stringMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F4CF7F', metalness: 0.8 }), []);

  // Arc across the back wall above memory gallery (z = -13.3)
  const pennantCount = 13;
  const letters = ['H', 'A', 'P', 'P', 'Y', '★', 'B', 'I', 'R', 'T', 'H', 'D', 'A', 'Y'];

  return (
    <group position={[0, 4.35, -13.3]}>
      {/* Golden String Arc */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={stringMat}>
        <cylinderGeometry args={[0.006, 0.006, 7.8, 8]} />
      </mesh>

      {/* Hanging Triangular Pennants with Letters */}
      {letters.map((char, i) => {
        const xPos = -3.6 + i * 0.55;
        const dip = Math.sin((i / (letters.length - 1)) * Math.PI) * 0.28;
        return (
          <group key={`pennant-${i}`} position={[xPos, -dip, 0]}>
            {/* Triangular Flag */}
            <mesh rotation={[0, 0, Math.PI]} material={mats[i % mats.length]}>
              <coneGeometry args={[0.18, 0.32, 3]} />
            </mesh>
            {/* Pennant Lettering */}
            <Text
              position={[0, -0.08, 0.04]}
              fontSize={0.12}
              color="#FFF9F5"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {char}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

// --------------------------------------------------------------------------
// 6. Classical Roman Floral Urn Pedestals with Golden Roses & Cascading Ivy
// --------------------------------------------------------------------------
function GrandFloralPedestal({ position = [0, 0, 0] }) {
  const marbleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF2F5',
    roughness: 0.2,
    metalness: 0.08,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.9,
    roughness: 0.18,
  }), []);

  const roseMatPink = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FF4081', roughness: 0.4 }), []);
  const roseMatCream = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFF8F0', roughness: 0.4 }), []);
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.6 }), []);

  return (
    <group position={position}>
      {/* 1. Marble Column Base */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow material={marbleMat}>
        <cylinderGeometry args={[0.26, 0.30, 0.90, 18]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} material={goldMat}>
        <boxGeometry args={[0.66, 0.04, 0.66]} />
      </mesh>
      <mesh position={[0, 0.88, 0]} material={goldMat}>
        <cylinderGeometry args={[0.32, 0.26, 0.06, 18]} />
      </mesh>

      {/* 2. Classical Golden Urn / Vase */}
      <mesh position={[0, 1.15, 0]} castShadow material={goldMat}>
        <sphereGeometry args={[0.24, 18, 18]} scale={[1, 1.4, 1]} />
      </mesh>
      <mesh position={[0, 1.45, 0]} material={goldMat}>
        <torusGeometry args={[0.18, 0.025, 10, 20]} />
      </mesh>

      {/* 3. Lush Domed Floral Rose Bouquet & Leaves */}
      <group position={[0, 1.55, 0]}>
        {/* Core foliage mound */}
        <mesh material={leafMat}>
          <sphereGeometry args={[0.32, 14, 14]} scale={[1, 0.7, 1]} />
        </mesh>
        {/* Rose buds scattered gracefully */}
        {[
          [0, 0.22, 0, roseMatPink],
          [-0.14, 0.16, 0.12, roseMatCream],
          [0.15, 0.18, -0.10, roseMatPink],
          [-0.18, 0.08, -0.12, roseMatCream],
          [0.16, 0.10, 0.14, roseMatPink],
          [0.0, 0.12, -0.20, roseMatCream],
          [0.0, 0.14, 0.20, roseMatPink],
        ].map(([rx, ry, rz, mat], i) => (
          <mesh key={`rose-${i}`} position={[rx, ry, rz]} material={mat}>
            <sphereGeometry args={[0.075, 10, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// 7. Golden Gift Box Tower in Room Corners
// --------------------------------------------------------------------------
function GiftStackDisplay({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const goldRibbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.9,
    roughness: 0.18,
  }), []);

  const boxColors = ['#8A1032', '#1A365D', '#D81B60', '#F4CF7F'];

  return (
    <group position={position} rotation={rotation}>
      {/* Tier 1: Large Base Box */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.55, 0.44, 0.55]} />
        <meshStandardMaterial color={boxColors[0]} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.22, 0]} material={goldRibbonMat}>
        <boxGeometry args={[0.555, 0.445, 0.08]} />
      </mesh>
      <mesh position={[0, 0.22, 0]} material={goldRibbonMat}>
        <boxGeometry args={[0.08, 0.445, 0.555]} />
      </mesh>

      {/* Tier 2: Mid Box (rotated 25 deg) */}
      <group position={[0, 0.58, 0]} rotation={[0, 0.42, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.32, 0.42]} />
          <meshStandardMaterial color={boxColors[1]} roughness={0.35} />
        </mesh>
        <mesh material={goldRibbonMat}>
          <boxGeometry args={[0.425, 0.325, 0.06]} />
        </mesh>
      </group>

      {/* Tier 3: Small Top Box with Satin Bow */}
      <group position={[0, 0.86, 0]} rotation={[0, -0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.24, 0.28]} />
          <meshStandardMaterial color={boxColors[2]} roughness={0.35} />
        </mesh>
        {/* Bow Knot on top */}
        <mesh position={[0, 0.15, 0]} material={goldRibbonMat}>
          <sphereGeometry args={[0.045, 12, 12]} scale={[1, 0.6, 1]} />
        </mesh>
        <mesh position={[-0.04, 0.16, 0]} rotation={[0, 0, 0.4]} material={goldRibbonMat}>
          <torusGeometry args={[0.05, 0.014, 8, 16]} />
        </mesh>
        <mesh position={[0.04, 0.16, 0]} rotation={[0, 0, -0.4]} material={goldRibbonMat}>
          <torusGeometry args={[0.05, 0.014, 8, 16]} />
        </mesh>
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// 8. Champagne Flute & Celebration Beverage Stand Beside Cake
// --------------------------------------------------------------------------
function ChampagneIceBucketStand({ position = [-2.4, 0, -7.5] }) {
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.92,
    roughness: 0.18,
  }), []);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    transmission: 0.9,
    roughness: 0.08,
    transparent: true,
  }), []);

  const bottleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1B3B22',
    roughness: 0.15,
    metalness: 0.3,
  }), []);

  return (
    <group position={position}>
      {/* Slender Gilded Pedestal Stand */}
      <mesh position={[0, 0.42, 0]} castShadow material={goldMat}>
        <cylinderGeometry args={[0.025, 0.04, 0.84, 12]} />
      </mesh>
      <mesh position={[0, 0.015, 0]} material={goldMat}>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 20]} />
      </mesh>
      <mesh position={[0, 0.84, 0]} material={goldMat}>
        <cylinderGeometry args={[0.26, 0.24, 0.03, 20]} />
      </mesh>

      {/* Silver Ice Bucket */}
      <mesh position={[0, 0.97, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.24, 18]} />
        <meshStandardMaterial color="#E0E0E0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Champagne Bottle Chilling inside Bucket */}
      <group position={[0.02, 1.08, 0]} rotation={[0, 0, 0.18]}>
        <mesh castShadow material={bottleMat}>
          <cylinderGeometry args={[0.042, 0.042, 0.28, 14]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} material={bottleMat}>
          <cylinderGeometry args={[0.016, 0.038, 0.12, 14]} />
        </mesh>
        {/* Gold Foil Neck */}
        <mesh position={[0, 0.22, 0]} material={goldMat}>
          <cylinderGeometry args={[0.017, 0.017, 0.08, 14]} />
        </mesh>
      </group>

      {/* Two Delicate Crystal Champagne Flutes */}
      {[-0.14, 0.14].map((fx, i) => (
        <group key={`flute-${i}`} position={[fx, 0.85, 0.12]}>
          <mesh position={[0, 0.07, 0]} material={glassMat}>
            <cylinderGeometry args={[0.022, 0.012, 0.14, 12]} />
          </mesh>
          <mesh position={[0, 0.005, 0]} material={glassMat}>
            <cylinderGeometry args={[0.025, 0.025, 0.008, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// 9. Floating Fairy Sparkle Particle Clusters
// --------------------------------------------------------------------------
function FloatingFairySparkles() {
  return (
    <group position={[0, 2.5, -8.0]}>
      <Sparkles
        count={55}
        scale={[8.0, 3.5, 7.0]}
        size={2.8}
        speed={0.4}
        color="#FFE082"
        opacity={0.65}
      />
      <Sparkles
        count={35}
        scale={[6.0, 3.0, 6.0]}
        size={3.2}
        speed={0.5}
        color="#FF80AB"
        opacity={0.55}
      />
    </group>
  );
}

// --------------------------------------------------------------------------
// MAIN COMPONENT: BallroomPartyDecorations
// Populates the Grand Ballroom with rich celebration decor, bouquets, and balloons
// --------------------------------------------------------------------------
export function BallroomPartyDecorations() {
  return (
    <group name="ballroom-party-decorations">
      {/* 1. CEILING STREAMERS & BUNTING GARLAND */}
      <CeilingStreamers />
      <BackWallCelebrationGarland />

      {/* 2. BALLOON BOUQUET STANDS IN 4 CORNERS OF THE BALLROOM */}
      {/* Front Left Corner */}
      <BalloonBouquetStand
        position={[-6.2, 0, -0.1]}
        colors={['#D81B60', '#FF8FA3', '#F4CF7F', '#FFF8F4', '#9C27B0']}
      />
      {/* Front Right Corner */}
      <BalloonBouquetStand
        position={[6.2, 0, -0.1]}
        colors={['#FF4081', '#00BCD4', '#FFD54F', '#FFF8F4', '#E91E63']}
      />
      {/* Back Right Corner */}
      <BalloonBouquetStand
        position={[5.2, 0, -13.8]}
        colors={['#9C27B0', '#FF4081', '#F4CF7F', '#00E5FF', '#FFF8F4']}
      />

      {/* 3. FLANKING BALLOON BOUQUETS BESIDE THE HERO CAKE TABLE */}
      <BalloonBouquetStand
        position={[-2.8, 0, -8.2]}
        colors={['#E91E63', '#F4CF7F', '#FFF8F2', '#D81B60', '#FF80AB']}
      />
      <BalloonBouquetStand
        position={[2.8, 0, -8.2]}
        colors={['#FF80AB', '#D81B60', '#FFF8F2', '#F4CF7F', '#E91E63']}
      />

      {/* 4. CLASSICAL FLORAL URN PEDESTALS */}
      <GrandFloralPedestal position={[-4.8, 0, -5.8]} />
      <GrandFloralPedestal position={[4.8, 0, -5.8]} />
      <GrandFloralPedestal position={[3.2, 0, -12.6]} />

      {/* 5. LUXURY GIFT STACK TOWERS */}
      <GiftStackDisplay position={[-5.9, 0, -10.2]} rotation={[0, 0.45, 0]} />
      <GiftStackDisplay position={[5.9, 0, -10.2]} rotation={[0, -0.4, 0]} />

      {/* 6. CHAMPAGNE ICE BUCKET & TOASTING STAND */}
      <ChampagneIceBucketStand position={[-2.4, 0, -7.5]} />

      {/* 7. WARM AMBIENT FAIRY SPARKLES THROUGHOUT BALLROOM */}
      <FloatingFairySparkles />
    </group>
  );
}
