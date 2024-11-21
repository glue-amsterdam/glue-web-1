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
import {
  MapLocationEnhaced,
  routeSchema,
  RouteValues,
} from "@/schemas/mapSchema";
import { fetchMapsIdandName } from "@/utils/api";
import { SelectContentLocation } from "@/app/dashboard/components/select-content-location";

interface RouteFormProps {
  defaultValues?: RouteValues;
  onSubmit: (data: RouteValues) => void;
  isLoading: boolean;
  submitButtonText: string;
}

export function RouteForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitButtonText,
}: RouteFormProps) {
  const form = useForm<RouteValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      dots: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dots",
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
              <FormLabel className="text-white text-sm">Route Name</FormLabel>
              <FormControl>
                <Input
                  className="dashboard-input bg-white/10 text-white text-sm"
                  placeholder="Enter route name"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-300 text-xs">
                Give your route a descriptive name.
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
                  placeholder="Describe your route"
                  className="resize-none dashboard-input bg-white/10 text-white text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-300 text-xs">
                Provide a brief description of the route.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="space-y-3">
          <FormLabel className="text-white text-sm">
            Locations (at least 2 required)
          </FormLabel>
          <FormDescription className="text-gray-300 text-xs">
            Select the locations for your route.
          </FormDescription>
          {fields.map((field, index) => (
            <FormItem key={field.id} className="flex items-center space-x-2">
              <Controller
                name={`dots.${index}`}
                control={form.control}
                render={({ field: controllerField }) => (
                  <FormControl className="flex-grow">
                    <Select
                      onValueChange={async (value) => {
                        const selectedLocation =
                          await fetchMapsIdandName().then((locations) =>
                            locations.find((loc) => loc.mapbox_id === value)
                          );
                        if (selectedLocation) {
                          controllerField.onChange(selectedLocation);
                          form.trigger("dots");
                        }
                      }}
                      value={controllerField.value?.mapbox_id || ""}
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
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-white hover:bg-white/20 p-1"
                aria-label="Remove location"
              >
                <X className="h-4 w-4" />
              </Button>
            </FormItem>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-white border-white hover:bg-white/20 text-xs py-1"
            onClick={() =>
              append({
                mapbox_id: "",
                place_name: "",
                user_id: "",
              } as MapLocationEnhaced)
            }
          >
            Add Location
          </Button>
          <FormMessage className="text-xs">
            {form.formState.errors.dots?.message}
          </FormMessage>
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
