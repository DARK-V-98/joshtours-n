
'use server';

import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, app } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface Attraction {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  imageUrl: string;       // main / cover image
  gallery: string[];      // additional sub-images
  order: number;
  published: boolean;
  createdAt: string;
}

export async function getAttractions(publishedOnly = false): Promise<Attraction[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'attractions'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? '',
        description: data.description ?? '',
        location: data.location ?? '',
        category: data.category ?? 'Cultural',
        imageUrl: data.imageUrl ?? '',
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
        order: data.order ?? 0,
        published: data.published ?? false,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      } as Attraction;
    });
    return publishedOnly ? all.filter((a) => a.published) : all;
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return [];
  }
}

export async function uploadAttractionImage(formData: FormData): Promise<string> {
  if (!app) throw new Error('Firebase not initialized');
  const storage = getStorage(app);
  const file = formData.get('image') as File;
  if (!file || file.size === 0) throw new Error('No image provided');
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `attractions/${fileName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/** Upload multiple gallery images at once. Returns the list of download URLs. */
export async function uploadAttractionImages(formData: FormData): Promise<string[]> {
  if (!app) throw new Error('Firebase not initialized');
  const storage = getStorage(app);
  const files = formData.getAll('images') as File[];
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
    const storageRef = ref(storage, `attractions/${fileName}`);
    await uploadBytes(storageRef, file);
    urls.push(await getDownloadURL(storageRef));
  }
  return urls;
}

export async function addAttraction(data: Omit<Attraction, 'id' | 'createdAt'>): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await addDoc(collection(db, 'attractions'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  revalidatePath('/');
  revalidatePath('/admin/attractions');
}

export async function updateAttraction(id: string, data: Partial<Omit<Attraction, 'id' | 'createdAt'>>): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await updateDoc(doc(db, 'attractions', id), data);
  revalidatePath('/');
  revalidatePath('/admin/attractions');
}

export async function deleteAttraction(id: string, imageUrl?: string, gallery: string[] = []): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await deleteDoc(doc(db, 'attractions', id));
  if (app) {
    const storage = getStorage(app);
    const urls = [imageUrl, ...gallery].filter(Boolean) as string[];
    await Promise.all(
      urls.map(async (url) => {
        try {
          await deleteObject(ref(storage, url));
        } catch {}
      }),
    );
  }
  revalidatePath('/');
  revalidatePath('/admin/attractions');
}

/** Delete a single image from Firebase Storage by its download URL. */
export async function deleteAttractionImage(url: string): Promise<void> {
  if (!app || !url) return;
  try {
    const storage = getStorage(app);
    await deleteObject(ref(storage, url));
  } catch {}
}
