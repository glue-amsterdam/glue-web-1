export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  cityName: process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT as string,
  bucketName: process.env.NEXT_PUBLIC_BUCKET as string,
  cityBoundWest: process.env.NEXT_PUBLIC_CITY_BOUNDS_WEST as string,
  cityBoundEast: process.env.NEXT_PUBLIC_CITY_BOUNDS_EAST as string,
  cityBoundNorth: process.env.NEXT_PUBLIC_CITY_BOUNDS_NORTH as string,
  cityBoundSouth: process.env.NEXT_PUBLIC_CITY_BOUNDS_SOUTH as string,
  cityCenterLng: process.env.NEXT_PUBLIC_CITY_CENTER_LNG as string,
  cityCenterLat: process.env.NEXT_PUBLIC_CITY_CENTER_LAT as string,
  countryPreFix: process.env.NEXT_PUBLIC_COUNTRY_PRE_FIX as string,
  mapboxAccesToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string,
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL as string,
  baseApiUrl: process.env.NEXT_PUBLIC_API_URL as string,
  adminEmails: process.env.NEXT_PUBLIC_ADMIN_EMAILS as string,
  baseEmail:
    (process.env.NEXT_PUBLIC_BASE_EMAIL as string) || "onboarding@resend.dev",
  baseParticipantAcceptedEmail: process.env
    .NEXT_PUBLIC_ACCEPTED_EMAIL as string,
};
