
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Car as CarIcon, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { getAllCars, Car } from '@/lib/data';
import { createBookingRequest } from '@/lib/bookingActions';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const manualBookingSchema = z
  .object({
    carId: z.string().min(1, 'Please select a car.'),
    customerName: z.string().min(2, 'Customer name is required.'),
    customerEmail: z.string().email('Please enter a valid email.'),
    customerPhone: z.string().min(5, 'Please enter a valid phone number.'),
    pickupDate: z.date({ required_error: 'A pickup date is required.' }),
    returnDate: z.date({ required_error: 'A return date is required.' }),
    estimatedKm: z.coerce.number().optional(),
    requests: z.string().max(500).optional(),
  })
  .refine((data) => data.returnDate > data.pickupDate, {
    message: 'Return date must be after pickup date.',
    path: ['returnDate'],
  });

type ManualBookingValues = z.infer<typeof manualBookingSchema>;

export default function ManualBookingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  const form = useForm<ManualBookingValues>({
    resolver: zodResolver(manualBookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      requests: '',
      estimatedKm: undefined,
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchCars() {
      setLoadingCars(true);
      try {
        const availableCars = await getAllCars();
        setCars(availableCars);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load the list of cars.',
        });
      } finally {
        setLoadingCars(false);
      }
    }
    fetchCars();
  }, [toast]);

  async function onSubmit(values: ManualBookingValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a booking.' });
        return;
    }
    const selectedCar = cars.find((car) => car.id === values.carId);
    if (!selectedCar) {
      toast({ variant: 'destructive', title: 'Car not found.' });
      return;
    }

    const bookingData = {
        carId: values.carId,
        carName: selectedCar.name,
        userId: user.uid, 
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        customerResidency: 'local' as const,
        customerNicOrPassport: 'N/A',
        guarantorName: 'N/A',
        guarantorPhone: 'N/A',
        guarantorResidency: 'local' as const,
        guarantorNicOrPassport: 'N/A',
        pickupDate: format(values.pickupDate, 'yyyy-MM-dd'),
        returnDate: format(values.returnDate, 'yyyy-MM-dd'),
        estimatedKm: values.estimatedKm,
        requests: values.requests,
        status: 'confirmed' as const,
    };

    await createBookingRequest(bookingData, new FormData());

    toast({
        title: 'Booking Created!',
        description: 'The manual booking has been successfully recorded.',
    });
    router.push('/admin/bookings');

  }

  if (authLoading || loadingCars) {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Skeleton className="h-10 w-64 mb-8" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-headline font-bold">Manual Booking Entry</h1>
                <p className="text-muted-foreground">
                    Record a new booking for a walk-in or phone customer.
                </p>
            </div>
             <Button variant="outline" asChild>
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Booking Details</CardTitle>
            <CardDescription>
              Fill in the form to create a new confirmed booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="carId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a car from the fleet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cars.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.name} ({car.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Customer Phone</FormLabel>
                        <FormControl>
                            <Input placeholder="+1 555-123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Customer Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="customer@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Pickup Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Return Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < (form.getValues('pickupDate') || new Date())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes / Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Paid in cash, specific pickup instructions..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {form.formState.isSubmitting ? 'Saving...' : 'Create Confirmed Booking'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
