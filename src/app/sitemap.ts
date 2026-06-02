
import type { MetadataRoute } from "next";
import { getAllCars } from "@/lib/data";

const siteUrl = "https://joshtours.lk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getAllCars().catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/cars`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${siteUrl}/cars/${car.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...carRoutes];
}
