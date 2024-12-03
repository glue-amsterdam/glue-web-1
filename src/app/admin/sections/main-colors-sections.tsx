import MainColorsForm from "@/app/admin/forms/main-colors-form";
import { fetchColors } from "@/lib/admin/main/fetch-colors";

export default async function MainColorsSection() {
  const mainColors = await fetchColors();

  return <MainColorsForm initialData={mainColors} />;
}
