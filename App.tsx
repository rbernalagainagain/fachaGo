import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GameMap } from './src/components/GameMap';
import { usePlayerLocation } from './src/hooks/usePlayerLocation';

export default function App() {
  const location = usePlayerLocation();

  return (
    <View style={styles.container}>
      {location.status === 'ready' ? (
        <GameMap position={location.position} heading={location.heading} />
      ) : (
        <View style={styles.center}>
          {location.status === 'loading' && (
            <>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={styles.message}>Buscando tu posición…</Text>
            </>
          )}
          {location.status === 'denied' && (
            <Text style={styles.message}>
              Necesitamos acceso a tu ubicación para jugar. Actívalo en los ajustes del móvil.
            </Text>
          )}
          {location.status === 'error' && (
            <Text style={styles.message}>No se pudo obtener la ubicación: {location.message}</Text>
          )}
        </View>
      )}
      <StatusBar style="dark" />
    </View>
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
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#14532d',
  },
});
