import { Shield, Users, MapPin, Headphones, Car, Sparkles } from "lucide-react";

const features = [
  {
    icon: Car,
    title: "Premium Fleet",
    description: "From luxury sedans to powerful SUVs, our vehicles are meticulously maintained and always pristine."
  },
  {
    icon: Shield,
    title: "Full Insurance",
    description: "Travel with peace of mind knowing every rental comes with comprehensive insurance coverage."
  },
  {
    icon: MapPin,
    title: "Island-Wide Service",
    description: "Pick up and drop off anywhere in Sri Lanka. We bring the car to your doorstep."
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated team is always available to assist you, day or night."
  },
  {
    icon: Users,
    title: "Professional Drivers",
    description: "Optional chauffeur service with experienced, multilingual drivers."
  },
  {
    icon: Sparkles,
    title: "Best Rates",
    description: "Competitive pricing with no hidden fees. We guarantee the best value."
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-card/50">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-gradient-card border border-border hover:border-primary/30 transition-all duration-500 animate-fade-in"
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
