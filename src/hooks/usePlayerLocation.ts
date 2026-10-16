import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type PlayerPosition = {
  latitude: number;
  longitude: number;
};

type PlayerLocationState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error'; message: string }
  | { status: 'ready'; position: PlayerPosition; heading: number };

/**
 * Sigue la posición GPS y la orientación de la brújula del jugador.
 */
export function usePlayerLocation(): PlayerLocationState {
  const [state, setState] = useState<PlayerLocationState>({ status: 'loading' });

  useEffect(() => {
    let positionSub: Location.LocationSubscription | undefined;
    let headingSub: Location.LocationSubscription | undefined;
    let cancelled = false;
    let heading = 0;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setState({ status: 'denied' });
        return;
      }

      positionSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        ({ coords }) => {
          setState({
            status: 'ready',
            position: { latitude: coords.latitude, longitude: coords.longitude },
            heading,
          });
        },
        (message) => setState({ status: 'error', message }),
      );

      headingSub = await Location.watchHeadingAsync(({ trueHeading, magHeading }) => {
        heading = trueHeading >= 0 ? trueHeading : magHeading;
        setState((prev) => (prev.status === 'ready' ? { ...prev, heading } : prev));
      });

      // Si el componente se desmontó mientras esperábamos las suscripciones.
      if (cancelled) {
        positionSub.remove();
        headingSub.remove();
      }
    }

    start().catch((e: unknown) => {
      if (!cancelled) setState({ status: 'error', message: String(e) });
    });

    return () => {
      cancelled = true;
      positionSub?.remove();
      headingSub?.remove();
    };
  }, []);

  return state;
}
