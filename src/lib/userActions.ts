
'use server';

import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { revalidatePath } from 'next/cache';

export interface UserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'staff';
  createdAt: string | null;
}

export async function getAllUsers(): Promise<UserRecord[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : null;
      return {
        uid: doc.id,
        email: data.email ?? null,
        displayName: data.displayName ?? null,
        phone: data.phone ?? null,
        role: data.role ?? 'user',
        createdAt,
      } as UserRecord;
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function setUserRole(uid: string, role: 'user' | 'admin' | 'staff') {
  if (!db) throw new Error('Database not initialized');
  await updateDoc(doc(db, 'users', uid), { role });
  revalidatePath('/admin/users');
}

export async function createUserInFirestore(user: User, additionalData: { displayName?: string } = {}) {
  if (!db) {
    console.error("Firestore is not initialized. Cannot create user profile.");
    throw new Error("Failed to create user profile due to database connection issue.");
  }

  const userRef = doc(db, 'users', user.uid);
  const userData = {
      uid: user.uid,
      email: user.email,
      displayName: additionalData.displayName || user.displayName || null,
      phone: user.phoneNumber || null,
      role: 'user', // Default role for all new users
      createdAt: serverTimestamp(),
  };

  // Use .catch() for error handling instead of try/catch with await
  setDoc(userRef, userData, { merge: true })
    .catch(async (serverError) => {
      
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'create',
        requestResourceData: userData,
      });

      // Emit the contextual error
      errorEmitter.emit('permission-error', permissionError);
    });
}
