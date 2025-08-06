import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import { ParticipantClient } from "@/schemas/participantsSchema";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function ParticipantInfoPanel({
  participant,
  participantSelectedImage,
  lu_line,
  eg_line,
  textColor,
}: {
  lu_line: React.RefObject<SVGPathElement>;
  eg_line: React.RefObject<SVGPathElement>;
  participant: ParticipantClient;
  participantSelectedImage: React.RefObject<HTMLImageElement>;
  textColor: string;
}) {
  const sanitizedDescription = useSanitizedHTML(participant.short_description);

  useGSAP(
    () => {
      try {
        const tl = gsap.timeline();

        // Add null checks for line animations
        if (lu_line.current && eg_line.current) {
          tl.fromTo(
            [lu_line.current, eg_line.current],
            {
              opacity: 0,
            },
            {
              opacity: 1,
              duration: 0.5,
              ease: "power2.inOut",
            }
          );
        }

        // Check if participant selected image exists
        if (participantSelectedImage.current) {
          tl.fromTo(
            participantSelectedImage.current,
            {
              opacity: 0,
              y: 50,
              duration: 0.5,
              ease: "power2.inOut",
            },
            {
              opacity: 1,
              y: 0,
            }
          );
        }

        // Check if participant name and description elements exist
        const participantName = document.querySelector("#participant-name");
        const participantDescription = document.querySelector(
          "#participant-description"
        );

        if (participantName || participantDescription) {
          tl.fromTo(
            ["#participant-name", "#participant-description"],
            {
              opacity: 0,
              x: -100,
              ease: "power2.inOut",
            },
            {
              opacity: 1,
              x: 0,
            },
            "<"
          );
        }
      } catch (error) {
        console.error("GSAP animation error in ParticipantInfoPanel:", error);
      }
    },
    { scope: participantSelectedImage }
  );

  return (
    <div
      id="participant-info-panel"
      className="flex-1 justify-end z-30 hidden md:flex"
    >
      <div
        className="p-2 w-[150px] md:h-[180px] overflow-y-auto overflow-x-hidden shadow-md"
        style={{ backgroundColor: textColor }}
      >
        <h3
          id="participant-name"
          aria-label={`${participant.userName} profile`}
          className="mb-2 text-xl text-white text-pretty"
        >
          {participant.userName}
        </h3>
        <p
          className="text-xs md:text-sm text-white text-pretty break-words"
          id="participant-description"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </div>
    </div>
  );
}
