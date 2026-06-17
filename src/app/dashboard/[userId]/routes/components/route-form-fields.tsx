"use client";

import type { RouteZoneSummary } from "@/lib/routes/get-route-zones";

export type RouteFormFieldValues = {
  name: string;
  description: string;
  route_zone_id: string;
};

type RouteFormFieldsProps = {
  values: RouteFormFieldValues;
  zones: RouteZoneSummary[];
  onChange: (values: RouteFormFieldValues) => void;
};

const fieldClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black w-full min-w-0";

export const RouteFormFields = ({
  values,
  zones,
  onChange,
}: RouteFormFieldsProps) => {
  const handleChange = (field: keyof RouteFormFieldValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] gap-x-4 gap-y-3 mb-6">
      <div className="min-w-0">
        <label htmlFor="route-name" className="text-xs font-medium block mb-1">
          Name
        </label>
        <input
          id="route-name"
          type="text"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Route name"
          className={fieldClass}
          required
        />
      </div>
      <div className="min-w-0">
        <label
          htmlFor="route-description"
          className="text-xs font-medium block mb-1"
        >
          Description
        </label>
        <input
          id="route-description"
          type="text"
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Optional description"
          className={fieldClass}
        />
      </div>
      <div className="min-w-0 md:col-span-2 lg:col-span-1">
        <label htmlFor="route-zone" className="text-xs font-medium block mb-1">
          Zone
        </label>
        <select
          id="route-zone"
          value={values.route_zone_id}
          onChange={(e) => handleChange("route_zone_id", e.target.value)}
          className={fieldClass}
          required
        >
          <option value="">Select zone</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
