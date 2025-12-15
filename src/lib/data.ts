

import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp, limit } from "firebase/firestore";
import { db } from "./firebase";


export interface Car {
  id: string; // Firestore document ID
  name: string;
  type: string;
  images: string[]; // URLs to images
  dataAiHint: string;
  isAvailable: boolean;
  pricePerDay: {
    usd: number;
    lkr: number;
    eur: number;
  };
  priceEnabled: boolean;
  specifications: string[]; // List of features
  bookedDates: string[]; // Array of dates in 'YYYY-MM-DD' format
  createdAt?: string; // Stored as a string after conversion
  description?: string;
}

export interface AdminCar extends Omit<Car, 'createdAt' | 'bookedDates' | 'pricePerDay' | 'specifications'> {
    createdAt: string | null;
}


// Helper to convert Firestore data to a Car object
function toCarObject(doc: any): Car {
    const data = doc.data();
    // Convert Firestore Timestamp to a serializable format (ISO string)
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate().toISOString() 
      : (data.createdAt || null);

    return {
      id: doc.id,
      name: data.name || "",
      type: data.type || "",
      images: data.images || [],
      dataAiHint: data.dataAiHint || "",
      isAvailable: data.isAvailable === true,
      pricePerDay: data.pricePerDay || { usd: 0, lkr: 0, eur: 0 },
      priceEnabled: data.priceEnabled === true,
      specifications: data.specifications || [],
      bookedDates: data.bookedDates || [], // Directly use the stored array
      createdAt,
      description: data.description || `A reliable ${data.type || 'car'} for your travels.`,
    };
}


// Fetches all cars from Firestore
export async function getAllCars(): Promise<Car[]> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return [];
  }
  const carsCollectionRef = collection(db, "cars");
  const q = query(carsCollectionRef, orderBy("createdAt", "desc"));
  const carsSnapshot = await getDocs(q);
  const carsList = carsSnapshot.docs.map(toCarObject);
  return carsList;
}

// Fetches the 3 most recent cars for the homepage
export async function getFeaturedCars(): Promise<Car[]> {
    if (!db) {
        console.error("Firestore is not initialized.");
        return [];
    }
    const carsCollectionRef = collection(db, "cars");
    const q = query(carsCollectionRef, orderBy("createdAt", "desc"), limit(3));
    const carsSnapshot = await getDocs(q);
    const carsList = carsSnapshot.docs.map(toCarObject);
    return carsList;
}


// Fetches a single car by its ID from Firestore
export async function getCarById(id: string): Promise<Car | null> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return null;
  }
  const carDocRef = doc(db, "cars", id);
  const carDoc = await getDoc(carDocRef);

  if (carDoc.exists()) {
    return toCarObject(carDoc);
  } else {
    return null;
  }
}

// Fetches cars for the admin panel (less processing needed)
export async function getCarsForAdmin(): Promise<AdminCar[]> {
    if (!db) {
        console.error("Firestore is not initialized.");
        return [];
    }
    const carsCollectionRef = collection(db, "cars");
    const q = query(carsCollectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : null;
        
        return {
            id: doc.id,
            name: data.name,
            type: data.type,
            isAvailable: data.isAvailable,
            createdAt: createdAt,
        } as AdminCar
    });
}
