import { ImageData } from "@/utils/global-types";

export interface Sponsor {
  id: string;
  name: string;
  logo: ImageData;
  website?: string;
  sponsorT: string;
}
