

'use client';

import React from 'react';
import Image from 'next/image';
import { UseFormReturn, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { LeaseAgreementFormValues } from '@/app/admin/lease-agreement/page';
import { Star } from 'lucide-react';

const SignatureField = ({ label, className }: { label: string, className?: string }) => (
    <div className={`flex flex-col mt-12 ${className}`}>
        <p className="border-t border-gray-600 border-dotted pt-1 text-xs text-center font-sinhala">{label}</p>
    </div>
)

const PageHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-4">
             <Image src="/rtm.png" alt="JOSH TOURS Logo" width={50} height={50} className="rounded-full"/>
             <div>
                <h1 className="text-2xl font-bold text-red-600 tracking-wider">JOSH TOURS</h1>
                <p className="text-xs text-gray-500">Your trusted partner for reliable car rentals.</p>
             </div>
        </div>
        <h2 className="text-lg font-semibold mt-4 border-b-2 border-gray-300 pb-2 font-sinhala">{title}</h2>
      </div>
);

const DottedInputComponent = ({ name, control, isPrinting, className, placeholder }: { name: keyof LeaseAgreementFormValues, control: any, isPrinting: boolean, className?: string, placeholder?: string }) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          isPrinting ? (
            <span className={cn("font-semibold font-sinhala border-b border-dotted border-black px-1", className)}>
                {field.value || placeholder}
            </span>
          ) : (
            <input
              {...field}
              placeholder={placeholder}
              className={cn("border-b border-dotted border-black bg-transparent focus:outline-none text-center font-semibold font-sinhala", className)}
            />
          )
        )}
      />
    );
  };
const DottedInput = React.memo(DottedInputComponent);


