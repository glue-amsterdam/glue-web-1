"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import CenteredLoader from "@/app/components/centered-loader";
import PlanSelector from "@/app/components/signup/plan-selector";
import LoginInfo from "@/app/components/signup/login-info";
import UserInfo from "@/app/components/signup/user-info";
import InvoiceData from "@/app/components/signup/invoice-data";
import LocationInfo from "@/app/components/signup/location-info";
import { useToast } from "@/hooks/use-toast";
import { PlansArrayType } from "@/schemas/plansSchema";

// Define the form schema using Zod
const formSchema = z
  .object({
    plan: z.string().min(1, "Please select a plan"),
    planType: z.enum(["free", "member", "participant"] as const),
    email: z.string().email("Invalid email address").optional(),
    companyName: z
      .string()
      .min(1, "Company/Person name is required")
      .optional(),
    shortDescription: z
      .string()
      .max(500, "Short description must be 500 characters or less")
      .optional(),
    website: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    noAddress: z.boolean().optional(),
    address: z.string().optional(),
    invoiceName: z.string().min(1, "Name for invoice is required").optional(),
    invoiceCountry: z.string().min(1, "Country is required").optional(),
    invoiceState: z.string().min(1, "State/Province is required").optional(),
    invoiceCity: z.string().min(1, "City is required").optional(),
    invoiceZip: z.string().min(1, "ZIP/Postal Code is required").optional(),
    invoiceExtra: z.string().optional(),
    loginEmail: z.string().email("Invalid login email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine(
    (data) => {
      if (data.planType === "participant" && !data.noAddress && !data.address) {
        return false;
      }
      return true;
    },
    {
      message:
        "Address is required unless 'I don't have a physical address' is checked",
      path: ["address"],
    }
  );

type FormData = z.infer<typeof formSchema>;

type PlanType = "free" | "member" | "participant";

// Define the fields for each step based on the plan type
const getStepFields = (planType: PlanType) => {
  const steps: Record<number, Array<keyof FormData>> = {
    1: ["plan", "planType"],
  };

  if (planType === "participant") {
    steps[2] = [
      "email",
      "companyName",
      "shortDescription",
      "website",
      "instagram",
      "facebook",
      "linkedin",
    ];
    steps[3] = ["noAddress", "address"];
    steps[4] = [
      "invoiceName",
      "invoiceCountry",
      "invoiceState",
      "invoiceCity",
      "invoiceZip",
      "invoiceExtra",
    ];
    steps[5] = ["loginEmail", "password"];
  } else if (planType === "member") {
    steps[2] = [
      "invoiceName",
      "invoiceCountry",
      "invoiceState",
      "invoiceCity",
      "invoiceZip",
      "invoiceExtra",
    ];
    steps[3] = ["loginEmail", "password"];
  } else {
    steps[2] = ["loginEmail", "password"];
  }

  return steps;
};

export default function MultiStepForm({
  plansData,
}: {
  plansData: PlansArrayType;
}) {
  const [step, setStep] = useState(1);
  const [attemptedNextStep, setAttemptedNextStep] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {},
  });

  const { handleSubmit, trigger, setValue, getValues, watch, reset } = methods;
  const planType = watch("planType");
  const searchParams = useSearchParams();

  // Handle initial form state and step navigation
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const parsedStep = parseInt(stepParam);
      if (!isNaN(parsedStep) && parsedStep > 0) {
        setStep(parsedStep);
      }
    }

    const savedData = localStorage.getItem("formData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.planType === planType) {
        Object.entries(parsedData).forEach(([key, value]) => {
          setValue(
            key as keyof FormData,
            value as string | boolean | undefined
          );
        });
      } else {
        localStorage.removeItem("formData");
        reset();
      }
    }

    // Only reset and show toast if we're on step 1 and there's no plan selected
    if (step === 1 && planType === undefined) {
      localStorage.removeItem("formData");
      reset();
    }
  }, [searchParams, setValue, step, getValues, reset, planType]);

  // Save form data to localStorage on every change
  useEffect(() => {
    const subscription = methods.watch((value) => {
      if (step > 1) {
        localStorage.setItem("formData", JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, step]);

  // Validate the current step
  const validateStep = async () => {
    const stepFields = getStepFields(planType)[step];
    const result = await trigger(stepFields);

    if (step === 3 && planType === "participant") {
      const noAddress = getValues("noAddress");
      const address = getValues("address");
      if (!noAddress && !address) {
        methods.setError("address", {
          type: "manual",
          message:
            "Address is required when 'I don't have a physical address' is not checked",
        });
        return false;
      }
    }

    return result;
  };

  // Handle moving to the next step
  const nextStep = async () => {
    setAttemptedNextStep(true);
    const isStepValid = await validateStep();
    if (isStepValid) {
      const nextStep = step + 1;
      const maxSteps = Object.keys(getStepFields(planType)).length;
      if (nextStep <= maxSteps) {
        setStep(nextStep);
        router.push(`?step=${nextStep}`);
        setAttemptedNextStep(false);
      }
    }
  };

  // Handle moving to the previous step
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    const prevStep = step - 1;
    if (prevStep >= 1) {
      setStep(prevStep);
      router.push(`?step=${prevStep}`);
      setAttemptedNextStep(false);
    }
  };

  // Handle form submission
  const onSubmit = (data: FormData) => {
    console.log(data);
    localStorage.removeItem("formData");

    if (data.planType === "participant") {
      toast({
        title: "User Created!",
        description: "A moderator is going to confirm you as a participant.",
        duration: 5000,
      });
    } else {
      toast({
        title: "User Created",
        duration: 3000,
      });
    }

    router.push("/");
  };

  // Render the current step of the form
  const renderStep = () => {
    const commonProps = { attemptedNextStep };

    if (step === 1) {
      return (
        <Suspense fallback={<CenteredLoader />}>
          <PlanSelector {...commonProps} plansData={plansData} />
        </Suspense>
      );
    }

    if (!getValues("plan")) {
      router.push("?step=1");
      return <CenteredLoader />;
    }

    const stepComponents = {
      free: {
        2: <LoginInfo {...commonProps} />,
      },
      member: {
        2: <InvoiceData {...commonProps} />,
        3: <LoginInfo {...commonProps} />,
      },
      participant: {
        2: <UserInfo {...commonProps} />,
        3: <LocationInfo {...commonProps} />,
        4: <InvoiceData {...commonProps} />,
        5: <LoginInfo {...commonProps} />,
      },
    };

    const planSteps = stepComponents[planType as keyof typeof stepComponents];
    const Component = planSteps
      ? planSteps[step as keyof typeof planSteps]
      : undefined;

    if (Component) {
      return Component;
    }

    router.push("?step=1");
    return <CenteredLoader />;
  };

  const isLastStep = step === Object.keys(getStepFields(planType)).length;

  return (
    <div className="flex flex-col min-h-full py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Sign Up for GLUE{" "}
        {planType?.charAt(0).toUpperCase() + planType?.slice(1) || "Your"}{" "}
        Account
      </h1>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-grow"
        >
          <Suspense fallback={<CenteredLoader />}>
            <div className="flex-grow">{renderStep()}</div>
          </Suspense>
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="text-black"
                type="button"
              >
                Previous
              </Button>
            )}
            {!isLastStep && (
              <Button onClick={nextStep} type="button" className="ml-auto">
                Next
              </Button>
            )}
            {isLastStep && (
              <Button type="submit" className="ml-auto">
                Submit
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
