
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAuth } from '@/context/AuthContext';
import { BookingRequest } from '@/lib/bookingActions';
import { Car } from '@/lib/data';
import { saveRentalAgreement, RentalAgreement } from '@/lib/rentalAgreementActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, FileSignature, User, Car as CarIcon, Calendar, UserCheck, Download, Languages, FilePlus } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import PrintableAgreement from '@/components/printable-agreement';
import PrintableAgreementSi from '@/components/printable-agreement-si';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


const agreementFormSchema = z.object({
  agreementDate: z.string().optional(),
  renterIdOrPassport: z.string().optional(),
  renterAddress: z.string().optional(),
  vehicleDetails: z.string().optional(),
  rentalStartDate: z.string().optional(),
  rentalDuration: z.string().optional(),
  rentCostPerDayMonth: z.string().optional(),
  totalRentCost: z.string().optional(),
  depositMoney: z.string().optional(),
  dailyKMLimit: z.string().optional(),
  priceForAdditionalKM: z.string().optional(),
  clientFullName: z.string().optional(),
  clientContactNumber: z.string().optional(),
  clientSignDate: z.string().optional(),
  guarantorName: z.string().optional(),
  guarantorNIC: z.string().optional(),
  guarantorAddress: z.string().optional(),
  guarantorContact: z.string().optional(),
  // Billing fields
  billDate: z.string().optional(),
  additionalKm: z.coerce.number().min(0).optional().default(0),
  pricePerKm: z.coerce.number().min(0).optional().default(0),
  additionalDays: z.coerce.number().min(0).optional().default(0),
  pricePerDay: z.coerce.number().min(0).optional().default(0),
  damages: z.coerce.number().min(0).optional().default(0),
  delayPayments: z.coerce.number().min(0).optional().default(0),
  otherCharges: z.coerce.number().min(0).optional().default(0),
  paidAmount: z.coerce.number().min(0).optional().default(0),
});

export type AgreementFormValues = z.infer<typeof agreementFormSchema>;

