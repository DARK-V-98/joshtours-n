

'use client';

import React from 'react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import type { AgreementFormValues } from '@/app/agreement/[bookingId]/AgreementPageClient';
import { BookingRequest } from '@/lib/bookingActions';
import { Car } from '@/lib/data';

interface PrintableAgreementProps {
  data: AgreementFormValues;
  booking: BookingRequest | null;
  car: Car | null;
  subTotal: number;
  totalAmount: number;
  balanceDue: number;
}

const Field = ({ label, value, className }: { label: string; value?: string, className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
    <p className="text-sm border-b border-gray-400 border-dotted pb-1 min-h-[24px]">
      {value || ''}
    </p>
  </div>
);

const SignatureField = ({ label, className }: { label: string, className?: string }) => (
    <div className={`flex flex-col mt-12 ${className}`}>
        <p className="border-t border-gray-500 pt-2 text-xs text-center">{label}</p>
    </div>
);

const PageHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-4">
             <Image src="/rtm.png" alt="JOSH TOURS Logo" width={50} height={50} className="rounded-full"/>
             <div>
                <h1 className="text-2xl font-bold text-red-600 tracking-wider">JOSH TOURS</h1>
                <p className="text-xs text-gray-500">Your trusted partner for reliable car rentals.</p>
             </div>
        </div>
        <h2 className="text-lg font-semibold mt-4 border-b-2 border-gray-300 pb-2">{title}</h2>
      </div>
);

const BillField = ({ label, value, className, isCurrency = true }: { label: string; value?: string | number, className?: string, isCurrency?: boolean }) => {
    let displayValue: string;

    if (typeof value === 'number') {
        displayValue = isCurrency ? `Rs ${value.toFixed(2)}` : `${value}`;
    } else {
        displayValue = value || '---';
    }

    return (
        <div className={`flex justify-between items-center py-1 border-b border-gray-200 ${className}`}>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-sm font-medium text-gray-800">{displayValue}</p>
        </div>
    );
};


