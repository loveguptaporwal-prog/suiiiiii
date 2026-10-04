import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { worldEventBus } from '../systems/WorldEventBus.js';
import { soundEngine } from '../systems/SoundSystem.js';

// --------------------------------------------------------------------------
// Crumb & Frosting Particle Burst on Cake Cut
// --------------------------------------------------------------------------
function CrumbParticleBurst({ active, position = [0, 1.0, 0.2] }) {
  const groupRef = useRef();
  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < 22; i++) {
      list.push({
        pos: [0, 0, 0],
        vel: [
          (Math.random() - 0.5) * 0.4,
          Math.random() * 0.35 + 0.1,
          Math.random() * 0.3 + 0.1,
        ],
        scale: Math.random() * 0.012 + 0.006,
        color: Math.random() > 0.4 ? '#8A1234' : '#F4CF7F',
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    if (!active || !groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      p.pos[0] += p.vel[0] * dt;
      p.pos[1] += p.vel[1] * dt;
      p.pos[2] += p.vel[2] * dt;
      p.vel[1] -= 0.98 * dt; // gravity
      child.position.set(p.pos[0], p.pos[1], p.pos[2]);
      child.scale.multiplyScalar(0.96);
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={`crumb-${i}`}>
          <sphereGeometry args={[p.scale, 6, 6]} />
          <meshBasicMaterial color={p.color} />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// Smoke Wisps when Candles are Extinguished
// --------------------------------------------------------------------------
function CandleSmokeEffect({ active, position = [0, 1.48, 0] }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!active || !groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    groupRef.current.children.forEach((child, i) => {
      child.position.y += dt * (0.25 + i * 0.05);
      child.position.x += Math.sin(state.clock.elapsedTime * 3 + i) * 0.003;
      child.scale.multiplyScalar(1.015);
      if (child.material.opacity > 0.005) {
        child.material.opacity -= dt * 0.4;
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={position}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`smoke-${i}`} position={[(Math.random() - 0.5) * 0.1, i * 0.04, (Math.random() - 0.5) * 0.1]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="#DDD" transparent opacity={0.65} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// --------------------------------------------------------------------------
// 1. SINGLE-TIER BIRTHDAY CAKE WITH CANDLES & SEPARABLE SLICE
// --------------------------------------------------------------------------
const CAKE_WEDGES = Array.from({ length: 12 }, (_, id) => ({
  id,
  centerAngle: Math.PI + (id * Math.PI) / 6,
  name: `Cake Slice ${id + 1}`,
}));

function SolidCakeWedge({ radius, height, thetaStart, thetaLength, material }) {
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
      curveSegments: 24,
      depth: height,
    });
    wedge.rotateX(-Math.PI / 2);
    wedge.translate(0, -height / 2, 0);
    return wedge;
  }, [height, radius, thetaLength, thetaStart]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <mesh geometry={geometry} castShadow receiveShadow material={material} />;
}

function CakeTopTrimWedge({ thetaStart, thetaLength, centerAngle, roseIcingMat, goldDrageeMat }) {
  return (
    <group position={[0, 0.305, 0]}>
      <group rotation={[0, thetaStart - Math.PI / 2, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={roseIcingMat}>
          <torusGeometry args={[0.405, 0.012, 10, 16, thetaLength]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={goldDrageeMat}>
          <torusGeometry args={[0.424, 0.003, 8, 16, thetaLength]} />
        </mesh>
      </group>
      <group position={[Math.sin(centerAngle) * 0.335, 0.004, Math.cos(centerAngle) * 0.335]}>
        <mesh material={roseIcingMat}>
          <sphereGeometry args={[0.027, 12, 10]} />
        </mesh>
        <mesh position={[0, 0.019, 0]} material={goldDrageeMat}>
          <sphereGeometry args={[0.008, 8, 8]} />
        </mesh>
      </group>
    </group>
  );
}

function TieredBirthdayCake({
  position = [0, 0.88, 0],
  candlesLit = false,
  onToggleCandles,
  isKnifePickedUp = false,
  onPickupKnife,
  slicesCut = 0,
  slicesTaken = 0,
  onCutCake,
  onTakeSlice,
}) {
  const sliceAngle = Math.PI / 6; // 30 degrees per wedge for smaller servings
  const activeSliceIndex = Math.min(CAKE_WEDGES.length - 1, slicesCut - 1);
  // Slice slide animation ref
  const activeSlideOffsetRef = useRef(0);
  const activeSliceGroupRef = useRef();
  const [showCrumbs, setShowCrumbs] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  // Flame animation refs — always mounted, scale animated in/out for smooth ignition
  const flameLightsRef = useRef([]);
  const flameGroupRefs = useRef([]);
  const flameScalesRef = useRef(Array(7).fill(0));
  const candleFocalLightRef = useRef();

  // Reset slide offset whenever a new slice is cut and trigger crumb burst
  useEffect(() => {
    activeSlideOffsetRef.current = 0.0;
    if (slicesCut > 0) {
      setShowCrumbs(true);
      const timer = setTimeout(() => setShowCrumbs(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [slicesCut]);

  // Smoke wisps effect whenever candles are blown out
  useEffect(() => {
    const unsub = worldEventBus.on('CANDLES_BLOWN', () => {
      setShowSmoke(true);
      const timer = setTimeout(() => setShowSmoke(false), 2600);
      return () => clearTimeout(timer);
    });
    return () => unsub && unsub();
  }, []);

  // Gourmet Materials — envMapIntensity makes them catch IBL
  const buttercreamMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFBF5',
    roughness: 0.46,
    metalness: 0.02,
    envMapIntensity: 0.6,
  }), []);

  const redVelvetCoreMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1234',
    roughness: 0.65,
    metalness: 0.02,
    envMapIntensity: 0.3,
  }), []);

  const roseIcingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E98AA8',
    roughness: 0.3,
    metalness: 0.03,
  }), []);

  const goldDrageeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.95,
    roughness: 0.12,
    envMapIntensity: 3.5,
  }), []);

  const candleWaxMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8E7',
    roughness: 0.32,
    envMapIntensity: 0.3,
  }), []);

  const unlitWickMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#2B2B2B' }), []);

  const flameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF9D2',
    emissive: '#FF9800',
    emissiveIntensity: 2.4,
    roughness: 0.1,
    transparent: true,
    opacity: 0.92,
  }), []);

  // Flame, focal light, and active slice animation
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    // Animate each candle flame scale: smooth 0→1 on ignite, 1→0 on extinguish
    const targetFlameScale = candlesLit ? 1.0 : 0.0;
    flameGroupRefs.current.forEach((group, i) => {
      if (!group) return;
      const prev = flameScalesRef.current[i];
      const next = THREE.MathUtils.lerp(prev, targetFlameScale, 1 - Math.exp(-5.5 * dt));
      flameScalesRef.current[i] = next;
      const flickerX = next * (0.86 + Math.sin(t * 9.5 + i * 1.732) * 0.10);
      const flickerY = next * (0.90 + Math.sin(t * 7.1 + i * 1.107) * 0.08);
      group.scale.set(flickerX, flickerY, flickerX);
    });

    // Per-candle point lights follow flame scale
    flameLightsRef.current.forEach((light, i) => {
      if (!light) return;
      const scale = flameScalesRef.current[i];
      light.intensity = scale * (0.20 + Math.sin(t * 6.5 + i * 1.5) * 0.05);
    });

    // Warm candle focal fill light fades in/out smoothly
    if (candleFocalLightRef.current) {
      const targetFocal = candlesLit ? 0.50 : 0.0;
      candleFocalLightRef.current.intensity = THREE.MathUtils.lerp(
        candleFocalLightRef.current.intensity,
        targetFocal,
        1 - Math.exp(-3.0 * dt)
      );
    }

    // Active slice sliding animation — slides smoothly out along its radial angle
    const hasActiveCut = slicesCut > slicesTaken && slicesCut > 0;
    if (hasActiveCut && activeSliceGroupRef.current) {
      activeSlideOffsetRef.current = THREE.MathUtils.lerp(
        activeSlideOffsetRef.current,
        0.16,
        1 - Math.exp(-4.5 * dt)
      );
      const angle = CAKE_WEDGES[activeSliceIndex].centerAngle;
      const off = activeSlideOffsetRef.current;
      activeSliceGroupRef.current.position.x = Math.sin(angle) * off;
      activeSliceGroupRef.current.position.z = Math.cos(angle) * off;
    }
  });

  const handleCandleClick = (e) => {
    e.stopPropagation();
    if (!candlesLit) {
      onToggleCandles(true);
      worldEventBus.emit('CANDLES_LIT');
    } else {
      worldEventBus.emit('REQUEST_MAKE_WISH');
    }
  };

  const handleCakeClick = (e) => {
    e.stopPropagation();
    // Allow cutting if there is no pending slice and cake is not finished
    if (slicesCut === slicesTaken && slicesCut < CAKE_WEDGES.length) {
      if (!isKnifePickedUp) {
        soundEngine.playKnifePickup();
        if (onPickupKnife) onPickupKnife();
        worldEventBus.emit('KNIFE_PICKED_UP');
        setTimeout(() => {
          worldEventBus.emit('REQUEST_CUT_CAKE');
        }, 160);
      } else {
        worldEventBus.emit('REQUEST_CUT_CAKE');
      }
    }
  };

  const handleSliceClick = (e) => {
    e.stopPropagation();
    if (slicesCut > slicesTaken) {
      soundEngine.playSliceLift();
      if (onTakeSlice) onTakeSlice();
      worldEventBus.emit('SLICE_PICKED_UP');
    }
  };

  return (
    <group position={position}>
      {/* 1. Grand Baroque Pedestal Cake Stand */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.02, 0]} material={goldDrageeMat}>
          <cylinderGeometry args={[0.28, 0.34, 0.04, 32]} />
        </mesh>
        <mesh position={[0, 0.08, 0]} material={goldDrageeMat}>
          <cylinderGeometry args={[0.08, 0.13, 0.09, 24]} />
        </mesh>
        <mesh position={[0, 0.135, 0]} receiveShadow material={goldDrageeMat}>
          <cylinderGeometry args={[0.54, 0.52, 0.025, 48]} />
        </mesh>
        <mesh position={[0, 0.145, 0]} material={goldDrageeMat}>
          <torusGeometry args={[0.535, 0.012, 10, 48]} />
        </mesh>

        {/* CEREMONIAL KNIFE RESTING ON CAKE PEDESTAL PLATTER */}
        {!isKnifePickedUp && (slicesCut === slicesTaken) && slicesCut < CAKE_WEDGES.length && (
          <group
            position={[0.26, 0.155, -0.20]}
            rotation={[0, 2.70, 0]}
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playKnifePickup();
              if (onPickupKnife) onPickupKnife();
              worldEventBus.emit('KNIFE_PICKED_UP');
            }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <mesh position={[0, 0.008, -0.10]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <boxGeometry args={[0.003, 0.20, 0.035]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.98} roughness={0.04} />
            </mesh>
            <mesh position={[0, 0.008, 0.005]} material={goldDrageeMat}>
              <boxGeometry args={[0.042, 0.010, 0.008]} />
            </mesh>
            <mesh position={[0, 0.008, 0.07]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.012, 0.10, 6, 12]} />
              <meshStandardMaterial color="#FFFDF5" roughness={0.20} metalness={0.15} />
            </mesh>
            <pointLight position={[0, 0.04, 0]} color="#FFE082" intensity={0.10} distance={0.45} />
          </group>
        )}
      </group>

      {/* --- SINGLE-TIER CAKE: six solid cuttable wedges --- */}
      <group name="single-tier-birthday-cake">
        {CAKE_WEDGES.map((w, i) => {
          const thetaStart = w.centerAngle - sliceAngle / 2;
          const thetaEnd = w.centerAngle + sliceAngle / 2;
          const isActiveCut = i === activeSliceIndex && slicesCut > slicesTaken;
          const isTaken = i < slicesTaken;
          const hasRemovedNeighbor = (neighbor) => (
            neighbor < slicesTaken || (slicesCut > slicesTaken && neighbor === activeSliceIndex)
          );
          const showFaceStart = hasRemovedNeighbor((i - 1 + CAKE_WEDGES.length) % CAKE_WEDGES.length);
          const showFaceEnd = hasRemovedNeighbor((i + 1) % CAKE_WEDGES.length);
          return (
            <React.Fragment key={`base-wedge-${w.id}`}>
              {!isTaken && !isActiveCut && (
                <group
                  onClick={handleCakeClick}
                  onPointerOver={() => { document.body.style.cursor = isKnifePickedUp ? 'pointer' : 'default'; }}
                  onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                >
                  <group position={[0, 0.22, 0]}>
                    <SolidCakeWedge
                      radius={0.44}
                      height={0.16}
                      thetaStart={thetaStart}
                      thetaLength={sliceAngle}
                      material={buttercreamMat}
                    />
                    <mesh position={[0, 0.083, 0]} material={buttercreamMat}>
                      <cylinderGeometry args={[0.44, 0.44, 0.014, 12, 1, false, thetaStart, sliceAngle]} />
                    </mesh>
                    <mesh position={[0, -0.083, 0]} material={goldDrageeMat}>
                      <cylinderGeometry args={[0.443, 0.443, 0.010, 12, 1, true, thetaStart, sliceAngle]} />
                    </mesh>
                  </group>

                  {[0.15, 0.38, 0.62, 0.85].map((frac, pearlIndex) => {
                    const angle = thetaStart + frac * sliceAngle;
                    return (
                      <mesh
                        key={`base-pearl-${i}-${pearlIndex}`}
                        position={[0.442 * Math.sin(angle), 0.22, 0.442 * Math.cos(angle)]}
                        material={goldDrageeMat}
                      >
                        <sphereGeometry args={[0.009, 8, 8]} />
                      </mesh>
                    );
                  })}

                  {[
                    [thetaStart, showFaceStart, 0.012],
                    [thetaEnd, showFaceEnd, -0.012],
                  ].map(([angle, visible, faceOffset], faceIndex) => visible && (
                    <group
                      key={`base-cut-face-${i}-${faceIndex}`}
                      position={[0, 0, faceOffset]}
                      rotation={[0, angle - Math.PI / 2, 0]}
                    >
                      <mesh position={[0.22, 0.165, 0]} material={redVelvetCoreMat}>
                        <boxGeometry args={[0.44, 0.05, 0.025]} />
                      </mesh>
                      <mesh position={[0.22, 0.20, 0]} material={buttercreamMat}>
                        <boxGeometry args={[0.44, 0.02, 0.025]} />
                      </mesh>
                      <mesh position={[0.22, 0.24, 0]} material={redVelvetCoreMat}>
                        <boxGeometry args={[0.44, 0.06, 0.025]} />
                      </mesh>
                      <mesh position={[0.22, 0.28, 0]} material={buttercreamMat}>
                        <boxGeometry args={[0.44, 0.02, 0.025]} />
                      </mesh>
                      <mesh position={[0.22, 0.295, 0]} material={buttercreamMat}>
                        <boxGeometry args={[0.44, 0.01, 0.025]} />
                      </mesh>
                    </group>
                  ))}
                  <CakeTopTrimWedge
                    thetaStart={thetaStart}
                    thetaLength={sliceAngle}
                    centerAngle={w.centerAngle}
                    roseIcingMat={roseIcingMat}
                    goldDrageeMat={goldDrageeMat}
                  />
                </group>
              )}

              {isActiveCut && (
                <group
                  ref={activeSliceGroupRef}
                  onClick={handleSliceClick}
                  onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                  onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                >
                  <group position={[0, 0.22, 0]}>
                    <SolidCakeWedge
                      radius={0.44}
                      height={0.16}
                      thetaStart={thetaStart}
                      thetaLength={sliceAngle}
                      material={buttercreamMat}
                    />
                    {[
                      [-0.053, 0.052, redVelvetCoreMat],
                      [-0.018, 0.018, buttercreamMat],
                      [0.021, 0.060, redVelvetCoreMat],
                      [0.060, 0.018, buttercreamMat],
                      [0.0745, 0.011, buttercreamMat],
                    ].map(([y, height, material], layerIndex) => (
                      <mesh
                        key={`cake-slice-layer-${layerIndex}`}
                        position={[0, y, 0]}
                        castShadow
                        receiveShadow
                        material={material}
                      >
                        <cylinderGeometry args={[0.432, 0.432, height, 20, 1, false, thetaStart, sliceAngle]} />
                      </mesh>
                    ))}
                    <mesh position={[0, 0.075, 0]} material={buttercreamMat}>
                      <cylinderGeometry args={[0.44, 0.44, 0.012, 20, 1, false, thetaStart, sliceAngle]} />
                    </mesh>
                    {[0.15, 0.38, 0.62, 0.85].map((frac, pearlIndex) => {
                      const angle = thetaStart + frac * sliceAngle;
                      return (
                        <mesh
                          key={`active-slice-pearl-${pearlIndex}`}
                          position={[0.442 * Math.sin(angle), 0, 0.442 * Math.cos(angle)]}
                          material={goldDrageeMat}
                        >
                          <sphereGeometry args={[0.009, 8, 8]} />
                        </mesh>
                      );
                    })}
                    {[thetaStart, thetaEnd].map((angle, faceIndex) => (
                      <group
                        key={`slice-cut-face-${faceIndex}`}
                        position={[0, 0, faceIndex === 0 ? 0.012 : -0.012]}
                        rotation={[0, angle - Math.PI / 2, 0]}
                      >
                        <mesh position={[0.216, -0.055, 0]} material={redVelvetCoreMat}>
                          <boxGeometry args={[0.432, 0.05, 0.025]} />
                        </mesh>
                        <mesh position={[0.216, -0.02, 0]} material={buttercreamMat}>
                          <boxGeometry args={[0.432, 0.02, 0.025]} />
                        </mesh>
                        <mesh position={[0.216, 0.02, 0]} material={redVelvetCoreMat}>
                          <boxGeometry args={[0.432, 0.06, 0.025]} />
                        </mesh>
                        <mesh position={[0.216, 0.06, 0]} material={buttercreamMat}>
                          <boxGeometry args={[0.432, 0.02, 0.025]} />
                        </mesh>
                        <mesh position={[0.216, 0.0745, 0]} material={buttercreamMat}>
                          <boxGeometry args={[0.432, 0.011, 0.025]} />
                        </mesh>
                      </group>
                    ))}
                  </group>
                  <CakeTopTrimWedge
                    thetaStart={thetaStart}
                    thetaLength={sliceAngle}
                    centerAngle={w.centerAngle}
                    roseIcingMat={roseIcingMat}
                    goldDrageeMat={goldDrageeMat}
                  />
                  <group position={[0.26 * Math.sin(w.centerAngle), 0.135, 0.26 * Math.cos(w.centerAngle)]}>
                    <mesh receiveShadow material={buttercreamMat}>
                      <cylinderGeometry args={[0.24, 0.20, 0.010, 24]} />
                    </mesh>
                    <mesh position={[0, 0.006, 0]} material={goldDrageeMat}>
                      <torusGeometry args={[0.238, 0.003, 6, 24]} />
                    </mesh>
                  </group>
                </group>
              )}
            </React.Fragment>
          );
        })}

        {Array.from({ length: 6 }, (_, i) => {
          const candleAngle = Math.PI + (i * Math.PI) / 3;
          const candleX = Math.cos(candleAngle) * 0.39;
          const candleZ = Math.sin(candleAngle) * 0.39;
          return (
            <React.Fragment key={`cake-candle-${i}`}>
              <group position={[candleX, 0.36, candleZ]} onClick={handleCandleClick}>
                <mesh castShadow material={candleWaxMat}>
                  <cylinderGeometry args={[0.011, 0.011, 0.11, 12]} />
                </mesh>
                <mesh material={goldDrageeMat}>
                  <torusGeometry args={[0.0115, 0.002, 6, 16]} rotation={[0.4, 0, 0]} />
                </mesh>
                <mesh position={[0, 0.062, 0]} material={unlitWickMat}>
                  <cylinderGeometry args={[0.002, 0.002, 0.014, 6]} />
                </mesh>
                <group
                  ref={(el) => { flameGroupRefs.current[i] = el; }}
                  position={[0, 0.072, 0]}
                  scale={[0, 0, 0]}
                >
                  <mesh material={flameMat}>
                    <coneGeometry args={[0.010, 0.028, 8]} />
                  </mesh>
                  <mesh position={[0, 0.016, 0]} material={flameMat}>
                    <sphereGeometry args={[0.009, 8, 8]} />
                  </mesh>
                </group>
                <pointLight
                  ref={(el) => { flameLightsRef.current[i] = el; }}
                  position={[0, 0.09, 0]}
                  color="#FFA834"
                  intensity={0}
                  distance={1.6}
                />
              </group>
            </React.Fragment>
          );
        })}

        {slicesTaken < CAKE_WEDGES.length && (
          <group position={[0, 0.312, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <Text
              position={[0, 0.035, 0]}
              rotation={[0, 0, Math.PI]}
              fontSize={0.064}
              maxWidth={0.66}
              lineHeight={1.05}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.025}
              color="#8A1234"
              outlineColor="#F4CF7F"
              outlineWidth={0.002}
            >
              HAPPY BIRTHDAY
              {'\n'}
              SNEHA
            </Text>
          </group>
        )}
      </group>

      {/* Crumb Burst Effect */}
      <CrumbParticleBurst active={showCrumbs} position={[0.1, 0.35, 0.25]} />

      {/* Smoke Wisps when Extinguished */}
      <CandleSmokeEffect active={showSmoke} position={[0, 0.44, 0]} />

      {/* Warm candle focal fill light — always rendered, intensity smoothly animated via ref */}
      <pointLight
        ref={candleFocalLightRef}
        position={[0, 0.44, 0]}
        color="#FFA560"
        intensity={0}
        distance={2.8}
      />
    </group>
  );
}

