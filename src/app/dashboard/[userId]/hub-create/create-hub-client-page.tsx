"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { hubSchema, HubValues } from "@/schemas/hubSchema";

import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import { HubForm } from "@/app/components/dashboard/hub/hub-form";

export default function CreateHubPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<HubValues>({
    resolver: zodResolver(hubSchema),
    defaultValues: {
      name: "",
      description: "",
      hubMembers: [],
      hubPlace: {
        mapbox_id: "",
      },
    },
  });

  async function onSubmit(data: HubValues) {
    setIsLoading(true);
    try {
      if (data.hubMembers.length < 1) {
        form.setError("hubMembers", {
          type: "manual",
          message: "At least one member must be selected",
        });
        setIsLoading(false);
        return;
      }
      if (!data.hubPlace.mapbox_id) {
        form.setError("hubPlace", {
          type: "manual",
          message: "A hub location must be selected",
        });
        setIsLoading(false);
        return;
      }
      // Here you would typically make an API call to create the hub
      console.log("Form data submitted:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Hub created!",
        description: "Your hub has been created successfully.",
        duration: 1000,
      });

      router.refresh();
    } catch (error) {
      console.error("Error creating hub:", error);
      toast({
        title: "Error",
        description: "There was an error creating the hub.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5 flex gap-2">
        <Users />
        Create New Hub
      </h1>
      <HubForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitButtonText="Create Hub"
      />
    </div>
  );
}
