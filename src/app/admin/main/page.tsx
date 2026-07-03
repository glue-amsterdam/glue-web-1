import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import {
  fetchMainColors,
  fetchMainLinksAdmin,
  fetchMainMenu,
  fetchPressKitLinksAdmin,
} from "@/lib/main/fetch-main-admin";
import { getParticipantPlaceholderUrl } from "@/lib/participants/get-participant-placeholder-url";
import MainColorsForm from "@/components/admin/main/MainColorsForm";
import MainMenuForm from "@/components/admin/main/MainMenuForm";
import MainLinksForm from "@/components/admin/main/MainLinksForm";
import MainPressKitForm from "@/components/admin/main/MainPressKitForm";
import MainParticipantPlaceholderForm from "@/components/admin/main/MainParticipantPlaceholderForm";
import { createClient } from "@/utils/supabase/server";

export default async function MainAdminPage() {
  await getAdminSupabaseOrRedirect();
  const supabase = await createClient();

  const [mainColors, mainMenu, mainLinks, pressKitLinks, placeholderUrl] =
    await Promise.all([
      fetchMainColors(),
      fetchMainMenu(),
      fetchMainLinksAdmin(),
      fetchPressKitLinksAdmin(),
      getParticipantPlaceholderUrl(supabase),
    ]);

  return (
    <div className="flex flex-col gap-[15px] lg:gap-[30px]">
      <MainColorsForm initialData={mainColors} />
      <MainParticipantPlaceholderForm initialPlaceholderUrl={placeholderUrl} />
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
