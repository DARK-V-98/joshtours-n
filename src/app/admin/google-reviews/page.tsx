
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCachedReviews, forceRefreshReviews, GoogleReview, ReviewsMeta } from "@/lib/googleReviewsActions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, RefreshCw, Loader2, Clock, Globe, Quote, Info } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

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
    loadCached();
  }, [user, authLoading, router]);

  const loadCached = async () => {
    const data = await getCachedReviews();
    setReviews(data.reviews);
    setMeta(data.meta);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await forceRefreshReviews();
      if (!result.success) {
        toast({ variant: "destructive", title: "Refresh Failed", description: result.error ?? "Unknown error." });
      } else {
        toast({
          title: "Reviews Refreshed!",
          description: `Fetched ${result.reviewCount} reviews from Google. Rating: ${result.placeRating}⭐`,
        });
        await loadCached();
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not refresh reviews." });
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
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
            Reviews are fetched automatically once per day when the home page is visited.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          {refreshing
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <RefreshCw className="mr-2 h-4 w-4" />}
          {refreshing ? "Fetching from Google…" : "Refresh Now"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Cached Reviews</p><p className="text-3xl font-bold">{reviews.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Google Rating</p><p className="text-3xl font-bold text-yellow-500">{meta?.placeRating?.toFixed(1) ?? "—"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total on Google</p><p className="text-3xl font-bold">{meta?.totalRatings?.toLocaleString() ?? "—"}</p></CardContent></Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Refreshed</p>
            <p className="text-sm font-semibold mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {meta?.lastFetched
                ? formatDistanceToNow(parseISO(meta.lastFetched), { addSuffix: true })
                : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <p className="font-semibold">How auto-refresh works</p>
            <p>
              When any visitor opens the home page, the site checks the <em>last refreshed</em> timestamp in Firestore.
              If it's older than 24 hours, it silently fetches the latest reviews from Google Places API, saves them to
              Firestore, and returns the fresh data — all in the same request. Subsequent visitors that day read from the
              Firestore cache instantly (zero Google API calls). This guarantees at most <strong>1 API call per day</strong>.
            </p>
            <p className="pt-1">
              Required Vercel environment variables: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">GOOGLE_PLACES_API_KEY</code> and{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">GOOGLE_PLACE_ID</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review cards */}
      {reviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="font-semibold text-lg">No reviews cached yet</p>
              <p className="text-muted-foreground text-sm">
                Add <strong>GOOGLE_PLACES_API_KEY</strong> and <strong>GOOGLE_PLACE_ID</strong> to your Vercel env vars,
                then click "Refresh Now" or wait for the next home page visit.
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Fetch Reviews Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <Card key={r.id}>
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
                  <Badge variant="outline" className="text-xs flex-shrink-0">{r.rating}★</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
