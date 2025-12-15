import { Car } from "@/data/cars";
import { CarCard } from "./CarCard";

interface CarListProps {
  cars: Car[];
}

export function CarList({ cars }: CarListProps) {
  if (cars.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No vehicles found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cars.map((car, index) => (
        <CarCard key={car.id} car={car} index={index} />
      ))}
    </div>
  );
}