const PrintableAgreement = React.forwardRef<HTMLDivElement, PrintableAgreementProps>(({ data, booking, car, subTotal, totalAmount, balanceDue }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm]">
      {/* Page 1 */}
      <div data-page="1" className="p-8 min-h-[297mm] flex flex-col border-2 border-gray-200 rounded-lg">
        <PageHeader title="Vehicle Rental Agreement" />
        <div className="space-y-4 flex-grow">
          {/* Section 1 */}
          <section className="border border-gray-300 p-3 rounded-md">
              <h3 className="text-base font-bold mb-3 bg-gray-50 p-2 rounded -m-3">1. Agreement Details</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-2">
                  <Field label="Agreement Date" value={data.agreementDate} />
                  <Field label="NIC or Passport No" value={data.renterIdOrPassport} />
                  <div className="col-span-2">
                      <Field label="Address" value={data.renterAddress} />
                  </div>
                  <Field label="Vehicle Details" value={data.vehicleDetails} />
                  <Field label="Rental Start Date" value={data.rentalStartDate} />
                  <Field label="Rental Duration (Days/Months)" value={data.rentalDuration} />
                  <Field label="Rent Cost Per Day/Month" value={data.rentCostPerDayMonth} />
                  <Field label="Total Rent Cost" value={data.totalRentCost} />
                  <Field label="Deposit Money" value={data.depositMoney} />
                  <Field label="Daily KM Limit" value={data.dailyKMLimit} />
                  <Field label="Price for Additional KM" value={data.priceForAdditionalKM} />
              </div>
          </section>
          
          {/* Section 2 */}
          <section className="border border-gray-300 p-3 rounded-md">
              <h3 className="text-base font-bold mb-3 bg-gray-50 p-2 rounded -m-3">2. Client Details</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-2">
                   <Field label="Client Full Name" value={data.clientFullName} />
                   <Field label="Contact Number" value={data.clientContactNumber} />
                   <div className="col-span-2 pt-4">
                      <SignatureField label="Client Signature" />
                   </div>
              </div>
          </section>

          {/* Section 3 */}
          <section className="border border-gray-300 p-3 rounded-md">
              <h3 className="text-base font-bold mb-3 bg-gray-50 p-2 rounded -m-3">3. Guarantor Details</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-2">
                   <Field label="Guarantor Name" value={data.guarantorName} />
                   <Field label="Guarantor NIC" value={data.guarantorNIC} />
                   <div className="col-span-2">
                      <Field label="Address" value={data.guarantorAddress} />
                   </div>
                   <Field label="Contact Number" value={data.guarantorContact} />
                   <div className="col-span-2 pt-4">
                      <SignatureField label="Guarantor Signature" />
                   </div>
              </div>
          </section>
        </div>
        <p className="text-xs text-center text-gray-400 pt-4">Page 1 of 3</p>
      </div>

      {/* Page 2 */}
      <div data-page="2" className="p-8 min-h-[297mm] flex flex-col border-2 border-gray-200 rounded-lg mt-4">
        <PageHeader title="Vehicle Rental Agreement (Continued)" />
         <div className="space-y-4 flex-grow">
            {/* Section 4 */}
            <section className="border border-gray-300 p-3 rounded-md">
                <h3 className="text-base font-bold mb-3 bg-gray-50 p-2 rounded -m-3">4. Agreement Confirmation</h3>
                <div className="grid grid-cols-2 gap-x-8 p-2">
                    <SignatureField label="Client/Official Signature" />
                    <Field label="Date" value={data.clientSignDate} />
                </div>
            </section>

            {/* Section 5 */}
            <section className="border border-gray-300 p-3 rounded-md">
                <h3 className="text-base font-bold mb-3 bg-gray-50 p-2 rounded -m-3">5. Extension Section (Optional)</h3>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 p-2">
                    <Field label="Extension Date" className="col-span-3"/>
                    <SignatureField label="Renter Signature" />
                    <SignatureField label="Guarantor Signature" />
                    <SignatureField label="Company Signature" />
                </div>
            </section>

            {/* Section 6 */}
            <section className="border border-gray-300 p-3 rounded-md">
                <h3 className="text-base font-bold mb-3 bg-gray-50 p-2 rounded -m-3">6. Vehicle Return Signatures</h3>
                 <div className="col-span-2 grid grid-cols-2 gap-x-8 pt-4 p-2">
                    <SignatureField label="Client Return Signature" />
                    <SignatureField label="Company Owner Signature" />
                </div>
            </section>
             <div className="text-xs text-gray-600 mt-4 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <h4 className="font-bold mb-1">Terms & Conditions Summary</h4>
                <p>The vehicle must be returned on the specified date. Any delay will incur additional charges. The renter is responsible for any damage not covered by insurance. Fuel must be returned at the same level as received. Full terms are available upon request.</p>
            </div>
        </div>
        <p className="text-xs text-center text-gray-400 pt-4">Page 2 of 3</p>
      </div>
      
       {/* Page 3 - Bill */}
      <div data-page="3" className="p-8 min-h-[297mm] flex flex-col border-2 border-gray-200 rounded-lg mt-4">
        <PageHeader title="Cost & Billing Summary"/>
        <div className="flex-grow">
            <div className="grid grid-cols-2 gap-x-6 mb-4 text-sm p-3 bg-gray-50 rounded-lg border">
                <div>
                    <p className="font-bold text-gray-700">Renter:</p>
                    <p className="text-gray-600">{booking?.customerName}</p>
                    <p className="text-gray-600">{booking?.customerPhone}</p>
                    <p className="text-gray-600">{booking?.customerEmail}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold text-gray-700">Bill Date:</span> {data.billDate ? format(parseISO(data.billDate), 'PPP') : 'N/A'}</p>
                    <p><span className="font-bold text-gray-700">Booking ID:</span> {booking?.id}</p>
                    <p><span className="font-bold text-gray-700">Vehicle:</span> {booking?.carName}</p>
                </div>
            </div>

            <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Charges Breakdown</h3>
                <div className="space-y-1">
                    <BillField label="Base Rental Cost" value={Number(data.totalRentCost) || 0} />
                    <BillField label="Additional Kilometers" value={`${data.additionalKm || 0} km`} isCurrency={false}/>
                    <BillField label="Price per Additional KM" value={data.pricePerKm || 0} />
                    <BillField label="Additional Days" value={`${data.additionalDays || 0} days`} isCurrency={false}/>
                    <BillField label="Price per Additional Day" value={data.pricePerDay || 0} />
                </div>

                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Other Charges</h3>
                 <div className="space-y-1">
                    <BillField label="Damages" value={data.damages || 0} />
                    <BillField label="Delay Payments" value={data.delayPayments || 0} />
                    <BillField label="Other Miscellaneous Charges" value={data.otherCharges || 0} />
                </div>

                 <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Summary</h3>
                  <div className="space-y-1">
                    <BillField label="Total Amount Due" value={totalAmount} className="font-bold text-base"/>
                    <BillField label="Amount Paid (Advance, etc.)" value={data.paidAmount || 0} />
                    <div className="flex justify-between items-center py-2 border-t-2 border-gray-400 mt-2 bg-blue-50 text-blue-800 px-3 rounded-md">
                        <p className="text-base font-extrabold">Balance Due</p>
                        <p className="text-base font-extrabold">Rs {balanceDue.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
         <p className="text-xs text-center text-gray-400 pt-4">Page 3 of 3</p>
      </div>

    </div>
  );
});

PrintableAgreement.displayName = 'PrintableAgreement';
export default PrintableAgreement;
