"use client";

import type React from "react";

import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CombinedUserInfo } from "@/types/combined-user-info";
import DOMPurify from "dompurify";
import {
  Clock,
  Phone,
  CreditCard,
  User,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEventsDays } from "@/app/context/MainContext";
import { useState } from "react";

type Props = {
  selectedUser: CombinedUserInfo;
};

function UserFullViewContent({ selectedUser }: Props) {
  const eventDays = useEventsDays();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "participant"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getDayLabel = (dayId: string) => {
    const day = eventDays.find((day) => day.dayId === dayId);
    return day ? day.label : dayId;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const CollapsibleSection = ({
    id,
    title,
    icon,
    children,
  }: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto hover:bg-gray-50"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
        {isExpanded && (
          <div className="p-4 pt-0 border-t border-gray-100">{children}</div>
        )}
      </div>
    );
  };

  return (
    <CardContent className="p-2">
      <div className="space-y-2">
        {/* Basic Information - Always visible */}
        <CollapsibleSection
          id="basic"
          title="Basic Information"
          icon={<User className="w-4 h-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Plan Type</span>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {selectedUser.plan_type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Moderator</span>
                <Badge
                  variant={selectedUser.is_mod ? "default" : "secondary"}
                  className="text-xs px-2 py-0.5"
                >
                  {selectedUser.is_mod ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Participant Details */}
        {selectedUser.participantDetails && (
          <CollapsibleSection
            id="participant"
            title="Participant Details"
            icon={
              getStatusIcon(selectedUser.participantDetails.status) || (
                <User className="w-4 h-4" />
              )
            }
          >
            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {selectedUser.participantDetails.status}
                </Badge>
                {selectedUser.participantDetails.is_sticky && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-xs px-2 py-0.5"
                  >
                    <Star className="w-3 h-3" /> Sticky
                  </Badge>
                )}
                <Badge
                  variant={
                    selectedUser.participantDetails.is_active
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs px-2 py-0.5"
                >
                  {selectedUser.participantDetails.is_active
                    ? "Active"
                    : "Inactive"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-600">Slug</span>
                  <p className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">
                    /{selectedUser.participantDetails.slug}
                  </p>
                </div>
                {selectedUser.participantDetails.year && (
                  <div>
                    <span className="text-xs text-gray-600">Year</span>
                    <p className="text-xs">
                      {selectedUser.participantDetails.year}
                    </p>
                  </div>
                )}
              </div>
              {selectedUser.participantDetails.short_description && (
                <div>
                  <span className="text-xs text-gray-600">
                    Short Description
                  </span>
                  <p className="text-xs text-gray-700">
                    {selectedUser.participantDetails.short_description}
                  </p>
                </div>
              )}
              {selectedUser.participantDetails.description && (
                <div>
                  <span className="text-xs text-gray-600">Description</span>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        selectedUser.participantDetails.description
                      ),
                    }}
                    className="text-xs text-gray-700 prose prose-xs max-w-none"
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Contact Information */}
        {((selectedUser.phone_numbers &&
          selectedUser.phone_numbers.length > 0) ||
          (selectedUser.social_media &&
            Object.keys(selectedUser.social_media).length > 0) ||
          (selectedUser.visible_websites &&
            selectedUser.visible_websites.length > 0)) && (
          <CollapsibleSection
            id="contact"
            title="Contact Information"
            icon={<Phone className="w-4 h-4" />}
          >
            <div className="space-y-2 text-xs">
              {selectedUser.phone_numbers &&
                selectedUser.phone_numbers.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600">Phone Numbers</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.phone_numbers.map((phone, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="font-mono text-xs px-2 py-0.5"
                        >
                          {phone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {selectedUser.social_media &&
                Object.keys(selectedUser.social_media).length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600">Social Media</span>
                    <div className="space-y-1">
                      {Object.entries(selectedUser.social_media).map(
                        ([platform, link]) => (
                          <div
                            key={platform}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs font-medium capitalize">
                              {platform}
                            </span>
                            <span className="text-xs text-gray-500 font-mono truncate max-w-[100px]">
                              {link as string}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedUser.visible_websites &&
                selectedUser.visible_websites.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600">Websites</span>
                    <div className="space-y-1">
                      {selectedUser.visible_websites.map((website, index) => (
                        <span
                          key={index}
                          className="text-xs text-gray-500 font-mono truncate block max-w-[120px]"
                        >
                          {website}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </CollapsibleSection>
        )}

        {/* Visiting Hours */}
        {selectedUser.visitingHours &&
          Array.isArray(selectedUser.visitingHours) &&
          selectedUser.visitingHours.length > 0 && (
            <CollapsibleSection
              id="hours"
              title="Visiting Hours"
              icon={<Clock className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedUser.visitingHours.map((visitingHour, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <span className="text-xs font-medium mb-1 block">
                      {getDayLabel(visitingHour.day_id)}
                    </span>
                    {Array.isArray(visitingHour.hours) &&
                    visitingHour.hours.length > 0 ? (
                      <div className="space-y-1">
                        {visitingHour.hours.map(
                          (
                            time: { open: string; close: string },
                            timeIndex: number
                          ) => (
                            <span
                              key={timeIndex}
                              className="text-xs font-mono bg-white px-2 py-0.5 rounded block"
                            >
                              {time.open} - {time.close}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">
                        No hours set
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

        {/* Invoice Information */}
        {selectedUser.invoiceData && (
          <CollapsibleSection
            id="invoice"
            title="Invoice Information"
            icon={<CreditCard className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-gray-600">Company</span>
                  <p className="text-xs">
                    {selectedUser.invoiceData.invoice_company_name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Address</span>
                  <p className="text-xs">
                    {selectedUser.invoiceData.invoice_address}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-gray-600">City</span>
                  <p className="text-xs">
                    {selectedUser.invoiceData.invoice_city}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Country</span>
                  <p className="text-xs">
                    {selectedUser.invoiceData.invoice_country}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        )}
      </div>
    </CardContent>
  );
}

export default UserFullViewContent;
