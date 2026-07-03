import { z } from "zod";

const ALLOWED_RETURN_PATH_PREFIXES = [
  "/program",
  "/map",
  "/exhibitors",
  "/dashboard",
] as const;

const RETURN_TO_PARAM = "returnTo";
const CANCEL_TO_PARAM = "cancelTo";
export const EMAIL_PARAM = "email";
export const SIGNUP_SOURCE_PARAM = "signupSource";

export const SIGNUP_SOURCES = ["restricted", "visitor"] as const;
export type SignupSource = (typeof SIGNUP_SOURCES)[number];

const PLANS_SELECTION_HASH = "#plans-selection-section";

const AUTH_CANCEL_PATH_KEY = "glue-auth-cancel-path";
const BLOCKED_CANCEL_PATH_PREFIXES = [
  "/sign-up",
  "/login",
  "/account",
  "/admin",
] as const;

const emailSchema = z.string().trim().email();

const getPathnameFromReturnTo = (returnTo: string): string => {
  const withoutHash = returnTo.split("#")[0] ?? returnTo;
  return withoutHash.split("?")[0] ?? withoutHash;
};

export const isAllowedReturnPathname = (pathname: string): boolean =>
  ALLOWED_RETURN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );

export const isSafeReturnTo = (returnTo: string | null): returnTo is string => {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return false;
  }

  if (returnTo.includes(":")) {
    return false;
  }

  return isAllowedReturnPathname(getPathnameFromReturnTo(returnTo));
};

export const normalizeReturnTo = (returnTo: string): string => {
  const withoutHash = returnTo.split("#")[0] ?? returnTo;
  const [pathname, ...queryParts] = withoutHash.split("?");
  const query = queryParts.join("?");
  return query ? `${pathname}?${query}` : pathname;
};

export const normalizeCancelTo = (cancelTo: string): string => {
  const hashIndex = cancelTo.indexOf("#");
  const hash = hashIndex >= 0 ? cancelTo.slice(hashIndex) : "";
  const beforeHash = hashIndex >= 0 ? cancelTo.slice(0, hashIndex) : cancelTo;
  const normalizedPath = normalizeReturnTo(beforeHash);
  return `${normalizedPath}${hash}`;
};

export const captureCurrentCancelPath = (): string => {
  if (typeof window === "undefined") {
    return "/";
  }

  return (
    window.location.pathname +
    window.location.search +
    window.location.hash
  );
};

export const persistAuthCancelPath = (path?: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const value = normalizeCancelTo(path ?? captureCurrentCancelPath());
  if (!isSafeCancelTo(value)) {
    return;
  }

  sessionStorage.setItem(AUTH_CANCEL_PATH_KEY, value);
};

export const readPersistedAuthCancelPath = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(AUTH_CANCEL_PATH_KEY);
  if (!raw || !isSafeCancelTo(raw)) {
    return null;
  }

  return normalizeCancelTo(raw);
};

export const resolveCancelTo = (paramCancelTo: string | null): string | null => {
  const persisted = readPersistedAuthCancelPath();
  const fromParam =
    paramCancelTo && isSafeCancelTo(paramCancelTo)
      ? normalizeCancelTo(paramCancelTo)
      : null;

  if (fromParam?.includes("#")) {
    return fromParam;
  }

  if (fromParam && persisted) {
    const paramPath = getPathnameFromReturnTo(fromParam);
    const persistedPath = getPathnameFromReturnTo(persisted);

    if (paramPath === persistedPath && persisted.includes("#")) {
      return persisted;
    }

    return fromParam;
  }

  return fromParam ?? persisted;
};

export const captureReturnPath = (
  pathname: string,
  search: string,
): string | null => {
  if (!isAllowedReturnPathname(pathname)) {
    return null;
  }

  return search ? `${pathname}${search}` : pathname;
};

export const resolvePostAuthRedirect = (returnTo: string | null): string => {
  if (!returnTo) {
    return "/";
  }

  const normalized = normalizeReturnTo(returnTo);
  return isSafeReturnTo(normalized) ? normalized : "/";
};

export const isSafeCancelTo = (cancelTo: string | null): cancelTo is string => {
  if (!cancelTo || !cancelTo.startsWith("/") || cancelTo.startsWith("//")) {
    return false;
  }

  if (cancelTo.includes(":")) {
    return false;
  }

  const pathname = getPathnameFromReturnTo(cancelTo);
  return !BLOCKED_CANCEL_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};

export const captureCancelPathFromReferer = (
  referer: string | null,
  origin: string,
  returnPath: string | null,
): string | null => {
  if (!referer) {
    return null;
  }

  try {
    const url = new URL(referer);
    if (url.origin !== origin) {
      return null;
    }

    const cancelPath = `${url.pathname}${url.search}${url.hash}`;

    if (!isSafeCancelTo(cancelPath)) {
      return null;
    }

    if (returnPath && normalizeReturnTo(cancelPath) === normalizeReturnTo(returnPath)) {
      return null;
    }

    return cancelPath;
  } catch {
    return null;
  }
};

const appendCancelToParam = (
  params: URLSearchParams,
  cancelTo: string | null | undefined,
): void => {
  if (cancelTo && isSafeCancelTo(cancelTo)) {
    params.set(CANCEL_TO_PARAM, normalizeCancelTo(cancelTo));
  }
};

const appendReturnToParam = (
  params: URLSearchParams,
  returnTo: string | null | undefined,
): void => {
  if (returnTo && isSafeReturnTo(returnTo)) {
    params.set(RETURN_TO_PARAM, returnTo);
  }
};

