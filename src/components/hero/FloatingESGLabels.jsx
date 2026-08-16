import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export default function FloatingESGLabels({ isHeroMode }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  if (!isHeroMode) return null;

  return (
    <group ref={groupRef}>
      {/* Carbon Label - Top Right */}
      <Html position={[1.4, 1.2, 0]} center zIndexRange={[100, 0]}>
        <div className="esg-floating-label">
          <div className="esg-label-title">CARBON</div>
          <div className="esg-label-value">84,200 tCO₂e</div>
        </div>
      </Html>

      {/* Renewable Label - Bottom Left */}
      <Html position={[-1.3, -1.0, 0]} center zIndexRange={[100, 0]}>
        <div className="esg-floating-label">
          <div className="esg-label-title">RENEWABLE</div>
          <div className="esg-label-value">42%</div>
        </div>
      </Html>

      {/* Water Label - Top Left */}
      <Html position={[-1.2, 1.1, 0.5]} center zIndexRange={[100, 0]}>
        <div className="esg-floating-label">
          <div className="esg-label-title">WATER</div>
          <div className="esg-label-value">1.2M L</div>
        </div>
      </Html>

      {/* ESG Score Label - Bottom Right */}
      <Html position={[1.3, -0.8, -0.5]} center zIndexRange={[100, 0]}>
        <div className="esg-floating-label highlight">
          <div className="esg-label-title">ESG SCORE</div>
          <div className="esg-label-value">78</div>
        </div>
      </Html>
    </group>
  );
}
