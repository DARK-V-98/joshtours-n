
import type { Metadata } from "next";
import { getAllCars } from "@/lib/data";
import CarListPageClient from "./CarListPageClient";

export const metadata: Metadata = {
  title: "Our Fleet",
  description:
    "Browse the full Josh Tours fleet — sedans, SUVs, vans, and more. All vehicles are fully insured and available for hire across Sri Lanka.",
  openGraph: {
    title: "Our Fleet | Josh Tours",
    description: "Browse sedans, SUVs, and vans available for rent across Sri Lanka.",
    url: "https://joshtours.lk/cars",
  },
  alternates: { canonical: "https://joshtours.lk/cars" },
};

export default async function CarsPage() {
  const cars = await getAllCars().catch(() => []);
  const carTypes = [...new Set(cars.map((c) => c.type).filter(Boolean))];
  return <CarListPageClient initialCars={cars} carTypes={carTypes} />;
}
