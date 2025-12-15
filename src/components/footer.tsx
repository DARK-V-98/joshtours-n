
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-14 w-14">
                <Image src="/rtm.png" alt="JOSH TOURS Logo" fill className="rounded-full object-cover" />
              </div>
               <span className="font-display text-xl font-bold text-foreground">
                JOSH <span className="text-gradient-gold">TOURS</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Quality car rental services in Sri Lanka. Experience comfort, and reliability with our exceptional fleet.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/cars", label: "Our Fleet" },
                { href: "/contact", label: "Contact Us" },
                { href: "/login", label: "Login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicle Types */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">Our Fleet</h4>
            <ul className="space-y-3">
              {["Sedans", "SUVs", "Sports Cars", "Passenger Vans"].map((item) => (
                <li key={item}>
                  <Link
                    href="/cars"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  68/2A, Welikadamulla Road, Mabola, Wattala
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+94701209694" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  +94 70 120 9694
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:joshtoursbe@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  joshtoursbe@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Josh Tours. All rights reserved.</p>
           <div className="flex gap-6">
            <a href="https://www.esystemlk.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Website by esystemlk</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
