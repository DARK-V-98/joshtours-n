
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookingRequest } from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  Car,
  ArrowLeft,
  AlertCircle,
  Search,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface BookingListClientProps {
    bookings: BookingRequest[];
}

export default function BookingListClient({ bookings: initialBookings }: BookingListClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") router.push("/");
  }, [user, authLoading, router]);

  const filteredBookings = initialBookings.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold mb-1">Confirmed Bookings & Billing</h1>
          <p className="text-muted-foreground">View all confirmed bookings to manage agreements and billing.</p>
        </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by customer name or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5 text-primary"/>{booking.carName}</CardTitle>
                       <CardDescription>
                        Customer: {booking.customerName} | ID: <strong>{booking.id}</strong>
                      </CardDescription>
                    </div>
                    <Badge className="capitalize text-sm py-1 px-3 self-start bg-green-600">
                        {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground"/>
                            <span>{format(parseISO(booking.pickupDate), "MMM dd, yyyy")} to {format(parseISO(booking.returnDate), "MMM dd, yyyy")}</span>
                        </div>
                        <Button asChild variant="default" size="sm">
                            <Link href={`/agreement/${booking.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Agreement & Bill
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Confirmed Bookings Found</AlertTitle>
            <AlertDescription>
              There are no confirmed bookings matching your search criteria.
            </AlertDescription>
          </Alert>
      )}
    </div>
  );
}
