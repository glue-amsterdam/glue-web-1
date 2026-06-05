import type { MetadataRoute } from "next";
import { config } from "@/config";

const publicRoutes = [
  "",
  "/about",
  "/participate",
  "/participants",
  "/map",
  "/events",
  "/program",
  "/faq",
  "/press-media",
  "/archive",
  "/contact",
  "/terms-conditions",
  "/privacy-policy",
  "/imprint",
  "/newsletter",
  "/login",
  "/sign-up",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = config.baseUrl;

  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
