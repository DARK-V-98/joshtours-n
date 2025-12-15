
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Star, Shield, Clock, Users, Car, Zap, CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { getFeaturedCars, Car as CarType } from "@/lib/data";
import Link from "next/link";
import { CarCard } from "@/components/car-card";
import { getApprovedTestimonials, Testimonial } from "@/lib/testimonialActions";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyProvider } from "@/context/CurrencyContext";

function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/car1.png"
          alt="Rental car"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-gold" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />


      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                Quality Car Rental in Sri Lanka
              </span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Drive Your Journey
                <span className="block text-gradient-gold">In Style</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Experience unparalleled comfort and service with our quality fleet. 
                From elegant sedans to practical SUVs, discover the perfect vehicle for your trip.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Button variant="hero" size="xl" asChild>
                <Link href="/cars" className="flex items-center gap-2">
                  Explore Fleet
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link href="/contact">Get a Quote</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 animate-slide-up" style={{ animationDelay: "400ms" }}>
              {[
                { icon: Users, label: "500+ Happy Customers", desc: "Trusted by many" },
                { icon: Clock, label: "24/7 Support", desc: "Always available" },
                { icon: Star, label: "Best Rates", desc: "Price guaranteed" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-4 p-4 rounded-xl glass-gold">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center">
            <Image 
              src="/rtm.png"
              alt="JOSH TOURS Logo"
              width={400}
              height={400}
              className="rounded-full object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const features = [
    {
      icon: Car,
      title: "Quality Fleet",
      description: "From practical sedans to spacious SUVs, our vehicles are meticulously maintained and always pristine."
    },
    {
      icon: Shield,
      title: "Full Insurance",
      description: "Travel with peace of mind knowing every rental comes with comprehensive insurance coverage."
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Our dedicated team is always available to assist you, day or night."
    },
    {
      icon: Star,
      title: "Best Rates",
      description: "Competitive pricing with no hidden fees. We guarantee the best value."
    }
  ];

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            Why Choose Us
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            The Josh Tours <span className="text-gradient-gold">Difference</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We don't just rent cars – we deliver exceptional experiences that make your journey unforgettable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCars() {
  const [featuredCars, setFeaturedCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const cars = await getFeaturedCars();
        setFeaturedCars(cars);
      } catch (error) {
        console.error("Failed to fetch featured cars:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            Our Fleet
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Featured <span className="text-gradient-gold">Vehicles</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover our handpicked selection of quality vehicles, each maintained to the highest standards for your comfort and safety.
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)
          ) : (
            featuredCars.map((car, index) => (
              <CarCard key={car.id} car={car} />
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="heroOutline" size="lg" asChild>
            <Link href="/cars" className="flex items-center gap-2">
              View All Vehicles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const approvedTestimonials = await getApprovedTestimonials();
        setTestimonials(approvedTestimonials);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            What Our <span className="text-gradient-gold">Clients Say</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't just take our word for it. Here's what our valued customers have to say about their experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {loading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
          ) : testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
              <Card key={testimonial.id} className="p-8 rounded-2xl bg-card border border-border">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-foreground/90 leading-relaxed mb-6">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
             <p className="text-muted-foreground text-center col-span-full">No testimonials yet. Be the first to share your experience!</p>
          )}
        </div>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/car1.png"
          alt="Car interior"
          fill
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Ready to Start <span className="text-gradient-gold">Your Journey?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Book your ideal car today and discover why Josh Tours is the preferred choice for travelers in Sri Lanka.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link href="/cars" className="flex items-center gap-2">
                Browse Fleet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="tel:+94771234567" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


export default function Index() {
  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Hero />
        <WhyChooseUs />
        <FeaturedCars />
        <Testimonials />
        <CTASection />
      </div>
    </CurrencyProvider>
  );
};
