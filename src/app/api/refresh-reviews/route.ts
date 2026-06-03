
import { NextRequest, NextResponse } from 'next/server';
import {
  collection, doc, setDoc, deleteDoc,
  getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlacesReview {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

interface PlacesResult {
  rating?: number;
  user_ratings_total?: number;
  reviews?: PlacesReview[];
}

interface PlacesResponse {
  status: string;
  result?: PlacesResult;
  error_message?: string;
}

// ─── Auth helper ──────────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Vercel cron sends: Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization');
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  // Also allow an explicit admin query param for manual admin triggers
  const adminKey = req.nextUrl.searchParams.get('key');
  if (cronSecret && adminKey === cronSecret) return true;
  return false;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: 'GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID env var missing' },
      { status: 500 },
    );
  }

  if (!db) {
    return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
  }

  try {
    // ── 1. Fetch from Google Places API ────────────────────────────────────────
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}&language=en&reviews_sort=newest`;
    const res = await fetch(url, { cache: 'no-store' });
    const data: PlacesResponse = await res.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Google Places API error: ${data.status} — ${data.error_message ?? ''}` },
        { status: 502 },
      );
    }

    const result = data.result!;
    const fetchedReviews: PlacesReview[] = result.reviews ?? [];

    // ── 2. Clear old cached reviews ────────────────────────────────────────────
    const existing = await getDocs(collection(db, 'googleReviewsCache'));
    const deletions = existing.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletions);

    // ── 3. Save new reviews ────────────────────────────────────────────────────
    const saves = fetchedReviews.map((r, i) => {
      const id = `review_${i}_${r.time}`;
      return setDoc(doc(db!, 'googleReviewsCache', id), {
        authorName: r.author_name,
        authorUrl: r.author_url,
        profilePhotoUrl: r.profile_photo_url,
        rating: r.rating,
        text: r.text,
        time: r.time,
        relativeTimeDescription: r.relative_time_description,
      });
    });
    await Promise.all(saves);

    // ── 4. Update meta ─────────────────────────────────────────────────────────
    await setDoc(doc(db, 'googleReviewsMeta', 'meta'), {
      lastFetched: serverTimestamp(),
      placeRating: result.rating ?? 0,
      totalRatings: result.user_ratings_total ?? 0,
    });

    return NextResponse.json({
      success: true,
      reviewsFetched: fetchedReviews.length,
      placeRating: result.rating,
      totalRatings: result.user_ratings_total,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error refreshing Google reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
