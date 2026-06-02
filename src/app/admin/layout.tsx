
import { getPendingBookingCount } from "@/lib/bookingActions";
import { getPendingTestimonialCount } from "@/lib/testimonialActions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingBookings, pendingTestimonials] = await Promise.all([
    getPendingBookingCount(),
    getPendingTestimonialCount(),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-6rem)]">
      <AdminSidebar pendingBookings={pendingBookings} pendingTestimonials={pendingTestimonials} />
      <div className="flex-1 overflow-x-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
