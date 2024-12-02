import MainLinksForm from "@/app/admin/forms/main-links-form";
import { fetchMainLinks } from "@/utils/api/admin-api-calls";

export default async function MainLinksSection() {
  const mainLinks = await fetchMainLinks();

  return <MainLinksForm initialData={{ mainLinks }} />;
}
