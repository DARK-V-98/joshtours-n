
'use server';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