// --------------------------------------------------------------------------
// 2. CEREMONIAL CAKE KNIFE ON CUSHION
// --------------------------------------------------------------------------
function CeremonialCakeKnife({
  position = [0.24, 0.89, 0.44],
  rotation = [0, 0.15, 0],
  isPickedUp = false,
  onPickup,
}) {
  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    metalness: 0.99,
    roughness: 0.02,
    envMapIntensity: 4.0, // mirror-polished steel with real IBL reflections
  }), []);

  const pearlHandleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF5',
    roughness: 0.14,
    metalness: 0.22,
    envMapIntensity: 1.2,
  }), []);

  const goldBolsterMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.96,
    roughness: 0.12,
    envMapIntensity: 3.2, // gold catches IBL like precious metal
  }), []);

  const cushionVelvetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A102A',
    roughness: 0.80,
    metalness: 0.02,
    envMapIntensity: 0.1,
  }), []);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isPickedUp) {
      soundEngine.playKnifePickup();
      onPickup();
      worldEventBus.emit('KNIFE_PICKED_UP');
    }
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Ruby Velvet Ceremonial Cushion (always stays on table) */}
      <group position={[0, -0.012, 0]}>
        <mesh castShadow material={cushionVelvetMat}>
          <boxGeometry args={[0.075, 0.024, 0.24]} />
        </mesh>
        <mesh position={[0, 0.012, 0]} material={goldBolsterMat}>
          <boxGeometry args={[0.080, 0.005, 0.245]} />
        </mesh>
        {[-0.038, 0.038].map((cx, i) =>
          [-0.12, 0.12].map((cz, j) => (
            <mesh key={`tassel-${i}-${j}`} position={[cx, -0.006, cz]} material={goldBolsterMat}>
              <sphereGeometry args={[0.006, 6, 6]} />
            </mesh>
          ))
        )}
      </group>

      {/* Knife (Rendered on table ONLY if NOT picked up by player hand) */}
      {!isPickedUp && (
        <group
          onClick={handleClick}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          {/* Blade */}
          <mesh position={[0, 0.014, -0.13]} rotation={[-Math.PI / 2, 0, 0]} castShadow material={steelMat}>
            <boxGeometry args={[0.004, 0.26, 0.042]} />
          </mesh>
          <mesh position={[0, 0.014, -0.27]} rotation={[0.42, 0, 0]} castShadow material={steelMat}>
            <boxGeometry args={[0.004, 0.040, 0.042]} />
          </mesh>

          {/* Gold Bolster & Guard */}
          <mesh position={[0, 0.014, 0.005]} material={goldBolsterMat}>
            <cylinderGeometry args={[0.016, 0.016, 0.024, 14]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          <mesh position={[0, 0.014, 0.005]} material={goldBolsterMat}>
            <boxGeometry args={[0.048, 0.012, 0.010]} />
          </mesh>

          {/* Pearl Handle & Pommel */}
          <mesh position={[0, 0.014, 0.09]} castShadow material={pearlHandleMat}>
            <capsuleGeometry args={[0.014, 0.13, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          <mesh position={[0, 0.014, 0.165]} material={goldBolsterMat}>
            <sphereGeometry args={[0.016, 12, 12]} />
          </mesh>

          {/* Subtle metallic reflection glint (natural & gentle) */}
          <pointLight position={[0, 0.04, 0]} color="#FFE082" intensity={0.08} distance={0.4} />
        </group>
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// 3. OPULENT NEOCLASSICAL CAKE BANQUET TABLE
// --------------------------------------------------------------------------
export function BirthdayCakeTable({ position = [0, 0, -8.0] }) {
  const [candlesLit, setCandlesLit] = useState(false);
  const [isKnifePickedUp, setIsKnifePickedUp] = useState(false);
  const [slicesCut, setSlicesCut] = useState(0);
  const [slicesTaken, setSlicesTaken] = useState(0);

  useEffect(() => {
    const unsubs = [];
    unsubs.push(
      worldEventBus.on('CANDLES_LIT', () => {
        soundEngine.playCandleIgnite();
        setCandlesLit(true);
      })
    );
    unsubs.push(
      worldEventBus.on('CANDLES_BLOWN', () => {
        setCandlesLit(false);
        soundEngine.playCandleBlowout();
        soundEngine.playApplauseAndCheer();
        setTimeout(() => soundEngine.playHappyBirthdayMelody(), 500);
        setIsKnifePickedUp(true);
        worldEventBus.emit('KNIFE_PICKED_UP');
      })
    );
    unsubs.push(
      worldEventBus.on('KNIFE_PICKED_UP', () => {
        setIsKnifePickedUp(true);
      })
    );
    unsubs.push(
      worldEventBus.on('CAKE_CUT', () => {
        setSlicesCut((prev) => Math.min(CAKE_WEDGES.length, prev + 1));
        setIsKnifePickedUp(false);
        soundEngine.playApplauseAndCheer();
      })
    );
    unsubs.push(
      worldEventBus.on('SLICE_PICKED_UP', () => {
        setSlicesTaken((prev) => Math.min(CAKE_WEDGES.length, prev + 1));
      })
    );
    unsubs.push(
      worldEventBus.on('RESET_CAKE', () => {
        setSlicesCut(0);
        setSlicesTaken(0);
        setIsKnifePickedUp(false);
        soundEngine.playCelebration();
      })
    );
    return () => unsubs.forEach((u) => u && u());
  }, []);

  // Table Materials
  const silkClothMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF9',
    roughness: 0.58,
    metalness: 0.02,
  }), []);

  const velvetRunnerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8A1234',
    roughness: 0.72,
    metalness: 0.04,
  }), []);

  const goldTrimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4CF7F',
    metalness: 0.88,
    roughness: 0.20,
  }), []);

  const mahoganyLegMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3B1720',
    roughness: 0.32,
    metalness: 0.08,
  }), []);

  const silverMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8ECF0',
    metalness: 0.95,
    roughness: 0.12,
  }), []);

  const porcelainPlateMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDF9',
    roughness: 0.18,
    metalness: 0.04,
  }), []);

  const macaronPistachioMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#A8D5BA', roughness: 0.5 }), []);
  const macaronRoseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F48FB1', roughness: 0.5 }), []);
  const macaronLemonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFE082', roughness: 0.5 }), []);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#FFF8F5',
    transmission: 0.94,
    roughness: 0.06,
    thickness: 0.02,
    transparent: true,
    opacity: 0.88,
  }), []);

  return (
    <group position={position} name="opulent-cake-banquet-table">
      {/* 1. SOLID TABLE TOP SURFACE (3.4m long x 1.3m wide) */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow material={silkClothMat}>
        <boxGeometry args={[3.4, 0.05, 1.3]} />
      </mesh>

      {/* 2. REALISTIC SCALLOPED FABRIC DRAPE SKIRT */}
      <group position={[0, 0.66, 0]}>
        <mesh position={[0, 0, 0.64]} castShadow material={silkClothMat}>
          <boxGeometry args={[3.42, 0.34, 0.02]} />
        </mesh>
        <mesh position={[0, 0, -0.64]} castShadow material={silkClothMat}>
          <boxGeometry args={[3.42, 0.34, 0.02]} />
        </mesh>
        <mesh position={[-1.70, 0, 0]} castShadow material={silkClothMat}>
          <boxGeometry args={[0.02, 0.34, 1.30]} />
        </mesh>
        <mesh position={[1.70, 0, 0]} castShadow material={silkClothMat}>
          <boxGeometry args={[0.02, 0.34, 1.30]} />
        </mesh>

        {/* Gold Fringe */}
        <mesh position={[0, -0.17, 0.645]} material={goldTrimMat}>
          <boxGeometry args={[3.44, 0.025, 0.015]} />
        </mesh>
        <mesh position={[0, -0.17, -0.645]} material={goldTrimMat}>
          <boxGeometry args={[3.44, 0.025, 0.015]} />
        </mesh>
      </group>

      {/* 3. FOUR CARVED FLUTED MAHOGANY LEGS */}
      {[
        [-1.50, 0.52],
        [1.50, 0.52],
        [-1.50, -0.52],
        [1.50, -0.52],
      ].map(([lx, lz], i) => (
        <group key={`leg-${i}`} position={[lx, 0, lz]}>
          <mesh position={[0, 0.81, 0]} material={goldTrimMat}>
            <boxGeometry args={[0.16, 0.05, 0.16]} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow material={mahoganyLegMat}>
            <cylinderGeometry args={[0.065, 0.050, 0.72, 16]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={goldTrimMat}>
            <torusGeometry args={[0.066, 0.012, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          <mesh position={[0, 0.04, 0]} material={goldTrimMat}>
            <cylinderGeometry args={[0.075, 0.09, 0.08, 16]} />
          </mesh>
        </group>
      ))}

      {/* 4. ROYAL RUBY VELVET RUNNER */}
      <mesh position={[0, 0.876, 0]} material={velvetRunnerMat}>
        <boxGeometry args={[0.82, 0.005, 1.32]} />
      </mesh>
      {[-0.40, 0.40].map((rx, i) => (
        <mesh key={`rb-${i}`} position={[rx, 0.878, 0]} material={goldTrimMat}>
          <boxGeometry args={[0.025, 0.006, 1.32]} />
        </mesh>
      ))}

      {/* 5. HERO CENTERPIECE: Grand 3-Tier Luxury Birthday Cake */}
      <TieredBirthdayCake
        position={[0, 0.88, 0]}
        candlesLit={candlesLit}
        onToggleCandles={(lit) => setCandlesLit(lit)}
        isKnifePickedUp={isKnifePickedUp}
        onPickupKnife={() => {
          setIsKnifePickedUp(true);
          worldEventBus.emit('KNIFE_PICKED_UP');
        }}
        slicesCut={slicesCut}
        slicesTaken={slicesTaken}
        onCutCake={() => setSlicesCut((prev) => Math.min(CAKE_WEDGES.length, prev + 1))}
        onTakeSlice={() => setSlicesTaken((prev) => Math.min(CAKE_WEDGES.length, prev + 1))}
      />

      {/* 6. CEREMONIAL CAKE KNIFE ON CUSHION AT BACKWALL CUTTING EDGE */}
      <CeremonialCakeKnife
        position={[0.26, 0.89, -0.44]}
        rotation={[0, 3.0, 0]}
        isPickedUp={isKnifePickedUp || (slicesCut > slicesTaken) || slicesTaken >= CAKE_WEDGES.length}
        onPickup={() => {
          setIsKnifePickedUp(true);
          worldEventBus.emit('KNIFE_PICKED_UP');
        }}
      />

      {/* Fine Silver Cake Server on backwall left edge */}
      <group position={[-0.26, 0.89, -0.44]} rotation={[0, -3.0, 0]}>
        <mesh position={[0, 0.005, -0.06]} rotation={[-Math.PI / 2, 0, 0]} castShadow material={silverMat}>
          <boxGeometry args={[0.05, 0.14, 0.004]} />
        </mesh>
        <mesh position={[0, 0.005, 0.06]} castShadow material={goldTrimMat}>
          <cylinderGeometry args={[0.010, 0.012, 0.10, 10]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
      </group>

      {/* 7. PORCELAIN DESSERT PLATES & SILVER FORKS (At backwall cutting edge & front) */}
      {[-0.62, 0.62].map((px, i) => (
        <group key={`plate-back-${i}`} position={[px, 0.88, -0.38]}>
          <mesh receiveShadow material={porcelainPlateMat}>
            <cylinderGeometry args={[0.11, 0.09, 0.015, 24]} />
          </mesh>
          <mesh position={[0, 0.008, 0]} material={goldTrimMat}>
            <torusGeometry args={[0.108, 0.003, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Silver Fork */}
          <mesh position={[0.13, 0.006, 0]} rotation={[0, -0.1, 0]} material={silverMat}>
            <boxGeometry args={[0.014, 0.004, 0.12]} />
          </mesh>
        </group>
      ))}
      {[-0.62, 0.62].map((px, i) => (
        <group key={`plate-front-${i}`} position={[px, 0.88, 0.38]}>
          <mesh receiveShadow material={porcelainPlateMat}>
            <cylinderGeometry args={[0.11, 0.09, 0.015, 24]} />
          </mesh>
          <mesh position={[0, 0.008, 0]} material={goldTrimMat}>
            <torusGeometry args={[0.108, 0.003, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Silver Fork */}
          <mesh position={[0.13, 0.006, 0]} rotation={[0, 0.1, 0]} material={silverMat}>
            <boxGeometry args={[0.014, 0.004, 0.12]} />
          </mesh>
        </group>
      ))}

      {/* 8. VINTAGE GOLD MATCHBOX FOR LIGHTING CANDLES (Backwall side, easy reach) */}
      <group
        position={[-0.32, 0.89, -0.22]}
        rotation={[0, 0.2, 0]}
        onClick={() => {
          if (!candlesLit) {
            soundEngine.playCandleIgnite();
            setCandlesLit(true);
            worldEventBus.emit('CANDLES_LIT');
          }
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh castShadow material={goldTrimMat}>
          <boxGeometry args={[0.05, 0.02, 0.08]} />
        </mesh>
        {/* Red striker strip on side */}
        <mesh position={[0.026, 0, 0]}>
          <boxGeometry args={[0.002, 0.014, 0.07]} />
          <meshStandardMaterial color="#8A102A" roughness={0.9} />
        </mesh>
        {/* Single strike match stick resting on box */}
        <mesh position={[0, 0.012, 0]} rotation={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.06, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#E8D5B5" />
        </mesh>
        <mesh position={[0.03, 0.012, 0.006]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshStandardMaterial color="#D81B60" />
        </mesh>
      </group>

      {/* 9. THREE-TIERED CRYSTAL MACARON TOWER (Left side) */}
      <group position={[-1.15, 0.88, -0.05]}>
        <mesh position={[0, 0.02, 0]} material={glassMat}>
          <cylinderGeometry args={[0.16, 0.18, 0.03, 24]} />
        </mesh>
        <mesh position={[0, 0.10, 0]} material={glassMat}>
          <cylinderGeometry args={[0.025, 0.025, 0.16, 12]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} material={glassMat}>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 24]} />
        </mesh>
        <mesh position={[0, 0.24, 0]} material={glassMat}>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 12]} />
        </mesh>
        <mesh position={[0, 0.30, 0]} material={glassMat}>
          <cylinderGeometry args={[0.09, 0.09, 0.015, 20]} />
        </mesh>

        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={`m1-${i}`}
              position={[Math.cos(rad) * 0.12, 0.045, Math.sin(rad) * 0.12]}
              material={i % 2 === 0 ? macaronRoseMat : macaronPistachioMat}
              castShadow
            >
              <sphereGeometry args={[0.018, 12, 12]} scale={[1, 0.6, 1]} />
            </mesh>
          );
        })}
        {[30, 120, 210, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={`m2-${i}`}
              position={[Math.cos(rad) * 0.08, 0.20, Math.sin(rad) * 0.08]}
              material={i % 2 === 0 ? macaronLemonMat : macaronPistachioMat}
              castShadow
            >
              <sphereGeometry args={[0.016, 12, 12]} scale={[1, 0.6, 1]} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.32, 0]} material={macaronRoseMat} castShadow>
          <sphereGeometry args={[0.016, 12, 12]} scale={[1, 0.6, 1]} />
        </mesh>
      </group>

      {/* 10. PORCELAIN FLORAL VASE WITH PASTEL ROSES (Right side) */}
      <group position={[1.15, 0.88, -0.05]}>
        <mesh castShadow material={porcelainPlateMat}>
          <cylinderGeometry args={[0.09, 0.06, 0.24, 20]} />
        </mesh>
        <mesh position={[0, 0.10, 0]} material={goldTrimMat}>
          <torusGeometry args={[0.092, 0.008, 8, 20]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        {[
          [0, 0.16, 0],
          [-0.04, 0.14, 0.03],
          [0.04, 0.14, -0.02],
          [0.02, 0.13, 0.04],
          [-0.03, 0.13, -0.03],
        ].map(([rx, ry, rz], i) => (
          <group key={`rose-${i}`} position={[rx, ry, rz]}>
            <mesh castShadow material={macaronRoseMat}>
              <sphereGeometry args={[0.028, 12, 12]} scale={[1, 0.85, 1]} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <boxGeometry args={[0.03, 0.006, 0.03]} />
              <meshStandardMaterial color="#2E7D32" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
