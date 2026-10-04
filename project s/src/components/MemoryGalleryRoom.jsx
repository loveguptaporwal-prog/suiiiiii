import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLoader, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';

import photo2 from '../../her/images/photo2.jpeg';
import photo3 from '../../her/images/photo3.jpeg';
import photo4 from '../../her/images/photo4.jpeg';
import photo5 from '../../her/images/photo5.jpeg';
import photo6 from '../../her/images/photo6.jpeg';
import photo7 from '../../her/images/photo7.jpeg';
import photo8 from '../../her/images/photo8.jpeg';
import photo9 from '../../her/images/photo9.jpeg';
import photo10 from '../../her/images/photo10.jpeg';
import photo11 from '../../her/images/photo11.jpeg';
import photo12 from '../../her/images/photo12.jpeg';
import photo13 from '../../her/images/photo13.jpeg';
import photo14 from '../../her/images/photo14.jpeg';
import photo15 from '../../her/images/photo15.jpeg';
import photo16 from '../../her/images/photo16.jpeg';
import photo17 from '../../her/images/photo17.jpeg';
import photo18 from '../../her/images/photo18.jpeg';
import photo19 from '../../her/images/photo19.jpeg';
import photo20 from '../../her/images/photo20.jpeg';
import photo25 from '../../her/images/photo25.jpeg';

import video1 from '../../her/videos/v1.mp4';
import video2 from '../../her/videos/v2.mp4';
import video3 from '../../her/videos/v3.mp4';
import video4 from '../../her/videos/v4.mp4';
import video5 from '../../her/videos/v5.mp4';
import video6 from '../../her/videos/v6.mp4';
import video7 from '../../her/videos/v7.mp4';

const ROOM_WIDTH = 10.8;
const ROOM_DEPTH = 18.2;
const ROOM_HEIGHT = 6.2;
const ROOM_CENTER = [-5.2, 0, -22.7];

// Each source is used once in this room; separate curated slots keep the media unique.
const photoAssets = [
  photo3, photo4, photo5, photo6, photo7, photo8,
  photo9, photo10, photo11, photo12, photo13, photo14,
  photo15, photo16, photo17, photo18, photo19, photo20, photo2, photo25,
];

const videoAssets = [video1, video2, video3, video4, video5, video6, video7];

const sidePlacements = {
  west: {
    photos: [
      { z: 8.2, y: 2.85, size: [1.65, 2.25] },
      { z: 6.3, y: 3.75, size: [1.75, 2.55] },
      { z: 2.1, y: 2.9, size: [1.5, 2.3] },
      { z: -2.1, y: 3.7, size: [1.5, 2.5] },
      { z: -6.3, y: 2.85, size: [1.7, 2.35] },
      { z: -8.2, y: 3.6, size: [1.65, 2.45] },
    ],
    videos: [
      { z: 4.2, y: 3.15, size: [1.8, 1.15] },
      { z: 0, y: 3.15, size: [1.75, 1.2] },
      { z: -4.2, y: 3.15, size: [1.8, 1.25] },
    ],
  },
  east: {
    photos: [
      { z: 8.2, y: 3.15, size: [1.65, 2.35] },
      { z: 6.3, y: 4.0, size: [1.7, 2.5] },
      { z: 2.1, y: 2.7, size: [1.5, 2.3] },
      { z: -2.1, y: 3.85, size: [1.5, 2.55] },
      { z: -6.3, y: 3.0, size: [1.65, 2.35] },
      { z: -8.2, y: 4.0, size: [1.65, 2.5] },
    ],
    videos: [
      { z: 4.2, y: 3.15, size: [1.8, 1.15] },
      { z: 0, y: 3.15, size: [1.75, 1.2] },
      { z: -4.2, y: 3.15, size: [1.8, 1.25] },
    ],
  },
};

