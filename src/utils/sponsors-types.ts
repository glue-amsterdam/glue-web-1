import { ImageData } from "@/schemas/baseSchema";

export interface Sponsor {
  id: string;
  name: string;
  logo: ImageData;
  website?: string;
  sponsorT: string;
}
