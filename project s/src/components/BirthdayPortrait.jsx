import React, { useEffect, useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import portraitImage from '../../her/images/photo13.jpeg';

const PHOTO_HEIGHT = 2.62;
const MAT_BORDER = 0.10;
const FRAME_BORDER = 0.16;
const FRAME_DEPTH = 0.16;

export function BirthdayPortrait({
  name = 'birthday-girl-wall-portrait',
  position = [0, 2.78, -13.34],
  rotation = [0, 0, 0],
  photoHeight = PHOTO_HEIGHT,
  imageSrc = portraitImage,
  framed = true,
  imageRotation = 0,
}) {
  const texture = useLoader(THREE.TextureLoader, imageSrc);
  const { gl } = useThree();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = gl.capabilities.getMaxAnisotropy();

  const displayTexture = useMemo(() => {
    const imageTexture = texture.clone();
    imageTexture.center.set(0.5, 0.5);
    imageTexture.rotation = imageRotation;
    imageTexture.needsUpdate = true;
    return imageTexture;
  }, [texture, imageRotation]);

  useEffect(() => () => displayTexture.dispose(), [displayTexture]);

  const imageWidth = photoHeight * (texture.image.width / texture.image.height);
  const openingWidth = imageWidth + MAT_BORDER * 2;
  const openingHeight = photoHeight + MAT_BORDER * 2;
  const frameWidth = openingWidth + FRAME_BORDER * 2;
  const frameHeight = openingHeight + FRAME_BORDER * 2;
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#B78A3D',
    metalness: 0.62,
    roughness: 0.32,
  }), []);
  const innerTrimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E0BF79',
    metalness: 0.68,
    roughness: 0.28,
  }), []);
  const matMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F4EBDD',
    roughness: 0.82,
  }), []);
  const backingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#34231B',
    roughness: 0.7,
  }), []);
  const photoMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    map: displayTexture,
    side: THREE.FrontSide,
    toneMapped: false,
  }), [displayTexture]);
  const clearPhotoMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    map: displayTexture,
    side: THREE.FrontSide,
    toneMapped: false,
  }), [displayTexture]);

  return (
    <group
      name={name}
      position={position}
      rotation={rotation}
    >
      {framed ? (
        <>
          <mesh
            position={[0, 0, -FRAME_DEPTH / 2]}
            castShadow
            receiveShadow
            material={backingMaterial}
          >
            <boxGeometry args={[frameWidth, frameHeight, FRAME_DEPTH]} />
          </mesh>
          <mesh position={[0, 0, 0.006]} material={matMaterial}>
            <planeGeometry args={[openingWidth, openingHeight]} />
          </mesh>
          <mesh position={[0, 0, 0.012]} material={photoMaterial}>
            <planeGeometry args={[imageWidth, photoHeight]} />
          </mesh>

          <mesh position={[0, frameHeight / 2 - FRAME_BORDER / 2, 0.045]} castShadow material={frameMaterial}>
            <boxGeometry args={[frameWidth, FRAME_BORDER, FRAME_DEPTH]} />
          </mesh>
          <mesh position={[0, -frameHeight / 2 + FRAME_BORDER / 2, 0.045]} castShadow material={frameMaterial}>
            <boxGeometry args={[frameWidth, FRAME_BORDER, FRAME_DEPTH]} />
          </mesh>
          <mesh position={[-frameWidth / 2 + FRAME_BORDER / 2, 0, 0.045]} castShadow material={frameMaterial}>
            <boxGeometry args={[FRAME_BORDER, frameHeight - FRAME_BORDER * 2, FRAME_DEPTH]} />
          </mesh>
          <mesh position={[frameWidth / 2 - FRAME_BORDER / 2, 0, 0.045]} castShadow material={frameMaterial}>
            <boxGeometry args={[FRAME_BORDER, frameHeight - FRAME_BORDER * 2, FRAME_DEPTH]} />
          </mesh>

          {[
            [0, openingHeight / 2, openingWidth, 0.018],
            [0, -openingHeight / 2, openingWidth, 0.018],
            [-openingWidth / 2, 0, 0.018, openingHeight],
            [openingWidth / 2, 0, 0.018, openingHeight],
          ].map(([x, y, width, height], index) => (
            <mesh
              key={`portrait-reveal-${index}`}
              position={[x, y, 0.13]}
              material={innerTrimMaterial}
            >
              <boxGeometry args={[width, height, 0.025]} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh position={[0, 0, -0.006]} castShadow receiveShadow material={backingMaterial}>
            <boxGeometry args={[imageWidth, photoHeight, 0.012]} />
          </mesh>
          <mesh position={[0, 0, 0.002]} material={clearPhotoMaterial}>
            <planeGeometry args={[imageWidth, photoHeight]} />
          </mesh>
        </>
      )}
    </group>
  );
}
