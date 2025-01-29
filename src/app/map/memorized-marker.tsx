import {
  MapPin,
  MapPinHouse,
  MapPinMinusInside,
  MapPinPlus,
} from "lucide-react";
import { Marker } from "react-map-gl";
import { memo } from "react";

interface Location {
  id: string;
  longitude: number;
  latitude: number;
  is_hub?: boolean;
  is_collective?: boolean;
  is_special_program?: boolean;
}

interface MemoizedMarkerProps {
  location: Location;
  onClick: (e: { originalEvent: { stopPropagation: () => void } }) => void;
}

export const MemoizedMarker = memo(
  ({ location, onClick }: MemoizedMarkerProps) => (
    <Marker
      longitude={location.longitude}
      latitude={location.latitude}
      anchor="top"
      onClick={onClick}
    >
      <div className="relative cursor-pointer">
        <div
          className={`size-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 ${
            location.is_hub
              ? "bg-green-500 opacity-70 hover:opacity-100"
              : location.is_collective
              ? "bg-yellow-500 opacity-70 hover:opacity-100"
              : location.is_special_program
              ? "bg-purple-500 opacity-70 hover:opacity-100"
              : "bg-blue-500 opacity-70 hover:opacity-100"
          }`}
        >
          {location.is_hub ? (
            <MapPinHouse className="w-5 h-5 text-white" />
          ) : location.is_collective ? (
            <MapPinPlus className="w-5 h-5 text-white" />
          ) : location.is_special_program ? (
            <MapPinMinusInside className="w-5 h-5 text-white" />
          ) : (
            <MapPin className="w-5 h-5 text-white" />
          )}
        </div>
      </div>
    </Marker>
  )
);

MemoizedMarker.displayName = "MemoizedMarker";
