"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Plus, MapPin, Search, XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  MapInfoAPICall,
  RouteApiCall,
  routeApiCallSchema,
} from "@/schemas/mapSchema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EditRouteModalProps {
  routeId: string;
  locations: MapInfoAPICall[];
  onClose: () => void;
  onSave: () => void;
}

export function EditRouteModal({
  routeId,
  locations,
  onClose,
  onSave,
}: EditRouteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localRouteDots, setLocalRouteDots] = useState<
    RouteApiCall["route_dots"]
  >([]);
  const { data: route, error } = useSWR<RouteApiCall>(
    routeId !== "new" ? `/api/maps/routes/${routeId}` : null,
    fetcher
  );
  const { toast } = useToast();

  const form = useForm<RouteApiCall>({
    resolver: zodResolver(routeApiCallSchema),
    defaultValues: route || {
      name: "",
      description: "",
      zone: undefined,
      route_dots: [],
    },
  });

  useEffect(() => {
    if (route) {
      form.reset(route);
      setLocalRouteDots(route.route_dots);
    }
  }, [route, form]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        location.formatted_address?.toLowerCase().includes(searchLower) ||
        location.user_info.user_name?.toLowerCase().includes(searchLower) ||
        location.user_info.visible_emails?.some((email) =>
          email.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [locations, searchTerm]);

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load route data",
      variant: "destructive",
    });
    onClose();
    return null;
  }

  if (routeId !== "new" && !route)
    return <Loader2 className="h-8 w-8 animate-spin" />;

  const onSubmit = async (data: RouteApiCall) => {
    setIsSubmitting(true);
    try {
      const url =
        routeId === "new" ? "/api/maps/routes" : `/api/maps/routes/${routeId}`;
      const method = routeId === "new" ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, route_dots: localRouteDots }),
      });
      if (!response.ok) throw new Error("Failed to save route");
      toast({
        title: "Success",
        description: `Route ${
          routeId === "new" ? "created" : "updated"
        } successfully.`,
      });
      onSave();
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          routeId === "new" ? "create" : "update"
        } route. Please try again.`,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const addDotToRoute = (location: MapInfoAPICall) => {
    setLocalRouteDots((prev) => [
      ...prev,
      {
        id: location.id,
        route_step: prev.length + 1,
        map_info: {
          id: location.id,
          formatted_address: location.formatted_address || "",
          latitude: location.latitude || 0,
          longitude: location.longitude || 0,
        },
      },
    ]);
  };

  const removeDotFromRoute = (index: number) => {
    setLocalRouteDots((prev) => {
      const newDots = prev.filter((_, i) => i !== index);
      return newDots.map((dot, i) => ({
        ...dot,
        route_step: i + 1,
      }));
    });
  };

  console.log(route);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-black">
        <DialogHeader>
          <DialogTitle>
            {routeId === "new" ? "Create New Route" : "Edit Route"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NORTH">North</SelectItem>
                            <SelectItem value="SOUTH">South</SelectItem>
                            <SelectItem value="EAST">East</SelectItem>
                            <SelectItem value="WEST">West</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Locations</CardTitle>
                      <CardDescription>Add or remove locations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                          {localRouteDots.map((dot, index) => (
                            <Card key={dot.id + index} className="bg-muted">
                              <CardContent className="flex justify-between items-center p-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <MapPin className="w-3 h-3 mr-1" />
                                    Step {index + 1}
                                  </Badge>
                                  <span className="text-sm">
                                    {dot.map_info.formatted_address ||
                                      "No Address"}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDotFromRoute(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <XIcon className="h-4 w-4" />
                                  <span className="sr-only">
                                    Remove location
                                  </span>
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                <Card>
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
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {filteredLocations.map((location, index) => (
                          <Card key={index} className="bg-muted">
                            <CardHeader className="pb-2">
                              <p className="text-muted-foreground">
                                {location.user_info.user_name ||
                                  location.user_info.visible_emails?.join(
                                    ", "
                                  ) ||
                                  "No visible data provided yet"}
                              </p>
                              <CardTitle className="text-sm">
                                {location.formatted_address || "No Address"}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Button
                                type="button"
                                onClick={() => addDotToRoute(location)}
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
              <Separator />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Route"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
