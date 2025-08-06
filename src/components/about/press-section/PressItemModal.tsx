import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PressItem } from "@/schemas/pressSchema";
import Image from "next/image";

export default function PressItemModal({
  modalOpen,
  closeModal,
  selectedPress,
}: {
  modalOpen: boolean;
  closeModal: () => void;
  selectedPress: PressItem | null;
}) {
  const sanitizedDescription = useSanitizedHTML(
    selectedPress?.description || ""
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        data-lenis-prevent
        forceMount
        className="text-uiblack w-[90vw] max-w-full h-[90vh] max-h-[90vh] rounded-none"
      >
        {selectedPress && (
          <div className="relative w-full h-full gap-10 flex flex-col lg:flex-row">
            <div className="flex-1 relative max-h-[80vh]">
              <Image
                src={selectedPress.image_url || "/placeholder.jpg"}
                alt={selectedPress.title}
                width={1600}
                height={900}
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover w-full h-full object-center absolute"
                quality={100}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-uiwhite/80 p-6 lg:hidden">
                <DialogTitle>
                  <p className="text-xl md:text-3xl font-bold">
                    {selectedPress.title}
                  </p>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed information about {selectedPress.title}
                </DialogDescription>
              </div>
            </div>

            <div className="flex-1 relative max-h-[80vh] overflow-y-auto">
              <div className="hidden lg:block mb-6 p-6 bg-white">
                <DialogTitle>
                  <p className="text-3xl font-bold">{selectedPress.title}</p>
                </DialogTitle>
              </div>
              <div className="flex-1 p-6 bg-white">
                <div
                  className="text-sm md:text-base prose max-w-none font-overpas text-black"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
