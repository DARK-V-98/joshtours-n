
import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Josh Tours. Call, email, or send us a message for car rental inquiries, bookings, and support in Sri Lanka.",
  openGraph: {
    title: "Contact Josh Tours",
    description: "Reach out to Josh Tours for car rental inquiries and bookings in Sri Lanka.",
    url: "https://joshtours.lk/contact",
  },
  alternates: { canonical: "https://joshtours.lk/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