function GalleryPhotograph({
  image,
  position,
  rotation = [0, 0, 0],
  size,
  featured = false,
  accentLight = true,
}) {
  const texture = useLoader(THREE.TextureLoader, image);
  const { gl } = useThree();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = gl.capabilities.getMaxAnisotropy();

  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: featured ? '#9A7134' : '#49352A',
    metalness: featured ? 0.58 : 0.24,
    roughness: 0.38,
  }), [featured]);
  const innerTrimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D7B46B',
    metalness: 0.6,
    roughness: 0.32,
  }), []);
  const matMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D8C9B2',
    roughness: 0.8,
  }), []);
  const photoMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  }), [texture]);

  const [frameWidth, frameHeight] = size;
  const openingWidth = frameWidth - 0.18;
  const openingHeight = frameHeight - 0.18;
  const imageRatio = texture.image.width / texture.image.height;
  const openingRatio = openingWidth / openingHeight;
  const photoWidth = imageRatio > openingRatio ? openingWidth : openingHeight * imageRatio;
  const photoHeight = imageRatio > openingRatio ? openingWidth / imageRatio : openingHeight;
  const rail = 0.09;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.025]} castShadow receiveShadow material={frameMaterial}>
        <boxGeometry args={[frameWidth, frameHeight, 0.13]} />
      </mesh>
      <mesh position={[0, 0, 0.052]} material={matMaterial}>
        <planeGeometry args={[openingWidth, openingHeight]} />
      </mesh>
      <mesh position={[0, 0, 0.082]} material={photoMaterial}>
        <planeGeometry args={[photoWidth, photoHeight]} />
      </mesh>
      {[
        [0, frameHeight / 2 - rail / 2, frameWidth, rail],
        [0, -frameHeight / 2 + rail / 2, frameWidth, rail],
        [-frameWidth / 2 + rail / 2, 0, rail, frameHeight - rail * 2],
        [frameWidth / 2 - rail / 2, 0, rail, frameHeight - rail * 2],
      ].map(([x, y, width, height], index) => (
        <mesh
          key={`photo-rail-${index}`}
          position={[x, y, 0.07]}
          castShadow
          material={frameMaterial}
        >
          <boxGeometry args={[width, height, 0.11]} />
        </mesh>
      ))}
      {[
        [0, openingHeight / 2 - 0.05, openingWidth, 0.014],
        [0, -openingHeight / 2 + 0.05, openingWidth, 0.014],
        [-openingWidth / 2 + 0.05, 0, 0.014, openingHeight],
        [openingWidth / 2 - 0.05, 0, 0.014, openingHeight],
      ].map(([x, y, width, height], index) => (
        <mesh key={`photo-inlay-${index}`} position={[x, y, 0.14]} material={innerTrimMaterial}>
          <boxGeometry args={[width, height, 0.018]} />
        </mesh>
      ))}
      {featured && accentLight && (
        <pointLight position={[0, frameHeight / 2 + 0.32, 0.38]} color="#FFD89A" intensity={0.65} distance={3.4} />
      )}
    </group>
  );
}

