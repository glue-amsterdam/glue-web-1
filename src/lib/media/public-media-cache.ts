/** 30 days — default ISR / unstable_cache TTL when admin tag invalidation has not run. */
export const PUBLIC_MEDIA_CACHE_REVALIDATE_SECONDS = 2_592_000;

/** Supabase Storage cache-control for fixed paths overwritten in place (?v= busts on change). */
export const PUBLIC_MEDIA_STORAGE_CACHE_CONTROL = String(
  PUBLIC_MEDIA_CACHE_REVALIDATE_SECONDS
);
