'use client';

import React, { useEffect, useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface ThemeFontWrapperProps {
  children: React.ReactNode;
}

export const ThemeFontWrapper: React.FC<ThemeFontWrapperProps> = ({ children }) => {
  const { site } = useWebBuilder();

  const fonts = useMemo(() => {
    const heading = typeof site?.theme?.headingFont === 'string' ? site?.theme?.headingFont.trim() : '';
    const body = typeof site?.theme?.bodyFont === 'string' ? site?.theme?.bodyFont.trim() : '';

    return {
      heading: heading || undefined,
      body: body || undefined,
    };
  }, [site?.theme?.headingFont, site?.theme?.bodyFont]);

  const themeStyles = useMemo(() => {
    const styles: Record<string, string | undefined> = {};
    
    // Fonts
    if (fonts.heading) styles['--wb-heading-font'] = fonts.heading;
    if (fonts.body) {
      styles['--wb-body-font'] = fonts.body;
      styles['fontFamily'] = fonts.body; // Use camelCase for React style object
    }

    // Colors from Site Theme
    const theme = site?.theme;
    if (theme) {
      // Backgrounds
      if (theme.pageBackgroundColor) styles['--wb-page-bg'] = theme.pageBackgroundColor;
      if (theme.sectionBackgroundColorLight) styles['--wb-section-bg-light'] = theme.sectionBackgroundColorLight;
      if (theme.sectionBackgroundColorDark) styles['--wb-section-bg-dark'] = theme.sectionBackgroundColorDark;
      if (theme.cardBackgroundColorLight) styles['--wb-card-bg-light'] = theme.cardBackgroundColorLight;
      if (theme.cardBackgroundColorDark) styles['--wb-card-bg-dark'] = theme.cardBackgroundColorDark;

      // Text colors
      if (theme.lightPrimaryColor) styles['--wb-text-main'] = theme.lightPrimaryColor;
      if (theme.lightSecondaryColor) styles['--wb-text-secondary'] = theme.lightSecondaryColor;
      const textOnDark = theme.textOnDarkColor || '#ffffff';
      styles['--wb-text-on-dark'] = textOnDark;
      styles['--wb-button-text'] = textOnDark;
      if (theme.textOnDarkSecondaryColor) {
        styles['--wb-text-on-dark-secondary'] = theme.textOnDarkSecondaryColor;
      } else if (theme.darkSecondaryColor) {
        styles['--wb-text-on-dark-secondary'] = theme.darkSecondaryColor;
      } else if (theme.lightSecondaryColor) {
        styles['--wb-text-on-dark-secondary'] = theme.lightSecondaryColor;
      }

      // Primary UI Colors (Buttons etc)
      const primaryColor = theme.primaryButtonColorLight || theme.primaryButtonColorDark;
      if (primaryColor) {
        styles['--wb-primary'] = primaryColor;
        styles['--wb-primary-hover'] = theme.hoverActiveColorLight || primaryColor;
        
        // Also map to tailwind primary variables
        styles['--color-primary-600'] = primaryColor;
        styles['--color-primary-500'] = primaryColor;
        styles['--color-primary-400'] = primaryColor;
        styles['--color-primary-700'] = theme.hoverActiveColorLight || primaryColor;
      }
    }

    return styles as React.CSSProperties;
  }, [site?.theme, fonts]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const uniqueFonts = Array.from(new Set([fonts.heading, fonts.body].filter(Boolean))) as string[];
    if (uniqueFonts.length === 0) return;

    const familiesParam = uniqueFonts
      .map((f) => {
        const param = encodeURIComponent(f).replace(/%20/g, '+');
        if (f === fonts.heading) {
          return `family=${param}:ital,wght@0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600`;
        }
        return `family=${param}:wght@300;400;500;600;700;800;900`;
      })
      .join('&');
    const href = `https://fonts.googleapis.com/css2?${familiesParam}&display=swap`;

    const id = `wb-fonts-${uniqueFonts.join('|')}`;
    const existing = document.getElementById(id) as HTMLLinkElement | null;
    if (existing) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [fonts.heading, fonts.body]);

  return (
    <div style={themeStyles}>
      {children}
    </div>
  );
};
