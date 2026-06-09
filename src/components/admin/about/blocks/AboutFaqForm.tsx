"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/app/components/editor";
import { Plus, Trash2 } from "lucide-react";
import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string(),
});

const formSchema = z.object({
  title: z.string().min(1),
  is_visible: z.boolean(),
  items: z.array(faqItemSchema),
});

type FormData = z.infer<typeof formSchema>;

export default function AboutFaqForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openItemId, setOpenItemId] = useState<string | undefined>();
  const pendingOpenLastRef = useRef(false);
  const blockId = ABOUT_BLOCK_IDS.FAQ;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "FAQ",
      is_visible: false,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  useEffect(() => {
    if (pendingOpenLastRef.current && fields.length > 0) {
      setOpenItemId(fields[fields.length - 1].id);
      pendingOpenLastRef.current = false;
    }
  }, [fields]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/about/blocks/${blockId}`);
        const data = await res.json();
        const items = (data.items ?? []).map(
          (item: { question: string; answer: string }) => ({
            question: item.question,
            answer: item.answer ?? "",
          })
        );
        form.reset({
          title: data.block?.title ?? "FAQ",
          is_visible: data.block?.is_visible ?? false,
          items,
        });
        setOpenItemId(undefined);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load FAQ block",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [blockId, form, toast]);

  const handleAddItem = () => {
    pendingOpenLastRef.current = true;
    append({ question: "", answer: "" });
  };

  const handleRemoveItem = (index: number, fieldId: string) => {
    remove(index);
    if (openItemId === fieldId) {
      setOpenItemId(undefined);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const blockRes = await fetch(`/api/admin/about/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: "",
          is_visible: data.is_visible,
        }),
      });
      if (!blockRes.ok) {
        throw new Error("Block update failed");
      }

      const itemsRes = await fetch(`/api/admin/about/blocks/faq/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: data.items.map((item, index) => ({
            ...item,
            display_order: index,
          })),
        }),
      });
      if (!itemsRes.ok) {
        throw new Error("FAQ items update failed");
      }

      toast({
        title: "FAQ updated",
        description: "Block saved successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update FAQ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Loading FAQ...</p>;
  }

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold">FAQ</h2>

        <FormField
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4">
              <FormLabel>Visible</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openItemId}
              onValueChange={setOpenItemId}
              className="space-y-2"
            >
              {fields.map((field, index) => {
                const itemLabel =
                  watchedItems[index]?.question?.trim() || `Item ${index + 1}`;

                return (
                  <AccordionItem
                    key={field.id}
                    value={field.id}
                    className="rounded-lg border border-gray-200 px-4 border-b"
                  >
                    <div className="flex items-center gap-2">
                      <AccordionTrigger className="flex-1 py-3 text-left font-medium hover:no-underline">
                        {itemLabel}
                      </AccordionTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        aria-label={`Remove ${itemLabel}`}
                        onClick={() => handleRemoveItem(index, field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <AccordionContent className="space-y-3 pb-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.question`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                {...f}
                                placeholder="What's the story behind GLUE?"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.answer`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl>
                              <RichTextEditor
                                value={f.value}
                                onChange={f.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

        <SaveChangesButton isSubmitting={isSubmitting} className="w-full" />
      </form>
    </Form>
  );
}
