'use client';

import React from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { getImageSrc } from '@/app/lib/utils';

interface ServiceBannerProps {
    service: any;
}

// Utility function to get full image URL
const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const resolved = getImageSrc(url);
    return resolved || undefined;
};

export const ServiceBanner: React.FC<ServiceBannerProps> = ({ service }) => {
    const themeFonts = useThemeFonts();
    const themeColors = useThemeColors();

    // Determine banner title
    const bannerTitle = service.banner?.useServiceNameAsTitle !== false
        ? service.name
        : service.banner?.customTitle || service.name;

    // Banner background image
    const bannerBgImage = service.banner?.backgroundImage?.url
        ? getFullImageUrl(service.banner.backgroundImage.url)
        : service.thumbnailImage?.url
            ? getFullImageUrl(service.thumbnailImage.url)
            : undefined;

    // Banner overlay opacity
    const overlayOpacity = service.banner?.overlayOpacity ?? 50;

    return (
        <section
            className="relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden"
            style={{
                backgroundImage: bannerBgImage ? `url(${bannerBgImage})` : undefined,
        backgroundColor: '#1a1a1a',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Gradient Overlay - always show for consistent look */}
            <div
                className="absolute inset-0"
                style={{
                    background: bannerBgImage 
                        ? `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${(overlayOpacity / 100) * 0.6}) 100%)`
                        : 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
                }}
            />

            {/* Architectural Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white/30" />
            </div>

            {/* Banner Content */}
            <div className="relative z-10 text-center px-6 md:px-12 py-20 md:py-32 max-w-5xl mx-auto">
                {/* Label */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-12 h-[1px] bg-white/40" />
                    <span 
                        className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold text-white/60"
                        style={{ fontFamily: themeFonts.body }}
                    >
                        Our Services
                    </span>
                    <div className="w-12 h-[1px] bg-white/40" />
                </div>

                <h1
                    className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl xl:text-7xl"
                    style={{ 
                        fontFamily: themeFonts.heading || 'var(--wb-heading-font, Georgia, serif)',
                        textShadow: '0 4px 30px rgba(0,0,0,0.3)' 
                    }}
                >
                    {bannerTitle}
                </h1>
                
                {service.shortDescription && (
                    <div
                        className="mx-auto max-w-2xl text-base font-normal leading-relaxed tracking-wide text-white/80 md:text-lg lg:text-xl"
                        style={{ fontFamily: themeFonts.body || 'var(--wb-body-font, inherit)' }}
                    >
                        {typeof service.shortDescription === 'string'
                            ? service.shortDescription
                            : <TiptapRenderer content={service.shortDescription} as="inline" />}
                    </div>
                )}

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
                    <span className="text-[9px] tracking-[0.3em] uppercase text-white/60">Scroll</span>
                    <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent" />
                </div>
            </div>
        </section>
    );
};
