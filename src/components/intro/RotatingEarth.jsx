import React from 'react';
import EarthSurface from './EarthSurface';
import EarthClouds from './EarthClouds';
import EarthAtmosphere from './EarthAtmosphere';

export default function RotatingEarth({ scale = 1.5, showAtmosphere = true }) {
  return (
    <group>
      <EarthSurface scale={scale} />
      <EarthClouds scale={scale} />
      {showAtmosphere && <EarthAtmosphere scale={scale} opacity={0.6} />}
    </group>
  );
}
