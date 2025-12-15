export interface Car {
  id: string;
  name: string;
  type: 'sedan' | 'suv' | 'luxury' | 'sports' | 'van';
  images: string[];
  isAvailable: boolean;
  pricePerDay: {
    usd: number;
    lkr: number;
    eur: number;
  };
  priceEnabled: boolean;
  specifications: string[];
  bookedDates: string[];
  description: string;
  seats: number;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
}

export const cars: Car[] = [
  {
    id: "1",
    name: "Mercedes-Benz S-Class",
    type: "luxury",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop"
    ],
    isAvailable: true,
    pricePerDay: { usd: 350, lkr: 105000, eur: 320 },
    priceEnabled: true,
    specifications: ["Leather Interior", "Panoramic Sunroof", "Massage Seats", "Air Suspension"],
    bookedDates: ["2024-12-15", "2024-12-16"],
    description: "Experience ultimate luxury with the Mercedes-Benz S-Class. Perfect for business executives and special occasions.",
    seats: 5,
    transmission: "automatic",
    fuelType: "petrol"
  },
  {
    id: "2",
    name: "BMW 7 Series",
    type: "luxury",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&auto=format&fit=crop"
    ],
    isAvailable: true,
    pricePerDay: { usd: 320, lkr: 96000, eur: 290 },
    priceEnabled: true,
    specifications: ["Executive Lounge", "Theater Screen", "Night Vision", "Gesture Control"],
    bookedDates: [],
    description: "The BMW 7 Series combines cutting-edge technology with unmatched comfort for the discerning traveler.",
    seats: 5,
    transmission: "automatic",
    fuelType: "hybrid"
  },
  {
    id: "3",
    name: "Range Rover Vogue",
    type: "suv",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop"
    ],
    isAvailable: true,
    pricePerDay: { usd: 400, lkr: 120000, eur: 365 },
    priceEnabled: true,
    specifications: ["All-Terrain Capability", "Premium Audio", "Air Suspension", "360° Camera"],
    bookedDates: ["2024-12-20"],
    description: "Conquer any terrain in style with the Range Rover Vogue. Luxury meets capability.",
    seats: 5,
    transmission: "automatic",
    fuelType: "diesel"
  },
  {
    id: "4",
    name: "Porsche 911 Carrera",
    type: "sports",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop"
    ],
    isAvailable: true,
    pricePerDay: { usd: 500, lkr: 150000, eur: 455 },
    priceEnabled: true,
    specifications: ["450 HP", "0-100 in 4.0s", "Sport Chrono Package", "PASM Suspension"],
    bookedDates: [],
    description: "Feel the thrill of driving with the iconic Porsche 911. Pure sports car perfection.",
    seats: 2,
    transmission: "automatic",
    fuelType: "petrol"
  },
  {
    id: "5",
    name: "Toyota Land Cruiser",
    type: "suv",
    images: [
      "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1669215420018-30e0eec7f5c6?w=800&auto=format&fit=crop"
    ],
    isAvailable: true,
    pricePerDay: { usd: 250, lkr: 75000, eur: 228 },
    priceEnabled: true,
    specifications: ["4WD", "7 Seats", "Off-Road Package", "Premium Interior"],
    bookedDates: [],
    description: "Reliable and rugged, the Land Cruiser is perfect for Sri Lankan adventures.",
    seats: 7,
    transmission: "automatic",
    fuelType: "diesel"
  },
  {
    id: "6",
    name: "Toyota HiAce",
    type: "van",
    images: [
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop"
    ],
    isAvailable: true,
    pricePerDay: { usd: 180, lkr: 54000, eur: 165 },
    priceEnabled: true,
    specifications: ["14 Seats", "Air Conditioning", "Luggage Space", "WiFi"],
    bookedDates: [],
    description: "Perfect for group travel and tours. Comfortable seating for up to 14 passengers.",
    seats: 14,
    transmission: "manual",
    fuelType: "diesel"
  }
];

export const testimonials = [
  {
    id: "1",
    name: "James Anderson",
    rating: 5,
    comment: "Exceptional service! The Mercedes S-Class was immaculate and Josh Tours made our business trip unforgettable. Highly recommended!",
    status: "approved",
    location: "London, UK"
  },
  {
    id: "2",
    name: "Sarah Mitchell",
    rating: 5,
    comment: "Best car rental experience in Sri Lanka. Professional drivers and pristine vehicles. We'll definitely use Josh Tours again.",
    status: "approved",
    location: "Sydney, Australia"
  },
  {
    id: "3",
    name: "Raj Patel",
    rating: 5,
    comment: "The Range Rover was perfect for our hill country adventure. The team went above and beyond to accommodate our requests.",
    status: "approved",
    location: "Mumbai, India"
  }
];

export const carTypes = [
  { value: 'all', label: 'All Vehicles' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'sports', label: 'Sports' },
  { value: 'van', label: 'Van' }
];
