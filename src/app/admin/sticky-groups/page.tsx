import { redirect } from "next/navigation";

export default function StickyGroupsAdminPage() {
  redirect("/admin/yearly-content?section=sticky");
}
