
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Car } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { parse, startOfDay, isSameDay } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface CarDetailClientProps {
  car: Car;
}

export default function CarDetailClient({ car }: CarDetailClientProps) {
  const router = useRouter();
  
  // Memoize the disabled dates calculation to avoid re-computing on every render
  const bookedDateObjects = useMemo(() => {
    return car.bookedDates.map(d => {
        try {
            return startOfDay(parse(d, 'yyyy-MM-dd', new Date()));
        } catch (e) {
            console.warn(`Invalid date format found in bookedDates: ${d}`);
            return null;
        }
    }).filter(d => d !== null) as Date[];
  }, [car.bookedDates]);

  // Disable past dates and already booked dates
  const isDisabled = (day: Date) => {
    const today = startOfDay(new Date());
    if (day < today) return true;
    
    return bookedDateObjects.some(
      (disabledDate) => isSameDay(day, disabledDate)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {car.images.map((imageSrc, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative">
                      <Image
                        src={imageSrc}
                        alt={`${car.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
               {car.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </>
                )}
            </Carousel>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-headline font-bold mb-1">{car.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{car.type}</p>

          <div className="flex items-center gap-2 mb-4">
            {car.isAvailable ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Available
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Not Available
              </Badge>
            )}
          </div>

          {car.priceEnabled && (
            <div className="text-4xl font-bold mb-4">
                <span className="text-gradient-gold">${car.pricePerDay['usd']}</span>
                <span className="text-xl font-normal text-muted-foreground">/day</span>
            </div>
           )}

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Check Availability First!</AlertTitle>
            <AlertDescription>
              Please review the calendar below to see booked dates before proceeding with your rental.
            </AlertDescription>
          </Alert>

          <div className="flex items-stretch gap-4 mb-6">
            <Button size="lg" className="flex-1 h-12 text-lg" disabled={!car.isAvailable} asChild>
                <Link href={`/book/${car.id}`}>
                    {car.isAvailable ? 'Rent Now' : 'Currently Unavailable'}
                </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                  {car.specifications.map((spec, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{spec}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Check Availability</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
                mode="multiple"
                selected={bookedDateObjects}
                className="rounded-md border"
                disabled={isDisabled}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
