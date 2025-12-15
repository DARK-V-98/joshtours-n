
import { getCarById } from "@/lib/data";
import { notFound } from "next/navigation";
import CarDetailClient from "./CarDetailClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

interface CarDetailPageProps {
  params: {
    id: string;
  };
}

function CarDetailPageSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
         <div className="mt-12">
            <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }


export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const carId = params.id;
  const car = await getCarById(carId);

  if (!car) {
    notFound();
  }

  return (
    <Suspense fallback={<CarDetailPageSkeleton />}>
        <CarDetailClient car={car} />
    </Suspense>
  );
}
