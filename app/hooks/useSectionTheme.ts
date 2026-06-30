'use client';

import { useMemo } from 'react';
import { useThemeColors } from '@/app/hooks/useTheme';

export function useSectionTheme() {
  const colors = useThemeColors();

  return useMemo(
    () => ({
      colors,
      fonts: {
        heading: 'var(--wb-heading-font, Georgia, serif)',
        body: 'var(--wb-body-font, inherit)',
      },
      styles: {
        titleGradient: {
          background: `linear-gradient(135deg, ${colors.mainText} 0%, ${colors.primaryButton} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } as React.CSSProperties,
        iconBadge: {
          background: `linear-gradient(135deg, ${colors.primaryButton}, ${colors.hoverActive})`,
        } as React.CSSProperties,
        sectionGradientBg: {
          backgroundColor: colors.pageBackground,
        } as React.CSSProperties,
        sectionGradientBgAlt: {
          backgroundColor: colors.pageBackground,
        } as React.CSSProperties,
        sectionGradientBgSoft: {
          backgroundColor: colors.pageBackground,
        } as React.CSSProperties,
        card: {
          borderColor: 'color-mix(in srgb, var(--wb-primary) 10%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--wb-card-bg-light) 90%, transparent)',
        } as React.CSSProperties,
        cardSolid: {
          borderColor: 'color-mix(in srgb, var(--wb-primary) 10%, transparent)',
          backgroundColor: colors.cardBackground,
        } as React.CSSProperties,
        imagePlaceholder: {
          backgroundColor: colors.pageBackground,
        } as React.CSSProperties,
        imageOverlay: {
          background: 'transparent',
        } as React.CSSProperties,
        imageOverlayHover: {
          background: 'transparent',
        } as React.CSSProperties,
        dividerDot: { backgroundColor: colors.primaryButton } as React.CSSProperties,
        dividerLine: {
          backgroundColor: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)',
        } as React.CSSProperties,
        dividerGradient: {
          background: `linear-gradient(90deg, ${colors.primaryButton}, transparent)`,
        } as React.CSSProperties,
        primaryCta: {
          backgroundColor: colors.primaryButton,
          color: colors.buttonText,
        } as React.CSSProperties,
        statCircle: {
          background: `linear-gradient(135deg, ${colors.primaryButton}, ${colors.hoverActive})`,
        } as React.CSSProperties,
        accentText: { color: colors.primaryButton } as React.CSSProperties,
        floatingDot: { backgroundColor: colors.primaryButton } as React.CSSProperties,
      },
    }),
    [colors]
  );
}
