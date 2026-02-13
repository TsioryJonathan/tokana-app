import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { X, MapPin, Navigation, Check, Search } from 'lucide-react-native';
import { geocodeSearch, type MapboxFeature } from '../lib/mapbox/geocoding';

// Initialiser Mapbox (doit être fait une fois)
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

const DEFAULT_CENTER = [-18.8792, 47.5079]; // Antananarivo [lng, lat]

export type AddressMapPickerProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: { label: string; lat: number; lng: number; address?: string }) => void;
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
  const mapRef = useRef<Mapbox.MapView>(null);
  const [center, setCenter] = useState<[number, number]>(
    initialLocation ? [initialLocation.lng, initialLocation.lat] : DEFAULT_CENTER
  );
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.lng, initialLocation.lat] : DEFAULT_CENTER
  );
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);

  // Recherche d'adresse avec Mapbox
  const handleSearchAddress = async () => {
    if (!addressInput.trim()) return;
    
    setLoading(true);
    try {
      const results = await geocodeSearch(addressInput, { 
        limit: 5, 
        country: 'MG' 
      });
      setSearchResults(results);
      setShowSearchResults(true);
      
      if (results.length > 0) {
        const firstResult = results[0];
        const newCenter: [number, number] = firstResult.center;
        setCenter(newCenter);
        setMarkerPosition(newCenter);
        setZoomLevel(14);
        
        mapRef.current?.flyTo(newCenter, 500);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { geometry } = event;
    if (geometry && geometry.coordinates) {
      const [lng, lat] = geometry.coordinates;
      setMarkerPosition([lng, lat]);
      setCenter([lng, lat]);
    }
  };

  const handleCenterOnUser = async () => {
    setLoading(true);
    try {
      const Location = (await import('expo-location')).default;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const newCenter: [number, number] = [longitude, latitude];
      setCenter(newCenter);
      setMarkerPosition(newCenter);
      setZoomLevel(14);
      
      mapRef.current?.flyTo(newCenter, 500);
    } catch (error) {
      console.warn('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSearchResult = (result: MapboxFeature) => {
    const [lng, lat] = result.center;
    setCenter([lng, lat]);
    setMarkerPosition([lng, lat]);
    setAddressInput(result.place_name);
    setShowSearchResults(false);
    setZoomLevel(14);
    
    mapRef.current?.flyTo([lng, lat], 500);
  };

  const handleConfirm = () => {
    const [lng, lat] = markerPosition;
    onConfirm({
      label: addressInput || `Position: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng,
      address: addressInput,
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
            <Text style={styles.headerSubtitle}>Touchez la carte ou recherchez une adresse</Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une adresse..."
              value={addressInput}
              onChangeText={setAddressInput}
              onSubmitEditing={handleSearchAddress}
              placeholderTextColor="#94A3B8"
            />
            {addressInput.length > 0 && (
              <TouchableOpacity onPress={() => setAddressInput('')}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchAddress}
            disabled={loading || !addressInput.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>Rechercher</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.searchResultItem}
                onPress={() => handleSelectSearchResult(result)}
              >
                <MapPin size={16} color="#64748B" />
                <Text style={styles.searchResultText} numberOfLines={2}>
                  {result.place_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Map */}
        <Mapbox.MapView
          ref={mapRef}
          style={styles.map}
          onPress={handleMapPress}
          onCameraChanged={(state) => {
            setCenter(state.properties.center as [number, number]);
            setZoomLevel(state.properties.zoom);
          }}
        >
          <Mapbox.Camera
            centerCoordinate={center}
            zoomLevel={zoomLevel}
            animationMode="flyTo"
            animationDuration={500}
          />
          
          <Mapbox.PointAnnotation
            id="marker"
            coordinate={markerPosition}
            draggable
            onDragEnd={(event) => {
              const { geometry } = event;
              if (geometry && geometry.coordinates) {
                const [lng, lat] = geometry.coordinates;
                setMarkerPosition([lng, lat]);
              }
            }}
          >
            <View style={styles.markerContainer}>
              <MapPin size={32} color="#FFD700" strokeWidth={3} />
            </View>
          </Mapbox.PointAnnotation>
          
          <Mapbox.UserLocation />
        </Mapbox.MapView>

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
              {markerPosition[1].toFixed(6)}, {markerPosition[0].toFixed(6)}
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 15,
    color: '#0F172A',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  searchResults: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
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
    top: 180,
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
