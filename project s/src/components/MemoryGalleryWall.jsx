import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { worldEventBus } from '../systems/WorldEventBus.js';
import { soundEngine } from '../systems/SoundSystem.js';
import { FAMILY_GALLERY_CONFIG } from '../config/FamilyGalleryConfig.js';

// --------------------------------------------------------------------------
// Photo Canvas Mesh: supports real photo textures and fine-art placeholders
// --------------------------------------------------------------------------
function PhotoCanvasField({ imageSrc, accentColor, width, height, isOval = false }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!imageSrc) return;
    const loader = new THREE.TextureLoader();
    let loadedTexture;
    loader.load(
      imageSrc,
      (tex) => {
        loadedTexture = tex;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.generateMipmaps = true;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback gracefully to color canvas on load error
        setTexture(null);
      }
    );
    return () => loadedTexture?.dispose();
  }, [imageSrc]);

  const mat = useMemo(() => {
    if (texture) {
      return new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
      });
    }
    // High-quality fine-art canvas with subtle warm tint
    return new THREE.MeshStandardMaterial({
      color: accentColor || '#E57373',
      roughness: 0.65,
      metalness: 0.02,
    });
  }, [texture, accentColor]);
  const photoSize = useMemo(() => {
    if (!texture?.image?.width || !texture?.image?.height) {
      return [width - 0.20, height - 0.20];
    }

    const availableWidth = width - 0.20;
    const availableHeight = height - 0.20;
    const aspectRatio = texture.image.width / texture.image.height;
    return aspectRatio > availableWidth / availableHeight
      ? [availableWidth, availableWidth / aspectRatio]
      : [availableHeight * aspectRatio, availableHeight];
  }, [texture, width, height]);

  if (isOval) {
    return (
      <mesh position={[0, 0, 0.008]} material={mat}>
        <circleGeometry args={[width * 0.38, 36]} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0, 0.006]} material={mat}>
      <planeGeometry args={photoSize} />
    </mesh>
  );
}

// --------------------------------------------------------------------------
// Individual Interactive Gallery Frame
// Features real frame moldings and picture lamps.
// --------------------------------------------------------------------------
function MemoryGalleryFrame({ item }) {
  const {
    id,
    title,
    year,
    imageSrc,
    frameStyle = 'gold',
    size = [1.2, 0.9],
    position = [0, 2.5, -13.44],
    rotY = 0,
    rotZ = 0,
    hasLight = false,
    accentColor = '#FF8CA3',
    caption,
  } = item;

  const [w, h] = size;
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const goldFrameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8AF50',
    metalness: 0.88,
    roughness: 0.22,
  }), []);

  const walnutFrameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#422216',
    roughness: 0.42,
    metalness: 0.06,
  }), []);

  const rosewoodFrameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#641828',
    roughness: 0.38,
    metalness: 0.06,
  }), []);

  const creamFrameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFF8F0',
    roughness: 0.45,
    metalness: 0.04,
  }), []);

  const canvasMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFDFC',
    roughness: 0.72,
    metalness: 0.02,
  }), []);

  const frameMat = useMemo(() => {
    switch (frameStyle) {
      case 'walnut': return walnutFrameMat;
      case 'rosewood': return rosewoodFrameMat;
      case 'cream': return creamFrameMat;
      default: return goldFrameMat;
    }
  }, [frameStyle, walnutFrameMat, rosewoodFrameMat, creamFrameMat, goldFrameMat]);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
    soundEngine.playKnifePickup(); // gentle wooden chime
    worldEventBus.triggerInteractionPipeline('memory_frame', 'select', {
      id,
      title,
      year,
      caption,
      isSelected: !isSelected,
    });
  };

  const isOval = frameStyle === 'oval';

  return (
    <group
      position={[position[0], position[1], position[2]]}
      rotation={[0, rotY, rotZ]}
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
      onPointerDown={handleClick}
    >
      {isOval ? (
        // Oval Cameo Frame
        <group>
          <mesh castShadow material={goldFrameMat}>
            <torusGeometry args={[w * 0.44, 0.034, 16, 40]} />
          </mesh>
          <mesh position={[0, 0, 0.005]} material={canvasMat}>
            <circleGeometry args={[w * 0.42, 36]} />
          </mesh>
          <PhotoCanvasField
            imageSrc={imageSrc}
            accentColor={accentColor}
            width={w}
            height={h}
            isOval
          />
        </group>
      ) : (
        // Rectangular Gallery Frame with Layered Moldings
        <group>
          {/* Solid backing sits behind the photo; four rails leave a clean image opening. */}
          <mesh position={[0, 0, -0.012]} material={canvasMat}>
            <planeGeometry args={[w - 0.04, h - 0.04]} />
          </mesh>
          <PhotoCanvasField
            imageSrc={imageSrc}
            accentColor={accentColor}
            width={w}
            height={h}
          />
          {[
            [0, h / 2 - 0.045, w, 0.09],
            [0, -h / 2 + 0.045, w, 0.09],
            [-w / 2 + 0.045, 0, 0.09, h - 0.18],
            [w / 2 - 0.045, 0, 0.09, h - 0.18],
          ].map(([x, y, width, height], index) => (
            <mesh
              key={`gallery-frame-rail-${index}`}
              position={[x, y, 0.025]}
              castShadow
              material={frameMat}
            >
              <boxGeometry args={[width, height, 0.05]} />
            </mesh>
          ))}
          {[
            [0, h / 2 - 0.115, w - 0.14, 0.018],
            [0, -h / 2 + 0.115, w - 0.14, 0.018],
            [-w / 2 + 0.115, 0, 0.018, h - 0.23],
            [w / 2 - 0.115, 0, 0.018, h - 0.23],
          ].map(([x, y, width, height], index) => (
            <mesh key={`gallery-frame-inlay-${index}`} position={[x, y, 0.052]} material={goldFrameMat}>
              <boxGeometry args={[width, height, 0.012]} />
            </mesh>
          ))}
        </group>
      )}

      {/* Brass Picture Gallery Lamp mounted above focal frames */}
      {hasLight && (
        <group position={[0, h / 2 + 0.10, 0.08]}>
          {/* Wall bracket */}
          <mesh material={goldFrameMat}>
            <boxGeometry args={[0.08, 0.03, 0.02]} />
          </mesh>
          {/* Curved Gooseneck Arm */}
          <mesh position={[0, 0, 0.05]} rotation={[0.4, 0, 0]} material={goldFrameMat}>
            <cylinderGeometry args={[0.006, 0.006, 0.12, 8]} />
          </mesh>
          {/* Picture lamp shade bar */}
          <mesh position={[0, 0.04, 0.10]} material={goldFrameMat}>
            <cylinderGeometry args={[0.018, 0.018, w * 0.52, 16]} rotation={[0, 0, Math.PI / 2]} />
          </mesh>
          {/* Soft directional art pool light (subtle warm gallery illumination) */}
          <pointLight
            position={[0, 0.02, 0.12]}
            color="#FFF4D4"
            intensity={isHovered ? 0.35 : 0.18}
            distance={1.6}
          />
        </group>
      )}
    </group>
  );
}

// --------------------------------------------------------------------------
// Main Component: MemoryGalleryWall
// Renders the curated salon hang from centralized config
// --------------------------------------------------------------------------
export function MemoryGalleryWall() {
  return (
    <group name="curated-family-memory-wall">
      {FAMILY_GALLERY_CONFIG.map((item) => (
        <MemoryGalleryFrame key={item.id} item={item} />
      ))}
    </group>
  );
}
