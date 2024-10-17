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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { hourLimits } from "@/utils/hourLimits";

const formSchema = z.object({
  images: z.array(z.string().url()).max(3, "You can upload up to 3 images"),
  slug: z
    .string()
    .regex(/^[a-zA-Z-]+$/, "Slug can only contain letters and hyphens"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortDescription: z
    .string()
    .max(200, "Short description must be less than 200 characters"),
  description: z.string(),
  address: z.string(),
  visitingHours: z.record(z.array(z.string())),
  phoneNumber: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number"),
  visibleEmails: z
    .array(z.string().email())
    .max(3, "You can add up to 3 email addresses"),
  visibleWebs: z.array(z.string().url()).max(3, "You can add up to 3 websites"),
  socialMedia: z.object({
    instagramLink: z.string().url().optional(),
    facebookLink: z.string().url().optional(),
    linkedinLink: z.string().url().optional(),
  }),
});

export default function MemberDataForm() {
  const params = useSearchParams();
  const section = params.get("section");
  console.log(section);
  const [images, setImages] = useState<string[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
      slug: "",
      name: "",
      shortDescription: "",
      description: "",
      address: "",
      visitingHours: {} as Record<string, string[]>,
      phoneNumber: "",
      visibleEmails: [""],
      visibleWebs: [""],
      socialMedia: {},
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <motion.div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images (Max 3)</FormLabel>
                <FormControl>
                  <div className="flex space-x-2">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Uploaded ${index + 1}`}
                        className="w-20 h-20 object-cover"
                      />
                    ))}
                    {images.length < 3 && (
                      <Button
                        type="button"
                        onClick={() => {
                          const newImage = `/placeholder.svg?height=80&width=80`;
                          setImages([...images, newImage]);
                          field.onChange([...images, newImage]);
                        }}
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
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="your-slug" {...field} />
                </FormControl>
                <FormDescription>
                  Only letters and hyphens are allowed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
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
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief description" {...field} />
                </FormControl>
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
                  <Textarea placeholder="The description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Your Address" {...field} />
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
                  <div className="space-y-2">
                    {["Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${day}-open`}
                          checked={
                            field.value[day as keyof typeof field.value] !==
                            undefined
                          }
                          onCheckedChange={(checked) => {
                            const newValue = { ...field.value };
                            if (checked) {
                              newValue[day as keyof typeof newValue] = [
                                "09:00 - 17:00",
                              ];
                            } else {
                              delete newValue[day as keyof typeof newValue];
                            }
                            field.onChange(newValue);
                          }}
                        />
                        <label htmlFor={`${day}-open`}>{day}</label>
                        {field.value[day as keyof typeof field.value] && (
                          <Select
                            onValueChange={(value) => {
                              const newValue = { ...field.value };
                              newValue[day as keyof typeof newValue] = [value];
                              field.onChange(newValue);
                            }}
                            defaultValue={
                              field.value[day as keyof typeof field.value]?.[0]
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select hours" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourLimits.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibleEmails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visible Emails (Max 3)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value.map((email, index) => (
                      <Input
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

          <FormField
            control={form.control}
            name="visibleWebs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visible Websites (Max 3)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value.map((web, index) => (
                      <Input
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
              <FormItem>
                <FormLabel>Instagram Link</FormLabel>
                <FormControl>
                  <Input
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
              <FormItem>
                <FormLabel>Facebook Link</FormLabel>
                <FormControl>
                  <Input
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
              <FormItem>
                <FormLabel>LinkedIn Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://linkedin.com/in/yourusername"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </motion.div>
  );
}
