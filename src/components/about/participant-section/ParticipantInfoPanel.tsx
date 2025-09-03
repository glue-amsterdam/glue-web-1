import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import { ParticipantClient } from "@/schemas/participantsSchema";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function ParticipantInfoPanel({
  participant,
  participantSelectedImage,
  textColor,
}: {
  participant: ParticipantClient;
  participantSelectedImage: React.RefObject<HTMLImageElement>;
  textColor: string;
}) {
  const sanitizedDescription = useSanitizedHTML(participant.short_description);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to truncate text to 12 words
  const truncateText = (text: string, maxWords: number = 12): string => {
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  // Get plain text from HTML for word counting (SSR safe)
  const getPlainText = (htmlString: string): string => {
    // Check if we're in the browser
    if (typeof window === "undefined") {
      // Fallback for SSR - simple regex to remove HTML tags
      return htmlString.replace(/<[^>]*>/g, "").trim();
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const plainTextDescription = getPlainText(sanitizedDescription);
  const shouldTruncate = plainTextDescription.split(" ").length > 12;
  const displayText =
    isExpanded || !shouldTruncate
      ? sanitizedDescription
      : truncateText(plainTextDescription);

  useGSAP(
    () => {
      try {
        // Add a small delay to ensure all elements are mounted
        const timeoutId = setTimeout(() => {
          const tl = gsap.timeline();

          // Check if participant selected image exists
          if (participantSelectedImage.current) {
            tl.from(participantSelectedImage.current, {
              y: 50,
              opacity: 0,
              scale: 0.9,
              duration: 0.6,
              ease: "power2.out",
            });
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
                autoAlpha: 0,
                x: -50,
                y: 20,
              },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.1,
              },
              "-=0.3"
            );
          }
        }, 100);

        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error("GSAP animation error in ParticipantInfoPanel:", error);
      }
    },
    {
      dependencies: [participant],
      scope: panelRef,
    }
  );

  return (
    <div
      ref={panelRef}
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
        <div className="space-y-2">
          <p
            data-lenis-prevent
            className="text-xs md:text-sm text-white text-pretty break-words"
            id="participant-description"
            dangerouslySetInnerHTML={{ __html: displayText }}
          />
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-white/80 hover:text-white underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              aria-label={isExpanded ? "Show less" : "Read more"}
            >
              {isExpanded ? "read less" : "read more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
