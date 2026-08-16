import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function EarthClouds({ scale = 1.5 }) {
  const cloudsRef = useRef();

  const [cloudMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth_clouds_1024.png'
  ]);

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      // Independent cloud rotation
      cloudsRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[scale * 1.012, 96, 96]} />
      <meshPhongMaterial 
        map={cloudMap}
        transparent={true}
        opacity={0.18} 
        depthWrite={false}
      />
    </mesh>
  );
}
