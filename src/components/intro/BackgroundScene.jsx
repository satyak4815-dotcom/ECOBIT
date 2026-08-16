import React from 'react';

export default function BackgroundScene() {
  return (
    <div className="eco-background" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
    }}>
      <img
        src="/assets/ecobit-landscape.jpg"
        alt="Ecobit Landscape"
        className="eco-background-image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // Subtle atmospheric depth treatment so Earth pops out
          filter: 'blur(2px) brightness(0.9)',
          transform: 'scale(1.02)' // Prevents blur edges from showing
        }}
      />
      {/* Subtle top gradient overlay to ensure navbar contrast against bright skies */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '35%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />
    </div>
  );
}
