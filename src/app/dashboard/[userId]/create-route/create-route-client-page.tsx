"use client";

import { useState, useMemo } from "react";
import { RouteValues, MapInfoAPICall, RouteStep } from "@/schemas/mapSchema";
import { useToast } from "@/hooks/use-toast";
import { RouteForm } from "@/app/dashboard/components/route-form";
import { RouteIcon, MapPin, Search, XIcon, Plus } from "lucide-react";
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

interface CreateRouteClientPageProps {
  mapInfoList: MapInfoAPICall[] | undefined;
}

export default function CreateRouteClientPage({
  mapInfoList,
}: CreateRouteClientPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDots, setSelectedDots] = useState<RouteStep[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredMapInfoList = useMemo(() => {
    if (!mapInfoList) return [];
    return mapInfoList.filter((mapInfo) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        mapInfo.formatted_address?.toLowerCase().includes(searchLower) ||
        mapInfo.user_info.user_name?.toLowerCase().includes(searchLower) ||
        mapInfo.user_info.visible_emails?.some((email) =>
          email.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [mapInfoList, searchTerm]);

  const addDotToRoute = (mapInfo: MapInfoAPICall) => {
    setSelectedDots((prev) => [
      ...prev,
      { ...mapInfo, route_step: prev.length + 1 },
    ]);
  };

  const removeDotFromRoute = (index: number) => {
    setSelectedDots((prev) => {
      const newDots = prev.filter((_, i) => i !== index);
      return newDots.map((dot, i) => ({ ...dot, route_step: i + 1 }));
    });
  };

  const onSubmit = createSubmitHandler<RouteValues>(
    `/api/maps/routes`,
    async () => {
      toast({
        title: "Success",
        description: "Route created successfully.",
      });
      await mutate(`/api/maps/routes`);
      setSelectedDots([]);
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to create route. Please try again. " + error,
        variant: "destructive",
      });
    },
    "POST"
  );

  const handleSubmit = async (values: RouteValues) => {
    setIsSubmitting(true);
    if (values.dots.length < 2) {
      toast({
        title: "Error",
        description: "At least two locations must be selected for the route.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    await onSubmit(values);
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <RouteIcon className="h-8 w-8" />
          Create New Route
        </h1>
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Route</CardTitle>
              <CardDescription>
                Fill in the details and select locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RouteForm
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                submitButtonText="Create Route"
                defaultValues={{ zone: "NORTH", dots: selectedDots }}
                selectedDots={selectedDots}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Selected Locations</CardTitle>
              <CardDescription>
                Drag to reorder or remove locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4 scrollbar-thin scrollbar-thumb-glueBlue scrollbar-track-blue-500">
                <div className="space-y-2">
                  {selectedDots.map((dot, index) => (
                    <Card key={index} className="bg-muted">
                      <CardContent className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            Step {dot.route_step}
                          </Badge>
                          <span className="text-sm">
                            {dot.formatted_address || "No Address"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDotFromRoute(index)}
                          className="h-8 w-8 p-0"
                        >
                          <XIcon className="h-4 w-4" />
                          <span className="sr-only">Remove location</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-1 order-first mb:order-last">
          <CardHeader>
            <CardTitle>Available Locations</CardTitle>
            <CardDescription>
              Search and add locations to your route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search locations / participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredMapInfoList.map((mapInfo) => (
                  <Card key={mapInfo.id} className="bg-muted">
                    <CardHeader className="pb-2">
                      <p className=" text-muted-foreground">
                        {mapInfo.user_info.user_name ||
                          mapInfo.user_info.visible_emails?.join(", ") ||
                          "No visible data provided yet"}
                      </p>
                      <CardTitle className="">
                        {mapInfo.formatted_address || "No Address"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => addDotToRoute(mapInfo)}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add to Route
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
