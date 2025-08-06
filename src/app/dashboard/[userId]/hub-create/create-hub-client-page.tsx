"use client";

import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { HomeIcon, UserIcon, Search, XIcon, Plus, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { createSubmitHandler } from "@/utils/form-helpers";
import { mutate } from "swr";
import type { UserInfo } from "@/schemas/userInfoSchemas";
import type { HubValues } from "@/schemas/hubSchemas";
import { HubForm } from "@/app/dashboard/components/hub-form";

interface CreateHubClientPageProps {
  userInfoList: UserInfo[] | undefined;
}

export default function CreateHubClientPage({
  userInfoList,
}: CreateHubClientPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [hubHost, setHubHost] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredUserInfoList = useMemo(() => {
    if (!userInfoList) return [];
    return userInfoList.filter((userInfo) => {
      if (userInfo.plan_type !== "participant") return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        userInfo.user_name?.toLowerCase().includes(searchLower) ||
        userInfo.visible_emails?.some((email) =>
          email.toLowerCase().includes(searchLower)
        ) ||
        userInfo.user_id.toLowerCase().includes(searchLower)
      );
    });
  }, [userInfoList, searchTerm]);

  const addParticipantToHub = (userInfo: UserInfo) => {
    setSelectedParticipants((prev) => [...prev, userInfo.user_id]);
    if (!hubHost) {
      setHubHost(userInfo.user_id);
    }
  };

  const removeParticipantFromHub = (userId: string) => {
    setSelectedParticipants((prev) => prev.filter((id) => id !== userId));
    if (hubHost === userId) {
      setHubHost(selectedParticipants[0] || null);
    }
  };

  const setParticipantAsHost = (userId: string) => {
    setHubHost(userId);
  };

  const onSubmit = createSubmitHandler<HubValues>(
    `/api/hubs`,
    async (data) => {
      console.log(data);
      toast({
        title: "Success",
        description: "Hub created successfully.",
      });
      await mutate(`/api/hubs`);
      setSelectedParticipants([]);
      setHubHost(null);
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to create hub. Please try again. " + error,
        variant: "destructive",
      });
    },
    "POST"
  );

  const handleSubmit = async (values: HubValues) => {
    setIsSubmitting(true);
    if (selectedParticipants.length < 2) {
      toast({
        title: "Error",
        description: "At least two participants must be selected for the hub.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (!hubHost) {
      toast({
        title: "Error",
        description: "A hub host must be selected.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    const hubValues: HubValues = {
      ...values,
      participants: selectedParticipants.map((id) => ({ user_id: id })),
      hub_host: { user_id: hubHost },
    };
    await onSubmit(hubValues);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-[80%] mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HomeIcon className="h-8 w-8" />
          Create New Hub
        </h1>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="col-span-1 space-y-6 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Hub</CardTitle>
              <CardDescription>
                Fill in the details and select participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HubForm
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                submitButtonText="Create Hub"
                selectedParticipants={selectedParticipants}
                hubHost={hubHost}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Selected Participants</CardTitle>
              <CardDescription>
                Remove participants or set hub host
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="pr-4 scrollbar-thin scrollbar-thumb-glueBlue scrollbar-track-blue-500">
                <div className="space-y-2">
                  {selectedParticipants.map((userId) => {
                    const participant = userInfoList?.find(
                      (u) => u.user_id === userId
                    );
                    if (!participant) return null;
                    return (
                      <Card key={userId} className="bg-muted">
                        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <UserIcon className="w-3 h-3 mr-1" />
                              Participant
                            </Badge>
                            <span className="text-sm truncate max-w-[150px] sm:max-w-[200px]">
                              {participant.user_name ||
                                participant.visible_emails?.[0] ||
                                participant.user_id}
                            </span>
                            {hubHost === userId && (
                              <Badge variant="default" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Host
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setParticipantAsHost(userId)}
                              className="h-8 px-2"
                              disabled={hubHost === userId}
                            >
                              Set as Host
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipantFromHub(userId)}
                              className="h-8 w-8 p-0"
                            >
                              <XIcon className="h-4 w-4" />
                              <span className="sr-only">
                                Remove participant
                              </span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-1 order-1 lg:order-2 h-[500px] lg:h-[90vh] overflow-y-hidden">
          <CardHeader>
            <CardTitle>Available Participants</CardTitle>
            <CardDescription>
              Search and add participants to your hub
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto h-[calc(100%-80px)]">
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <ScrollArea className="pr-4">
              <div className="space-y-4">
                {filteredUserInfoList.map((userInfo) => (
                  <Card key={userInfo.id} className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="">
                        {userInfo.user_name ||
                          userInfo.visible_emails?.[0] ||
                          "Anonymous"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {userInfo.user_id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => addParticipantToHub(userInfo)}
                        size="sm"
                        className="w-full"
                        disabled={selectedParticipants.includes(
                          userInfo.user_id
                        )}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add to Hub
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
