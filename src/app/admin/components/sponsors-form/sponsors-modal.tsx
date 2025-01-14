import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sponsor, SponsorType } from "@/schemas/sponsorsSchema";
import SponsorForm from "@/app/admin/forms/about-sponsors-form";
import { DialogDescription } from "@radix-ui/react-dialog";

interface SponsorModalProps {
  sponsor: Sponsor;
  sponsorTypes: SponsorType[];
  onClose: () => void;
  onSponsorUpdated: () => void;
}

export default function SponsorModal({
  sponsor,
  sponsorTypes,
  onClose,
  onSponsorUpdated,
}: SponsorModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleSponsorUpdated = () => {
    onSponsorUpdated();
    handleClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[90%] md:w-[70%] lg:w-[80%] text-black max-h-[90%] overflow-y-scroll overflow-x-hidden">
        <DialogDescription className="sr-only">
          Edit modal for {sponsor.name}
        </DialogDescription>
        <DialogHeader>
          <DialogTitle>Edit: {sponsor.name}</DialogTitle>
        </DialogHeader>
        <SponsorForm
          initialData={sponsor}
          sponsorTypes={sponsorTypes}
          onSponsorUpdated={handleSponsorUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
