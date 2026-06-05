"use client";

import { useState } from "react";
import { z } from "zod";
import BigButton from "@/components/big-button";
import { ParticipateFormField } from "@/components/participate/participate-form-field";
import { visitorRegisterSchema } from "@/schemas/visitorSchemas";

export type VisitorAccountValues = z.infer<typeof visitorRegisterSchema>;

type VisitorAccountStepProps = {
  onSubmit: (data: VisitorAccountValues) => void;
  onBack: () => void;
  submitLabel?: string;
  backLabel?: string;
  submitDisabled?: boolean;
};

export const VisitorAccountStep = ({
  onSubmit,
  onBack,
  submitLabel = "submit application",
  backLabel = "back",
  submitDisabled = false,
}: VisitorAccountStepProps) => {
  const [values, setValues] = useState<VisitorAccountValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof VisitorAccountValues, string>>
  >({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = visitorRegisterSchema.safeParse(values);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<keyof VisitorAccountValues, string>> = {};
      (Object.keys(flat) as (keyof VisitorAccountValues)[]).forEach((key) => {
        const msg = flat[key]?.[0];
        if (msg) next[key] = msg;
      });
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    onSubmit(parsed.data);
  };

  const setField =
    (key: keyof VisitorAccountValues) => (value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

  return (
    <form onSubmit={handleSubmit} className="max-w-[508px] mx-auto" noValidate>
      <h2 className="title-text pb-[30px]">Create your account</h2>
      <div className="flex flex-col gap-[15px] md:gap-[30px]">
        <ParticipateFormField
          label="First name"
          name="firstName"
          required
          value={values.firstName}
          onChange={setField("firstName")}
          error={fieldErrors.firstName}
          autoComplete="given-name"
        />
        <ParticipateFormField
          label="Last name"
          name="lastName"
          required
          value={values.lastName}
          onChange={setField("lastName")}
          error={fieldErrors.lastName}
          autoComplete="family-name"
        />
        <ParticipateFormField
          label="Email Address"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={setField("email")}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <ParticipateFormField
          label="Password"
          name="password"
          type="password"
          required
          value={values.password}
          onChange={setField("password")}
          error={fieldErrors.password}
          autoComplete="new-password"
        />
      </div>
      <div className="flex justify-between pt-[30px] gap-4">
        <BigButton as="button" label={backLabel} mode="navbar" onClick={onBack} />
        <BigButton
          as="submit"
          label={submitLabel}
          mode="navbar"
          disabled={submitDisabled}
        />
      </div>
    </form>
  );
};
