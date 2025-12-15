
import { getCarById } from "@/lib/data";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const carId = params.id;
  const car = await getCarById(carId);

  if (!car) {
    notFound();
  }

  return <BookingForm car={car} />;
}


export function BookingPageSkeleton() {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[700px] w-full" />
        </div>
      </div>
    );
  }
