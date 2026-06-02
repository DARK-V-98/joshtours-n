
import { getBookingRequestById } from "@/lib/bookingActions";
import { getCarById } from "@/lib/data";
import { notFound } from "next/navigation";
import AgreementPageClient from "./AgreementPageClient";
import { getRentalAgreement } from "@/lib/rentalAgreementActions";

interface AgreementPageProps {
    params: { bookingId: string };
}

export default async function AgreementPage({ params }: AgreementPageProps) {
    const { bookingId } = params;

    const booking = await getBookingRequestById(bookingId);
    if (!booking) {
        notFound();
    }
    
    const [car, agreement] = await Promise.all([
        getCarById(booking.carId),
        getRentalAgreement(bookingId)
    ]);

    if (!car) {
        notFound();
    }
    
    return (
        <AgreementPageClient 
            bookingId={bookingId} 
            initialBooking={booking}
            initialCar={car}
            initialAgreement={agreement}
        />
    );
}