function MemoryVideoInstallation({ source, position, rotation = [0, 0, 0], size = [1.8, 1.15] }) {
  const videoRef = useRef(null);
  const [texture, setTexture] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState('CLICK TO PLAY');
  const [width, height] = size;
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#171416',
    roughness: 0.34,
    metalness: 0.3,
  }), []);
  const trimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#A47B3C',
    roughness: 0.34,
    metalness: 0.65,
  }), []);
  const plaqueMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#161315',
    roughness: 0.42,
    metalness: 0.22,
  }), []);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = source;
    video.preload = 'none';
    video.playsInline = true;
    video.controls = false;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    videoRef.current = video;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    setTexture(videoTexture);

    const handlePlaying = () => setPlaybackStatus('PLAYING');
    const handleWaiting = () => setPlaybackStatus('BUFFERING');
    const handlePause = () => {
      if (!video.ended) setPlaybackStatus('PAUSED');
    };
    const handleError = () => {
      console.error(`Unable to load gallery video ${source}:`, video.error);
      setPlaybackStatus('ERROR');
    };
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.pause();
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeAttribute('src');
      video.load();
      videoTexture.dispose();
      videoRef.current = null;
    };
  }, [source]);

  const togglePlayback = (event) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      setPlaybackStatus('PAUSED · CLICK TO RESUME');
      return;
    }

    video.preload = 'auto';
    if (video.ended) video.currentTime = 0;
    video.play().catch((error) => {
      console.error(`Unable to play gallery video ${source}:`, error);
      setPlaybackStatus('ERROR');
    });
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={togglePlayback}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <mesh position={[0, 0, -0.04]} castShadow receiveShadow material={frameMaterial}>
        <boxGeometry args={[width + 0.18, height + 0.18, 0.14]} />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture || undefined} color={texture ? '#FFFFFF' : '#090809'} toneMapped={false} />
      </mesh>
      {playbackStatus !== 'PLAYING' && (
        <Text
          position={[0, 0, 0.085]}
          fontSize={0.13}
          color="#E4CEAA"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.16}
          textAlign="center"
        >
          {playbackStatus}
        </Text>
      )}
      {[
        [0, height / 2 + 0.055, width + 0.12, 0.09],
        [0, -height / 2 - 0.055, width + 0.12, 0.09],
        [-width / 2 - 0.015, 0, 0.09, height],
        [width / 2 + 0.015, 0, 0.09, height],
      ].map(([x, y, railWidth, railHeight], index) => (
        <mesh key={`video-rail-${index}`}         position={[x, y, 0.075]} material={trimMaterial}>
          <boxGeometry args={[railWidth, railHeight, 0.09]} />
        </mesh>
      ))}
      <mesh position={[0, -height / 2 - 0.19, 0.02]} material={plaqueMaterial}>
        <boxGeometry args={[width + 0.18, 0.18, 0.08]} />
      </mesh>
      <Text
        position={[0, -height / 2 - 0.19, 0.068]}
        fontSize={0.075}
        color="#F3D596"
        anchorX="center"
        anchorY="middle"
        maxWidth={width + 0.12}
      >
        MOVING IMAGE
      </Text>
    </group>
  );
}

function GallerySectionPlaque({ position, rotation = [0, 0, 0], children }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.025]} castShadow>
        <boxGeometry args={[1.75, 0.28, 0.06]} />
        <meshStandardMaterial color="#21191B" metalness={0.18} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[1.78, 0.025, 0.025]} />
        <meshStandardMaterial color="#B28A4B" metalness={0.6} roughness={0.4} />
      </mesh>
      <Text position={[0, 0, 0.03]} fontSize={0.105} color="#E9CD92" anchorX="center" anchorY="middle" letterSpacing={0.08}>
        {children}
      </Text>
    </group>
  );
}

function GallerySpotlight({ position, targetPosition, intensity }) {
  const lightRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <group>
      <spotLight
        ref={lightRef}
        position={position}
        color="#FFD8A0"
        intensity={intensity}
        distance={7}
        angle={0.38}
        penumbra={0.72}
        decay={2}
      />
      <object3D ref={targetRef} position={targetPosition} />
    </group>
  );
}

