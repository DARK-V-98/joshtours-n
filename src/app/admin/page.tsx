
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { addCar, uploadImages } from "@/lib/carActions";
import { getPendingBookingCount } from "@/lib/bookingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Upload, PlusCircle, DollarSign, Notebook, Edit, List, FilePlus, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CarList } from "@/components/admin/car-list";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TestimonialList } from "@/components/admin/testimonial-list";
import { getPendingTestimonialCount } from "@/lib/testimonialActions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const carFormSchema = z.object({
  name: z.string().min(2, "Car name must be at least 2 characters."),
  type: z.string().optional(),
  isAvailable: z.boolean().default(true),
  pricePerDay: z.object({
    usd: z.coerce.number().min(0, "Price must be a positive number."),
    lkr: z.coerce.number().min(0, "Price must be a positive number."),
    eur: z.coerce.number().min(0, "Price must be a positive number."),
  }),
  priceEnabled: z.boolean().default(true),
  images: z
    .custom<FileList>()
    .refine((files) => files?.length >= 1, "Please add at least one image.")
    .refine((files) => !files || Array.from(files).every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 5MB.`)
    .refine(
      (files) => !files || Array.from(files).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  specifications: z.string().optional(),
});

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formKey, setFormKey] = useState(Date.now());
  const [pendingBookings, setPendingBookings] = useState(0);
  const [pendingTestimonials, setPendingTestimonials] = useState(0);
  const [activeTab, setActiveTab] = useState("fleet");

  const form = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: "",
      type: "",
      isAvailable: true,
      pricePerDay: {
        usd: 50,
        lkr: 15000,
        eur: 45,
      },
      priceEnabled: true,
      specifications: "",
    },
  });

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchPendingCounts = async () => {
        const bookingCount = await getPendingBookingCount();
        const testimonialCount = await getPendingTestimonialCount();
        setPendingBookings(bookingCount);
        setPendingTestimonials(testimonialCount);
    };

    fetchPendingCounts();
  }, [user, loading, router]);


  async function onSubmit(values: z.infer<typeof carFormSchema>) {
    const formData = new FormData();
    Array.from(values.images).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const imageUrls = await uploadImages(formData);
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error("Image upload failed, no URLs returned.");
      }
      
      const carData = {
        name: values.name,
        type: values.type || '',
        isAvailable: values.isAvailable,
        pricePerDay: values.pricePerDay,
        priceEnabled: values.priceEnabled,
        specifications: values.specifications ? values.specifications.split('\\n').filter(spec => spec.trim() !== '') : [],
      };

      await addCar(carData, imageUrls);

      toast({
        title: "Success!",
        description: `The car "${values.name}" has been added successfully.`,
      });
      form.reset();
      setSelectedFiles([]);
      setFormKey(Date.now()); // This forces a re-render of CarList
      setActiveTab("fleet"); // Switch back to the fleet view
    } catch (error) {
      console.error("Failed to add car:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add the car. Please try again.",
      });
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null; 
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage your vehicle inventory and customer bookings from here.
        </p>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Button asChild>
                    <Link href="/admin/bookings" className="relative">
                        <Notebook className="mr-2" />
                        Manage Bookings
                        {pendingBookings > 0 && (
                            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                                {pendingBookings}
                            </div>
                        )}
                    </Link>
                </Button>
                <Button variant="secondary" asChild>
                    <Link href="/admin/manual-booking">
                        <Edit className="mr-2" />
                        Manual Booking
                    </Link>
                </Button>
            </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full overflow-x-auto h-auto justify-start sm:justify-center">
                <TabsTrigger value="fleet">Manage Fleet</TabsTrigger>
                <TabsTrigger value="add">Add New Car</TabsTrigger>
                <TabsTrigger value="testimonials" className="relative">
                  Manage Testimonials
                   {pendingTestimonials > 0 && (
                      <div className="absolute top-0 right-0 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                          {pendingTestimonials}
                      </div>
                  )}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="fleet">
                 <CarList key={formKey} />
            </TabsContent>
            <TabsContent value="add">
                 <Card>
                    <CardHeader>
                        <CardTitle>Add New Car</CardTitle>
                        <CardDescription>
                        Fill out the details below to add a new car to your fleet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Car Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Toyota Camry" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Car Type / Description (Optional)</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Sedan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            </div>

                            <Card className="bg-card/50">
                                <CardHeader><CardTitle className="text-lg flex items-center"><List className="mr-2 h-5 w-5"/>Specifications</CardTitle></CardHeader>
                                <CardContent>
                                     <FormField
                                        control={form.control}
                                        name="specifications"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Features (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g., 5 Seats\nAutomatic Transmission\n2.5L Engine" {...field} rows={5} />
                                            </FormControl>
                                            <FormDescription>
                                                List each feature on a new line. This will be shown to customers.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50">
                            <CardHeader><CardTitle className="text-lg">Pricing (Per Day)</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                control={form.control}
                                name="pricePerDay.usd"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>USD ($)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" placeholder="e.g., 50" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="pricePerDay.lkr"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>LKR (Rs)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs</span>
                                        <Input type="number" placeholder="e.g., 15000" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="pricePerDay.eur"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>EUR (€)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">€</span>
                                        <Input type="number" placeholder="e.g., 45" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </CardContent>
                            </Card>


                            <FormField
                            control={form.control}
                            name="images"
                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                <FormItem>
                                <FormLabel>Car Images</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Input 
                                        {...fieldProps}
                                        type="file"
                                        multiple
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(event) => {
                                            const files = event.target.files;
                                            if (files && files.length > 0) {
                                                onChange(files);
                                                setSelectedFiles(Array.from(files));
                                            }
                                        }}
                                    />
                                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card/50 hover:bg-card/70 transition-colors">
                                        <div className="text-center">
                                            <Upload className="mx-auto h-8 w-8 text-muted-foreground"/>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP up to 5MB each</p>
                                        </div>
                                    </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        Selected: {selectedFiles.map(file => file.name).join(', ')}
                                    </div>
                                )}
                                </FormItem>
                            )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <FormField
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Availability</FormLabel>
                                        <FormDescription>
                                        Is this car available for rent?
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="priceEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Show Price</FormLabel>
                                        <FormDescription>
                                            Display the price on the website.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                            </div>

                            <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">
                            {form.formState.isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <PlusCircle className="mr-2 h-4 w-4" />
                            )}
                            {form.formState.isSubmitting ? 'Adding Car...' : 'Add Car to Fleet'}
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                    </Card>
            </TabsContent>
             <TabsContent value="testimonials">
                <TestimonialList />
            </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
