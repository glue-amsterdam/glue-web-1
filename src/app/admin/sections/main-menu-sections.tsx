import MainMenuForm from "@/app/admin/forms/main-menu-form";
import { fetchMainMenu } from "@/lib/admin/main/fetch-main-menu";

export default async function MainMenuSection() {
  const mainSectionData = await fetchMainMenu();

  return <MainMenuForm initialData={mainSectionData} />;
}
