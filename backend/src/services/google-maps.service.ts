import axios from 'axios';
import { config } from '../config/env';
import logger from '../utils/logger';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
}

interface RouteOptimizationResult {
  optimized_waypoints: Location[];
  total_distance: number;
  total_duration: number;
  routes: Array<{
    from: Location;
    to: Location;
    distance: number;
    duration: number;
  }>;
}

interface NavigationLink {
  google_maps_url: string;
  origin: Location;
  destination: Location;
  waypoints?: Location[];
}

class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = config.googleMapsApiKey || '';
    if (!this.apiKey) {
      logger.warn('Google Maps API key not configured');
    }
  }

  /**
   * Get autocomplete suggestions for location input
   */
  async getPlaceAutocomplete(input: string, sessionToken?: string): Promise<PlaceAutocompleteResult[]> {
    try {
      const params: any = {
        input,
        key: this.apiKey,
        components: 'country:kh', // Restrict to Cambodia
        language: 'en',
      };

      if (sessionToken) {
        params.sessiontoken = sessionToken;
      }

      const response = await axios.get(`${this.baseUrl}/place/autocomplete/json`, { params });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.predictions || [];
    } catch (error) {
      logger.error('Error fetching place autocomplete:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const params = {
        place_id: placeId,
        key: this.apiKey,
        fields: 'place_id,formatted_address,geometry,name',
      };

      const response = await axios.get(`${this.baseUrl}/place/details/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      logger.error('Error fetching place details:', error);
      throw error;
    }
  }

  /**
   * Calculate distance and duration between two points
   */
  async getDistanceMatrix(
    origins: Location[],
    destinations: Location[]
  ): Promise<any> {
    try {
      const originsStr = origins
        .map(loc => `${loc.latitude},${loc.longitude}`)
        .join('|');
      const destinationsStr = destinations
        .map(loc => `${loc.latitude},${loc.longitude}`)
        .join('|');

      const params = {
        origins: originsStr,
        destinations: destinationsStr,
        key: this.apiKey,
        mode: 'driving',
        units: 'metric',
      };

      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Error fetching distance matrix:', error);
      throw error;
    }
  }

  /**
   * Optimize route for multiple waypoints using nearest neighbor algorithm
   */
  async optimizeRoute(waypoints: Location[]): Promise<RouteOptimizationResult> {
    try {
      if (waypoints.length < 2) {
        throw new Error('At least 2 waypoints required for route optimization');
      }

      // For simple optimization, we'll use distance matrix to find optimal order
      const unvisited = [...waypoints];
      const optimized: Location[] = [];
      let currentLocation = unvisited.shift()!;
      optimized.push(currentLocation);

      let totalDistance = 0;
      let totalDuration = 0;
      const routes: Array<{
        from: Location;
        to: Location;
        distance: number;
        duration: number;
      }> = [];

      // Nearest neighbor algorithm
      while (unvisited.length > 0) {
        const distanceData = await this.getDistanceMatrix([currentLocation], unvisited);
        
        let nearestIndex = 0;
        let minDistance = Infinity;

        distanceData.rows[0].elements.forEach((element: any, index: number) => {
          if (element.status === 'OK' && element.distance.value < minDistance) {
            minDistance = element.distance.value;
            nearestIndex = index;
          }
        });

        const nearest = unvisited[nearestIndex];
        const element = distanceData.rows[0].elements[nearestIndex];

        routes.push({
          from: currentLocation,
          to: nearest,
          distance: element.distance.value,
          duration: element.duration.value,
        });

        totalDistance += element.distance.value;
        totalDuration += element.duration.value;

        optimized.push(nearest);
        unvisited.splice(nearestIndex, 1);
        currentLocation = nearest;
      }

      return {
        optimized_waypoints: optimized,
        total_distance: totalDistance,
        total_duration: totalDuration,
        routes,
      };
    } catch (error) {
      logger.error('Error optimizing route:', error);
      throw error;
    }
  }

  /**
   * Generate Google Maps navigation link
   */
  generateNavigationLink(
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ): NavigationLink {
    let url = 'https://www.google.com/maps/dir/?api=1';
    url += `&origin=${origin.latitude},${origin.longitude}`;
    url += `&destination=${destination.latitude},${destination.longitude}`;

    if (waypoints && waypoints.length > 0) {
      const waypointsStr = waypoints
        .map(wp => `${wp.latitude},${wp.longitude}`)
        .join('|');
      url += `&waypoints=${waypointsStr}`;
    }

    url += '&travelmode=driving';

    return {
      google_maps_url: url,
      origin,
      destination,
      waypoints,
    };
  }

  /**
   * Generate static map image URL
   */
  generateStaticMapUrl(
    center: Location,
    markers?: Location[],
    zoom: number = 13,
    size: string = '600x400'
  ): string {
    let url = `${this.baseUrl}/staticmap?`;
    url += `center=${center.latitude},${center.longitude}`;
    url += `&zoom=${zoom}`;
    url += `&size=${size}`;
    url += `&key=${this.apiKey}`;

    if (markers && markers.length > 0) {
      markers.forEach((marker, index) => {
        url += `&markers=color:red%7Clabel:${index + 1}%7C${marker.latitude},${marker.longitude}`;
      });
    }

    return url;
  }

  /**
   * Get current location coordinates from address
   */
  async geocodeAddress(address: string): Promise<Location> {
    try {
      const params = {
        address,
        key: this.apiKey,
        components: 'country:KH',
      };

      const response = await axios.get(`${this.baseUrl}/geocode/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding error: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address: result.formatted_address,
      };
    } catch (error) {
      logger.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const params = {
        latlng: `${latitude},${longitude}`,
        key: this.apiKey,
      };

      const response = await axios.get(`${this.baseUrl}/geocode/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Reverse geocoding error: ${response.data.status}`);
      }

      return response.data.results[0].formatted_address;
    } catch (error) {
      logger.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  /**
   * Calculate estimated travel time between locations
   */
  async calculateTravelTime(
    origin: Location,
    destination: Location,
    departureTime?: Date
  ): Promise<{ distance: number; duration: number; duration_in_traffic?: number }> {
    try {
      const params: any = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        key: this.apiKey,
        mode: 'driving',
        units: 'metric',
      };

      if (departureTime) {
        params.departure_time = Math.floor(departureTime.getTime() / 1000);
      }

      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Distance Matrix API error: ${response.data.status}`);
      }

      const element = response.data.rows[0].elements[0];

      if (element.status !== 'OK') {
        throw new Error(`Route calculation error: ${element.status}`);
      }

      return {
        distance: element.distance.value,
        duration: element.duration.value,
        duration_in_traffic: element.duration_in_traffic?.value,
      };
    } catch (error) {
      logger.error('Error calculating travel time:', error);
      throw error;
    }
  }
}

export default new GoogleMapsService();
