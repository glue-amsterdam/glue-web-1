import { useSanitizedHTML } from "@/hooks/useSanitizedHTML";
import { ClientCitizen } from "@/schemas/citizenSchema";
import SlideLineNav from "@/components/slide-line-nav";

import CreativeCitizensDescription from "./creative-citizens-description";
import CreativeCitizensImage from "./creative-citizens-image";
import CreativeCitizensTitle from "./creative-citizens-title";

type Props = {
  currentCitizen: ClientCitizen | null;
  description?: string;
  hasMultiple: boolean;
  currentIndex: number;
  handleSelect: (index: number) => void;
  handleAdvance: () => void;
  citizens: ClientCitizen[];
  archiveYear?: number;
};

const CreativeCitizensContentMobile = ({
  description,
  currentCitizen,
  hasMultiple,
  currentIndex,
  handleSelect,
  handleAdvance,
  citizens,
  archiveYear,
}: Props) => {
  const sectionDescriptionHtml = useSanitizedHTML(description ?? "");
  const citizenDescriptionHtml = useSanitizedHTML(
    currentCitizen?.description ?? ""
  );

  return (
    <>
      {sectionDescriptionHtml && (
        <div
          className="text-[19px] leading-[26px] post-content"
          dangerouslySetInnerHTML={{ __html: sectionDescriptionHtml }}
        />
      )}

      {currentCitizen && (
        <div className="pt-[60px]" aria-live="polite" aria-atomic="true">
          <CreativeCitizensImage
            citizens={citizens}
            currentIndex={currentIndex}
            onAdvance={hasMultiple ? handleAdvance : undefined}
            archiveYear={archiveYear}
          />
          <CreativeCitizensTitle title={currentCitizen.name} />
          <CreativeCitizensDescription
            citizenId={currentCitizen.id}
            descriptionHtml={citizenDescriptionHtml}
          />
        </div>
      )}

      {hasMultiple && (
        <SlideLineNav
          items={citizens.map((citizen) => ({
            id: citizen.id,
            label: citizen.name,
          }))}
          currentIndex={currentIndex}
          onSelect={handleSelect}
          ariaLabel="Citizens"
        />
      )}
    </>
  );
};

export default CreativeCitizensContentMobile;
