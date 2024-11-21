"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { routeSchema, RouteValues } from "@/schemas/mapSchema";

import { useToast } from "@/hooks/use-toast";
import { RouteForm } from "@/app/components/dashboard/routes/route-form";
import { RouteIcon } from "lucide-react";

export default function CreateRoutePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RouteValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      description: "",
      dots: [],
    },
  });

  async function onSubmit(data: RouteValues) {
    setIsLoading(true);
    try {
      const validDots = data.dots.filter(
        (dot) => dot.mapbox_id && dot.place_name && dot.user_id
      );
      if (validDots.length < 2) {
        form.setError("dots", {
          type: "manual",
          message: "At least two valid locations must be selected",
        });
        setIsLoading(false);
        return;
      }
      const validData = { ...data, dots: validDots };
      // Here you would typically make an API call to create the route
      console.log("Form data submitted:", validData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Route created!",
        description: "Your route has been created successfully.",
        duration: 1000,
      });

      router.refresh();
    } catch (error) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "There was an error creating the route.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5 flex gap-2">
        <RouteIcon />
        Create New Route
      </h1>
      <RouteForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitButtonText="Create Route"
      />
    </div>
  );
}
