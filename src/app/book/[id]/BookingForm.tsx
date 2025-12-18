

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isWithinInterval, parseISO, eachDayOfInterval } from "date-fns";

import { Car } from "@/lib/data";
import { createBookingRequest } from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, CheckCircle, Loader2, Phone, Mail, User, Car as CarIcon, ArrowLeft, Route, UploadCloud, Eye } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const fileSchema = z.custom<File>((val) => val instanceof File, "Please upload a file")
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), ".jpg, .jpeg, .png and .webp files are accepted.");

// We receive booked dates as strings, so we need a custom preprocessor for Zod
const dateRangeWithBookingsSchema = (bookedDateStrings: string[]) => z.object({
  pickupDate: z.date({ required_error: "A pickup date is required." }),
  returnDate: z.date({ required_error: "A return date is required." }),
}).refine((data) => {
    if (!data.pickupDate || !data.returnDate) return true; // Let other rules handle this
    const range = { start: data.pickupDate, end: data.returnDate };
    const bookedDates = bookedDateStrings.map(d => parseISO(d));
    // Check if any of the booked dates fall within the selected interval
    return !bookedDates.some(bookedDate => isWithinInterval(bookedDate, range));
}, {
    message: "The selected date range includes unavailable dates. Please check the availability calendar and choose a different range.",
    path: ["returnDate"], // Apply error to the second date picker
});


