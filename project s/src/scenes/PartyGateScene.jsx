import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Sparkles } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  N8AO,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { birthdayData } from '../data/birthdayData.js';

// Architectural components
import { OrnateGate } from '../components/OrnateGate.jsx';
import { BalloonGarland } from '../components/BalloonGarland.jsx';
import { GiftsAndDecor } from '../components/GiftsAndDecor.jsx';
import { InteriorPartyGlimpse } from '../components/InteriorPartyGlimpse.jsx';
import { FoyerArchitecture } from '../components/FoyerArchitecture.jsx';
import { ForegroundDepth } from '../components/ForegroundDepth.jsx';
import { WelcomeDesign } from '../components/WelcomeDesign.jsx';

import { HumanCameraController } from '../systems/HumanCameraController.jsx';
import { worldEventBus } from '../systems/WorldEventBus.js';

// Manages static shadow map rendering: freezes autoUpdate during normal movement to avoid
// redundant shadow passes (saving ~80-100 draw calls/frame), but explicitly updates whenever
// doors swing, cake is cut, candles light, or scene state changes.
function StaticShadowManager() {
  const { gl } = useThree();
  const updateCountdownRef = useRef(15); // Initial bake frames on mount to ensure scene geometry is settled

  useEffect(() => {
    // Disable per-frame auto-updating of shadow maps during normal movement/rendering
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;

    const requestShadowUpdate = (frames = 90) => {
      updateCountdownRef.current = Math.max(updateCountdownRef.current, frames);
    };

    // Explicitly update whenever any shadow-affecting object, light, door, or relevant scene geometry changes
    const unsubDoor = worldEventBus.on('DOOR_STATE_CHANGED', () => requestShadowUpdate(90));
    const unsubDoorReq = worldEventBus.on('REQUEST_TOGGLE_DOOR', () => requestShadowUpdate(90));
    const unsubCandlesLit = worldEventBus.on('CANDLES_LIT', () => requestShadowUpdate(60));
    const unsubCandlesBlown = worldEventBus.on('CANDLES_BLOWN', () => requestShadowUpdate(60));
    const unsubCut = worldEventBus.on('CAKE_CUT', () => requestShadowUpdate(90));
    const unsubReqCut = worldEventBus.on('REQUEST_CUT_CAKE', () => requestShadowUpdate(90));
    const unsubReset = worldEventBus.on('RESET_CAKE', () => requestShadowUpdate(60));
    const unsubKnife = worldEventBus.on('KNIFE_PICKED_UP', () => requestShadowUpdate(60));
    const unsubSlice = worldEventBus.on('SLICE_PICKED_UP', () => requestShadowUpdate(60));
    const unsubServe = worldEventBus.on('SLICE_SERVED', () => requestShadowUpdate(60));
    const unsubBalloon = worldEventBus.on('BALLOON_POPPED', () => requestShadowUpdate(30));

    return () => {
      unsubDoor();
      unsubDoorReq();
      unsubCandlesLit();
      unsubCandlesBlown();
      unsubCut();
      unsubReqCut();
      unsubReset();
      unsubKnife();
      unsubSlice();
      unsubServe();
      unsubBalloon();
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);

  useFrame(() => {
    if (updateCountdownRef.current > 0) {
      gl.shadowMap.needsUpdate = true;
      updateCountdownRef.current--;
    }
    window.__lastFrameCalls = gl.info.render.calls;
    window.__lastFrameTris = gl.info.render.triangles;
  });

  return null;
}

export function PartyGateScene({ name = birthdayData.name }) {
  const three = useThree();
  useEffect(() => {
    window.__three = three;
  }, [three]);

  const handleBalloonPop = (id) => {
    console.log(`Popped balloon ${id}`);
    worldEventBus.emit('BALLOON_POPPED', { id });
  };

  return (
    <>
      {/* Static Shadow Map Manager: freezes autoUpdate during normal movement, updates on scene events */}
      <StaticShadowManager />

      {/* Reusable Continuous Human Navigation & Camera System */}
      <HumanCameraController initialPosition={[0, 1.22, 5.25]} />

      {/* Deep festive midnight celebration atmosphere */}
      <color attach="background" args={['#0F0418']} />
      <fog attach="fog" args={['#0F0418', 25, 65]} />

      {/* IBL Environment — provides natural metallic reflections without overpowering the room */}
      <Environment preset="apartment" background={false} environmentIntensity={0.30} />

      {/* ---------------- BALANCED WARM LIGHTING ---------------- */}
      {/* Soft warm ambient fill - muted to prevent washing out walls */}
      <ambientLight color="#FFF0F3" intensity={0.22} />

      {/* Main Warm Key Light (casts soft architectural shadows) */}
      <directionalLight
        position={[4.0, 7.2, 4.8]}
        intensity={1.10}
        color="#FFF5E8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-4.0}
        shadow-camera-right={4.0}
        shadow-camera-top={5.0}
        shadow-camera-bottom={-0.6}
        shadow-bias={-0.00005}
        shadow-normalBias={0.035}
      />

      {/* Soft Blush Fill Light from left to soften shadows */}
      <directionalLight
        position={[-4.2, 4.2, 3.8]}
        intensity={0.35}
        color="#FFD6E4"
      />

      {/* Rose-Gold Rim/Back Light for subtle balloon highlights */}
      <directionalLight
        position={[-2.5, 5.2, -1.8]}
        intensity={0.45}
        color="#FF6B8B"
      />

      {/* Interior Room Atmospheric Sconce Lights — warm party atmosphere */}
      {/* Left wall sconces */}
      <pointLight position={[-6.2, 2.2, -5.5]} color="#FFD080" intensity={1.2} distance={5.5} />
      <pointLight position={[-6.2, 2.2, -10.5]} color="#FFD080" intensity={1.0} distance={5.0} />
      {/* Right wall sconces */}
      <pointLight position={[6.2, 2.2, -5.5]} color="#FFD080" intensity={1.2} distance={5.5} />
      <pointLight position={[6.2, 2.2, -10.5]} color="#FFD080" intensity={1.0} distance={5.0} />
      {/* Back wall warm wash */}
      <pointLight position={[0, 3.8, -13.0]} color="#FFC878" intensity={1.4} distance={6.0} />

      {/* ---------------- SPATIAL LAYERS ---------------- */}

      {/* LAYER 1: Background - Interior Party Glimpse (Teaser Depth & mystery) */}
      <InteriorPartyGlimpse />

      {/* LAYER 2: Architecture - Foyer Floor, Wainscoted Walls with Swags & Sconces */}
      <FoyerArchitecture />

      {/* LAYER 3: Midground Hero - The Ornate Party Gate with glowing name */}
      <OrnateGate name={name} />

      {/* LAYER 4: Balloons - Asymmetric Balloon Garland framing arch */}
      <BalloonGarland onPopBalloon={handleBalloonPop} />

      {/* LAYER 5: Decor - Luxury Asymmetric Gift Stacks, Floral Urns, Bunting */}
      <GiftsAndDecor />

      {/* LAYER 5.5: Welcome Design - Velvet & Gold "WELCOME" Threshold Mat, Brass Easel with Floral Spray & Calligraphy, Scattered Petals */}
      <WelcomeDesign name={name} />

      {/* LAYER 6: Foreground - Framing Balloons, Streamers & Celebration Motes */}
      <ForegroundDepth />

      {/* ---------------- CONTACT SHADOWS (Cached static bake frames={1} saves 4 render passes/frame) ---------------- */}
      {/* Main ground contact shadow */}
      <ContactShadows
        frames={1}
        position={[0, 0.01, 1.4]}
        opacity={0.65}
        scale={7.5}
        blur={2.2}
        far={4.8}
      />
      {/* Welcome Easel contact shadow */}
      <ContactShadows
        frames={1}
        position={[1.28, 0.012, 1.42]}
        opacity={0.62}
        scale={[1.1, 1.1]}
        blur={1.2}
        far={2.0}
      />
      {/* Left gift cluster contact shadow for physical grounding */}
      <ContactShadows
        frames={1}
        position={[-1.75, 0.012, 0.55]}
        opacity={0.68}
        scale={[2.2, 2.0]}
        blur={1.4}
        far={2.5}
      />
      {/* Right gift cluster contact shadow */}
      <ContactShadows
        frames={1}
        position={[1.75, 0.012, 0.45]}
        opacity={0.68}
        scale={[2.2, 2.0]}
        blur={1.4}
        far={2.5}
      />

      {/* ---------------- POSTPROCESSING PIPELINE ---------------- */}
      {/* High-Performance Postprocessing — multisampling={0} and halfRes N8AO eliminates SSAO bottlenecks */}
      <EffectComposer multisampling={0}>
        {/* N8AO — high-performance, clean ambient occlusion for soft grounding under plates and table edges */}
        <N8AO
          halfRes
          quality="medium"
          aoRadius={0.35}
          intensity={1.1}
          color="#1A0D14"
        />

        {/* Bloom — calibrated to only catch genuine emissives (candle flames & fairy lights) without washing out walls */}
        <Bloom
          luminanceThreshold={1.15}
          luminanceSmoothing={0.15}
          intensity={0.22}
          mipmapBlur
        />

        {/* ChromaticAberration — microscopic lens character */}
        <ChromaticAberration
          offset={[0.0003, 0.0003]}
          radialModulation={false}
        />

        {/* Vignette — soft framing that keeps the corners bright and readable */}
        <Vignette
          offset={0.45}
          darkness={0.35}
          eskil={false}
        />
      </EffectComposer>
    </>
  );
}
