
"use client";

import Link from "next/link";
import { Car as CarType } from "@/lib/data";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Users, Fuel, Settings2, Star } from "lucide-react";
import React, { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car: CarType;
  featured?: boolean;
}

function getSpec(specs: string[], keyword: string) {
  return specs.find((s) => s.toLowerCase().includes(keyword.toLowerCase()));
}

export function CarCard({ car, featured = false }: CarCardProps) {
  const { currency, getSymbol } = useCurrency();
  const [imgIdx, setImgIdx] = useState(0);

  const seats = getSpec(car.specifications, "seat");
  const transmission = getSpec(car.specifications, "automatic") || getSpec(car.specifications, "manual");
  const engine = getSpec(car.specifications, "engine") || getSpec(car.specifications, "cc") || getSpec(car.specifications, "liter");

  if (featured) {
    return (
      <Link href={`/cars/${car.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-2xl">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={car.images[imgIdx] || "https://placehold.co/800x500.png"}
            alt={car.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/60 backdrop-blur-sm text-white border-white/20 text-xs capitalize">
              {car.type}
            </Badge>
            {car.isAvailable ? (
              <Badge className="bg-green-500/90 text-white border-0 text-xs">Available</Badge>
            ) : (
              <Badge className="bg-red-500/90 text-white border-0 text-xs">Booked</Badge>
            )}
          </div>

          {/* Image dots */}
          {car.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {car.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                  className={cn("w-1.5 h-1.5 rounded-full transition-all", i === imgIdx ? "bg-white w-4" : "bg-white/50")}
                />
              ))}
            </div>
          )}

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-display text-2xl font-bold text-white mb-1">{car.name}</h3>
            {car.priceEnabled && car.pricePerDay && (
              <p className="text-primary font-bold text-xl">
                {getSymbol()}{car.pricePerDay[currency]}
                <span className="text-white/60 text-sm font-normal"> / day</span>
              </p>
            )}
          </div>
        </div>

        {/* Specs bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-card border-t border-border">
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            {seats && (
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" />{seats}</span>
            )}
            {transmission && (
              <span className="flex items-center gap-1.5"><Settings2 className="w-4 h-4 text-primary" />{transmission.split(" ")[0]}</span>
            )}
            {engine && (
              <span className="flex items-center gap-1.5"><Fuel className="w-4 h-4 text-primary" />{engine}</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
            View Details <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/cars/${car.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={car.images[imgIdx] || "https://placehold.co/600x400.png"}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge className="bg-black/60 backdrop-blur-sm text-white border-white/20 text-xs capitalize">
            {car.type}
          </Badge>
          {car.isAvailable ? (
            <Badge className="bg-green-500/90 text-white border-0 text-xs">Available</Badge>
          ) : (
            <Badge className="bg-red-500/90 text-white border-0 text-xs">Booked</Badge>
          )}
        </div>

        {/* Image switcher dots */}
        {car.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {car.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                className={cn("w-1.5 h-1.5 rounded-full transition-all", i === imgIdx ? "bg-white w-3" : "bg-white/50")}
              />
            ))}
          </div>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-bold text-white leading-tight">{car.name}</h3>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Quick specs */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {seats && (
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-primary" />{seats}</span>
          )}
          {transmission && (
            <span className="flex items-center gap-1"><Settings2 className="w-3.5 h-3.5 text-primary" />{transmission.split(" ")[0]}</span>
          )}
          {engine && (
            <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-primary" />{engine}</span>
          )}
          {!seats && !transmission && !engine && (
            <span className="text-muted-foreground italic">{car.description}</span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          {car.priceEnabled && car.pricePerDay ? (
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-xl font-display font-bold text-gradient-gold leading-tight">
                {getSymbol()}{car.pricePerDay[currency]}
                <span className="text-xs font-normal text-muted-foreground">/day</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Contact for price</p>
          )}
          <Button variant="heroOutline" size="sm" className="gap-1.5 group-hover:gap-2.5 transition-all">
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
