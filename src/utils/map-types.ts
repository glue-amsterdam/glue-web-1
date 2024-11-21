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
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MapBoxAutocompleteResponse = MapBoxPlace[];
