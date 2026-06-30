'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Manrope, Cormorant } from 'next/font/google';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useThemeColors } from '@/app/hooks/useTheme';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

const cormorant = Cormorant({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

const CTA_IMAGE_FALLBACK =
  'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg';

type CtaSectionData = Page['ctaSection'] & {
  subtitle?: unknown;
  label?: unknown;
  image?: { url?: string };
};

interface CTASectionProps {
  ctaSection?: CtaSectionData;
  page?: Page | null;
  className?: string;
}

function resolveCtaBackgroundImage(ctaSection?: CtaSectionData): string {
  const fromBg = ctaSection?.backgroundImage?.trim();
  if (fromBg) return getImageSrc(fromBg);

  const fromImage = ctaSection?.image?.url?.trim();
  if (fromImage) return getImageSrc(fromImage);

  return CTA_IMAGE_FALLBACK;
}

function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

export function CTASection({ ctaSection, page, className }: CTASectionProps) {
  const { site, pages } = useWebBuilder();
  const colors = useThemeColors();

  const subHeading = useMemo(() => {
    const fromSection =
      tiptapToText(ctaSection?.subtitle) || tiptapToText(ctaSection?.label);
    if (fromSection) return fromSection;
    return site?.business?.tagline?.trim() || '';
  }, [ctaSection?.subtitle, ctaSection?.label, site?.business?.tagline]);

  const heading = useMemo(() => tiptapToText(ctaSection?.title), [ctaSection?.title]);
  const description = useMemo(
    () => tiptapToText(ctaSection?.description),
    [ctaSection?.description]
  );

  const ctaButton = useMemo(() => {
    if (ctaSection?.primaryButton?.label?.trim() && ctaSection?.primaryButton?.href?.trim()) {
      return {
        label: ctaSection.primaryButton.label.trim(),
        href: ctaSection.primaryButton.href.trim(),
      };
    }
    return resolvePrimaryCta(page ?? null, site, pages);
  }, [ctaSection?.primaryButton, page, site, pages]);

  const ctaImage = useMemo(() => resolveCtaBackgroundImage(ctaSection), [ctaSection]);

  const primary = colors.primaryButton;
  const secondary = colors.sectionBackgroundDark;
  const accent = colors.hoverActive;
  const surface = colors.pageBackground;

  const { ref: contentRef, isVisible: contentVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const { ref: buttonRef, isVisible: buttonVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const sectionRef = useRef<HTMLElement>(null);
  const [parallax, setParallax] = useState({ bg: 0, content: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const updateParallax = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollProgress =
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const clamped = Math.min(Math.max(scrollProgress, 0), 1);
      const offset = (clamped - 0.5) * 120;

      setParallax({
        bg: offset * 0.45,
        content: offset * -0.12,
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        updateParallax();
        frame = 0;
      });
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateParallax);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateParallax);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!ctaSection || ctaSection.enabled === false) return null;
  if (!heading && !description && !subHeading && !ctaButton) return null;

  const ctaIsExternal =
    ctaButton?.href.startsWith('http') ||
    ctaButton?.href.startsWith('mailto:') ||
    ctaButton?.href.startsWith('tel:');

  const themeVars = {
    '--cta-primary': primary,
    '--cta-secondary': secondary,
    '--cta-accent': accent,
    '--cta-surface': surface,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative flex min-h-[420px] items-center overflow-hidden py-12 lg:py-16',
        className
      )}
      style={themeVars}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translate3d(0, ${parallax.bg}px, 0) scale(1.08)` }}
        >
          <div className="relative h-full min-h-[420px] w-full">
            <NextImage
              src={ctaImage}
              alt="CTA background"
              fill
              priority
              className="object-cover"
              quality={75}
              sizes="100vw"
            />
          </div>
        </div>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: withAlpha(secondary, 0.55) }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${withAlpha(secondary, 0.7)} 0%, ${withAlpha(secondary, 0.3)} 50%, ${withAlpha(secondary, 0.4)} 100%)`,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '73.25%', top: '29.10%', backgroundColor: primary, animationDelay: '0s', animationDuration: '6s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '82.38%', top: '14.00%', backgroundColor: primary, animationDelay: '0.5s', animationDuration: '6.4s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '73.25%', top: '49.34%', backgroundColor: primary, animationDelay: '1s', animationDuration: '6.8s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '66.96%', top: '29.37%', backgroundColor: primary, animationDelay: '1.5s', animationDuration: '7.2s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '7.86%', top: '23.60%', backgroundColor: primary, animationDelay: '2s', animationDuration: '7.6s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '96.88%', top: '45.12%', backgroundColor: primary, animationDelay: '2.5s', animationDuration: '8s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '42.53%', top: '87.65%', backgroundColor: primary, animationDelay: '3s', animationDuration: '8.4s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '15.27%', top: '63.91%', backgroundColor: primary, animationDelay: '3.5s', animationDuration: '8.8s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '24.18%', top: '32.74%', backgroundColor: primary, animationDelay: '4s', animationDuration: '9.2s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '58.63%', top: '76.29%', backgroundColor: primary, animationDelay: '4.5s', animationDuration: '9.6s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '35.42%', top: '18.53%', backgroundColor: primary, animationDelay: '5s', animationDuration: '10s' }}
        />
        <div
          className="absolute h-1 w-1 animate-float rounded-full opacity-40"
          style={{ left: '89.71%', top: '82.16%', backgroundColor: primary, animationDelay: '5.5s', animationDuration: '10.4s' }}
        />
      </div>

      <div className="absolute left-10 top-10 h-32 w-32 animate-sway opacity-50">
        <svg viewBox="0 0 100 100" className="h-full w-full" style={{ color: primary }}>
          <path
            d="M50,90 Q20,60 30,30 Q40,20 50,40 Q60,20 70,30 Q80,60 50,90"
            fill="currentColor"
            className="animate-pulse"
          />
        </svg>
      </div>

      <div
        className="absolute bottom-20 right-10 h-40 w-40 animate-sway opacity-15"
        style={{ animationDelay: '3s' }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full" style={{ color: primary }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="animate-breathe" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="animate-breathe" style={{ animationDelay: '0.5s' }} />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" className="animate-breathe" style={{ animationDelay: '1s' }} />
          <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.5" className="animate-pulse" />
        </svg>
      </div>

      <div
        className="container relative z-10 mx-auto px-4 will-change-transform"
        style={{ transform: `translate3d(0, ${parallax.content}px, 0)` }}
      >
        <div className="mx-auto max-w-4xl text-center" ref={contentRef}>
          {subHeading && (
            <p
              className={cn(
                manrope.className,
                'mb-6 text-sm font-semibold uppercase tracking-wider text-white/90 transition-all duration-1000',
                contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
            >
              {subHeading}
            </p>
          )}

          {heading && (
            <h2
              className={cn(
                cormorant.className,
                'mb-8 inline-block w-fit bg-clip-text text-4xl font-semibold leading-tight text-transparent transition-all duration-1000 delay-200 md:text-5xl lg:text-6xl xl:text-7xl',
                contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 0%, ${primary} 100%)`,
              }}
            >
              {heading}
            </h2>
          )}

          {description && (
            <p
              className={cn(
                manrope.className,
                'mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-white/90 transition-all duration-1000 delay-400 md:text-xl',
                contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
            >
              {description}
            </p>
          )}

          {ctaButton && (
            <div
              ref={buttonRef}
              className={cn(
                'transition-all duration-1000 delay-600',
                buttonVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
            >
              {ctaIsExternal ? (
                <a
                  href={ctaButton.href}
                  className={cn(
                    manrope.className,
                    'group relative inline-flex transform items-center overflow-hidden rounded-full px-10 py-5 text-sm font-medium uppercase tracking-wide transition-all duration-500 hover:-translate-y-2 hover:scale-105'
                  )}
                  style={{ backgroundColor: secondary, color: colors.buttonText }}
                >
                  <span className="relative z-10 flex items-center">
                    {ctaButton.label}
                    <svg
                      className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                  <div
                    className="absolute inset-0 translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-0"
                    style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }}
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:animate-ping group-hover:opacity-20" />
                </a>
              ) : (
                <Link
                  href={ctaButton.href}
                  className={cn(
                    manrope.className,
                    'group relative inline-flex transform items-center overflow-hidden rounded-full px-10 py-5 text-sm font-medium uppercase tracking-wide transition-all duration-500 hover:-translate-y-2 hover:scale-105'
                  )}
                  style={{ backgroundColor: secondary, color: colors.buttonText }}
                >
                  <span className="relative z-10 flex items-center">
                    {ctaButton.label}
                    <svg
                      className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                  <div
                    className="absolute inset-0 translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-0"
                    style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }}
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:animate-ping group-hover:opacity-20" />
                </Link>
              )}
            </div>
          )}

          <div className="mt-12 flex justify-center gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-500',
                  buttonVisible ? 'opacity-60' : 'opacity-0'
                )}
                style={{
                  backgroundColor: primary,
                  animationDelay: `${1000 + i * 200}ms`,
                  animation: buttonVisible ? `pulse 2s ease-in-out ${i * 0.3}s infinite` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="h-20 w-full" style={{ color: surface }}>
          <path
            fill="currentColor"
            d="M0,64 C240,96 480,32 720,48 C960,64 1200,96 1440,64 L1440,120 L0,120 Z"
            className="animate-wave"
          />
        </svg>
      </div>
    </section>
  );
}
