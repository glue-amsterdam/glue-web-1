const PROGRAM_DETAIL_PATTERN = /^\/program\/[^/]+$/;

export const requiresUserAuth = (
  pathname: string,
  searchParams: URLSearchParams,
): boolean => {
  if (pathname.startsWith("/dashboard")) {
    return true;
  }

  if (pathname === "/map" && searchParams.get("route")) {
    return true;
  }

  if (pathname === "/map" && searchParams.get("view") === "routes") {
    return true;
  }

  if (PROGRAM_DETAIL_PATTERN.test(pathname)) {
    return true;
  }

  return false;
};
