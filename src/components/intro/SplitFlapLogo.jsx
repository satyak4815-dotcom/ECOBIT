import React, { useState, useEffect } from 'react';

const TARGET_WORD = 'ECOBIT';
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function SplitFlapLogo({ startAnimation }) {
  const [letters, setLetters] = useState(Array(TARGET_WORD.length).fill(''));

  useEffect(() => {
    if (!startAnimation) return;

    const intervals = [];
    const timeouts = [];

    // For each letter, cycle randomly, then settle
    TARGET_WORD.split('').forEach((targetChar, index) => {
      // Start cycling
      const interval = setInterval(() => {
        setLetters(prev => {
          const newArr = [...prev];
          newArr[index] = CHARS[Math.floor(Math.random() * CHARS.length)];
          return newArr;
        });
      }, 50); // fast cycle
      intervals.push(interval);

      // Settle on target char after a delay (cascade effect)
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setLetters(prev => {
          const newArr = [...prev];
          newArr[index] = targetChar;
          return newArr;
        });
      }, 1000 + (index * 200)); // cascade timing

      timeouts.push(timeout);
    });

    return () => {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [startAnimation]);

  return (
    <div className="split-flap-container">
      {letters.map((char, i) => (
        <div key={i} className="split-flap-tile">
          {char}
        </div>
      ))}
    </div>
  );
}
