import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/privacy", "/dashboard", "/templates", "/settings"];
  return paths.map((path) => ({
    url: path,
    changefreq: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
