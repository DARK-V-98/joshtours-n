
'use client';

import { cn } from "@/lib/utils";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext"; // Import CurrencyProvider
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>JOSH TOURS</title>
        <meta name="description" content="Your adventure starts here." />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="manifest" href="/site.webmanifest"/>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;700&family=Iskoola+Pota&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased flex flex-col pt-24"
        )}
      >
        <AuthProvider>
          <CurrencyProvider>
            <FirebaseErrorListener />
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
