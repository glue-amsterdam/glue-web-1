const STAGGER_KEY_PREFIX = "glue-stagger-visited:";

const buildStaggerKey = (pathname: string): string =>
  `${STAGGER_KEY_PREFIX}${pathname}`;

export const hasStaggerPlayed = (pathname: string): boolean => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(buildStaggerKey(pathname)) === "1";
};

export const markStaggerPlayed = (pathname: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(buildStaggerKey(pathname), "1");
};
