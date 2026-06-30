'use client';

import React, { useState } from 'react';
import type { Page, BusinessHours } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useThemeColors } from '@/app/hooks/useTheme';
import { ArrowRight } from 'lucide-react';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface ContactSectionProps {
  contactSection?: Page['contactSection'];
  className?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactSection,
  className,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { site } = useWebBuilder();
  const colors = useThemeColors();

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 });

  if (!contactSection?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const showForm = contactSection.showForm !== false;
  const showMap = contactSection.showMap !== false;
  const showContactInfo = contactSection.showContactInfo !== false;

  const formatTime = (time: string) => {
    if (!time) return '';
    if (businessHours?.displayFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatDayHours = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed';
    if (dayHours.is24Hours) return '24h';
    if (dayHours.timeRanges?.length) {
      return dayHours.timeRanges
        .map((range) => `${formatTime(range.openTime)} - ${formatTime(range.closeTime)}`)
        .join(', ');
    }
    return '';
  };

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const mapQuery = addressLine;
  const defaultTitle = 'Any questions?';

  return (
    <section
      id="contact"
      className={cn('relative overflow-hidden py-20 lg:py-32', className)}
      style={{
        backgroundColor: colors.pageBackground,
        color: colors.mainText,
        fontFamily: 'var(--wb-body-font, inherit)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-25 animate-float"
            style={{
              left: `${8 + i * 15}%`,
              top: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
              backgroundColor: colors.primaryButton,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-center text-center md:mb-20">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-8 shadow-lg transition-all duration-1000 ${
              titleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{
              background: `linear-gradient(135deg, ${colors.primaryButton}, ${colors.hoverActive})`,
            }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--wb-text-on-dark, #fff)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2
            ref={titleRef}
            className={cn(
              'mx-auto max-w-3xl text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 transition-all duration-1000',
              titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{
              fontFamily: 'var(--wb-heading-font, Georgia, serif)',
              background: `linear-gradient(135deg, ${colors.mainText} 0%, ${colors.primaryButton} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {contactSection.title ? (
              <TiptapRenderer content={contactSection.title} as="inline" />
            ) : (
              <>
                {defaultTitle}
                <br />
                <span style={{ color: colors.primaryButton }}>Simply ask us.</span>
              </>
            )}
          </h2>

          <div className="flex items-center justify-center mb-6">
            <div
              className="w-16 h-px"
              style={{ backgroundColor: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)' }}
            />
            <div
              className="w-4 h-4 rounded-full mx-6 animate-pulse"
              style={{ backgroundColor: colors.primaryButton }}
            />
            <div
              className="w-16 h-px"
              style={{ backgroundColor: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)' }}
            />
          </div>

          {contactSection.description && (
            <p
              ref={descRef}
              className={cn(
                'mx-auto max-w-2xl text-lg leading-relaxed wb-text-on-light-secondary transition-all duration-1000 delay-300',
                descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <TiptapRenderer content={contactSection.description} as="inline" />
            </p>
          )}

        </div>

        <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

        {(showContactInfo || showMap) && (
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2 lg:gap-16">
            {showContactInfo && (
              <div
                className="flex h-full min-h-[420px] flex-col gap-10 rounded-3xl border border-b-2 p-8 shadow-lg lg:min-h-[480px] lg:p-10"
                style={{
                  backgroundColor: colors.pageBackground,
                  borderColor: 'color-mix(in srgb, var(--wb-primary) 12%, #e5e7eb)',
                  borderBottomColor: 'color-mix(in srgb, var(--wb-primary) 28%, #d1d5db)',
                }}
              >
                <div>
                  <h3
                    className="mb-4 text-2xl font-semibold sm:text-3xl wb-text-on-light"
                    style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                  >
                    Where to find us
                  </h3>
                  <div
                    className="h-px w-16"
                    style={{
                      background: `linear-gradient(90deg, ${colors.primaryButton}, transparent)`,
                    }}
                  />
                </div>

                <div className="grid flex-1 grid-cols-1 content-start gap-10 sm:grid-cols-2">
                  {(address?.street || address?.city) && (
                    <div className="space-y-4">
                      <span
                        className="block text-xs font-medium uppercase tracking-wide"
                        style={{ color: colors.primaryButton }}
                      >
                        Head Office
                      </span>
                      <p className="text-sm leading-relaxed wb-text-on-light-secondary">
                        {address?.street && (
                          <>
                            {address.street}
                            <br />
                          </>
                        )}
                        {[address?.city, address?.state, address?.zipCode].filter(Boolean).join(', ')}
                      </p>
                      {mapQuery && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium uppercase tracking-wide transition-all duration-300"
                          style={{
                            borderColor: colors.primaryButton,
                            color: colors.primaryButton,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primaryButton;
                            e.currentTarget.style.color = 'var(--wb-text-on-dark, #fff)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = colors.primaryButton;
                          }}
                        >
                          View Map
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {business?.phone && (
                    <div className="space-y-2">
                      <span
                        className="block text-xs font-medium uppercase tracking-wide"
                        style={{ color: colors.primaryButton }}
                      >
                        Phone
                      </span>
                      <a
                        href={`tel:${business.phone.replace(/\s/g, '')}`}
                        className="text-sm wb-text-on-light-secondary transition-colors hover:opacity-80"
                        style={{ color: 'inherit' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.primaryButton;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '';
                        }}
                      >
                        {business.phone}
                      </a>
                    </div>
                  )}

                  {business?.email && (
                    <div className="space-y-2">
                      <span
                        className="block text-xs font-medium uppercase tracking-wide"
                        style={{ color: colors.primaryButton }}
                      >
                        Email
                      </span>
                      <a
                        href={`mailto:${business.email}`}
                        className="text-sm wb-text-on-light-secondary transition-colors"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.primaryButton;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '';
                        }}
                      >
                        {business.email}
                      </a>
                    </div>
                  )}

                  {businessHours?.isEnabled && (
                    <div className="space-y-4 sm:col-span-2">
                      <span
                        className="block text-xs font-medium uppercase tracking-wide"
                        style={{ color: colors.primaryButton }}
                      >
                        Business Hours
                      </span>
                      <div
                        className="space-y-2 rounded-2xl border p-4"
                        style={{
                          borderColor: 'color-mix(in srgb, var(--wb-primary) 12%, #e5e7eb)',
                          backgroundColor: colors.pageBackground,
                        }}
                      >
                        {businessHours.hours.map((day) => (
                          <div
                            key={day.day}
                            className="flex justify-between gap-4 text-sm wb-text-on-light-secondary"
                          >
                            <span className="font-medium wb-text-on-light">{DAY_LABELS[day.day]}</span>
                            <span>{formatDayHours(day)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showMap && (
              <div className="flex h-full min-h-[420px] flex-col gap-6 lg:min-h-[480px]">
                <div
                  className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border shadow-lg"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--wb-primary) 10%, transparent)',
                  }}
                >
                  {site?.business?.coordinates?.latitude != null &&
                  site?.business?.coordinates?.longitude != null ? (
                    <iframe
                      title="Office Location"
                      width="100%"
                      height="100%"
                      className="absolute inset-0 h-full w-full border-0 grayscale contrast-[1.05] opacity-90 transition-all duration-700 hover:grayscale-0"
                      src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="flex h-full min-h-[280px] items-center justify-center text-sm wb-text-on-light-secondary"
                      style={{ backgroundColor: colors.pageBackground }}
                    >
                      Map coordinates not configured
                    </div>
                  )}
                </div>

                {showForm && (
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="group flex w-full shrink-0 items-center justify-between rounded-full px-8 py-4 text-sm font-medium uppercase tracking-wide transition-all duration-500 hover:shadow-2xl"
                    style={{
                      backgroundColor: colors.primaryButton,
                  color: colors.buttonText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hoverActive;
                  e.currentTarget.style.color = colors.buttonText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primaryButton;
                  e.currentTarget.style.color = colors.buttonText;
                }}
              >
                <span>Open Form</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" style={{ color: colors.buttonText }} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default ContactSection;
