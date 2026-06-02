
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { createUserInFirestore } from '@/lib/userActions';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!app || !db) {
      // Firebase might not be configured
      console.warn("Firebase is not configured, authentication will be disabled.");
      setLoading(false);
      return;
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // User is signed in, fetch only their role from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userRole: 'user' | 'admin' = 'user'; // Default role
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            userRole = userDoc.data()?.role || 'user';
          }
        } catch (error) {
            console.error("Error fetching user role from Firestore:", error);
        }
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phone: firebaseUser.phoneNumber,
          role: userRole,
        });

      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
