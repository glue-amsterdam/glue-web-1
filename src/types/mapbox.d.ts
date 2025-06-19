declare module "@mapbox/mapbox-sdk/services/geocoding" {
  interface GeocodingResponse {
    body: {
      features: Array<{
        place_name: string;
        center: [number, number];
      }>;
    };
  }

  interface GeocodingService {
    forwardGeocode(options: {
      query: string;
      limit?: number;
      countries?: string[];
      types?: string[];
      bbox?: [number, number, number, number];
      proximity?: [number, number];
    }): {
      send(): Promise<GeocodingResponse>;
    };
  }

  const geocoding: (config: { accessToken: string }) => GeocodingService;
  export default geocoding;
}
