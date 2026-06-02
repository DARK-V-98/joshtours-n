
'use client';

import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <FirebaseErrorListener />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster />
      </CurrencyProvider>
    </AuthProvider>
  );
}
