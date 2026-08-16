import React, { useEffect, useRef, useState } from 'react';

export default function LeafCursor() {
  const cursorRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const position = useRef({ x: -100, y: -100 });
  const rotation = useRef(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(true);

  // Detect touch/mobile devices — skip cursor on non-fine-pointer devices
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mq.matches);
    const handler = (e) => setIsFinePointer(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track hover state globally
  useEffect(() => {
    const handleMouseOver = (e) => {
      const isInteractive = e.target.closest('a, button, [role="button"]');
      setIsHovering(!!isInteractive);
    };
    
    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);

  // Animation Loop
  useEffect(() => {
    let animationFrame;

    const spawnParticle = (x, y) => {
      const p = document.createElement('div');
      p.className = 'leaf-particle';
      // Center particle near the cursor
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      
      const offsetX = (Math.random() - 0.5) * 12;
      const offsetY = (Math.random() - 0.5) * 12;
      p.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${0.5 + Math.random() * 0.5})`;
      
      document.body.appendChild(p);
      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 400);
    };

    const animate = () => {
      const dx = mouse.current.x - position.current.x;
      const dy = mouse.current.y - position.current.y;

      position.current.x += dx * 0.4;
      position.current.y += dy * 0.4;

      // Calculate rotation based on horizontal speed
      const targetRotation = Math.max(-8, Math.min(8, dx * 0.8));
      rotation.current += (targetRotation - rotation.current) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = 
          `translate3d(${position.current.x - 25}px, ${position.current.y - 25}px, 0) rotate(${rotation.current}deg)`;
      }

      // Spawn particles on fast movement
      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed > 25 && Math.random() > 0.85) {
        spawnParticle(position.current.x, position.current.y);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  if (!isFinePointer) return null;

  return (
    <svg
      ref={cursorRef}
      viewBox="0 0 24 24"
      className={`leaf-cursor ${isHovering ? 'hovering' : ''}`}
    >
      <path
        d="M20.5 3.5C11 3.8 5.2 7.2 4.2 13.2 3.6 16.8 5.7 19.7 9.2 20.2 13.8 20.9 19.5 14.2 20.5 3.5Z"
        fill="#8DFF72"
      />
      <path
        d="M5 19C8 14.8 12 11.2 18 6"
        fill="none"
        stroke="#245C3A"
        strokeWidth="1.2"
      />
    </svg>
  );
}
