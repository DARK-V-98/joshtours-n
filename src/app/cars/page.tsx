
"use client";

import { useEffect, useState } from "react";
import { getAllCars, Car } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import CarListPageClient from "./CarListPageClient";

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const fetchedCars = await getAllCars();
        setCars(fetchedCars);
      } catch (error) {
          console.error("Failed to fetch cars", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <div className="mb-8 p-4 bg-card rounded-lg border">
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <CarListPageClient initialCars={cars} />
  );
}
