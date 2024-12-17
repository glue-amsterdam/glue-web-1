"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  routeSchema,
  RouteValues,
  ZoneEnum,
  RouteStep,
} from "@/schemas/mapSchema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Route } from "lucide-react";
import { useEffect } from "react";

interface RouteFormProps {
  onSubmit: (data: RouteValues) => void;
  isLoading: boolean;
  submitButtonText: string;
  defaultValues?: Partial<RouteValues>;
  selectedDots: RouteStep[];
}

export function RouteForm({
  onSubmit,
  isLoading,
  submitButtonText,
  defaultValues,
  selectedDots,
}: RouteFormProps) {
  const form = useForm<RouteValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      description: "",
      zone: "NORTH",
      dots: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    form.setValue("dots", selectedDots);
  }, [selectedDots, form]);

  const handleSubmit = (data: RouteValues) => {
    onSubmit(data);
    form.reset({
      name: "",
      description: "",
      zone: "NORTH",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter route name" {...field} />
              </FormControl>
              <FormDescription>
                Give your route a descriptive name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your route"
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a brief description of your route.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ZoneEnum.enum).map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the zone for this route.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Route className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Route className="mr-2 h-4 w-4" />
              {submitButtonText}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
