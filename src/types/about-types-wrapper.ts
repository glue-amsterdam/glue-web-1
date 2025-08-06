import { CuratedV2Response } from "@/lib/about/fetch-curated-section-v2";
import { ParticipantsResponse } from "@/schemas/participantsSchema";
import { ClientCitizensSection } from "@/schemas/citizenSchema";
import { InfoSectionClient } from "@/schemas/infoSchema";
import { PressItemsSectionContent } from "@/schemas/pressSchema";
import { GlueInternationalContent } from "@/schemas/internationalSchema";
import { SponsorsSection } from "@/schemas/sponsorsSchema";
import { CarouselClientType } from "@/schemas/carouselSchema";

export interface AboutClientPageProps {
  carouselData: CarouselClientType;
  participantData: ParticipantsResponse;
  citizensData: ClientCitizensSection;
  curatedDataV2: CuratedV2Response;
  infoItemsSection: InfoSectionClient;
  pressSectionData: PressItemsSectionContent;
  glueInternational: GlueInternationalContent;
  sponsorsData: SponsorsSection;
}
