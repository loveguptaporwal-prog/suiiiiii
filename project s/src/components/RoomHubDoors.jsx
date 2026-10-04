import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { worldEventBus } from '../systems/WorldEventBus.js';
import { soundEngine } from '../systems/SoundSystem.js';

// --------------------------------------------------------------------------
// Architectural Interior Room Door with Wide Swing & Realistic Sound
// --------------------------------------------------------------------------
function ArchitecturalRoomDoor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  initialState = 'closed',
  doorId = 'hub_door',
  doorTitle = 'ROOM',
  doorWidth = 0.96,
}) {
  const doorHeight = 2.45;
  const doorThickness = 0.05;
  const isMemoryGalleryDoor = doorId === 'north_corridor_door';

  const getTargetAngle = (state) => {
    switch (state) {
      case 'closed': return 0.0;
      case 'ajar': return 0.42;
      case 'open': return 1.55; // Wide 90-degree swing for comfortable walking passage
      default: return 0.0;
    }
  };

  const [doorState, setDoorState] = useState(initialState);
  const targetAngleRef = useRef(getTargetAngle(initialState));
  const currentAngleRef = useRef(getTargetAngle(initialState));
  const [isHovered, setIsHovered] = useState(false);
  const doorGroupRef = useRef();

  const toggleDoor = () => {
    const nextState = doorState === 'open' ? 'closed' : 'open';
    if (nextState === 'open') {
      soundEngine.playDoorOpen();
    } else {
      soundEngine.playDoorClose();
    }
    setDoorState(nextState);
    targetAngleRef.current = getTargetAngle(nextState);
    worldEventBus.emit('DOOR_STATE_CHANGED', { doorId, state: nextState });
  };

  useEffect(() => {
    const unsub = worldEventBus.on('REQUEST_TOGGLE_DOOR', (data) => {
      if (data && data.doorId === doorId) {
        toggleDoor();
      }
    });
    return () => unsub && unsub();
  }, [doorId, doorState]);

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isMemoryGalleryDoor ? '#D8C6AE' : '#FFF9F5',
    roughness: 0.38,
    metalness: 0.02,
  }), [isMemoryGalleryDoor]);

  const doorWoodMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isMemoryGalleryDoor ? '#4B2830' : '#FFF6F0',
    roughness: isMemoryGalleryDoor ? 0.55 : 0.36,
    metalness: isMemoryGalleryDoor ? 0.12 : 0.02,
  }), [isMemoryGalleryDoor]);

  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isMemoryGalleryDoor ? '#623640' : '#FCECEF',
    roughness: isMemoryGalleryDoor ? 0.48 : 0.42,
    metalness: isMemoryGalleryDoor ? 0.08 : 0.02,
  }), [isMemoryGalleryDoor]);

  const brassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37',
    metalness: 0.88,
    roughness: 0.20,
  }), []);

  const rubyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1234',
    roughness: 0.5,
  }), []);

  useFrame((_, delta) => {
    const speed = 3.2;
    currentAngleRef.current = THREE.MathUtils.lerp(
      currentAngleRef.current,
      targetAngleRef.current,
      1 - Math.exp(-speed * delta)
    );
    if (doorGroupRef.current) {
      doorGroupRef.current.rotation.y = currentAngleRef.current;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDoor();
  };

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Classical Molded Door Frame Surrounding Opening */}
      <group position={[0, doorHeight / 2, 0]}>
        {/* Left Jamb */}
        <mesh position={[-doorWidth / 2 - 0.06, 0, 0]} castShadow material={frameMat}>
          <boxGeometry args={[0.12, doorHeight + 0.12, 0.14]} />
        </mesh>
        {/* Right Jamb */}
        <mesh position={[doorWidth / 2 + 0.06, 0, 0]} castShadow material={frameMat}>
          <boxGeometry args={[0.12, doorHeight + 0.12, 0.14]} />
        </mesh>
        {/* Header Beam */}
        <mesh position={[0, doorHeight / 2 + 0.06, 0]} castShadow material={frameMat}>
          <boxGeometry args={[doorWidth + 0.24, 0.14, 0.15]} />
        </mesh>
        {/* Classical Crown Cornice Header */}
        <mesh position={[0, doorHeight / 2 + 0.15, 0.01]} material={brassMat}>
          <boxGeometry args={[doorWidth + 0.24, 0.04, 0.16]} />
        </mesh>

        {/* Room Title Plaque above door */}
        <group position={[0, doorHeight / 2 + 0.28, 0.04]}>
          <mesh material={brassMat}>
            <boxGeometry args={[0.92, 0.18, 0.015]} />
          </mesh>
          <mesh position={[0, 0, 0.01]} material={rubyMat}>
            <boxGeometry args={[0.88, 0.14, 0.008]} />
          </mesh>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.065}
            color="#FFF8E8"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            letterSpacing={0.06}
          >
            {doorTitle}
          </Text>
        </group>
      </group>

      {isMemoryGalleryDoor && (
        <group>
          {[-1, 1].map((side) => (
            <group key={`gallery-door-side-panel-${side}`} position={[side * 0.94, 1.25, -0.1]}>
              <mesh castShadow material={rubyMat}>
                <boxGeometry args={[0.42, 1.72, 0.055]} />
              </mesh>
              {[
                [0, 0.82, 0.42, 0.025],
                [0, -0.82, 0.42, 0.025],
                [-0.19, 0, 0.025, 1.62],
                [0.19, 0, 0.025, 1.62],
              ].map(([x, y, width, height], index) => (
                <mesh
                  key={`gallery-door-side-inlay-${side}-${index}`}
                  position={[x, y, -0.034]}
                  material={brassMat}
                >
                  <boxGeometry args={[width, height, 0.014]} />
                </mesh>
              ))}
              <mesh position={[0, 0, -0.034]} material={panelMat}>
                <boxGeometry args={[0.28, 1.42, 0.012]} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 2. Soft Light Spilling through Doorway (active when door is open) */}
      {doorState === 'open' && (
        <pointLight
          position={[0, 1.4, -0.6]}
          color={doorId === 'east_corridor_door' ? '#E040FB' : doorId === 'north_corridor_door' ? '#80D8FF' : '#FFA726'}
          intensity={0.65}
          distance={3.5}
        />
      )}

      {/* 3. The Physical Swinging Door Leaf */}
      <group
        position={[-doorWidth / 2, 0, 0]}
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
        onClick={handleClick}
      >
        <group ref={doorGroupRef}>
          {/* Main Leaf Body */}
          <group position={[doorWidth / 2, doorHeight / 2 + 0.02, 0]}>
            <mesh castShadow receiveShadow material={doorWoodMat}>
              <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
            </mesh>

            {isMemoryGalleryDoor && (
              <group position={[0, 1.02, -0.04]}>
                <mesh castShadow material={brassMat}>
                  <boxGeometry args={[0.50, 0.20, 0.024]} />
                </mesh>
                <mesh position={[0, 0, -0.018]}>
                  <boxGeometry args={[0.46, 0.16, 0.012]} />
                  <meshStandardMaterial color="#174832" metalness={0.12} roughness={0.45} />
                </mesh>
                <Text
                  position={[0, 0, -0.026]}
                  rotation={[0, Math.PI, 0]}
                  fontSize={0.105}
                  color="#F4F0D0"
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                  letterSpacing={0.06}
                >
                  EXIT
                </Text>
              </group>
            )}

            {/* Recessed Molded Boiserie Panels */}
            {[-0.6, 0.45].map((py, idx) => (
              <group key={idx} position={[0, py, 0]}>
                <mesh position={[0, 0, 0.014]} castShadow material={panelMat}>
                  <boxGeometry args={[doorWidth * 0.76, 0.85, 0.015]} />
                </mesh>
                <mesh position={[0, 0, -0.014]} castShadow material={panelMat}>
                  <boxGeometry args={[doorWidth * 0.76, 0.85, 0.015]} />
                </mesh>
                {isMemoryGalleryDoor && [-1, 1].flatMap((face) => ([
                  [0, 0.42, doorWidth * 0.78, 0.018],
                  [0, -0.42, doorWidth * 0.78, 0.018],
                  [-doorWidth * 0.39, 0, 0.018, 0.84],
                  [doorWidth * 0.39, 0, 0.018, 0.84],
                ].map(([x, y, width, height], railIndex) => (
                  <mesh
                    key={`memory-door-inlay-${idx}-${face}-${railIndex}`}
                    position={[x, y, face * 0.035]}
                    material={brassMat}
                  >
                    <boxGeometry args={[width, height, 0.012]} />
                  </mesh>
                ))))}
              </group>
            ))}

            {isMemoryGalleryDoor ? (
              [-1, 1].map((face) => (
                <group
                  key={`memory-door-handle-${face}`}
                  position={[doorWidth * 0.38, -0.05, face * 0.035]}
                >
                  <mesh rotation={[Math.PI / 2, 0, 0]} material={brassMat}>
                    <cylinderGeometry args={[0.055, 0.055, 0.018, 20]} />
                  </mesh>
                  <mesh position={[0.07, 0, face * 0.025]} material={brassMat}>
                    <boxGeometry args={[0.15, 0.028, 0.035]} />
                  </mesh>
                  {isHovered && (
                    <pointLight
                      position={[0.07, 0, face * 0.06]}
                      color="#FFE6B8"
                      intensity={0.12}
                      distance={0.5}
                    />
                  )}
                </group>
              ))
            ) : (
              <group position={[doorWidth * 0.38, -0.05, 0.035]}>
                <mesh material={brassMat}>
                  <boxGeometry args={[0.038, 0.20, 0.012]} />
                </mesh>
                <mesh position={[0, 0, 0.02]} rotation={[0, 0, -0.2]} material={brassMat}>
                  <cylinderGeometry args={[0.012, 0.012, 0.11, 12]} />
                </mesh>
                {isHovered && (
                  <pointLight
                    position={[0, 0, 0.06]}
                    color="#FFE6B8"
                    intensity={0.12}
                    distance={0.5}
                  />
                )}
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

// --------------------------------------------------------------------------
// Main Component: RoomHubDoors
// Integrates physical architectural doors leading to the 3 new rooms
// --------------------------------------------------------------------------
export function RoomHubDoors() {
  return (
    <group name="room-hub-doors">
      {/* 1. WEST CORRIDOR DOOR -> VIP GIFT & SURPRISE LOUNGE */}
      <ArchitecturalRoomDoor
        position={[-6.92, 0, -4.5]}
        rotation={[0, Math.PI / 2, 0]}
        initialState="closed"
        doorId="west_corridor_door"
        doorTitle="VIP GIFT LOUNGE"
      />

      {/* 2. EAST CORRIDOR DOOR -> DISCO & DANCE CLUB */}
      <ArchitecturalRoomDoor
        position={[6.92, 0, -4.5]}
        rotation={[0, -Math.PI / 2, 0]}
        initialState="closed"
        doorId="east_corridor_door"
        doorTitle="DANCE CLUB"
      />

      {/* 3. NORTH CORRIDOR DOOR -> MEMORY GALLERY */}
      <ArchitecturalRoomDoor
        position={[-5.2, 0, -13.42]}
        rotation={[0, 0, 0]}
        initialState="closed"
        doorId="north_corridor_door"
        doorTitle="MEMORY GALLERY"
        doorWidth={1.16}
      />
    </group>
  );
}
