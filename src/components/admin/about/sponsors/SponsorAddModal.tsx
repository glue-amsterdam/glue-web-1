import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SponsorType } from "@/schemas/sponsorsSchema";
import { DialogDescription } from "@radix-ui/react-dialog";
import SponsorForm from "./SponsorForm";

type SponsorAddModalProps = {
  sponsorTypes: SponsorType[];
  defaultTypeId?: string;
  onClose: () => void;
  onSponsorAdded: () => void;
};

export default function SponsorAddModal({
  sponsorTypes,
  defaultTypeId,
  onClose,
  onSponsorAdded,
}: SponsorAddModalProps) {
  const handleSponsorAdded = () => {
    onSponsorAdded();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90%] w-[90%] overflow-y-scroll overflow-x-hidden text-black md:w-[70%] lg:w-[80%]">
        <DialogDescription className="sr-only">
          Add a new partner sponsor
        </DialogDescription>
        <DialogHeader>
          <DialogTitle>Add partner</DialogTitle>
        </DialogHeader>
        <SponsorForm
          sponsorTypes={sponsorTypes}
          defaultTypeId={defaultTypeId}
          variant="plain"
          onSponsorAdded={handleSponsorAdded}
        />
      </DialogContent>
    </Dialog>
  );
}