const labels = {
    en: {
        backToBookings: 'Back to Bookings',
        downloadAsPdf: 'Download as PDF',
        downloading: 'Downloading...',
        agreementDetails: 'Agreement Details',
        agreementDesc: 'Records of the rental transaction basics.',
        date: 'Date',
        nicPassport: 'NIC or Passport No',
        nicPassportPlaceholder: 'Client\'s National ID or Passport',
        address: 'Address',
        addressPlaceholder: 'Full address of the renter',
        vehicleDetails: 'Vehicle Details',
        rentalStartDate: 'Rental Start Date',
        rentalDuration: 'Rental Duration (Days/Months)',
        rentalDurationPlaceholder: 'e.g., 7 Days',
        rentCost: 'Rent Cost Per Day/Month',
        rentCostPlaceholder: 'e.g., $50 / Day',
        totalRentCost: 'Total Rent Cost',
        totalRentCostPlaceholder: 'Total calculated price',
        depositMoney: 'Deposit Money',
        depositMoneyPlaceholder: 'Refundable security deposit',
        dailyKmLimit: 'Daily KM Limit',
        dailyKmLimitPlaceholder: 'e.g., 100km',
        priceForAdditionalKm: 'Price for Additional KM',
        priceForAdditionalKmPlaceholder: 'e.g., $0.50 / km',
        clientDetails: 'Client Details',
        clientFullName: 'Client Full Name',
        clientContact: 'Contact Number',
        dateOfSigning: 'Date of Signing',
        guarantorDetails: 'Guarantor Details',
        guarantorName: 'Guarantor Name',
        guarantorNamePlaceholder: 'Full name of guarantor',
        guarantorNic: 'Guarantor NIC',
        guarantorNicPlaceholder: 'National ID of guarantor',
        guarantorAddress: 'Guarantor Address',
        guarantorAddressPlaceholder: 'Guarantor\'s home or office address',
        guarantorContact: 'Guarantor Contact Number',
        guarantorContactPlaceholder: 'Guarantor\'s phone number',
        saveAgreement: 'Save Agreement',
        saving: 'Saving...',
        selectLanguage: 'Select Language'
    },
    si: {
        backToBookings: 'වෙන්කිරීම් වෙත ආපසු',
        downloadAsPdf: 'PDF ලෙස බාගන්න',
        downloading: 'බාගත වෙමින් පවතී...',
        agreementDetails: 'ගිවිසුම් විස්තර',
        agreementDesc: '',
        date: 'දිනය',
        nicPassport: 'ජාතික හැඳුනුම්පත් අංකය හෝ ගමන් බලපත්‍ර අංකය',
        nicPassportPlaceholder: 'සේවාදායකයාගේ ජාතික හැඳුනුම්පත හෝ ගමන් බලපත්‍රය',
        address: 'ලිපිනය',
        addressPlaceholder: 'කුලීකරුගේ සම්පූර්ණ ලිපිනය',
        vehicleDetails: 'වාහන විස්තර',
        rentalStartDate: 'කුලියට දෙන දිනය',
        rentalDuration: 'කුලී කාලය (දින/මාස)',
        rentalDurationPlaceholder: 'උදා: දින 7',
        rentCost: 'දිනකට/මාසයකට කුලී ගාස්තුව',
        rentCostPlaceholder: 'උදා: $50 / දිනකට',
        totalRentCost: 'සම්පූර්ණ කුලී ගාස්තුව',
        totalRentCostPlaceholder: 'ගණනය කළ සම්පූර්ණ මිල',
        depositMoney: 'තැන්පතු මුදල',
        depositMoneyPlaceholder: 'ආපසු ගෙවිය හැකි ආරක්ෂක තැන්පතුව',
        dailyKmLimit: 'දෛනික කි.මී. සීමාව',
        dailyKmLimitPlaceholder: 'උදා: 100km',
        priceForAdditionalKm: 'අමතර කි.මී. සඳහා මිල',
        priceForAdditionalKmPlaceholder: 'උදා: $0.50 / කි.මී.',
        clientDetails: 'සේවාදායකයාගේ විස්තර',
        clientFullName: 'සේවාදායකයාගේ සම්පූර්ණ නම',
        clientContact: 'සම්බන්ධතා අංකය',
        dateOfSigning: 'අත්සන් කළ දිනය',
        guarantorDetails: 'ඇපකරුගේ විස්තර',
        guarantorName: 'ඇපකරුගේ නම',
        guarantorNamePlaceholder: 'ඇපකරුගේ සම්පූර්ණ නම',
        guarantorNic: 'ඇපකරුගේ ජාතික හැඳුනුම්පත',
        guarantorNicPlaceholder: 'ඇපකරුගේ ජාතික හැඳුනුම්පත',
        guarantorAddress: 'ඇපකරුගේ ලිපිනය',
        guarantorAddressPlaceholder: 'ඇපකරුගේ නිවසේ හෝ කාර්යාල ලිපිනය',
        guarantorContact: 'ඇපකරුගේ සම්බන්ධතා අංකය',
        guarantorContactPlaceholder: 'ඇපකරුගේ දුරකථන අංකය',
        saveAgreement: 'ගිවිසුම සුරකින්න',
        saving: 'සුරැකෙමින්...',
        selectLanguage: 'භාෂාව තෝරන්න'
    }
};

interface AgreementPageClientProps {
    bookingId: string;
    initialBooking: BookingRequest;
    initialCar: Car;
    initialAgreement: RentalAgreement | null;
}

