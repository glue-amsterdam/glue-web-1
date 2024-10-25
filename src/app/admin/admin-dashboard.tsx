"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainSectionForm from "./forms/main-section-form";
import AboutSectionForm from "./forms/about-section-form";
import { mainSection } from "@/lib/mockMain";
import { mockAbout } from "@/lib/mockAbout";

// Definimos los esquemas para validación
const mainSectionSchema = z.object({
  mainColors: z.object({
    box1: z.string(),
    box2: z.string(),
    box3: z.string(),
    box4: z.string(),
    triangle: z.string(),
  }),
  mainMenu: z.array(
    z.object({
      label: z.string(),
      section: z.string(),
      className: z.string(),
    })
  ),
  mainLinks: z.record(
    z.object({
      link: z.string().url(),
      icon: z.string(),
    })
  ),
});

const citizenSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  image: z.object({
    id: z.string(),
    src: z.string().url("Invalid image URL"),
    alt: z.string(),
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  year: z.number().int().min(1900).max(2100),
});

const citizensSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  citizens: z.array(citizenSchema),
});

const participantsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const carouselSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  slides: z
    .array(
      z.object({
        id: z.string(),
        src: z.string().url("Invalid image URL"),
        alt: z.string(),
      })
    )
    .min(1, "At least 1 slide is required")
    .max(15, "Maximum 15 slides allowed"),
});

const curatedMembersSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});
const infoItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  infoItems: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        image: z.object({
          id: z.string(),
          src: z.string().url("Invalid image URL"),
          alt: z.string(),
        }),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters"),
      })
    )
    .min(3, "At least 1 info item is required")
    .max(3, "Maximum 2 info items allowed"),
});
const pressItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pressItems: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        image: z.object({
          id: z.string(),
          src: z.string().url("Invalid image URL"),
          alt: z.string(),
        }),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters"),
        content: z.string().min(10, "Content must be at least 10 characters"),
      })
    )
    .min(1, "At least 1 press item is required")
    .max(2, "Maximum 2 press items allowed"),
});

const glueInternationalSectionSchema = z.object({
  buttonColor: z
    .string()
    .min(1, "Button color is required")
    .regex(
      /^#(?:[0-9a-fA-F]{3}){1,2}$/,
      "Button color must be a valid hex code"
    ),
});

const sponsorsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  sponsors: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        logo: z.object({
          id: z.string(),
          src: z.string().url("Invalid image URL"),
          alt: z.string(),
        }),
        website: z.string().url("Invalid website URL"),
        sponsorT: z.string().min(1, "Sponsor type is required"),
      })
    )
    .min(1, "At least 1 sponsor is required")
    .max(5, "Maximum 5 sponsors allowed"),
});

const adminFormSchema = z.object({
  mainSection: mainSectionSchema,
  aboutSection: z.object({
    carouselSection: carouselSectionSchema,
    participantsSection: participantsSectionSchema,
    citizensSection: citizensSectionSchema,
    curatedMembersSection: curatedMembersSectionSchema,
    infoItemsSection: infoItemsSectionSchema,
    pressItemsSection: pressItemsSectionSchema,
    glueInternationalSection: glueInternationalSectionSchema,
    sponsorsSection: sponsorsSectionSchema,
  }),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const methods = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      mainSection: mainSection,
      aboutSection: mockAbout,
    },
  });

  const onSubmit = (data: AdminFormData) => {
    /* Validation in changes */
    const changedData: Partial<AdminFormData> = {};

    /*  validate changes mainSection */
    if (JSON.stringify(data.mainSection) !== JSON.stringify(mainSection)) {
      changedData.mainSection = data.mainSection;
    }

    /* validate changes aboutSection */
    if (JSON.stringify(data.aboutSection) !== JSON.stringify(mockAbout)) {
      changedData.aboutSection = data.aboutSection;
    }

    console.log("Data changed:", changedData);
    alert("ALl the data has been modifyed successfully!");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mt-8 bg-white rounded-lg shadow-lg p-6"
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          Admin Panel
        </h2>
        <Tabs defaultValue="main-section" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="main-section" className="text-lg">
              Main Section
            </TabsTrigger>
            <TabsTrigger value="about-section" className="text-lg">
              About Section
            </TabsTrigger>
          </TabsList>
          <TabsContent value="main-section">
            <MainSectionForm />
          </TabsContent>
          <TabsContent value="about-section">
            <AboutSectionForm />
          </TabsContent>
        </Tabs>
        <div className="mt-8 flex justify-between">
          <Button type="submit" className="bg-green-500 hover:bg-green-600">
            Save Changes
          </Button>
          <Button
            type="button"
            className="bg-red-500 hover:bg-red-600"
            onClick={() => setIsLoggedIn(false)}
          >
            Log out
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
