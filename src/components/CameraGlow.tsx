import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

/** Duración de medio latido del brillo (ms). */
const PULSE_DURATION = 1200;

/**
 * Brillo que late en los bordes de la vista de cámara. Es solo un efecto visual:
 * no detecta personas ni objetos.
 */
export function CameraGlow() {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View pointerEvents="none" style={[styles.glow, { opacity }]} />;
}

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: 'rgba(125, 211, 252, 0.9)',
    boxShadow: [
      { offsetX: 0, offsetY: 0, blurRadius: 24, spreadDistance: 4, color: 'rgba(56, 189, 248, 0.9)', inset: true },
      { offsetX: 0, offsetY: 0, blurRadius: 80, spreadDistance: 12, color: 'rgba(56, 189, 248, 0.45)', inset: true },
    ],
  },
});
