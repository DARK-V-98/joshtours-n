import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&auto=format&fit=crop"
          alt="Luxury car interior"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Ready to Experience <span className="text-gradient-gold">Luxury?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Book your dream car today and discover why Josh Tours is the preferred choice for discerning travelers in Sri Lanka.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/cars" className="flex items-center gap-2">
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