const PrintableLeaseAgreementSi = React.forwardRef<HTMLDivElement, { form: UseFormReturn<LeaseAgreementFormValues>; isPrinting: boolean; }>(({ form, isPrinting }, ref) => {
  const { control } = form;

  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm]">
      {/* Page 1 */}
      <div data-page="1" className="p-8 min-h-[297mm] flex flex-col text-sm leading-relaxed border-2 border-gray-200 rounded-lg">
        <PageHeader title="රථය කුලී පදනම මත ධාවනයට ලබා දීමේ ගිවිසුම් පත්‍රයයි" />

        <p className="text-justify mb-4 font-sinhala leading-loose">
            <DottedInput name="vehicleRegNo" control={control} isPrinting={isPrinting} placeholder="අංකය"/> දරණ <DottedInput name="vehicleName" control={control} isPrinting={isPrinting} placeholder="රථයේ නම"/> රථය කුලී පදනම මත ධාවනය ලබා දීමේ ගිවිසුම් පත්‍රයයි.
        </p>

        <p className="text-justify mb-4 font-sinhala leading-loose">
            මෙහි පළමු පාර්ශවය (බදු දීමනාකරු රථයේ ලියාපදිංචි අයිතිකරු) ලෙස <DottedInput name="lessorName" control={control} isPrinting={isPrinting} placeholder="බදු දීමනාකරු"/> (ජාතික හැඳුනුම්පත් අංක <DottedInput name="lessorNic" control={control} isPrinting={isPrinting} placeholder="ජා.හැ. අංකය"/>) සහ දෙවන පාර්ශවය <DottedInput name="lesseeAddress" control={control} isPrinting={isPrinting} className="w-full" placeholder="ලිපිනය"/> ලිපිනයෙහි පදිංචි <DottedInput name="lesseeName" control={control} isPrinting={isPrinting} placeholder="බදු ගැණුම්කරු"/> (ජාතික හැඳුනුම්පත් අංක <DottedInput name="lesseeNic" control={control} isPrinting={isPrinting} placeholder="ජා.හැ. අංකය"/>) යන අය දෙපාර්ශවයට බැඳී එකී දෙපාර්ශවය අතර වර්ෂ <DottedInput name="agreementYear" control={control} isPrinting={isPrinting} className="w-20" placeholder="වර්ෂය"/> ක්වූ <DottedInput name="agreementMonth" control={control} isPrinting={isPrinting} className="w-24" placeholder="මාසය"/> මස <DottedInput name="agreementDay" control={control} isPrinting={isPrinting} className="w-16" placeholder="දිනය"/> වන දින <DottedInput name="agreementLocation" control={control} isPrinting={isPrinting} className="w-32" placeholder="ස්ථානය"/> දී අත්සන් කරනු ලබන ගිවිසුම් පත්‍රය මෙහි පහත සදහන් පරිදි වේ.
        </p>

        <h3 className="font-bold underline mb-4 text-base font-sinhala">එහි කොන්දේසි:-</h3>

        <ol className="list-none space-y-4 font-sinhala leading-loose">
            <li><span className="font-bold mr-2">1.</span><DottedInput name="vehicleRegNo" control={control} isPrinting={isPrinting} placeholder="අංකය"/> දරණ <DottedInput name="vehicleName" control={control} isPrinting={isPrinting} placeholder="රථයේ නම"/> රථය <DottedInput name="rentalStartDate" control={control} isPrinting={isPrinting} placeholder="ආරම්භක දිනය"/> දින සිට මාස <DottedInput name="rentalMonths" control={control} isPrinting={isPrinting} placeholder="මාස ගණන"/> ක කාල සීමාවක් සදහා කුලී පදනම මත ධාවනයට යෙදවේ.</li>
            <li><span className="font-bold mr-2">2.</span>දෙවෙනි පාර්ශවය විසින් පළමු පාර්ශවය වෙත මාසිකව රු: <DottedInput name="monthlyRent" control={control} isPrinting={isPrinting} placeholder="මාසික කුලිය"/> මුදලක් ගෙවීමට බැඳී සිටියි. මාස <DottedInput name="rentalMonths" control={control} isPrinting={isPrinting} placeholder="මාස ගණන"/> ක කාල සීමාවක් තුල එකී රථය <DottedInput name="mileageLimit" control={control} isPrinting={isPrinting} placeholder="KM සීමාව"/> ධාවනයේ යොදවන අතර ඊට වැඩිවන සෑම කිලෝමීටරයකටම රු: <DottedInput name="extraKmFee" control={control} isPrinting={isPrinting} placeholder="අමතර ගාස්තුව"/> බැගින් ගෙවීමට දෙවන පාර්ශවය එකඟවේ. අදාල අමතර කිලෝමිටර ප්‍රමාණය ගනනය කරනු ලබන්නේ ගිවිසුම් කාලසීමාව අවසානයේ පමණි.</li>
            <li><span className="font-bold mr-2">3.</span>ඉහත කී මුදල මාසික කාලසීමාව සම්පූර්ණ වීමෙන් පසු එළඹෙන වැඩකරන දින <DottedInput name="paymentDays" control={control} isPrinting={isPrinting} placeholder="දින"/> ඇතුළත <DottedInput name="bankName" control={control} isPrinting={isPrinting} placeholder="බැංකුව"/> බැංකුවේ <DottedInput name="bankBranch" control={control} isPrinting={isPrinting} placeholder="ශාඛාව"/> ශාඛාවේ ගිණුම් අංකය <DottedInput name="accountNo" control={control} isPrinting={isPrinting} placeholder="ගිණුම් අංකය"/> දරණ <DottedInput name="accountHolder" control={control} isPrinting={isPrinting} placeholder="ගිණුම් හිමියා"/> ගිණුමට බැර කළ යුතුයි. එසේ වුවද <DottedInput name="finalMonthStartDate" control={control} isPrinting={isPrinting} placeholder="දිනය"/> දින සිට <DottedInput name="finalMonthEndDate" control={control} isPrinting={isPrinting} placeholder="දිනය"/> වන දින දක්වා වන මාසය සඳහා කුලී ගෙවීම වන රුපියල් <DottedInput name="finalMonthRent" control={control} isPrinting={isPrinting} placeholder="කුලිය"/> හා/ අමතර ධාවනය සදහා වන මුදල <DottedInput name="finalMonthExtraKmCost" control={control} isPrinting={isPrinting} placeholder="අමතර මුදල"/> <DottedInput name="finalPaymentDate" control={control} isPrinting={isPrinting} placeholder="දිනය"/> වන දිනට 2 වන පාර්ශවය ලබා දී මෙම ගිවිසුම අවසාන කිරීමට දෙවන පාර්ශවය එකඟ වේ. දෙවන පාර්ශවය ඒ ආකාරයෙන් කටයුතු නොකල හොත් ඒ සම්බන්ධයෙන් නීතිමය පියවර ගැනීමට 1 වන පාර්ශවයට අයිතිය ඇතිබව දෙවන පාර්ශවය පිළිගනී.</li>
            <li><span className="font-bold mr-2">4.</span>එකී රථයේ අනතුරක් හෝ කාර්මික දෝෂයක් ඇත්නම් නොපමාව <DottedInput name="contactNumber" control={control} isPrinting={isPrinting} placeholder="දුරකතන අංකය"/> යන දුරකතනයට දැනුම් දීමට දෙවන පාර්ශවය එකඟ වේ.</li>
        </ol>
        
        <div className="flex-grow"></div>
        
        <p className="text-xs text-center text-gray-400 pt-4">පිටුව 1 / 3</p>
      </div>

       {/* Page 2 */}
       <div data-page="2" className="p-8 min-h-[297mm] flex flex-col border-2 border-gray-200 rounded-lg mt-4">
        <PageHeader title="" />
        <div className="space-y-4 flex-grow font-sinhala">
            <ol className="list-none space-y-3 text-sm leading-loose" start={5}>
                <li><span className="font-bold mr-2">5.</span> රථය මනා තත්වයෙන් පවත්වා ගැනීමට දෙවන පාර්ශවය වගකීමෙන් බැඳේ.</li>
                <li><span className="font-bold mr-2">6.</span> ඉන්ධන වියදම සහ සේදුම් ගාස්තු දෙවන පාර්ශවය විසින් ගෙවිය යුතු අතර සේවා ගාස්තු පළමු පාර්ශවය විසින් දැරිය යුතුවේ.</li>
                <li><span className="font-bold mr-2">7.</span>රථයේ ටයර් නියමිත කාලයේදී පළමු පාර්ශවය විසින් ප්‍රතිස්ථාපනය කළයුතුය.</li>
                <li><span className="font-bold mr-2">8.</span>එකී රථය දෙවන පාර්ශවය හෝ දෙවන පාර්ශවය විසින් බලයපවරන බලපත්‍ර ලාභි රියදුරකු විසින් ධාවනය කළයුතුය.</li>
                <li><span className="font-bold mr-2">9.</span>සාධාරණ කාලයක් තුල කරන ලද පූර්ව දැනුම් දීමකින් අනතුරුව එකී රථය පරීක්ෂාකර බැලීමේ අයිතිය පළමු පාර්ශවය සතුය.</li>
                <li><span className="font-bold mr-2">10.</span>පළමු පාර්ශවය විසින් රථය පූර්ණ රක්ෂණයක් සිදුකර තිබිය යුතු අතර රථයේ කල්බදු පහසුකමක් ඇත්නම් එම වාරික නිසිවෙලාවට ගෙවීමේ වගකීම පලමු පාර්ශවය සතු වේ. එසේ නොකිරීමෙන් ඇතිවන යම් තත්වයක් කෙරෙහි දෙවන පාර්ශවය වගකීමට යටත් නොවන අතර එමගින් රථය ධාවනයට යම්බධාවක් ඇතිවේනම් අදාල කාලයට ගෙවීම් නොකිරීමේ අයිතිය දෙවන පාර්ශවය සතුවේ.</li>
                <li><span className="font-bold mr-2">11.</span>මසකට රු: 10000/- නොයික්මවන නඩත්තු කටයුතු හෝ අලුත් වැඩියා දෙවන පාර්ශවය විසින් සිදුවේ.</li>
                <li><span className="font-bold mr-2">12.</span>රිය අනතුරකදී අලුත්වැඩියා නිමවිම වනතුරු ගරාජයක නවතා තැබීමේදි එකී කලයට අදාලව ගෙවීමි කිරීමට දෙවන පාර්ශවය එකඟ වේ. එවැනි අවස්ථාවකදී රක්‍ෂණ ප්‍රතිලාභ ලභා ගැනීමට අවශ්‍ය වන ලිපි ලේඛණ පළමු පාර්ශවය විසින් හැකි ඉක්මනින් ලභා දියයුතු අතර එම ලිපිලේඛන ලබාදිමෙදි ප්‍රමාදය මත රක්‍ෂණ ප්‍රතිලාභ ලභා ප්‍රමාද වෙන්නේනම් එකී කාල සීමාව සඳහා ගෙවීමි නොකිරීමේ අයිතිය දෙවන පාර්ශවය සතුවේ.</li>
                <li><span className="font-bold mr-2">13.</span> අනතුරක් හෝ රථයට යම් අලභය හානියක් සිදුවුවිට කදී පළමු පාර්ශවයට, රක්‍ෂණ සමාගමට හා අවශ්‍ය අවස්ථාවන්හිදී පොලිස් ස්ථාන ඉක්මනින් දැනුවත් කිරීමේ වගකීම දෙවන පාර්ශවය සතුවේ.</li>
                <li><span className="font-bold mr-2">14.</span>එනමුත් පළමු පාර්ශවය විසින්සිදු කළයුතු නඩත්තු කටයුත්තක් හො අලුත්වැඩියා කටයුත්තක් හෙතුවෙන් රථය නවතා දැමීය යුතුනම් එම කාලයට අනුරූපව ගෙවීම් නොකිරීමේ අයිතිය දෙවන පාර්ශවය සතුවේ.</li>
                <li><span className="font-bold mr-2">15.</span>පළමු පාර්ශවයේ අනුමැතියකින් තොරව අලුත්වැඩියාවක් නොකළ යුතුය. පළමු පාර්ශවයේ අනුමැතියකින් පසු යම්කිසි අලුත් වැඩියාවක් දෙවන පාර්ශවය සිදුකරයි නම් (අංක 11 සඳහන් අලුත් වැඩියාවන් හැර) එළබෙන පළමු මාසික ගෙවීමෙන් වියදම ප්‍රතිපූරක කිරීමට එකඟ වේ.</li>
                <li><span className="font-bold mr-2">16.</span> රියදුරු පුහුණුවීම සඳහා රථය නොයෙදවීමෙ වගකීම දෙවන පාර්ශවය විසින් දරයි.</li>
            </ol>
        </div>
        <p className="text-xs text-center text-gray-400 pt-4">පිටුව 2 / 3</p>
      </div>

       {/* Page 3 */}
      <div data-page="3" className="p-8 min-h-[297mm] flex flex-col border-2 border-gray-200 rounded-lg mt-4">
        <PageHeader title="" />
        <div className="space-y-4 flex-grow font-sinhala">
             <ol className="list-none space-y-3 text-sm leading-loose" start={17}>
                <li><span className="font-bold mr-2">17.</span>මෝටර් රථය නිතී විරොධී කටයුතු සඳහා නොයෙදවීමේ වගකීම දෙවන පාර්ශවය විසින් දරයි.</li>
                <li><span className="font-bold mr-2">18.</span>දෙවන පාර්ශවය විසින් භාරකාරත්වය යටතේ එකී රථය පවතින කාල සීමාව තුල ඔවුන්ගේ නොසැලකිල්ල මත සිදුවූ යම් ක්‍රියාවන් හේතුවෙන් එම රථය යම්කිසි නිතීමය ආයතනයක් වෙත ඉදිරිපත් කලයුතු නම් එහි වගකීම දෙවන පාර්ශවය සතුවේ. පලමු පාර්ශවයට එමගින් සිදුවන මූල්‍යමය අලාභ ගෙවීමට දෙවන පාර්ශ්වය එකඟ වේ.</li>
                <li><span className="font-bold mr-2">19.</span>රථයේ වටිනාකම රු: <DottedInput name="vehicleValue" control={control} isPrinting={isPrinting} className="w-40" placeholder=".............."/> ලෙස දෙපාර්ශවය එකඟ වේ.</li>
                <li><span className="font-bold mr-2">20.</span> මෙම ගිවිසුම් කල්පිරීමට පෙර අවලංගු කිරීමට පළමු පාර්ශවයට අවශ්‍යනම් ලිඛිත ඉල්ලීමක් මාසයක කාලයට පෙර දෙවන පාර්ශවයට යොමු කලයුතු අතර එසේ පූර්ව දැනුම් දීමකින් තොරව එකී රථය ලබාගන්නෙ නම් ගෙවීමි නොකිරීමේ අයිතිය දෙවන පාර්ශවය සතුය.</li>
                <li><span className="font-bold mr-2">21.</span>දෙවන පාර්ශවයට ගිවිසුම අවලංගු කිරීමට අවශ්‍යනම් ලිඛිතව සති දෙකකට පෙර දැනුම් දිය යුතුය.</li>
                <li><span className="font-bold mr-2">22.</span>නිසිපරිදි ගෙවීම් නොකරන්නේ නම් හෝ රථය අවභාවිතයක් වන්නේ නම් කිසිදු පූර්න දැනුම් දීමකින් තොරව එකී රථය ලභාගැනිමේ අයිතිය පළමු පාර්ශවය සතුය.</li>
                <li><span className="font-bold mr-2">23.</span>රථය භාරගන්නා අවස්ථාවේදී එය මනාතත්වයෙන් පවතින බවට දෙවන පාර්ශවය සැහීමකට පත්වේ.</li>
            </ol>

            <div className='pt-6 space-y-3 text-sm'>
                <p className='font-sinhala flex items-center gap-2'><Star className="w-3 h-3 text-gray-600" /> බදුදීමනාකරු බදුගැනුම්කරු සහ ඔහුගේ සියළු උරුමක්කාරවරුන් ආදි අද්මිනිස්ත්‍රාසිකරුවන් මෙමගින් ගිවිසුමට බැඳේ.</p>
                <p className='font-sinhala flex items-center gap-2'><Star className="w-3 h-3 text-gray-600" /> රථය භාරගන්නා අවස්ථාවේ මනු කියවීම <DottedInput name="startMileage" control={control} isPrinting={isPrinting} className="w-32" placeholder=".........."/> බව දෙපාර්ශවයම විදගනි.</p>
                <p className='font-sinhala flex items-center gap-2'><Star className="w-3 h-3 text-gray-600" /> ඉහත කොන්දේසි කියවා බලා තෙරුම් ගැනීමෙන් අනතුරුව මෙම ගිවිසුමට අප විසින් අත්සන් තැබුවෙමි.</p>
            </div>
            
            <div className="flex-grow"></div>
            
            <div className="grid grid-cols-2 gap-x-12 mt-auto pt-16">
                 <SignatureField label="පළමු පාර්ශවය (බදුදීමනාකරු)" />
                 <SignatureField label="දෙවන පාර්ශවය (බදුගැණුම්කරු)" />
            </div>

        </div>
        <p className="text-xs text-center text-gray-400 pt-4">පිටුව 3 / 3</p>
      </div>
    </div>
  );
});

PrintableLeaseAgreementSi.displayName = 'PrintableLeaseAgreementSi';
export default PrintableLeaseAgreementSi;
