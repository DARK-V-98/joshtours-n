import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/cars/CarCard";
import { cars } from "@/data/cars";
import { ArrowRight } from "lucide-react";

export function FeaturedCars() {
  const featuredCars = cars.slice(0, 3);

  return (
    <section className="py-24 relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            Our Fleet
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Featured <span className="text-gradient-gold">Vehicles</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover our handpicked selection of premium vehicles, each maintained to the highest standards for your comfort and safety.
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCars.map((car, index) => (
            <CarCard key={car.id} car={car} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="heroOutline" size="lg" asChild>
            <Link to="/cars" className="flex items-center gap-2">
              View All Vehicles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
