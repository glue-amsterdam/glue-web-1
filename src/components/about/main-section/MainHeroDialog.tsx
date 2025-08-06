import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { CarouselClientType } from "@/schemas/carouselSchema";

export default function MainHeroDialog({
  slides,
  modalOpen,
  setModalOpen,
  selectedImage,
  setSelectedImage,
}: {
  slides: CarouselClientType["slides"];
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
}) {
  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="w-full p-0 h-full max-h-[90%] max-w-[95vw] md:max-w-[80vw] aspect-video">
        <DialogTitle className="sr-only">
          Photo gallery from the GLUE design route
        </DialogTitle>
        <div className="relative w-full h-full">
          <Image
            src={slides[selectedImage].image_url || "/placeholder.jpg"}
            alt={`Slide from the GLUE Gallery number ${selectedImage}`}
            width={1920}
            height={1080}
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 mix-blend-exclusion"
            onClick={() =>
              setSelectedImage(
                (selectedImage - 1 + slides.length) % slides.length
              )
            }
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 mix-blend-exclusion"
            onClick={() =>
              setSelectedImage((selectedImage + 1) % slides.length)
            }
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
