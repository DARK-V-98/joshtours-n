
'use server';

import {
  collection, doc, getDocs, setDoc, deleteDoc,
  getDoc, query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface GoogleReview {
  id: string;
  authorName: string;
  authorUrl: string;
  profilePhotoUrl: string;
  rating: number;
  text: string;
  time: number;
  relativeTimeDescription: string;
}

export interface ReviewsMeta {
  lastFetched: string | null;
  placeRating: number;
  totalRatings: number;
  reviewCount: number;
  googleMapsUrl: string;   // link to business on Google Maps
}

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function emptyResult(): { reviews: GoogleReview[]; meta: ReviewsMeta; wasRefreshed: boolean } {
  return {
    reviews: [],
    meta: { lastFetched: null, placeRating: 0, totalRatings: 0, reviewCount: 0, googleMapsUrl: 'https://www.google.com/maps' },
    wasRefreshed: false,
  };
}

// ─── Internal: fetch from Google Places API ────────────────────────────────────

interface PlacesReview {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

async function fetchFromGoogle(): Promise<{
  reviews: PlacesReview[];
  placeRating: number;
  totalRatings: number;
} | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    console.warn('Google Reviews: GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not set.');
    return null;
  }
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}&fields=reviews,rating,user_ratings_total` +
      `&key=${apiKey}&language=en&reviews_sort=newest`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
      return null;
    }
    return {
      reviews: data.result?.reviews ?? [],
      placeRating: data.result?.rating ?? 0,
      totalRatings: data.result?.user_ratings_total ?? 0,
    };
  } catch (err) {
    console.error('fetchFromGoogle error:', err);
    return null;
  }
}

// ─── Internal: save reviews to Firestore ───────────────────────────────────────

async function saveToFirestore(
  reviews: PlacesReview[],
  placeRating: number,
  totalRatings: number,
): Promise<GoogleReview[]> {
  if (!db) return [];

  // Clear old cache
  const existing = await getDocs(collection(db, 'googleReviewsCache'));
  await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));

  // Write fresh reviews
  const saved: GoogleReview[] = [];
  await Promise.all(
    reviews.map(async (r, i) => {
      const id = `review_${i}_${r.time}`;
      const doc_ = {
        authorName: r.author_name,
        authorUrl: r.author_url,
        profilePhotoUrl: r.profile_photo_url,
        rating: r.rating,
        text: r.text,
        time: r.time,
        relativeTimeDescription: r.relative_time_description,
      };
      await setDoc(doc(db!, 'googleReviewsCache', id), doc_);
      saved.push({ id, ...doc_ });
    }),
  );

  // Update meta
  await setDoc(doc(db, 'googleReviewsMeta', 'meta'), {
    lastFetched: serverTimestamp(),
    placeRating,
    totalRatings,
  });

  return saved;
}

// ─── Internal: read cache only ─────────────────────────────────────────────────

async function readCache(): Promise<{ reviews: GoogleReview[]; meta: ReviewsMeta }> {
  if (!db) return { reviews: [], meta: { lastFetched: null, placeRating: 0, totalRatings: 0, reviewCount: 0 } };

  const [reviewsSnap, metaSnap] = await Promise.all([
    getDocs(query(collection(db, 'googleReviewsCache'), orderBy('time', 'desc'))),
    getDoc(doc(db, 'googleReviewsMeta', 'meta')),
  ]);

  const reviews: GoogleReview[] = reviewsSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<GoogleReview, 'id'>),
  }));

  const metaData = metaSnap.data();
  const placeId = process.env.GOOGLE_PLACE_ID ?? '';
  const meta: ReviewsMeta = {
    lastFetched:
      metaData?.lastFetched instanceof Timestamp
        ? metaData.lastFetched.toDate().toISOString()
        : metaData?.lastFetched ?? null,
    placeRating: metaData?.placeRating ?? 0,
    totalRatings: metaData?.totalRatings ?? 0,
    reviewCount: reviews.length,
    googleMapsUrl: placeId
      ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
      : 'https://www.google.com/maps',
  };

  return { reviews, meta };
}

// ─── Public: called by home page ──────────────────────────────────────────────
/**
 * Returns cached reviews immediately.
 * If the cache is older than 24 h (or empty), it silently fetches fresh
 * reviews from Google first — keeping API usage to 1 call per day.
 */
export async function getReviewsWithAutoRefresh(): Promise<{
  reviews: GoogleReview[];
  meta: ReviewsMeta;
  wasRefreshed: boolean;
}> {
  if (!db) return emptyResult();

  try {
    // 1. Read current meta to check staleness
    const metaSnap = await getDoc(doc(db, 'googleReviewsMeta', 'meta'));
    const metaData = metaSnap.data();

    const lastFetchedDate: Date | null =
      metaData?.lastFetched instanceof Timestamp
        ? metaData.lastFetched.toDate()
        : null;

    const isStale =
      !lastFetchedDate ||
      Date.now() - lastFetchedDate.getTime() > REFRESH_INTERVAL_MS;

    if (isStale) {
      // 2. Optimistic lock — stamp NOW so concurrent requests skip the refresh
      await setDoc(
        doc(db, 'googleReviewsMeta', 'meta'),
        { lastFetched: serverTimestamp() },
        { merge: true },
      );

      // 3. Pull fresh data from Google
      const fresh = await fetchFromGoogle();
      if (fresh) {
        const reviews = await saveToFirestore(
          fresh.reviews,
          fresh.placeRating,
          fresh.totalRatings,
        );
        const placeId = process.env.GOOGLE_PLACE_ID ?? '';
        return {
          reviews,
          meta: {
            lastFetched: new Date().toISOString(),
            placeRating: fresh.placeRating,
            totalRatings: fresh.totalRatings,
            reviewCount: reviews.length,
            googleMapsUrl: placeId
              ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
              : 'https://www.google.com/maps',
          },
          wasRefreshed: true,
        };
      }
    }

    // 4. Return cache (either fresh enough, or Google fetch failed)
    const cached = await readCache();
    return { ...cached, wasRefreshed: false };
  } catch (error) {
    console.error('getReviewsWithAutoRefresh error:', error);
    return emptyResult();
  }
}

// ─── Public: admin manual force-refresh ────────────────────────────────────────
export async function forceRefreshReviews(): Promise<{
  success: boolean;
  reviewCount: number;
  placeRating: number;
  totalRatings: number;
  error?: string;
}> {
  try {
    const fresh = await fetchFromGoogle();
    if (!fresh) {
      return { success: false, reviewCount: 0, placeRating: 0, totalRatings: 0, error: 'Google Places API key or Place ID not configured, or API returned an error.' };
    }
    const reviews = await saveToFirestore(fresh.reviews, fresh.placeRating, fresh.totalRatings);
    return { success: true, reviewCount: reviews.length, placeRating: fresh.placeRating, totalRatings: fresh.totalRatings };
  } catch (error) {
    console.error('forceRefreshReviews error:', error);
    return { success: false, reviewCount: 0, placeRating: 0, totalRatings: 0, error: String(error) };
  }
}

// ─── Public: read-only cache (for admin page display) ─────────────────────────
export async function getCachedReviews(): Promise<{ reviews: GoogleReview[]; meta: ReviewsMeta }> {
  return readCache();
}
