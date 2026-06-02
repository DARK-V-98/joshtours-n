
'use client';

import React from 'react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import type { AgreementFormValues } from '@/app/agreement/[bookingId]/AgreementPageClient';
import { BookingRequest } from '@/lib/bookingActions';

interface PrintableBillProps {
  data: AgreementFormValues;
  booking: BookingRequest | null;
  subTotal: number;
  totalAmount: number;
  balanceDue: number;
}

const PageHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-4">
             <img src="/rtm.png" alt="JOSH TOURS Logo" width={50} height={50} className="rounded-full"/>
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


const PrintableBill = React.forwardRef<HTMLDivElement, PrintableBillProps>(({ data, booking, subTotal, totalAmount, balanceDue }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm]">
      <div data-page="1" className="p-8 min-h-[297mm] flex flex-col border-2 border-gray-200 rounded-lg">
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
      </div>
    </div>
  );
});

PrintableBill.displayName = 'PrintableBill';
export default PrintableBill;
