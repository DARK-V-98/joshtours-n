

'use server';

import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface TestimonialData {
  userId: string;
  name: string;
  comment: string;
  rating: number;
}

export interface Testimonial extends TestimonialData {
  id: string;
  status: 'pending' | 'approved';
  createdAt: string; // ISO string
}


export async function createTestimonial(data: TestimonialData) {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    await addDoc(collection(db, 'testimonials'), {
      ...data,
      status: 'pending', // Always pending on creation
      createdAt: serverTimestamp(),
    });

    revalidatePath('/admin'); // Revalidate admin to show new pending testimonial
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw new Error('Could not create testimonial.');
  }
}

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return [];
  }
  // This query was causing an index error.
  // The fix is to fetch all testimonials ordered by date, then filter client-side.
  const q = query(
    collection(db, 'testimonials'), 
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const allTestimonials = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
      } as Testimonial;
  });
  
  // Filter for approved testimonials in code.
  return allTestimonials.filter(t => t.status === 'approved');
}

// Admin functions
export async function getAllTestimonials(): Promise<Testimonial[]> {
  if (!db) return [];
  const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
      } as Testimonial;
  });
}

export async function updateTestimonialStatus(id: string, status: 'approved' | 'pending') {
  if (!db) throw new Error('Database not initialized');
  const testimonialRef = doc(db, 'testimonials', id);
  await updateDoc(testimonialRef, { status });
  revalidatePath('/admin');
  revalidatePath('/'); // Revalidate home page to show new testimonial
}

export async function deleteTestimonial(id: string) {
  if (!db) throw new Error('Database not initialized');
  const testimonialRef = doc(db, 'testimonials', id);
  await deleteDoc(testimonialRef);
  revalidatePath('/admin');
}

export async function getPendingTestimonialCount(): Promise<number> {
    if (!db) {
        console.error("Database not initialized");
        return 0;
    }
    try {
        const q = query(collection(db, 'testimonials'), where('status', '==', 'pending'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error fetching pending testimonial count:", error);
        return 0;
    }
}
