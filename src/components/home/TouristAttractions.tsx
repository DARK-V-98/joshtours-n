
'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapPin, ArrowRight, Compass, Images, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAttractions, Attraction } from '@/lib/attractionActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
  Beach: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Cultural: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Wildlife: 'bg-green-500/20 text-green-300 border-green-500/30',
  Nature: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Historical: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Adventure: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  City: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

// Combine main image + gallery into a single ordered list (deduped)
function allImages(a: Attraction): string[] {
  const imgs = [a.imageUrl, ...(a.gallery ?? [])].filter(Boolean);
  return Array.from(new Set(imgs));
}

function AttractionCard({
  attraction,
  featured = false,
  onOpenGallery,
}: {
  attraction: Attraction;
  featured?: boolean;
  onOpenGallery: (a: Attraction, index: number) => void;
}) {
  const categoryClass = CATEGORY_COLORS[attraction.category] ?? 'bg-primary/20 text-primary border-primary/30';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.name + ' ' + attraction.location + ' Sri Lanka')}`;
  const images = allImages(attraction);
  const photoCount = images.length;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col ${featured ? 'md:flex-row' : ''}`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden flex-shrink-0 cursor-pointer ${featured ? 'md:w-1/2 h-56 md:h-auto' : 'h-52'}`}
        onClick={() => photoCount > 0 && onOpenGallery(attraction, 0)}
      >
        {attraction.imageUrl ? (
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Compass className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryClass}`}>
          {attraction.category}
        </span>
        {featured && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
            Must Visit
          </span>
        )}

        {/* Photo count → opens gallery */}
        {photoCount > 1 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-medium bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Images className="h-3.5 w-3.5" />
            {photoCount} photos
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
            {attraction.name}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            {attraction.location}
          </p>
        </div>
        <p className={`text-sm text-muted-foreground leading-relaxed ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}>
          {attraction.description}
        </p>

        {/* Gallery thumbnails strip */}
        {photoCount > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {images.slice(0, featured ? 6 : 4).map((img, i) => (
              <button
                key={img}
                onClick={() => onOpenGallery(attraction, i)}
                className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border hover:border-primary transition-colors"
              >
                <img src={img} alt={`${attraction.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {photoCount > (featured ? 6 : 4) && (
              <button
                onClick={() => onOpenGallery(attraction, featured ? 6 : 4)}
                className="w-14 h-14 rounded-lg flex-shrink-0 border border-border bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                +{photoCount - (featured ? 6 : 4)}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-auto pt-1">
          {photoCount > 1 && (
            <button
              onClick={() => onOpenGallery(attraction, 0)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Images className="h-4 w-4" />
              View Photos
            </button>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors ml-auto"
          >
            <MapPin className="h-4 w-4" />
            View on Map
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  attraction,
  index,
  onClose,
  onIndexChange,
}: {
  attraction: Attraction;
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const images = allImages(attraction);
  const total = images.length;

  const prev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange]);
  const next = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [prev, next, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg truncate">{attraction.name}</h3>
          <p className="flex items-center gap-1.5 text-sm text-white/70">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {attraction.location}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 ml-4"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative px-4 min-h-0" onClick={(e) => e.stopPropagation()}>
        {total > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <img
          src={images[index]}
          alt={`${attraction.name} ${index + 1}`}
          className="max-h-full max-w-full object-contain rounded-lg select-none"
        />
        {total > 1 && (
          <button
            onClick={next}
            className="absolute right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Counter + thumbnails */}
      <div className="p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-center text-white/70 text-sm">{index + 1} / {total}</p>
        {total > 1 && (
          <div className="flex gap-2 justify-center overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => onIndexChange(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === index ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TouristAttractions() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [lightbox, setLightbox] = useState<{ attraction: Attraction; index: number } | null>(null);

  useEffect(() => {
    getAttractions(true).then((data) => {
      setAttractions(data);
      setLoading(false);
    });
  }, []);

  const openGallery = (attraction: Attraction, index: number) => setLightbox({ attraction, index });

  if (!loading && attractions.length === 0) return null;

  const INITIAL_LIMIT = 6;
  const displayed = showAll ? attractions : attractions.slice(0, INITIAL_LIMIT);
  const [featured, ...rest] = displayed;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Compass className="w-4 h-4" />
            Sri Lanka Travel Guide
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Explore <span className="text-gradient-gold">Sri Lanka</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover the island's most breathtaking destinations — from ancient ruins to golden beaches.
            Rent a car and explore at your own pace.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {featured && <AttractionCard attraction={featured} featured onOpenGallery={openGallery} />}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((a) => (
                  <AttractionCard key={a.id} attraction={a} onOpenGallery={openGallery} />
                ))}
              </div>
            )}

            {!showAll && attractions.length > INITIAL_LIMIT && (
              <div className="text-center pt-4">
                <Button variant="heroOutline" size="lg" onClick={() => setShowAll(true)} className="gap-2">
                  Show All {attractions.length} Attractions
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && attractions.length > 0 && (
          <div className="mt-16 p-8 rounded-2xl bg-card border border-border text-center space-y-4">
            <h3 className="font-display text-2xl font-bold text-foreground">Ready to Explore?</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Book a car with Josh Tours and discover all these amazing places at your own schedule — no fixed tours, total freedom.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link href="/cars" className="inline-flex items-center gap-2">
                Browse Our Fleet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          attraction={lightbox.attraction}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndexChange={(i) => setLightbox((lb) => (lb ? { ...lb, index: i } : lb))}
        />
      )}
    </section>
  );
}
