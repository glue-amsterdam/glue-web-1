"use client";

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

const fieldClassName =
  "w-full pt-[5px] md:pt-[15px] base-text-size bg-(--white-color) border border-(--black-color) pl-1 max-w-(507px)";

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
    <div className={`flex flex-col gap-[10px] ${wrapperClassName ?? ""}`}>
      <label htmlFor={name} className="base-text-size">
        {label}{" "}
        {required ? <span aria-hidden="true">*</span> : null}
      </label>
      <div className="relative">
        {error ? (
          <span
            id={`${name}-error`}
            role="alert"
            className="pointer-events-none absolute bottom-full left-0 right-0 mb-[4px] text-[12px] leading-[14px] text-(--primary-color) line-clamp-2"
          >
            {error}
          </span>
        ) : null}
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
      </div>
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
    <div className={`flex flex-col gap-[10px] ${wrapperClassName ?? ""}`}>
      <label htmlFor={name} className="base-text-size">
        {label}{" "}
        {required ? <span aria-hidden="true">*</span> : null}
      </label>
      <div className="relative">
        {error ? (
          <span
            id={`${name}-error`}
            role="alert"
            className="pointer-events-none absolute bottom-full left-0 right-0 mb-[4px] text-[12px] leading-[14px] text-(--primary-color) line-clamp-2"
          >
            {error}
          </span>
        ) : null}
        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${fieldClassName} h-[42px] pr-2 appearance-none disabled:opacity-60`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {description ? (
        <p id={`${name}-description`} className="mini-text-size">
          {description}
        </p>
      ) : null}
    </div>
  );
};
