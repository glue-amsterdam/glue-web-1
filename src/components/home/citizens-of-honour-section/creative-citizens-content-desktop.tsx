import { ClientCitizen } from "@/schemas/citizenSchema";
import CreativeCitizensImage from "./creative-citizens-image";
import CreativeCitizensTitle from "./creative-citizens-title";
import CreativeCitizensDescription from "./creative-citizens-description";
import { useSanitizedHTML } from "@/hooks/useSanitizedHTML";
import SlideLineNav from "@/components/slide-line-nav";

type Props = {
  description?: string;
  currentCitizen: ClientCitizen | null;
  hasMultiple: boolean;
  currentIndex: number;
  handleSelect: (index: number) => void;
  handleAdvance: () => void;
  citizens: ClientCitizen[];
  archiveYear?: number;
};

const CreativeCitizensContentDesktop = ({
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
      <div className="flex w-full items-start gap-[30px]">
        <CreativeCitizensImage
          citizens={citizens}
          currentIndex={currentIndex}
          onAdvance={hasMultiple ? handleAdvance : undefined}
          archiveYear={archiveYear}
          align="start"
        />
        {sectionDescriptionHtml && (
          <div aria-live="polite" aria-atomic="true">
            <div
              className="small-title-text post-content"
              dangerouslySetInnerHTML={{ __html: sectionDescriptionHtml }}
            />
            {currentCitizen && (
              <>
                <CreativeCitizensTitle title={currentCitizen.name} />
                <CreativeCitizensDescription
                  citizenId={currentCitizen.id}
                  descriptionHtml={citizenDescriptionHtml}
                  showReadMore={false}
                />
              </>
            )}
          </div>
        )}
      </div>
      {hasMultiple && (
        <SlideLineNav
          items={citizens.map((citizen) => ({
            id: citizen.id,
            label: citizen.name,
          }))}
          currentIndex={currentIndex}
          onSelect={handleSelect}
          ariaLabel="Citizens"
          size="desktop"
        />
      )}
    </>
  );
};

export default CreativeCitizensContentDesktop;
