import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Award } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&auto=format&fit=crop"
          alt="Rental car"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-gold" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-24">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4 animate-slide-up">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              Car Rental in Sri Lanka
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Drive Your Journey
              <span className="block text-gradient-gold">In Style</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Experience unparalleled comfort and service with our premium fleet. 
              From elegant sedans to practical SUVs, discover the perfect vehicle for your trip.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/cars" className="flex items-center gap-2">
                Explore Fleet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/contact">Get a Quote</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 animate-slide-up" style={{ animationDelay: "400ms" }}>
            {[
              { icon: Shield, label: "Fully Insured", desc: "Complete coverage" },
              { icon: Clock, label: "24/7 Support", desc: "Always available" },
              { icon: Award, label: "Best Rates", desc: "Price guaranteed" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl glass-gold">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
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
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
}
