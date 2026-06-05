import { getNavbarIdentity } from "@/lib/users/get-navbar-identity";
import { createClient } from "@/utils/supabase/server";

import { NavBarClient } from "./navbar/navbar-client";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialIdentity = user ? await getNavbarIdentity(user.id) : null;

  return <NavBarClient initialIdentity={initialIdentity} />;
}
