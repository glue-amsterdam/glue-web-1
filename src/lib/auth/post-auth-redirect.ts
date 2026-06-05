const ALLOWED_RETURN_PATH_PREFIXES = [
  "/program",
  "/map",
  "/exhibitors",
] as const;

const RETURN_TO_PARAM = "returnTo";
const FROM_SIGN_UP_PARAM = "from";
const FROM_SIGN_UP_VALUE = "sign-up";

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

export const captureReturnPath = (
  pathname: string,
  search: string,
): string | null => {
  if (!isAllowedReturnPathname(pathname)) {
    return null;
  }

  return search ? `${pathname}?${search}` : pathname;
};

export const resolvePostAuthRedirect = (returnTo: string | null): string =>
  isSafeReturnTo(returnTo) ? returnTo : "/";

export const buildSignUpHref = (pathname: string, search: string): string => {
  const returnPath = captureReturnPath(pathname, search);
  if (!returnPath) {
    return "/sign-up";
  }

  const params = new URLSearchParams();
  params.set(RETURN_TO_PARAM, returnPath);
  return `/sign-up?${params.toString()}`;
};

export const buildLoginFromSignUpHref = (returnTo: string | null): string => {
  const params = new URLSearchParams();
  params.set(FROM_SIGN_UP_PARAM, FROM_SIGN_UP_VALUE);

  if (isSafeReturnTo(returnTo)) {
    params.set(RETURN_TO_PARAM, returnTo);
  }

  return `/login?${params.toString()}`;
};

export const buildSignUpBackHref = (returnTo: string | null): string => {
  if (!isSafeReturnTo(returnTo)) {
    return "/sign-up";
  }

  const params = new URLSearchParams();
  params.set(RETURN_TO_PARAM, returnTo);
  return `/sign-up?${params.toString()}`;
};

export const parseReturnToParam = (
  searchParams: URLSearchParams,
): string | null => {
  const returnTo = searchParams.get(RETURN_TO_PARAM);
  return isSafeReturnTo(returnTo) ? returnTo : null;
};

export const isFromSignUp = (searchParams: URLSearchParams): boolean =>
  searchParams.get(FROM_SIGN_UP_PARAM) === FROM_SIGN_UP_VALUE;
