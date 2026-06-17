import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import {
  fetchMainColors,
  fetchMainLinksAdmin,
  fetchMainMenu,
  fetchPressKitLinksAdmin,
} from "@/lib/main/fetch-main-admin";
import MainColorsForm from "@/components/admin/main/MainColorsForm";
import MainMenuForm from "@/components/admin/main/MainMenuForm";
import MainLinksForm from "@/components/admin/main/MainLinksForm";
import MainPressKitForm from "@/components/admin/main/MainPressKitForm";

export default async function MainAdminPage() {
  await getAdminSupabaseOrRedirect();

  const [mainColors, mainMenu, mainLinks, pressKitLinks] = await Promise.all([
    fetchMainColors(),
    fetchMainMenu(),
    fetchMainLinksAdmin(),
    fetchPressKitLinksAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-[15px] lg:gap-[30px]">
      <MainColorsForm initialData={mainColors} />
      <MainMenuForm initialData={mainMenu} />
      <MainLinksForm initialData={mainLinks} />
      {pressKitLinks.pressKitLinks && (
        <MainPressKitForm
          initialData={{ pressKitLinks: pressKitLinks.pressKitLinks }}
        />
      )}
    </div>
  );
}
