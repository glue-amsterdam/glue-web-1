import { Citizen } from "@/schemas/citizenSchema";

export const EMPTY_CITIZEN: Omit<Citizen, "id"> = {
  name: "",
  image_url: "",
  image_name: "",
  alt: "",
  description: "",
  section_id: "about-citizens-section-56ca13952fcc",
  year: "",
};
