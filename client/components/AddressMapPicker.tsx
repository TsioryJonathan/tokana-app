import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { X, MapPin, Navigation, Check } from 'lucide-react-native';

const DEFAULT_REGION = {
  latitude: -18.8792, // Antananarivo
  longitude: 47.5079,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export type AddressMapPickerProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: { label: string; lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number; address?: string } | null;
  initialAddress?: string;
};

export default function AddressMapPicker({
  visible,
  onClose,
  onConfirm,
  initialLocation,
  initialAddress = '',
}: AddressMapPickerProps) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(
    initialLocation
      ? {
          latitude: initialLocation.lat,
          longitude: initialLocation.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : DEFAULT_REGION
  );
  const [markerPosition, setMarkerPosition] = useState<{
    latitude: number;
    longitude: number;
  }>(
    initialLocation
      ? { latitude: initialLocation.lat, longitude: initialLocation.lng }
      : { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude }
  );
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [loading, setLoading] = useState(false);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    // Centrer la carte sur la nouvelle position
    setRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleCenterOnUser = async () => {
    setLoading(true);
    try {
      // Demander la position actuelle
      const Location = (await import('expo-location')).default;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(newRegion);
      setMarkerPosition({ latitude, longitude });
      mapRef.current?.animateToRegion(newRegion, 500);
    } catch (error) {
      console.warn('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      label: addressInput || `Position: ${markerPosition.latitude.toFixed(5)}, ${markerPosition.longitude.toFixed(5)}`,
      lat: markerPosition.latitude,
      lng: markerPosition.longitude,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Sélectionner sur la carte</Text>
            <Text style={styles.headerSubtitle}>Touchez la carte pour préciser l'emplacement</Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
          onPress={handleMapPress}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setMarkerPosition({ latitude, longitude });
            }}
          >
            <View style={styles.markerContainer}>
              <MapPin size={32} color="#FFD700" strokeWidth={3} />
            </View>
          </Marker>
        </MapView>

        {/* Center button */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handleCenterOnUser}
          activeOpacity={0.8}
        >
          <Navigation size={24} color="#0F172A" />
          {loading && <ActivityIndicator size="small" color="#0F172A" style={styles.centerLoading} />}
        </TouchableOpacity>

        {/* Bottom Panel */}
        <View style={styles.bottomPanel}>
          <View style={styles.coordinateInfo}>
            <Text style={styles.coordinateLabel}>Position sélectionnée</Text>
            <Text style={styles.coordinateValue}>
              {markerPosition.latitude.toFixed(6)}, {markerPosition.longitude.toFixed(6)}
            </Text>
          </View>

          <View style={styles.addressInputContainer}>
            <View style={styles.inputRow}>
              <MapPin size={20} color="#64748B" />
              <TextInput
                style={styles.addressInput}
                placeholder="Nom du lieu / Repère (optionnel)"
                value={addressInput}
                onChangeText={setAddressInput}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Check size={20} color="#0F172A" />
            <Text style={styles.confirmButtonText}>Confirmer cette position</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerLoading: {
    position: 'absolute',
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  coordinateInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  addressInputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
