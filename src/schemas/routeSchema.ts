export interface RouteDot {
  id?: string; // Optional as it might be auto-generated
  route_id: string;
  map_info_id: string; // Add this line
  user_id: string;
  hub_id: string | null;
  route_step: number;
  map_info?: {
    id: string;
    formatted_address: string;
  };
  route_dot_name?: string; // This isn't in the database schema, but might be useful for UI
}

export interface IndividualRoute {
  id: string;
  name: string;
  description: string;
  route_zone_id: string | null;
  zone: string | null;
  route_dots: RouteDot[];
}
