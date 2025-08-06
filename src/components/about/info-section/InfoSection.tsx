import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import { InfoItemClient, InfoSectionClient } from "@/schemas/infoSchema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InfoCard from "./InfoCard";
import { cn } from "@/lib/utils";
import InfoItemModal from "./InfoItemModal";

export default function InfoSection({
  infoSection,
}: {
  infoSection: InfoSectionClient;
}) {
  const sanitizedDescription = useSanitizedHTML(infoSection.description || "");
  const sanitizedTitle = useSanitizedHTML(infoSection.title || "");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedInfo, setSelectedInfo] = useState<InfoItemClient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync URL parameters with component state
  useEffect(() => {
    const infoId = searchParams.get("info");
    const modal = searchParams.get("modal");

    if (infoId && modal === "true") {
      const infoItem = infoSection.infoItems.find((item) => item.id === infoId);
      if (infoItem) {
        setSelectedInfo(infoItem);
        setModalOpen(true);
      }
    } else {
      setSelectedInfo(null);
      setModalOpen(false);
    }
  }, [searchParams, infoSection.infoItems]);

  const openModal = (info: InfoItemClient) => {
    setSelectedInfo(info);
    setModalOpen(true);

    // Clean up all old parameters and set new modal state
    const params = new URLSearchParams();
    params.set("modal", "true");
    params.set("info", info.id);
    router.push(`?${params.toString()}#info`, { scroll: false });
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInfo(null);

    // Remove modal parameters from URL without redirecting to hash
    router.replace(window.location.pathname, { scroll: false });
  };

  if (!infoSection.is_visible) {
    return null;
  }

  if (infoSection.infoItems.length <= 0)
    return (
      <article className="flex items-center justify-center h-full z-10">
        <Alert variant="default" className="max-w-lg bg-uiwhite text-uiblack">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            No Press Items
          </AlertTitle>
          <AlertDescription className="text-md">
            {`We're currently preparing the Info Items. Check back soon.`}
          </AlertDescription>
        </Alert>
      </article>
    );
  return (
    <section
      ref={ref}
      id="info"
      aria-labelledby="info-title info-description"
      className="min-h-dvh w-full flex flex-col pt-[6rem] pb-[3rem]"
      style={{ backgroundColor: infoSection.background_color }}
    >
      <h2
        id="info-title"
        className="about-title text-3xl md:text-5xl lg:text-6xl xl:text-7xl px-2"
        style={{ color: infoSection.text_color }}
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
      />
      <p id="info-description" className="text-lg">
        <span
          className="about-description text-xs md:text-sm lg:text-base px-4"
          style={{ color: infoSection.text_color }}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </p>
      <div
        className={cn(
          "grid grid-cols-1 w-full flex-1 min-h-0 gap-10 md:gap-6 pt-2 items-stretch auto-rows-fr max-w-[90vw] mx-auto",
          `md:grid-cols-${infoSection.infoItems.length}`
        )}
      >
        {infoSection.infoItems.map((info) => (
          <button
            key={info.id}
            onClick={() => openModal(info)}
            className="h-full min-h-[200px] max-h-[70vh] group relative w-full overflow-hidden"
          >
            <InfoCard info={info} />
          </button>
        ))}
      </div>
      <InfoItemModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        selectedInfo={selectedInfo}
      />
    </section>
  );
}
