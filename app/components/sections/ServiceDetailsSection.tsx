'use client';

import React from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc, TIPTAP_INHERIT } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface ServiceDetailsSectionProps {
  service: any;
  galleryImages: any[];
}

const getFullImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  const resolved = getImageSrc(url);
  return resolved || undefined;
};

export const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({
  service,
  galleryImages,
}) => {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const headingFont = themeFonts.heading || 'var(--wb-heading-font, Georgia, serif)';
  const bodyFont = themeFonts.body || 'var(--wb-body-font, inherit)';
  const textColor = themeColors.mainText;
  const captionColor = themeColors.secondaryText;

  return (
    <div className="lg:col-span-8" style={{ fontFamily: bodyFont, color: textColor }}>
      <style>{`
        .service-rich-content {
          font-family: ${bodyFont};
          color: ${textColor};
        }
        .service-rich-content h1,
        .service-rich-content h2,
        .service-rich-content h3,
        .service-rich-content h4,
        .service-rich-content h5,
        .service-rich-content h6 {
          font-family: ${headingFont} !important;
          color: ${textColor} !important;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 1.75em;
          margin-bottom: 0.6em;
        }
        .service-rich-content h1 { font-size: clamp(1.75rem, 3vw, 2.5rem); }
        .service-rich-content h2 { font-size: clamp(1.5rem, 2.5vw, 2rem); }
        .service-rich-content h3 { font-size: clamp(1.25rem, 2vw, 1.5rem); }
        .service-rich-content p,
        .service-rich-content li {
          font-family: ${bodyFont} !important;
          color: ${textColor} !important;
          line-height: 1.75;
        }
        .service-rich-content ul,
        .service-rich-content ol {
          font-family: ${bodyFont} !important;
        }
        .service-rich-content a {
          color: ${themeColors.primaryButton} !important;
        }
      `}</style>

      {service.thumbnailImage?.url && (
        <div className="mb-8">
          <OptimizedImage
            src={getFullImageUrl(service.thumbnailImage.url) || ''}
            alt={service.thumbnailImage.altText || service.name}
            width={1400}
            height={560}
            sizes={IMAGE_SIZES.sectionWide}
            className="h-auto max-h-[400px] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
      )}

      {service.description && (
        <div className={cn('service-rich-content max-w-none', TIPTAP_INHERIT)}>
          <TiptapRenderer content={service.description} className={TIPTAP_INHERIT} />
        </div>
      )}

      {(Array.isArray(service.features) ? service.features.length > 0 : !!service.features) && (
        <div className={service.description ? 'mt-12' : ''}>
          <h2
            className="mb-4 text-2xl font-bold lg:text-3xl"
            style={{
              color: textColor,
              fontFamily: headingFont,
            }}
          >
            Features
          </h2>
          <div className={cn('service-rich-content max-w-none', TIPTAP_INHERIT)}>
            {Array.isArray(service.features) ? (
              <ul className="list-disc space-y-2 pl-5">
                {service.features.map((feature: any, index: number) => (
                  <li key={index} style={{ fontFamily: bodyFont, color: textColor }}>
                    {typeof feature === 'string' ? (
                      feature
                    ) : (
                      <TiptapRenderer content={feature} as="inline" className={TIPTAP_INHERIT} />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <TiptapRenderer content={service.features} className={TIPTAP_INHERIT} />
            )}
          </div>
        </div>
      )}

      {galleryImages.length > 0 && (
        <div className="mt-12 space-y-8">
          {galleryImages.map((image: any, index: number) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center gap-6 md:flex-row',
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                )}
              >
                <div className="md:w-1/2">
                  <OptimizedImage
                    src={getFullImageUrl(image.url) || ''}
                    alt={image.altText || `${service.name} image ${index + 1}`}
                    width={1000}
                    height={640}
                    sizes={IMAGE_SIZES.sectionHalf}
                    className="h-64 w-full rounded-xl object-cover shadow-md"
                  />
                </div>
                <div className="md:w-1/2">
                  {image.caption && (
                    <p className="text-sm italic" style={{ color: captionColor, fontFamily: bodyFont }}>
                      {image.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
