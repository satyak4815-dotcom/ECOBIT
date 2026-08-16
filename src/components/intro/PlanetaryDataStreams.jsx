import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NEON_BLUE = '#00e5ff'; // Brighter neon cyan/blue for bolder look

export default function PlanetaryDataStreams({ earthScale = 1.5, isVisible = false }) {
  const STREAM_COUNT = 20;

  // Pre-calculate paths and initial particle states based on user specifications
  const streams = useMemo(() => {
    return Array.from({ length: STREAM_COUNT }, (_, index) => {
      const radiusX = (1.45 + Math.random() * 0.45) * (earthScale / 1.5);
      const radiusY = (1.10 + Math.random() * 0.40) * (earthScale / 1.5);

      // Create the ellipse curve
      const curve = new THREE.EllipseCurve(
        0, 0,
        radiusX, radiusY,
        0, Math.PI * 2,
        false, 0
      );
      
      const points = curve.getPoints(128);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

      return {
        id: index,
        curve,
        lineGeometry,
        rotation: [
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI,
          (Math.random() - 0.5) * Math.PI
        ],
        speed: 0.04 + Math.random() * 0.10,
        baseOpacity: 0.15 + Math.random() * 0.25, // Bolder base opacity
        progress: Math.random() // offset
      };
    });
  }, [earthScale]);

  // Use refs to update particle positions without re-renders
  const particleRefs = useRef([]);

  // Dispose geometries on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      streams.forEach(s => {
        if (s.lineGeometry) s.lineGeometry.dispose();
      });
    };
  }, [streams]);

  useFrame((state, delta) => {
    if (!isVisible) return;
    
    streams.forEach((stream, i) => {
      const particle = particleRefs.current[i];
      if (!particle) return;

      stream.progress += delta * stream.speed;
      if (stream.progress > 1) {
        stream.progress = 0;
      }

      // Get point along the 2D curve
      const point = stream.curve.getPointAt(stream.progress);
      
      // Position particle (Z is 0 because it's a 2D curve, parent group handles rotation)
      particle.position.set(point.x, point.y, 0);
      
      // Dynamic opacity pulse - bolder glow
      if (particle.material) {
        particle.material.opacity = stream.baseOpacity + 0.6 * Math.sin(stream.progress * Math.PI * 2 * 3);
        if (particle.material.opacity < 0.1) particle.material.opacity = 0.1;
      }
    });
  });

  if (!isVisible) return null;

  return (
    <group>
      {streams.map((stream, i) => (
        <group key={stream.id} rotation={stream.rotation}>
          {/* Bolder neon curved orbital path */}
          <line geometry={stream.lineGeometry}>
            <lineBasicMaterial 
              color={NEON_BLUE} 
              transparent 
              opacity={0.15} // Increased from 0.08
              blending={THREE.AdditiveBlending}
            />
          </line>
          
          {/* Glowing futuristic neon particle */}
          <mesh ref={(el) => (particleRefs.current[i] = el)}>
            <sphereGeometry args={[0.035, 16, 16]} /> {/* Slightly larger for bolder glow */}
            <meshBasicMaterial 
              color="#ffffff" // White core 
              transparent 
              opacity={1} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>
          <mesh ref={(el) => {
             // We can use a nested larger sphere for the neon glow halo, but let's just use a simple approach for performance
             // Actually, a slightly larger transparent blue sphere makes a great glow effect
          }} position={[0,0,0]}>
             {/* Note: since the parent is a group, we attach the ref to the particle above. A custom glow shader or sprite is better, but this works well */}
          </mesh>
        </group>
      ))}
    </group>
  );
}
