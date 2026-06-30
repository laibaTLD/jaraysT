'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { getImageSrc, cn, TIPTAP_INHERIT } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts, useSectionContrast } from '@/app/hooks/useTheme';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ensureGsapScroll } from '@/app/lib/gsap-scroll';

interface CTA2SectionProps {
  cta2Section: Page['cta2Section'];
  className?: string;
}

export const CTA2Section: React.FC<CTA2SectionProps> = ({ cta2Section, className }) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const reducedMotion = usePrefersReducedMotion();
  const { site } = useWebBuilder();

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const brandColor = themeColors.primaryButton;

  const safeCta = cta2Section ?? { enabled: false };
  const backgroundImageUrl = useMemo(
    () => (safeCta.backgroundImage ? getImageSrc(safeCta.backgroundImage) : ''),
    [safeCta.backgroundImage]
  );
  const customBg = safeCta.backgroundColor?.trim();
  const hasBgImage = Boolean(backgroundImageUrl);
  const contrast = useSectionContrast(hasBgImage ? 'dark' : 'light');

  useEffect(() => {
    if (!safeCta.enabled || !sectionRef.current) return;
    ensureGsapScroll();

    if (reducedMotion) {
      sectionRef.current.querySelectorAll('[data-cta2-reveal]').forEach((el) => {
        gsap.set(el, { opacity: 1, y: 0 });
      });
      if (bgRef.current) gsap.set(bgRef.current, { scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current!.querySelectorAll('[data-cta2-reveal]'),
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      if (bgRef.current && hasBgImage) {
        gsap.fromTo(
          bgRef.current,
          { scale: 1.08 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [safeCta.enabled, reducedMotion, hasBgImage]);

  if (!safeCta.enabled) return null;

  const eyebrow = site?.business?.tagline?.trim() || 'Start Your Project';

  const panelBg = hasBgImage
    ? 'rgba(8, 8, 8, 0.52)'
    : `color-mix(in srgb, ${themeColors.sectionBackground} 92%, transparent)`;
  const panelBorder = hasBgImage ? 'rgba(255,255,255,0.18)' : `${themeColors.inactive}40`;

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative isolate overflow-hidden py-20 md:py-28 lg:py-32',
        !hasBgImage && 'wb-surface-light wb-hairline-t-light',
        className
      )}
      style={{
        backgroundColor: customBg || (hasBgImage ? '#0c0c0c' : themeColors.pageBackground),
        fontFamily: themeFonts.body,
      }}
    >
      {backgroundImageUrl ? (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div ref={bgRef} className="absolute inset-0 will-change-transform">
            <OptimizedImage
              src={backgroundImageUrl}
              alt=""
              fill
              quality={IMAGE_QUALITY_HIGH}
              sizes={IMAGE_SIZES.fullWidth}
              className="object-cover"
            />
          </div>
        </div>
      ) : (
        <div
          className="pointer-events-none absolute -right-[10%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full blur-[100px] opacity-15"
          style={{ backgroundColor: brandColor }}
          aria-hidden
        />
      )}

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div
          data-cta2-reveal
          className="relative max-w-3xl border p-8 md:p-12 lg:p-14"
          style={{
            backgroundColor: panelBg,
            borderColor: panelBorder,
            backdropFilter: hasBgImage ? 'blur(24px)' : 'blur(12px)',
          }}
        >
          <span
            className="pointer-events-none absolute -right-2 -top-3 select-none text-[clamp(4rem,12vw,7rem)] font-extralight leading-none opacity-[0.07]"
            style={{ color: hasBgImage ? '#fff' : themeColors.mainText, fontFamily: themeFonts.heading }}
            aria-hidden
          >
            →
          </span>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-10 shrink-0" style={{ backgroundColor: brandColor }} />
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-[0.38em]',
                hasBgImage ? 'text-white/70' : contrast.textSecondary
              )}
              style={{ fontFamily: themeFonts.body }}
            >
              {eyebrow}
            </span>
          </div>

          {safeCta.title && (
            <h2
              data-cta2-reveal
              className={cn(
                'text-balance text-[clamp(1.75rem,4.2vw,3.25rem)] font-light uppercase leading-[1.02] tracking-[-0.02em]',
                hasBgImage ? 'text-white' : contrast.textPrimary
              )}
              style={{ fontFamily: themeFonts.heading }}
            >
              <TiptapRenderer content={safeCta.title} as="inline" className={TIPTAP_INHERIT} />
            </h2>
          )}

          {safeCta.description && (
            <div
              data-cta2-reveal
              className={cn(
                'mt-6 max-w-xl text-sm font-light leading-relaxed md:text-base',
                hasBgImage ? 'text-white/85' : contrast.textSecondary
              )}
              style={{ fontFamily: themeFonts.body }}
            >
              <TiptapRenderer content={safeCta.description} className={TIPTAP_INHERIT} />
            </div>
          )}

          {safeCta.primaryButton && (
            <div data-cta2-reveal className="mt-10">
              <Link
                href={safeCta.primaryButton.href || '/'}
                className="group inline-flex items-center gap-4 rounded-full px-8 py-4 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: brandColor,
                  color: themeColors.buttonText,
                  fontFamily: themeFonts.body,
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.32em]">
                  {safeCta.primaryButton.label}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            </div>
          )}

          <div
            className="pointer-events-none absolute bottom-0 left-0 h-px w-16"
            style={{ backgroundColor: brandColor }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-16 w-px"
            style={{ backgroundColor: brandColor }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};

export default CTA2Section;
