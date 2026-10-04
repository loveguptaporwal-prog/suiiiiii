import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { soundEngine } from '../systems/SoundSystem.js';

// Mini 3D Confetti Burst spawned upon balloon pop
function BalloonPopBurst({ color = '#FF6584', onFinish }) {
  const groupRef = useRef();
  const particles = useMemo(() => {
    const list = [];
    const palette = [color, '#F4CF7F', '#FFFFFF', '#FF8DA1', '#FFD166'];
    for (let i = 0; i < 28; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 0.8 + Math.random() * 1.6;
      list.push({
        pos: [0, 0, 0],
        vel: [
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 0.4,
          Math.cos(phi) * speed,
        ],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3],
        rotSpeed: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12],
        scale: 0.02 + Math.random() * 0.025,
        color: palette[Math.floor(Math.random() * palette.length)],
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
      p.vel[1] -= 2.4 * dt; // gravity
      p.rot[0] += p.rotSpeed[0] * dt;
      p.rot[1] += p.rotSpeed[1] * dt;
      child.position.set(p.pos[0], p.pos[1], p.pos[2]);
      child.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
      child.scale.multiplyScalar(0.96);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={`c-${idx}`}>
          <boxGeometry args={[p.scale * 1.8, p.scale * 0.4, 0.003]} />
          <meshBasicMaterial color={p.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Creates an organic, plump teardrop party balloon geometry
function createBalloonGeometry() {
  const points = [];
  const segments = 40;
  
  // Bottom tie / knot lip
  points.push(new THREE.Vector2(0.001, -0.68));
  points.push(new THREE.Vector2(0.055, -0.66));
  points.push(new THREE.Vector2(0.038, -0.62));
  points.push(new THREE.Vector2(0.048, -0.58));

  // Natural helium balloon profile
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -0.58 + t * 1.26;
    const baseSine = Math.sin(t * Math.PI);
    const topWeight = Math.pow(t, 0.44);
    const radius = baseSine * (0.35 + 0.28 * topWeight);
    points.push(new THREE.Vector2(Math.max(0.001, radius), y));
  }
  points.push(new THREE.Vector2(0, 0.69));

  const geom = new THREE.LatheGeometry(points, 48);
  geom.computeVertexNormals();
  return geom;
}

// Curled hanging ribbon geometry
function createRibbonGeometry(length = 1.2) {
  const points = [];
  const numSteps = 40;
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const y = -0.68 - t * length;
    const angle = t * Math.PI * 4.5;
    const radius = 0.036 * (1 - t * 0.35);
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, 32, 0.0055, 6, false);
}

export function TeardropBalloon({
  position = [0, 0, 0],
  scale = 1,
  squash = [1, 1, 1], // Subtle organic non-uniform scale
  color = '#FF6584',
  finish = 'glossy',
  stringLength = 1.2,
  swaySpeed = 1,
  swayAmount = 0.04,
  initialRotation = [0, 0, 0],
  interactive = true,
  onClick,
}) {
  const groupRef = useRef();
  const ribbonRef = useRef();
  const [popped, setPopped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const balloonGeom = useMemo(() => createBalloonGeometry(), []);
  const ribbonGeom = useMemo(() => createRibbonGeometry(stringLength), [stringLength]);

  // Luxury PBR material
  const materialProps = useMemo(() => {
    switch (finish) {
      case 'metallic':
        return {
          color: color,
          metalness: 0.9,
          roughness: 0.16,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
        };
      case 'pearl':
        return {
          color: color,
          metalness: 0.22,
          roughness: 0.22,
          clearcoat: 1.0,
          clearcoatRoughness: 0.12,
        };
      case 'satin':
        return {
          color: color,
          metalness: 0.08,
          roughness: 0.32,
          clearcoat: 0.6,
          clearcoatRoughness: 0.18,
        };
      case 'ruby':
        return {
          color: color,
          metalness: 0.46,
          roughness: 0.14,
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
        };
      case 'glossy':
      default:
        return {
          color: color,
          metalness: 0.12,
          roughness: 0.14,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
        };
    }
  }, [color, finish]);

  // Asynchronous phase offset
  const timeOffset = useMemo(() => Math.random() * 200, []);
  
  // Independent subtle float and micro-wobble
  useFrame((state) => {
    if (!groupRef.current || popped) return;
    const t = state.clock.getElapsedTime() * swaySpeed + timeOffset;
    
    // Vertical breathing bob
    groupRef.current.position.y = position[1] + Math.sin(t) * (0.04 * swayAmount);
    // Slight lateral drift
    groupRef.current.position.x = position[0] + Math.cos(t * 0.7) * (0.015 * swayAmount);
    // Subtle organic rotations
    groupRef.current.rotation.z = initialRotation[2] + Math.cos(t * 0.8) * (0.045 * swayAmount);
    groupRef.current.rotation.x = initialRotation[0] + Math.sin(t * 0.65) * (0.035 * swayAmount);
    groupRef.current.rotation.y = initialRotation[1] + Math.sin(t * 0.4) * (0.02 * swayAmount);

    // Subtle ribbon trailing sway
    if (ribbonRef.current) {
      ribbonRef.current.rotation.z = Math.sin(t * 1.1) * 0.04;
      ribbonRef.current.rotation.x = Math.cos(t * 0.9) * 0.03;
    }
  });

  const [showBurst, setShowBurst] = useState(false);

  const handleClick = (e) => {
    if (!interactive || popped) return;
    e.stopPropagation();
    soundEngine.playBalloonPop();
    setPopped(true);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 1400);
    if (onClick) onClick();
  };

  if (popped) {
    if (showBurst) {
      return (
        <group position={position}>
          <BalloonPopBurst color={color} />
        </group>
      );
    }
    return null;
  }

  const finalScale = [
    scale * squash[0] * (hovered ? 1.05 : 1.0),
    scale * squash[1] * (hovered ? 1.05 : 1.0),
    scale * squash[2] * (hovered ? 1.05 : 1.0),
  ];

  return (
    <group
      ref={groupRef}
      position={position}
      scale={finalScale}
      rotation={initialRotation}
      onPointerOver={(e) => {
        if (interactive) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={handleClick}
    >
      {/* Silky organic balloon body */}
      <mesh geometry={balloonGeom} castShadow receiveShadow>
        <meshPhysicalMaterial {...materialProps} />
      </mesh>

      {/* Hanging curly ribbon */}
      <mesh ref={ribbonRef} geometry={ribbonGeom} castShadow>
        <meshStandardMaterial
          color="#FFF8E8"
          metalness={0.25}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}


