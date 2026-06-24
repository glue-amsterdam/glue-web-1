"use client";

import { z } from 'zod';
import { useState } from 'react';

import { submitNewsletter } from '@/app/actions/newsletter';
import BigButton from '@/components/big-button';

const newsletterSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    companyName: z.string().trim().optional(),
    email: z.string().trim().email("Invalid email address"),
});

type FormItem = {
    label: string;
    name: FormFieldName;
    type: "text" | "email";
    required: boolean;
};

type FormFieldName = keyof NewsletterFormValues;
type NewsletterFormValues = z.infer<typeof newsletterSchema>;

const formItems: FormItem[] = [
    {
        label: "First name",
        name: "firstName",
        type: "text",
        required: true,
    },
    {
        label: "Last name",
        name: "lastName",
        type: "text",
        required: true,
    },
    {
        label: "Company Name",
        name: "companyName",
        type: "text",
        required: false,
    },
    {
        label: "Email Address",
        name: "email",
        type: "email",
        required: true,
    },
];


function NewsletterForm() {
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormFieldName, string>>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const getFieldErrorMessage = (
        fieldErrors: Partial<Record<FormFieldName, string>>,
        fieldName: FormFieldName
    ): string | undefined => fieldErrors[fieldName];

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setSubmitError(null);
        setSuccessMessage(null);
        setFieldErrors({});

        const formData = new FormData(event.currentTarget);
        const values = {
            firstName: formData.get("firstName")?.toString(),
            lastName: formData.get("lastName")?.toString(),
            companyName: formData.get("companyName")?.toString(),
            email: formData.get("email")?.toString(),
        };

        const parsed = newsletterSchema.safeParse(values);

        if (!parsed.success) {
            const flattenedErrors = parsed.error.flatten().fieldErrors;
            const nextFieldErrors: Partial<Record<FormFieldName, string>> = {};

            (Object.keys(flattenedErrors) as FormFieldName[]).forEach((fieldName) => {
                const message = flattenedErrors[fieldName]?.[0];
                if (message) {
                    nextFieldErrors[fieldName] = message;
                }
            });

            setFieldErrors(nextFieldErrors);
            return;
        }

        setIsSubmitting(true);

        const form = event.currentTarget;

        try {
            const result = await submitNewsletter(parsed.data);

            if (result.status === 200 && result.success) {
                const message =
                    result.memberStatus === "pending"
                        ? "Check your email to confirm your subscription."
                        : "Thank you for subscribing to our newsletter.";
                setSuccessMessage(message);
                form.reset();
                return;
            }

            if (!result.success) {
                setSubmitError(result.error);
            }
        } catch {
            setSubmitError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            id="newsletter-form"
            className="pt-[80px] max-w-[508px] mx-auto"
            noValidate
        >
            <div className="flex flex-col gap-[15px] md:gap-[30px]">
                {formItems.map((item) => {
                    const fieldError = getFieldErrorMessage(fieldErrors, item.name);

                    return (
                        <div className="flex flex-col gap-[10px] relative" key={item.name}>
                            <label htmlFor={item.name} className="base-text-size flex gap-[5px]">
                                {item.label} {item.required ? <span aria-hidden="true">*</span> : null}
                                {fieldError ? (
                                    <span aria-hidden="true"
                                        id={`${item.name}-error`}
                                        role="alert"
                                        className="text-[12px] text-[var(--primary-color)]"
                                    >
                                        {fieldError}
                                    </span>
                                ) : null}
                            </label>
                            <input
                                type={item.type}
                                id={item.name}
                                name={item.name}
                                required={item.required}
                                aria-invalid={Boolean(fieldError)}
                                aria-describedby={fieldError ? `${item.name}-error` : undefined}
                                className="pt-[5px] md:pt-[15px] bg-[var(--white-color)] border border-[var(--black-color)] h-[42px] pl-1"
                            />

                        </div>
                    );
                })}
            </div>

            {submitError ? (
                <p role="alert" className="pt-[15px] base-text-size text-[var(--primary-color)]">
                    {submitError}
                </p>
            ) : null}

            {successMessage ? (
                <p role="status" className="pt-[15px] base-text-size text-[var(--primary-color)]">
                    {successMessage}
                </p>
            ) : null}

            <div className="flex justify-end pt-[15px] pb-[5px]">
                <BigButton
                    as="submit"
                    label={isSubmitting ? "signing up..." : "sign up"}
                    mode="navbar"
                    disabled={isSubmitting}
                />
            </div>
        </form>
    )
}

export default NewsletterForm