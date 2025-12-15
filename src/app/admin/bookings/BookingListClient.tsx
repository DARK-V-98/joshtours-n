
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  updateBookingStatus,
  BookingRequest,
} from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Check,
  X,
  Mail,
  Phone,
  User,
  Calendar,
  Info,
  Car,
  ArrowLeft,
  AlertCircle,
  Route,
  FileText,
  Download,
  Contact,
  Shield,
  FileBadge,
  Globe,
  FilePlus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const DocumentLink = ({ url, label }: { url?: string; label: string }) => {
    if (!url) return null;
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
            <Download className="h-3 w-3"/>
            {label}
        </a>
    )
}

interface BookingListClientProps {
    bookings: BookingRequest[];
}

export default function BookingListClient({ bookings: initialBookings }: BookingListClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRequest[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, startUpdateTransition] = useTransition();

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);


  const handleStatusUpdate = (bookingId: string, newStatus: 'confirmed' | 'canceled') => {
    startUpdateTransition(async () => {
      try {
        await updateBookingStatus(bookingId, newStatus);
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        toast({
          title: "Success",
          description: `Booking has been ${newStatus}.`,
        });
      } catch (error) {
        console.error("Failed to update booking status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update the booking. Please try again.",
        });
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


  return (
    <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-grow">
                 <h1 className="text-3xl font-headline font-bold mb-2">Booking Requests</h1>
                <p className="text-muted-foreground">
                    Review, confirm, or cancel customer booking inquiries.
                </p>
            </div>
            <Button variant="outline" asChild>
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
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
                        Requested on {format(parseISO(booking.createdAt.split('T')[0]), "PPP")} | ID: <strong>{booking.id}</strong>
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(booking.status)} className="capitalize text-sm py-1 px-3 self-start">
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Booking Info */}
                        <div className="space-y-4">
                             <h4 className="font-semibold text-lg flex items-center gap-2"><Calendar className="h-5 w-5"/>Booking Period</h4>
                             <div className="flex items-center gap-2 text-sm ml-2">
                                <span>{format(parseISO(booking.pickupDate), "MMM dd, yyyy")} to {format(parseISO(booking.returnDate), "MMM dd, yyyy")}</span>
                            </div>
                             {booking.estimatedKm && (
                                <>
                                <h4 className="font-semibold text-lg flex items-center gap-2"><Route className="h-5 w-5"/>Estimated Mileage</h4>
                                <div className="flex items-center gap-2 text-sm ml-2">
                                    <span>{booking.estimatedKm} km</span>
                                </div>
                                </>
                             )}
                              {booking.requests && (
                                <>
                                <h4 className="font-semibold text-lg flex items-center gap-2"><Info className="h-5 w-5"/>Special Requests</h4>
                                <p className="text-sm text-muted-foreground italic ml-2">{booking.requests}</p>
                                </>
                             )}
                        </div>
                        
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg flex items-center gap-2"><Contact className="h-5 w-5"/>Customer Details</h4>
                            <div className="text-sm space-y-2 ml-2">
                                <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/>{booking.customerName}</p>
                                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/>{booking.customerEmail}</p>
                                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/>{booking.customerPhone}</p>
                                <p className="flex items-center gap-2"><FileBadge className="h-4 w-4 text-muted-foreground"/><strong>ID:</strong> {booking.customerNicOrPassport}</p>
                                <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground"/><strong>Residency:</strong> <span className="capitalize">{booking.customerResidency}</span></p>
                            </div>
                             <h4 className="font-semibold text-lg flex items-center gap-2"><FileText className="h-5 w-5"/>Customer Documents</h4>
                             <div className="grid grid-cols-2 gap-y-1 ml-2">
                                <DocumentLink url={booking.customerNicFrontUrl} label="NIC Front"/>
                                <DocumentLink url={booking.customerNicBackUrl} label="NIC Back"/>
                                <DocumentLink url={booking.customerPassportFrontUrl} label="Passport Front"/>
                                <DocumentLink url={booking.customerPassportBackUrl} label="Passport Back"/>
                                <DocumentLink url={booking.customerLicenseFrontUrl} label="License Front"/>
                                <DocumentLink url={booking.customerLicenseBackUrl} label="License Back"/>
                                <DocumentLink url={booking.customerLightBillUrl} label="Light Bill"/>
                                <DocumentLink url={booking.customerWaterBillUrl} label="Water Bill"/>
                             </div>
                        </div>

                         {/* Guarantor Info */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg flex items-center gap-2"><Shield className="h-5 w-5"/>Guarantor Details</h4>
                            <div className="text-sm space-y-2 ml-2">
                                <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/>{booking.guarantorName}</p>
                                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/>{booking.guarantorPhone}</p>
                                <p className="flex items-center gap-2"><FileBadge className="h-4 w-4 text-muted-foreground"/><strong>ID:</strong> {booking.guarantorNicOrPassport}</p>
                                <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground"/><strong>Residency:</strong> <span className="capitalize">{booking.guarantorResidency}</span></p>
                            </div>
                             <h4 className="font-semibold text-lg flex items-center gap-2"><FileText className="h-5 w-5"/>Guarantor Documents</h4>
                             <div className="grid grid-cols-2 gap-y-1 ml-2">
                                <DocumentLink url={booking.guarantorNicFrontUrl} label="NIC Front"/>
                                <DocumentLink url={booking.guarantorNicBackUrl} label="NIC Back"/>
                                <DocumentLink url={booking.guarantorPassportFrontUrl} label="Passport Front"/>
                                <DocumentLink url={booking.guarantorPassportBackUrl} label="Passport Back"/>
                                <DocumentLink url={booking.guarantorLicenseFrontUrl} label="License Front"/>
                                <DocumentLink url={booking.guarantorLicenseBackUrl} label="License Back"/>
                                <DocumentLink url={booking.guarantorLightBillUrl} label="Light Bill"/>
                                <DocumentLink url={booking.guarantorWaterBillUrl} label="Water Bill"/>
                             </div>
                        </div>
                    </div>
                    <Separator className="my-6"/>
                    
                    {/* Action Area */}
                    <div className="flex justify-end gap-2">
                     {booking.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <Button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} disabled={isUpdating} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                                <Check className="mr-2"/> Confirm
                            </Button>
                            <Button variant="destructive" onClick={() => handleStatusUpdate(booking.id, 'canceled')} disabled={isUpdating} className="w-full sm:w-auto">
                                <X className="mr-2"/> Reject
                            </Button>
                        </div>
                    )}
                    
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
            <AlertTitle>No Booking Requests Found</AlertTitle>
            <AlertDescription>
              No bookings match your search criteria. Try a different name or ID, or clear the search field.
            </AlertDescription>
          </Alert>
      )}
    </div>
  );
}
