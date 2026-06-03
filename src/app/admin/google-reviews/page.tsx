
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCachedReviews, GoogleReview, ReviewsMeta } from "@/lib/googleReviewsActions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star, RefreshCw, Loader2, Clock, Globe, Quote,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function AdminGoogleReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") { router.push("/"); return; }
    fetchCached();
  }, [user, authLoading, router]);

  const fetchCached = async () => {
    const data = await getCachedReviews();
    setReviews(data.reviews);
    setMeta(data.meta);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET_HINT;
      // Call the API route — key passed as query param (admin manual trigger)
      const res = await fetch(`/api/refresh-reviews?key=${encodeURIComponent(cronSecret ?? "")}`, {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Refresh Failed", description: data.error ?? "Unknown error." });
      } else {
        toast({ title: "Reviews Refreshed!", description: `Fetched ${data.reviewsFetched} reviews from Google. Rating: ${data.placeRating}⭐` });
        await fetchCached();
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to the refresh endpoint." });
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Google Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Reviews are cached in Firestore and auto-refreshed every day at 3 AM UTC.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {refreshing ? "Fetching from Google..." : "Refresh Now"}
        </Button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Cached Reviews</p>
            <p className="text-3xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Google Rating</p>
            <p className="text-3xl font-bold text-yellow-500">{meta?.placeRating?.toFixed(1) ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <p className="text-3xl font-bold">{meta?.totalRatings?.toLocaleString() ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Fetched</p>
            <p className="text-sm font-semibold mt-1">
              {meta?.lastFetched
                ? formatDistanceToNow(parseISO(meta.lastFetched), { addSuffix: true })
                : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info box */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <p className="font-semibold">Automatic daily refresh</p>
            <p>The Vercel cron job (<code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">0 3 * * *</code>) calls <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/api/refresh-reviews</code> every day at 3:00 AM UTC. Reviews are saved in Firestore — the home page reads from the cache, not Google's API directly. This keeps API usage at 1 call/day maximum.</p>
            <p className="pt-1">To set up: add <strong>GOOGLE_PLACES_API_KEY</strong>, <strong>GOOGLE_PLACE_ID</strong>, and <strong>CRON_SECRET</strong> to your Vercel environment variables. The "Refresh Now" button works once you add <strong>NEXT_PUBLIC_CRON_SECRET_HINT</strong> too (or use the Vercel dashboard to trigger manually).</p>
          </div>
        </CardContent>
      </Card>

      {/* Reviews preview */}
      {reviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="font-semibold text-lg">No reviews cached yet</p>
              <p className="text-muted-foreground text-sm">Configure your Google Places API key and Place ID, then click "Refresh Now".</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <Quote className="w-6 h-6 text-primary/30" />
                <p className="text-sm text-muted-foreground line-clamp-4">{r.text || <em>No text</em>}</p>
                <Stars rating={r.rating} />
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {r.profilePhotoUrl ? (
                    <img src={r.profilePhotoUrl} alt={r.authorName} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {r.authorName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.authorName}</p>
                    <p className="text-xs text-muted-foreground">{r.relativeTimeDescription}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{r.rating}★</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
