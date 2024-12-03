import MainLinksForm from "@/app/admin/forms/main-links-form";
import { fetchMainLinks } from "@/lib/admin/main/fetch-main-links";

export default async function MainLinksSection() {
  const mainLinks = await fetchMainLinks();

  return <MainLinksForm initialData={{ mainLinks }} />;
}
