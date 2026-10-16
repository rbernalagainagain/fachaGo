import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { PlayerPosition } from '../hooks/usePlayerLocation';
import { useSmoothPosition } from '../hooks/useSmoothPosition';
import { gameMapStyle } from '../theme/mapStyle';
import { PlayerAvatar } from './PlayerAvatar';

type Props = {
  position: PlayerPosition;
  heading: number;
};

/** Duración de la animación entre dos lecturas del GPS (ms). */
const MOVE_DURATION = 1000;

const INITIAL_PITCH = 60;
const INITIAL_ZOOM = 18;
/** Equivalente aproximado al zoom en Apple Maps (metros sobre el suelo). */
const INITIAL_ALTITUDE = 300;

/**
 * Mapa en tercera persona: la cámara va inclinada y siempre centrada en el jugador.
 * Se puede girar y acercar con gestos, pero no desplazar, como en Pokémon GO.
 */
export function GameMap({ position, heading }: Props) {
  const mapRef = useRef<MapView>(null);
  const [cameraHeading, setCameraHeading] = useState(0);
  const markerCoordinate = useSmoothPosition(position, MOVE_DURATION);

  useEffect(() => {
    // Solo pasamos el centro para conservar el giro, la inclinación y el zoom del jugador.
    mapRef.current?.animateCamera({ center: position }, { duration: MOVE_DURATION });
  }, [position]);

  const syncCameraHeading = async () => {
    const camera = await mapRef.current?.getCamera();
    if (camera) setCameraHeading(camera.heading);
  };

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialCamera={{
        center: position,
        pitch: INITIAL_PITCH,
        heading: 0,
        zoom: INITIAL_ZOOM,
        altitude: INITIAL_ALTITUDE,
      }}
      customMapStyle={gameMapStyle}
      scrollEnabled={false}
      pitchEnabled={false}
      rotateEnabled
      zoomEnabled
      minZoomLevel={16}
      maxZoomLevel={20}
      showsBuildings
      showsCompass={false}
      showsPointsOfInterests={false}
      toolbarEnabled={false}
      onRegionChangeComplete={syncCameraHeading}
    >
      <Marker coordinate={markerCoordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges>
        <PlayerAvatar heading={heading} cameraHeading={cameraHeading} />
      </Marker>
    </MapView>
  );
}
