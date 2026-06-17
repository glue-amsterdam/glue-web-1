import { createClient } from "@/utils/supabase/server";

import { getNavbarIdentity, type NavbarIdentity } from "./get-navbar-identity";

export async function getNavbarInitialIdentity(): Promise<NavbarIdentity | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getNavbarIdentity(user.id);
}
