import type {
  TextSectionAdminGroup,
  TextSectionSlug,
  TextSectionVariant,
} from "@/schemas/textSectionSchema";
import type { TextSectionData } from "./types";

type TextSectionDbRow = {
  slug: string;
  admin_group: string;
  variant: string;
  title: string;
  description: string;
  show_button: boolean;
  button_label: string | null;
  button_link: string | null;
  section_id: string;
};

export const mapTextSectionFromRow = (row: TextSectionDbRow): TextSectionData => ({
  slug: row.slug as TextSectionSlug,
  adminGroup: row.admin_group as TextSectionAdminGroup,
  variant: row.variant as TextSectionVariant,
  title: row.title,
  description: row.description,
  showButton: row.show_button,
  buttonLabel: row.button_label,
  buttonLink: row.button_link,
  sectionId: row.section_id,
});

export const mapTextSectionToRow = (
  slug: TextSectionSlug,
  data: {
    title: string;
    description: string;
    show_button: boolean;
    button_label: string | null;
    button_link: string | null;
  }
) => ({
  slug,
  title: data.title,
  description: data.description,
  show_button: data.show_button,
  button_label: data.show_button ? data.button_label : null,
  button_link: data.show_button ? data.button_link : null,
  updated_at: new Date().toISOString(),
});
