import MainColorsForm from "@/app/admin/forms/main-colors-form";
import { fetchColors } from "@/utils/api/admin-api-calls";

export default async function MainColorsSection() {
  const mainColors = await fetchColors();

  return <MainColorsForm initialData={mainColors} />;
}
