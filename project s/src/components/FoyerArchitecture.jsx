import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BirthdayPortrait } from './BirthdayPortrait.jsx';
import foyerPhotoLeft from '../../her/images/photo11.jpeg';
import foyerPhotoRight from '../../her/images/photo7.jpeg';

// Side Corridor Wall Panel with refined architectural boiserie and gentle ambient sconces
function SideWallPanel({ position, rotation, isRight = false }) {
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8DED8', // Architectural champagne cream
    roughness: 0.65,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), []);

  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37', // Gilded molding trim
    metalness: 0.88,
    roughness: 0.22,
    side: THREE.DoubleSide,
  }), []);

  const boiserieMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8CBC4', // French acoustic inset panel
    roughness: 0.58,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), []);

  const goldTrimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.65,
    roughness: 0.35,
  }), []);

  const sconceMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C9A048',
    metalness: 0.75,
    roughness: 0.25,
  }), []);

  // Softened frosted glass shade - subtle warm glow, never blinding
  const sconceGlowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF9EE',
    emissive: '#FFE4B8',
    emissiveIntensity: 0.08,
    roughness: 0.4,
  }), []);

  const sconceLightRef = useRef();
  useFrame((state) => {
    if (sconceLightRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle, subtle warmth fluctuation without flaring
      sconceLightRef.current.intensity = 0.05 + Math.sin(t * 1.2 + (isRight ? 1.5 : 0)) * 0.01;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Main Wall Surface */}
      <mesh position={[0, 2.2, 0]} receiveShadow material={wallMat}>
        <planeGeometry args={[5.6, 4.6]} />
      </mesh>

      {/* Baseboard Molding along floor */}
      <mesh position={[0, 0.14, 0.03]} castShadow receiveShadow material={trimMat}>
        <boxGeometry args={[5.2, 0.28, 0.06]} />
      </mesh>
      <mesh position={[0, 0.28, 0.032]} material={goldTrimMat}>
        <boxGeometry args={[5.2, 0.015, 0.01]} />
      </mesh>

      {/* Chair Rail / Dado Molding at y = 1.05 */}
      <mesh position={[0, 1.05, 0.03]} castShadow material={trimMat}>
        <boxGeometry args={[5.2, 0.08, 0.05]} />
      </mesh>
      <mesh position={[0, 1.09, 0.032]} material={goldTrimMat}>
        <boxGeometry args={[5.2, 0.012, 0.01]} />
      </mesh>

      {/* Lower Wainscot Panels - Refined architectural boiserie (soft warm ivory, no dark vents) */}
      {[-1.6, 0, 1.6].map((x, i) => (
        <group key={`lower-${i}`} position={[x, 0.65, 0.02]}>
          {/* Outer molded border */}
          <mesh castShadow material={trimMat}>
            <boxGeometry args={[1.4, 0.62, 0.02]} />
          </mesh>
          {/* Recessed beveled inner panel */}
          <mesh position={[0, 0, 0.012]} material={boiserieMat}>
            <boxGeometry args={[1.26, 0.48, 0.012]} />
          </mesh>
          {/* Subtle delicate molding frame edge */}
          <mesh position={[0, 0.23, 0.016]} material={trimMat}>
            <boxGeometry args={[1.24, 0.016, 0.006]} />
          </mesh>
          <mesh position={[0, -0.23, 0.016]} material={trimMat}>
            <boxGeometry args={[1.24, 0.016, 0.006]} />
          </mesh>
          <mesh position={[-0.61, 0, 0.016]} material={trimMat}>
            <boxGeometry args={[0.016, 0.46, 0.006]} />
          </mesh>
          <mesh position={[0.61, 0, 0.016]} material={trimMat}>
            <boxGeometry args={[0.016, 0.46, 0.006]} />
          </mesh>
        </group>
      ))}

      {/* Upper Picture-Frame Boiserie Moldings (soft warm cream panels) */}
      {[-1.6, 0, 1.6].map((x, i) => (
        <group key={`upper-${i}`} position={[x, 2.2, 0.02]}>
          {/* Outer molded boiserie frame */}
          <mesh castShadow material={trimMat}>
            <boxGeometry args={[1.4, 1.85, 0.02]} />
          </mesh>
          {/* Recessed field in warm ivory */}
          <mesh position={[0, 0, 0.012]} material={boiserieMat}>
            <boxGeometry args={[1.26, 1.71, 0.012]} />
          </mesh>
          {/* Fine inner border trim */}
          <mesh position={[0, 0.84, 0.016]} material={trimMat}>
            <boxGeometry args={[1.24, 0.018, 0.006]} />
          </mesh>
          <mesh position={[0, -0.84, 0.016]} material={trimMat}>
            <boxGeometry args={[1.24, 0.018, 0.006]} />
          </mesh>
          <mesh position={[-0.61, 0, 0.016]} material={trimMat}>
            <boxGeometry args={[0.018, 1.68, 0.006]} />
          </mesh>
          <mesh position={[0.61, 0, 0.016]} material={trimMat}>
            <boxGeometry args={[0.018, 1.68, 0.006]} />
          </mesh>
        </group>
      ))}

      {/* Asymmetric Side Wall Treatments */}
      {!isRight ? (
        // LEFT WALL: Delicate ribbon swag & soft wall sconce
        <>
          <group position={[0, 3.1, 0.04]}>
            <mesh castShadow material={goldTrimMat}>
              <torusGeometry args={[0.32, 0.012, 8, 24, Math.PI]} />
            </mesh>
          </group>

          <group position={[0, 2.4, 0.06]}>
            <mesh castShadow material={sconceMat}>
              <boxGeometry args={[0.12, 0.28, 0.02]} />
            </mesh>
            <mesh position={[0, -0.05, 0.10]} rotation={[0.38, 0, 0]} castShadow material={sconceMat}>
              <cylinderGeometry args={[0.014, 0.014, 0.20, 12]} />
            </mesh>
            <mesh position={[0, 0.06, 0.18]} castShadow material={sconceGlowMat}>
              <coneGeometry args={[0.11, 0.16, 16, 1, true]} />
            </mesh>
            <pointLight
              ref={sconceLightRef}
              position={[0, 0.06, 0.22]}
              color="#FFE4B8"
              intensity={0.05}
              distance={1.6}
            />
          </group>
        </>
      ) : (
        // RIGHT WALL: Architectural celebration cameo medallion & soft matching sconce
        <>
          <group position={[0, 3.1, 0.04]}>
            <mesh castShadow material={goldTrimMat}>
              <torusGeometry args={[0.26, 0.014, 12, 32]} />
            </mesh>
            <mesh position={[0, 0, -0.005]} material={trimMat}>
              <circleGeometry args={[0.24, 32]} />
            </mesh>
            <mesh position={[0, 0, 0.008]} material={goldTrimMat}>
              <sphereGeometry args={[0.04, 12, 12]} />
            </mesh>
          </group>

          <group position={[0, 2.35, 0.06]}>
            <mesh castShadow material={sconceMat}>
              <boxGeometry args={[0.12, 0.28, 0.02]} />
            </mesh>
            <mesh position={[0, -0.05, 0.10]} rotation={[0.38, 0, 0]} castShadow material={sconceMat}>
              <cylinderGeometry args={[0.014, 0.014, 0.20, 12]} />
            </mesh>
            <mesh position={[0, 0.06, 0.18]} castShadow material={sconceGlowMat}>
              <coneGeometry args={[0.11, 0.16, 16, 1, true]} />
            </mesh>
            <pointLight
              ref={sconceLightRef}
              position={[0, 0.06, 0.22]}
              color="#FFE4B8"
              intensity={0.05}
              distance={1.6}
            />
          </group>
        </>
      )}

      {/* Crown Molding along ceiling */}
      <mesh position={[0, 4.35, 0.04]} castShadow material={trimMat}>
        <boxGeometry args={[5.2, 0.18, 0.08]} />
      </mesh>
    </group>
  );
}

