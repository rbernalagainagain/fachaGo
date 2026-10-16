import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { CameraScreen } from './src/components/CameraScreen';
import { GameMap } from './src/components/GameMap';
import { usePlayerLocation } from './src/hooks/usePlayerLocation';

export default function App() {
  const location = usePlayerLocation();
  const [cameraOpen, setCameraOpen] = useState(false);

  let content: ReactNode;
  switch (location.status) {
    case 'ready':
      content = (
        <>
          <GameMap position={location.position} heading={location.heading} />
          {location.gpsLost && (
            <SafeAreaView edges={['top']} style={styles.bannerArea} pointerEvents="none">
              <Text style={styles.banner}>Señal GPS perdida. Buscando tu posición…</Text>
            </SafeAreaView>
          )}
          <SafeAreaView edges={['bottom']} style={styles.bottomBar} pointerEvents="box-none">
            <Pressable
              onPress={() => setCameraOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Abrir cámara"
              style={({ pressed }) => [styles.cameraButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.cameraIcon}>📷</Text>
            </Pressable>
          </SafeAreaView>
          {cameraOpen && <CameraScreen onClose={() => setCameraOpen(false)} />}
        </>
      );
      break;
    case 'loading':
      content = (
        <Centered>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.message}>Buscando tu posición…</Text>
        </Centered>
      );
      break;
    case 'denied':
      content = (
        <Centered>
          <Text style={styles.title}>Sin permiso de ubicación</Text>
          <Text style={styles.message}>
            FachaGo necesita tu ubicación para moverte por el mapa mientras caminas.
          </Text>
          {location.canAskAgain ? (
            <Button label="Dar permiso" onPress={location.retry} />
          ) : (
            <>
              <Text style={styles.message}>
                Actívalo en Ajustes y vuelve a la app.
              </Text>
              <Button label="Abrir Ajustes" onPress={() => Linking.openSettings()} />
              <Button label="Reintentar" onPress={location.retry} secondary />
            </>
          )}
        </Centered>
      );
      break;
    case 'services-off':
      content = (
        <Centered>
          <Text style={styles.title}>Ubicación desactivada</Text>
          <Text style={styles.message}>
            Activa la ubicación (GPS) del móvil para poder jugar.
          </Text>
          <Button label="Reintentar" onPress={location.retry} />
        </Centered>
      );
      break;
    case 'error':
      content = (
        <Centered>
          <Text style={styles.title}>Problema con el GPS</Text>
          <Text style={styles.message}>{location.message}</Text>
          <Button label="Reintentar" onPress={location.retry} />
        </Centered>
      );
      break;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {content}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

function Button({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonLabel, secondary && styles.buttonLabelSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a8e6a1',
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
    color: '#14532d',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#14532d',
  },
  button: {
    minWidth: 180,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonLabelSecondary: {
    color: '#0369a1',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cameraButton: {
    margin: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 26,
  },
  bannerArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  banner: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 83, 45, 0.85)',
    color: '#ffffff',
    fontSize: 14,
  },
});
