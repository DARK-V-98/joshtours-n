
import { Code, GitBranch, Database, Users, FileText, Shield, Image as ImageIcon, LayoutDashboard, Component, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12">
        <h1 className="text-5xl font-headline font-bold text-primary mb-2">JOSH TOURS - Developer Documentation</h1>
        <p className="text-xl text-muted-foreground">
          A comprehensive overview of the application's architecture, pages, and core mechanisms.
        </p>
      </header>

      <div className="space-y-12">
        
        {/* Section: Technology Stack */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Package className="h-8 w-8 text-primary" />Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Firebase', 'ShadCN/UI', 'Zod', 'React Hook Form'].map(tech => (
              <Card key={tech} className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <p className="font-semibold">{tech}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Section: Core Mechanisms */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><GitBranch className="h-8 w-8 text-primary" />Core Mechanisms</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Authentication & User Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>User accounts are managed by **Firebase Authentication** (Email/Password).</li>
                  <li>User data (including roles) is stored in a `users` collection in **Firestore**.</li>
                  <li>Two roles exist: `user` (default) and `admin`.</li>
                  <li>The `AuthContext` provides user state across the app, enabling role-based access control.</li>
                  <li>Admin routes are protected, redirecting non-admins to the homepage.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5"/>Firestore Data Models</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>`cars`: Stores all vehicle information, including specs, pricing, images, and an array of `bookedDates`.</li>
                  <li>`bookingRequests`: Contains all details of a customer's booking inquiry, including their info, guarantor info, and URLs to uploaded documents. Status can be `pending`, `confirmed`, or `canceled`.</li>
                  <li>`rentalAgreements`: A single document per booking that stores both the rental terms and the final billing calculation.</li>
                  <li>`testimonials`: Stores customer feedback with a `status` of `pending` or `approved`.</li>
                  <li>`users`: Manages user profiles and roles.</li>
                </ul>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/>File Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-muted-foreground">All file uploads are handled by **Firebase Storage**. When a user submits documents, the files are uploaded to a unique path (`booking-documents/{bookingId}/{fileName}`), and the resulting download URLs are stored in the corresponding `bookingRequests` document.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Section: Page Breakdown */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Component className="h-8 w-8 text-primary" />Page Breakdown</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-3">Public Pages</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>/ (Homepage)</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">The main landing page. Features a hero section, key services, a showcase of featured vehicles, and approved customer testimonials.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>/cars</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Displays the entire fleet of available vehicles in a grid. Includes basic filtering and sorting options.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>/cars/[id]</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">The detailed view for a single car. Shows an image carousel, all specifications, pricing, and an availability calendar that displays `bookedDates`.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>/contact</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">A simple contact form for general inquiries.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3">Authentication Pages</h3>
              <div className="grid md:grid-cols-2 gap-4">
                 <Card>
                  <CardHeader><CardTitle>/login</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Allows existing users to sign in. Provides a link to the signup page and a "Forgot Password?" link.</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>/signup</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Allows new users to create an account with their name, email, and password. Includes password confirmation.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3">User-Specific Pages</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>/book/[id]</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">The main booking inquiry form. Collects trip details, personal information, guarantor information, and all required documents based on residency status (local vs. tourist).</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>/my-bookings</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">A dashboard for logged-in users to view the status of their past and present booking requests. They can cancel pending requests or view the agreement for confirmed ones.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>/add-testimonial</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">A form for authenticated users to submit a rating and a comment about their experience.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3">Admin Pages</h3>
               <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>/admin</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">The central admin dashboard. Features quick action buttons and a tabbed interface to manage the fleet, add new cars, and manage testimonials.</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>/admin/bookings</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Displays a comprehensive list of all booking requests. Admins can review all customer and guarantor details, access uploaded documents, and approve or reject pending requests.</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>/admin/edit/[id]</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">A form to edit the details of an existing car, including its specifications, pricing, and availability. Also allows manual management of `bookedDates` via a calendar.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>/admin/manual-booking</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">A simplified form for admins to create a `confirmed` booking directly, bypassing the standard user inquiry process.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>/agreement/[bookingId]</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">The unified rental agreement and billing page. Admins can fill out all rental terms and final billing details. The page generates a multi-page, printable PDF in both English and Sinhala.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
