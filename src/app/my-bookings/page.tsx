
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getBookingRequestsForUser, cancelBookingRequest, BookingRequest } from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Trash2, Calendar, Car, AlertCircle, Info, CheckCircle, FileText, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCanceling, startCancelTransition] = useTransition();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<BookingRequest | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const userBookings = await getBookingRequestsForUser(user.uid);
        setBookings(userBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your booking requests.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, router, toast]);

  const handleCancelClick = (booking: BookingRequest) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    if (!bookingToCancel) return;

    startCancelTransition(async () => {
      try {
        await cancelBookingRequest(bookingToCancel.id);
        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b.id === bookingToCancel.id ? { ...b, status: "canceled" } : b
          )
        );
        toast({
          title: "Success",
          description: `Your booking request for the "${bookingToCancel.carName}" has been canceled.`,
        });
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to cancel the booking. Please try again.",
        });
      } finally {
        setShowCancelDialog(false);
        setBookingToCancel(null);
      }
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              Here you can view the status of your booking requests.
            </p>
          </div>
          <Button asChild>
            <Link href="/add-testimonial">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add a Testimonial
            </Link>
          </Button>
        </div>


        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.carName}</CardTitle>
                       <CardDescription>
                        Requested on {format(parseISO(booking.createdAt.split('T')[0]), "PPP")} | ID: <strong>{booking.id}</strong>
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                           <Calendar className="h-4 w-4" />
                           <span>{format(parseISO(booking.pickupDate), "MMM dd, yyyy")} to {format(parseISO(booking.returnDate), "MMM dd, yyyy")}</span>
                        </div>
                    </div>
                    {booking.requests && (
                        <Alert variant="default" className="mb-4">
                             <Info className="h-4 w-4" />
                             <AlertTitle>Your Special Requests</AlertTitle>
                             <AlertDescription>
                                {booking.requests}
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="flex justify-end items-center gap-2">
                        {booking.status === 'pending' && (
                            <Button variant="destructive" size="sm" onClick={() => handleCancelClick(booking)} disabled={isCanceling}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Cancel Request
                            </Button>
                        )}
                        {booking.status === 'confirmed' && (
                            <Button asChild>
                                <Link href={`/agreement/${booking.id}`}>
                                    <FileText className="mr-2 h-4 w-4"/>
                                    View / Download Agreement
                                </Link>
                            </Button>
                        )}
                    </div>
                    
                     {booking.status === 'confirmed' && (
                        <Alert className="border-green-600 mt-4">
                             <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-600">Booking Confirmed!</AlertTitle>
                            <AlertDescription>Please complete the rental agreement to finalize your booking.</AlertDescription>
                        </Alert>
                     )}
                     {booking.status === 'canceled' && (
                        <Alert variant="destructive" className="mt-4">
                             <AlertCircle className="h-4 w-4"/>
                            <AlertTitle>Booking Canceled</AlertTitle>
                            <AlertDescription>This booking request has been canceled.</AlertDescription>
                        </Alert>
                     )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Bookings Found</AlertTitle>
            <AlertDescription>
              You haven't made any booking requests yet. Once you do, they'll appear here.
              <Button asChild variant="link" className="p-0 h-auto ml-1"><a href="/cars">Explore cars</a></Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

       <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your booking request for the
              "{bookingToCancel?.carName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCanceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCanceling ? "Canceling..." : "Yes, cancel it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
