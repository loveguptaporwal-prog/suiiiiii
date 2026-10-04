import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { worldEventBus } from '../systems/WorldEventBus.js';
import { soundEngine } from '../systems/SoundSystem.js';

function HandCakeWedge({ position = [0, 0, 0], radius, height, thetaStart, thetaLength, material }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const startAngle = thetaStart - Math.PI / 2;
    shape.moveTo(0, 0);
    shape.lineTo(radius * Math.sin(thetaStart), -radius * Math.cos(thetaStart));
    shape.absarc(0, 0, radius, startAngle, startAngle + thetaLength, false);
    shape.lineTo(0, 0);
    shape.closePath();

    const wedge = new THREE.ExtrudeGeometry(shape, {
      bevelEnabled: false,
      curveSegments: 16,
      depth: height,
    });
    wedge.rotateX(-Math.PI / 2);
    wedge.translate(0, -height / 2, 0);
    return wedge;
  }, [height, radius, thetaLength, thetaStart]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <mesh position={position} geometry={geometry} castShadow receiveShadow material={material} />;
}

export function FirstPersonInteractionHand() {
  const groupRef = useRef();
  const [holdingItem, setHoldingItem] = useState('none'); // 'none', 'knife', 'slice'
  const [cutAnimProgress, setCutAnimProgress] = useState(0); // 0 to 1
  const [isCutting, setIsCutting] = useState(false);
  const [isServing, setIsServing] = useState(false);
  const [serveProgress, setServeProgress] = useState(0);
  const [isEating, setIsEating] = useState(false);
  const [eatProgress, setEatProgress] = useState(0);
  const [bitesTaken, setBitesTaken] = useState(0);

  // Materials
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FDE0CD',
    roughness: 0.62,
    metalness: 0.02,
  }), []);

  const sleeveMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF9',
    roughness: 0.55,
  }), []);

  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    metalness: 0.98,
    roughness: 0.04,
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.92,
    roughness: 0.16,
  }), []);

  const pearlMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF5',
    roughness: 0.20,
    metalness: 0.15,
  }), []);

  const plateMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDFC',
    roughness: 0.18,
    metalness: 0.05,
  }), []);

  const redVelvetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1234',
    roughness: 0.68,
  }), []);

  const creamMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFBF5',
    roughness: 0.45,
  }), []);

  // Listen to world events
  useEffect(() => {
    const unsubs = [];

    unsubs.push(
      worldEventBus.on('KNIFE_PICKED_UP', () => {
        setHoldingItem('knife');
      })
    );

    unsubs.push(
      worldEventBus.on('SLICE_PICKED_UP', () => {
        setHoldingItem('slice');
        setBitesTaken(0);
      })
    );

    unsubs.push(
      worldEventBus.on('REQUEST_CUT_CAKE', () => {
        if (!isCutting) {
          setHoldingItem('knife');
          setIsCutting(true);
          setCutAnimProgress(0);
        }
      })
    );

    unsubs.push(
      worldEventBus.on('REQUEST_SERVE_SLICE', (data) => {
        if (holdingItem === 'slice' && !isServing) {
          setIsServing(true);
          setServeProgress(0);
          setTimeout(() => {
            worldEventBus.emit('SLICE_SERVED', { recipientId: data.recipientId });
            setHoldingItem('none');
            setIsServing(false);
          }, 900);
        }
      })
    );

    unsubs.push(
      worldEventBus.on('REQUEST_EAT_SLICE', () => {
        if (holdingItem === 'slice' && !isEating) {
          setIsEating(true);
          setEatProgress(0);
          soundEngine.playBite();
          setTimeout(() => {
            soundEngine.playBite();
            setBitesTaken(1);
          }, 450);
          setTimeout(() => {
            soundEngine.playCelebration();
            setBitesTaken(2);
            setHoldingItem('none');
            setIsEating(false);
            worldEventBus.emit('SLICE_SERVED', { recipientId: 'self' });
          }, 1100);
        }
      })
    );

    unsubs.push(
      worldEventBus.on('RESET_CAKE', () => {
        setHoldingItem('none');
        setIsCutting(false);
        setIsServing(false);
        setIsEating(false);
        setBitesTaken(0);
      })
    );

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [holdingItem, isCutting, isServing, isEating]);

  // Inertia sway and breathing offset refs
  const swayRef = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const cam = state.camera;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    // Smoothly follow camera with zero 1-frame latency (priority 1)
    groupRef.current.position.copy(cam.position);
    groupRef.current.quaternion.copy(cam.quaternion);

    // Natural subtle breathing sway
    const breathY = Math.sin(t * 1.8) * 0.004;
    const breathX = Math.cos(t * 1.2) * 0.003;
    swayRef.current.y = THREE.MathUtils.lerp(swayRef.current.y, breathY, 1 - Math.exp(-6 * dt));
    swayRef.current.x = THREE.MathUtils.lerp(swayRef.current.x, breathX, 1 - Math.exp(-6 * dt));

    // Cutting motion animation loop (ultra-smooth sinusoidal easing)
    if (isCutting) {
      setCutAnimProgress((prev) => {
        const next = prev + dt * 2.2;
        if (next >= 1.0) {
          setIsCutting(false);
          worldEventBus.emit('CAKE_CUT');
          soundEngine.playCakeCut();
          setHoldingItem('none');
          return 0;
        }
        return next;
      });
    }

    // Serving forward handoff animation
    if (isServing) {
      setServeProgress((prev) => Math.min(1.0, prev + dt * 2.0));
    }

    // Eating towards camera animation
    if (isEating) {
      setEatProgress((prev) => Math.min(1.0, prev + dt * 1.8));
    }
  }, 1);

  if (holdingItem === 'none') return null;

  // Base resting hand offset relative to camera
  let posX = 0.28 + swayRef.current.x;
  let posY = -0.26 + swayRef.current.y;
  let posZ = -0.52;
  let rotX = -0.15;
  let rotY = -0.10;
  let rotZ = 0.05;

  // 1. Cutting motion calculation (Down -> Forward -> Settle)
  if (isCutting) {
    const p = cutAnimProgress;
    posY = -0.26 - Math.sin(p * Math.PI) * 0.16;
    posZ = -0.52 - Math.sin(p * Math.PI) * 0.18;
    rotX = -0.15 - Math.sin(p * Math.PI) * 0.45;
  }

  // 2. Serving motion calculation (Extend arm forward towards family member)
  if (isServing) {
    const s = Math.sin(serveProgress * Math.PI);
    posX = 0.28 - s * 0.15;
    posY = -0.26 + s * 0.10;
    posZ = -0.52 - s * 0.35;
    rotX = -0.15 + s * 0.20;
  }

  // 3. Eating motion calculation (Lift slice close to camera)
  if (isEating) {
    const e = Math.sin(eatProgress * Math.PI);
    posX = 0.28 - e * 0.18;
    posY = -0.26 + e * 0.22;
    posZ = -0.52 + e * 0.24;
    rotX = -0.15 + e * 0.35;
  }

  return (
    <group ref={groupRef}>
      <group position={[posX, posY, posZ]} rotation={[rotX, rotY, rotZ]}>
        {/* PLAYER FOREARM & SLEEVE */}
        <mesh position={[0.06, -0.16, 0.18]} rotation={[0.4, 0, 0]} material={sleeveMat}>
          <cylinderGeometry args={[0.055, 0.065, 0.32, 16]} />
        </mesh>
        <mesh position={[0.06, -0.01, 0.04]} rotation={[0.4, 0, 0]} material={sleeveMat}>
          <torusGeometry args={[0.058, 0.012, 8, 16]} />
        </mesh>

        {/* PLAYER HAND (Stylized, warm, closed around item) */}
        <mesh position={[0.04, 0.04, -0.02]} material={skinMat}>
          <sphereGeometry args={[0.045, 14, 14]} scale={[0.9, 1.1, 1.2]} />
        </mesh>
        {/* Curled Fingers */}
        <mesh position={[0.02, 0.06, -0.06]} rotation={[0.4, 0, 0]} material={skinMat}>
          <capsuleGeometry args={[0.018, 0.05, 6, 10]} rotation={[0, 0, Math.PI / 2]} />
        </mesh>
        {/* Thumb */}
        <mesh position={[0.07, 0.07, -0.02]} rotation={[-0.2, 0.4, 0.3]} material={skinMat}>
          <capsuleGeometry args={[0.014, 0.04, 6, 8]} />
        </mesh>

        {/* ITEM 1: CEREMONIAL CAKE KNIFE */}
        {holdingItem === 'knife' && (
          <group position={[0.02, 0.06, -0.04]} rotation={[0.3, -0.2, -0.1]}>
            {/* Pearl Handle */}
            <mesh position={[0, -0.04, 0.06]} material={pearlMat}>
              <capsuleGeometry args={[0.014, 0.12, 6, 12]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
            {/* Gold Guard */}
            <mesh position={[0, -0.04, -0.01]} material={goldMat}>
              <boxGeometry args={[0.048, 0.012, 0.010]} />
            </mesh>
            {/* Polished Blade Extending Forward */}
            <mesh position={[0, -0.04, -0.15]} rotation={[-Math.PI / 2, 0, 0]} material={steelMat}>
              <boxGeometry args={[0.004, 0.26, 0.042]} />
            </mesh>
            <mesh position={[0, -0.04, -0.29]} rotation={[0.42, 0, 0]} material={steelMat}>
              <boxGeometry args={[0.004, 0.040, 0.042]} />
            </mesh>
          </group>
        )}

        {/* ITEM 2: DESSERT PLATE WITH CAKE SLICE */}
        {holdingItem === 'slice' && (
          <group position={[0, 0.16, -0.14]} rotation={[0.1, 0, 0]}>
            {/* Fine Porcelain Saucer */}
            <mesh material={plateMat} receiveShadow>
              <cylinderGeometry args={[0.11, 0.08, 0.014, 24]} />
            </mesh>
            <mesh position={[0, 0.008, 0]} material={goldMat}>
              <torusGeometry args={[0.108, 0.003, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>

            {/* Solid layered wedge with the broad cut face turned toward the player */}
            {bitesTaken < 2 && (
              <group position={[0, 0.01, -0.015]}>
                <HandCakeWedge
                  radius={0.098}
                  height={bitesTaken === 1 ? 0.044 : 0.074}
                  thetaStart={-Math.PI / 12}
                  thetaLength={Math.PI / 6}
                  material={redVelvetMat}
                />
                {bitesTaken === 0 && (
                  <HandCakeWedge
                    radius={0.099}
                    height={0.009}
                    thetaStart={-Math.PI / 12}
                    thetaLength={Math.PI / 6}
                    material={creamMat}
                    position={[0, 0.0415, 0]}
                  />
                )}
                <HandCakeWedge
                  radius={0.099}
                  height={0.008}
                  thetaStart={-Math.PI / 12}
                  thetaLength={Math.PI / 6}
                  material={creamMat}
                  position={[0, bitesTaken === 1 ? 0.026 : 0.0415, 0]}
                />
                <group position={[0, bitesTaken === 1 ? 0.031 : 0.0465, 0]}>
                  <HandCakeWedge
                    radius={0.099}
                    height={0.003}
                    thetaStart={-Math.PI / 12}
                    thetaLength={Math.PI / 6}
                    material={creamMat}
                  />
                </group>
              </group>
            )}
          </group>
        )}
      </group>
    </group>
  );
}
