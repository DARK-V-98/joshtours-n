
"use server";

import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc, Timestamp, orderBy, updateDoc,getCountFromServer, arrayUnion, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, app } from "@/lib/firebase"; 
import { revalidatePath } from "next/cache";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];

// Helper function to upload a single file and return its URL
async function uploadFile(file: File, path: string): Promise<string> {
    if (!app) throw new Error("Firebase not initialized");

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        // This check provides an early exit for unsupported file types.
        console.warn(`Unsupported file type skipped: ${file.name} (${file.type})`);
        // We can either throw an error or return an empty string/null.
        // For this case, we'll let it proceed but the warning is useful for debugging.
    }

    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

// New function to handle uploading all booking-related documents
export async function uploadBookingDocuments(bookingId: string, formData: FormData) {
    const fileFields = [
        'customerNicFront', 'customerNicBack', 'customerLicenseFront', 'customerLicenseBack',
        'customerPassportFront', 'customerPassportBack', 'customerLightBill', 'customerWaterBill',
        'guarantorNicFront', 'guarantorNicBack', 'guarantorLicenseFront', 'guarantorLicenseBack',
        'guarantorPassportFront', 'guarantorPassportBack', 'guarantorLightBill', 'guarantorWaterBill'
    ];
    
    const urls: { [key: string]: string } = {};

    for (const field of fileFields) {
        const file = formData.get(field) as File | null;
        if (file && file.size > 0) {
            const path = `booking-documents/${bookingId}/${field}-${file.name}`;
            urls[`${field}Url`] = await uploadFile(file, path);
        }
    }
    return urls;
}


// All possible fields for a booking request
export interface BookingRequestData {
  carId: string;
  carName: string;
  userId: string;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  estimatedKm?: number;
  requests?: string;
  status?: 'pending' | 'confirmed' | 'canceled';

  // Customer Details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerResidency: 'local' | 'tourist';
  customerNicOrPassport: string;
  customerNicFrontUrl?: string;
  customerNicBackUrl?: string;
  customerPassportFrontUrl?: string;
  customerPassportBackUrl?: string;
  customerLicenseFrontUrl?: string;
  customerLicenseBackUrl?: string;
  customerLightBillUrl?: string;
  customerWaterBillUrl?: string;

  // Guarantor Details
  guarantorName: string;
  guarantorPhone: string;
  guarantorResidency: 'local' | 'tourist';
  guarantorNicOrPassport: string;
  guarantorNicFrontUrl?: string;
  guarantorNicBackUrl?: string;
  guarantorPassportFrontUrl?: string;
  guarantorPassportBackUrl?: string;
  guarantorLicenseFrontUrl?: string;
  guarantorLicenseBackUrl?: string;
  guarantorLightBillUrl?: string;
  guarantorWaterBillUrl?: string;
}


// Stored in Firestore
export interface BookingRequest extends BookingRequestData {
  id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string; // ISO String
}

async function blockCarDates(carId: string, pickupDateStr: string, returnDateStr: string) {
    if (!db) return;
    const carDocRef = doc(db, 'cars', carId);

    const startDate = parseISO(pickupDateStr);
    const endDate = parseISO(returnDateStr);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    const dateStrings = dateRange.map(date => format(date, 'yyyy-MM-dd'));

    // Atomically add the new date strings to the array.
    await updateDoc(carDocRef, {
        bookedDates: arrayUnion(...dateStrings)
    });
}

