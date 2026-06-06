"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { HubApiCall } from "@/schemas/hubSchemas";
import type { UserInfo } from "@/schemas/userInfoSchemas";
import {
  HubFormFields,
  type HubFormFieldValues,
} from "@/app/dashboard/[userId]/hubs/components/hub-form-fields";
import {
  HubAvailableParticipants,
  HubSelectedParticipants,
} from "@/app/dashboard/[userId]/hubs/components/hub-participants-panel";

type EditHubFormProps = {
  hub: HubApiCall;
  targetUserId: string;
  userInfoList: UserInfo[];
};

export const EditHubForm = ({
  hub,
  targetUserId,
  userInfoList,
}: EditHubFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    hub.participants.map((p) => p.user_id)
  );
  const [hubHost, setHubHost] = useState<string>(hub.hub_host.user_id);
  const [searchTerm, setSearchTerm] = useState("");
  const [formValues, setFormValues] = useState<HubFormFieldValues>({
    name: hub.name,
    description: hub.description ?? "",
    display_number: hub.display_number ?? null,
  });

  const addParticipantToHub = (userInfo: UserInfo) => {
    if (selectedParticipants.includes(userInfo.user_id)) return;
    setSelectedParticipants((prev) => [...prev, userInfo.user_id]);
    setHubHost((current) => current || userInfo.user_id);
  };

  const removeParticipantFromHub = (userId: string) => {
    setSelectedParticipants((prev) => {
      const next = prev.filter((id) => id !== userId);
      setHubHost((currentHost) =>
        currentHost === userId ? next[0] ?? "" : currentHost
      );
      return next;
    });
  };

  const setParticipantAsHost = (userId: string) => {
    setHubHost(userId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.name.trim()) {
      toast({
        title: "Error",
        description: "Hub name is required.",
        variant: "destructive",
      });
      return;
    }

    if (selectedParticipants.length < 2) {
      toast({
        title: "Error",
        description: "At least two participants must be selected for the hub.",
        variant: "destructive",
      });
      return;
    }

    if (!hubHost) {
      toast({
        title: "Error",
        description: "A hub host must be selected.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: HubApiCall = {
        id: hub.id,
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        display_number: formValues.display_number ?? null,
        hub_host: { user_id: hubHost },
        participants: selectedParticipants.map((id) => ({ user_id: id })),
      };

      const response = await fetch("/api/hubs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update hub");
      }

      toast({
        title: "Success",
        description: "Hub updated successfully.",
      });

      router.push(`/dashboard/${targetUserId}/hubs`);
    } catch (error) {
      console.error("Error updating hub:", error);
      toast({
        title: "Error",
        description: "Failed to update hub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-[30px] mini-padding pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Edit Hub</h1>
        <Link
          href={`/dashboard/${targetUserId}/hubs`}
          className="text-sm border border-gray-300 rounded px-3 py-1.5"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <HubFormFields
          values={formValues}
          onChange={setFormValues}
          hubId={hub.id}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 mb-6 lg:items-stretch">
          <HubSelectedParticipants
            userInfoList={userInfoList}
            selectedParticipants={selectedParticipants}
            hubHost={hubHost}
            onRemove={removeParticipantFromHub}
            onSetHost={setParticipantAsHost}
          />
          <HubAvailableParticipants
            userInfoList={userInfoList}
            selectedParticipants={selectedParticipants}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={addParticipantToHub}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="text-sm border border-gray-300 rounded px-4 py-2 bg-black text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};
