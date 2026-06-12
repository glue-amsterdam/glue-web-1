"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import type { AdminUserDetail } from "@/types/admin-user";
import { PlatformModToggle } from "@/app/dashboard/[userId]/users-admin/platform-mod-toggle";
import { useEventsDays } from "@/context/MainContext";
import { useSanitizedHTML } from "@/hooks/useSanitizedHTML";

type Props = {
  detail: AdminUserDetail;
  onModStatusChange?: (isMod: boolean) => void;
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className="grid grid-cols-[120px_1fr] gap-2 py-1 text-sm border-b border-gray-100 last:border-0">
    <dt className="text-gray-500">{label}</dt>
    <dd className="text-gray-900 break-all">{value}</dd>
  </div>
);

const formatCreatedAt = (createdAt: string | null): string => {
  if (!createdAt) return "—";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "dd MMM yyyy, HH:mm");
};

const ParticipantDescription = ({ html }: { html: string }) => {
  const sanitized = useSanitizedHTML(html);
  return (
    <div
      className="text-sm prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default function UserDetailAccordion({
  detail,
  onModStatusChange,
}: Props) {
  const eventDays = useEventsDays();
  const participant = detail.participantDetails;

  const getDayLabel = (dayId: string) => {
    const day = eventDays.find((d) => d.dayId === dayId);
    return day ? day.label : dayId;
  };

  return (
    <div className="px-3 pb-3 pt-1 bg-gray-50 border-t border-gray-200">
      <dl className="space-y-0">
        <DetailRow label="User ID" value={detail.userId} />
        <DetailRow label="Type" value={detail.entityType} />
        <PlatformModToggle
          targetUserId={detail.userId}
          isMod
          onModStatusChange={onModStatusChange}
        />
        {detail.email && <DetailRow label="Email" value={detail.email} />}
        <DetailRow label="Created" value={formatCreatedAt(detail.createdAt)} />

        {participant && (
          <>
            <DetailRow label="Status" value={participant.status ?? "—"} />
            <DetailRow
              label="Active"
              value={participant.is_active ? "Yes" : "No"}
            />
            <DetailRow label="Slug" value={`/${participant.slug}`} />
            {participant.short_description && (
              <DetailRow
                label="Short desc."
                value={participant.short_description}
              />
            )}
            {participant.description && (
              <div className="py-2 border-b border-gray-100">
                <dt className="text-sm text-gray-500 mb-1">Description</dt>
                <dd>
                  <ParticipantDescription html={participant.description} />
                </dd>
              </div>
            )}
            {participant.reactivation_requested && (
              <DetailRow
                label="Reactivation"
                value={participant.reactivation_status ?? "requested"}
              />
            )}
            {participant.phone_numbers &&
              participant.phone_numbers.length > 0 && (
                <DetailRow
                  label="Phones"
                  value={participant.phone_numbers.join(", ")}
                />
              )}
            {participant.visible_emails &&
              participant.visible_emails.length > 0 && (
                <DetailRow
                  label="Emails"
                  value={participant.visible_emails.join(", ")}
                />
              )}
          </>
        )}

        {detail.visitorData && (
          <>
            <DetailRow
              label="First name"
              value={detail.visitorData.first_name ?? "—"}
            />
            <DetailRow
              label="Last name"
              value={detail.visitorData.last_name ?? "—"}
            />
            <DetailRow
              label="Age range"
              value={detail.visitorData.birth_date ?? "—"}
            />
          </>
        )}

        {detail.invoiceData && (
          <>
            <DetailRow
              label="Company"
              value={detail.invoiceData.invoice_company_name}
            />
            <DetailRow
              label="Address"
              value={`${detail.invoiceData.invoice_address}, ${detail.invoiceData.invoice_city}, ${detail.invoiceData.invoice_country}`}
            />
          </>
        )}

        {detail.visitingHours && detail.visitingHours.length > 0 && (
          <div className="py-2">
            <dt className="text-sm text-gray-500 mb-1">Visiting hours</dt>
            <dd className="space-y-1 text-sm">
              {detail.visitingHours.map((vh, i) => (
                <div key={i}>
                  <span className="font-medium">{getDayLabel(vh.day_id)}:</span>{" "}
                  {vh.hours.length > 0
                    ? vh.hours
                      .map((h) => `${h.open}–${h.close}`)
                      .join(", ")
                    : "—"}
                </div>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
