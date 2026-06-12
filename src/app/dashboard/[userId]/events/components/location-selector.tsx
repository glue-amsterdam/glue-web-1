import { useState, useEffect } from "react";
import useQuery from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { EventLocation } from "@/lib/events/get-available-event-locations";

interface LocationSelectorProps {
  targetUserId?: string;
  onChange: (locationId: string) => void;
  value: string;
  onLocationsLoaded?: (locations: EventLocation[]) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LocationSelector({
  targetUserId,
  onChange,
  value,
  onLocationsLoaded,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<EventLocation | null>(
    null
  );

  const { data: userLocations, error: userLocationsError } = useQuery<
    EventLocation[]
  >(`/api/mapbox/events/participant/${targetUserId}`, fetcher);

  const { data: hubLocations, error: hubLocationsError } = useQuery<
    EventLocation[]
  >(`/api/mapbox/events/hub/${targetUserId}`, fetcher);

  const isLoading =
    userLocations === undefined || hubLocations === undefined;
  const allLocations = [...(userLocations || []), ...(hubLocations || [])];
  const hasLocations = allLocations.length > 0;

  useEffect(() => {
    if (isLoading || userLocationsError || hubLocationsError) {
      return;
    }

    onLocationsLoaded?.([...(userLocations || []), ...(hubLocations || [])]);
  }, [
    hubLocations,
    hubLocationsError,
    isLoading,
    onLocationsLoaded,
    userLocations,
    userLocationsError,
  ]);

  useEffect(() => {
    if (!value || isLoading) {
      return;
    }

    const location =
      [...(userLocations || []), ...(hubLocations || [])].find(
        (loc) => loc.id === value
      ) ?? null;
    setSelectedLocation(location);
  }, [value, userLocations, hubLocations, isLoading]);

  if (userLocationsError || hubLocationsError) {
    return <div>Error loading locations</div>;
  }

  const handleSelect = (locationId: string) => {
    onChange(locationId);
    setIsOpen(false);
  };

  if (!isLoading && !hasLocations) {
    return (
      <p className="text-sm text-destructive">
        No locations available. Add your address or join a hub with a location.
      </p>
    );
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isLoading || !hasLocations}>
            {selectedLocation
              ? selectedLocation.formatted_address
              : "Select Location"}
          </Button>
        </DialogTrigger>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Select Event Location</DialogTitle>
          </DialogHeader>
          <RadioGroup value={value} onValueChange={handleSelect}>
            {userLocations && userLocations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Your Location</h3>
                {userLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <RadioGroupItem
                      value={location.id}
                      id={`user-${location.id}`}
                    />
                    <Label htmlFor={`user-${location.id}`}>
                      {location.formatted_address}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {hubLocations && hubLocations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 mt-4">Hub Locations</h3>
                {hubLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <RadioGroupItem
                      value={location.id}
                      id={`hub-${location.id}`}
                    />
                    <Label htmlFor={`hub-${location.id}`}>
                      {location.formatted_address}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </RadioGroup>
        </DialogContent>
      </Dialog>
    </div>
  );
}
