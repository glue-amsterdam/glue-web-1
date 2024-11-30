import CuratedMembersForm from "@/app/admin/forms/curated-members-form";
import { fetchAboutCurated } from "@/utils/api/admin-api-calls";

export default async function AboutCuratedSection() {
  const curatedData = await fetchAboutCurated();

  console.log("curatedData:", curatedData);
  return <CuratedMembersForm initialData={curatedData} />;
}
