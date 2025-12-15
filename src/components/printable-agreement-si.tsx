

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
    <p className="text-xs font-semibold text-gray-600 mb-0.5">{label}</p>
    <p className="text-sm border-b border-gray-400 border-dotted pb-0.5 min-h-[20px] font-sinhala">
      {value || ''}
    </p>
  </div>
);

const SignatureField = ({ label, className }: { label: string, className?: string }) => (
    <div className={`flex flex-col mt-6 ${className}`}>
        <p className="border-t border-gray-400 pt-1 text-xs text-center">{label}</p>
    </div>
)

const PageHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-4">
        <div className="flex justify-center items-center gap-4">
             <Image src="/rtm.png" alt="JOSH TOURS Logo" width={60} height={60} className="rounded-full"/>
             <div>
                <h1 className="text-3xl font-bold text-red-600">JOSH TOURS</h1>
                <p className="text-xs">Your trusted partner for reliable car rentals.</p>
             </div>
        </div>
        <h2 className="text-xl font-semibold mt-3 border-b-2 border-black pb-1 font-sinhala">{title}</h2>
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
        <div className={`flex justify-between items-center py-0.5 border-b border-gray-200 ${className}`}>
            <p className="text-[10px] text-gray-600 font-sinhala">{label}</p>
            <p className="text-[10px] font-medium text-gray-800">{displayValue}</p>
        </div>
    );
};


