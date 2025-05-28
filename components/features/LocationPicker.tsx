import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
  ViewStyle,
  Animated,
  TextInput,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, X, Check, Navigation, Search } from 'lucide-react-native';

interface LocationPickerProps {
  value?: { latitude: number; longitude: number; address?: string };
  onLocationChange: (location: { latitude: number; longitude: number; address?: string }) => void;
  placeholder?: string;
  style?: ViewStyle;
}

// Dark map style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#1a1a2e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1a1a2e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38405c" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#0f0c29" }]
  }
];

export default function LocationPicker({
  value,
  onLocationChange,
  placeholder = "Select Location",
  style,
}: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(value);
  const [tempLocation, setTempLocation] = useState(value);
  const [locationPermission, setLocationPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    Keyboard.dismiss();
    
    try {
      const results = await Location.geocodeAsync(searchQuery);
      
      if (results.length > 0) {
        const location = {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
        
        setTempLocation(location);
        
        // Animate to the searched location
        mapRef.current?.animateToRegion({
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        // Get the full address
        try {
          const [address] = await Location.reverseGeocodeAsync(location);
          if (address) {
            setTempLocation({
              ...location,
              address: `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim(),
            });
          }
        } catch (error) {
          console.log('Could not get address details');
        }
      } else {
        Alert.alert('Not Found', 'Could not find the location. Try a different search.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not search for the location');
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!locationPermission) {
      Alert.alert('Permission Denied', 'Please enable location permissions in settings');
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setTempLocation(newLocation);
      mapRef.current?.animateToRegion({
        ...newLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setTempLocation(coordinate);
  };

  const handleDone = async () => {
    if (tempLocation) {
      let finalLocation = { ...tempLocation };
      
      try {
        const [address] = await Location.reverseGeocodeAsync(tempLocation);
        if (address) {
          finalLocation.address = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
        }
      } catch (error) {
        console.log('Could not get address');
      }
      
      setSelectedLocation(finalLocation);
      onLocationChange(finalLocation);
    }
    closeModal();
  };

  const handleCancel = () => {
    setTempLocation(selectedLocation);
    closeModal();
  };

  const openModal = () => {
    setTempLocation(selectedLocation);
    setSearchQuery('');
    setShowMap(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowMap(false);
    });
  };

  const formatLocation = (location: { latitude: number; longitude: number; address?: string }) => {
    if (location.address) {
      return location.address;
    }
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.input, style]}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <View style={styles.inputContent}>
          <MapPin size={18} color={selectedLocation ? '#fff' : 'rgba(255,255,255,0.4)'} />
          <Text style={[styles.locationText, selectedLocation ? styles.locationTextSelected : styles.locationTextPlaceholder]}>
            {selectedLocation ? formatLocation(selectedLocation) : placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showMap}
        animationType="none"
        presentationStyle="fullScreen"
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#0F0C29', '#302B63', '#24243e']}
            style={styles.gradient}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={handleCancel}
                style={styles.headerButton}
              >
                <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                  <X size={20} color="#ef4444" />
                </BlurView>
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Select Location</Text>
              
              <TouchableOpacity 
                onPress={handleDone}
                style={styles.headerButton}
              >
                <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                  <Check size={20} color="#10b981" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <BlurView intensity={80} tint="dark" style={styles.searchBlur}>
                <View style={styles.searchInputContainer}>
                  <Search size={18} color="rgba(255,255,255,0.6)" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a place..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={styles.clearButton}
                    >
                      <X size={16} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    style={styles.searchButton}
                  >
                    <LinearGradient
                      colors={['#a855f7', '#9333ea']}
                      style={styles.searchButtonGradient}
                    >
                      <Text style={styles.searchButtonText}>
                        {isSearching ? '...' : 'Search'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: tempLocation?.latitude || 45.0703,
                  longitude: tempLocation?.longitude || 7.6869,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
                showsUserLocation={locationPermission}
                showsMyLocationButton={false}
                customMapStyle={darkMapStyle}
              >
                {tempLocation && (
                  <Marker
                    coordinate={tempLocation}
                    draggable
                    onDragEnd={(e) => setTempLocation(e.nativeEvent.coordinate)}
                  >
                    <View style={styles.markerContainer}>
                      <LinearGradient
                        colors={['#a855f7', '#9333ea']}
                        style={styles.marker}
                      >
                        <MapPin size={24} color="white" />
                      </LinearGradient>
                    </View>
                  </Marker>
                )}
              </MapView>

              <TouchableOpacity 
                style={styles.currentLocationButton} 
                onPress={getCurrentLocation}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#a855f7', '#9333ea']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.currentLocationGradient}
                >
                  <Navigation size={20} color="white" />
                  <Text style={styles.currentLocationText}>Current Location</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
  },
  locationTextPlaceholder: {
    color: 'rgba(255,255,255,0.3)',
  },
  locationTextSelected: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: 'rgba(15,12,41,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    right: 20,
    zIndex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  currentLocationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});