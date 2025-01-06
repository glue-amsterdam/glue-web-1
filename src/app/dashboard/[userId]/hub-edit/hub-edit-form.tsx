"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HubApiCall, hubSchemaApiCall } from "@/schemas/hubSchemas";
import { UserInfo } from "@/schemas/userInfoSchemas";
import { UserIcon, XIcon, Crown, Search, Plus } from "lucide-react";

interface EditHubFormProps {
  hub: HubApiCall;
  userInfoList: UserInfo[];
  onSubmit: (data: HubApiCall) => void;
}

export function EditHubForm({ hub, userInfoList, onSubmit }: EditHubFormProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    hub.participants.map((p) => p.user_id)
  );
  const [hubHost, setHubHost] = useState<string>(hub.hub_host.user_id);
  const [participantSearchTerm, setParticipantSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HubApiCall>({
    resolver: zodResolver(hubSchemaApiCall),
    defaultValues: hub,
  });

  console.log(errors);

  const filteredUserInfoList = userInfoList.filter((userInfo) => {
    if (userInfo.plan_type !== "participant") return false;
    const searchLower = participantSearchTerm.toLowerCase();
    return (
      userInfo.user_name?.toLowerCase().includes(searchLower) ||
      userInfo.visible_emails?.some((email) =>
        email.toLowerCase().includes(searchLower)
      ) ||
      userInfo.user_id.toLowerCase().includes(searchLower)
    );
  });

  const addParticipantToHub = (userInfo: UserInfo) => {
    if (!selectedParticipants.includes(userInfo.user_id)) {
      setSelectedParticipants((prev) => [...prev, userInfo.user_id]);
      if (!hubHost) {
        setHubHost(userInfo.user_id);
      }
    }
  };

  const removeParticipantFromHub = (userId: string) => {
    setSelectedParticipants((prev) => prev.filter((id) => id !== userId));
    if (hubHost === userId) {
      setHubHost(selectedParticipants[0] || "");
    }
  };

  const setParticipantAsHost = (userId: string) => {
    setHubHost(userId);
  };

  const onSubmitHandler = (data: HubApiCall) => {
    onSubmit({
      ...data,
      hub_host: { user_id: hubHost },
      participants: selectedParticipants.map((id) => ({ user_id: id })),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="space-y-6 flex-grow overflow-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        <div className="space-y-6">
          <div>
            <Input {...register("name")} placeholder="Hub Name" />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Textarea
              {...register("description")}
              placeholder="Hub Description"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Selected Participants</CardTitle>
              <CardDescription>
                Remove participants or set hub host
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {selectedParticipants.map((userId) => {
                    const participant = userInfoList.find(
                      (u) => u.user_id === userId
                    );
                    if (!participant) return null;
                    return (
                      <Card key={userId} className="bg-muted">
                        <CardContent className="flex justify-between items-center p-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              <UserIcon className="w-3 h-3 mr-1" />
                              Participant
                            </Badge>
                            <span className="text-sm">
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
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setParticipantAsHost(userId)}
                              className="h-8 px-2"
                              disabled={hubHost === userId}
                            >
                              Set as Host
                            </Button>
                            <Button
                              type="button"
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
        <Card>
          <CardHeader>
            <CardTitle>Available Participants</CardTitle>
            <CardDescription>
              Search and add participants to your hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search participants..."
                value={participantSearchTerm}
                onChange={(e) => setParticipantSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredUserInfoList.map((userInfo) => (
                  <Card key={userInfo.id} className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {userInfo.user_name ||
                          userInfo.visible_emails?.[0] ||
                          "Anonymous"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {userInfo.user_id}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
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
      <Button type="submit" className="w-full">
        Update Hub
      </Button>
    </form>
  );
}
