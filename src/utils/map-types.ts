export interface Location {
  id: number;
  title: string;
  content: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface LocationGroup {
  id: string;
  title: string;
  protected: boolean;
  locations: Location[];
}

export interface User {
  id: number;
  name: string;
}

interface LocationContext {
  id: string;
  text: string;
  short_code?: string;
}

export interface MapBoxPlace {
  id: string /* FOREING KEY */;
  text: string;
  place_name: string;
  center: [number, number];
  context: LocationContext[];
}

export type MapBoxAutocompleteResponse = MapBoxPlace[];
