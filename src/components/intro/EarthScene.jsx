import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import RotatingEarth from './RotatingEarth';
import PlanetaryDataStreams from './PlanetaryDataStreams';
import FloatingESGLabels from '../hero/FloatingESGLabels';

// Subtle cinematic camera drift
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    state.camera.position.x = Math.sin(t * 0.1) * 0.15;
    state.camera.position.y = Math.cos(t * 0.15) * 0.08;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function EarthScene({ appState }) {
  // Determine states from appState
  const showAtmosphere = true; // Atmosphere is always visible once loaded
  const showDataStreams = true; // Data streams are always visible once loaded
  const isHeroMode = appState === 'HERO';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}>
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
        <CameraRig />
        
        {/* Even Daylight Illumination */}
        <ambientLight intensity={2.2} />
        <hemisphereLight skyColor="#EAF7FF" groundColor="#DDE8D8" intensity={1.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} />
        <directionalLight position={[-5, 1, -4]} intensity={0.6} />
        
        <RotatingEarth scale={1.25} showAtmosphere={showAtmosphere} />
        
        {/* Subtle technical blue streams with integrated paths */}
        <PlanetaryDataStreams earthScale={1.25} isVisible={showDataStreams} />

        {/* Floating ESG Labels (Only in Hero Mode) */}
        <FloatingESGLabels isHeroMode={isHeroMode} />
      </Canvas>
    </div>
  );
}