// Classical Arched Architectural Display Niche with real depth, layered trim, and curated decor
function FacadeWallWithNiche({ position, isRight = false }) {
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8DED8',
    roughness: 0.65,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), []);

  // Subtle material variation for the recessed niche backplate: soft warm blush-plaster
  const nicheBackplateMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isRight ? '#D8CBC4' : '#DECFC8',
    roughness: 0.62,
    metalness: 0.01,
    side: THREE.DoubleSide,
  }), [isRight]);

  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D4AF37',
    metalness: 0.88,
    roughness: 0.22,
    side: THREE.DoubleSide,
  }), []);

  const boiserieMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8CBC4',
    roughness: 0.58,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), []);

  const goldAccentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.70,
    roughness: 0.30,
  }), []);

  const porcelainMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDFC',
    roughness: 0.18,
    metalness: 0.04,
  }), []);

  return (
    <group position={position}>
      {/* 1. Base Wall Structure */}
      <mesh position={[0, 2.2, 0]} receiveShadow material={wallMat}>
        <boxGeometry args={[1.9, 4.6, 0.15]} />
      </mesh>

      {/* 2. Floor-Level Baseboard Trim with Gold Molding */}
      <mesh position={[0, 0.14, 0.085]} castShadow receiveShadow material={trimMat}>
        <boxGeometry args={[1.9, 0.28, 0.04]} />
      </mesh>
      <mesh position={[0, 0.28, 0.09]} material={goldAccentMat}>
        <boxGeometry args={[1.9, 0.015, 0.01]} />
      </mesh>

      {/* 3. Lower Wainscot Panel - Authentic architectural boiserie (soft ivory, NOT dark vents) */}
      <group position={[0, 0.68, 0.08]}>
        {/* Molded outer frame */}
        <mesh castShadow material={trimMat}>
          <boxGeometry args={[1.35, 0.58, 0.02]} />
        </mesh>
        {/* Soft warm ivory recessed center field */}
        <mesh position={[0, 0, 0.012]} material={boiserieMat}>
          <boxGeometry args={[1.22, 0.46, 0.012]} />
        </mesh>
        {/* Layered inner stepped molding */}
        <mesh position={[0, 0.21, 0.016]} material={trimMat}>
          <boxGeometry args={[1.20, 0.016, 0.005]} />
        </mesh>
        <mesh position={[0, -0.21, 0.016]} material={trimMat}>
          <boxGeometry args={[1.20, 0.016, 0.005]} />
        </mesh>
        <mesh position={[-0.59, 0, 0.016]} material={trimMat}>
          <boxGeometry args={[0.016, 0.42, 0.005]} />
        </mesh>
        <mesh position={[0.59, 0, 0.016]} material={trimMat}>
          <boxGeometry args={[0.016, 0.42, 0.005]} />
        </mesh>
      </group>

      {/* 4. Dado Rail / Belt Molding at y = 1.08 */}
      <mesh position={[0, 1.08, 0.085]} castShadow material={trimMat}>
        <boxGeometry args={[1.9, 0.08, 0.04]} />
      </mesh>
      <mesh position={[0, 1.12, 0.09]} material={goldAccentMat}>
        <boxGeometry args={[1.9, 0.012, 0.01]} />
      </mesh>

      {/* 5. Architectural Display Niche with Real Alcove Depth, Layered Moldings & Curated Decor */}
      <group position={[0, 2.24, 0.08]}>
        {/* Outer Classical Molded Architrave Casing - Lower rectangular jambs */}
        <mesh position={[0, -0.06, 0.01]} castShadow material={trimMat}>
          <boxGeometry args={[1.22, 1.54, 0.025]} />
        </mesh>
        {/* Classical Arched Crown Surround on the Alcove */}
        <mesh position={[0, 0.71, 0.01]} castShadow material={trimMat}>
          <torusGeometry args={[0.50, 0.055, 16, 32, Math.PI]} />
        </mesh>
        <mesh position={[0, 0.71, 0.016]} material={goldAccentMat}>
          <torusGeometry args={[0.50, 0.008, 8, 32, Math.PI]} />
        </mesh>

        {/* Stepped Inner Molded Bevel (recess reveal) */}
        <mesh position={[0, -0.06, -0.015]} material={trimMat}>
          <boxGeometry args={[1.08, 1.44, 0.02]} />
        </mesh>

        {/* Recessed Niche Backplate - Set deeply back at z = -0.06 for genuine physical depth */}
        <mesh position={[0, -0.06, -0.06]} receiveShadow material={nicheBackplateMat}>
          <boxGeometry args={[0.98, 1.40, 0.015]} />
        </mesh>
        <mesh position={[0, 0.64, -0.06]} receiveShadow material={nicheBackplateMat}>
          <circleGeometry args={[0.49, 32, 0, Math.PI]} />
        </mesh>

        {/* Subtle, Visually Quiet Inner Boiserie Relief on the backplate */}
        <mesh position={[0, 0.02, -0.052]} material={boiserieMat}>
          <boxGeometry args={[0.80, 0.94, 0.006]} />
        </mesh>
        <mesh position={[0, 0.49, -0.052]} material={boiserieMat}>
          <circleGeometry args={[0.40, 24, 0, Math.PI]} />
        </mesh>

        {/* Beveled Side Reveals (inner bevels giving realistic alcove depth & soft shadows) */}
        <mesh position={[-0.49, 0.06, -0.025]} rotation={[0, Math.PI / 4, 0]} material={trimMat}>
          <boxGeometry args={[0.08, 1.40, 0.015]} />
        </mesh>
        <mesh position={[0.49, 0.06, -0.025]} rotation={[0, -Math.PI / 4, 0]} material={trimMat}>
          <boxGeometry args={[0.08, 1.40, 0.015]} />
        </mesh>

        {/* Sculpted Marble Display Shelf with Supporting Corbel Brackets */}
        <mesh position={[0, -0.42, 0.03]} castShadow receiveShadow material={trimMat}>
          <boxGeometry args={[0.88, 0.045, 0.14]} />
        </mesh>
        <mesh position={[0, -0.445, 0.03]} material={goldAccentMat}>
          <boxGeometry args={[0.90, 0.01, 0.145]} />
        </mesh>
        {/* Corbel brackets under the shelf */}
        <mesh position={[-0.30, -0.49, 0.01]} castShadow material={trimMat}>
          <boxGeometry args={[0.06, 0.08, 0.08]} />
        </mesh>
        <mesh position={[0.30, -0.49, 0.01]} castShadow material={trimMat}>
          <boxGeometry args={[0.06, 0.08, 0.08]} />
        </mesh>

        {/* --- CURATED, ASYMMETRICAL DISPLAY OBJECTS (NO HARSH BULBS/LIGHTS IN NICHE) --- */}
        {!isRight ? (
          // LEFT NICHE: Elegant classical fluted porcelain vase with delicate rose & antique keepsake clock
          <group position={[0, -0.40, 0.04]}>
            {/* Fluted porcelain bud vase */}
            <group position={[-0.14, 0, 0]}>
              <mesh position={[0, 0.02, 0]} material={goldAccentMat}>
                <cylinderGeometry args={[0.05, 0.06, 0.02, 20]} />
              </mesh>
              <mesh position={[0, 0.13, 0]} castShadow material={porcelainMat}>
                <cylinderGeometry args={[0.038, 0.055, 0.20, 24]} />
              </mesh>
              <mesh position={[0, 0.23, 0]} material={goldAccentMat}>
                <torusGeometry args={[0.038, 0.006, 8, 20]} />
              </mesh>
              {/* Single refined blush rose bloom */}
              <mesh position={[0, 0.29, 0.01]} castShadow>
                <sphereGeometry args={[0.048, 16, 16]} />
                <meshStandardMaterial color="#FF7597" roughness={0.38} />
              </mesh>
              {/* Gilded leaf sprig */}
              <mesh position={[0.03, 0.26, -0.01]} rotation={[0.2, 0.1, 0.4]} material={goldAccentMat}>
                <boxGeometry args={[0.025, 0.07, 0.003]} />
              </mesh>
            </group>

            {/* Arched antique celebration timepiece / miniature desk clock on shelf */}
            <group position={[0.16, 0, 0]}>
              {/* Gold arch body */}
              <mesh position={[0, 0.10, 0]} castShadow material={goldAccentMat}>
                <boxGeometry args={[0.14, 0.18, 0.05]} />
              </mesh>
              <mesh position={[0, 0.19, 0]} castShadow material={goldAccentMat}>
                <cylinderGeometry args={[0.07, 0.07, 0.05, 20, 1, false, 0, Math.PI]} rotation={[Math.PI / 2, 0, 0]} />
              </mesh>
              {/* Ivory clock face */}
              <mesh position={[0, 0.11, 0.028]} material={porcelainMat}>
                <circleGeometry args={[0.052, 20]} />
              </mesh>
              {/* Clock hands */}
              <mesh position={[0, 0.11, 0.031]} material={goldAccentMat}>
                <boxGeometry args={[0.005, 0.04, 0.002]} />
              </mesh>
            </group>
          </group>
        ) : (
          // RIGHT NICHE: Luxury birthday favor box & freestanding celebration cameo
          <group position={[0, -0.40, 0.04]}>
            {/* Luxury square favor box with satin ruby ribbon & gold bow */}
            <group position={[-0.14, 0, 0]}>
              <mesh position={[0, 0.08, 0]} castShadow>
                <boxGeometry args={[0.17, 0.15, 0.15]} />
                <meshStandardMaterial color="#FFF8F4" roughness={0.42} />
              </mesh>
              {/* Ruby satin ribbon */}
              <mesh position={[0, 0.08, 0]}>
                <boxGeometry args={[0.035, 0.154, 0.154]} />
                <meshStandardMaterial color="#C2185B" roughness={0.35} />
              </mesh>
              {/* Miniature gold bow knot */}
              <mesh position={[0, 0.165, 0]} material={goldAccentMat}>
                <sphereGeometry args={[0.02, 10, 10]} />
              </mesh>
              <mesh position={[-0.03, 0.175, 0]} rotation={[0, 0, 0.4]} material={goldAccentMat}>
                <torusGeometry args={[0.022, 0.006, 8, 16]} />
              </mesh>
              <mesh position={[0.03, 0.175, 0]} rotation={[0, 0, -0.4]} material={goldAccentMat}>
                <torusGeometry args={[0.022, 0.006, 8, 16]} />
              </mesh>
            </group>

            {/* Freestanding gilded celebration cameo plaque on pedestal */}
            <group position={[0.15, 0, 0]}>
              <mesh position={[0, 0.02, 0]} material={goldAccentMat}>
                <cylinderGeometry args={[0.045, 0.055, 0.02, 16]} />
              </mesh>
              <mesh position={[0, 0.07, 0]} material={goldAccentMat}>
                <cylinderGeometry args={[0.008, 0.008, 0.08, 10]} />
              </mesh>
              {/* Oval framed cameo */}
              <mesh position={[0, 0.16, 0]} castShadow material={goldAccentMat}>
                <torusGeometry args={[0.065, 0.012, 12, 24]} />
              </mesh>
              <mesh position={[0, 0.16, 0]} material={porcelainMat}>
                <circleGeometry args={[0.062, 24]} />
              </mesh>
            </group>
          </group>
        )}
      </group>

      <BirthdayPortrait
        name={isRight ? 'foyer-right-wall-photo' : 'foyer-left-wall-photo'}
        imageSrc={isRight ? foyerPhotoRight : foyerPhotoLeft}
        position={[isRight ? 1.6 : -1.6, 2.2, 0.08]}
        photoHeight={0.9}
      />

      {/* 6. Vertical Architectural Framing Pilaster facing the Gate */}
      <mesh
        position={[isRight ? -0.88 : 0.88, 2.2, 0.09]}
        castShadow
        material={trimMat}
      >
        <boxGeometry args={[0.12, 4.6, 0.04]} />
      </mesh>
      <mesh
        position={[isRight ? -0.88 : 0.88, 2.2, 0.11]}
        material={goldAccentMat}
      >
        <boxGeometry args={[0.015, 4.6, 0.008]} />
      </mesh>

      {/* 7. Stepped Frieze & Cornice Molding at the top */}
      <mesh position={[0, 4.35, 0.09]} castShadow material={trimMat}>
        <boxGeometry args={[1.9, 0.22, 0.06]} />
      </mesh>
      <mesh position={[0, 4.46, 0.095]} material={goldAccentMat}>
        <boxGeometry args={[1.9, 0.015, 0.01]} />
      </mesh>
    </group>
  );
}