const bookingFormSchema = (bookedDateStrings: string[]) => z.object({
  // Booking Details
  dateRange: dateRangeWithBookingsSchema(bookedDateStrings),
  estimatedKm: z.coerce.number().min(1, "Please enter an estimated mileage.").optional(),
  requests: z.string().max(500, "Message cannot exceed 500 characters.").optional(),

  // Customer Details
  customerName: z.string().min(2, "Full name is required."),
  customerPhone: z.string().min(5, "A valid phone number is required."),
  customerResidency: z.enum(['local', 'tourist'], { required_error: "Please select your residency status."}),
  customerNicOrPassport: z.string().min(3, "NIC or Passport number is required."),
  customerIdType: z.enum(['nic', 'license']).optional(),
  customerBillType: z.enum(['lightBill', 'waterBill']).optional(),
  
  // Guarantor Details
  guarantorName: z.string().min(2, "Guarantor's full name is required."),
  guarantorPhone: z.string().min(5, "A valid phone number is required."),
  guarantorResidency: z.enum(['local', 'tourist'], { required_error: "Please select guarantor's residency."}),
  guarantorNicOrPassport: z.string().min(3, "Guarantor's NIC or Passport number is required."),
  guarantorIdType: z.enum(['nic', 'license']).optional(),
  guarantorBillType: z.enum(['lightBill', 'waterBill']).optional(),
  
  // File Uploads (all optional in schema, required conditionally in form)
  customerNicFront: fileSchema.optional(),
  customerNicBack: fileSchema.optional(),
  customerLightBill: fileSchema.optional(),
  customerWaterBill: fileSchema.optional(),
  customerPassportFront: fileSchema.optional(),
  customerPassportBack: fileSchema.optional(),
  customerLicenseFront: fileSchema.optional(),
  customerLicenseBack: fileSchema.optional(),
  
  guarantorNicFront: fileSchema.optional(),
  guarantorNicBack: fileSchema.optional(),
  guarantorLightBill: fileSchema.optional(),
  guarantorWaterBill: fileSchema.optional(),
  guarantorPassportFront: fileSchema.optional(),
  guarantorPassportBack: fileSchema.optional(),
  guarantorLicenseFront: fileSchema.optional(),
  guarantorLicenseBack: fileSchema.optional(),
})
.refine((data) => data.dateRange.returnDate > data.dateRange.pickupDate, {
  message: "Return date must be after pickup date.",
  path: ["dateRange.returnDate"],
})
.superRefine((data, ctx) => {
    // Customer validation
    if (data.customerResidency === 'local') {
        if (!data.customerIdType) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select an ID type.", path: ["customerIdType"] });
        } else {
            if (data.customerIdType === 'nic' && (!data.customerNicFront || !data.customerNicBack)) {
                if (!data.customerNicFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIC front is required.", path: ["customerNicFront"] });
                if (!data.customerNicBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NIC back is required.", path: ["customerNicBack"] });
            }
            if (data.customerIdType === 'license' && (!data.customerLicenseFront || !data.customerLicenseBack)) {
                if (!data.customerLicenseFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "License front is required.", path: ["customerLicenseFront"] });
                if (!data.customerLicenseBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "License back is required.", path: ["customerLicenseBack"] });
            }
        }
        if (!data.customerBillType) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a bill type.", path: ["customerBillType"] });
        } else {
            if (data.customerBillType === 'lightBill' && !data.customerLightBill) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Light bill is required.", path: ["customerLightBill"] });
            }
            if (data.customerBillType === 'waterBill' && !data.customerWaterBill) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Water bill is required.", path: ["customerWaterBill"] });
            }
        }
    } else if (data.customerResidency === 'tourist') {
        if (!data.customerPassportFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passport front is required.", path: ["customerPassportFront"] });
        if (!data.customerPassportBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passport back is required.", path: ["customerPassportBack"] });
        if (!data.customerLicenseFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "License front is required.", path: ["customerLicenseFront"] });
        if (!data.customerLicenseBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "License back is required.", path: ["customerLicenseBack"] });
    }

    // Guarantor validation
     if (data.guarantorResidency === 'local') {
        if (!data.guarantorIdType) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select guarantor's ID type.", path: ["guarantorIdType"] });
        } else {
            if (data.guarantorIdType === 'nic' && (!data.guarantorNicFront || !data.guarantorNicBack)) {
                if (!data.guarantorNicFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's NIC front is required.", path: ["guarantorNicFront"] });
                if (!data.guarantorNicBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's NIC back is required.", path: ["guarantorNicBack"] });
            }
            if (data.guarantorIdType === 'license' && (!data.guarantorLicenseFront || !data.guarantorLicenseBack)) {
                if (!data.guarantorLicenseFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's License front is required.", path: ["guarantorLicenseFront"] });
                if (!data.guarantorLicenseBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's License back is required.", path: ["guarantorLicenseBack"] });
            }
        }
        if (!data.guarantorBillType) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select guarantor's bill type.", path: ["guarantorBillType"] });
        } else {
            if (data.guarantorBillType === 'lightBill' && !data.guarantorLightBill) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's Light bill is required.", path: ["guarantorLightBill"] });
            }
            if (data.guarantorBillType === 'waterBill' && !data.guarantorWaterBill) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's Water bill is required.", path: ["guarantorWaterBill"] });
            }
        }
    } else if (data.guarantorResidency === 'tourist') {
        if (!data.guarantorPassportFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's Passport front is required.", path: ["guarantorPassportFront"] });
        if (!data.guarantorPassportBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's Passport back is required.", path: ["guarantorPassportBack"] });
        if (!data.guarantorLicenseFront) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's License front is required.", path: ["guarantorLicenseFront"] });
        if (!data.guarantorLicenseBack) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Guarantor's License back is required.", path: ["guarantorLicenseBack"] });
    }
});


type BookingFormValues = z.infer<ReturnType<typeof bookingFormSchema>>;

interface BookingFormProps {
    car: Car;
}

