import MainMenuForm from "@/app/admin/forms/main-menu-form";
import { fetchMainSection } from "@/utils/api/admin-api-calls";

export default async function MainMenuSection() {
  const mainSectionData = await fetchMainSection();

  return <MainMenuForm initialData={{ mainMenu: mainSectionData }} />;
}
