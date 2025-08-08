import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
  }) => void;
  initialLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
}

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  type: 'home' | 'work' | 'other';
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(initialLocation || null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedAddresses();
    const initializeMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        toast({
          title: "Configuration Error",
          description: "Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();
        
        if (mapRef.current) {
          const defaultCenter = initialLocation || { lat: 12.9716, lng: 77.5946 }; // Bengaluru
          
          const map = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 15,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          mapInstanceRef.current = map;

          // Add marker
          const marker = new google.maps.Marker({
            position: defaultCenter,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });

          markerRef.current = marker;

          // Handle marker drag
          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
              reverseGeocode(position.lat(), position.lng());
            }
          });

          // Handle map click
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              marker.setPosition(event.latLng);
              reverseGeocode(event.latLng.lat(), event.latLng.lng());
            }
          });

          // Initialize autocomplete
          if (searchInputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(
              searchInputRef.current,
              {
                componentRestrictions: { country: 'in' },
                fields: ['place_id', 'geometry', 'name', 'formatted_address'],
                types: ['establishment', 'geocode']
              }
            );

            autocompleteRef.current = autocomplete;

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place.geometry && place.geometry.location) {
                const location = place.geometry.location;
                map.setCenter(location);
                marker.setPosition(location);
                
                setCurrentLocation({
                  address: place.formatted_address || place.name || '',
                  lat: location.lat(),
                  lng: location.lng()
                });
                
                onLocationSelect({
                  address: place.formatted_address || place.name || '',
                  lat: location.lat(),
                  lng: location.lng(),
                  placeId: place.place_id
                });
              }
            });
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast({
          title: "Error",
          description: "Failed to load Google Maps. Please check your internet connection.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [initialLocation, onLocationSelect, toast]);

  const fetchSavedAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .limit(5); // Show only top 5 addresses

      if (error) throw error;
      
      const formattedAddresses = (data || []).map(addr => ({
        id: addr.id,
        label: addr.name,
        address: `${addr.address_line_1}, ${addr.city}, ${addr.state}`,
        lat: addr.latitude || 0,
        lng: addr.longitude || 0,
        type: addr.type as 'home' | 'work' | 'other'
      }));
      
      setSavedAddresses(formattedAddresses);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({
        location: { lat, lng }
      });

      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setCurrentLocation({ address, lat, lng });
        setSearchValue(address);
        onLocationSelect({ address, lat, lng });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (mapInstanceRef.current && markerRef.current) {
          const location = new google.maps.LatLng(latitude, longitude);
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(16);
          markerRef.current.setPosition(location);
          reverseGeocode(latitude, longitude);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location access denied",
          description: "Please allow location access to use this feature.",
          variant: "destructive",
        });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const selectSavedAddress = (address: SavedAddress) => {
    if (mapInstanceRef.current && markerRef.current) {
      const location = new google.maps.LatLng(address.lat, address.lng);
      mapInstanceRef.current.setCenter(location);
      markerRef.current.setPosition(location);
    }
    
    setCurrentLocation({
      address: address.address,
      lat: address.lat,
      lng: address.lng
    });
    
    setSearchValue(address.address);
    setShowSavedAddresses(false);
    
    onLocationSelect({
      address: address.address,
      lat: address.lat,
      lng: address.lng
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search for area, street name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10 h-12 text-base"
          onFocus={() => setShowSavedAddresses(true)}
        />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue('');
              setShowSavedAddresses(true);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Current Location Button */}
      <Button
        onClick={getCurrentLocation}
        variant="outline"
        className="w-full h-12 justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
        disabled={isLoading}
      >
        <Navigation className="h-4 w-4 mr-3" />
        Use current location
      </Button>

      {/* Saved Addresses */}
      {showSavedAddresses && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 text-gray-700">Saved Addresses</h3>
            <div className="space-y-2">
              {savedAddresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => selectSavedAddress(address)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">
                        {address.label}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {address.address}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border"
          style={{ minHeight: '300px' }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {currentLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  Selected Location
                </h4>
                <p className="text-sm text-gray-600">
                  {currentLocation.address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationPicker;
