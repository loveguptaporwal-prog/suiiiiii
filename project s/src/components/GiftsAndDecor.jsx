import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 3D Luxury Gift Box with realistic wrapping materials (matte, foil, velvet, satin)
function LuxuryGiftBox({
  position = [0, 0, 0],
  size = [0.4, 0.35, 0.4],
  rotation = [0, 0, 0],
  boxColor = '#FFB6C1',
  ribbonColor = '#F4CF7F',
  finish = 'matte', // 'matte', 'metallic', 'satin'
  ribbonFinish = 'metallic', // 'metallic', 'velvet', 'satin'
  isRound = false,
  hasTag = false,
}) {
  const [w, h, d] = size;

  const boxMaterial = useMemo(() => {
    if (finish === 'metallic') {
      return new THREE.MeshStandardMaterial({
        color: boxColor,
        roughness: 0.22,
        metalness: 0.82,
      });
    }
    if (finish === 'satin') {
      return new THREE.MeshStandardMaterial({
        color: boxColor,
        roughness: 0.36,
        metalness: 0.12,
      });
    }
    // matte wrapping paper
    return new THREE.MeshStandardMaterial({
      color: boxColor,
      roughness: 0.62,
      metalness: 0.02,
    });
  }, [boxColor, finish]);

  const ribbonMaterial = useMemo(() => {
    if (ribbonFinish === 'velvet') {
      return new THREE.MeshStandardMaterial({
        color: ribbonColor,
        roughness: 0.78,
        metalness: 0.02,
      });
    }
    if (ribbonFinish === 'satin') {
      return new THREE.MeshStandardMaterial({
        color: ribbonColor,
        roughness: 0.32,
        metalness: 0.2,
      });
    }
    // metallic ribbon
    return new THREE.MeshStandardMaterial({
      color: ribbonColor,
      roughness: 0.18,
      metalness: 0.88,
    });
  }, [ribbonColor, ribbonFinish]);

  const tagMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8F2',
    roughness: 0.5,
  }), []);

  return (
    <group position={position} rotation={rotation}>
      {isRound ? (
        // Round Hatbox
        <>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={boxMaterial}>
            <cylinderGeometry args={[w / 2, w / 2, h, 32]} />
          </mesh>
          <mesh position={[0, h + 0.02, 0]} castShadow material={boxMaterial}>
            <cylinderGeometry args={[w / 2 + 0.015, w / 2 + 0.015, 0.045, 32]} />
          </mesh>
          <mesh position={[0, h / 2, 0]} castShadow material={ribbonMaterial}>
            <cylinderGeometry args={[w / 2 + 0.002, w / 2 + 0.002, h, 32, 1, true, 0, 0.22]} />
          </mesh>
        </>
      ) : (
        // Rectangular Gift Box
        <>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={boxMaterial}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
          <mesh position={[0, h + 0.02, 0]} castShadow material={boxMaterial}>
            <boxGeometry args={[w + 0.02, 0.045, d + 0.02]} />
          </mesh>
          {/* Ribbon X */}
          <mesh position={[0, h / 2, 0]} castShadow material={ribbonMaterial}>
            <boxGeometry args={[w * 0.18, h + 0.008, d + 0.008]} />
          </mesh>
          {/* Ribbon Z */}
          <mesh position={[0, h / 2, 0]} castShadow material={ribbonMaterial}>
            <boxGeometry args={[w + 0.008, h + 0.008, d * 0.18]} />
          </mesh>
        </>
      )}

      {/* 3D Realistic Tied Ribbon Bow on Top */}
      <group position={[0, h + 0.055, 0]}>
        <mesh castShadow material={ribbonMaterial}>
          <sphereGeometry args={[0.034, 12, 12]} />
        </mesh>
        <mesh position={[-0.055, 0.032, 0.01]} rotation={[0.25, 0.15, Math.PI / 4]} castShadow material={ribbonMaterial}>
          <torusGeometry args={[0.048, 0.014, 10, 24]} />
        </mesh>
        <mesh position={[0.055, 0.032, 0.01]} rotation={[0.25, -0.15, -Math.PI / 4]} castShadow material={ribbonMaterial}>
          <torusGeometry args={[0.048, 0.014, 10, 24]} />
        </mesh>
        {/* Soft flowing ribbon tails */}
        <mesh position={[-0.035, -0.01, 0.04]} rotation={[0.35, -0.2, -0.2]} material={ribbonMaterial}>
          <boxGeometry args={[0.022, 0.08, 0.003]} />
        </mesh>
        <mesh position={[0.035, -0.01, 0.04]} rotation={[0.35, 0.2, 0.2]} material={ribbonMaterial}>
          <boxGeometry args={[0.022, 0.08, 0.003]} />
        </mesh>

        {/* Small hanging gift tag */}
        {hasTag && (
          <group position={[0.08, -0.02, 0.08]} rotation={[0.4, 0.2, -0.3]}>
            <mesh castShadow material={tagMat}>
              <boxGeometry args={[0.06, 0.10, 0.005]} />
            </mesh>
            <mesh position={[0, 0.055, 0]} material={ribbonMaterial}>
              <cylinderGeometry args={[0.003, 0.003, 0.03, 6]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

// Classical Urn Pedestal with Lush Peony & Rose Floral Arrangement
function FloralPedestal({ position = [0, 0, 0], scale = 1 }) {
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF9F5',
    roughness: 0.38,
    metalness: 0.04,
  }), []);

  const goldAccentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.88,
    roughness: 0.2,
  }), []);

  const blushRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FF8CA3',
    roughness: 0.42,
    metalness: 0.05,
  }), []);

  const creamRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8F2',
    roughness: 0.4,
    metalness: 0.02,
  }), []);

  const deepRoseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D81B60',
    roughness: 0.38,
    metalness: 0.05,
  }), []);

  const foliageMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4B6B48',
    roughness: 0.45,
    metalness: 0.04,
  }), []);

  return (
    <group position={position} scale={scale}>
      {/* Plinth Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow material={stoneMat}>
        <boxGeometry args={[0.42, 0.16, 0.42]} />
      </mesh>
      {/* Fluted Stem */}
      <mesh position={[0, 0.36, 0]} castShadow material={stoneMat}>
        <cylinderGeometry args={[0.13, 0.17, 0.42, 24]} />
      </mesh>
      {/* Classical Urn Bowl */}
      <mesh position={[0, 0.62, 0]} castShadow material={stoneMat}>
        <cylinderGeometry args={[0.26, 0.13, 0.16, 24]} />
      </mesh>
      {/* Gold Urn Rim */}
      <mesh position={[0, 0.70, 0]} castShadow material={goldAccentMat}>
        <torusGeometry args={[0.26, 0.02, 14, 32]} />
      </mesh>

      {/* Lush Bouquet of Clustered Peonies & Roses */}
      <group position={[0, 0.72, 0]}>
        <mesh position={[0, 0.02, 0]} material={foliageMat}>
          <cylinderGeometry args={[0.16, 0.12, 0.06, 16]} />
        </mesh>

        {[
          { pos: [0, 0.18, 0], mat: blushRoseMat, s: 0.12 },
          { pos: [-0.12, 0.14, 0.09], mat: creamRoseMat, s: 0.11 },
          { pos: [0.13, 0.13, 0.08], mat: deepRoseMat, s: 0.11 },
          { pos: [0.07, 0.15, -0.1], mat: blushRoseMat, s: 0.105 },
          { pos: [-0.1, 0.11, -0.09], mat: deepRoseMat, s: 0.10 },
          { pos: [0.16, 0.07, 0.04], mat: creamRoseMat, s: 0.10 },
          { pos: [-0.16, 0.08, 0.02], mat: blushRoseMat, s: 0.10 },
          { pos: [0, 0.08, 0.16], mat: creamRoseMat, s: 0.105 },
          { pos: [0, 0.07, -0.15], mat: deepRoseMat, s: 0.10 },
        ].map((rose, idx) => (
          <mesh key={idx} position={rose.pos} castShadow material={rose.mat}>
            <sphereGeometry args={[rose.s, 16, 16]} />
          </mesh>
        ))}

        {[
          { pos: [0.22, 0.12, 0.12], rot: [0.3, 0.5, 0.4] },
          { pos: [-0.22, 0.13, -0.1], rot: [-0.3, -0.5, -0.4] },
          { pos: [-0.16, 0.15, 0.18], rot: [0.4, -0.3, 0.2] },
          { pos: [0.18, 0.14, -0.16], rot: [-0.4, 0.3, -0.2] },
        ].map((leaf, idx) => (
          <mesh key={idx} position={leaf.pos} rotation={leaf.rot} castShadow material={goldAccentMat}>
            <boxGeometry args={[0.07, 0.14, 0.008]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Hanging Festive Bunting Garland with gentle ambient breeze
function HangingBunting() {
  const groupRef = useRef();

  const flags = useMemo(() => {
    const list = [];
    const count = 16;
    const colors = ['#FF6584', '#F4CF7F', '#FFF8F2', '#D81B60', '#FFB8C8'];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = -2.6 + t * 5.2;
      const y = 3.65 - Math.sin(t * Math.PI) * 0.38;
      const z = -0.1 + Math.sin(t * Math.PI * 2) * 0.05;
      list.push({
        pos: [x, y, z],
        color: colors[i % colors.length],
        rotZ: (t - 0.5) * 0.35,
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.x = Math.sin(t * 0.9) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {flags.map((flag, idx) => (
        <group key={idx} position={flag.pos} rotation={[0.05, 0, flag.rotZ]}>
          <mesh castShadow>
            <coneGeometry args={[0.11, 0.22, 3]} />
            <meshStandardMaterial
              color={flag.color}
              roughness={0.38}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function GiftsAndDecor() {
  return (
    <group name="gifts-and-decor">
      {/* --- Left Pillar Base: Asymmetric Tall Tower Stack --- */}
      <LuxuryGiftBox
        position={[-1.78, 0, 0.40]}
        size={[0.48, 0.38, 0.44]}
        rotation={[0, 0.24, 0]}
        boxColor="#FF8FA3"
        ribbonColor="#F4CF7F"
        finish="satin"
        ribbonFinish="metallic"
        hasTag
      />
      <LuxuryGiftBox
        position={[-1.60, 0.38, 0.42]}
        size={[0.34, 0.28, 0.32]}
        rotation={[0, -0.22, 0]}
        boxColor="#FFF8F2"
        ribbonColor="#D81B60"
        finish="matte"
        ribbonFinish="velvet"
      />
      <LuxuryGiftBox
        position={[-1.54, 0.66, 0.40]}
        size={[0.22, 0.16, 0.22]}
        rotation={[0, 0.32, 0]}
        boxColor="#F4CF7F"
        ribbonColor="#D81B60"
        finish="metallic"
        ribbonFinish="velvet"
      />
      {/* Front round hatbox accent */}
      <LuxuryGiftBox
        position={[-1.98, 0, 0.92]}
        size={[0.38, 0.32, 0.38]}
        rotation={[0, 0.14, 0]}
        boxColor="#F8A5C2"
        ribbonColor="#FFF8F4"
        finish="satin"
        ribbonFinish="satin"
        isRound
      />

      {/* --- Right Pillar Base: Asymmetric Low Wide Cluster --- */}
      <LuxuryGiftBox
        position={[1.66, 0, 0.44]}
        size={[0.54, 0.30, 0.48]}
        rotation={[0, -0.16, 0]}
        boxColor="#FFF8F2"
        ribbonColor="#F4CF7F"
        finish="matte"
        ribbonFinish="metallic"
        hasTag
      />
      <LuxuryGiftBox
        position={[1.86, 0.30, 0.46]}
        size={[0.32, 0.24, 0.32]}
        rotation={[0, 0.26, 0]}
        boxColor="#D81B60"
        ribbonColor="#FFF8F4"
        finish="satin"
        ribbonFinish="satin"
      />
      {/* Tucked favor box */}
      <LuxuryGiftBox
        position={[1.42, 0, 0.82]}
        size={[0.26, 0.18, 0.26]}
        rotation={[0, -0.34, 0]}
        boxColor="#FFB8C8"
        ribbonColor="#F4CF7F"
        finish="satin"
        ribbonFinish="metallic"
      />

      {/* --- Floral Urn Pedestals: Organic Asymmetry --- */}
      {/* Left side: Grand foreground floral pedestal */}
      <FloralPedestal position={[-2.24, 0, 0.52]} scale={1.06} />
      {/* Right side: Set slightly further back with varied scale for natural balance */}
      <FloralPedestal position={[2.34, 0, 0.26]} scale={0.92} />

      {/* --- Festive Hanging Bunting across ceiling --- */}
      <HangingBunting />
    </group>
  );
}
