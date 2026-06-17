import type { MetadataRoute } from "next";
import { config } from "@/config";
import { getAllPublicDynamicUrls } from "@/lib/seo/fetch-public-urls";

type StaticRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const staticPublicRoutes: StaticRoute[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/participate", priority: 0.8, changeFrequency: "monthly" },
  { path: "/exhibitors", priority: 0.8, changeFrequency: "weekly" },
  { path: "/map", priority: 0.8, changeFrequency: "weekly" },
  { path: "/program", priority: 0.8, changeFrequency: "weekly" },
  { path: "/posts", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/visit", priority: 0.8, changeFrequency: "monthly" },
  { path: "/terms-and-conditions", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/imprint", priority: 0.5, changeFrequency: "yearly" },
  { path: "/newsletter", priority: 0.8, changeFrequency: "monthly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  { path: "/sign-up", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.baseUrl;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPublicRoutes.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  const dynamicUrls = await getAllPublicDynamicUrls();
  const dynamicEntries: MetadataRoute.Sitemap = dynamicUrls.map(({ path }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...dynamicEntries];
}
