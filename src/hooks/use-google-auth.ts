
'use client';

import { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { createUserInFirestore } from '@/lib/userActions';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async (onSuccess: () => void) => {
    if (!app) {
      setError('Firebase is not configured correctly.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      // Upsert user record in Firestore (merge: true so existing role is preserved)
      await createUserInFirestore(result.user, {
        displayName: result.user.displayName ?? undefined,
      });
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // user dismissed — not an error
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError('Google sign-in failed. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading, error };
}
