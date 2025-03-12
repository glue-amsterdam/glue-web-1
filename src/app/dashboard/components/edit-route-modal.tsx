"use client";

import { useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { ZoneEnum, type MapInfoAPICall } from "@/schemas/mapSchema";
import type { IndividualRoute, RouteDot } from "@/schemas/routeSchema";
import { RouteIcon, MapPin, Search, Trash2, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mutate } from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: IndividualRoute;
  mapInfoList: MapInfoAPICall[];
}

interface FormValues {
  name: string;
  description: string;
  zone: string;
  route_dots: RouteDot[];
  searchTerm: string;
}

export function EditRouteModal({
  isOpen,
  onClose,
  route,
  mapInfoList,
}: EditRouteModalProps) {
  const { toast } = useToast();
  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>(
    {
      defaultValues: {
        name: route.name,
        description: route.description,
        zone: route.zone,
        route_dots: route.route_dots.map((dot) => ({
          ...dot,
          map_info_id: dot.map_info_id || dot.map_info?.id || "",
        })),
        searchTerm: "",
      },
    }
  );

  const searchTerm = watch("searchTerm");
  const selectedDots = watch("route_dots");

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
    const newDot: RouteDot = {
      map_info_id: mapInfo.id,
      route_id: route.id,
      user_id: mapInfo.user_id,
      hub_id: null,
      route_step: selectedDots.length + 1,
      map_info: {
        id: mapInfo.id,
        formatted_address: mapInfo.formatted_address || "",
      },
      route_dot_name: mapInfo.user_info.user_name,
    };
    setValue("route_dots", [...selectedDots, newDot]);
  };

  const removeDotFromRoute = (index: number) => {
    const newDots = selectedDots.filter((_, i) => i !== index);
    setValue(
      "route_dots",
      newDots.map((dot, i) => ({ ...dot, route_step: i + 1 }))
    );
  };

  const onSubmit = async (data: FormValues) => {
    if (data.route_dots.length < 2) {
      toast({
        title: "Error",
        description: "At least two locations must be selected for the route.",
        variant: "destructive",
      });
      return;
    }

    // Ensure all route dots have a valid map_info_id
    const validRouteDots = data.route_dots.filter((dot) => dot.map_info_id);
    if (validRouteDots.length !== data.route_dots.length) {
      toast({
        title: "Error",
        description:
          "Some route dots are missing map information. Please remove and re-add them.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/maps/routes/${route.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          zone: data.zone,
          route_dots: validRouteDots.map((dot, index) => ({
            map_info_id: dot.map_info_id,
            user_id: dot.user_id,
            hub_id: dot.hub_id,
            route_step: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update route");
      }

      await mutate(`/api/maps/routes`);
      await mutate(`/api/maps/routes/${route.id}`);
      toast({
        title: "Success",
        description: "Route updated successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update route. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    reset({
      name: route.name,
      description: route.description,
      zone: route.zone,
      route_dots: route.route_dots.map((dot) => ({
        ...dot,
        map_info_id: dot.map_info_id || dot.map_info?.id || "",
      })),
      searchTerm: "",
    });
  }, [route, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl text-black max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RouteIcon className="h-6 w-6" />
            Edit Route
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Route Details</CardTitle>
                  <CardDescription>
                    Modify the route information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: "Name is required" }}
                      render={({ field }) => <Input id="name" {...field} />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <Textarea id="description" {...field} />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone</Label>
                    <Controller
                      name="zone"
                      control={control}
                      rules={{ required: "Zone is required" }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ZoneEnum.enum).map((zone) => (
                              <SelectItem key={zone} value={zone}>
                                {zone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
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
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {selectedDots.map((dot, index) => (
                        <Card key={index} className="bg-muted">
                          <CardContent className="flex justify-between items-center p-3">
                            <div className="flex flex-col gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                Step {dot.route_step}
                              </Badge>
                              <span className="text-sm font-medium">
                                {dot.route_dot_name}
                              </span>
                              <span className="text-xs italic">
                                {dot.map_info?.formatted_address}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => removeDotFromRoute(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
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
            <Card className="col-span-1 max-h-[70vh] overflow-y-scroll">
              <CardHeader>
                <CardTitle>Available Locations</CardTitle>
                <CardDescription>
                  Search and add locations to your route
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="relative mb-4">
                  <Controller
                    name="searchTerm"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        placeholder="Search locations / participants..."
                        {...field}
                        className="pr-10"
                      />
                    )}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <ScrollArea className="pr-4">
                  <div className="space-y-4">
                    {filteredMapInfoList.map((mapInfo) => (
                      <Card key={mapInfo.id} className="bg-muted">
                        <CardHeader className="pb-2">
                          <p className="text-muted-foreground">
                            {mapInfo.user_info.user_name ||
                              "No visible data provided yet"}
                          </p>
                          <CardTitle className="text-sm">
                            {mapInfo.formatted_address || "No Address"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => addDotToRoute(mapInfo)}
                            size="sm"
                            className="w-full"
                            type="button"
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
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              className="text-black"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">Update Route</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
