
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Loader2, Check, X, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllTestimonials, updateTestimonialStatus, deleteTestimonial, Testimonial } from "@/lib/testimonialActions";
import { format } from "date-fns";

export function TestimonialList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, startUpdateTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTestimonials() {
      setLoading(true);
      try {
        const fetchedTestimonials = await getAllTestimonials();
        setTestimonials(fetchedTestimonials);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch testimonials.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, [toast]);
  
  const handleStatusUpdate = (id: string, status: 'approved' | 'pending') => {
    startUpdateTransition(async () => {
        try {
            await updateTestimonialStatus(id, status);
            setTestimonials(prev => prev.map(t => t.id === id ? {...t, status} : t));
            toast({ title: 'Success', description: `Testimonial has been ${status}.`});
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.'});
        }
    });
  }

  const handleDelete = (id: string) => {
    startUpdateTransition(async () => {
        try {
            await deleteTestimonial(id);
            setTestimonials(prev => prev.filter(t => t.id !== id));
            toast({ title: 'Success', description: 'Testimonial has been deleted.'});
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete testimonial.'});
        }
    });
  }


  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Testimonials</CardTitle>
                <CardDescription>Review, approve, or delete customer testimonials.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead className="hidden sm:table-cell"><Skeleton className="h-5 w-48" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Testimonials</CardTitle>
        <CardDescription>
          Review, approve, or delete customer testimonials. Approved testimonials will appear on the homepage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Comment</TableHead>
                <TableHead className="hidden md:table-cell">Rating</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                    <TableCell className="font-medium">
                        <div className="font-bold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(testimonial.createdAt), "PPP")}</div>
                         <div className="lg:hidden mt-2">
                             <Badge variant={testimonial.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{testimonial.status}</Badge>
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <p className="max-w-xs truncate">{testimonial.comment}</p>
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}/>
                            ))}
                        </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <Badge variant={testimonial.status === 'approved' ? 'default' : 'secondary'} className="capitalize">
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {testimonial.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {testimonial.status === 'pending' ? (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(testimonial.id, 'approved')}>
                                    <Check className="mr-2 h-4 w-4"/> Approve
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(testimonial.id, 'pending')}>
                                    <X className="mr-2 h-4 w-4"/> Mark as Pending
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                onClick={() => handleDelete(testimonial.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    No testimonials submitted yet.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
