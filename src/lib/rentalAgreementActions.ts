
'use server';

import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

// Interface for the data structure of the rental agreement.
// All fields are optional because the form can be saved partially.
export interface RentalAgreement {
  id: string; // Corresponds to bookingId
  bookingId: string;
  lastUpdated: string;

  // Section 1: Agreement Details
  agreementDate?: string;
  renterIdOrPassport?: string;
  renterAddress?: string;
  vehicleDetails?: string; // Pre-filled from car data
  rentalStartDate?: string; // Pre-filled from booking
  rentalDuration?: string;
  rentCostPerDayMonth?: string;
  totalRentCost?: string;
  depositMoney?: string;
  dailyKMLimit?: string;
  priceForAdditionalKM?: string;

  // Section 2: Client Details
  clientFullName?: string; // Pre-filled from user data
  clientContactNumber?: string; // Pre-filled from user data
  clientSignDate?: string;

  // Section 3: Guarantor Details
  guarantorName?: string;
  guarantorNIC?: string;
  guarantorAddress?: string;
  guarantorContact?: string;
  
  // Billing Fields
  billDate?: string;
  additionalKm?: number;
  pricePerKm?: number;
  additionalDays?: number;
  pricePerDay?: number;
  damages?: number;
  delayPayments?: number;
  otherCharges?: number;
  paidAmount?: number;
}

// Function to save/update a rental agreement
export async function saveRentalAgreement(
  bookingId: string,
  data: Partial<Omit<RentalAgreement, 'id' | 'lastUpdated' | 'bookingId'>>
): Promise<{ success: boolean }> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const agreementDocRef = doc(db, 'rentalAgreements', bookingId);

  try {
    await setDoc(
      agreementDocRef,
      {
        ...data,
        bookingId: bookingId,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    revalidatePath(`/agreement/${bookingId}`);
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error) {
    console.error('Error saving rental agreement:', error);
    throw new Error('Failed to save rental agreement.');
  }
}

// Function to fetch a rental agreement
export async function getRentalAgreement(bookingId: string): Promise<RentalAgreement | null> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const agreementDocRef = doc(db, 'rentalAgreements', bookingId);
  const docSnap = await getDoc(agreementDocRef);

  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  const lastUpdated = data.lastUpdated instanceof Timestamp
    ? data.lastUpdated.toDate().toISOString()
    : new Date().toISOString();

  return {
    id: docSnap.id,
    bookingId: data.bookingId,
    lastUpdated,
    agreementDate: data.agreementDate || '',
    renterIdOrPassport: data.renterIdOrPassport || '',
    renterAddress: data.renterAddress || '',
    vehicleDetails: data.vehicleDetails || '',
    rentalStartDate: data.rentalStartDate || '',
    rentalDuration: data.rentalDuration || '',
    rentCostPerDayMonth: data.rentCostPerDayMonth || '',
    totalRentCost: data.totalRentCost || '',
    depositMoney: data.depositMoney || '',
    dailyKMLimit: data.dailyKMLimit || '',
    priceForAdditionalKM: data.priceForAdditionalKM || '',
    clientFullName: data.clientFullName || '',
    clientContactNumber: data.clientContactNumber || '',
    clientSignDate: data.clientSignDate || '',
    guarantorName: data.guarantorName || '',
    guarantorNIC: data.guarantorNIC || '',
    guarantorAddress: data.guarantorAddress || '',
    guarantorContact: data.guarantorContact || '',
    // Billing fields
    billDate: data.billDate || '',
    additionalKm: data.additionalKm || 0,
    pricePerKm: data.pricePerKm || 0,
    additionalDays: data.additionalDays || 0,
    pricePerDay: data.pricePerDay || 0,
    damages: data.damages || 0,
    delayPayments: data.delayPayments || 0,
    otherCharges: data.otherCharges || 0,
    paidAmount: data.paidAmount || 0,
  };
}
