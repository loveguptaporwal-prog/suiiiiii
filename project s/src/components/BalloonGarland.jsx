import React, { useMemo } from 'react';
import { TeardropBalloon } from './TeardropBalloon.jsx';

export function BalloonGarland({ onPopBalloon }) {
  const balloons = useMemo(() => {
    // Deeply broken symmetry and organic human placement:
    // 1. Left Column: Full, lush cascade with varied heights and groupings
    const leftCluster = [
      { pos: [-1.52, 0.38, 0.22], scale: 0.42, squash: [1.03, 0.97, 1.02], rot: [0.14, 0.25, 0.18], color: '#FF7597', finish: 'glossy', speed: 0.65 },
      { pos: [-1.24, 0.68, -0.04], scale: 0.33, squash: [0.98, 1.04, 0.97], rot: [-0.12, -0.3, -0.1], color: '#F4CF7F', finish: 'metallic', speed: 0.85 },
      { pos: [-1.62, 0.96, 0.26], scale: 0.39, squash: [1.02, 0.98, 1.0], rot: [0.18, 0.12, 0.22], color: '#D81B60', finish: 'ruby', speed: 0.72 },
      { pos: [-1.30, 1.28, 0.16], scale: 0.46, squash: [0.96, 1.05, 0.98], rot: [-0.08, 0.24, -0.16], color: '#FFDDE4', finish: 'pearl', speed: 0.58 },
      { pos: [-1.56, 1.66, 0.02], scale: 0.34, squash: [1.04, 0.96, 1.02], rot: [0.12, -0.15, 0.08], color: '#F8A5C2', finish: 'metallic', speed: 0.9 },
      { pos: [-1.20, 1.98, 0.22], scale: 0.40, squash: [0.98, 1.02, 1.0], rot: [-0.15, 0.18, -0.06], color: '#FFF8F2', finish: 'satin', speed: 0.68 },
      { pos: [-1.45, 2.32, 0.12], scale: 0.43, squash: [1.02, 0.97, 1.03], rot: [0.2, -0.2, 0.14], color: '#FF6584', finish: 'glossy', speed: 0.76 },
      { pos: [-1.15, 2.68, 0.24], scale: 0.35, squash: [0.97, 1.04, 0.96], rot: [-0.14, 0.14, -0.18], color: '#D81B60', finish: 'ruby', speed: 0.82 },
    ];

    // 2. Arch Top: Graceful diagonal sweep over the arch moldings (leaving sign unobstructed)
    const archSweep = [
      { pos: [-0.82, 3.12, 0.16], scale: 0.39, squash: [1.02, 0.98, 1.0], rot: [0.1, 0.18, 0.24], color: '#F4CF7F', finish: 'metallic', speed: 0.62 },
      { pos: [-0.44, 3.32, 0.20], scale: 0.44, squash: [0.96, 1.05, 0.97], rot: [-0.05, -0.12, 0.12], color: '#FFDDE4', finish: 'pearl', speed: 0.54 },
      { pos: [0.08, 3.38, 0.24], scale: 0.45, squash: [1.03, 0.97, 1.02], rot: [0.06, 0.14, -0.06], color: '#FF7597', finish: 'glossy', speed: 0.7 },
      { pos: [0.60, 3.26, 0.18], scale: 0.38, squash: [0.98, 1.03, 0.99], rot: [-0.1, 0.16, 0.16], color: '#F8A5C2', finish: 'metallic', speed: 0.84 },
      { pos: [0.96, 3.04, 0.22], scale: 0.35, squash: [1.02, 0.96, 1.04], rot: [0.14, -0.16, -0.22], color: '#FFF8F2', finish: 'satin', speed: 0.66 },
    ];

    // 3. Right Column: Lower drape, distinctly grouped and spaced differently than left
    const rightCluster = [
      { pos: [1.26, 2.40, 0.16], scale: 0.37, squash: [0.97, 1.04, 0.98], rot: [-0.12, 0.2, 0.1], color: '#D81B60', finish: 'ruby', speed: 0.74 },
      { pos: [1.46, 2.08, 0.06], scale: 0.43, squash: [1.04, 0.96, 1.02], rot: [0.16, -0.18, -0.12], color: '#F4CF7F', finish: 'metallic', speed: 0.6 },
      { pos: [1.16, 1.74, 0.24], scale: 0.35, squash: [0.99, 1.02, 0.98], rot: [-0.06, 0.14, 0.18], color: '#FFDDE4', finish: 'pearl', speed: 0.88 },
      { pos: [1.50, 1.38, 0.12], scale: 0.41, squash: [1.02, 0.98, 1.01], rot: [0.12, -0.16, -0.08], color: '#FF6584', finish: 'glossy', speed: 0.64 },
      { pos: [1.22, 1.02, 0.22], scale: 0.36, squash: [0.96, 1.05, 0.97], rot: [-0.14, 0.2, 0.1], color: '#FFF8F2', finish: 'satin', speed: 0.78 },
      { pos: [1.42, 0.62, 0.18], scale: 0.44, squash: [1.03, 0.97, 1.02], rot: [0.16, -0.12, -0.16], color: '#FF7597', finish: 'glossy', speed: 0.56 },
    ];

    // 4. Accent mini filler balloons tucked into natural pockets
    const fillers = [
      { pos: [-1.38, 1.12, 0.30], scale: 0.21, squash: [1.02, 0.98, 1.0], rot: [0.2, 0.12, -0.06], color: '#F4CF7F', finish: 'metallic', speed: 0.95 },
      { pos: [-1.08, 2.44, 0.28], scale: 0.23, squash: [0.98, 1.03, 0.98], rot: [-0.12, 0.22, 0.14], color: '#FF7597', finish: 'glossy', speed: 0.82 },
      { pos: [0.32, 3.14, 0.28], scale: 0.22, squash: [1.04, 0.96, 1.0], rot: [0.14, -0.12, -0.16], color: '#D81B60', finish: 'ruby', speed: 0.92 },
      { pos: [1.34, 1.88, 0.28], scale: 0.23, squash: [0.97, 1.04, 0.99], rot: [0.16, -0.14, -0.06], color: '#F4CF7F', finish: 'metallic', speed: 0.76 },
    ];

    const all = [...leftCluster, ...archSweep, ...rightCluster, ...fillers];
    return all.map((item, idx) => ({
      ...item,
      id: idx,
      stringLength: 0.5 + ((idx * 43) % 65) / 100,
    }));
  }, []);

  return (
    <group name="balloon-garland">
      {balloons.map((b) => (
        <TeardropBalloon
          key={b.id}
          position={b.pos}
          scale={b.scale}
          squash={b.squash}
          color={b.color}
          finish={b.finish}
          initialRotation={b.rot}
          stringLength={b.stringLength}
          swaySpeed={b.speed}
          swayAmount={0.038}
          onClick={() => onPopBalloon && onPopBalloon(b.id)}
        />
      ))}
    </group>
  );
}
