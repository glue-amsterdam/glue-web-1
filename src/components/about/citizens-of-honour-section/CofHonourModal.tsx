import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ClientCitizen } from "@/schemas/citizenSchema";
import Image from "next/image";
import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import React, { useEffect } from "react";
import { useLenis } from "@studio-freight/react-lenis";

interface CofHonourModalProps {
  citizen: ClientCitizen | null;
  open: boolean;
  onClose: () => void;
}

const CofHonourModal = ({ citizen, open, onClose }: CofHonourModalProps) => {
  const sanitizedDescription = useSanitizedHTML(citizen?.description || "");
  const lenis = useLenis();

  useEffect(() => {
    if (open) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    return () => {
      lenis?.start();
    };
  }, [open, lenis]);

  if (!citizen) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-lenis-prevent
        className="text-uiwhite z-50 w-[90vw] md:w-[80vw] lg:w-[70vw] max-w-none h-[90vh] border-none rounded-none bg-transparent font-overpass p-0"
      >
        <DialogTitle className="sr-only">
          {citizen.name} - Citizen of Honour from GLUE {citizen.year}
        </DialogTitle>
        <div className="relative w-full h-full flex flex-col">
          <h2 className="absolute top-0 left-0 text-2xl lg:text-3xl tracking-widest px-4 z-20 w-[80%] text-balance">
            {citizen.name}
          </h2>

          <div className="relative flex-grow overflow-hidden">
            <Image
              src={citizen.image_url || "/placeholder.jpg"}
              alt={`${citizen.name}, citizen of honour from the GLUE design routes, year ${citizen.year}`}
              width={1920}
              height={1080}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
              className="absolute inset-0 w-full h-full object-cover"
              quality={85}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-black/70 z-20 overflow-y-auto max-h-[50%] p-4 scrollbar-thin">
            <p
              className="about-description text-base lg:text-lg"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CofHonourModal;
