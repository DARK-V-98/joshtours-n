
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
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
import { Star, Loader2, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { createTestimonial } from '@/lib/testimonialActions';
import Link from 'next/link';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  comment: z
    .string()
    .min(10, 'Your testimonial must be at least 10 characters long.')
    .max(500, 'Your testimonial cannot exceed 500 characters.'),
  rating: z.number().min(1).max(5),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export default function AddTestimonialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
   const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      comment: '',
      rating: 0,
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?redirect=/add-testimonial');
      return;
    }
    form.setValue('name', user.displayName || '');
  }, [user, authLoading, router, form]);

  useEffect(() => {
    form.setValue('rating', rating);
  }, [rating, form]);

  async function onSubmit(values: TestimonialFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to submit a testimonial.'});
        return;
    }
    
    try {
        await createTestimonial({
            userId: user.uid,
            name: values.name,
            comment: values.comment,
            rating: values.rating,
        });
        toast({
            title: 'Testimonial Submitted!',
            description: 'Thank you for your feedback. It will be reviewed by our team shortly.',
        });
        setIsSubmitted(true);
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Submission Error', description: 'Could not submit your testimonial. Please try again.'});
    }
  }
  
  if (isSubmitted) {
      return (
         <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
            <Card className="max-w-2xl text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-headline mt-4">Thank You!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Your testimonial has been submitted successfully and is now pending review. We appreciate you taking the time to share your experience.
                    </p>
                    <Button size="lg" className="flex-1" asChild>
                        <Link href="/my-bookings">
                            <ArrowLeft className="mr-2"/>Back to My Bookings
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Share Your Experience</CardTitle>
            <CardDescription>We'd love to hear about your rental with JOSH TOURS. Your feedback helps us improve.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Rating</FormLabel>
                        <FormControl>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer transition-colors ${
                                        (hoverRating || rating) >= star
                                        ? 'text-primary fill-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Testimonial</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us what you loved about our service..." {...field} rows={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                   {form.formState.isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
