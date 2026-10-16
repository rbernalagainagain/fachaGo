import type { MapStyleElement } from 'react-native-maps';

/**
 * Estilo de mapa tipo juego: verdes y azules saturados, sin etiquetas ni puntos de interés.
 * Solo se aplica con Google Maps (Android, o iOS con PROVIDER_GOOGLE).
 */
export const gameMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#a8e6a1' }] },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#c5ecb5' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#8fdc8a' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#f6f1c9' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d9cf8f' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#fbe58a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#5ec8f2' }] },
];
