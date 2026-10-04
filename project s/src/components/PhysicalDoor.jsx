import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { worldEventBus } from '../systems/WorldEventBus.js';

export function PhysicalDoor({
  isRight = false,
  initialState = 'partially_open', // 'closed', 'ajar', 'partially_open', 'open'
  onDoorMove,
}) {
  const doorWidth = 0.94;
  const doorHeight = 2.45;
  const doorThickness = 0.055;
  const hingeX = isRight ? 1.05 : -1.05;

  // Initial angle mapping
  const getAngleForState = (state) => {
    switch (state) {
      case 'closed': return 0.0;
      case 'ajar': return isRight ? 0.22 : 0.28;
      case 'partially_open': return isRight ? 0.46 : 0.58; // Approved teaser angle
      case 'open': return isRight ? 1.34 : 1.42; // Wide comfortable opening
      default: return isRight ? 0.46 : 0.58;
    }
  };

  const [isOpenState, setIsOpenState] = useState(initialState === 'open');
  const targetAngleRef = useRef(getAngleForState(initialState));
  const currentAngleRef = useRef(getAngleForState(initialState));
  const velocityRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const doorGroupRef = useRef();
  const handleMeshRef = useRef();

  // Materials with subtle physical hover response
  const doorWood = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF6F0',
    roughness: 0.35,
    metalness: 0.02,
  }), []);

  const panelWood = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFEFE5',
    roughness: 0.4,
    metalness: 0.02,
  }), []);

  const brassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37',
    metalness: 0.9,
    roughness: 0.18,
  }), []);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#FFF5F8',
    roughness: 0.08,
    transmission: 0.78,
    thickness: 0.03,
    transparent: true,
    opacity: 0.7,
  }), []);

  // Smooth, majestic architectural hinge rotation (buttery smooth, no jitter, no oscillation)
  useFrame((state, delta) => {
    const target = targetAngleRef.current;
    
    // Critically damped ease for stately, luxurious door movement
    const swingSpeed = 2.6;
    currentAngleRef.current = THREE.MathUtils.lerp(
      currentAngleRef.current,
      target,
      1 - Math.exp(-swingSpeed * delta)
    );

    // Apply rotation around hinge
    if (doorGroupRef.current) {
      const rotY = isRight ? currentAngleRef.current : -currentAngleRef.current;
      doorGroupRef.current.rotation.y = rotY;
    }

    // Subtle handle micro-deflection when hovered (physical tactile hint)
    if (handleMeshRef.current) {
      const targetHandleRot = isHovered ? 0.06 : 0.0;
      handleMeshRef.current.rotation.x = THREE.MathUtils.lerp(
        handleMeshRef.current.rotation.x,
        targetHandleRot,
        1 - Math.exp(-10 * delta)
      );
    }

    if (onDoorMove) {
      onDoorMove(currentAngleRef.current);
    }
  });

  // Handle click / push interaction
  const handlePointerDown = (e) => {
    e.stopPropagation();

    // Toggle between wide open and default partially open teaser angle
    const nextOpen = !isOpenState;
    setIsOpenState(nextOpen);
    const newAngle = nextOpen ? getAngleForState('open') : getAngleForState('partially_open');
    targetAngleRef.current = newAngle;

    worldEventBus.triggerInteractionPipeline('party_gate_french_door', 'toggle_open', {
      isRight,
      newState: nextOpen ? 'open' : 'partially_open',
      angle: newAngle,
    });
  };

  return (
    <group position={[hingeX, 0, 0]}>
      {/* Pivot group that rotates around hinge */}
      <group
        ref={doorGroupRef}
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
        onPointerDown={handlePointerDown}
      >
        <group position={[isRight ? -doorWidth / 2 : doorWidth / 2, doorHeight / 2 + 0.04, 0]}>
          {/* Main Door Frame */}
          <mesh castShadow receiveShadow material={doorWood}>
            <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
          </mesh>

          {/* Lower Inset Beveled Panel */}
          <mesh position={[0, -0.6, 0.014]} castShadow receiveShadow material={panelWood}>
            <boxGeometry args={[doorWidth * 0.78, 0.86, doorThickness * 0.7]} />
          </mesh>
          <mesh position={[0, -0.6, -0.014]} castShadow receiveShadow material={panelWood}>
            <boxGeometry args={[doorWidth * 0.78, 0.86, doorThickness * 0.7]} />
          </mesh>

          {/* Upper Window Frame with Glass */}
          <mesh position={[0, 0.48, 0]} material={glassMaterial}>
            <boxGeometry args={[doorWidth * 0.78, 1.05, 0.02]} />
          </mesh>
          {/* Glass Mullions */}
          <mesh position={[0, 0.48, 0.016]} material={brassMaterial}>
            <boxGeometry args={[0.02, 1.05, 0.015]} />
          </mesh>
          <mesh position={[0, 0.48, 0.016]} material={brassMaterial}>
            <boxGeometry args={[doorWidth * 0.78, 0.02, 0.015]} />
          </mesh>

          {/* Ornate Brass Handle & Backplate with subtle tactile response */}
          <group position={[isRight ? -doorWidth * 0.38 : doorWidth * 0.38, -0.05, 0.04]}>
            <mesh castShadow material={brassMaterial}>
              <boxGeometry args={[0.04, 0.22, 0.015]} />
            </mesh>
            <group ref={handleMeshRef}>
              <mesh position={[0, 0, 0.03]} rotation={[0, 0, isRight ? 0.3 : -0.3]} castShadow material={brassMaterial}>
                <cylinderGeometry args={[0.014, 0.014, 0.12, 16]} />
              </mesh>
            </group>

            {/* Subtle soft shimmer highlight on handle when hovered (refined physical hint, NO glare) */}
            {isHovered && (
              <pointLight
                position={[0, 0, 0.08]}
                color="#FFE6B8"
                intensity={0.05}
                distance={0.35}
              />
            )}
          </group>
        </group>
      </group>
    </group>
  );
}
