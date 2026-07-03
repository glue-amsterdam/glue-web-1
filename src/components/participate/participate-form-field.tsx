"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
type ParticipateFormFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "date";
  as?: "input" | "textarea";
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  description?: string;
  wrapperClassName?: string;
  disabled?: boolean;
};

const fieldLayoutClassName =
  "w-full max-w-full min-w-0 pt-[5px] bg-(--white-color) border border-(--black-color) lg:border-2 pl-1";

const bodyTextTypographyClassName =
  "text-[15px] leading-[21px] lg:text-[19px] lg:leading-[25px]";

const fieldClassName = `${fieldLayoutClassName} body-text`;

const participateSelectTriggerClassName =
  "h-[42px] px-0 py-0 pr-2 rounded-none shadow-none ring-0 focus:ring-0 text-(--black-color) [&_[data-placeholder]]:text-(--black-color)/50 [&_svg]:hidden disabled:opacity-60";

const participateSelectContentClassName =
  "rounded-none border border-(--black-color) lg:border-2 bg-(--white-color) p-0 shadow-none [&_[data-radix-select-viewport]]:p-0";

const participateSelectItemClassName =
  "rounded-none py-[5px] pl-1 pr-2 text-(--black-color) outline-none cursor-pointer data-[highlighted]:bg-(--primary-color) data-[highlighted]:text-(--white-color) focus:bg-(--primary-color) focus:text-(--white-color) [&_svg]:hidden";

export const participateFieldClassName = fieldClassName;

export const ParticipateFormField = ({
  label,
  name,
  type = "text",
  as = "input",
  required = false,
  error,
  value,
  onChange,
  autoComplete,
  placeholder,
  description,
  wrapperClassName,
  disabled = false,
}: ParticipateFormFieldProps) => {
  const describedBy = [
    error ? `${name}-error` : null,
    description ? `${name}-description` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`flex w-full min-w-0 flex-col gap-[5px] ${wrapperClassName ?? ""}`}>
      <div className="flex items-center gap-2">
        <label htmlFor={name} className="body-text">
          {label}{" "}
          {required ? <span aria-hidden="true">*</span> : null}
        </label>

        {error ? (
          <span
            id={`${name}-error`}
            role="alert"
            className="pointer-events-none text-[12px] leading-[14px] text-(--primary-color) line-clamp-2"
          >
            {error}
          </span>
        ) : null}</div>
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${fieldClassName} min-h-[120px] resize-y py-[5px] md:py-[15px] disabled:opacity-60`}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${fieldClassName} h-[42px] disabled:opacity-60`}
        />
      )}

      {description ? (
        <p id={`${name}-description`} className="mini-text-size">
          {description}
        </p>
      ) : null}
    </div>
  );
};

type ParticipateFormSelectOption = {
  value: string;
  label: string;
};

type ParticipateFormSelectProps = {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: ParticipateFormSelectOption[];
  placeholder?: string;
  description?: string;
  wrapperClassName?: string;
  disabled?: boolean;
};

export const ParticipateFormSelect = ({
  label,
  name,
  required = false,
  error,
  value = "",
  onChange,
  options,
  placeholder = "Select…",
  description,
  wrapperClassName,
  disabled = false,
}: ParticipateFormSelectProps) => {
  const describedBy = [
    error ? `${name}-error` : null,
    description ? `${name}-description` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`flex w-full min-w-0 flex-col gap-[5px] ${wrapperClassName ?? ""}`}>
      <div className="flex items-center gap-2">
        <label htmlFor={name} className="body-text">
          {label}{" "}
          {required ? <span aria-hidden="true">*</span> : null}
        </label>

        {error ? (
          <span
            id={`${name}-error`}
            role="alert"
            className="pointer-events-none text-[12px] leading-[14px] text-(--primary-color) line-clamp-2"
          >
            {error}
          </span>
        ) : null}</div>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          id={name}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            fieldLayoutClassName,
            bodyTextTypographyClassName,
            participateSelectTriggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          className={cn(
            bodyTextTypographyClassName,
            participateSelectContentClassName,
          )}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(
                bodyTextTypographyClassName,
                participateSelectItemClassName,
              )}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description ? (
        <p id={`${name}-description`} className="mini-text-size">
          {description}
        </p>
      ) : null}
    </div>
  );
};
