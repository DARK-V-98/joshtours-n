
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { addCar, uploadImages } from "@/lib/carActions";
import { getAdminStats, AdminStats } from "@/lib/bookingActions";
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
import {
  Loader2, Upload, PlusCircle, DollarSign, List,
  Car, Clock, CheckCircle, XCircle, Activity, TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CarList } from "@/components/admin/car-list";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TestimonialList } from "@/components/admin/testimonial-list";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const carFormSchema = z.object({
  name: z.string().min(2, "Car name must be at least 2 characters."),
  type: z.string().optional(),
  isAvailable: z.boolean().default(true),
  pricePerDay: z.object({
    usd: z.coerce.number().min(0),
    lkr: z.coerce.number().min(0),
    eur: z.coerce.number().min(0),
  }),
  priceEnabled: z.boolean().default(true),
  images: z
    .custom<FileList>()
    .refine((files) => files?.length >= 1, "Please add at least one image.")
    .refine(
      (files) => !files || Array.from(files).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  specifications: z.string().optional(),
});

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formKey, setFormKey] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("fleet");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const form = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: "",
      type: "",
      isAvailable: true,
      pricePerDay: { usd: 50, lkr: 15000, eur: 45 },
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
    getAdminStats().then((s) => {
      setStats(s);
      setStatsLoading(false);
    });
  }, [user, loading, router]);

  async function onSubmit(values: z.infer<typeof carFormSchema>) {
    const formData = new FormData();
    Array.from(values.images).forEach((file) => formData.append("images", file));
    try {
      const imageUrls = await uploadImages(formData);
      if (!imageUrls || imageUrls.length === 0) throw new Error("Image upload failed.");
      await addCar(
        {
          name: values.name,
          type: values.type ?? "",
          isAvailable: values.isAvailable,
          pricePerDay: values.pricePerDay,
          priceEnabled: values.priceEnabled,
          specifications: (values.specifications || "") as unknown as string[],
        },
        imageUrls
      );
      toast({ title: "Success!", description: `"${values.name}" added to fleet.` });
      form.reset();
      setSelectedFiles([]);
      setFormKey(Date.now());
      setActiveTab("fleet");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add car." });
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your fleet, bookings, and customers.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={Activity} color="bg-blue-500/10 text-blue-500" loading={statsLoading} />
        <StatCard title="Pending" value={stats?.pendingBookings ?? 0} icon={Clock} color="bg-yellow-500/10 text-yellow-500" loading={statsLoading} />
        <StatCard title="Confirmed" value={stats?.confirmedBookings ?? 0} icon={CheckCircle} color="bg-green-500/10 text-green-500" loading={statsLoading} />
        <StatCard title="Canceled" value={stats?.canceledBookings ?? 0} icon={XCircle} color="bg-red-500/10 text-red-500" loading={statsLoading} />
        <StatCard title="Active Rentals" value={stats?.activeRentals ?? 0} icon={Car} color="bg-primary/10 text-primary" loading={statsLoading} />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Bookings — Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.monthlyBookings ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="count" name="Bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Fleet / Add Car / Testimonials Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full overflow-x-auto h-auto justify-start">
          <TabsTrigger value="fleet">Manage Fleet</TabsTrigger>
          <TabsTrigger value="add">Add New Car</TabsTrigger>
          <TabsTrigger value="testimonials" className="relative">
            Manage Testimonials
            {(stats?.pendingBookings ?? 0) > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                !
              </span>
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
              <CardDescription>Fill out the details below to add a new car to your fleet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Toyota Camry" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Type / Description (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g., Sedan" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Card className="bg-card/50">
                    <CardHeader><CardTitle className="text-lg flex items-center"><List className="mr-2 h-5 w-5" />Specifications</CardTitle></CardHeader>
                    <CardContent>
                      <FormField control={form.control} name="specifications" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Features (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., 5 Seats&#10;Automatic Transmission&#10;2.5L Engine" {...field} rows={5} />
                          </FormControl>
                          <FormDescription>List each feature on a new line.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardHeader><CardTitle className="text-lg">Pricing (Per Day)</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="pricePerDay.usd" render={({ field }) => (
                        <FormItem>
                          <FormLabel>USD ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="number" placeholder="50" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="pricePerDay.lkr" render={({ field }) => (
                        <FormItem>
                          <FormLabel>LKR (Rs)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs</span>
                              <Input type="number" placeholder="15000" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="pricePerDay.eur" render={({ field }) => (
                        <FormItem>
                          <FormLabel>EUR (€)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">€</span>
                              <Input type="number" placeholder="45" className="pl-8" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  <FormField control={form.control} name="images" render={({ field: { value, onChange, ...fieldProps } }) => (
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
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                              <p className="mt-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Selected: {selectedFiles.map((f) => f.name).join(", ")}
                        </div>
                      )}
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormField control={form.control} name="isAvailable" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Availability</FormLabel>
                          <FormDescription>Is this car available for rent?</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="priceEnabled" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Show Price</FormLabel>
                          <FormDescription>Display the price on the website.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-2 h-4 w-4" />
                    )}
                    {form.formState.isSubmitting ? "Adding Car..." : "Add Car to Fleet"}
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
  );
}
