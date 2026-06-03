
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Business WhatsApp number (international format, no + or spaces)
export const WHATSAPP_NUMBER = '94701209694';

const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.488"/>
  </svg>
);

interface WhatsAppButtonProps {
  message?: string;
  label?: string;
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  className?: string;
  variant?: 'solid' | 'outline';
  showIcon?: boolean;
}

export function WhatsAppButton({
  message = "Hi Josh Tours! I'd like to know more about renting a vehicle.",
  label = 'Chat on WhatsApp',
  size = 'lg',
  className,
  variant = 'solid',
  showIcon = true,
}: WhatsAppButtonProps) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      asChild
      size={size === 'xl' || size === 'icon' ? size : size}
      className={cn(
        variant === 'solid'
          ? 'bg-[#25D366] hover:bg-[#1ebe5d] text-white border-transparent'
          : 'bg-transparent border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white',
        className,
      )}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        {showIcon && <WhatsAppIcon className="w-5 h-5" />}
        {label}
      </a>
    </Button>
  );
}

/** Floating action button — fixed bottom-right, good for any page */
export function WhatsAppFloating({
  message = "Hi Josh Tours! I'd like to know more about renting a vehicle.",
}: { message?: string }) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 animate-pulse-gold"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  );
}

export { WhatsAppIcon };
