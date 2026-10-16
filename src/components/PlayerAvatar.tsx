import { StyleSheet, View } from 'react-native';

type Props = {
  /** Orientación del jugador en grados respecto al norte. */
  heading: number;
  /** Orientación actual de la cámara, para que la flecha apunte bien con el mapa girado. */
  cameraHeading: number;
};

/**
 * Avatar del jugador: un círculo con aura y una flecha que indica hacia dónde mira.
 */
export function PlayerAvatar({ heading, cameraHeading }: Props) {
  const rotation = heading - cameraHeading;

  return (
    <View style={styles.container}>
      <View style={styles.aura} />
      <View style={[styles.arrowWrapper, { transform: [{ rotate: `${rotation}deg` }] }]}>
        <View style={styles.arrow} />
      </View>
      <View style={styles.body} />
    </View>
  );
}

const SIZE = 64;

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  arrowWrapper: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0ea5e9',
    marginTop: 2,
  },
  body: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0ea5e9',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
});
