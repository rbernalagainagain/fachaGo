import { useEffect, useRef, useState } from 'react';

import type { PlayerPosition } from './usePlayerLocation';

/**
 * Interpola entre lecturas del GPS para que el avatar se deslice en vez de dar saltos.
 */
export function useSmoothPosition(target: PlayerPosition, duration: number): PlayerPosition {
  const [current, setCurrent] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    const start = Date.now();
    let frame: number;

    const step = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const next = {
        latitude: from.latitude + (target.latitude - from.latitude) * t,
        longitude: from.longitude + (target.longitude - from.longitude) * t,
      };
      currentRef.current = next;
      setCurrent(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target.latitude, target.longitude, duration]);

  return current;
}
