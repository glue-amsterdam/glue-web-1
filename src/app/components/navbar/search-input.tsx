"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  searchData: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function SearchInput() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      searchData: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    router.push(`/search?query=${data.searchData}`);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex justify-center items-center"
      >
        <FormField
          control={form.control}
          name="searchData"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  className="bg-gray text-black rounded-none"
                  placeholder="Search..."
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
