"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ParticipateApplicationStatusAdminData } from "@/lib/participate/types";

export default function ApplicationStatusManager() {
  const [status, setStatus] = useState<ParticipateApplicationStatusAdminData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/plans/status");
      if (!response.ok) {
        throw new Error("Failed to load application status");
      }

      const data = (await response.json()) as ParticipateApplicationStatusAdminData;
      setStatus(data);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to load application status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const saveStatus = async (
    nextStatus: ParticipateApplicationStatusAdminData
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/plans/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextStatus),
      });

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      const data = (await response.json()) as ParticipateApplicationStatusAdminData;
      setStatus(data);

      toast({
        title: "Status Updated",
        description: `Applications ${data.application_closed ? "closed" : "opened"
          } successfully`,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleApplicationStatus = async (checked: boolean) => {
    if (!status) return;

    await saveStatus({
      ...status,
      application_closed: checked,
    });
  };

  const handleMessageChange = async () => {
    if (!status) return;
    await saveStatus(status);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Failed to load status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Application Status Management</CardTitle>

      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="application-status" className="text-base">
              Application Status
            </Label>
            <div className="text-sm text-muted-foreground">
              {status.application_closed
                ? "Applications are currently closed"
                : "Applications are currently open"}
            </div>
          </div>
          <Switch
            id="application-status"
            checked={status.application_closed}
            onCheckedChange={handleToggleApplicationStatus}
            disabled={isSaving}
            className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500"
          />
        </div>

        {status.application_closed && (
          <div className="space-y-2">
            <Label htmlFor="closed-message">Closed Application Message</Label>
            <Textarea
              id="closed-message"
              value={status.closed_message}
              onChange={(e) =>
                setStatus({ ...status, closed_message: e.target.value })
              }
              placeholder="Enter the message to show when applications are closed..."
              className="min-h-[100px]"
              disabled={isSaving}
            />
            <Button
              onClick={handleMessageChange}
              disabled={isSaving}
              size="sm"
              className="w-fit"
            >
              {isSaving ? "Saving..." : "Save Message"}
            </Button>
            <div className="text-xs text-muted-foreground">
              This message is shown on the participate page when applications
              are closed.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
