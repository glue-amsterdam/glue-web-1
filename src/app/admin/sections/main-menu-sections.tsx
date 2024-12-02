import MainMenuForm from "@/app/admin/forms/main-menu-form";
import { MainMenuData } from "@/schemas/mainSchema";
import { fetchMenuLinksSection } from "@/utils/api/admin-api-calls";

export default async function MainMenuSection() {
  const mainSectionData: MainMenuData = await fetchMenuLinksSection();

  return <MainMenuForm initialData={mainSectionData} />;
}
