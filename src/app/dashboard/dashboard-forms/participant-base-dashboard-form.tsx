"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { motion } from "framer-motion";
import VisitingHoursForm from "@/app/dashboard/[userId]/visiting-hours-form";
import { fadeInConfig } from "@/utils/animations";
import {
  ApiParticipantBaseType,
  formParticipantSchema,
} from "@/schemas/usersSchemas";
import { ImageData } from "@/schemas/baseSchema";
import { useDebounce } from "use-debounce";
import { useEffect, useState, useCallback } from "react";
import { fetchSlugCheck } from "@/utils/api";
import { RichTextEditor } from "@/app/components/editor";

export default function ParticipantBaseDashboardForm({
  participantBaseData,
}: {
  participantBaseData: ApiParticipantBaseType;
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [isUnique, setIsUnique] = useState(true);

  const form = useForm({
    resolver: zodResolver(formParticipantSchema),
    defaultValues: {
      ...participantBaseData,
      userId: participantBaseData.userId || "",
      images: participantBaseData.images || [],
      slug: participantBaseData.slug || "",
      shortDescription: participantBaseData.shortDescription || "",
      description: participantBaseData.description || "",
      mapPlaceName: participantBaseData.mapPlaceName || "",
      mapId: participantBaseData.mapId || "",
      visitingHours: participantBaseData.visitingHours || [],
      phoneNumber: participantBaseData.phoneNumber || [],
      visibleWebsite: participantBaseData.visibleWebsite || [],
      visibleEmail: participantBaseData.visibleEmail || [],
      socialMedia: participantBaseData.socialMedia || {
        facebookLink: "",
        instagramLink: "",
        linkedinLink: "",
      },
    },
  });

  const onSubmit = (values: z.infer<typeof formParticipantSchema>) => {
    if (isUnique) {
      const cleanedValues = {
        ...values,
        phoneNumber: values.phoneNumber.filter(
          (phone) => phone && phone.trim() !== ""
        ),
        visibleEmail: values.visibleEmail.filter(
          (email) => email && email.trim() !== ""
        ),
        visibleWebsite: values.visibleWebsite.filter(
          (web) => web && web.trim() !== ""
        ),
        visitingHours: values.visitingHours.filter(
          (hours) => hours.date && hours.ranges && hours.label
        ),
        images: values.images.filter((image) => image && image.image_url),
      };

      console.log(cleanedValues);
      // Here you would typically send the data to your API
    }
  };

  const [debouncedSlug] = useDebounce(form.watch("slug"), 500);

  const checkSlug = useCallback(
    async (slug: string) => {
      if (typeof slug !== "string" || slug.trim() === "") {
        console.error("Invalid slug provided:", slug);
        return;
      }
      if (slug !== participantBaseData.slug) {
        setIsChecking(true);
        try {
          const data = await fetchSlugCheck(slug);
          setIsUnique(data.isUnique);
          if (!data.isUnique) {
            form.setError("slug", {
              type: "manual",
              message: "This slug is not unique, please choose another one.",
            });
          } else {
            form.clearErrors("slug");
          }
        } catch (error) {
          console.error("Error checking slug uniqueness:", error);
          form.setError("slug", {
            type: "manual",
            message: "Error checking slug uniqueness, please try again.",
          });
        } finally {
          setIsChecking(false);
        }
      }
    },
    [form, participantBaseData.slug]
  );

  useEffect(() => {
    checkSlug(debouncedSlug);
  }, [debouncedSlug, checkSlug]);

  return (
    <motion.div {...fadeInConfig}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 text-uiwhite"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Images
                      <span className="text-xs tracking-normal">
                        (Depending on your plan type, up to a maximum of 3.)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {field.value.slice(0, 3).map((image, index) => (
                          <div
                            key={image.image_url || index}
                            className="relative h-40 w-40 overflow-hidden rounded-lg"
                          >
                            {image && image.image_url ? (
                              <img
                                src={image.image_url}
                                alt={image.alt || `Image ${index + 1}`}
                                className="absolute inset-0 object-cover w-full h-full"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                                No Image
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                const newImages = field.value.filter(
                                  (_, i) => i !== index
                                );
                                form.setValue("images", newImages);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        {field.value.length < 3 && (
                          <Button
                            type="button"
                            onClick={() => {
                              if (field.value.length < 3) {
                                const newImage: ImageData = {
                                  image_url: `/placeholders/placeholder-${
                                    field.value.length + 1
                                  }.jpg`,
                                  alt: `Image ${field.value.length + 1}`,
                                  image_name: `placeholder-${
                                    field.value.length + 1
                                  }.jpg`,
                                };
                                form.setValue("images", [
                                  ...field.value,
                                  newImage,
                                ]);
                              }
                            }}
                            className="h-40 w-40 flex items-center justify-center"
                          >
                            Add image
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>{`Click "Add Image" to select up to 3 images for your profile.`}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">Slug</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="dashboard-input pr-10"
                          placeholder="your-slug"
                          {...field}
                        />
                        {isChecking && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></div>
                          </div>
                        )}
                        {!isChecking && isUnique && field.value && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg
                              className="h-5 w-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-uiwhite text-xs">
                      Only letters, numbers, and hyphens are allowed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Short Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="dashboard-input"
                        placeholder="Brief description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Description
                    </FormLabel>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-8">
              <FormField
                control={form.control}
                name="mapPlaceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Place Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Location Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visiting Hours</FormLabel>
                    <FormControl>
                      <VisitingHoursForm
                        value={field.value || []}
                        onChange={(
                          newValue: {
                            dayId: string;
                            label: string;
                            date: string | null;
                            ranges?:
                              | { open: string; close: string }[]
                              | undefined;
                          }[]
                        ) => field.onChange(newValue)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value.map((phone, index) => (
                          <Input
                            className="dashboard-input"
                            key={index}
                            placeholder="+1234567890"
                            value={phone}
                            onChange={(e) => {
                              const newPhones = [...field.value];
                              newPhones[index] = e.target.value;
                              field.onChange(newPhones);
                            }}
                          />
                        ))}
                        {field.value.length < 3 && (
                          <Button
                            type="button"
                            onClick={() => field.onChange([...field.value, ""])}
                            className="mt-2"
                          >
                            Add Phone
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibleEmail"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Visible Emails (Max 3)
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value.map((email, index) => (
                          <Input
                            className="dashboard-input"
                            key={index}
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => {
                              const newEmails = [...field.value];
                              newEmails[index] = e.target.value;
                              field.onChange(newEmails);
                            }}
                          />
                        ))}
                        {field.value.length < 3 && (
                          <Button
                            type="button"
                            onClick={() => field.onChange([...field.value, ""])}
                            className="mt-2"
                          >
                            Add Email
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-8">
              <FormField
                control={form.control}
                name="visibleWebsite"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Visible Websites (Max 3)
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {(field.value || []).map((web, index) => (
                          <Input
                            key={index}
                            className="dashboard-input"
                            placeholder="https://example.com"
                            value={web || ""}
                            onChange={(e) => {
                              const newWebs = [...(field.value || [])];
                              newWebs[index] = e.target.value;
                              field.onChange(newWebs);
                            }}
                          />
                        ))}
                        {(field.value || []).length < 3 && (
                          <Button
                            type="button"
                            onClick={() =>
                              field.onChange([...(field.value || []), ""])
                            }
                            className="mt-2"
                          >
                            Add Website
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialMedia.instagramLink"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Instagram Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="dashboard-input"
                        placeholder="https://instagram.com/yourusername"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialMedia.facebookLink"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Facebook Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="dashboard-input"
                        placeholder="https://facebook.com/yourusername"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialMedia.linkedinLink"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      LinkedIn Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="dashboard-input"
                        placeholder="https://linkedin.com/in/yourusername"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full hover:tracking-widest md:w-auto py-10 md:py-7 md:px-14 bg-uiwhite text-black font-bold hover:scale-110 hover:bg-uiwhite/80 transition-all"
          >
            Save Changes
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
