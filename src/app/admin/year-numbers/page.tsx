import { redirect } from "next/navigation";

export default function YearNumbersAdminPage() {
  redirect("/admin/yearly-content?section=year-numbers");
}
