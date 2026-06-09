import { redirect } from "next/navigation";

export default function CitizensOfHonourAdminPage() {
  redirect("/admin/yearly-content?section=citizens");
}
