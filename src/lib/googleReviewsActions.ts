
'use server';

import {
  collection, doc, getDocs, setDoc, deleteDoc,
  getDoc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface GoogleReview {
  id: string;
  authorName: string;
  authorUrl: string;
  profilePhotoUrl: string;
  rating: number;
  text: string;
  time: number;              // unix timestamp
  relativeTimeDescription: string;
}

export interface ReviewsMeta {
  lastFetched: string | null;   // ISO string
  placeRating: number;
  totalRatings: number;
  reviewCount: number;
}

/** Read cached reviews from Firestore (used on home page — no API call) */
export async function getCachedReviews(): Promise<{ reviews: GoogleReview[]; meta: ReviewsMeta }> {
  if (!db) return { reviews: [], meta: { lastFetched: null, placeRating: 0, totalRatings: 0, reviewCount: 0 } };
  try {
    const [reviewsSnap, metaSnap] = await Promise.all([
      getDocs(query(collection(db, 'googleReviewsCache'), orderBy('time', 'desc'))),
      getDoc(doc(db, 'googleReviewsMeta', 'meta')),
    ]);

    const reviews: GoogleReview[] = reviewsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<GoogleReview, 'id'>),
    }));

    const metaData = metaSnap.data();
    const meta: ReviewsMeta = {
      lastFetched: metaData?.lastFetched instanceof Timestamp
        ? metaData.lastFetched.toDate().toISOString()
        : metaData?.lastFetched ?? null,
      placeRating: metaData?.placeRating ?? 0,
      totalRatings: metaData?.totalRatings ?? 0,
      reviewCount: reviews.length,
    };

    return { reviews, meta };
  } catch (error) {
    console.error('Error reading cached reviews:', error);
    return { reviews: [], meta: { lastFetched: null, placeRating: 0, totalRatings: 0, reviewCount: 0 } };
  }
}
