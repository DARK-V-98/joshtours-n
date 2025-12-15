import { Link } from "react-router-dom";
import { Car } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Fuel, Settings2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car: Car;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  return (
    <div
      className="group bg-gradient-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 shadow-card hover:shadow-elevated animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={car.images[0]}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "capitalize text-xs font-medium",
              car.type === "luxury" && "bg-primary/20 text-primary border-primary/30",
              car.type === "sports" && "bg-red-500/20 text-red-400 border-red-500/30"
            )}
          >
            {car.type}
          </Badge>
          {car.isAvailable ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Available
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              Booked
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {car.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {car.description}
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span>{car.seats}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="capitalize">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-primary" />
            <span className="capitalize">{car.fuelType}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-muted-foreground text-xs">From</span>
            <p className="text-2xl font-display font-bold text-gradient-gold">
              ${car.pricePerDay.usd}
              <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
          </div>
          <Button variant="heroOutline" size="sm" asChild>
            <Link to={`/cars/${car.id}`} className="flex items-center gap-2">
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