export default function AgreementPageClient({ bookingId, initialBooking, initialCar, initialAgreement }: AgreementPageClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'si'>('en');
  
  const printableRefEn = useRef<HTMLDivElement>(null);
  const printableRefSi = useRef<HTMLDivElement>(null);

  const t = labels[language];

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: initialAgreement || {
        agreementDate: format(new Date(), 'yyyy-MM-dd'),
        renterIdOrPassport: '',
        renterAddress: '',
        vehicleDetails: `${initialCar?.name} (${initialCar?.type})`,
        rentalStartDate: initialBooking.pickupDate,
        clientFullName: initialBooking.customerName,
        clientContactNumber: initialBooking.customerPhone,
        rentalDuration: '',
        rentCostPerDayMonth: '',
        totalRentCost: '',
        depositMoney: '',
        dailyKMLimit: '',
        priceForAdditionalKM: '',
        clientSignDate: '',
        guarantorName: '',
        guarantorNIC: '',
        guarantorAddress: '',
        guarantorContact: '',
        billDate: format(new Date(), 'yyyy-MM-dd'),
        additionalKm: 0,
        pricePerKm: 0,
        additionalDays: 0,
        pricePerDay: 0,
        damages: 0,
        delayPayments: 0,
        otherCharges: 0,
        paidAmount: 0,
    },
  });

  const watchFields = form.watch();

  const additionalChargesSubTotal =
    (Number(watchFields.additionalKm) || 0) * (Number(watchFields.pricePerKm) || 0) +
    (Number(watchFields.additionalDays) || 0) * (Number(watchFields.pricePerDay) || 0);

  const finalTotalAmount =
    (Number(watchFields.totalRentCost) || 0) +
    additionalChargesSubTotal +
    (Number(watchFields.damages) || 0) +
    (Number(watchFields.delayPayments) || 0) +
    (Number(watchFields.otherCharges) || 0);

  const balanceDue = finalTotalAmount - (Number(watchFields.paidAmount) || 0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (bookingId) {
        router.push(`/login?redirect=/agreement/${bookingId}`);
      }
      return;
    }
    if (user.role !== 'admin' && initialBooking.userId !== user.uid) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to view this agreement.' });
      router.push('/my-bookings');
    }
  }, [authLoading, user, router, toast, bookingId, initialBooking]);

  async function onSubmit(values: AgreementFormValues) {
    try {
      await saveRentalAgreement(bookingId, values);
      toast({
        title: 'Success!',
        description: 'Your rental agreement & bill has been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the agreement. Please try again.',
      });
    }
  }

  const handleDownloadPdf = async () => {
    const printableElement = language === 'en' ? printableRefEn.current : printableRefSi.current;

    if (!printableElement) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find printable content.' });
      return;
    }
    
    setIsDownloading(true);
    
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();

        const processPage = async (element: HTMLElement) => {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pageHeight = (imgProps.height * pdfWidth) / imgProps.width;
            return { imgData, pdfWidth, pageHeight };
        };
        
        const pages = printableElement.querySelectorAll<HTMLElement>('[data-page]');
        
        for (let i = 0; i < pages.length; i++) {
            const pageData = await processPage(pages[i]);
            if (i > 0) pdf.addPage();
            pdf.addImage(pageData.imgData, 'PNG', 0, 0, pageData.pdfWidth, pageData.pageHeight);
        }

        pdf.save(`rental-agreement-${bookingId}-${language}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };
  
  if (authLoading) {
      return (
          <div className="container mx-auto px-4 py-12 max-w-4xl flex justify-center items-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
       <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Button variant="outline" asChild>
                <Link href={user?.role === 'admin' ? '/admin/bookings' : '/my-bookings'}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.backToBookings}
                </Link>
            </Button>
            <div className="flex items-center gap-2 self-end sm:self-center">
                <ToggleGroup type="single" value={language} onValueChange={(value: 'en' | 'si') => {if(value) setLanguage(value)}} aria-label={t.selectLanguage}>
                    <ToggleGroupItem value="en" aria-label="English">EN</ToggleGroupItem>
                    <ToggleGroupItem value="si" aria-label="Sinhala">සිං</ToggleGroupItem>
                </ToggleGroup>
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                    {isDownloading ? t.downloading : t.downloadAsPdf}
                </Button>
            </div>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><FileSignature className="h-6 w-6"/>{t.agreementDetails}</CardTitle>
                    <CardDescription>{t.agreementDesc}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="agreementDate" render={({ field }) => (
                        <FormItem><FormLabel>{t.date}</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renterIdOrPassport" render={({ field }) => (
                        <FormItem><FormLabel>{t.nicPassport}</FormLabel><FormControl><Input placeholder={t.nicPassportPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renterAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>{t.address}</FormLabel><FormControl><Textarea placeholder={t.addressPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="vehicleDetails" render={({ field }) => (
                        <FormItem><FormLabel>{t.vehicleDetails}</FormLabel><FormControl><Input disabled={user?.role !== 'admin'} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalStartDate" render={({ field }) => (
                        <FormItem><FormLabel>{t.rentalStartDate}</FormLabel><FormControl><Input type="date" disabled={user?.role !== 'admin'} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentalDuration" render={({ field }) => (
                        <FormItem><FormLabel>{t.rentalDuration}</FormLabel><FormControl><Input placeholder={t.rentalDurationPlaceholder} {...field} value={field.value ?? ''} disabled={user?.role !== 'admin'} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rentCostPerDayMonth" render={({ field }) => (
                        <FormItem><FormLabel>{t.rentCost}</FormLabel><FormControl><Input placeholder={t.rentCostPlaceholder} {...field} value={field.value ?? ''} disabled={user?.role !== 'admin'} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="totalRentCost" render={({ field }) => (
                        <FormItem><FormLabel>{t.totalRentCost}</FormLabel><FormControl><Input placeholder={t.totalRentCostPlaceholder} {...field} value={field.value ?? ''} disabled={user?.role !== 'admin'} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="depositMoney" render={({ field }) => (
                        <FormItem><FormLabel>{t.depositMoney}</FormLabel><FormControl><Input placeholder={t.depositMoneyPlaceholder} {...field} value={field.value ?? ''} disabled={user?.role !== 'admin'} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dailyKMLimit" render={({ field }) => (
                        <FormItem><FormLabel>{t.dailyKmLimit}</FormLabel><FormControl><Input placeholder={t.dailyKmLimitPlaceholder} {...field} value={field.value ?? ''} disabled={user?.role !== 'admin'} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="priceForAdditionalKM" render={({ field }) => (
                        <FormItem><FormLabel>{t.priceForAdditionalKm}</FormLabel><FormControl><Input placeholder={t.priceForAdditionalKmPlaceholder} {...field} value={field.value ?? ''} disabled={user?.role !== 'admin'} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><User className="h-6 w-6"/>{t.clientDetails}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="clientFullName" render={({ field }) => (
                        <FormItem><FormLabel>{t.clientFullName}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="clientContactNumber" render={({ field }) => (
                        <FormItem><FormLabel>{t.clientContact}</FormLabel><FormControl><Input disabled={user?.role !== 'admin'} {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="clientSignDate" render={({ field }) => (
                        <FormItem><FormLabel>{t.dateOfSigning}</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><UserCheck className="h-6 w-6"/>{t.guarantorDetails}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField control={form.control} name="guarantorName" render={({ field }) => (
                        <FormItem><FormLabel>{t.guarantorName}</FormLabel><FormControl><Input placeholder={t.guarantorNamePlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorNIC" render={({ field }) => (
                        <FormItem><FormLabel>{t.guarantorNic}</FormLabel><FormControl><Input placeholder={t.guarantorNicPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>{t.guarantorAddress}</FormLabel><FormControl><Textarea placeholder={t.guarantorAddressPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="guarantorContact" render={({ field }) => (
                        <FormItem><FormLabel>{t.guarantorContact}</FormLabel><FormControl><Input placeholder={t.guarantorContactPlaceholder} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                     )} />
                </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl"><FilePlus className="h-6 w-6"/>Cost & Billing Details</CardTitle>
                      <CardDescription>All prices are in LKR.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="additionalKm" render={({ field }) => (
                              <FormItem><FormLabel>Additional KM Used</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="pricePerKm" render={({ field }) => (
                              <FormItem><FormLabel>Price per Additional KM</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="additionalDays" render={({ field }) => (
                              <FormItem><FormLabel>Additional Days</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="pricePerDay" render={({ field }) => (
                            <FormItem><FormLabel>Price per Additional Day</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                          <FormField control={form.control} name="damages" render={({ field }) => (
                              <FormItem><FormLabel>Damages</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="delayPayments" render={({ field }) => (
                              <FormItem><FormLabel>Delay Payments</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="otherCharges" render={({ field }) => (
                              <FormItem><FormLabel>Other Charges</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                      </div>
                      <Separator />
                      <div className="space-y-2 text-lg">
                          <div className="flex justify-between items-center"><span className="text-muted-foreground">Rental Cost</span><span>Rs {Number(watchFields.totalRentCost || 0).toFixed(2)}</span></div>
                          <div className="flex justify-between items-center"><span className="text-muted-foreground">Additional Charges</span><span>Rs {additionalChargesSubTotal.toFixed(2)}</span></div>
                          <Separator/>
                          <div className="flex justify-between items-center font-bold text-xl"><span className="text-foreground">Total Amount</span><span>Rs {finalTotalAmount.toFixed(2)}</span></div>
                      </div>
                      <Separator/>
                      <div className="grid sm:grid-cols-2 gap-4 items-end">
                          <FormField control={form.control} name="paidAmount" render={({ field }) => (
                              <FormItem><FormLabel>Paid Amount (Advance, etc.)</FormLabel><FormControl><Input type="number" className="h-12 text-lg" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <div className="flex justify-between items-center font-bold text-2xl text-primary p-2 rounded-md bg-primary/10">
                              <span>Balance Due</span>
                              <span>Rs {balanceDue.toFixed(2)}</span>
                          </div>
                      </div>
                  </CardContent>
              </Card>
            )}


            <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {form.formState.isSubmitting ? t.saving : t.saveAgreement}
            </Button>
        </form>
      </Form>
      <div className="absolute -z-50 -left-[9999px] top-0">
        <PrintableAgreement ref={printableRefEn} data={form.getValues()} booking={initialBooking} car={initialCar} subTotal={additionalChargesSubTotal} totalAmount={finalTotalAmount} balanceDue={balanceDue} />
        <PrintableAgreementSi ref={printableRefSi} data={form.getValues()} booking={initialBooking} car={initialCar} subTotal={additionalChargesSubTotal} totalAmount={finalTotalAmount} balanceDue={balanceDue} />
      </div>
    </div>
  );
}