const PrintableAgreementSi = React.forwardRef<HTMLDivElement, PrintableAgreementProps>(({ data, booking, car, subTotal, totalAmount, balanceDue }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm] font-sinhala">
      {/* Page 1 */}
      <div data-page="1" className="p-8 min-h-[297mm] flex flex-col">
        <PageHeader title="වාහන කුලියට දීමේ ගිවිසුම" />
        <div className="space-y-1 flex-grow">
          {/* Section 1 */}
          <div className="border border-black p-2">
              <h3 className="text-base font-bold mb-2">1. ගිවිසුම් විස්තර</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Field label="ගිවිසුම් දිනය" value={data.agreementDate} />
                  <Field label="ජාතික හැඳුනුම්පත් අංකය හෝ ගමන් බලපත්‍ර අංකය" value={data.renterIdOrPassport} />
                  <div className="col-span-2">
                      <Field label="ලිපිනය" value={data.renterAddress} />
                  </div>
                  <Field label="වාහන විස්තර" value={data.vehicleDetails} />
                  <Field label="කුලියට දෙන දිනය" value={data.rentalStartDate} />
                  <Field label="කුලී කාලය (දින/මාස)" value={data.rentalDuration} />
                  <Field label="දිනකට/මාසයකට කුලී ගාස්තුව" value={data.rentCostPerDayMonth} />
                  <Field label="සම්පූර්ණ කුලී ගාස්තුව" value={data.totalRentCost} />
                  <Field label="තැන්පතු මුදල" value={data.depositMoney} />
                  <Field label="දෛනික කි.මී. සීමාව" value={data.dailyKMLimit} />
                  <Field label="අමතර කි.මී. සඳහා මිල" value={data.priceForAdditionalKM} />
              </div>
          </div>
          
          {/* Section 2 */}
          <div className="border border-black p-2 mt-1">
              <h3 className="text-base font-bold mb-2">2. සේවාදායකයාගේ විස්තර</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                   <Field label="සේවාදායකයාගේ සම්පූර්ණ නම" value={data.clientFullName} />
                   <Field label="සම්බන්ධතා අංකය" value={data.clientContactNumber} />
                   <div className="col-span-2 pt-4">
                      <SignatureField label="සේවාදායකයාගේ අත්සන" />
                   </div>
              </div>
          </div>

          {/* Section 3 */}
          <div className="border border-black p-2 mt-1">
              <h3 className="text-base font-bold mb-2">3. ඇපකරුගේ විස්තර</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                   <Field label="ඇපකරුගේ නම" value={data.guarantorName} />
                   <Field label="ඇපකරුගේ ජාතික හැඳුනුම්පත" value={data.guarantorNIC} />
                   <div className="col-span-2">
                      <Field label="ලිපිනය" value={data.guarantorAddress} />
                   </div>
                   <Field label="සම්බන්ධතා අංකය" value={data.guarantorContact} />
                   <div className="col-span-2 pt-4">
                      <SignatureField label="ඇපකරුගේ අත්සන" />
                   </div>
              </div>
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 pt-2">පිටුව 1 / 3</p>
      </div>

      {/* Page 2 */}
      <div data-page="2" className="p-8 min-h-[297mm] flex flex-col">
        <PageHeader title="වාහන කුලියට දීමේ ගිවිසුම (දිගටම)" />
         <div className="space-y-1 flex-grow">
            {/* Section 4 */}
            <div className="border border-black p-2">
                <h3 className="text-base font-bold mb-2">4. ගිවිසුම් තහවුරු කිරීම</h3>
                <div className="grid grid-cols-2 gap-x-8">
                    <SignatureField label="සේවාදායකයාගේ/නිලධාරියාගේ අත්සන" />
                    <Field label="දිනය" value={data.clientSignDate} />
                </div>
            </div>

            {/* Section 5 */}
            <div className="border border-black p-2 mt-1">
                <h3 className="text-base font-bold mb-2">5. දීර්ඝ කිරීමේ කොටස (අවශ්‍ය නම්)</h3>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    <Field label="දීර්ඝ කළ දිනය" className="col-span-3"/>
                    <SignatureField label="කුලීකරුගේ අත්සන" />
                    <SignatureField label="ඇපකරුගේ අත්සන" />
                    <SignatureField label="සමාගමේ අත්සන" />
                </div>
            </div>

            {/* Section 6 */}
            <div className="border border-black p-2 mt-1">
                <h3 className="text-base font-bold mb-2">6. වාහනය ආපසු භාරදීමේ අත්සන්</h3>
                 <div className="col-span-2 grid grid-cols-2 gap-x-8 pt-4">
                    <SignatureField label="සේවාදායකයාගේ ආපසු භාරදීමේ අත්සන" />
                    <SignatureField label="සමාගම් හිමිකරුගේ අත්සන" />
                </div>
            </div>
             <div className="text-xs text-gray-600 mt-4 p-2 border border-dashed font-sinhala">
                <h4 className="font-bold">නියමයන් සහ කොන්දේසි සාරාංශය</h4>
                <p>වාහනය නියමිත දිනයේ ආපසු භාර දිය යුතුය. ඕනෑම ප්‍රමාදයක් සඳහා අමතර ගාස්තු අය කෙරේ. රක්ෂණයෙන් ආවරණය නොවන ඕනෑම හානියක් සඳහා කුලීකරු වගකිව යුතුය. ඉන්ධන ලැබුණු මට්ටමටම ආපසු ලබා දිය යුතුය. සම්පූර්ණ නියමයන් ඉල්ලීම මත ලබා ගත හැක.</p>
            </div>
        </div>
        <p className="text-xs text-center text-gray-500 pt-2">පිටුව 2 / 3</p>
      </div>

       {/* Page 3 - Bill */}
      <div data-page="3" className="p-8 min-h-[297mm] flex flex-col">
        <PageHeader title="පිරිවැය සහ බිල්පත් සාරාංශය" />
        <div className="flex-grow">
             <div className="grid grid-cols-2 gap-x-6 mb-2 text-xs">
                <div>
                    <p className="font-bold">වාහන කුලියට ගත් පාර්ශවය:</p>
                    <p>{booking?.customerName}</p>
                    <p>{booking?.customerPhone}</p>
                    <p>{booking?.customerEmail}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold">බිල්පත් දිනය:</span> {data.billDate ? format(parseISO(data.billDate), 'PPP') : 'N/A'}</p>
                    <p><span className="font-bold">වෙන්කිරීමේ අංකය:</span> {booking?.id}</p>
                    <p><span className="font-bold">වාහනය:</span> {booking?.carName}</p>
                </div>
            </div>
             <div>
                <h3 className="text-sm font-bold mb-1 bg-gray-100 p-1">ගාස්තු</h3>
                <div className="space-y-0">
                    <BillField label="මුළු කුලී ගාස්තුව" value={Number(data.totalRentCost) || 0} />
                    <BillField label="අමතර කිලෝමීටර" value={`${data.additionalKm || 0} km`} isCurrency={false}/>
                    <BillField label="අමතර කි.මී. සඳහා මිල" value={data.pricePerKm || 0} />
                    <BillField label="අමතර දින" value={`${data.additionalDays || 0} days`} isCurrency={false}/>
                    <BillField label="අමතර දිනකට මිල" value={data.pricePerDay || 0} />
                </div>

                <h3 className="text-sm font-bold mt-1 mb-1 bg-gray-100 p-1">වෙනත් ගාස්තු</h3>
                 <div className="space-y-0">
                    <BillField label="හානි" value={data.damages || 0} />
                    <BillField label="ප්‍රමාද ගෙවීම්" value={data.delayPayments || 0} />
                    <BillField label="වෙනත් විවිධ ගාස්තු" value={data.otherCharges || 0} />
                </div>

                 <h3 className="text-sm font-bold mt-1 mb-1 bg-gray-100 p-1">සාරාංශය</h3>
                  <div className="space-y-0">
                    <BillField label="ගෙවිය යුතු මුළු මුදල" value={totalAmount} className="font-bold"/>
                    <BillField label="ගෙවූ මුදල (අත්තිකාරම්, ආදිය)" value={data.paidAmount || 0} />
                    <div className="flex justify-between items-center py-1 border-t-2 border-dashed mt-0.5 bg-blue-50 text-blue-800 px-2 rounded-md">
                        <p className="text-sm font-extrabold">ගෙවිය යුතු ශේෂය</p>
                        <p className="text-sm font-extrabold">Rs {balanceDue.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
        <p className="text-xs text-center text-gray-500 pt-2">පිටුව 3 / 3</p>
      </div>
    </div>
  );
});

PrintableAgreementSi.displayName = 'PrintableAgreementSi';
export default PrintableAgreementSi;
