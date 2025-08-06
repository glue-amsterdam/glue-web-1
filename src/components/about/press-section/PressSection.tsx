import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { PressItemsSectionContent, PressItem } from "@/schemas/pressSchema";
import { AlertCircle } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PressCard from "./PressCard";
import PressItemModal from "./PressItemModal";

type Props = {
  pressItemsSection: PressItemsSectionContent;
};

export default function PressSection({ pressItemsSection }: Props) {
  const sanitizedDescription = useSanitizedHTML(
    pressItemsSection.description || ""
  );
  const sanitizedTitle = useSanitizedHTML(pressItemsSection.title || "");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedPress, setSelectedPress] = useState<PressItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync URL parameters with component state
  useEffect(() => {
    const pressId = searchParams.get("press");
    const modal = searchParams.get("modal");

    if (pressId && modal === "true") {
      const pressItem = pressItemsSection.pressItems.find(
        (item) => item.id === pressId
      );
      if (pressItem) {
        setSelectedPress(pressItem);
        setModalOpen(true);
      }
    } else {
      setSelectedPress(null);
      setModalOpen(false);
    }
  }, [searchParams, pressItemsSection.pressItems]);

  const openModal = (press: PressItem) => {
    setSelectedPress(press);
    setModalOpen(true);

    // Clean up all old parameters and set new modal state
    const params = new URLSearchParams();
    params.set("modal", "true");
    params.set("press", press.id);
    router.push(`?${params.toString()}#press`, { scroll: false });
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPress(null);

    // Remove modal parameters from URL without redirecting to hash
    router.replace(window.location.pathname, { scroll: false });
  };

  if (!pressItemsSection.is_visible) {
    return null;
  }

  if (pressItemsSection.pressItems.length === 0) {
    return (
      <article className="flex items-center justify-center h-full z-10">
        <Alert variant="default" className="max-w-lg bg-uiwhite text-uiblack">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            No Press Items
          </AlertTitle>
          <AlertDescription className="text-md">
            {`We're currently preparing the Press Items. Check back soon.`}
          </AlertDescription>
        </Alert>
      </article>
    );
  }

  return (
    <section
      ref={ref}
      id="press"
      aria-labelledby="press-heading press-description"
      className="min-h-dvh w-full flex flex-col pt-[6rem] pb-[3rem]"
      style={{ backgroundColor: pressItemsSection.background_color }}
    >
      <h2
        id="press-heading"
        className="about-title text-3xl md:text-5xl lg:text-6xl xl:text-7xl px-2"
        style={{ color: pressItemsSection.text_color }}
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
      />
      <p id="press-description" className="text-lg">
        <span
          className="about-description text-xs md:text-sm lg:text-base px-4"
          style={{ color: pressItemsSection.text_color }}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </p>
      <div
        className={cn(
          "grid grid-cols-1 w-full flex-1 min-h-0 gap-10 md:gap-6 pt-2 items-stretch auto-rows-fr max-w-[90vw] mx-auto",
          `md:grid-cols-${pressItemsSection.pressItems.length}`
        )}
      >
        {pressItemsSection.pressItems.map((press) => (
          <button
            key={press.id}
            onClick={() => openModal(press)}
            className="h-full min-h-[200px] max-h-[70vh] group relative w-full overflow-hidden"
          >
            <PressCard press={press} />
          </button>
        ))}
      </div>
      <PressItemModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        selectedPress={selectedPress}
      />
    </section>
  );
}
