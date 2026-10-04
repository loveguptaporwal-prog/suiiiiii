import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TeardropBalloon } from './TeardropBalloon.jsx';

// Floating ambient celebration light motes / golden confetti sparkles
function AmbientPartyMotes({ count = 35 }) {
  const pointsRef = useRef();

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 5.0;
      pos[i * 3 + 1] = Math.random() * 3.4 + 0.2;
      pos[i * 3 + 2] = Math.random() * 4.5 - 0.5; // z from -0.5 to 4.0
    }
    return [pos];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i);
      y += Math.sin(t * 0.7 + i * 2.1) * 0.0022;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FDE4A6"
        size={0.038}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Curled hanging satin ribbon streamer with natural ambient sway
function HangingStreamer({ position, color = '#F4CF7F', length = 1.4, swaySpeed = 1 }) {
  const meshRef = useRef();

  const geom = useMemo(() => {
    const points = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 6;
      const r = 0.05 * (1 - t * 0.3);
      points.push(new THREE.Vector3(Math.sin(angle) * r, -t * length, Math.cos(angle) * r));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 32, 0.0075, 6, false);
  }, [length]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * swaySpeed;
      meshRef.current.rotation.z = Math.sin(t) * 0.05;
      meshRef.current.rotation.x = Math.cos(t * 0.8) * 0.04;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geom} castShadow>
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.65} />
      </mesh>
    </group>
  );
}

export function ForegroundDepth() {
  return (
    <group name="foreground-depth">
      {/* Left Foreground Balloon: framing left edge with organic float */}
      <TeardropBalloon
        position={[-1.95, 1.35, 3.2]}
        scale={0.55}
        color="#FF6584"
        finish="glossy"
        initialRotation={[0.1, 0.35, 0.15]}
        swaySpeed={0.7}
        swayAmount={0.045}
        stringLength={1.4}
      />
      {/* Secondary accent pearl balloon */}
      <TeardropBalloon
        position={[-1.65, 2.35, 2.9]}
        scale={0.36}
        color="#FFF6F0"
        finish="pearl"
        initialRotation={[-0.1, 0.2, -0.1]}
        swaySpeed={0.9}
        swayAmount={0.035}
        stringLength={1.2}
      />

      {/* Right Foreground: Swaying satin streamers & metallic balloon */}
      <HangingStreamer position={[2.05, 3.9, 3.0]} color="#F4CF7F" length={1.5} swaySpeed={0.9} />
      <HangingStreamer position={[2.25, 4.0, 2.8]} color="#FF7597" length={1.3} swaySpeed={1.1} />
      
      <TeardropBalloon
        position={[2.05, 1.25, 3.1]}
        scale={0.50}
        color="#F8A5C2"
        finish="metallic"
        initialRotation={[0.14, -0.28, -0.15]}
        swaySpeed={0.78}
        swayAmount={0.04}
        stringLength={1.3}
      />

      {/* Subtle floating celebration sparkle motes */}
      <AmbientPartyMotes count={35} />
    </group>
  );
}
