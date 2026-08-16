import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function EarthAtmosphere({ scale = 1.5 }) {
  // Use the subtle, thin atmosphere requested by the user
  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#8FE8FF',
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  return (
    <mesh>
      {/* Slightly larger than Earth to create the atmospheric shell */}
      <sphereGeometry args={[scale * 1.05, 96, 96]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}
