"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { reactivationNotesSchema } from "@/schemas/participantDetailsSchemas";
import mapboxSdk from "@mapbox/mapbox-sdk/services/geocoding";
import { config } from "@/env";
import { strToNumber } from "@/constants";
import useSWR from "swr";
import { PlanType } from "@/schemas/plansSchema";
import TermsContent from "@/app/signup/components/TermsContent";

// Props for the modal
interface ReactivationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof reactivationNotesSchema>) => Promise<void>;
  userId: string;
}

const mapboxClient = mapboxSdk({
  accessToken: config.mapboxAccesToken,
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ReactivationRequestModal({
  isOpen,
  onClose,
  onSubmit,
}: ReactivationRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{ place_name: string; center: [number, number] }>
  >([]);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const { toast } = useToast();

  const {
    data: plansData,
    error: plansError,
    isLoading: plansLoading,
  } = useSWR("/api/plans", fetcher);

  const plans: PlanType[] = plansData?.plans || [];

  const form = useForm<z.infer<typeof reactivationNotesSchema>>({
    resolver: zodResolver(reactivationNotesSchema),
    defaultValues: {
      plan_id: "",
      plan_type: "",
      formatted_address: null,
      latitude: null,
      longitude: null,
      no_address: true,
      notes: "",
      exhibition_space_preference: null,
      termsAccepted: false,
    },
  });

  const handleOpenTerms = () => {
    setIsTermsDialogOpen(true);
  };

  const noAddress = form.watch("no_address");

  // Mapbox geocoding constants
  const westLimit = strToNumber(config.cityBoundWest);
  const southLimit = strToNumber(config.cityBoundSouth);
  const eastLimit = strToNumber(config.cityBoundEast);
  const northLimit = strToNumber(config.cityBoundNorth);
  const centerLng = strToNumber(config.cityCenterLng);
  const centerLat = strToNumber(config.cityCenterLat);

  const handleAddressChange = async (input: string) => {
    if (input.length > 2) {
      try {
        const response = await mapboxClient
          .forwardGeocode({
            query: input,
            limit: 5,
            countries: [config.countryPreFix],
            types: ["address"],
            bbox: [westLimit, southLimit, eastLimit, northLimit],
            proximity: [centerLng, centerLat],
          })
          .send();

        setSuggestions(
          response.body.features.map((feature) => ({
            place_name: feature.place_name,
            center: feature.center as [number, number],
          }))
        );
      } catch (error) {
        console.error("Geocoding error:", error);
        toast({
          title: "Geocoding Error",
          description: "Failed to fetch address suggestions.",
          variant: "destructive",
        });
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: {
    place_name: string;
    center: [number, number];
  }) => {
    form.setValue("formatted_address", suggestion.place_name);
    form.setValue("latitude", suggestion.center[1]);
    form.setValue("longitude", suggestion.center[0]);
    setSuggestions([]);
  };

  useEffect(() => {
    if (noAddress) {
      form.setValue("formatted_address", null);
      form.setValue("latitude", null);
      form.setValue("longitude", null);
    }
  }, [noAddress, form]);

  const handleFormSubmit = async (
    data: z.infer<typeof reactivationNotesSchema>
  ) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit reactivation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader>
          <DialogTitle>Request Reactivation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {plansLoading ? (
              <div className="text-center py-4">Loading plans...</div>
            ) : plansError ? (
              <div className="text-red-500 text-center py-4">
                Failed to load plans
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="plan_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const selectedPlan = plans.find(
                            (p) => p.plan_id === value
                          );
                          if (selectedPlan) {
                            form.setValue("plan_id", selectedPlan.plan_id);
                            form.setValue("plan_type", selectedPlan.plan_type);
                            form.setValue(
                              "plan_label",
                              selectedPlan.plan_label
                            );
                          }
                        }}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white text-black">
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.plan_id} value={plan.plan_id}>
                              {plan.plan_label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Plan Type{" "}
                        <span className="text-xs text-orange-500/50">
                          -Read only info
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white text-black"
                          readOnly
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="no_address"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{`I don't have a location to present during GLUE, please provide me one`}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {!noAddress && (
                <FormField
                  control={form.control}
                  name="formatted_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`Location to present during GLUE`}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                              handleAddressChange(e.target.value);
                            }}
                            placeholder={`Start typing an address in ${config.cityName}`}
                          />
                          {suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-sm max-h-60 overflow-auto">
                              {suggestions.map((suggestion, index) => (
                                <li
                                  key={index}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() =>
                                    handleSuggestionSelect(suggestion)
                                  }
                                >
                                  {suggestion.place_name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="exhibition_space_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    What sort of exhibition space would you like to have?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your preferred exhibition space (optional)"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide any additional information about your reactivation request..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        id="termsAccepted"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div className="grid gap-1.5 leading-none">
                      <FormLabel
                        htmlFor="termsAccepted"
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        I accept the{" "}
                        <button
                          type="button"
                          onClick={handleOpenTerms}
                          className="text-primary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                          tabIndex={0}
                          aria-label="Open General terms and conditions"
                        >
                          General terms and conditions
                        </button>
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">General Terms and Conditions</DialogTitle>
            <DialogDescription className="sr-only">
              Please read the following terms and conditions carefully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {isTermsDialogOpen && <TermsContent />}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
