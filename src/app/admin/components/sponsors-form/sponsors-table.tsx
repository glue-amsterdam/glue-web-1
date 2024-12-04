import { DeleteSponsorButton } from "@/app/admin/components/sponsors-form/delete-sponsor-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sponsor } from "@/schemas/sponsorsSchema";

interface SponsorsTableProps {
  sponsors: Sponsor[];
  mutate: () => void;
}

export function SponsorsTable({ sponsors, mutate }: SponsorsTableProps) {
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
              <DeleteSponsorButton
                sponsorId={sponsor.id!}
                sponsorName={sponsor.name}
                onSponsorDeleted={mutate}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
