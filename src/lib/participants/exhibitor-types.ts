export type ExhibitorType =
  | "special-program"
  | "up-to-three-participants"
  | "hub";

export type ExhibitorSortField = "name" | "displayNumber";
export type ExhibitorSortOrder = "asc" | "desc";

export type ExhibitorItem = {
  type: ExhibitorType;
  name: string;
  imageUrl: string;
  displayNumber: string | null;
  hubDisplayNumber: string | null;
  userId?: string;
  hubId?: string;
  slug?: string;
};

export type ExhibitorsGroupedResponse = {
  specialProgram: ExhibitorItem[];
  upToThreeParticipants: ExhibitorItem[];
  hubs: ExhibitorItem[];
};

export type ExhibitorsPageResponse = {
  items: ExhibitorItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type ExhibitorsQueryParams = {
  limit?: number;
  offset?: number;
  type?: ExhibitorType;
  sort?: ExhibitorSortField;
  order?: ExhibitorSortOrder;
  q?: string;
};

export type ParsedExhibitorsQuery = {
  limit: number;
  offset: number;
  type?: ExhibitorType;
  sort: ExhibitorSortField;
  order: ExhibitorSortOrder;
  q?: string;
};
