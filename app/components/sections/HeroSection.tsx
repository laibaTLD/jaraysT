'use client';

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { Manrope, Cormorant } from 'next/font/google';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useThemeColors } from '@/app/hooks/useTheme';
import { cn } from '@/app/lib/utils';
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

interface HeroSectionProps {
  hero?: Page['hero'];
  page?: Page | null;
  className?: string;
}

function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

export function HeroSection({ hero, page, className }: HeroSectionProps) {
  const { site, pages } = useWebBuilder();
  const colors = useThemeColors();

  const title = useMemo(() => tiptapToText(hero?.title), [hero?.title]);
  const subtitle = useMemo(() => tiptapToText(hero?.subtitle), [hero?.subtitle]);
  const description = useMemo(() => tiptapToText(hero?.description), [hero?.description]);
  const ctaButton = useMemo(() => {
    if (hero?.primaryCta?.label?.trim() && hero?.primaryCta?.href?.trim()) {
      return {
        label: hero.primaryCta.label.trim(),
        href: hero.primaryCta.href.trim(),
      };
    }
    return resolvePrimaryCta(page ?? null, site, pages) ?? { href: '#', label: 'Learn More' };
  }, [hero?.primaryCta, page, site, pages]);

  const primary = colors.primaryButton;
  const secondary = colors.mainText;
  const accent = colors.hoverActive;
  const primaryMuted = withAlpha(primary, 0.4);
  const primaryBorder = withAlpha(primary, 0.2);
  const secondarySoft = colors.secondaryText;
  const secondaryMuted = withAlpha(colors.mainText, 0.65);
  const surface = colors.pageBackground;

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.3 });
  const { ref: subtitleRef, isVisible: subtitleVisible } = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.3 });
  const { ref: descriptionRef, isVisible: descriptionVisible } = useScrollAnimation<HTMLParagraphElement>({ threshold: 0.3 });
  const { ref: imageGridRef, isVisible: imageGridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  if (!hero || hero.enabled === false) return null;
  if (!title && !subtitle && !description) return null;

  const themeVars = {
    '--hero-primary': primary,
    '--hero-secondary': secondary,
    '--hero-accent': accent,
  } as CSSProperties;

  return (
    <section
      id="home"
      className={cn('relative pt-6 pb-8 lg:pt-8 lg:pb-12 overflow-hidden', className)}
      style={{ ...themeVars, backgroundColor: colors.pageBackground }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-20 animate-float bg-[var(--hero-primary)]"
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start justify-center">
        <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <h1
              ref={titleRef}
              className={`${cormorant.className} inline-block w-fit max-w-full text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold leading-[1.1] bg-clip-text text-transparent transition-all duration-1000 hover:scale-105 cursor-default ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                backgroundImage: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`,
              }}
            >
              {title}
            </h1>

            {subtitle && (
              <h2
                ref={subtitleRef}
                className={`${manrope.className} text-lg md:text-xl font-normal leading-relaxed transition-all duration-1000 delay-300 ${subtitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ color: secondarySoft }}
              >
                {subtitle}
              </h2>
            )}

            {description && (
              <p
                ref={descriptionRef}
                className={`${manrope.className} text-base leading-relaxed max-w-md transition-all duration-1000 delay-500 ${descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ color: secondaryMuted }}
              >
                {description}
              </p>
            )}

            {ctaButton && (
              <a
                href={ctaButton.href}
                className={`${manrope.className} inline-block px-8 py-4 font-medium text-sm tracking-wide uppercase transition-all duration-500 hover:brightness-110 hover:-translate-y-2 hover:scale-105 ${descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ backgroundColor: primary, color: colors.buttonText, transitionDelay: '700ms' }}
              >
                {ctaButton.label} →
              </a>
            )}
          </div>

          <div className="relative" ref={imageGridRef}>
            <div className={`absolute -top-10 -right-10 w-32 h-32 opacity-30 transition-all duration-1000 ${imageGridVisible ? 'animate-sway rotate-12' : 'opacity-0 scale-50'}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--hero-primary)]">
                <path d="M20,80 Q30,20 50,40 Q70,20 80,80" fill="none" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="25" cy="35" rx="8" ry="15" fill="currentColor" transform="rotate(-45 25 35)" className="animate-pulse" />
                <ellipse cx="35" cy="45" rx="6" ry="12" fill="currentColor" transform="rotate(-30 35 45)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                <ellipse cx="50" cy="30" rx="7" ry="14" fill="currentColor" transform="rotate(0 50 30)" className="animate-pulse" style={{ animationDelay: '1s' }} />
                <ellipse cx="65" cy="45" rx="6" ry="12" fill="currentColor" transform="rotate(30 65 45)" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                <ellipse cx="75" cy="35" rx="8" ry="15" fill="currentColor" transform="rotate(45 75 35)" className="animate-pulse" style={{ animationDelay: '2s' }} />
              </svg>
            </div>

            <div className={`absolute -bottom-5 -left-5 w-24 h-24 opacity-40 transition-all duration-1000 ${imageGridVisible ? 'animate-breathe' : 'opacity-0 scale-50'}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--hero-primary)]">
                <path d="M50,90 Q20,60 30,30 Q40,20 50,40 Q60,20 70,30 Q80,60 50,90" fill="currentColor" className="animate-pulse" />
                <ellipse cx="40" cy="40" rx="5" ry="10" fill="currentColor" transform="rotate(-20 40 40)" />
                <ellipse cx="60" cy="40" rx="5" ry="10" fill="currentColor" transform="rotate(20 60 40)" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div
                className={`row-span-2 rounded-2xl overflow-hidden border hover:scale-[1.03] transition-all duration-500 group cursor-pointer ${imageGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '200ms', backgroundColor: colors.pageBackground, borderColor: primaryBorder }}
              >
                <div className="w-full h-full flex flex-col items-center justify-between p-6 relative overflow-hidden" style={{ backgroundColor: colors.pageBackground }}>
                  <div className="relative flex-1 flex items-center justify-center w-full">
                    <svg viewBox="0 0 120 140" className="w-28 h-32 transition-transform duration-700 group-hover:scale-105" aria-hidden>
                      <rect
                        x="28"
                        y="28"
                        width="64"
                        height="24"
                        rx="3"
                        fill={primary}
                        className="origin-top transition-transform duration-700 ease-out group-hover:scale-y-[2.2]"
                        style={{ transformBox: 'fill-box', transformOrigin: 'top' }}
                      />
                      <g className="transition-transform duration-700 ease-out group-hover:translate-y-2 group-hover:rotate-1">
                        <rect x="22" y="18" width="76" height="14" rx="4" fill={secondary} />
                        <path
                          d="M 88 25 L 95 25 L 95 42 L 68 42 L 68 58"
                          fill="none"
                          stroke={secondary}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <rect x="62" y="54" width="10" height="38" rx="3" fill={secondary} />
                      </g>
                      <g className="transition-transform duration-500 group-hover:scale-110" style={{ transformOrigin: '39px 112px' }}>
                        <rect x="24" y="98" width="30" height="28" rx="3" fill={primary} />
                        <rect x="32" y="92" width="14" height="7" rx="1.5" fill={secondary} />
                        <rect x="37" y="86" width="4" height="8" rx="1" fill={secondary} />
                      </g>
                    </svg>
                  </div>
                  <div className="text-lg font-bold w-full" style={{ color: secondary }}>wallpaint</div>
                </div>
              </div>

              <div
                className={`rounded-2xl overflow-hidden border hover:scale-[1.03] hover:rotate-1 transition-all duration-500 group cursor-pointer ${imageGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '400ms', backgroundColor: colors.pageBackground, borderColor: primaryBorder }}
              >
                <div className="w-full h-full flex flex-col items-start justify-between p-6 relative">
                  <div className="w-full flex-1 flex items-center justify-center relative">
                    <div
                      className="w-24 h-24 rounded flex items-center justify-center relative overflow-hidden transition-colors duration-500 border"
                      style={{ borderColor: primaryBorder, backgroundColor: colors.pageBackground }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(0,0,0,0.04)_50%,transparent_51%)] bg-[length:16px_16px]" />
                      <svg className="absolute w-14 h-14" style={{ color: secondaryMuted }} viewBox="0 0 60 60" fill="none">
                        <path d="M 10,30 L 25,28 L 30,35 L 40,32 L 50,38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="group-hover:opacity-0 transition-opacity duration-500" />
                      </svg>
                      <div
                        className="w-14 h-10 rounded-sm scale-0 group-hover:scale-100 transition-transform duration-500 origin-center border"
                        style={{ backgroundColor: surface, borderColor: primaryBorder }}
                      />
                      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryMuted }} />
                      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryMuted }} />
                    </div>
                    <div className="absolute bottom-6 right-4 w-16 h-20 origin-bottom-right transition-all duration-700 group-hover:-translate-x-8 group-hover:-translate-y-4 group-hover:-rotate-[25deg]">
                      <div className="w-14 h-9 bg-gradient-to-b from-gray-200 to-gray-400 rounded-t-sm border-b-2 border-gray-500" />
                      <div className="w-5 h-10 mx-auto rounded-b-md" style={{ backgroundColor: secondary }} />
                    </div>
                    <div
                      className="absolute bottom-8 left-6 w-6 h-4 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-500 group-hover:scale-125 border"
                      style={{ backgroundColor: surface, borderColor: primaryBorder }}
                    />
                  </div>
                  <div className="text-lg font-bold transition-colors duration-300" style={{ color: secondary }}>Drywall Repairs</div>
                </div>
              </div>

              <div
                className={`rounded-2xl overflow-hidden border hover:scale-[1.03] hover:-rotate-1 transition-all duration-500 group cursor-pointer ${imageGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '600ms', backgroundColor: colors.pageBackground, borderColor: primaryBorder }}
              >
                <div className="w-full h-full flex flex-col items-start justify-between p-6 relative">
                  <div className="w-full flex-1 flex items-center justify-center relative">
                    <div className="relative w-32 h-24 flex items-end justify-center">
                      <div className="w-24 h-7 rounded relative overflow-hidden" style={{ backgroundColor: withAlpha(accent, 0.35) }}>
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_90%,rgba(0,0,0,0.06)_90%)] bg-[length:8px_8px]" />
                        <div className="absolute inset-y-1 left-0 right-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.04)_50%,transparent_60%)]" />
                        <div className="absolute right-8 top-0 w-[2px] h-2 group-hover:h-full transition-all duration-700 ease-in-out" style={{ backgroundColor: withAlpha(secondary, 0.6) }} />
                        <div className="absolute -top-2 right-6 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500" style={{ backgroundColor: withAlpha(accent, 0.55) }} />
                        <div className="absolute -top-1 right-10 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-3 transition-all duration-700 delay-100" style={{ backgroundColor: withAlpha(accent, 0.55) }} />
                        <div className="absolute top-0 right-4 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 delay-200" style={{ backgroundColor: withAlpha(accent, 0.55) }} />
                      </div>
                      <svg className="absolute -top-2 right-0 w-20 h-20 transition-all duration-700 group-hover:-translate-x-3 group-hover:translate-y-1 group-hover:rotate-[-8deg]" viewBox="0 0 100 100" fill="none">
                        <path d="M 20,40 L 75,25 L 75,45 L 20,45 Z" fill="url(#sawMetal)" stroke="#8A8A8A" strokeWidth="1" />
                        <path d="M 20,45 L 25,43 L 30,45 L 35,43 L 40,45 L 45,43 L 50,45 L 55,43 L 60,45 L 65,43 L 70,45 L 75,43" stroke="#6A6A6A" strokeWidth="1.5" />
                        <path d="M 15,35 C 10,35 5,40 5,47 C 5,55 10,58 20,58 L 22,42 Z" fill={primary} />
                        <circle cx="12" cy="47" r="4" fill="white" />
                        <defs>
                          <linearGradient id="sawMetal" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#E0E0E0" />
                            <stop offset="100%" stopColor="#B0B0B0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute bottom-0 left-2 transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-12">
                        <div className="w-7 h-4 rounded-sm" style={{ backgroundColor: secondary }} />
                        <div className="w-1.5 h-8 mx-auto" style={{ backgroundColor: accent }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold transition-colors duration-300" style={{ color: secondary }}>Carpentry</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/3 -right-6 w-4 h-4 rounded-full opacity-30 animate-float bg-[var(--hero-primary)]" style={{ animationDelay: '0s', animationDuration: '3s' }} />
            <div className="absolute bottom-1/3 -left-3 w-3 h-3 rounded-full opacity-40 animate-float bg-[var(--hero-primary)]" style={{ animationDelay: '1s', animationDuration: '4s' }} />
            <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full opacity-50 animate-float bg-[var(--hero-primary)]" style={{ animationDelay: '2s', animationDuration: '5s' }} />
            <div className="absolute bottom-1/4 right-1/3 w-1 h-1 rounded-full opacity-60 animate-pulse bg-[var(--hero-primary)]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        .animate-sway { animation: sway 6s ease-in-out infinite; }
      `}</style>
    </section>
  );
}

export default HeroSection;
