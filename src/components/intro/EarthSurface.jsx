import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function EarthSurface({ scale = 1.5 }) {
  const earthRef = useRef();

  // Load standard NASA Earth color map (Daytime texture)
  const [colorMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth_atmos_2048.jpg'
  ]);

  useFrame((state, delta) => {
    if (earthRef.current) {
      // Rotate slowly and continuously
      earthRef.current.rotation.y += delta * 0.08;
    }
  });

  // Custom Daylight Shader
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uEarthTexture: { value: colorMap }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          // Transform normal to view space for proper dot product with view direction
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uEarthTexture;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vec4 earth = texture2D(uEarthTexture, vUv);
          
          // Artificial global daylight.
          // Never allow the surface to become black.
          float daylight = 0.9;
          vec3 finalColor = earth.rgb * daylight;
          
          // Preserve minimum brightness.
          finalColor = max(finalColor, earth.rgb * 0.6);
          
          // Subtle spherical depth
          // Dot product with vec3(0.0, 0.0, 1.0) creates shading based on view direction
          float depthShade = 0.75 + 0.25 * dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
          
          // Prevent any dark navy/black on the surface
          finalColor = finalColor * depthShade;
          finalColor = max(finalColor, vec3(0.1)); 
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
  }, [colorMap]);

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[scale, 64, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
