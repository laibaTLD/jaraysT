'use client';

import Link from 'next/link';
import React from 'react';
import type { Page } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { getPageHref } from '@/app/lib/siteContent';

export type HomeSurface = 'page' | 'section' | 'card' | 'accent' | 'fluid';

export function useHomeTheme() {
  const colors = useThemeColors();
  const fonts = useThemeFonts();
  return { colors, fonts };
}

export function resolvePrimaryCta(page?: Page | null, _site?: unknown, pages?: Page[]): { label: string; href: string } | null {
  const heroCta = page?.hero?.primaryCta;
  if (heroCta?.label?.trim() && heroCta?.href?.trim()) {
    return { label: heroCta.label.trim(), href: normalizeHref(heroCta.href) };
  }
  const cta = page?.ctaSection?.primaryButton;
  if (cta?.label?.trim() && cta?.href?.trim()) {
    return { label: cta.label.trim(), href: normalizeHref(cta.href) };
  }
  const cta2 = page?.cta2Section?.primaryButton;
  if (cta2?.label?.trim() && cta2?.href?.trim()) {
    return { label: cta2.label.trim(), href: normalizeHref(cta2.href) };
  }
  const contactPage = pages?.find((p) => p.pageType === 'contact');
  if (contactPage?.name?.trim()) {
    return { label: contactPage.name.trim(), href: getPageHref(contactPage) };
  }
  return null;
}

export function resolveSecondaryCta(page?: Page | null): { label: string; href: string } | null {
  const cta = page?.hero?.secondaryCta;
  if (cta?.label?.trim() && cta?.href?.trim()) {
    return { label: cta.label.trim(), href: normalizeHref(cta.href) };
  }
  return null;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

export function HomeDotGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute opacity-[0.28] bg-[length:18px_18px]', className)}
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--wb-text-main) 14%, transparent) 1px, transparent 0)',
      }}
      aria-hidden
    />
  );
}

export function HomeSection({
  children,
  className,
  id,
  surface = 'section',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  surface?: HomeSurface;
  style?: React.CSSProperties;
}) {
  const { colors, fonts } = useHomeTheme();

  const backgroundColor =
    surface === 'fluid' || surface === 'page'
        ? colors.pageBackground
        : surface === 'section'
          ? colors.sectionBackgroundLight
          : surface === 'card'
            ? colors.cardBackground
            : `color-mix(in srgb, ${colors.sectionBackgroundLight} 92%, ${colors.primaryButton} 8%)`;

  return (
    <section
      id={id}
      className={cn('relative overflow-hidden py-16 md:py-24 lg:py-28', className)}
      style={{
        backgroundColor,
        color: colors.mainText,
        fontFamily: fonts.body,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function HomeContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('container mx-auto max-w-6xl px-5 sm:px-8 lg:px-10', className)}>{children}</div>;
}

export function HomeButton({
  href,
  label,
  className,
  variant = 'primary',
}: {
  href: string;
  label: string;
  className?: string;
  variant?: 'primary' | 'outline';
}) {
  const { colors, fonts } = useHomeTheme();

  if (variant === 'outline') {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex items-center justify-center rounded-full border px-7 py-3 text-sm font-medium transition-opacity hover:opacity-90',
          className
        )}
        style={{
          borderColor: `color-mix(in srgb, ${colors.mainText} 22%, transparent)`,
          color: colors.mainText,
          fontFamily: fonts.body,
        }}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium transition-opacity hover:opacity-90',
        className
      )}
      style={{
        backgroundColor: colors.primaryButton,
        color: colors.buttonText,
        fontFamily: fonts.body,
      }}
    >
      {label}
    </Link>
  );
}

export function HomeHeading({
  children,
  as: Tag = 'h2',
  className,
}: {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  const { colors, fonts } = useHomeTheme();
  return (
    <Tag
      className={cn('font-semibold leading-tight tracking-tight', className)}
      style={{ color: colors.mainText, fontFamily: fonts.heading }}
    >
      {children}
    </Tag>
  );
}

export function HomeMutedText({ children, className }: { children: React.ReactNode; className?: string }) {
  const { colors, fonts } = useHomeTheme();
  return (
    <div className={cn('leading-relaxed', className)} style={{ color: colors.secondaryText, fontFamily: fonts.body }}>
      {children}
    </div>
  );
}
