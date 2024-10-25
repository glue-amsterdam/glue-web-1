"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Member } from "@/utils/member-types";
import { fetchMember } from "@/utils/api";

export default function AdminPanel({ members }: { members: Member[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberStatus, setMemberStatus] = useState<
    "pending" | "accepted" | "declined"
  >("pending");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberClick = async (slug: string) => {
    try {
      const member = await fetchMember(slug);
      setSelectedMember(member);
    } catch (error) {
      console.error("Error fetching member:", error);
    }
  };

  const handleStatusChange = (status: "pending" | "accepted" | "declined") => {
    setMemberStatus(status);

    console.log(`Member ${selectedMember?.name} status changed to ${status}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 dashboard-input"
          />
          <ScrollArea className="h-[calc(100vh-200px)]">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="mb-2 cursor-pointer"
                onClick={() => handleMemberClick(member.slug)}
              >
                <CardHeader>
                  <CardTitle>{member.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{member.shortDescription}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>
        <div className="md:col-span-2">
          {selectedMember ? (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={selectedMember.images[0].src}
                      alt={selectedMember.name}
                    />
                    <AvatarFallback>
                      {selectedMember.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedMember.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedMember.shortDescription}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList>
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="hours">Hours</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info">
                    <p>{selectedMember.description}</p>
                    <div className="mt-4 flex items-center">
                      <MapPin className="mr-2" size={16} />
                      <span>{selectedMember.address}</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="contact">
                    <div className="space-y-2">
                      {selectedMember.phoneNumber.map((phone, index) => (
                        <div key={index} className="flex items-center">
                          <Phone className="mr-2" size={16} />
                          <span>{phone}</span>
                        </div>
                      ))}
                      {selectedMember.visibleEmail.map((email, index) => (
                        <div key={index} className="flex items-center">
                          <Mail className="mr-2" size={16} />
                          <span>{email}</span>
                        </div>
                      ))}
                      {selectedMember.visibleWebsite.map((website, index) => (
                        <div key={index} className="flex items-center">
                          <Globe className="mr-2" size={16} />
                          <span>{website}</span>
                        </div>
                      ))}
                      <div className="flex space-x-2 mt-2">
                        {selectedMember.socialMedia.instagram?.map(
                          (instagram, index) => (
                            <Badge key={index} variant="secondary">
                              <Instagram className="mr-1" size={14} />
                              {instagram}
                            </Badge>
                          )
                        )}
                        {selectedMember.socialMedia.facebook?.map(
                          (facebook, index) => (
                            <Badge key={index} variant="secondary">
                              <Facebook className="mr-1" size={14} />
                              {facebook}
                            </Badge>
                          )
                        )}
                        {selectedMember.socialMedia.linkedin?.map(
                          (linkedin, index) => (
                            <Badge key={index} variant="secondary">
                              <Linkedin className="mr-1" size={14} />
                              {linkedin}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="hours">
                    <div className="space-y-2">
                      {Object.entries(selectedMember.visitingHours).map(
                        ([day, hours]) => (
                          <div key={day} className="flex items-center">
                            <Clock className="mr-2" size={16} />
                            <span className="font-medium">{day}:</span>
                            <span className="ml-2">
                              {hours.map((timeRange, index) => (
                                <span key={index}>
                                  {timeRange.open} - {timeRange.close}
                                  {index < hours.length - 1 && ", "}
                                </span>
                              ))}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant={memberStatus === "accepted" ? "default" : "outline"}
                  onClick={() => handleStatusChange("accepted")}
                >
                  Accept
                </Button>
                <Button
                  variant={memberStatus === "pending" ? "default" : "outline"}
                  onClick={() => handleStatusChange("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={
                    memberStatus === "declined" ? "destructive" : "outline"
                  }
                  onClick={() => handleStatusChange("declined")}
                >
                  Decline
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[calc(100vh-200px)]">
                <p className="text-muted-foreground">
                  Select a member to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
