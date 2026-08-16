"use client";

import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapInfoAPICall, RouteStep } from "@/schemas/mapSchema";

const panelClass = "flex flex-col min-h-0 lg:h-full";
const toolbarClass =
  "mb-2 flex flex-col gap-2 sm:flex-row sm:min-h-[34px] sm:items-end sm:justify-between";
const tableWrapClass =
  "flex-1 min-h-[240px] max-h-[320px] lg:min-h-[360px] lg:max-h-[360px] overflow-auto border border-gray-200";
const tableClass = "w-full table-fixed text-sm";
const cellClass = "px-2 py-1.5 align-top";
const truncateClass = `${cellClass} truncate max-w-0`;
const stopRowGridClass =
  "grid grid-cols-[28px_2rem_minmax(0,38%)_minmax(0,1fr)_2.5rem] items-start gap-0 text-sm";
const stopCellClass = "px-2 py-1.5 min-w-0";
const dndModifiers = [restrictToVerticalAxis];

type RouteSelectedLocationsProps = {
  selectedDots: RouteStep[];
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

type SortableStopRowProps = {
  dot: RouteStep;
  index: number;
  canReorder: boolean;
  onRemove: (index: number) => void;
};

const SortableStopRow = ({
  dot,
  index,
  canReorder,
  onRemove,
}: SortableStopRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dot.id, disabled: !canReorder });

  const displayName = dot.display_name || "No user name";
  const address = dot.formatted_address || "—";

  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        stopRowGridClass,
        "border-b border-gray-100 bg-white",
        isDragging && "relative z-10 opacity-50"
      )}
    >
      <div className={`${stopCellClass} flex items-start justify-center`}>
        {canReorder ? (
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="cursor-grab touch-none rounded p-1 hover:bg-gray-100 active:cursor-grabbing"
            aria-label={`Reorder stop ${dot.route_step}, ${displayName}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-500" aria-hidden />
          </button>
        ) : null}
      </div>
      <div className={stopCellClass}>{dot.route_step}</div>
      <div className={`${stopCellClass} truncate font-medium`} title={dot.display_name || undefined}>
        {displayName}
      </div>
      <div
        className={`${stopCellClass} truncate text-muted-foreground`}
        title={dot.formatted_address || undefined}
      >
        {address}
      </div>
      <div className={stopCellClass}>
        <button
          type="button"
          onClick={handleRemove}
          className="rounded p-1 hover:bg-gray-100"
          aria-label={`Remove stop ${dot.route_step}`}
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
};

export const RouteSelectedLocations = ({
  selectedDots,
  onRemove,
  onReorder,
}: RouteSelectedLocationsProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const sortableIds = useMemo(
    () => selectedDots.map((dot) => dot.id),
    [selectedDots]
  );
  const canReorder = selectedDots.length > 1;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = selectedDots.findIndex((dot) => dot.id === active.id);
    const toIndex = selectedDots.findIndex((dot) => dot.id === over.id);
    if (fromIndex < 0 || toIndex < 0) return;

    onReorder(fromIndex, toIndex);
  };

  return (
    <div className={panelClass}>
      <div className={toolbarClass}>
        <div>
          <p className="text-xs font-medium">Stops ({selectedDots.length})</p>
          {canReorder ? (
            <p className="text-xs text-muted-foreground">Drag to reorder</p>
          ) : null}
        </div>
      </div>
      <div className={tableWrapClass}>
        <div className={cn(stopRowGridClass, "sticky top-0 z-10 border-b border-gray-200 bg-gray-50")}>
          <div className={stopCellClass} aria-hidden />
          <div className={`${stopCellClass} font-medium`}>#</div>
          <div className={`${stopCellClass} font-medium`}>Participant</div>
          <div className={`${stopCellClass} font-medium`}>Address</div>
          <div className={stopCellClass} />
        </div>
        {selectedDots.length === 0 ? (
          <p className="px-2 py-4 text-center text-muted-foreground text-sm">
            No stops selected
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={dndModifiers}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              <ul aria-label="Route stops">
                {selectedDots.map((dot, index) => (
                  <SortableStopRow
                    key={dot.id}
                    dot={dot}
                    index={index}
                    canReorder={canReorder}
                    onRemove={onRemove}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

type RouteAvailableLocationsProps = {
  mapInfoList: MapInfoAPICall[];
  selectedDots: RouteStep[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAdd: (mapInfo: MapInfoAPICall) => void;
};

export const RouteAvailableLocations = ({
  mapInfoList,
  selectedDots,
  searchTerm,
  onSearchChange,
  onAdd,
}: RouteAvailableLocationsProps) => {
  const selectedIds = useMemo(
    () => new Set(selectedDots.map((dot) => dot.id)),
    [selectedDots]
  );

  const filteredMapInfoList = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return mapInfoList.filter((mapInfo) => {
      return (
        mapInfo.formatted_address?.toLowerCase().includes(searchLower) ||
        mapInfo.display_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [mapInfoList, searchTerm]);

  return (
    <div className={panelClass}>
      <div className={toolbarClass}>
        <p className="text-xs font-medium shrink-0">Available locations</p>
        <input
          type="text"
          placeholder="Search participant or address..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black w-full min-w-0 sm:max-w-md sm:ml-auto"
          aria-label="Search available locations"
        />
      </div>
      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200 text-left">
              <th className={`${cellClass} w-[38%] font-medium`}>Participant</th>
              <th className={`${cellClass} font-medium`}>Address</th>
              <th className={`${cellClass} w-10 font-medium`} />
            </tr>
          </thead>
          <tbody>
            {filteredMapInfoList.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-2 py-4 text-muted-foreground text-center"
                >
                  No locations found
                </td>
              </tr>
            ) : (
              filteredMapInfoList.map((mapInfo) => {
                const isSelected = selectedIds.has(mapInfo.id);
                return (
                  <tr key={mapInfo.id} className="border-b border-gray-100">
                    <td
                      className={`${truncateClass} font-medium`}
                      title={mapInfo.display_name || undefined}
                    >
                      {mapInfo.display_name || "No visible data"}
                    </td>
                    <td
                      className={`${truncateClass} text-muted-foreground`}
                      title={mapInfo.formatted_address || undefined}
                    >
                      {mapInfo.formatted_address || "No address"}
                    </td>
                    <td className={cellClass}>
                      <button
                        type="button"
                        onClick={() => onAdd(mapInfo)}
                        disabled={isSelected}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        aria-label={`Add ${mapInfo.display_name || "location"}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
