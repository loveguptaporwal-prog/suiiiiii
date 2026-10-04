import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles } from '@react-three/drei';
import { soundEngine } from '../systems/SoundSystem.js';
import { worldEventBus } from '../systems/WorldEventBus.js';
import { BirthdayPortrait } from './BirthdayPortrait.jsx';
import vipPortraitNorth from '../../her/images/photo13.jpeg';
import vipPortraitSouth from '../../her/images/photo15.jpeg';
import vipPortraitWest from '../../her/images/photo25.jpeg';

// Interactive Mystery Birthday Gift Box with ribbon unwrap and floating surprise
function InteractiveGiftBox({ position, color, ribbonColor, giftName, surpriseNote }) {
  const [unwrapped, setUnwrapped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lidRef = useRef();
  const surpriseRef = useRef();
  const lidOffsetRef = useRef(0);

  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.35,
    metalness: 0.12,
  }), [color]);

  const ribbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: ribbonColor,
    roughness: 0.28,
    metalness: 0.25,
  }), [ribbonColor]);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.92,
    roughness: 0.15,
  }), []);

  const noteMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF5',
    roughness: 0.4,
  }), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (unwrapped && lidRef.current) {
      lidOffsetRef.current = THREE.MathUtils.lerp(lidOffsetRef.current, 0.45, 1 - Math.exp(-4 * dt));
      lidRef.current.position.y = 0.22 + lidOffsetRef.current;
      lidRef.current.rotation.x = lidOffsetRef.current * 0.8;
      lidRef.current.rotation.z = lidOffsetRef.current * 0.4;
    }
    if (unwrapped && surpriseRef.current) {
      surpriseRef.current.position.y = THREE.MathUtils.lerp(surpriseRef.current.position.y, 0.40, 1 - Math.exp(-3 * dt));
      surpriseRef.current.rotation.y += dt * 0.8;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!unwrapped) {
      soundEngine.playGiftUnwrap();
      setUnwrapped(true);
      worldEventBus.triggerInteractionPipeline('gift_box', 'unwrap', { giftName });
    }
  };

  return (
    <group position={position}>
      {/* Box Body */}
      <mesh
        castShadow
        receiveShadow
        material={boxMat}
        position={[0, 0.11, 0]}
        onClick={handleClick}
        onPointerOver={() => { setIsHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.38, 0.22, 0.38]} />
      </mesh>

      {/* Ribbons around box */}
      <mesh position={[0, 0.11, 0]} material={ribbonMat}>
        <boxGeometry args={[0.384, 0.222, 0.06]} />
      </mesh>
      <mesh position={[0, 0.11, 0]} material={ribbonMat}>
        <boxGeometry args={[0.06, 0.222, 0.384]} />
      </mesh>

      {/* Removable Gift Lid with Big Satin Bow */}
      <group ref={lidRef} position={[0, 0.22, 0]}>
        <mesh castShadow material={boxMat} onClick={handleClick}>
          <boxGeometry args={[0.40, 0.05, 0.40]} />
        </mesh>
        <mesh material={ribbonMat}>
          <boxGeometry args={[0.404, 0.052, 0.062]} />
        </mesh>
        <mesh material={ribbonMat}>
          <boxGeometry args={[0.062, 0.052, 0.404]} />
        </mesh>
        {/* Bow knot */}
        <mesh position={[0, 0.045, 0]} material={goldMat}>
          <sphereGeometry args={[0.038, 12, 12]} scale={[1, 0.6, 1]} />
        </mesh>
        <mesh position={[-0.04, 0.055, 0]} rotation={[0, 0, 0.35]} material={ribbonMat}>
          <torusGeometry args={[0.042, 0.012, 8, 16]} />
        </mesh>
        <mesh position={[0.04, 0.055, 0]} rotation={[0, 0, -0.35]} material={ribbonMat}>
          <torusGeometry args={[0.042, 0.012, 8, 16]} />
        </mesh>
      </group>

      {/* Floating Surprise Note / Token inside */}
      {unwrapped && (
        <group ref={surpriseRef} position={[0, 0.15, 0]}>
          <mesh castShadow material={noteMat}>
            <boxGeometry args={[0.26, 0.32, 0.008]} />
          </mesh>
          <mesh position={[0, 0, 0.006]} material={goldMat}>
            <boxGeometry args={[0.24, 0.30, 0.002]} />
          </mesh>
          <Text
            position={[0, 0.04, 0.01]}
            fontSize={0.032}
            color="#8A1234"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.22}
            textAlign="center"
            fontWeight="bold"
          >
            {giftName}
          </Text>
          <Text
            position={[0, -0.04, 0.01]}
            fontSize={0.022}
            color="#333333"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.21}
            textAlign="center"
          >
            {surpriseNote}
          </Text>
          {/* Shimmer light */}
          <pointLight color="#FFE082" intensity={0.25} distance={1.2} />
        </group>
      )}

      {/* Hover prompt hint */}
      {!unwrapped && isHovered && (
        <pointLight position={[0, 0.35, 0]} color="#FFE082" intensity={0.15} distance={0.8} />
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// VIP Gift Unwrapping & Surprise Lounge Room
// Positioned at X: [-12.5, -7.0], Z: [-7.0, -2.0], Y: [0, 5.0]
// --------------------------------------------------------------------------
export function GiftLoungeRoom() {
  const roomCenter = [-9.8, 0, -4.5];

  const marbleFloorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF2F5',
    roughness: 0.18,
    metalness: 0.08,
  }), []);

  const rugMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#9C1A42', // Ruby celebratory velvet
    roughness: 0.85,
    metalness: 0.02,
  }), []);

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#34101A', // Rich royal wine acoustic paneling
    roughness: 0.68,
    metalness: 0.04,
    side: THREE.FrontSide, // FrontSide prevents back-face bleed into ballroom
  }), []);

  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37', // Gilded molding accents
    metalness: 0.90,
    roughness: 0.20,
    side: THREE.FrontSide,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.92,
    roughness: 0.18,
  }), []);

  const sofaVelvetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1032',
    roughness: 0.75,
    metalness: 0.05,
  }), []);

  const cushionGoldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    roughness: 0.45,
    metalness: 0.35,
  }), []);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    transmission: 0.92,
    roughness: 0.08,
    transparent: true,
  }), []);

  return (
    <group name="gift-lounge-room" position={roomCenter}>
      {/* 1. Marble Floor (5.5m wide x 5.0m deep) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={marbleFloorMat}>
        <planeGeometry args={[5.6, 5.0]} />
      </mesh>

      {/* 2. Plush Circular Ruby Velvet Rug */}
      <group position={[0, 0.005, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={rugMat}>
          <circleGeometry args={[1.8, 36]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={goldMat}>
          <ringGeometry args={[1.78, 1.82, 36]} />
        </mesh>
      </group>

      {/* 3. Ceiling with Warm Chandelier & Inset Soft Glow */}
      <mesh position={[0, 5.0, 0]} rotation={[Math.PI / 2, 0, 0]} material={wallMat}>
        <planeGeometry args={[5.6, 5.0]} />
      </mesh>
      <pointLight position={[0, 4.2, 0]} color="#FFD180" intensity={0.8} distance={8.0} />

      {/* 4. West Wall (at x = -2.8) */}
      <group position={[-2.8, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow material={wallMat}>
          <planeGeometry args={[5.0, 5.0]} />
        </mesh>
        <mesh position={[0, -2.35, 0.02]} material={trimMat}>
          <boxGeometry args={[5.0, 0.30, 0.04]} />
        </mesh>
        {/* Wall Sconce */}
        <pointLight position={[0, 0.5, 0.25]} color="#FFA726" intensity={0.35} distance={3.5} />
      </group>
      <BirthdayPortrait
        name="vip-gift-lounge-west-portrait"
        imageSrc={vipPortraitWest}
        position={[-2.70, 3.12, 0]}
        rotation={[0, Math.PI / 2, 0]}
        photoHeight={2.35}
      />

      {/* 5. North Wall (at z = -2.5) */}
      <group position={[0, 2.5, -2.5]}>
        <mesh receiveShadow material={wallMat}>
          <planeGeometry args={[5.6, 5.0]} />
        </mesh>
        <mesh position={[0, -2.35, 0.02]} material={trimMat}>
          <boxGeometry args={[5.6, 0.30, 0.04]} />
        </mesh>
        {/* Signboard Banner */}
        <group position={[0, 1.2, 0.05]}>
          <mesh material={goldMat}>
            <boxGeometry args={[2.8, 0.44, 0.02]} />
          </mesh>
          <mesh position={[0, 0, 0.012]} material={sofaVelvetMat}>
            <boxGeometry args={[2.72, 0.36, 0.01]} />
          </mesh>
          <Text
            position={[0, 0, 0.025]}
            fontSize={0.13}
            color="#FFF8E8"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.08}
          >
            VIP BIRTHDAY GIFTS
          </Text>
        </group>
      </group>
      <BirthdayPortrait
        name="vip-gift-lounge-north-portrait"
        imageSrc={vipPortraitNorth}
        position={[0, 2.08, -2.40]}
        photoHeight={2.25}
      />

      {/* 6. South Wall (at z = 2.5) */}
      <group position={[0, 2.5, 2.5]} rotation={[0, Math.PI, 0]}>
        <mesh receiveShadow material={wallMat}>
          <planeGeometry args={[5.6, 5.0]} />
        </mesh>
        <mesh position={[0, -2.35, 0.02]} material={trimMat}>
          <boxGeometry args={[5.6, 0.30, 0.04]} />
        </mesh>
      </group>
      <BirthdayPortrait
        name="vip-gift-lounge-south-portrait"
        imageSrc={vipPortraitSouth}
        position={[0, 2.55, 2.40]}
        rotation={[0, Math.PI, 0]}
        photoHeight={2.35}
      />

      {/* 7. East Wall (with doorway opening in center leading back to ballroom at x = +2.76, perfectly aligned 1.2m width) */}
      <group position={[2.76, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Wall segment left of door (world z = -7.0 to -5.1) */}
        <mesh position={[-1.55, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[1.9, 5.0]} />
        </mesh>
        {/* Wall segment right of door (world z = -3.9 to -2.0) */}
        <mesh position={[1.55, 0, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[1.9, 5.0]} />
        </mesh>
        {/* Header above doorway (world z = -5.1 to -3.9, y = 2.45 to 5.0) */}
        <mesh position={[0, 1.225, 0]} receiveShadow material={wallMat}>
          <planeGeometry args={[1.2, 2.55]} />
        </mesh>
      </group>

      {/* 8. Elegant Chesterfield Velvet Sectional Sofa along West wall */}
      <group position={[-2.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Base / Seat Cushion */}
        <mesh position={[0, 0.28, 0]} castShadow material={sofaVelvetMat}>
          <boxGeometry args={[2.4, 0.32, 0.85]} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.65, -0.36]} castShadow material={sofaVelvetMat}>
          <boxGeometry args={[2.4, 0.55, 0.22]} />
        </mesh>
        {/* Side Arms */}
        {[-1.15, 1.15].map((ax, i) => (
          <mesh key={`arm-${i}`} position={[ax, 0.52, -0.05]} castShadow material={sofaVelvetMat}>
            <boxGeometry args={[0.22, 0.38, 0.85]} />
          </mesh>
        ))}
        {/* Gold Tassel Cushions */}
        {[-0.6, 0.6].map((cx, i) => (
          <mesh key={`cush-${i}`} position={[cx, 0.48, -0.15]} rotation={[0.2, (i === 0 ? 0.3 : -0.3), 0]} material={cushionGoldMat}>
            <boxGeometry args={[0.32, 0.32, 0.12]} />
          </mesh>
        ))}
      </group>

      {/* 9. Gilded Glass Coffee Table in Center with 3 Interactive Gift Boxes */}
      <group position={[0, 0, 0]}>
        {/* Gold Table Legs */}
        {[-0.7, 0.7].map((tx, i) =>
          [-0.45, 0.45].map((tz, j) => (
            <mesh key={`tl-${i}-${j}`} position={[tx, 0.22, tz]} material={goldMat}>
              <cylinderGeometry args={[0.02, 0.02, 0.44, 12]} />
            </mesh>
          ))
        )}
        {/* Gold Table Frame */}
        <mesh position={[0, 0.435, 0]} material={goldMat}>
          <boxGeometry args={[1.52, 0.03, 1.02]} />
        </mesh>
        {/* Glass Table Top */}
        <mesh position={[0, 0.455, 0]} receiveShadow material={glassMat}>
          <boxGeometry args={[1.56, 0.015, 1.06]} />
        </mesh>

        {/* 3 Interactive Birthday Gift Boxes Resting on Table */}
        <InteractiveGiftBox
          position={[-0.42, 0.46, 0]}
          color="#8A1032"
          ribbonColor="#F4CF7F"
          giftName="Special Wish"
          surpriseNote="May all your dreams come true, Sneha!"
        />
        <InteractiveGiftBox
          position={[0.0, 0.46, 0.12]}
          color="#1A365D"
          ribbonColor="#F4CF7F"
          giftName="Golden Blessing"
          surpriseNote="Happiness, Health & Endless Success!"
        />
        <InteractiveGiftBox
          position={[0.42, 0.46, -0.05]}
          color="#D81B60"
          ribbonColor="#FFF8E8"
          giftName="Mystery Present"
          surpriseNote="A Year Full of Adventure & Joy!"
        />
      </group>

      {/* 10. Gift Display Shelves along North Wall with Decorative Packages */}
      <group position={[1.4, 0, -2.1]}>
        <mesh position={[0, 0.9, 0]} material={goldMat}>
          <boxGeometry args={[1.6, 1.8, 0.35]} />
        </mesh>
        <mesh position={[0, 0.9, 0.02]} material={wallMat}>
          <boxGeometry args={[1.5, 1.7, 0.32]} />
        </mesh>
        {/* Shelf Planks */}
        {[0.45, 0.95, 1.45].map((sy, i) => (
          <mesh key={`shelf-${i}`} position={[0, sy, 0.05]} material={goldMat}>
            <boxGeometry args={[1.48, 0.025, 0.32]} />
          </mesh>
        ))}
      </group>

      {/* 11. Corner Helium Celebration Balloon Bouquets */}
      {[
        [-2.2, 0, -2.0],
        [-2.2, 0, 2.0],
      ].map(([bx, by, bz], i) => (
        <group key={`gift-balloon-stand-${i}`} position={[bx, by, bz]}>
          <mesh position={[0, 0.04, 0]} material={goldMat}>
            <cylinderGeometry args={[0.18, 0.22, 0.08, 16]} />
          </mesh>
          {/* Balloon ties */}
          <mesh position={[0, 1.2, 0]} material={goldMat}>
            <cylinderGeometry args={[0.006, 0.006, 2.4, 6]} />
          </mesh>
          {/* Cluster of 4 helium balloons */}
          {[-0.15, 0.15].map((offX, j) => (
            <mesh key={`gb-${j}`} position={[offX, 2.5 + j * 0.22, (j === 0 ? -0.1 : 0.1)]} castShadow>
              <sphereGeometry args={[0.22, 16, 16]} scale={[1, 1.25, 1]} />
              <meshStandardMaterial
                color={j === 0 ? '#F4CF7F' : '#D81B60'}
                metalness={0.45}
                roughness={0.18}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Floating Golden Mystery Sparkles */}
      <Sparkles count={40} scale={[5.0, 3.5, 4.5]} size={2.5} speed={0.4} color="#F4CF7F" opacity={0.65} />
    </group>
  );
}
