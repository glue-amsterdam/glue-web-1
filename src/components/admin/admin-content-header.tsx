"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getAdminPageTitle } from "@/constants/admin-navigation";

export const AdminContentHeaderTitle = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageTitle = getAdminPageTitle(pathname, searchParams);

  return <h2 className="title-text text-zinc-900">{pageTitle}</h2>;
};
