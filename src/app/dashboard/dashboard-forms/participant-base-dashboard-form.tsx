"use client";

import { useState } from "react";
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
  VisitingHoursType,
} from "@/schemas/usersSchemas";

export default function ParticipantBaseDashboardForm({
  participantBaseData,
}: {
  participantBaseData: ApiParticipantBaseType;
}) {
  console.log(participantBaseData);
  const [images, setImages] = useState<string[]>(
    participantBaseData.images.map((img) => img.imageUrl)
  );
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
      socialMedia: participantBaseData.socialMedia || {
        facebookLink: "",
        instagramLink: "",
        linkedinLink: "",
      },
      visibleEmail: participantBaseData.visibleEmail || [],
    },
  });

  function onSubmit(values: z.infer<typeof formParticipantSchema>) {
    const cleanedValues = {
      ...values,
      phoneNumber: values.phoneNumber.filter((phone) => phone.trim() !== ""),
      visibleEmail: values.visibleEmail.filter((email) => email.trim() !== ""),
      visibleWebsite: values.visibleWebsite.filter((web) => web.trim() !== ""),
    };

    console.log(cleanedValues);
  }
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
                      Images (Max 3)
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-4">
                        {images.map((image, index) => (
                          <div
                            key={index + image}
                            className="relative h-40 w-40 overflow-hidden rounded-lg"
                          >
                            <img
                              src={image}
                              alt={`Uploaded ${index + 1}`}
                              className="absolute inset-0 object-cover w-full h-full"
                            />
                          </div>
                        ))}
                        {images.length < 3 && (
                          <Button
                            type="button"
                            onClick={() => {
                              const newImage = `/placeholders/user-placeholder-1.jpg`;
                              setImages([...images, newImage]);
                              field.onChange([...images, newImage]);
                            }}
                            className="h-40 w-40 flex items-center justify-center"
                          >
                            Add Image
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
                name="slug"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">Slug</FormLabel>
                    <FormControl>
                      <Input
                        className="dashboard-input"
                        placeholder="your-slug"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-uiwhite text-xs">
                      Only letters, numbers, and hyphens are allowed
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
            </div>

            <div className="space-y-8">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="dashboard-form-item">
                    <FormLabel className="dashboard-label">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="dashboard-input"
                        placeholder="The description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        value={field.value}
                        onChange={(newValue: VisitingHoursType) =>
                          field.onChange(newValue)
                        }
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
                        {field.value.map((web, index) => (
                          <Input
                            className="dashboard-input"
                            key={index}
                            placeholder="https://example.com"
                            value={web}
                            onChange={(e) => {
                              const newWebs = [...field.value];
                              newWebs[index] = e.target.value;
                              field.onChange(newWebs);
                            }}
                          />
                        ))}
                        {field.value.length < 3 && (
                          <Button
                            type="button"
                            onClick={() => field.onChange([...field.value, ""])}
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

          <Button type="submit" className="w-full md:w-auto">
            Save Changes
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
