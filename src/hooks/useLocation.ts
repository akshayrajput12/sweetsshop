import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData>({
    city: '',
    state: '',
    country: 'India',
    latitude: 0,
    longitude: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check if location is cached in localStorage
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        setLocation(prev => ({ ...prev, ...parsed, loading: false }));
        return;
      } catch (error) {
        console.error('Error parsing cached location:', error);
      }
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Mock reverse geocoding - in real app, use Google Geocoding API
            // For now, we'll use a default location based on coordinates
            let city = 'Bangalore';
            let state = 'Karnataka';
            
            // Simple coordinate-based city detection for major Indian cities
            if (latitude >= 19.0 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.0) {
              city = 'Mumbai';
              state = 'Maharashtra';
            } else if (latitude >= 28.4 && latitude <= 28.9 && longitude >= 76.8 && longitude <= 77.3) {
              city = 'Delhi';
              state = 'Delhi';
            } else if (latitude >= 13.0 && latitude <= 13.2 && longitude >= 80.1 && longitude <= 80.3) {
              city = 'Chennai';
              state = 'Tamil Nadu';
            } else if (latitude >= 22.4 && latitude <= 22.7 && longitude >= 88.2 && longitude <= 88.5) {
              city = 'Kolkata';
              state = 'West Bengal';
            } else if (latitude >= 17.3 && latitude <= 17.5 && longitude >= 78.3 && longitude <= 78.6) {
              city = 'Hyderabad';
              state = 'Telangana';
            } else if (latitude >= 18.4 && latitude <= 18.7 && longitude >= 73.7 && longitude <= 74.0) {
              city = 'Pune';
              state = 'Maharashtra';
            }

            const locationData = {
              city,
              state,
              country: 'India',
              latitude,
              longitude,
              loading: false,
              error: null,
            };

            setLocation(locationData);
            
            // Cache location for future use
            localStorage.setItem('userLocation', JSON.stringify({
              city,
              state,
              country: 'India',
              latitude,
              longitude,
            }));
            
          } catch (error) {
            console.error('Error getting location details:', error);
            setLocation(prev => ({
              ...prev,
              city: 'Bangalore',
              state: 'Karnataka',
              loading: false,
              error: 'Unable to get precise location',
            }));
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to default location
          setLocation({
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.9716,
            longitude: 77.5946,
            loading: false,
            error: 'Location access denied',
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setLocation(prev => ({
        ...prev,
        city: 'Bangalore',
        state: 'Karnataka',
        loading: false,
        error: 'Geolocation not supported',
      }));
    }
  }, []);

  const refreshLocation = () => {
    localStorage.removeItem('userLocation');
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Same logic as above
          const { latitude, longitude } = position.coords;
          
          let city = 'Bangalore';
          let state = 'Karnataka';
          
          if (latitude >= 19.0 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.0) {
            city = 'Mumbai';
            state = 'Maharashtra';
          } else if (latitude >= 28.4 && latitude <= 28.9 && longitude >= 76.8 && longitude <= 77.3) {
            city = 'Delhi';
            state = 'Delhi';
          }
          // ... other city checks

          const locationData = {
            city,
            state,
            country: 'India',
            latitude,
            longitude,
            loading: false,
            error: null,
          };

          setLocation(locationData);
          localStorage.setItem('userLocation', JSON.stringify({
            city,
            state,
            country: 'India',
            latitude,
            longitude,
          }));
        },
        (error) => {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: 'Unable to get location',
          }));
        }
      );
    }
  };

  return { ...location, refreshLocation };
};
