import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sponsor } from "@/schemas/sponsorsSchema";
import { Edit } from "lucide-react";
import { DeleteSponsorButton } from "./DeleteSponsorButton";

interface SponsorsTableProps {
  sponsors: Sponsor[];
  mutate: () => void;
  onEditSponsor: (sponsor: Sponsor) => void;
}

export function SponsorTable({
  sponsors,
  mutate,
  onEditSponsor,
}: SponsorsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Website</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sponsors.map((sponsor) => (
          <TableRow key={sponsor.id}>
            <TableCell>{sponsor.name}</TableCell>
            <TableCell>{sponsor.sponsor_type}</TableCell>
            <TableCell>{sponsor.website}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditSponsor(sponsor)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <DeleteSponsorButton
                  sponsorId={sponsor.id!}
                  sponsorName={sponsor.name}
                  onSponsorDeleted={mutate}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
