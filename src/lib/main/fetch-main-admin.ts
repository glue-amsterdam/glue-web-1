import {
  dbRowToMainColorsForm,
  mainColorsFormToDbRow,
} from "@/lib/main/map-main-colors-row";
import {
  LinkItemAdmin,
  MainColorsFormData,
  MainLinksAdmin,
  MainMenuData,
  mainLinksAdminSchema,
  mainColorsFormSchema,
  pressKitLinksFormSchema,
  pressKitLinksSchema,
} from "@/schemas/mainSchema";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const fetchMainColors = async (
  supabase?: SupabaseClient
): Promise<MainColorsFormData> => {
  const client = supabase ?? (await createClient());
  const { data: mainColors, error } = await client
    .from("main_colors")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error("Failed to fetch main colors");
  }

  return dbRowToMainColorsForm(mainColors);
};

export const updateMainColors = async (
  input: MainColorsFormData,
  supabase?: SupabaseClient
): Promise<MainColorsFormData> => {
  const client = supabase ?? (await createClient());
  const validated = mainColorsFormSchema.parse(input);
  const dbRow = mainColorsFormToDbRow(validated);

  const { data, error } = await client
    .from("main_colors")
    .update(dbRow)
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update main colors");
  }

  return dbRowToMainColorsForm(data);
};

export const fetchMainMenu = async (
  supabase?: SupabaseClient
): Promise<MainMenuData> => {
  const client = supabase ?? (await createClient());
  const { data: mainMenu, error } = await client.from("main_menu").select("*");

  if (error || !mainMenu?.length) {
    throw new Error("Failed to fetch main menu");
  }

  const parsedMainMenu = mainMenu.map((item) => ({
    ...item,
    subItems: item.subItems ? JSON.parse(item.subItems) : null,
  }));

  return { mainMenu: parsedMainMenu };
};

export const updateMainMenu = async (
  input: MainMenuData,
  supabase?: SupabaseClient
): Promise<MainMenuData> => {
  const client = supabase ?? (await createClient());
  const { mainMenu } = input;

  const updates = mainMenu.map(
    (item: {
      menu_id: string;
      label: string;
      section: string;
      className: string;
      subItems?: Array<{
        href: string;
        title: string;
        is_visible: boolean;
        place: number;
      }> | null;
    }) => ({
      menu_id: item.menu_id,
      label: item.label,
      section: item.section,
      className: item.className,
      subItems: item.subItems ? JSON.stringify(item.subItems) : null,
    })
  );

  const { data, error } = await client
    .from("main_menu")
    .upsert(updates, { onConflict: "menu_id" })
    .select();

  if (error) {
    throw new Error("Failed to update main menu");
  }

  const parsedData = data.map((item) => ({
    ...item,
    subItems: item.subItems ? JSON.parse(item.subItems) : null,
  }));

  return { mainMenu: parsedData };
};

export const fetchMainLinksAdmin = async (
  supabase?: SupabaseClient
): Promise<MainLinksAdmin> => {
  const client = supabase ?? (await createClient());
  const { data: mainLinks, error } = await client
    .from("main_links")
    .select("*")
    .order("id");

  if (error) {
    throw new Error("Failed to fetch main links");
  }

  const linksWithoutId = mainLinks.map(({ platform, link }) => ({
    platform,
    link,
  }));

  return mainLinksAdminSchema.parse({ mainLinks: linksWithoutId });
};

export const updateMainLinksAdmin = async (
  input: MainLinksAdmin,
  supabase?: SupabaseClient
): Promise<MainLinksAdmin> => {
  const client = supabase ?? (await createClient());
  const validatedData = mainLinksAdminSchema.parse(input);
  const mainLinks = validatedData.mainLinks;

  const updatePromises = mainLinks.map(async (link: LinkItemAdmin) => {
    const { data, error } = await client
      .from("main_links")
      .update({ link: link.link?.trim() ?? "" })
      .eq("platform", link.platform)
      .select();

    if (error) {
      throw error;
    }
    return data[0];
  });

  const updatedLinks = await Promise.all(updatePromises);

  return mainLinksAdminSchema.parse({ mainLinks: updatedLinks });
};

export const fetchPressKitLinksAdmin = async (
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const { data: pressKitLinks, error } = await client
    .from("press_kit_links")
    .select("*")
    .order("id");

  if (error) {
    throw new Error("Failed to fetch press kit links");
  }

  return pressKitLinksSchema.parse({ pressKitLinks });
};

export const updatePressKitLinksAdmin = async (
  input: { pressKitLinks: { id: number; link: string; description?: string | null }[] },
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const validatedData = pressKitLinksFormSchema.parse(input);
  const pressKitLinks = validatedData.pressKitLinks;

  const updatePromises = pressKitLinks.map(async (link) => {
    const { data, error } = await client
      .from("press_kit_links")
      .update({
        link: link.link,
        description: link.description,
      })
      .eq("id", link.id)
      .select();

    if (error) {
      throw error;
    }
    return data[0];
  });

  const updatedLinks = await Promise.all(updatePromises);

  return pressKitLinksSchema.parse({ pressKitLinks: updatedLinks });
};

export const createPressKitLink = async (
  input: { link?: string; description?: string | null },
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const newLinkData = {
    link: input.link || "",
    description: input.description || null,
  };

  const { data, error } = await client
    .from("press_kit_links")
    .insert([newLinkData])
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create press kit link");
  }

  return data;
};

export const deletePressKitLink = async (
  id: string,
  supabase?: SupabaseClient
) => {
  const client = supabase ?? (await createClient());
  const { error } = await client.from("press_kit_links").delete().eq("id", id);

  if (error) {
    throw new Error("Failed to delete press kit link");
  }
};
