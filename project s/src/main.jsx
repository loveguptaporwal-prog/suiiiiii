import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PartyGateScene } from './scenes/PartyGateScene.jsx';
import { birthdayData } from './data/birthdayData.js';
import { RotatePhoneOverlay } from './components/RotatePhoneOverlay.jsx';
import { ContextualPromptHUD } from './components/ContextualPromptHUD.jsx';
import { MobileControlsOverlay } from './components/MobileControlsOverlay.jsx';

import './styles/tokens.css';
import './styles/reset.css';
import './styles/main.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL APP ERROR:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', background: '#ffebee', padding: '24px', fontFamily: 'monospace', zIndex: 99999, position: 'relative' }}>
          <h2>Application Render Error</h2>
          <pre>{this.state.error?.stack || String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Birthday World v2.4 - Landscape Responsive & Contextual In-World HUD
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        <Canvas
          shadows
          dpr={1}
          camera={{ position: [0, 1.22, 5.25], fov: 42 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.92,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('WebGL context lost — recovering gracefully');
            }, false);
          }}
        >
          <PartyGateScene name={birthdayData.name} />
        </Canvas>

        {/* In-world physical context prompts for doors, cake cutting, eating, turntable, gifts */}
        <ContextualPromptHUD />

        {/* Responsive Mobile On-Screen Touch Controls (Move & E-Action) */}
        <MobileControlsOverlay />

        {/* Beautiful mobile orientation guidance prompting landscape rotation */}
        <RotatePhoneOverlay />
      </div>
    </ErrorBoundary>
  </React.StrictMode>
);