export async function createBookingRequest(
    data: Omit<BookingRequestData, 'status' | 'customerNicFrontUrl' | 'customerNicBackUrl' | 'customerPassportFrontUrl' | 'customerPassportBackUrl' | 'customerLicenseFrontUrl' | 'customerLicenseBackUrl' | 'customerLightBillUrl' | 'customerWaterBillUrl' | 'guarantorNicFrontUrl' | 'guarantorNicBackUrl' | 'guarantorPassportFrontUrl' | 'guarantorPassportBackUrl' | 'guarantorLicenseFrontUrl' | 'guarantorLicenseBackUrl' | 'guarantorLightBillUrl' | 'guarantorWaterBillUrl'>, 
    documentFormData: FormData
) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const bookingStatus = (data as any).status || 'pending';
  
  const bookingRequestData = {
      ...data,
      status: bookingStatus,
      createdAt: serverTimestamp(),
  };

  try {
    const requestsCollection = collection(db, "bookingRequests");
    const docRef = await addDoc(requestsCollection, bookingRequestData);
    
    // Now update the document with its own ID
    await updateDoc(docRef, { id: docRef.id });

    // Handle file uploads after we have a document ID
    if (documentFormData.entries().next().value) {
        const documentUrls = await uploadBookingDocuments(docRef.id, documentFormData);
        if (Object.keys(documentUrls).length > 0) {
            await updateDoc(docRef, documentUrls);
        }
    }

    // If the booking is confirmed, block the dates on the car
    if (bookingStatus === 'confirmed') {
        await blockCarDates(data.carId, data.pickupDate, data.returnDate);
    }
  } catch (serverError: any) {
    console.error("Error creating booking request:", serverError);
    // Instead of emitting, we now throw the error for the server action to handle.
    // This allows Next.js to properly manage the server response.
    // We can still create a contextual error, but we'll throw it instead of emitting.
    const permissionError = new FirestorePermissionError({
      path: "bookingRequests",
      operation: 'create',
      requestResourceData: bookingRequestData,
    } satisfies SecurityRuleContext);
    
    // For now, let's throw a more generic but clear error to unblock.
    throw new Error(`Failed to create booking request: ${serverError.message}`);
  }

  revalidatePath('/my-bookings');
  revalidatePath('/admin/bookings');
  revalidatePath(`/cars/${data.carId}`);
  revalidatePath('/cars');
}

export async function getBookingRequestById(bookingId: string): Promise<BookingRequest | null> {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const docRef = doc(db, 'bookingRequests', bookingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : new Date().toISOString();
    
    return {
        id: docSnap.id,
        ...data,
        createdAt,
    } as BookingRequest;
}

export async function getBookingRequestsForUser(userId: string): Promise<BookingRequest[]> {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const requestsCollection = collection(db, 'bookingRequests');
    const q = query(requestsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString();

        return {
            id: doc.id,
            ...data,
            createdAt,
        } as BookingRequest;
    });
}


export async function cancelBookingRequest(bookingId: string) {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const bookingDocRef = doc(db, 'bookingRequests', bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
        throw new Error("Booking request not found.");
    }

    // Instead of deleting, we update the status to 'canceled'
    try {
        await updateDoc(bookingDocRef, {
            status: 'canceled'
        });
        revalidatePath('/my-bookings');
        revalidatePath('/admin/bookings');
    } catch (error) {
        console.error("Error canceling booking request:", error);
        throw new Error("Failed to cancel the booking request.");
    }
}


// ADMIN FUNCTIONS

export async function getAllBookingRequests(): Promise<BookingRequest[]> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const requestsCollection = collection(db, 'bookingRequests');
  const q = query(requestsCollection, orderBy('createdAt', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();

      return {
        id: doc.id,
        ...data,
        createdAt,
      } as BookingRequest;
    });
  } catch (serverError) {
    // This is the new error handling implementation
    const permissionError = new FirestorePermissionError({
      path: requestsCollection.path,
      operation: 'list',
    });
    // We throw the error here so the client-side component can catch it
    // and the development overlay can display it.
    throw permissionError;
  }
}

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'canceled') {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const bookingDocRef = doc(db, 'bookingRequests', bookingId);
    
    updateDoc(bookingDocRef, { status }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: bookingDocRef.path,
            operation: 'update',
            requestResourceData: { status },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });

    if (status === 'confirmed') {
        const bookingSnap = await getDoc(bookingDocRef);
        if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data() as BookingRequestData;
            await blockCarDates(bookingData.carId, bookingData.pickupDate, bookingData.returnDate);
            revalidatePath(`/cars/${bookingData.carId}`);
        }
    }

    revalidatePath('/admin/bookings');
    revalidatePath('/my-bookings');
    revalidatePath('/cars');
}


export async function getPendingBookingCount(): Promise<number> {
    if (!db) {
        console.error("Database not initialized");
        return 0;
    }
    try {
        const requestsCollection = collection(db, 'bookingRequests');
        const q = query(requestsCollection, where('status', '==', 'pending'));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error fetching pending booking count:", error);
        return 0;
    }
}
