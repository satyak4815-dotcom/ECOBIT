import React, { useState, useEffect } from 'react';
import SplitFlapLogo from './SplitFlapLogo';
import PlanetaryLoader from './PlanetaryLoader';

export default function IntroUI({ onComplete }) {
  const [startSplitFlap, setStartSplitFlap] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [transitionOut, setTransitionOut] = useState(false);

  useEffect(() => {
    // 2.5s ECOBIT split-flap starts
    const t3 = setTimeout(() => setStartSplitFlap(true), 2500);

    // 4.0s Tagline appears and Loading sequence starts
    const t4 = setTimeout(() => setStartLoading(true), 4000);

    // ~12.5s trigger local transition out animation
    const t5 = setTimeout(() => {
      setTransitionOut(true);
      // Wait for fade out animation before telling App to swap
      setTimeout(() => onComplete(), 1500);
    }, 12500);

    return () => {
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div className={`intro-ui-container ${transitionOut ? 'fade-out' : ''}`}>
      {startLoading && (
        <PlanetaryLoader startAnimation={startLoading} />
      )}
      
      <div className="bottom-ui-container">
        <SplitFlapLogo startAnimation={startSplitFlap} />
        {startLoading && (
          <div className="tagline">
            Intelligence for a Changing Planet.
          </div>
        )}
      </div>
    </div>
  );
}