export default function BookingForm({ car }: BookingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookedDays, setBookedDays] = useState<Date[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Parse dates only on the client-side to avoid hydration errors
  useEffect(() => {
    const parsedDates = car.bookedDates.map(dateStr => parseISO(dateStr));
    setBookedDays(parsedDates);
    setIsMounted(true);
  }, [car.bookedDates]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema(car.bookedDates)),
    defaultValues: {
      requests: "",
      estimatedKm: '' as any, 
      customerName: '',
      customerPhone: '',
      customerNicOrPassport: '',
      guarantorName: '',
      guarantorPhone: '',
      guarantorNicOrPassport: '',
      dateRange: {
        pickupDate: undefined,
        returnDate: undefined,
      },
    },
  });

  const customerResidency = form.watch('customerResidency');
  const guarantorResidency = form.watch('guarantorResidency');
  const customerIdType = form.watch('customerIdType');
  const customerBillType = form.watch('customerBillType');
  const guarantorIdType = form.watch('guarantorIdType');
  const guarantorBillType = form.watch('guarantorBillType');

  useEffect(() => {
    if (!authLoading && user) {
        form.setValue('customerName', user.displayName || '');
        form.setValue('customerPhone', user.phone || '');
    }
  }, [user, authLoading, form]);


   useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/book/${car.id}`);
    }
  }, [user, authLoading, router, car.id]);


  async function onSubmit(values: BookingFormValues) {
    if (!car || !user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to make a booking request.",
        });
        return;
    }
    
    const documentFormData = new FormData();
    const fileFields = [
        'customerNicFront', 'customerNicBack', 'customerLicenseFront', 'customerLicenseBack',
        'customerPassportFront', 'customerPassportBack', 'customerLightBill', 'customerWaterBill',
        'guarantorNicFront', 'guarantorNicBack', 'guarantorLicenseFront', 'guarantorLicenseBack',
        'guarantorPassportFront', 'guarantorPassportBack', 'guarantorLightBill', 'guarantorWaterBill'
    ] as const;

    fileFields.forEach(field => {
        const file = values[field] as File | undefined;
        if(file) {
            documentFormData.append(field, file);
        }
    });

    const bookingData = {
        carId: car.id,
        carName: car.name,
        userId: user.uid,
        customerEmail: user.email || 'N/A',
        pickupDate: format(values.dateRange.pickupDate, 'yyyy-MM-dd'),
        returnDate: format(values.dateRange.returnDate, 'yyyy-MM-dd'),
        estimatedKm: values.estimatedKm,
        requests: values.requests,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerResidency: values.customerResidency,
        customerNicOrPassport: values.customerNicOrPassport,
        guarantorName: values.guarantorName,
        guarantorPhone: values.guarantorPhone,
        guarantorResidency: values.guarantorResidency,
        guarantorNicOrPassport: values.guarantorNicOrPassport,
    };
    
    await createBookingRequest(bookingData, documentFormData);
    setIsSubmitted(true);
    form.reset();
  }
  
  if (!car || !user) return null;

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-2xl text-center">
            <CardHeader>
                 <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                 </div>
                 <CardTitle className="text-3xl font-headline mt-4">Inquiry Sent Successfully!</CardTitle>
                 <CardDescription className="text-lg">Thank you, {user.displayName || user.email}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Your request to book the <strong>{car.name}</strong> has been received. Our team will review the availability for your selected dates and the documents you have provided.
                </p>
                <Alert>
                    <Mail className="h-4 w-4"/>
                    <AlertTitle>What's Next?</AlertTitle>
                    <AlertDescription>
                        We will contact you shortly to confirm your booking. You can check the status on your bookings page.
                    </AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button size="lg" className="flex-1" asChild>
                       <a href="tel:+94701209694"><Phone className="mr-2"/>Call JOSH TOURS</a>
                    </Button>
                    <Button size="lg" variant="secondary" className="flex-1" asChild>
                        <Link href="/my-bookings">
                            <CarIcon className="mr-2"/>View My Bookings
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    )
  }
  
  const FileUploadField = ({ name, label }: { name: keyof BookingFormValues, label: string }) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                        <div className="flex items-center space-x-2 w-full h-12 border-2 border-dashed rounded-md px-4 bg-card/50 hover:bg-card/70 transition-colors">
                            <UploadCloud className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                                {field.value instanceof File ? field.value.name : `Choose ${label.toLowerCase()}...`}
                            </span>
                        </div>
                    </div>
                </FormControl>
                <FormDescription>
                  Allowed: PNG, JPG, JPEG, WEBP.
                </FormDescription>
                <FormMessage />
            </FormItem>
        )}
    />
);


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Car Details
        </Button>
      </div>
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column for Car Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Your Selected Vehicle</CardTitle></CardHeader>
                        <CardContent>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <Image src={car.images[0]} alt={car.name} fill className="object-contain"/>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold">{car.name}</h2>
                        <p className="text-muted-foreground">{car.type}</p>
                        </CardContent>
                    </Card>
                </div>
            
                {/* Right Column for Form */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Booking Inquiry</CardTitle>
                            <CardDescription>Confirm your dates and details to request a booking for the {car.name}.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <FormLabel>Select Your Dates</FormLabel>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" type="button">
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Availability
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-min">
                                            <DialogHeader>
                                                <DialogTitle>Availability for {car.name}</DialogTitle>
                                                <DialogDescription>
                                                    Dates in red are already booked.
                                                </DialogDescription>
                                            </DialogHeader>
                                            {isMounted && (
                                                <Calendar
                                                    mode="multiple"
                                                    disabled={bookedDays}
                                                    className="rounded-md border"
                                                />
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="dateRange.pickupDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover><PopoverTrigger asChild><FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pickup Date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={[{ before: new Date() }, ...bookedDays]} initialFocus />
                                        </PopoverContent></Popover>
                                        <FormMessage />
                                    </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="dateRange.returnDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover><PopoverTrigger asChild><FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Return Date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={[{ before: form.getValues("dateRange.pickupDate") || new Date() }, ...bookedDays]} initialFocus />
                                        </PopoverContent></Popover>
                                        <FormMessage />
                                    </FormItem>
                                    )}/>
                                </div>
                                 <FormMessage>{form.formState.errors.dateRange?.message}</FormMessage>
                            </div>
                            <FormField control={form.control} name="estimatedKm" render={({ field }) => (
                                <FormItem><FormLabel>Estimated Mileage (Optional)</FormLabel><FormControl>
                                <div className="relative"><Route className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="number" placeholder="e.g., 500" className="pl-8" {...field} /></div>
                                </FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="requests" render={({ field }) => (
                                <FormItem><FormLabel>Special Requests (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., airport pickup, child seat..."{...field}/></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader><CardTitle>Your Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="customerName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="customerPhone" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="+94 123 456 789" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField control={form.control} name="customerNicOrPassport" render={({ field }) => (<FormItem><FormLabel>NIC / Passport Number</FormLabel><FormControl><Input placeholder="Enter your ID number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </CardContent>
                    </Card>

                    {/* Customer Documents */}
                    <Card>
                        <CardHeader><CardTitle>Your Documents</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={form.control} name="customerResidency" render={({ field }) => (
                                <FormItem className="space-y-3"><FormLabel>Residency Status</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="local" /></FormControl><FormLabel className="font-normal">Sri Lankan</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="tourist" /></FormControl><FormLabel className="font-normal">Tourist / Foreign National</FormLabel></FormItem>
                                </RadioGroup></FormControl><FormMessage />
                            </FormItem>
                            )}/>
                            {customerResidency === 'local' && (
                                <div className="space-y-4 p-4 border rounded-md">
                                    <FormField control={form.control} name="customerIdType" render={({ field }) => (
                                        <FormItem className="space-y-2"><FormLabel>ID Document Type</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="nic" /></FormControl><FormLabel className="font-normal">NIC</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="license" /></FormControl><FormLabel className="font-normal">Driving License</FormLabel></FormItem>
                                            </RadioGroup></FormControl><FormMessage />
                                        </FormItem>
                                    )}/>
                                    {customerIdType === 'nic' && (
                                        <div className="grid md:grid-cols-2 gap-4"><FileUploadField name="customerNicFront" label="NIC (Front)" /><FileUploadField name="customerNicBack" label="NIC (Back)" /></div>
                                    )}
                                    {customerIdType === 'license' && (
                                         <div className="grid md:grid-cols-2 gap-4"><FileUploadField name="customerLicenseFront" label="License (Front)" /><FileUploadField name="customerLicenseBack" label="License (Back)" /></div>
                                    )}
                                    <FormField control={form.control} name="customerBillType" render={({ field }) => (
                                        <FormItem className="space-y-2"><FormLabel>Proof of Address</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="lightBill" /></FormControl><FormLabel className="font-normal">Light Bill</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="waterBill" /></FormControl><FormLabel className="font-normal">Water Bill</FormLabel></FormItem>
                                            </RadioGroup></FormControl><FormMessage />
                                        </FormItem>
                                    )}/>
                                    {customerBillType === 'lightBill' && <FileUploadField name="customerLightBill" label="Light Bill" />}
                                    {customerBillType === 'waterBill' && <FileUploadField name="customerWaterBill" label="Water Bill" />}
                                </div>
                            )}
                            {customerResidency === 'tourist' && (
                                 <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-md">
                                    <FileUploadField name="customerPassportFront" label="Passport (Front)" />
                                    <FileUploadField name="customerPassportBack" label="Passport (Back)" />
                                    <FileUploadField name="customerLicenseFront" label="License (Front)" />
                                    <FileUploadField name="customerLicenseBack" label="License (Back)" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Guarantor Information */}
                    <Card>
                        <CardHeader><CardTitle>Guarantor's Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="guarantorName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="guarantorPhone" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="+94 123 456 789" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField control={form.control} name="guarantorNicOrPassport" render={({ field }) => (<FormItem><FormLabel>NIC / Passport Number</FormLabel><FormControl><Input placeholder="Enter guarantor's ID number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </CardContent>
                    </Card>

                     {/* Guarantor Documents */}
                    <Card>
                        <CardHeader><CardTitle>Guarantor's Documents</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={form.control} name="guarantorResidency" render={({ field }) => (
                                <FormItem className="space-y-3"><FormLabel>Residency Status</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="local" /></FormControl><FormLabel className="font-normal">Sri Lankan</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="tourist" /></FormControl><FormLabel className="font-normal">Tourist / Foreign National</FormLabel></FormItem>
                                </RadioGroup></FormControl><FormMessage />
                            </FormItem>
                            )}/>
                             {guarantorResidency === 'local' && (
                                <div className="space-y-4 p-4 border rounded-md">
                                    <FormField control={form.control} name="guarantorIdType" render={({ field }) => (
                                        <FormItem className="space-y-2"><FormLabel>ID Document Type</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="nic" /></FormControl><FormLabel className="font-normal">NIC</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="license" /></FormControl><FormLabel className="font-normal">Driving License</FormLabel></FormItem>
                                            </RadioGroup></FormControl><FormMessage />
                                        </FormItem>
                                    )}/>
                                    {guarantorIdType === 'nic' && (
                                        <div className="grid md:grid-cols-2 gap-4"><FileUploadField name="guarantorNicFront" label="NIC (Front)" /><FileUploadField name="guarantorNicBack" label="NIC (Back)" /></div>
                                    )}
                                    {guarantorIdType === 'license' && (
                                         <div className="grid md:grid-cols-2 gap-4"><FileUploadField name="guarantorLicenseFront" label="License (Front)" /><FileUploadField name="guarantorLicenseBack" label="License (Back)" /></div>
                                    )}
                                    <FormField control={form.control} name="guarantorBillType" render={({ field }) => (
                                        <FormItem className="space-y-2"><FormLabel>Proof of Address</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="lightBill" /></FormControl><FormLabel className="font-normal">Light Bill</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="waterBill" /></FormControl><FormLabel className="font-normal">Water Bill</FormLabel></FormItem>
                                            </RadioGroup></FormControl><FormMessage />
                                        </FormItem>
                                    )}/>
                                    {guarantorBillType === 'lightBill' && <FileUploadField name="guarantorLightBill" label="Light Bill" />}
                                    {guarantorBillType === 'waterBill' && <FileUploadField name="guarantorWaterBill" label="Water Bill" />}
                                </div>
                            )}
                            {guarantorResidency === 'tourist' && (
                                 <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-md">
                                    <FileUploadField name="guarantorPassportFront" label="Passport (Front)" />
                                    <FileUploadField name="guarantorPassportBack" label="Passport (Back)" />
                                    <FileUploadField name="guarantorLicenseFront" label="License (Front)" />
                                    <FileUploadField name="guarantorLicenseBack" label="License (Back)" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<CheckCircle className="mr-2 h-4 w-4" />)}
                        {form.formState.isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </Button>
                </div>
            </div>
         </form>
       </Form>
    </div>
  );
}
