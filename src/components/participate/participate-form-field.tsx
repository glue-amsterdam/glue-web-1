"use client";

type ParticipateFormFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "date";
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
};

export const ParticipateFormField = ({
  label,
  name,
  type = "text",
  required = false,
  error,
  value,
  onChange,
  autoComplete,
}: ParticipateFormFieldProps) => (
  <div className="flex flex-col gap-[10px] relative">
    <label htmlFor={name} className="base-text-size flex gap-[5px]">
      {label}{" "}
      {required ? <span aria-hidden="true">*</span> : null}
      {error ? (
        <span
          aria-hidden="true"
          id={`${name}-error`}
          role="alert"
          className="text-[12px] text-(--primary-color)"
        >
          {error}
        </span>
      ) : null}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      required={required}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      autoComplete={autoComplete}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : undefined}
      className="w-full pt-[5px] md:pt-[15px] base-text-size bg-(--white-color) border border-(--black-color) h-[42px] pl-1 max-w-(507px)"
    />
  </div>
);
