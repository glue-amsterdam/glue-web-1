"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";

type PlatformModToggleProps = {
  targetUserId: string;
  isMod: boolean;
};

export const PlatformModToggle = ({
  targetUserId,
  isMod,
}: PlatformModToggleProps) => {
  const { user } = useAuth();
  const loggedInUserId = user?.id;
  const { toast } = useToast();
  const [isPlatformMod, setIsPlatformMod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isSelfView =
    Boolean(loggedInUserId) && loggedInUserId === targetUserId;

  const showModToggle = isMod && Boolean(targetUserId);

  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/users/permissions?targetUserId=${encodeURIComponent(targetUserId)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to load moderator status");
      }
      setIsPlatformMod(data.is_mod === true);
    } catch (error) {
      toast({
        title: "Could not load permissions",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, toast]);

  useEffect(() => {
    if (!showModToggle) return;
    void loadPermissions();
  }, [showModToggle, loadPermissions]);

  const handleToggle = async (checked: boolean) => {
    if (checked && isSelfView) {
      toast({
        title: "Cannot grant moderator to yourself",
        description:
          "Another moderator must grant platform access. You can turn off your own access below.",
        variant: "destructive",
      });
      return;
    }

    if (checked) {
      const confirmed = window.confirm(
        "Grant platform moderator privileges to this user? They will be able to access other users' dashboards."
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        "Revoke platform moderator privileges from this user?"
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/users/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, is_mod: checked }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update moderator status");
      }
      setIsPlatformMod(checked);
      toast({
        title: checked ? "Moderator granted" : "Moderator revoked",
        description: "Platform permissions were updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!showModToggle) {
    return null;
  }

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Platform moderator</h3>
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Moderator access</FormLabel>
            <FormDescription>
              {isSelfView
                ? "Your platform moderator status. You cannot grant yourself access here; you can revoke your own access. Another moderator can restore it."
                : "Controls dashboard-wide moderator privileges for this account (stored in user permissions, not user profile)."}
            </FormDescription>
          </div>
          <Switch
            checked={isPlatformMod}
            disabled={isLoading || isSaving}
            onCheckedChange={handleToggle}
            aria-label="Toggle platform moderator access"
          />
        </FormItem>
      </div>
    </>
  );
};
