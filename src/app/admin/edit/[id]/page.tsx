
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCarById, Car } from "@/lib/data";
import { updateCar } from "@/lib/carActions";
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
import { Loader2, Save, DollarSign, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const carFormSchema = z.object({
  name: z.string().min(2, "Car name must be at least 2 characters."),
  type: z.string().min(2, "Car type must be at least 2 characters."),
  isAvailable: z.boolean().default(true),
  pricePerDay: z.object({
    usd: z.coerce.number().min(0, "Price must be a positive number."),
    lkr: z.coerce.number().min(0, "Price must be a positive number."),
    eur: z.coerce.number().min(0, "Price must be a positive number."),
  }),
  priceEnabled: z.boolean().default(true),
  specifications: z.string().min(1, "Please provide car specifications."),
  bookedDates: z.array(z.string()).default([]),
});

type CarFormValues = z.infer<typeof carFormSchema>;

export default function EditCarPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const carId = Array.isArray(params.id) ? params.id[0] : params.id;

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!carId) return;

    const fetchCarData = async () => {
      setLoading(true);
      try {
        const carData = await getCarById(carId);
        if (carData) {
          setCar(carData);
          form.reset({
            name: carData.name,
            type: carData.type,
            isAvailable: carData.isAvailable,
            pricePerDay: carData.pricePerDay,
            priceEnabled: carData.priceEnabled,
            specifications: carData.specifications.join("\n"),
            bookedDates: carData.bookedDates || [],
          });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Car not found." });
          router.push("/admin");
        }
      } catch (error) {
        console.error("Failed to fetch car data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load car data." });
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [carId, form, router, toast]);

  async function onSubmit(values: CarFormValues) {
    try {
      const updatedValues = {
          ...values,
          specifications: values.specifications.split('\n').filter(spec => spec.trim() !== '')
      }
      await updateCar(carId, updatedValues);
      toast({
        title: "Success!",
        description: `The car "${values.name}" has been updated successfully.`,
      });
      router.push("/admin");
    } catch (error) {
      console.error("Failed to update car:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the car. Please try again.",
      });
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-headline font-bold mb-2">Edit Car</h1>
        <p className="text-muted-foreground mb-8">
          Modify the details for "{car.name}". Image editing is not supported.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
            <CardDescription>
              Make your changes below and click save.
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
                        <FormLabel>Car Type / Description</FormLabel>
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
                                <FormLabel>Features</FormLabel>
                                <FormControl>
                                <Textarea placeholder="e.g., 5 Seats&#10;Automatic Transmission&#10;2.5L Engine" {...field} rows={5} />
                                </FormControl>
                                <FormDescription>
                                    List each feature on a new line.
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

                <Card>
                    <CardHeader>
                        <CardTitle>Manage Booked Dates</CardTitle>
                        <CardDescription>Select dates on the calendar to mark them as booked or available. Booked dates will be disabled for customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Controller
                            control={form.control}
                            name="bookedDates"
                            render={({ field }) => {
                                const bookedDateObjects = field.value.map(d => parse(d, 'yyyy-MM-dd', new Date()));

                                return (
                                    <Calendar
                                        mode="multiple"
                                        selected={bookedDateObjects}
                                        onSelect={(dates) => {
                                            if (dates) {
                                                const formattedDates = dates.map(d => format(d, 'yyyy-MM-dd'));
                                                field.onChange(formattedDates);
                                            }
                                        }}
                                        className="rounded-md border"
                                    />
                                );
                            }}
                        />
                    </CardContent>
                </Card>


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

                <div className="flex gap-4">
                  <Button type="button" variant="outline" asChild>
                     <Link href="/admin">Cancel</Link>
                  </Button>
                  <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="flex-1">
                    {form.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {form.formState.isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
