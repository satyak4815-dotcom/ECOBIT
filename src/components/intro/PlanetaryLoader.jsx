import React, { useEffect, useState } from "react";

export default function PlanetaryLoader({ duration = 7500, startAnimation }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!startAnimation) return;

    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const linearProgress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic ease out
      const easedProgress = 1 - Math.pow(1 - linearProgress, 3);
      setProgress(easedProgress * 100);

      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      clearTimeout(showTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, startAnimation]);

  if (!isVisible) return null;

  // ViewBox coordinates (200x200)
  const center = 100;
  const radius = 80; 
  const circumference = 2 * Math.PI * radius;
  
  // Calculate offset using eased progress
  const offset = circumference - (progress / 100) * circumference;
  
  // Angle for the scanner orb (progress goes from 0 to 360 deg, starts at top -90deg)
  // But wait, if we rotate the SVG in CSS (-90deg), angle 0 is at the top.
  // Actually, keeping SVG unrotated and doing the rotation in SVG is cleaner for text paths.
  // Let's rotate the whole SVG -90deg in CSS, which means 0 degrees in SVG is top.
  // For the orb, 0 is right side of unrotated SVG.
  const angle = (progress / 100) * Math.PI * 2;
  const orbX = center + radius * Math.cos(angle);
  const orbY = center + radius * Math.sin(angle);

  // Path for text to follow (arc along the top). Radius slightly larger than the track.
  const textRadius = radius + 8;
  const textPathD = `M ${center - textRadius},${center} A ${textRadius},${textRadius} 0 0,1 ${center + textRadius},${center}`;

  return (
    <div className="planet-loader-container">
      <svg
        className="planet-loader-svg"
        viewBox="0 0 200 200"
      >
        <defs>
          <linearGradient id="ecoSpectrum" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#20F6FF" />
            <stop offset="25%" stopColor="#00BFFF" />
            <stop offset="50%" stopColor="#8B7CFF" />
            <stop offset="70%" stopColor="#FF5FD2" />
            <stop offset="85%" stopColor="#FFD166" />
            <stop offset="100%" stopColor="#8DFF72" />
          </linearGradient>

          {/* Path for text to curve around the top */}
          <path id="loadingTextPath" d={textPathD} fill="none" />
        </defs>

        {/* HUD Secondary Outer Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 4}
          className="hud-ring-outer"
        />

        {/* HUD Secondary Inner Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius - 4}
          className="hud-ring-inner"
        />

        {/* subtle background track for main ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="loader-track"
        />

        {/* glowing progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className="loader-progress"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

        {/* moving neon scanner orb */}
        <circle
          className="hud-scanner"
          cx={orbX}
          cy={orbY}
          r="3"
        />
      </svg>
      
      {/* Un-rotated SVG for text to stay upright */}
      <svg
        className="planet-loader-text-svg"
        viewBox="0 0 200 200"
      >
        <defs>
          <path id="loadingTextPathUpright" d={`M ${center - textRadius},${center} A ${textRadius},${textRadius} 0 0,1 ${center + textRadius},${center}`} fill="none" />
        </defs>
        <text className="hud-loading-text">
          <textPath
            href="#loadingTextPathUpright"
            startOffset="50%"
            textAnchor="middle"
          >
            INITIALIZING ECOBIT • {Math.round(progress)}%
          </textPath>
        </text>
      </svg>
    </div>
  );
}
