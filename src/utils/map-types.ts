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
