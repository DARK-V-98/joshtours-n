
"use client";

import Image from "next/image";
import Link from "next/link";
import { Car as CarType } from "@/lib/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarCardProps {
  car: CarType;
}

export function CarCard({ car }: CarCardProps) {
  const { currency, getSymbol } = useCurrency();

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-500 bg-card border border-border hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2">
      <CardHeader className="p-0 relative">
        <Carousel className="w-full">
          <CarouselContent>
            {car.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video relative">
                  <Image
                    src={image || "https://placehold.co/600x400.png"}
                    alt={`${car.name} image ${index + 1}`}
                    fill
                    data-ai-hint={car.dataAiHint}
                    className="object-cover w-full h-full"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {car.images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </Carousel>
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "capitalize text-xs font-medium",
              car.type === "luxury" &&
                "bg-primary/10 text-primary border-primary/20",
              car.type === "suv" &&
                "bg-blue-500/10 text-blue-600 border-blue-500/20",
              car.type === "sports" &&
                "bg-red-500/10 text-red-600 border-red-500/20"
            )}
          >
            {car.type}
          </Badge>
          {car.isAvailable ? (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs">
              Available
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Booked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow space-y-2">
        <CardTitle className="text-xl mb-1 font-display group-hover:text-primary transition-colors">
          <Link href={`/cars/${car.id}`}>{car.name}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {car.description || car.type}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-4 flex items-center justify-between border-t border-border">
        {car.priceEnabled && car.pricePerDay && (
          <div className="">
            <span className="text-muted-foreground text-xs">From</span>
            <p className="text-2xl font-display font-bold text-gradient-gold">
              {getSymbol()}
              {car.pricePerDay[currency]}
              <span className="text-sm font-normal text-muted-foreground">
                /day
              </span>
            </p>
          </div>
        )}
        <Button variant="heroOutline" size="sm" asChild>
          <Link href={`/cars/${car.id}`} className="flex items-center gap-2">
            View Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