const appendEmailParam = (
  params: URLSearchParams,
  email: string | null | undefined,
): void => {
  const parsed = emailSchema.safeParse(email);
  if (parsed.success) {
    params.set(EMAIL_PARAM, parsed.data.toLowerCase());
  }
};

const appendSignupSourceParam = (
  params: URLSearchParams,
  source: SignupSource | null | undefined,
): void => {
  if (source && SIGNUP_SOURCES.includes(source)) {
    params.set(SIGNUP_SOURCE_PARAM, source);
  }
};

export const buildAnonymousFallback = (returnTo: string | null): string => {
  if (!returnTo || !isSafeReturnTo(returnTo)) {
    return "/";
  }

  const normalized = normalizeReturnTo(returnTo);
  const pathname = getPathnameFromReturnTo(normalized);

  if (pathname === "/map") {
    return "/map";
  }

  if (pathname.startsWith("/program/")) {
    return "/program";
  }

  if (pathname.startsWith("/dashboard")) {
    return "/";
  }

  if (pathname.startsWith("/exhibitors")) {
    return "/exhibitors";
  }

  return "/";
};

export const buildAnonymousCloseHref = (
  returnTo: string | null,
  cancelTo: string | null,
): string => {
  if (cancelTo && isSafeCancelTo(cancelTo)) {
    return normalizeCancelTo(cancelTo);
  }

  return buildAnonymousFallback(returnTo);
};

export const buildAccountHref = (
  pathname: string,
  search: string,
  cancelTo?: string | null,
): string => {
  const returnPath = captureReturnPath(pathname, search);
  const params = new URLSearchParams();

  if (returnPath) {
    params.set(RETURN_TO_PARAM, returnPath);
  }

  appendCancelToParam(params, cancelTo);

  const query = params.toString();
  return query ? `/account?${query}` : "/account";
};

export const buildSignUpHref = (
  pathname: string,
  search: string,
  cancelTo?: string | null,
): string => {
  const returnPath = captureReturnPath(pathname, search);
  const params = new URLSearchParams();
  appendSignupSourceParam(params, "restricted");

  if (!returnPath) {
    const query = params.toString();
    return query ? `/sign-up?${query}` : "/sign-up";
  }

  params.set(RETURN_TO_PARAM, returnPath);
  appendCancelToParam(params, cancelTo);
  return `/sign-up?${params.toString()}`;
};

type AuthHrefOptions = {
  email?: string | null;
  returnTo?: string | null;
  cancelTo?: string | null;
};

export const buildLoginHref = ({
  email,
  returnTo,
  cancelTo,
}: AuthHrefOptions = {}): string => {
  const params = new URLSearchParams();
  appendEmailParam(params, email);
  appendReturnToParam(params, returnTo);
  appendCancelToParam(params, cancelTo);

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
};

export const buildSignUpFromAccountHref = ({
  email,
  returnTo,
  cancelTo,
}: AuthHrefOptions = {}): string => {
  const params = new URLSearchParams();
  appendEmailParam(params, email);
  appendSignupSourceParam(params, "visitor");
  appendReturnToParam(params, returnTo);
  appendCancelToParam(params, cancelTo);

  const query = params.toString();
  return query ? `/sign-up?${query}` : "/sign-up";
};

export const buildParticipateFromAccountHref = ({
  email,
  cancelTo,
}: AuthHrefOptions = {}): string => {
  const params = new URLSearchParams();
  appendEmailParam(params, email);
  appendCancelToParam(params, cancelTo);

  const query = params.toString();
  const base = query ? `/participate?${query}` : "/participate";
  return `${base}${PLANS_SELECTION_HASH}`;
};

export const buildSignUpHrefWithParams = ({
  email,
  signupSource,
  returnTo,
  cancelTo,
}: AuthHrefOptions & { signupSource?: SignupSource | null } = {}): string => {
  const params = new URLSearchParams();
  appendEmailParam(params, email);
  appendSignupSourceParam(params, signupSource);
  appendReturnToParam(params, returnTo);
  appendCancelToParam(params, cancelTo);

  const query = params.toString();
  return query ? `/sign-up?${query}` : "/sign-up";
};

export const parseReturnToParam = (
  searchParams: URLSearchParams,
): string | null => {
  const raw = searchParams.get(RETURN_TO_PARAM);
  if (!raw) {
    return null;
  }

  const returnTo = normalizeReturnTo(raw);
  return isSafeReturnTo(returnTo) ? returnTo : null;
};

export const parseCancelToParam = (
  searchParams: URLSearchParams,
): string | null => {
  const raw = searchParams.get(CANCEL_TO_PARAM);
  if (!raw) {
    return null;
  }

  const cancelTo = normalizeCancelTo(raw);
  return isSafeCancelTo(cancelTo) ? cancelTo : null;
};

export const parseEmailParam = (
  searchParams: URLSearchParams,
): string | null => {
  const raw = searchParams.get(EMAIL_PARAM);
  if (!raw) {
    return null;
  }

  const parsed = emailSchema.safeParse(raw);
  return parsed.success ? parsed.data.toLowerCase() : null;
};

export const parseSignupSourceParam = (
  searchParams: URLSearchParams,
): SignupSource | null => {
  const raw = searchParams.get(SIGNUP_SOURCE_PARAM);
  if (!raw || !SIGNUP_SOURCES.includes(raw as SignupSource)) {
    return null;
  }

  return raw as SignupSource;
};
