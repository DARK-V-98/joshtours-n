
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Notebook,
  CreditCard,
  FilePlus,
  ChevronLeft,
  Menu,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
}

interface AdminSidebarProps {
  pendingBookings?: number;
  pendingTestimonials?: number;
}

export function AdminSidebar({ pendingBookings = 0, pendingTestimonials = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const allNavItems: (NavItem & { adminOnly?: boolean })[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, badge: pendingTestimonials, adminOnly: true },
    { href: "/admin/bookings", label: "Bookings", icon: Notebook, badge: pendingBookings },
    { href: "/admin/billing", label: "Billing", icon: CreditCard, adminOnly: true },
    { href: "/admin/manual-booking", label: "Manual Booking", icon: FilePlus, adminOnly: true },
    { href: "/admin/attractions", label: "Attractions", icon: MapPin, adminOnly: true },
    { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!collapsed && (
          <span className="font-display font-bold text-foreground text-sm">
            JOSH <span className="text-primary">ADMIN</span>
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", active && "text-primary")} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {item.badge != null && item.badge > 0 && (
                <span className={cn(
                  "min-w-[20px] h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center px-1",
                  collapsed && "absolute -top-1 -right-1"
                )}>
                  {item.badge}
                </span>
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors",
            collapsed && "justify-center"
          )}
        >
          <ChevronLeft className="h-3 w-3" />
          {!collapsed && "Back to Site"}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-[88px] left-3 z-40 bg-background border border-border shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-24 left-0 bottom-0 z-40 bg-card border-r border-border w-64 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
