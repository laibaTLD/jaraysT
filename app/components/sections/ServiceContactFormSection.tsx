'use client';

import React, { useState } from 'react';
import { Page, BusinessHours } from '@/app/lib/types';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { cn } from '@/app/lib/utils';
import { ArrowRight } from 'lucide-react';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

interface ServiceContactFormSectionProps {
    service: any;
}

export const ServiceContactFormSection: React.FC<ServiceContactFormSectionProps> = ({ service }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const { site } = useWebBuilder();

  if (!service.contactForm?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const safeBusinessHours = Array.isArray(businessHours?.hours) ? businessHours.hours : [];
  const hasValidCoordinates =
    typeof site?.business?.coordinates?.latitude === 'number' &&
    typeof site?.business?.coordinates?.longitude === 'number';
  
  const formatTime = (time: string) => {
    if (!time) return '';
    if (businessHours?.displayFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      if (Number.isNaN(hour) || !minutes) return time;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatDayHours = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed';
    if (dayHours.is24Hours) return '24h';
    if (Array.isArray(dayHours.timeRanges) && dayHours.timeRanges.length > 0) {
      return dayHours.timeRanges
      .filter((range) => range?.openTime && range?.closeTime)
      .map(range => 
        `${formatTime(range.openTime)} - ${formatTime(range.closeTime)}`
      ).join(', ');
    }
    return 'Hours unavailable';
  };

  return (
    <section 
      className="py-24 md:py-32 lg:py-40 flex flex-col gap-32 lg:gap-48" 
      style={{ backgroundColor: themeColors.pageBackground, fontFamily: themeFonts.body }}
    >
      
      {/* PART 1: "ANY QUESTIONS?" CALL TO ACTION */}
      <div className="container mx-auto px-6 text-center flex flex-col items-center">
        <div className="max-w-4xl space-y-4 mb-20 text-center">
          <h2 
            className="text-3xl md:text-5xl lg:text-7xl font-extralight tracking-[0.15em] uppercase leading-[1.1]"
            style={{ fontFamily: themeFonts.heading, color: themeColors.mainText }}
          >
            Any questions?<br />
            Simply ask us.
          </h2>
          <h3 
            className="text-3xl md:text-5xl lg:text-7xl font-light tracking-[0.15em] uppercase italic"
            style={{ 
                fontFamily: themeFonts.heading, 
                color: themeColors.primaryButton 
            }}
          >
           {service.name}
          </h3>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="group relative flex items-center justify-between px-10 py-6 w-full max-w-[320px] transition-all duration-500 overflow-hidden text-left"
          style={{ backgroundColor: themeColors.primaryButton, color: themeColors.buttonText }}
        >
          <span className="text-[11px] font-bold tracking-[0.4em] uppercase z-10">Get a Quote</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform z-10" />
          <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>
      </div>

      {/* Slide-out Form Component */}
      <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {/* PART 2: "WHERE TO FIND US" MAP SECTION */}
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        
        {/* Left: Info */}
        <div className="space-y-16">
          <h2 
            className="text-3xl md:text-5xl font-extralight tracking-[0.2em] uppercase leading-tight"
            style={{ fontFamily: themeFonts.heading, color: themeColors.mainText }}
          >
            Where to<br />find us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Address */}
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] mb-4 block font-bold opacity-30">Head Office</span>
                <p className="text-sm md:text-base font-light tracking-wide max-w-sm opacity-80 leading-relaxed uppercase">
                  {address?.street || 'Avda. Valdemarín 86'}<br />
                  {address?.city || 'Aravaca'}, {address?.zipCode || '28023'}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address?.street || ''} ${address?.city || ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between px-8 py-4 w-full max-w-[220px] transition-all duration-500 overflow-hidden mt-8"
                style={{ backgroundColor: themeColors.primaryButton, color: themeColors.buttonText }}
              >
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase z-10">View Map</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform z-10" />
                <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </a>
            </div>

            {/* Business Hours */}
            {businessHours?.isEnabled && safeBusinessHours.length > 0 && (
              <div className="space-y-6">
                <span className="text-[10px] uppercase tracking-[0.2em] mb-4 block font-bold opacity-30">Business Hours</span>
                <div className="space-y-2">
                  {safeBusinessHours.filter(Boolean).map((day: any) => (
                    <div key={day.day} className="flex justify-between items-baseline gap-4 text-[11px] uppercase tracking-widest opacity-80 font-light">
                      <span className="font-semibold opacity-60">{DAY_LABELS[day.day] || day.day}</span>
                      <span className="text-right">{formatDayHours(day)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Architectural Map Overlay */}
        <div className="relative aspect-[16/10] md:aspect-video lg:aspect-[4/3] w-full overflow-hidden shadow-2xl lg:mt-12">
          {hasValidCoordinates ? (
              <div className="w-full h-full grayscale-[0.9] contrast-[1.1] brightness-[1.1] scale-100 hover:grayscale-0 transition-all duration-1000">
                <iframe
                  title="Office Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }}
                  src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
          ) : (
             <div className="w-full h-full bg-gray-100 flex items-center justify-center grayscale">
                <span className="text-[10px] uppercase tracking-[0.5em] opacity-30 italic">Satellite View Pending</span>
             </div>
          )}
          
          {/* Subtle architectural frame */}
          <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default ServiceContactFormSection;
