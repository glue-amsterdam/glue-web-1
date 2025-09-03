"use client";

import { useState, useEffect, useCallback } from "react";
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
import { createClient } from "@/utils/supabase/client";

interface ApplicationStatus {
  id: string;
  application_closed: boolean;
  closed_message: string;
}

export default function ApplicationStatusManager() {
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("plans_status")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching status:", error);
        toast({
          title: "Error",
          description: "Failed to load application status",
          variant: "destructive",
        });
        return;
      }

      setStatus(data);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleToggleApplicationStatus = async (checked: boolean) => {
    if (!status) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("plans_status")
        .update({
          application_closed: checked,
          updated_at: new Date().toISOString(),
        })
        .eq("id", status.id);

      if (error) {
        console.error("Error updating status:", error);
        toast({
          title: "Error",
          description: "Failed to update application status",
          variant: "destructive",
        });
        return;
      }

      setStatus({ ...status, application_closed: checked });
      toast({
        title: "Status Updated",
        description: `Applications ${
          checked ? "closed" : "opened"
        } successfully`,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMessageChange = async () => {
    if (!status) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("plans_status")
        .update({
          closed_message: status.closed_message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", status.id);

      if (error) {
        console.error("Error updating message:", error);
        toast({
          title: "Error",
          description: "Failed to update closed message",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message Updated",
        description: "Closed application message updated successfully",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
        <CardDescription>
          Control whether applications are open or closed for new participants
        </CardDescription>
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
              This message will be displayed to users when they try to sign up
              while applications are closed.
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <strong>Note:</strong> When applications are closed, only free and
          member plans will be visible to users. Participant plans will be
          hidden and the closed message will be displayed instead.
        </div>
      </CardContent>
    </Card>
  );
}
