import { BASE_URL } from "@/constants";
import {
  PressItemsSectionContent,
  pressItemsSectionSchema,
} from "@/schemas/pressSchema";

export const DEFAULT_PRESS_ITEMS: PressItemsSectionContent = {
  title: "Press",
  description:
    "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
  pressItems: [
    {
      id: "glue-tv",
      title: "GLUE TV",

      image_url: `/placeholder.jpg`,

      description: `The third edition of GLUE TV was recorded in the studio of Pakhuis de Zwijger, the platform for social innovation & creation in Amsterdam. GLUE TV focussed this year on members that were invited to explore the definition of design, and stretch its limits a bit; the so called STICKY members. But we used the platform also to interview GLUE’s Creative Citizens of Honour: Wouter Valkenier, Marian Duff and Janine Toussaint. Due to the storm Poly some interviews took place online.
    
    As part of the ‘Stretching the Definition of Design’ theme, Rubiah Balsem, Jeroen Junte, Gabrielle Kennedy, and Marsha Simon interviewed, amongst them: Georgie Frankel, Yamuna Forzani, Shahar Livne, Chen Yu Wang and Rink Schelling. Bas de Groot was in charge of editing. In the run-up to the design route in September, you can watch them via SALTO TV.
    
    Get inspired and check out all interviews on Youtube or SALTO TV.`,
      isVisible: true,
    },
    {
      id: "glue-press",
      title: "Press",
      image_url: `/placeholder.jpg`,
      description: `Please contact Karin Dijksman for the most recent press release,
          high-res images and other press enquires.
          Dijksman Communicatie
          Westerstraat 187 (2nd floor), Amsterdam
          Karin Dijksman
          karin@dijksmancommunicatie.nl
          06 3100 6880`,
      isVisible: true,
    },
  ],
};

export async function fetchPressSection(): Promise<PressItemsSectionContent> {
  try {
    const res = await fetch(`${BASE_URL}/about/press`, {
      next: {
        revalidate: 3600,
        tags: ["press-section"],
      },
    });

    if (!res.ok) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PHASE === "phase-production-build"
      ) {
        console.log("Build environment detected, using mock data");
        return getMockData();
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: PressItemsSectionContent = await res.json();
    const validatedData = pressItemsSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching press section:", error);
    return getMockData();
  }
}

export function getMockData(): PressItemsSectionContent {
  return DEFAULT_PRESS_ITEMS;
}
