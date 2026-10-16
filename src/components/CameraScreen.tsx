import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  onClose: () => void;
};

/**
 * Vista de cámara a pantalla completa, como el modo RA de Pokémon GO.
 * Se muestra encima del mapa para no perder la posición ni el giro de la cámara del mapa.
 */
export function CameraScreen({ onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mountError, setMountError] = useState<string | null>(null);

  let content;
  if (!permission) {
    // Todavía se está consultando el permiso.
    content = <View style={styles.fill} />;
  } else if (!permission.granted) {
    content = (
      <View style={styles.center}>
        <Text style={styles.title}>Sin permiso de cámara</Text>
        <Text style={styles.message}>
          FachaGo necesita la cámara para ver el juego sobre el mundo real.
        </Text>
        {permission.canAskAgain ? (
          <RoundedButton label="Dar permiso" onPress={requestPermission} />
        ) : (
          <RoundedButton label="Abrir Ajustes" onPress={() => Linking.openSettings()} />
        )}
      </View>
    );
  } else if (mountError) {
    content = (
      <View style={styles.center}>
        <Text style={styles.title}>No se pudo abrir la cámara</Text>
        <Text style={styles.message}>{mountError}</Text>
      </View>
    );
  } else {
    content = (
      <CameraView
        style={styles.fill}
        facing="back"
        onMountError={({ message }) => setMountError(message)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {content}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Volver al mapa"
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function RoundedButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  fill: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#e2e8f0',
  },
  button: {
    minWidth: 180,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'flex-end',
  },
  closeButton: {
    margin: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    fontSize: 20,
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.7,
  },
});
