
import { getAllBookingRequests } from "@/lib/bookingActions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BookingListClient from "./BookingListClient";


function ConfirmedBookingsSkeleton() {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-72 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }


export default async function ConfirmedBookingsPage() {
    const allBookings = await getAllBookingRequests();
    const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');

    return (
        <Suspense fallback={<ConfirmedBookingsSkeleton />}>
            <BookingListClient bookings={confirmedBookings} />
        </Suspense>
    )
}
