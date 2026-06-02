
import type { Metadata } from "next";
import { getCarById } from "@/lib/data";
import { notFound } from "next/navigation";
import CarDetailClient from "./CarDetailClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarById(params.id).catch(() => null);
  if (!car) return { title: "Vehicle Not Found" };

  const title = `${car.name} — Rent in Sri Lanka`;
  const description = `Hire the ${car.name} (${car.type}) in Sri Lanka from Josh Tours. ${car.specifications?.slice(0, 3).join(", ")}. Book now for the best rates.`;
  const image = car.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Josh Tours`,
      description,
      url: `https://joshtours.lk/cars/${params.id}`,
      images: image ? [{ url: image, alt: car.name }] : undefined,
    },
    alternates: { canonical: `https://joshtours.lk/cars/${params.id}` },
  };
}

function CarDetailPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8"><Skeleton className="h-10 w-48" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3"><Skeleton className="aspect-video w-full rounded-lg" /></div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarById(params.id);
  if (!car) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.name,
    description: `${car.name} available for rent at Josh Tours Sri Lanka.`,
    image: car.images,
    brand: { "@type": "Brand", name: car.type },
    offers: car.priceEnabled
      ? {
          "@type": "Offer",
          price: car.pricePerDay?.lkr,
          priceCurrency: "LKR",
          availability: car.isAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `https://joshtours.lk/cars/${car.id}`,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<CarDetailPageSkeleton />}>
        <CarDetailClient car={car} />
      </Suspense>
    </>
  );
}
