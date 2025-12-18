
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Car } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CarDetailClientProps {
  car: Car;
}

export default function CarDetailClient({ car }: CarDetailClientProps) {
  const router = useRouter();
  const [bookedDays, setBookedDays] = useState<Date[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbApi, setSelectedIndex]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
  }, [mainApi, onSelect]);

  useEffect(() => {
    setIsMounted(true);
    const parsedBookedDays = car.bookedDates.map(dateStr => parseISO(dateStr));
    setBookedDays(parsedBookedDays);
  }, [car.bookedDates]);

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <Card className="overflow-hidden">
            <Carousel className="w-full" setApi={setMainApi}>
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
          
          {car.images.length > 1 && (
            <Card>
              <Carousel setApi={setThumbApi} opts={{ align: "start", slidesToScroll: 1, dragFree: true }}>
                <CarouselContent className="-ml-2 p-2">
                  {car.images.map((imageSrc, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/4 md:basis-1/5 lg:basis-1/6">
                      <div
                        onClick={() => onThumbClick(index)}
                        className={cn(
                          "aspect-square relative rounded-md overflow-hidden cursor-pointer transition-opacity",
                          index === selectedIndex ? "opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-50 hover:opacity-75"
                        )}
                      >
                         <Image
                          src={imageSrc}
                          alt={`${car.name} thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </Card>
          )}

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
            <CardTitle>Availability Calendar</CardTitle>
            <CardDescription>View dates that are already booked for this vehicle.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isMounted ? (
                <Calendar
                    mode="multiple"
                    disabled={bookedDays}
                    selected={bookedDays}
                    className="rounded-md border"
                />
            ) : (
                <Skeleton className="h-[288px] w-[282px] rounded-md" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
