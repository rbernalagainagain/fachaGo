import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type PlayerPosition = {
  latitude: number;
  longitude: number;
};

type PlayerLocationState =
  | { status: 'loading' }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'services-off' }
  | { status: 'error'; message: string }
  | { status: 'ready'; position: PlayerPosition; heading: number; gpsLost: boolean };

/** Tiempo máximo esperando la primera posición antes de dar el GPS por fallido (ms). */
const FIRST_FIX_TIMEOUT = 20000;

/**
 * Sigue la posición GPS y la orientación de la brújula del jugador.
 * `retry` vuelve a pedir permiso y a arrancar el GPS.
 */
export function usePlayerLocation(): PlayerLocationState & { retry: () => void } {
  const [state, setState] = useState<PlayerLocationState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let positionSub: Location.LocationSubscription | undefined;
    let headingSub: Location.LocationSubscription | undefined;
    let cancelled = false;
    let heading = 0;

    const firstFixTimer = setTimeout(() => {
      if (cancelled) return;
      setState((prev) =>
        prev.status === 'loading'
          ? {
              status: 'error',
              message: 'El GPS no da tu posición. Prueba en un sitio más despejado.',
            }
          : prev,
      );
    }, FIRST_FIX_TIMEOUT);

    // Un fallo del GPS con el juego en marcha no quita el mapa: se avisa y se sigue esperando.
    const onGpsError = () => {
      if (cancelled) return;
      setState((prev) =>
        prev.status === 'ready'
          ? { ...prev, gpsLost: true }
          : { status: 'error', message: 'No se pudo obtener tu ubicación.' },
      );
    };

    async function start() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (permission.status !== 'granted') {
        setState({ status: 'denied', canAskAgain: permission.canAskAgain });
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (cancelled) return;
      if (!servicesEnabled) {
        setState({ status: 'services-off' });
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
            gpsLost: false,
          });
        },
        onGpsError,
      );

      // Sin brújula el juego sigue funcionando; la flecha se queda apuntando al norte.
      headingSub = await Location.watchHeadingAsync(
        ({ trueHeading, magHeading }) => {
          heading = trueHeading >= 0 ? trueHeading : magHeading;
          setState((prev) => (prev.status === 'ready' ? { ...prev, heading } : prev));
        },
        () => {},
      );

      // Si el componente se desmontó mientras esperábamos las suscripciones.
      if (cancelled) {
        positionSub.remove();
        headingSub.remove();
      }
    }

    start().catch(onGpsError);

    return () => {
      cancelled = true;
      clearTimeout(firstFixTimer);
      positionSub?.remove();
      headingSub?.remove();
    };
  }, [attempt]);

  return { ...state, retry };
}
