"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hubSchema, HubValues } from "@/schemas/hubSchema";
import { fetchAllHubParticipants, fetchMapsIdandName } from "@/utils/api";
import { SelectContentLocation } from "@/app/dashboard/components/select-content-location";
import { SelectContentParticipant } from "@/app/dashboard/components/select-content-participant";

interface HubFormProps {
  defaultValues?: HubValues;
  onSubmit: (data: HubValues) => void;
  isLoading: boolean;
  submitButtonText: string;
}

export function HubForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitButtonText,
}: HubFormProps) {
  const form = useForm<HubValues>({
    resolver: zodResolver(hubSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      hubMembers: [],
      hubPlace: { mapbox_id: "", place_name: "" },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hubMembers",
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto px-2 sm:px-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-sm">Hub Name</FormLabel>
              <FormControl>
                <Input
                  className="dashboard-input bg-white/10 text-white text-sm"
                  placeholder="Enter hub name"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-300 text-xs">
                Give your hub a descriptive name.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-sm">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your hub"
                  className="resize-none dashboard-input bg-white/10 text-white text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-300 text-xs">
                Provide a brief description of the hub.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="space-y-3">
          <FormLabel className="text-white text-sm">
            Hub Members (at least 1 required)
          </FormLabel>
          <FormDescription className="text-gray-300 text-xs">
            Select the members for your hub.
          </FormDescription>
          {fields.map((field, index) => (
            <FormItem key={field.id} className="flex items-center space-x-2">
              <Controller
                name={`hubMembers.${index}`}
                control={form.control}
                render={({ field: controllerField }) => (
                  <FormControl className="flex-grow">
                    <Select
                      onValueChange={async (value) => {
                        const selectedParticipant =
                          await fetchAllHubParticipants().then((participants) =>
                            participants.find((p) => p.userId === value)
                          );
                        if (selectedParticipant) {
                          controllerField.onChange(selectedParticipant);
                          form.trigger("hubMembers");
                        }
                      }}
                      value={controllerField.value?.userId || ""}
                    >
                      <SelectTrigger className="dashboard-input bg-white/10 text-white text-xs h-8">
                        <SelectValue
                          className="truncate"
                          placeholder="Select a participant"
                        />
                      </SelectTrigger>
                      <Suspense
                        fallback={
                          <div className="text-white text-xs">Loading...</div>
                        }
                      >
                        <SelectContentParticipant />
                      </Suspense>
                    </Select>
                  </FormControl>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-white hover:bg-white/20 p-1"
                aria-label="Remove member"
              >
                <X className="h-4 w-4" />
              </Button>
            </FormItem>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-white text-black border-white hover:bg-white/20 text-xs py-1"
            onClick={() =>
              append({
                userId: "",
                userName: "",
              })
            }
          >
            Add Member
          </Button>
          <FormMessage className="text-xs">
            {form.formState.errors.hubMembers?.message}
          </FormMessage>
        </div>
        <div className="space-y-3">
          <FormLabel className="text-white text-sm">Hub Location</FormLabel>
          <FormDescription className="text-gray-300 text-xs">
            Select the location for your hub.
          </FormDescription>
          <FormField
            control={form.control}
            name="hubPlace"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={async (value) => {
                      const selectedLocation = await fetchMapsIdandName().then(
                        (locations) =>
                          locations.find((loc) => loc.mapbox_id === value)
                      );
                      if (selectedLocation) {
                        field.onChange({
                          mapbox_id: selectedLocation.mapbox_id,
                          place_name: selectedLocation.place_name,
                        });
                        form.trigger("hubPlace");
                      }
                    }}
                    value={field.value?.mapbox_id || ""}
                  >
                    <SelectTrigger className="dashboard-input bg-white/10 text-white text-xs h-8">
                      <SelectValue
                        className="truncate"
                        placeholder="Select a location"
                      />
                    </SelectTrigger>
                    <Suspense
                      fallback={
                        <div className="text-white text-xs">Loading...</div>
                      }
                    >
                      <SelectContentLocation />
                    </Suspense>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black hover:bg-gray-200 text-sm py-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </form>
    </Form>
  );
}
