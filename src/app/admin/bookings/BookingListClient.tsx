
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateBookingStatus, BookingRequest } from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Loader2, Check, X, Mail, Phone, User, Calendar, Info, Car,
  AlertCircle, Route, FileText, Download, Contact, Shield,
  FileBadge, Globe, RefreshCw, Search, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type StatusFilter = "all" | "pending" | "confirmed" | "canceled";

const DocumentLink = ({ url, label, onPreview }: { url?: string; label: string; onPreview: (url: string, label: string) => void }) => {
  if (!url) return null;
  return (
    <button
      onClick={() => onPreview(url, label)}
      className="text-sm text-primary hover:underline flex items-center gap-1"
    >
      <Eye className="h-3 w-3" />
      {label}
    </button>
  );
};

interface BookingListClientProps {
  bookings: BookingRequest[];
}

export default function BookingListClient({ bookings: initialBookings }: BookingListClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRequest[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.carName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    canceled: bookings.filter((b) => b.status === "canceled").length,
  };

  const setUpdating = (id: string, on: boolean) => {
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: "confirmed" | "canceled" | "pending") => {
    setUpdating(bookingId, true);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
      toast({ title: "Updated", description: `Booking marked as ${newStatus}.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update booking." });
    } finally {
      setUpdating(bookingId, false);
    }
  };

  const handleBulkUpdate = async (newStatus: "confirmed" | "canceled") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => handleStatusUpdate(id, newStatus)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Car", "Customer", "Email", "Phone", "Pickup", "Return", "Status", "Created"],
      ...filtered.map((b) => [
        b.id, b.carName, b.customerName, b.customerEmail, b.customerPhone,
        b.pickupDate, b.returnDate, b.status,
        format(parseISO(b.createdAt.split("T")[0]), "yyyy-MM-dd"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800";
      case "canceled": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800";
      default: return "bg-secondary text-secondary-foreground border-border";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Booking Requests</h1>
          <p className="text-muted-foreground">Review, confirm, or cancel customer bookings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Search + Status tabs */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by customer, car, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending" className="text-yellow-600 data-[state=active]:text-yellow-600">
              Pending ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-green-600 data-[state=active]:text-green-600">
              Confirmed ({counts.confirmed})
            </TabsTrigger>
            <TabsTrigger value="canceled" className="text-red-600 data-[state=active]:text-red-600">
              Canceled ({counts.canceled})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-secondary border border-border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleBulkUpdate("confirmed")}>
            <Check className="mr-1 h-4 w-4" /> Confirm All
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleBulkUpdate("canceled")}>
            <X className="mr-1 h-4 w-4" /> Cancel All
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((booking) => {
            const isUpdating = updatingIds.has(booking.id);
            const isSelected = selectedIds.has(booking.id);
            return (
              <Card key={booking.id} className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(booking.id)}
                        className="mt-1"
                      />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-primary" />
                          {booking.carName}
                        </CardTitle>
                        <CardDescription>
                          Requested on {format(parseISO(booking.createdAt.split("T")[0]), "PPP")} | ID: <strong>{booking.id}</strong>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`capitalize text-sm py-1 px-3 self-start flex items-center gap-1 ${getStatusClasses(booking.status)}`}>
                      {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Booking Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Booking Period</h4>
                      <p className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        {format(parseISO(booking.pickupDate), "MMM dd, yyyy")} → {format(parseISO(booking.returnDate), "MMM dd, yyyy")}
                      </p>
                      {booking.estimatedKm && (
                        <p className="flex items-center gap-2 text-sm">
                          <Route className="h-4 w-4 text-primary" />
                          {booking.estimatedKm} km estimated
                        </p>
                      )}
                      {booking.requests && (
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Info className="h-4 w-4 text-primary" /> Special Requests
                          </p>
                          <p className="text-sm text-muted-foreground italic pl-6">{booking.requests}</p>
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Customer</h4>
                      <div className="text-sm space-y-1.5">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{booking.customerName}</p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{booking.customerEmail}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{booking.customerPhone}</p>
                        <p className="flex items-center gap-2"><FileBadge className="h-4 w-4 text-muted-foreground" />{booking.customerNicOrPassport}</p>
                        <p className="flex items-center gap-2 capitalize"><Globe className="h-4 w-4 text-muted-foreground" />{booking.customerResidency}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        {[
                          { url: booking.customerNicFrontUrl, label: "NIC Front" },
                          { url: booking.customerNicBackUrl, label: "NIC Back" },
                          { url: booking.customerPassportFrontUrl, label: "Passport Front" },
                          { url: booking.customerPassportBackUrl, label: "Passport Back" },
                          { url: booking.customerLicenseFrontUrl, label: "License Front" },
                          { url: booking.customerLicenseBackUrl, label: "License Back" },
                          { url: booking.customerLightBillUrl, label: "Light Bill" },
                          { url: booking.customerWaterBillUrl, label: "Water Bill" },
                        ].map(({ url, label }) => (
                          <DocumentLink key={label} url={url} label={label} onPreview={(u, l) => { setPreviewUrl(u); setPreviewLabel(l); }} />
                        ))}
                      </div>
                    </div>

                    {/* Guarantor Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Guarantor</h4>
                      <div className="text-sm space-y-1.5">
                        <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{booking.guarantorName}</p>
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{booking.guarantorPhone}</p>
                        <p className="flex items-center gap-2"><FileBadge className="h-4 w-4 text-muted-foreground" />{booking.guarantorNicOrPassport}</p>
                        <p className="flex items-center gap-2 capitalize"><Globe className="h-4 w-4 text-muted-foreground" />{booking.guarantorResidency}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        {[
                          { url: booking.guarantorNicFrontUrl, label: "NIC Front" },
                          { url: booking.guarantorNicBackUrl, label: "NIC Back" },
                          { url: booking.guarantorPassportFrontUrl, label: "Passport Front" },
                          { url: booking.guarantorPassportBackUrl, label: "Passport Back" },
                          { url: booking.guarantorLicenseFrontUrl, label: "License Front" },
                          { url: booking.guarantorLicenseBackUrl, label: "License Back" },
                          { url: booking.guarantorLightBillUrl, label: "Light Bill" },
                          { url: booking.guarantorWaterBillUrl, label: "Water Bill" },
                        ].map(({ url, label }) => (
                          <DocumentLink key={label} url={url} label={label} onPreview={(u, l) => { setPreviewUrl(u); setPreviewLabel(l); }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Action Area */}
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/agreement/${booking.id}`} target="_blank" rel="noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View Agreement
                      </a>
                    </Button>
                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(booking.id, "canceled")}
                            disabled={isUpdating}
                          >
                            <X className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, "pending")}
                            disabled={isUpdating}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" /> Mark Pending
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(booking.id, "canceled")}
                            disabled={isUpdating}
                          >
                            <X className="mr-2 h-4 w-4" /> Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === "canceled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(booking.id, "pending")}
                          disabled={isUpdating}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" /> Restore to Pending
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Bookings Found</AlertTitle>
          <AlertDescription>No bookings match your current filters.</AlertDescription>
        </Alert>
      )}

      {/* Document Preview Modal */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewLabel}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex flex-col items-center gap-4">
              <img
                src={previewUrl}
                alt={previewLabel}
                className="max-h-[60vh] w-auto object-contain rounded-lg"
              />
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Open in new tab
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
