
"use server";

import { collection, addDoc, serverTimestamp, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, app } from "@/lib/firebase"; 
import type { Car } from "./data";
import { revalidatePath } from "next/cache";

// This function uploads images to Firebase Storage and returns their URLs.
export async function uploadImages(formData: FormData): Promise<string[]> {
  const storage = getStorage(app);
  const images = formData.getAll("images") as File[];
  
  if (!images || images.length === 0) {
    throw new Error("No images provided for upload.");
  }

  const imageUrls: string[] = [];

  for (const image of images) {
    if (image.size === 0) continue;
    // Generate a unique filename for each image
    const fileName = `${Date.now()}-${image.name}`;
    const storageRef = ref(storage, `cars/${fileName}`);
    
    // Upload the file
    await uploadBytes(storageRef, image);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    imageUrls.push(downloadURL);
  }

  return imageUrls;
}

// This function adds a new car document to the 'cars' collection in Firestore.
export async function addCar(carData: Omit<Car, "id" | "createdAt" | 'bookedDates' | 'images' | 'dataAiHint'>, imageUrls: string[]) {
  if (!db) {
    console.error("Firestore is not initialized.");
    throw new Error("Database connection is not available.");
  }

  try {
    const carsCollectionRef = collection(db, "cars");
    await addDoc(carsCollectionRef, {
      ...carData,
      images: imageUrls,
      dataAiHint: `${carData.type} car`,
      bookedDates: [],
      createdAt: serverTimestamp(),
    });
    revalidatePath('/admin');
    revalidatePath('/cars');
    revalidatePath('/');
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Failed to add car to the database.");
  }
}

// This function updates an existing car document.
export async function updateCar(carId: string, carData: Partial<Omit<Car, "id" | "images">>) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const carDocRef = doc(db, 'cars', carId);

  try {
    await updateDoc(carDocRef, carData);
    revalidatePath('/admin');
    revalidatePath(`/admin/edit/${carId}`);
    revalidatePath(`/cars/${carId}`);
    revalidatePath('/cars');
    revalidatePath('/');
  } catch (error) {
    console.error("Error updating document:", error);
    throw new Error("Failed to update car in the database.");
  }
}

// This function deletes a car and its associated images from storage
export async function deleteCar(carId: string) {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const carDocRef = doc(db, 'cars', carId);
    const carSnap = await getDoc(carDocRef);

    if (!carSnap.exists()) {
        throw new Error("Car not found");
    }

    const carData = carSnap.data() as Car;

    // Delete images from Firebase Storage
    if (carData.images && carData.images.length > 0) {
        const storage = getStorage(app);
        const deletePromises = carData.images.map(imageUrl => {
            try {
                const imageRef = ref(storage, imageUrl);
                return deleteObject(imageRef);
            } catch (error) {
                // This can happen if the URL is malformed, just log it
                console.error(`Failed to create storage reference for URL: ${imageUrl}`, error);
                return Promise.resolve(); // Don't block deletion for one bad URL
            }
        });
        await Promise.all(deletePromises);
    }
    
    // Delete the document from Firestore
    await deleteDoc(carDocRef);
    
    revalidatePath('/admin');
    revalidatePath('/cars');
    revalidatePath('/');
}

// This function toggles the isAvailable status of a car.
export async function toggleCarAvailability(carId: string, currentState: boolean) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const carDocRef = doc(db, 'cars', carId);

  try {
    await updateDoc(carDocRef, {
      isAvailable: !currentState
    });
    revalidatePath('/admin');
    revalidatePath('/cars');
    revalidatePath(`/cars/${carId}`);
    revalidatePath('/');
  } catch (error) {
    console.error("Error updating car availability:", error);
    throw new Error("Failed to update car availability.");
  }
}
