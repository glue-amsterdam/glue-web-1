import { createVisitorToken } from "@/lib/visitor/create-visitor-token";
import { createAdminClient } from "@/utils/supabase/adminClient";

export type VisitorDataRow = {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  display_name: string | null;
  birth_date: string | null;
  area_id: string | null;
};

export type EnsureVisitorHints = {
  email?: string | null;
  displayName?: string | null;
  userName?: string | null;
};

const VISITOR_SELECT =
  "id, auth_user_id, email, first_name, last_name, full_name, display_name, birth_date, area_id";

const splitDisplayName = (name: string): { firstName: string; lastName: string } => {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: "Visitor", lastName: "" };
  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? "Visitor";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

const resolveNames = (hints: EnsureVisitorHints) => {
  const source =
    hints.displayName?.trim() ||
    hints.userName?.trim() ||
    "";
  if (source) {
    const { firstName, lastName } = splitDisplayName(source);
    return {
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
    };
  }

  const email = hints.email?.trim() ?? "";
  const local = email.includes("@") ? email.split("@")[0] : "visitor";
  return { firstName: local, lastName: "", fullName: local };
};

const normalizeEmail = (
  authEmail?: string | null,
  hints?: EnsureVisitorHints
): string => {
  const email = (authEmail?.trim() || hints?.email?.trim() || "").toLowerCase();
  if (!email) {
    throw new Error(
      "A verified email is required on your account before check-in can be set up."
    );
  }
  return email;
};

const fetchVisitorByAuthUserId = async (
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  authUserId: string
) => {
  const { data, error } = await admin
    .from("visitor_data")
    .select(VISITOR_SELECT)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as VisitorDataRow | null;
};

const fetchVisitorByEmail = async (
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  email: string
) => {
  const { data, error } = await admin
    .from("visitor_data")
    .select(VISITOR_SELECT)
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as VisitorDataRow | null;
};

const linkVisitorToAuthUser = async (
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  row: VisitorDataRow,
  authUserId: string,
  hints: EnsureVisitorHints,
  normalizedEmail: string
) => {
  const { firstName, lastName, fullName } = resolveNames(hints);

  const payload: Record<string, string | null> = {
    auth_user_id: authUserId,
    email: normalizedEmail,
  };

  if (!row.first_name?.trim()) payload.first_name = firstName;
  if (!row.last_name?.trim() && lastName) payload.last_name = lastName;
  if (!row.full_name?.trim()) payload.full_name = fullName;

  const { data: updated, error } = await admin
    .from("visitor_data")
    .update(payload)
    .eq("id", row.id)
    .select(VISITOR_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return updated as VisitorDataRow;
};

const insertVisitorRow = async (
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  authUserId: string,
  normalizedEmail: string,
  hints: EnsureVisitorHints
) => {
  const { firstName, lastName, fullName } = resolveNames(hints);

  const { data: inserted, error: insertError } = await admin
    .from("visitor_data")
    .insert({
      auth_user_id: authUserId,
      email: normalizedEmail,
      first_name: firstName,
      last_name: lastName || null,
      full_name: fullName,
      visitor_token: createVisitorToken(),
    })
    .select(VISITOR_SELECT)
    .single();

  if (!insertError) {
    return inserted as VisitorDataRow;
  }

  if (insertError.code === "23505") {
    const byAuth = await fetchVisitorByAuthUserId(admin, authUserId);
    if (byAuth) return byAuth;

    const byEmail = await fetchVisitorByEmail(admin, normalizedEmail);
    if (byEmail) {
      return linkVisitorToAuthUser(admin, byEmail, authUserId, hints, normalizedEmail);
    }
  }

  throw new Error(insertError.message);
};

export const ensureVisitorDataForAuthUser = async (
  authUserId: string,
  hints: EnsureVisitorHints = {},
  authEmail?: string | null
): Promise<VisitorDataRow> => {
  const admin = await createAdminClient();
  const normalizedEmail = normalizeEmail(authEmail, hints);

  const existingByAuth = await fetchVisitorByAuthUserId(admin, authUserId);
  if (existingByAuth) {
    return existingByAuth;
  }

  const existingByEmail = await fetchVisitorByEmail(admin, normalizedEmail);
  if (existingByEmail) {
    return linkVisitorToAuthUser(
      admin,
      existingByEmail,
      authUserId,
      hints,
      normalizedEmail
    );
  }

  return insertVisitorRow(admin, authUserId, normalizedEmail, hints);
};

export const loadVisitorHintsForAuthUser = async (
  authUserId: string,
  email?: string | null
): Promise<EnsureVisitorHints> => {
  const admin = await createAdminClient();

  const [userInfoRes, participantRes] = await Promise.all([
    admin
      .from("user_info")
      .select("user_name")
      .eq("user_id", authUserId)
      .maybeSingle(),
    admin
      .from("participant_details")
      .select("display_name")
      .eq("user_id", authUserId)
      .maybeSingle(),
  ]);

  return {
    email,
    userName: userInfoRes.data?.user_name ?? null,
    displayName: participantRes.data?.display_name ?? null,
  };
};
