"use client";

import { memo, useState, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  legendItems,
  legendTitle,
  legendPosition,
  type LegendItem,
} from "./legend-config";

interface MapLegendProps {
  className?: string;
  items?: LegendItem[];
  title?: string;
  position?: {
    top: string;
    right: string;
  };
}

function MapLegendComponent({
  className = "",
  items = legendItems,
  title = legendTitle,
  position = legendPosition,
}: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div
      className={`absolute ${position.top} ${position.right} text-black z-10 bg-white rounded-lg outline-none ${className} z-[51]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpanded}
          className="h-6 w-6"
          aria-label={isExpanded ? "Collapse legend" : "Expand legend"}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Legend Items */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.color} opacity-70`}
              >
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">
                  {item.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MemoizedMapLegend = memo(MapLegendComponent);

export default MemoizedMapLegend;
