
"use client";

import { CarCard } from "@/components/car-card";
import { Car } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Car as CarIcon, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface CarListPageClientProps {
    initialCars: Car[];
    carTypes: string[];
}

export default function CarListPageClient({ initialCars, carTypes }: CarListPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  const filteredAndSortedCars = useMemo(() => {
    let filtered = initialCars;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(car =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(car => car.type === filterType);
    }

    // Sort
    if (sortOrder === "price-asc") {
      filtered.sort((a, b) => a.pricePerDay.usd - b.pricePerDay.usd);
    } else if (sortOrder === "price-desc") {
      filtered.sort((a, b) => b.pricePerDay.usd - a.pricePerDay.usd);
    }

    return filtered;
  }, [initialCars, searchTerm, filterType, sortOrder]);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          Explore Our <span className="text-gradient-gold">Vehicles</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Find the perfect car for your next adventure. We have a wide range of
          vehicles to suit your needs.
        </p>
      </div>

      <div className="mb-8 p-4 bg-card rounded-lg border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input 
                placeholder="Search by car name..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {carTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Sorting</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <Alert>
            <CarIcon className="h-4 w-4" />
            <AlertTitle>No Vehicles Found</AlertTitle>
            <AlertDescription>
                There are currently no vehicles matching your criteria. Please try adjusting your filters.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
