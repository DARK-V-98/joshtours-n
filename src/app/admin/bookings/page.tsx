
import { getAllBookingRequests } from "@/lib/bookingActions";
import BookingListClient from "./BookingListClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function BookingsPageSkeleton() {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-72 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }


export default async function AdminBookingsPage() {
    const bookings = await getAllBookingRequests();

    return (
        <Suspense fallback={<BookingsPageSkeleton />}>
            <BookingListClient bookings={bookings} />
        </Suspense>
    )
}
