
'use client';

import { useEffect, useState } from 'react';
import { Star, ExternalLink, Quote, RefreshCw } from 'lucide-react';
import { getReviewsWithAutoRefresh, GoogleReview, ReviewsMeta } from '@/lib/googleReviewsActions';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const GoogleG = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > 220;
  const displayed = long && !expanded ? review.text.slice(0, 220) + '…' : review.text;

  return (
    <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
      <Quote className="w-7 h-7 text-primary/30 flex-shrink-0" />
      <p className="text-sm text-foreground/90 leading-relaxed flex-1">
        {displayed}
        {long && (
          <button onClick={() => setExpanded(!expanded)} className="ml-1 text-primary text-xs font-medium hover:underline">
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>
      <Stars rating={review.rating} />
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        {review.profilePhotoUrl ? (
          <img src={review.profilePhotoUrl} alt={review.authorName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <a href={review.authorUrl} target="_blank" rel="noopener noreferrer"
            className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate flex items-center gap-1">
            {review.authorName}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
          <p className="text-xs text-muted-foreground">{review.relativeTimeDescription}</p>
        </div>
        <GoogleG className="w-5 h-5 flex-shrink-0 opacity-50" />
      </div>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────
export default function GoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [wasRefreshed, setWasRefreshed] = useState(false);

  useEffect(() => {
    // On mount: server action checks if cache is stale (>24 h).
    // If stale → fetches fresh from Google, saves to Firestore, returns new data.
    // If fresh → returns cached data instantly. Either way: max 1 Google API call/day.
    getReviewsWithAutoRefresh().then(({ reviews, meta, wasRefreshed }) => {
      setReviews(reviews);
      setMeta(meta);
      setWasRefreshed(wasRefreshed);
      setLoading(false);
    });
  }, []);

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <GoogleG />
            Google Reviews
            {wasRefreshed && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <RefreshCw className="w-3 h-3" /> Updated
              </span>
            )}
          </span>

          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            What Customers <span className="text-gradient-gold">Say on Google</span>
          </h2>

          {/* Overall rating */}
          {!loading && meta && meta.placeRating > 0 && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-5xl font-display font-bold text-foreground">
                  {meta.placeRating.toFixed(1)}
                </span>
                <div className="flex flex-col items-start gap-1">
                  <Stars rating={Math.round(meta.placeRating)} size="lg" />
                  <p className="text-sm text-muted-foreground">
                    {meta.totalRatings.toLocaleString()} reviews on Google
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}
