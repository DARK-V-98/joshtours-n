
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Download, FileSignature } from 'lucide-react';
import Link from 'next/link';
import PrintableLeaseAgreementSi from '@/components/printable-lease-agreement-si';

const leaseAgreementSchema = z.object({
  // Page 1 fields
  lessorName: z.string().optional(),
  lessorNic: z.string().optional(),
  lesseeName: z.string().optional(),
  lesseeAddress: z.string().optional(),
  lesseeNic: z.string().optional(),
  agreementYear: z.string().optional(),
  agreementMonth: z.string().optional(),
  agreementDay: z.string().optional(),
  agreementLocation: z.string().optional(),
  vehicleRegNo: z.string().optional(),
  vehicleName: z.string().optional(),
  rentalStartDate: z.string().optional(),
  rentalMonths: z.string().optional(),
  monthlyRent: z.string().optional(),
  mileageLimit: z.string().optional(),
  extraKmFee: z.string().optional(),
  paymentDays: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  accountNo: z.string().optional(),
  accountHolder: z.string().optional(),
  finalMonthStartDate: z.string().optional(),
  finalMonthEndDate: z.string().optional(),
  finalMonthRent: z.string().optional(),
  finalMonthExtraKmCost: z.string().optional(),
  finalPaymentDate: z.string().optional(),
  contactNumber: z.string().optional(),
  
  // Page 3 fields
  vehicleValue: z.string().optional(),
  startMileage: z.string().optional(),
});

export type LeaseAgreementFormValues = z.infer<typeof leaseAgreementSchema>;

const defaultValues: Partial<LeaseAgreementFormValues> = {
    lessorName: "JOSH TOURS",
    agreementYear: new Date().getFullYear().toString(),
};


export default function LeaseAgreementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const printableRef = useRef<HTMLDivElement>(null);

  const form = useForm<LeaseAgreementFormValues>({
    resolver: zodResolver(leaseAgreementSchema),
    defaultValues: defaultValues
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
    }
  }, [authLoading, user, router]);


  const handleDownloadPdf = async () => {
    const printableElement = printableRef.current;
    if (!printableElement) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find printable content.' });
      return;
    }
    
    setIsDownloading(true);
    
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pages = printableElement.querySelectorAll<HTMLElement>('[data-page]');
        
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const canvas = await html2canvas(page, { scale: 2.5, useCORS: true, allowTaint: true });
            const imgData = canvas.toDataURL('image/png');
            
            const imgProps = pdf.getImageProperties(imgData);
            const pageHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pageHeight);
        }

        pdf.save(`lease-agreement-sinhala-${Date.now()}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };
  
  if (authLoading) {
      return (
          <div className="container mx-auto px-4 py-12 max-w-4xl flex justify-center items-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-12">
       <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Button variant="outline" asChild>
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
            <div className="flex items-center gap-2 self-end sm:self-center">
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                    {isDownloading ? "බාගත වෙමින්..." : "PDF ලෙස බාගන්න"}
                </Button>
            </div>
        </div>
      <Form {...form}>
        <div className="bg-gray-200 p-8 rounded-lg">
          <div className="shadow-lg">
             <PrintableLeaseAgreementSi ref={printableRef} form={form} isPrinting={isDownloading} />
          </div>
        </div>
      </Form>
    </div>
  );
}
