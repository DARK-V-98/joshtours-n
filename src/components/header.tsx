
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Phone, User as UserIcon, LogOut, LayoutDashboard, Globe, Notebook, Menu, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { app } from "@/lib/firebase";
import React, { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Fleet" },
  { href: "/contact", label: "Contact" },
];

const loggedInNavLinks = [
    ...navLinks,
    { href: "/my-bookings", label: "My Bookings" },
]

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const auth = app ? getAuth(app) : null;
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

   useEffect(() => {
    if (!isMounted) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMounted]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    const name = user?.displayName;
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const currentNavLinks = user ? loggedInNavLinks : navLinks;

  const renderAuthSection = () => {
    if (loading || !isMounted) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }
    
    if (user) {
      return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || 'My Account'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">
                    <Notebook className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
              {user.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      )
    } else {
      return (
         <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
      )
    }
  }


  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isMounted && scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
           <div className="relative h-12 w-12 transition-transform group-hover:scale-110">
            <Image src="/rtm.png" alt="JOSH TOURS Logo" fill className="rounded-full object-cover" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
              JOSH <span className="text-gradient-gold">TOURS</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {currentNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors relative py-2",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                 <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
           {renderAuthSection()}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

       {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {currentNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-3 rounded-lg transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-border my-2" />
           <div className="px-4 py-3">{renderAuthSection()}</div>
        </nav>
      </div>
    </header>
  );
}
