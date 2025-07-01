"use client";
import { Input } from "@/components/ui/input";
import { useId } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  name,
  label,
  className,
}: ColorPickerProps) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block mb-1 font-medium">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <Input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          style={{ maxWidth: 120 }}
        />
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
}
