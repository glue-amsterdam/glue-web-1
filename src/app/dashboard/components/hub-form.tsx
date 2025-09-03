"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useEffect } from "react";
import { hubSchema, HubUser, HubValues } from "@/schemas/hubSchemas";
import { HubDisplayNumberField } from "./hub-display-number-field";

interface HubFormProps {
  onSubmit: (values: HubValues) => void;
  isLoading: boolean;
  submitButtonText: string;
  defaultValues?: Partial<HubValues>;
  selectedParticipants: string[];
  hubHost: string | null;
  isMod?: boolean;
  hubId?: string; // For editing existing hubs
}

export function HubForm({
  onSubmit,
  isLoading,
  submitButtonText,
  defaultValues,
  selectedParticipants,
  hubHost,
  isMod = true,
  hubId,
}: HubFormProps) {
  const form = useForm<HubValues>({
    resolver: zodResolver(hubSchema),
    defaultValues: {
      name: "",
      description: "",
      participants: [],
      hub_host: undefined,
      ...defaultValues,
    },
  });

  console.log(form.formState.errors);

  useEffect(() => {
    const participants: HubUser[] = selectedParticipants.map((id) => ({
      user_id: id,
    }));
    form.setValue("participants", participants);

    if (hubHost) {
      form.setValue("hub_host", { user_id: hubHost });
    }
  }, [selectedParticipants, hubHost, form]);

  const handleSubmit = (values: HubValues) => {
    if (!hubHost) {
      form.setError("hub_host", {
        type: "manual",
        message: "Hub host is required",
      });
      return;
    }
    onSubmit(values);
  };

  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hub Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter hub name" {...field} />
              </FormControl>
              <FormDescription>Choose a name for your hub.</FormDescription>
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
                  placeholder="Enter hub description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a brief description of the hub.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="display_number"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <HubDisplayNumberField
                  value={field.value}
                  onChange={field.onChange}
                  hubId={hubId}
                  isMod={isMod}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" {...form.register("hub_host")} />
        <input type="hidden" {...form.register("participants")} />
        <Button type="submit" disabled={isLoading}>
          {submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