export function FoyerArchitecture() {
  const marbleFloorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF6F2',
    roughness: 0.18,
    metalness: 0.06,
  }), []);

  const velvetCarpetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#9C1A42', // Rich celebratory ruby-rose velvet
    roughness: 0.74,
    metalness: 0.02,
  }), []);

  const goldFringeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.75,
    roughness: 0.28,
  }), []);

  const ceilingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E8DED8',
    roughness: 0.65,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group name="foyer-architecture">
      {/* --- Grand Polished Marble Floor --- */}
      <mesh position={[0, 0, 2.60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.5, 5.2]} />
        <primitive object={marbleFloorMat} attach="material" />
      </mesh>

      {/* --- Celebratory Velvet Carpet Runner leading to Gate --- */}
      <group position={[0, 0.005, 2.60]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={velvetCarpetMat}>
          <planeGeometry args={[1.56, 5.2]} />
        </mesh>
        {/* Left Golden Border Fringe */}
        <mesh position={[-0.80, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldFringeMat}>
          <planeGeometry args={[0.04, 5.2]} />
        </mesh>
        {/* Right Golden Border Fringe */}
        <mesh position={[0.80, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldFringeMat}>
          <planeGeometry args={[0.04, 5.2]} />
        </mesh>
      </group>

      {/* --- Left Wall with Two-Tier Wainscoting, Swags & Sconce --- */}
      <SideWallPanel
        position={[-3.3, 0, 2.60]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* --- Right Wall with Asymmetric Cameo, Wainscoting & Sconce --- */}
      <SideWallPanel
        position={[3.3, 0, 2.60]}
        rotation={[0, -Math.PI / 2, 0]}
        isRight
      />

      {/* --- Entrance Facade Walls with Classical Arched Display Niches --- */}
      <FacadeWallWithNiche position={[-2.35, 0, 0]} isRight={false} />
      <FacadeWallWithNiche position={[2.35, 0, 0]} isRight={true} />

      {/* Header Wall above the arch */}
      <mesh position={[0, 3.9, 0]} receiveShadow>
        <boxGeometry args={[6.6, 1.2, 0.15]} />
        <meshStandardMaterial color="#E8DED8" roughness={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* --- Foyer Entrance Back Wall at z = 5.4 (visible when looking back from inside) --- */}
      <group position={[0, 0, 5.4]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 2.2, -0.075]} receiveShadow>
          <boxGeometry args={[6.6, 4.6, 0.15]} />
          <meshStandardMaterial color="#E8DED8" roughness={0.65} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.14, 0.03]} castShadow>
          <boxGeometry args={[6.6, 0.28, 0.06]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.88} />
        </mesh>
        <mesh position={[0, 1.05, 0.03]} castShadow>
          <boxGeometry args={[6.6, 0.08, 0.05]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.88} />
        </mesh>
        {/* Soft boiserie panels */}
        {[-2.0, 0, 2.0].map((x, i) => (
          <group key={`back-lower-${i}`} position={[x, 0.65, 0.02]}>
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.62, 0.02]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.25} metalness={0.88} />
            </mesh>
            <mesh position={[0, 0, 0.012]}>
              <boxGeometry args={[1.26, 0.48, 0.012]} />
              <meshStandardMaterial color="#D8CBC4" roughness={0.58} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
      <BirthdayPortrait
        name="birthday-girl-foyer-portrait"
        position={[0, 2.72, 5.24]}
        rotation={[0, Math.PI, 0]}
        photoHeight={2.55}
      />

      {/* --- Foyer Ceiling with Coffered Beams --- */}
      <mesh position={[0, 4.45, 2.60]} rotation={[Math.PI / 2, 0, 0]} receiveShadow material={ceilingMat}>
        <planeGeometry args={[7.2, 5.2]} />
      </mesh>
    </group>
  );
}
