"use client";

import Image from "next/image";
import { Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sponsor, SponsorType } from "@/schemas/sponsorsSchema";
import {
  groupSponsorsByType,
  isOrphanSponsorType,
  resolveSponsorTypeLabel,
} from "@/lib/about/sponsor-type-utils";
import { DeleteSponsorButton } from "./DeleteSponsorButton";

type SponsorsGroupedListProps = {
  sponsors: Sponsor[];
  sponsorTypes: SponsorType[];
  onEditSponsor: (sponsor: Sponsor) => void;
  onSponsorDeleted: () => void;
  onAddSponsor: (typeId?: string) => void;
};

const SponsorRow = ({
  sponsor,
  sponsorTypes,
  onEditSponsor,
  onSponsorDeleted,
}: {
  sponsor: Sponsor;
  sponsorTypes: SponsorType[];
  onEditSponsor: (sponsor: Sponsor) => void;
  onSponsorDeleted: () => void;
}) => {
  const isOrphan = isOrphanSponsorType(sponsor.sponsor_type, sponsorTypes);
  const typeLabel = resolveSponsorTypeLabel(sponsor.sponsor_type, sponsorTypes);

  return (
    <TableRow key={sponsor.id}>
      <TableCell>
        <div className="flex h-10 w-24 items-center justify-center rounded border bg-gray-50 p-1">
          {sponsor.image_url ? (
            <Image
              src={sponsor.image_url}
              alt={`${sponsor.name} logo`}
              width={96}
              height={40}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No logo</span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{sponsor.name}</TableCell>
      <TableCell>
        <span className={isOrphan ? "text-amber-700" : undefined}>
          {typeLabel}
          {isOrphan ? " (unassigned)" : ""}
        </span>
      </TableCell>
      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
        {sponsor.website}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditSponsor(sponsor)}
            aria-label={`Edit ${sponsor.name}`}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DeleteSponsorButton
            sponsorId={sponsor.id!}
            sponsorName={sponsor.name}
            onSponsorDeleted={onSponsorDeleted}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export const SponsorsGroupedList = ({
  sponsors,
  sponsorTypes,
  onEditSponsor,
  onSponsorDeleted,
  onAddSponsor,
}: SponsorsGroupedListProps) => {
  const { groups, orphans } = groupSponsorsByType(sponsors, sponsorTypes);

  if (sponsors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No partners added yet.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => onAddSponsor()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add first partner
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {sponsors.length} partner{sponsors.length === 1 ? "" : "s"} across{" "}
          {sponsorTypes.length} group{sponsorTypes.length === 1 ? "" : "s"}
        </p>
        <Button type="button" size="sm" onClick={() => onAddSponsor()}>
          <Plus className="mr-2 h-4 w-4" />
          Add partner
        </Button>
      </div>

      {groups.map(({ type, sponsors: groupSponsors }) => (
        <section
          key={type.id}
          className="overflow-hidden rounded-lg border"
          aria-labelledby={`sponsor-group-${type.id}`}
        >
          <div className="flex items-center justify-between gap-4 border-b bg-gray-50 px-4 py-3">
            <div>
              <h4
                id={`sponsor-group-${type.id}`}
                className="font-medium text-gray-900"
              >
                {type.label}
              </h4>
              <p className="text-xs text-muted-foreground">
                {groupSponsors.length} partner
                {groupSponsors.length === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddSponsor(type.id)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to group
            </Button>
          </div>

          {groupSponsors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupSponsors.map((sponsor) => (
                  <SponsorRow
                    key={sponsor.id}
                    sponsor={sponsor}
                    sponsorTypes={sponsorTypes}
                    onEditSponsor={onEditSponsor}
                    onSponsorDeleted={onSponsorDeleted}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No partners in this group yet.
            </p>
          )}
        </section>
      ))}

      {orphans.length > 0 && (
        <section
          className="overflow-hidden rounded-lg border border-amber-300"
          aria-labelledby="sponsor-group-orphans"
        >
          <div className="border-b border-amber-300 bg-amber-50 px-4 py-3">
            <h4 id="sponsor-group-orphans" className="font-medium text-amber-900">
              Unassigned partners
            </h4>
            <p className="text-xs text-amber-800">
              These partners use a group id or label that no longer exists. Edit
              each one to assign a current group.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Stored value</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orphans.map((sponsor) => (
                <SponsorRow
                  key={sponsor.id}
                  sponsor={sponsor}
                  sponsorTypes={sponsorTypes}
                  onEditSponsor={onEditSponsor}
                  onSponsorDeleted={onSponsorDeleted}
                />
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
};
