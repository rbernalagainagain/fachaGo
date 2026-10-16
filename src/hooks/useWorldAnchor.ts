import { DeviceMotion } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

type Vec3 = [number, number, number];

export type ScreenPoint = { x: number; y: number };

/** Campo de visión vertical aproximado de la cámara trasera en vertical (grados). */
const VERTICAL_FOV = 65;
/** El ancla queda en el suelo, este ángulo por debajo del horizonte (grados). */
const ANCHOR_BELOW_HORIZON = 15;
/** Intervalo de lectura del sensor (ms). */
const UPDATE_INTERVAL = 16;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Ejes del móvil en coordenadas del mundo (z hacia arriba) a partir de los ángulos de
 * DeviceMotion, que siguen el orden Z-X'-Y'' (alpha, beta, gamma) en radianes.
 */
function deviceAxes({ alpha, beta, gamma }: { alpha: number; beta: number; gamma: number }) {
  const [ca, sa] = [Math.cos(alpha), Math.sin(alpha)];
  const [cb, sb] = [Math.cos(beta), Math.sin(beta)];
  const [cg, sg] = [Math.cos(gamma), Math.sin(gamma)];

  const right: Vec3 = [ca * cg - sa * sb * sg, sa * cg + ca * sb * sg, -cb * sg];
  const up: Vec3 = [-sa * cb, ca * cb, sb];
  // La cámara trasera mira hacia -z del móvil.
  const forward: Vec3 = [-(ca * sg + sa * sb * cg), -(sa * sg - ca * sb * cg), -(cb * cg)];
  return { right, up, forward };
}

/** Dirección del ancla: delante de la cámara en horizontal y algo por debajo del horizonte. */
function anchorDirection(forward: Vec3, up: Vec3): Vec3 {
  // Si el móvil apunta casi al suelo, usamos hacia dónde apunta su parte de arriba.
  let [hx, hy] = [forward[0], forward[1]];
  if (Math.hypot(hx, hy) < 0.1) [hx, hy] = [up[0], up[1]];
  const len = Math.hypot(hx, hy);
  const below = toRad(ANCHOR_BELOW_HORIZON);
  return [(hx / len) * Math.cos(below), (hy / len) * Math.cos(below), -Math.sin(below)];
}

/**
 * Fija un punto del mundo delante del jugador al montarse y devuelve dónde cae en la
 * pantalla según cómo se gire o incline el móvil. `null` si queda detrás o fuera de la vista.
 * Si el móvil no tiene sensor de movimiento, el punto se queda en el centro.
 */
export function useWorldAnchor(): ScreenPoint | null {
  const { width, height } = useWindowDimensions();
  const [point, setPoint] = useState<ScreenPoint | null>({ x: width / 2, y: height / 2 });
  const anchorRef = useRef<Vec3 | null>(null);
  const sizeRef = useRef({ width, height });

  useEffect(() => {
    sizeRef.current = { width, height };
  }, [width, height]);

  useEffect(() => {
    let subscription: { remove: () => void } | undefined;
    let cancelled = false;

    DeviceMotion.isAvailableAsync().then((available) => {
      if (cancelled || !available) return;
      DeviceMotion.setUpdateInterval(UPDATE_INTERVAL);
      subscription = DeviceMotion.addListener(({ rotation }) => {
        if (!rotation) return;
        const { right, up, forward } = deviceAxes(rotation);
        anchorRef.current ??= anchorDirection(forward, up);
        const anchor = anchorRef.current;

        const depth = dot(anchor, forward);
        if (depth <= 0.05) {
          setPoint(null);
          return;
        }

        const { width: w, height: h } = sizeRef.current;
        const tanV = Math.tan(toRad(VERTICAL_FOV / 2));
        // La vista previa rellena la pantalla, así que el campo horizontal sale del aspecto.
        const tanH = (tanV * w) / h;
        const x = w / 2 + (dot(anchor, right) / depth / tanH) * (w / 2);
        const y = h / 2 - (dot(anchor, up) / depth / tanV) * (h / 2);

        const margin = 200;
        setPoint(x < -margin || x > w + margin || y < -margin || y > h + margin ? null : { x, y });
      });
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return point;
}
