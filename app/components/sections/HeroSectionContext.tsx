'use client';

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

interface HeroSectionContextProps {
  hero?: Page['hero'];
  page?: Page | null;
  className?: string;
}

export function HeroSectionContext({ hero, page, className }: HeroSectionContextProps) {
  const { site, pages } = useWebBuilder();
  const colors = useThemeColors();
  const primary = colors.primaryButton;
  const secondary = colors.mainText;
  const accent = colors.hoverActive;

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
    return resolvePrimaryCta(page ?? null, site, pages) ?? { label: 'Learn More', href: '#' };
  }, [hero?.primaryCta, page, site, pages]);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.3 });
  const { ref: subtitleRef, isVisible: subtitleVisible } = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.3 });
  const { ref: descriptionRef, isVisible: descriptionVisible } = useScrollAnimation<HTMLParagraphElement>({ threshold: 0.3 });
  const { ref: imageGridRef, isVisible: imageGridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  if (!hero || hero.enabled === false) return null;
  if (!title && !subtitle && !description) return null;

  return (
    <section className={cn('relative pt-24 pb-16 lg:pt-36 lg:pb-28 overflow-hidden', className)} style={{ backgroundColor: colors.pageBackground }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[var(--wb-primary)] rounded-full opacity-20 animate-float"
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <h1
              ref={titleRef}
              className={`${cormorant.className} inline-block w-fit max-w-full text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] bg-clip-text text-transparent transition-all duration-1000 hover:scale-105 cursor-default ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                backgroundImage: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`,
              }}
            >
              {title || 'Calm Your Soul.'}
            </h1>

            {subtitle && (
              <h2
                ref={subtitleRef}
                className={`${manrope.className} text-lg md:text-xl font-normal leading-relaxed transition-all duration-1000 delay-300 ${subtitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ color: 'var(--wb-text-secondary)' }}
              >
                {subtitle}
              </h2>
            )}

            {description && (
              <p
                ref={descriptionRef}
                className={`${manrope.className} text-base leading-relaxed max-w-md transition-all duration-1000 delay-500 ${descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ color: 'color-mix(in srgb, var(--wb-text-main) 65%, transparent)' }}
              >
                {description}
              </p>
            )}

            {ctaButton && (
              <a
                href={ctaButton.href}
                className={`${manrope.className} inline-block px-8 py-4 font-medium text-sm tracking-wide uppercase transition-all duration-500 hover:-translate-y-2 hover:scale-105 group relative overflow-hidden ${descriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ backgroundColor: primary, color: colors.buttonText, transitionDelay: '700ms' }}
              >
                <span className="relative z-10 group-hover:animate-pulse">{ctaButton.label} →</span>
                <div
                  className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"
                  style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }}
                />
              </a>
            )}
          </div>

          <div className="relative" ref={imageGridRef}>
            <div className={`absolute -top-10 -right-10 w-32 h-32 opacity-30 transition-all duration-1000 ${imageGridVisible ? 'animate-sway rotate-12' : 'opacity-0 scale-50'}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--wb-primary)]">
                <path d="M20,80 Q30,20 50,40 Q70,20 80,80" fill="none" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="25" cy="35" rx="8" ry="15" fill="currentColor" transform="rotate(-45 25 35)" className="animate-pulse" />
                <ellipse cx="35" cy="45" rx="6" ry="12" fill="currentColor" transform="rotate(-30 35 45)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                <ellipse cx="50" cy="30" rx="7" ry="14" fill="currentColor" transform="rotate(0 50 30)" className="animate-pulse" style={{ animationDelay: '1s' }} />
                <ellipse cx="65" cy="45" rx="6" ry="12" fill="currentColor" transform="rotate(30 65 45)" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                <ellipse cx="75" cy="35" rx="8" ry="15" fill="currentColor" transform="rotate(45 75 35)" className="animate-pulse" style={{ animationDelay: '2s' }} />
              </svg>
            </div>

            <div className={`absolute -bottom-5 -left-5 w-24 h-24 opacity-40 transition-all duration-1000 ${imageGridVisible ? 'animate-breathe' : 'opacity-0 scale-50'}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--wb-primary)]">
                <path d="M50,90 Q20,60 30,30 Q40,20 50,40 Q60,20 70,30 Q80,60 50,90" fill="currentColor" className="animate-pulse" />
                <ellipse cx="40" cy="40" rx="5" ry="10" fill="currentColor" transform="rotate(-20 40 40)" />
                <ellipse cx="60" cy="40" rx="5" ry="10" fill="currentColor" transform="rotate(20 60 40)" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div
                className={`row-span-2 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-500 group border border-[color-mix(in_srgb,var(--wb-primary)_20%,transparent)] ${imageGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '200ms', backgroundColor: colors.pageBackground }}
              >
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: colors.pageBackground }}>
                  <div className="w-32 h-40 bg-gradient-to-b from-[#f4d1c9] to-[#e8b5a8] rounded-full relative group-hover:animate-pulse">
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-[#d49a8a] rounded-full animate-breathe" />
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-gradient-to-b from-[#8B9A7A] to-[#7A8A6A] rounded-t-full" />
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-20 h-20 border-2 border-[var(--wb-primary)] rounded-full opacity-30 animate-ping" />
                  </div>
                  <div className="absolute top-4 right-4 text-xs text-[var(--wb-primary)] opacity-60 animate-bounce" style={{ animationDelay: '1s' }}>Meditate</div>
                  <div className="absolute top-12 left-8 w-2 h-2 bg-[var(--wb-primary)] rounded-full opacity-50 animate-float" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute bottom-20 right-8 w-1 h-1 bg-[var(--wb-primary)] rounded-full opacity-40 animate-float" style={{ animationDelay: '1.5s' }} />
                </div>
              </div>

              <div
                className={`rounded-2xl overflow-hidden hover:scale-105 hover:rotate-1 transition-all duration-500 group border border-[color-mix(in_srgb,var(--wb-primary)_20%,transparent)] ${imageGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '400ms', backgroundColor: colors.pageBackground }}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="w-24 h-32 relative group-hover:animate-bounce">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-[#d49a8a] rounded-full animate-pulse" />
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-[var(--wb-text-main)] to-[#1a1a1a] rounded-t-lg" />
                    <div className="absolute top-16 left-3 w-6 h-12 bg-[#d49a8a] rounded-full transform rotate-45 group-hover:rotate-90 transition-transform duration-1000" />
                    <div className="absolute top-16 right-3 w-6 h-12 bg-[#d49a8a] rounded-full transform -rotate-45 group-hover:-rotate-90 transition-transform duration-1000" />
                    <div className="absolute inset-0 border border-[var(--wb-primary)] rounded-full opacity-20 animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <div className="absolute bottom-4 left-4 text-xs text-[var(--wb-primary)] opacity-60 animate-pulse">Yoga</div>
                </div>
              </div>

              <div
                className={`rounded-2xl overflow-hidden hover:scale-105 hover:-rotate-1 transition-all duration-500 group border border-[color-mix(in_srgb,var(--wb-primary)_20%,transparent)] ${imageGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '600ms', backgroundColor: colors.pageBackground }}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="w-20 h-24 relative">
                    <div
                      className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-4 border-[var(--wb-primary)] opacity-60 group-hover:animate-spin"
                      style={{ animationDuration: '3s', backgroundColor: colors.pageBackground }}
                    />
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[var(--wb-primary)] rounded-full animate-pulse" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-[var(--wb-primary)] rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute bottom-4 right-2 w-2 h-2 bg-[var(--wb-primary)] rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.7s' }} />
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[var(--wb-primary)] rounded-full opacity-80 animate-bounce" style={{ animationDelay: '1.1s' }} />
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 border-2 border-[var(--wb-primary)] rounded-full opacity-20 animate-ping" />
                  </div>
                  <div className="absolute bottom-4 right-4 text-xs text-[var(--wb-primary)] opacity-60 animate-pulse">Relax</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/3 -right-6 w-4 h-4 bg-[var(--wb-primary)] rounded-full opacity-30 animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }} />
            <div className="absolute bottom-1/3 -left-3 w-3 h-3 bg-[var(--wb-primary)] rounded-full opacity-40 animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }} />
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--wb-primary)] rounded-full opacity-50 animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }} />
            <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-[var(--wb-primary)] rounded-full opacity-60 animate-pulse" />
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

export default HeroSectionContext;
