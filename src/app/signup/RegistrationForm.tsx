"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import PlanPicker from "@/app/components/signup/plan-picker";
import FreeUserRegistration from "@/app/signup/FreeUserRegistration";
import MemberUserRegistration from "@/app/signup/MemberUserRegistration";
import ParticipantRegistration from "@/app/signup/ParticipantRegistration";
import { useToast } from "@/hooks/use-toast";
import { PlansArrayType } from "@/schemas/plansSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RegistrationFormProps {
  plansData: PlansArrayType;
}

export default function RegistrationForm({ plansData }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<{
    plan_id: string;
    plan_type: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handlePlanSelected = (planData: {
    plan_id: string;
    plan_type: string;
  }) => {
    setSelectedPlan(planData);
    console.log("Selected plan:", planData.plan_type, planData.plan_id);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedPlan(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    console.log("Registration data:", data);
    const registrationData = {
      ...data,
      plan_id: selectedPlan!.plan_id,
      plan_type: selectedPlan!.plan_type,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (result.success) {
        if (selectedPlan!.plan_type === "participant") {
          toast({
            title: "Registration Successful!",
            description:
              "A moderator is going to confirm you as a participant.",
            duration: 3000,
          });
        } else {
          toast({
            title: "User Created!",
            description: "Your account has been successfully created.",
            duration: 3000,
          });
        }
        router.push("/");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4">
      <div className="container mx-auto p-4">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {step === 1 && (
          <PlanPicker
            plansData={plansData}
            onPlanSelected={handlePlanSelected}
          />
        )}
        {step === 2 && selectedPlan && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Complete Your Registration
            </h2>
            {selectedPlan.plan_type === "free" && (
              <FreeUserRegistration
                onSubmit={handleSubmit}
                plan_id={selectedPlan.plan_id}
                plan_type="free"
                onBack={handleBack}
              />
            )}
            {selectedPlan.plan_type === "member" && (
              <MemberUserRegistration
                onSubmit={handleSubmit}
                plan_id={selectedPlan.plan_id}
                plan_type="member"
                onBack={handleBack}
              />
            )}
            {selectedPlan.plan_type === "participant" && (
              <ParticipantRegistration
                onSubmit={handleSubmit}
                plan_id={selectedPlan.plan_id}
                plan_type="participant"
                onBack={handleBack}
              />
            )}
          </div>
        )}
        {loading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <LoadingSpinner />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
