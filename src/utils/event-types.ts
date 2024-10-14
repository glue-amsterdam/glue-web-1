export type EventType =
  | "Lecture"
  | "Workshop"
  | "Drink"
  | "Guided Tour"
  | "Exhibition";

export interface Contributor {
  id: string;
  name: string;
  avatar: string;
}

export interface Event {
  id: string;
  name: string;
  thumbnail: string;
  creator: Contributor;
  contributors: Contributor[];
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  description: string;
}

export interface EventsResponse {
  events: Event[];
}
