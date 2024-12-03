import CuratedMembersForm from "@/app/admin/forms/curated-members-form";
import { fetchAboutCurated } from "@/utils/api/admin-api-calls";

export default async function AboutCuratedSection() {
  const curatedData = await fetchAboutCurated();

  return <CuratedMembersForm initialData={curatedData} />;
}