function GalleryBench() {
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#493329',
    roughness: 0.58,
    metalness: 0.08,
  }), []);
  const cushionMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#55283A',
    roughness: 0.86,
  }), []);
  const brassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#A47B3C',
    metalness: 0.62,
    roughness: 0.38,
  }), []);

  return (
    <group position={[-4.95, 0, 5.8]}>
      <mesh position={[0.28, 0.58, 0]} castShadow material={woodMaterial}>
        <boxGeometry args={[0.62, 0.14, 1.7]} />
      </mesh>
      <mesh position={[0.3, 0.68, 0]} material={cushionMaterial}>
        <boxGeometry args={[0.56, 0.08, 1.62]} />
      </mesh>
      <mesh position={[0.04, 1.02, 0]} castShadow material={woodMaterial}>
        <boxGeometry args={[0.12, 0.76, 1.7]} />
      </mesh>
      {[-0.72, 0.72].map((z) => (
        <group key={`bench-support-${z}`} position={[0.28, 0, z]}>
          <mesh position={[-0.2, 0.29, 0]} castShadow material={brassMaterial}>
            <boxGeometry args={[0.055, 0.5, 0.055]} />
          </mesh>
          <mesh position={[0.2, 0.29, 0]} castShadow material={brassMaterial}>
            <boxGeometry args={[0.055, 0.5, 0.055]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GallerySideExhibits({ side, images, videos }) {
  const isWest = side === 'west';
  const x = isWest ? -5.31 : 5.31;
  const rotation = [0, isWest ? Math.PI / 2 : -Math.PI / 2, 0];
  const placements = sidePlacements[side];

  return (
    <>
      {images.map((image, index) => (
        <GalleryPhotograph
          key={`gallery-${side}-photo-${index}`}
          image={image}
          position={[x, placements.photos[index].y, placements.photos[index].z]}
          rotation={rotation}
          size={placements.photos[index].size}
          featured={index === 1 || index === 3}
        />
      ))}
      {videos.map((video, index) => (
        <MemoryVideoInstallation
          key={`gallery-${side}-video-${index}`}
          source={video}
          position={[x, placements.videos[index].y, placements.videos[index].z]}
          rotation={rotation}
          size={placements.videos[index].size}
        />
      ))}
    </>
  );
}

function MemoryGalleryRoomContent() {
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#30262A',
    roughness: 0.78,
    metalness: 0.04,
    side: THREE.DoubleSide,
  }), []);
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#38292C',
    roughness: 0.34,
    metalness: 0.12,
  }), []);
  const runnerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#562034',
    roughness: 0.72,
    metalness: 0.04,
  }), []);
  const ceilingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1A1417',
    roughness: 0.76,
    side: THREE.DoubleSide,
  }), []);
  const brassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#9C7437',
    metalness: 0.72,
    roughness: 0.34,
  }), []);

  return (
    <group name="memories-gallery-room" position={ROOM_CENTER}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      </mesh>
      <group position={[0, 0.012, 0]}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={runnerMaterial}>
          <planeGeometry args={[2.15, 14.8]} />
        </mesh>
        {[-1.1, 1.1].map((x) => (
          <mesh key={`runner-edge-${x}`} position={[x, 0.002, 0]} material={brassMaterial}>
            <boxGeometry args={[0.025, 0.012, 14.8]} />
          </mesh>
        ))}
        {[-7.4, 7.4].map((z) => (
          <mesh key={`runner-end-${z}`} position={[0, 0.002, z]} material={brassMaterial}>
            <boxGeometry args={[2.15, 0.012, 0.025]} />
          </mesh>
        ))}
        {[-3.0, 3.0].map((x) => (
          <group key={`parquet-panels-${x}`} position={[x, 0.002, 0]}>
            {[-6.3, -4.2, -2.1, 0, 2.1, 4.2, 6.3].map((z) => (
              <mesh key={`floor-cross-inlay-${z}`} position={[0, 0, z]} material={brassMaterial}>
                <boxGeometry args={[3.0, 0.01, 0.014]} />
              </mesh>
            ))}
            <mesh position={[-1.5, 0, 0]} material={brassMaterial}>
              <boxGeometry args={[0.014, 0.01, 14.0]} />
            </mesh>
            <mesh position={[1.5, 0, 0]} material={brassMaterial}>
              <boxGeometry args={[0.014, 0.01, 14.0]} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, ROOM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMaterial}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      </mesh>

      <group position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow material={wallMaterial}>
          <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        </mesh>
        <mesh position={[0, -ROOM_HEIGHT / 2 + 0.18, 0.04]} material={brassMaterial}>
          <boxGeometry args={[ROOM_DEPTH, 0.36, 0.08]} />
        </mesh>
        <mesh position={[0, ROOM_HEIGHT / 2 - 0.15, 0.04]} material={brassMaterial}>
          <boxGeometry args={[ROOM_DEPTH, 0.30, 0.08]} />
        </mesh>
      </group>
      <group position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh receiveShadow material={wallMaterial}>
          <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        </mesh>
        <mesh position={[0, -ROOM_HEIGHT / 2 + 0.18, 0.04]} material={brassMaterial}>
          <boxGeometry args={[ROOM_DEPTH, 0.36, 0.08]} />
        </mesh>
        <mesh position={[0, ROOM_HEIGHT / 2 - 0.15, 0.04]} material={brassMaterial}>
          <boxGeometry args={[ROOM_DEPTH, 0.30, 0.08]} />
        </mesh>
      </group>

      {[-1, 1].map((side) => (
        <group key={`side-wall-details-${side}`}>
          <group position={[side * (ROOM_WIDTH / 2 - 0.055), ROOM_HEIGHT / 2, 0]} rotation={[0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            {[1.0, ROOM_HEIGHT - 1.0].map((y) => (
              <mesh key={`side-wall-rail-${y}`} position={[0, y - ROOM_HEIGHT / 2, 0.035]} material={brassMaterial}>
                <boxGeometry args={[ROOM_DEPTH - 0.3, 0.045, 0.045]} />
              </mesh>
            ))}
          </group>
          {[-8.65, -4.75, -0.96, 0.96, 4.75, 8.65].map((z) => (
            <mesh
              key={`side-wall-rib-${z}`}
              position={[side * (ROOM_WIDTH / 2 - 0.055), ROOM_HEIGHT / 2, z]}
              castShadow
              material={brassMaterial}
            >
              <boxGeometry args={[0.045, ROOM_HEIGHT - 0.72, 0.045]} />
            </mesh>
          ))}
        </group>
      ))}

      <group position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <mesh receiveShadow material={wallMaterial}>
          <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        </mesh>
        <mesh position={[0, -ROOM_HEIGHT / 2 + 0.18, 0.04]} material={brassMaterial}>
          <boxGeometry args={[ROOM_WIDTH, 0.36, 0.08]} />
        </mesh>
        <mesh position={[0, ROOM_HEIGHT / 2 - 0.15, 0.04]} material={brassMaterial}>
          <boxGeometry args={[ROOM_WIDTH, 0.30, 0.08]} />
        </mesh>
        {[-5.05, 5.05].map((x) => (
          <mesh key={`end-wall-pilaster-${x}`} position={[x, 0, 0.05]} castShadow material={brassMaterial}>
            <boxGeometry args={[0.055, ROOM_HEIGHT - 0.72, 0.08]} />
          </mesh>
        ))}
        <mesh position={[0, 2.72, 0.045]} material={brassMaterial}>
          <boxGeometry args={[ROOM_WIDTH - 0.4, 0.035, 0.04]} />
        </mesh>
      </group>

      <group position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}>
        {[-3.0, 3.0].map((x, index) => (
          <mesh key={`entry-wing-${index}`} position={[x, 0, 0]} receiveShadow material={wallMaterial}>
            <planeGeometry args={[4.8, ROOM_HEIGHT]} />
          </mesh>
        ))}
        <mesh position={[0, 1.275, 0]} receiveShadow material={wallMaterial}>
          <planeGeometry args={[1.2, ROOM_HEIGHT - 2.55]} />
        </mesh>
        <mesh position={[0, 2.6, -0.05]} castShadow material={brassMaterial}>
          <boxGeometry args={[3.5, 0.86, 0.13]} />
        </mesh>
        <Text position={[0, 2.6, 0.025]} fontSize={0.42} color="#E9CD92" anchorX="center" anchorY="middle" letterSpacing={0.12}>
          MEMORIES
        </Text>
        <Text position={[0, 2.22, 0.025]} fontSize={0.095} color="#C7A76A" anchorX="center" anchorY="middle" letterSpacing={0.1}>
          A PRIVATE COLLECTION
        </Text>
      </group>

      <GallerySectionPlaque position={[-5.29, 5.65, 6.85]} rotation={[0, Math.PI / 2, 0]}>
        PHOTOGRAPHS
      </GallerySectionPlaque>
      <GallerySectionPlaque position={[5.29, 5.65, -1.75]} rotation={[0, -Math.PI / 2, 0]}>
        PORTRAITS
      </GallerySectionPlaque>
      <GalleryBench />
      <GallerySideExhibits side="west" images={photoAssets.slice(0, 6)} videos={videoAssets.slice(0, 3)} />
      <GallerySideExhibits side="east" images={photoAssets.slice(6, 12)} videos={videoAssets.slice(3, 6)} />

      {[
        { index: 12, x: -3.95, y: 4.15, size: [1.5, 2.0] },
        { index: 13, x: 3.95, y: 4.15, size: [1.5, 2.0] },
        { index: 14, x: -2.1, y: 5.35, size: [1.25, 1.35] },
        { index: 15, x: 2.1, y: 5.35, size: [1.25, 1.35] },
        { index: 16, x: -3.95, y: 2.15, size: [1.45, 1.5] },
        { index: 18, x: 3.95, y: 2.15, size: [1.45, 1.5] },
        { index: 17, x: 0, y: 5.65, size: [1.05, 0.9] },
        { index: 19, x: 0, y: 3.65, size: [2.65, 2.8], featured: true },
      ].map(({ index, x, y, size, featured }) => (
        <GalleryPhotograph
          key={`gallery-feature-photo-${index}`}
          image={photoAssets[index]}
          position={[x, y, -ROOM_DEPTH / 2 + 0.07]}
          size={size}
          featured={featured}
          accentLight={index !== 17}
        />
      ))}

      <MemoryVideoInstallation
        source={videoAssets[6]}
        position={[0, 1.0, -ROOM_DEPTH / 2 + 0.08]}
        size={[3.0, 1.5]}
      />

      <GallerySpotlight position={[0, 5.95, -7.3]} targetPosition={[0, 4.35, -9]} intensity={3.5} />
      <GallerySpotlight position={[3.15, 5.7, -7.15]} targetPosition={[3.85, 2.0, -9]} intensity={2.1} />

      {[-2.15, 2.15].map((x) => (
        <group key={`ceiling-track-${x}`}>
          <mesh position={[x, ROOM_HEIGHT - 0.1, 0]} material={brassMaterial}>
            <boxGeometry args={[0.055, 0.055, 15.8]} />
          </mesh>
          {[-6.4, -3.2, 0, 3.2, 6.4].map((z) => (
            <group key={`track-light-${z}`} position={[x, ROOM_HEIGHT - 0.22, z]}>
              <mesh material={brassMaterial}>
                <cylinderGeometry args={[0.075, 0.11, 0.12, 16]} />
              </mesh>
              <mesh position={[0, -0.08, 0]}>
                <circleGeometry args={[0.065, 16]} />
                <meshBasicMaterial color="#FFE8BD" />
              </mesh>
              <pointLight position={[0, -0.28, 0]} color="#FFD59A" intensity={0.46} distance={4.3} />
            </group>
          ))}
        </group>
      ))}
      <pointLight position={[0, 5.65, -ROOM_DEPTH / 2 + 1]} color="#FFE2B2" intensity={0.72} distance={5.5} />
      <pointLight position={[0, 5.4, ROOM_DEPTH / 2 - 1.3]} color="#D59D6B" intensity={0.38} distance={4.5} />
    </group>
  );
}

export const MemoryGalleryRoom = React.memo(MemoryGalleryRoomContent);
