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
  ExternalLink,
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
    <CardContent className="p-6">
      <div className="space-y-4">
        {/* Basic Information - Always visible */}
        <CollapsibleSection
          id="basic"
          title="Basic Information"
          icon={<User className="w-4 h-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Plan Type
                </span>
                <Badge variant="outline">{selectedUser.plan_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Moderator
                </span>
                <Badge variant={selectedUser.is_mod ? "default" : "secondary"}>
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
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  {selectedUser.participantDetails.status}
                </Badge>
                {selectedUser.participantDetails.is_sticky && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    Sticky
                  </Badge>
                )}
                <Badge
                  variant={
                    selectedUser.participantDetails.is_active
                      ? "default"
                      : "destructive"
                  }
                >
                  {selectedUser.participantDetails.is_active
                    ? "Active"
                    : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">
                    Slug
                  </h4>
                  <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                    /{selectedUser.participantDetails.slug}
                  </p>
                </div>
                {selectedUser.participantDetails.year && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">
                      Year
                    </h4>
                    <p className="text-sm">
                      {selectedUser.participantDetails.year}
                    </p>
                  </div>
                )}
              </div>

              {selectedUser.participantDetails.short_description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">
                    Short Description
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedUser.participantDetails.short_description}
                  </p>
                </div>
              )}

              {selectedUser.participantDetails.description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">
                    Description
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        selectedUser.participantDetails.description
                      ),
                    }}
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
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
            <div className="space-y-4">
              {selectedUser.phone_numbers &&
                selectedUser.phone_numbers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">
                      Phone Numbers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.phone_numbers.map((phone, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="font-mono"
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
                    <h4 className="font-medium text-sm text-gray-600 mb-2">
                      Social Media
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedUser.social_media).map(
                        ([platform, link]) => (
                          <div
                            key={platform}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium capitalize">
                              {platform}
                            </span>
                            <a
                              href={link as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {selectedUser.visible_websites &&
                selectedUser.visible_websites.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">
                      Websites
                    </h4>
                    <div className="space-y-2">
                      {selectedUser.visible_websites.map((website, index) => (
                        <a
                          key={index}
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {website} <ExternalLink className="w-3 h-3" />
                        </a>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedUser.visitingHours.map((visitingHour, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      {getDayLabel(visitingHour.day_id)}
                    </h4>
                    {Array.isArray(visitingHour.hours) &&
                    visitingHour.hours.length > 0 ? (
                      <div className="space-y-1">
                        {visitingHour.hours.map(
                          (
                            time: { open: string; close: string },
                            timeIndex: number
                          ) => (
                            <p
                              key={timeIndex}
                              className="text-xs font-mono bg-white px-2 py-1 rounded"
                            >
                              {time.open} - {time.close}
                            </p>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No hours set</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">
                    Company
                  </h4>
                  <p className="text-sm">
                    {selectedUser.invoiceData.invoice_company_name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">
                    Address
                  </h4>
                  <p className="text-sm">
                    {selectedUser.invoiceData.invoice_address}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">
                    City
                  </h4>
                  <p className="text-sm">
                    {selectedUser.invoiceData.invoice_city}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-1">
                    Country
                  </h4>
                  <p className="text-sm">
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
