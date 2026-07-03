'use client';

import { useMemo } from 'react';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

interface ServiceOverviewProps {
  overview: unknown;
  className?: string;
}

type OverviewService = {
  name: string;
  description: string;
  price?: string;
  imageUrl?: string;
  imageAlt?: string;
};

type OverviewData = {
  title?: unknown;
  description?: unknown;
  image?: { url: string; altText?: string };
  services: OverviewService[];
};

function normalizeImage(raw: unknown): OverviewData['image'] | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string' && raw.trim()) return { url: raw.trim() };
  if (typeof raw === 'object' && raw !== null && 'url' in raw) {
    const record = raw as { url?: string; altText?: string };
    if (record.url?.trim()) return { url: record.url.trim(), altText: record.altText };
  }
  return undefined;
}

function normalizeServiceItem(item: unknown): OverviewService | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;

  const name =
    (typeof record.name === 'string' && record.name.trim()) ||
    (typeof record.title === 'string' && record.title.trim()) ||
    '';
  if (!name) return null;

  const description =
    tiptapToText(record.description) ||
    tiptapToText(record.shortDescription) ||
    (typeof record.summary === 'string' ? record.summary.trim() : '');

  const price = typeof record.price === 'string' ? record.price.trim() : undefined;

  let imageUrl: string | undefined;
  let imageAlt: string | undefined;
  const image = record.image;
  if (typeof image === 'string' && image.trim()) {
    imageUrl = getImageSrc(image.trim());
  } else if (image && typeof image === 'object' && 'url' in image) {
    const img = image as { url?: string; altText?: string };
    if (img.url?.trim()) {
      imageUrl = getImageSrc(img.url.trim());
      imageAlt = img.altText?.trim();
    }
  }

  return { name, description, price, imageUrl, imageAlt: imageAlt || name };
}

function normalizeOverviewSection(overview: unknown): OverviewData | null {
  if (!overview || typeof overview !== 'object') return null;

  const data = overview as Record<string, unknown>;
  if (data.enabled === false) return null;

  const title = data.title;
  const description = data.description ?? data.subtitle ?? data.secondaryDescription;
  const image = normalizeImage(data.image);

  const rawList = data.services ?? data.items ?? data.highlights;
  const services: OverviewService[] = [];
  if (Array.isArray(rawList)) {
    for (const item of rawList) {
      const normalized = normalizeServiceItem(item);
      if (normalized) services.push(normalized);
    }
  }

  if (!title && !description && !image && services.length === 0) return null;

  return { title, description, image, services };
}

function hasRichContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

export const ServiceOverview: React.FC<ServiceOverviewProps> = ({ overview, className }) => {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;

  const section = useMemo(() => normalizeOverviewSection(overview), [overview]);

  const titleText = useMemo(() => tiptapToText(section?.title), [section?.title]);
  const descriptionText = useMemo(
    () => tiptapToText(section?.description),
    [section?.description]
  );
  const headerImage = useMemo(() => {
    const url = section?.image?.url;
    return url ? getImageSrc(url) : undefined;
  }, [section?.image?.url]);

  if (!section) return null;

  const showTitle = hasRichContent(section.title) || Boolean(titleText);
  const showDescription = hasRichContent(section.description) || Boolean(descriptionText);
  const borderColor = `color-mix(in srgb, ${colors.mainText} 12%, transparent)`;

  const hasTextBlock = showTitle || showDescription;
  const textOnlyHero = hasTextBlock && !headerImage && section.services.length === 0;

  return (
    <section
      className={cn('relative border-t', className)}
      style={{
        backgroundColor: colors.pageBackground,
        borderColor,
        fontFamily: fonts.body,
      }}
    >
      {/* Full-viewport text (+ optional image) */}
      {hasTextBlock && (
        <div
          className={cn(
            headerImage ? 'flex flex-col lg:flex-row lg:items-stretch' : 'block'
          )}
        >
          <header
            className={cn(
              'flex flex-col justify-start px-6 md:px-12 lg:px-16 xl:px-20 py-12 sm:py-14 lg:py-16',
              headerImage && 'lg:flex-1 lg:min-w-0',
              textOnlyHero && 'mx-auto w-full max-w-4xl'
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] mb-6" style={{ fontFamily: fonts.body }}>
              <span style={{ color: colors.secondaryText }}>[ </span>
              <span style={{ color: colors.mainText }}>Overview</span>
              <span style={{ color: colors.secondaryText }}> ]</span>
            </p>

            {showTitle && (
              <h2
                className="text-[clamp(1.75rem,3.5vw,3rem)] font-normal leading-[1.12] tracking-tight max-w-3xl"
                style={{ fontFamily: fonts.heading, color: colors.mainText }}
              >
                {hasRichContent(section.title) ? (
                  <TiptapRenderer content={section.title} as="inline" />
                ) : (
                  titleText
                )}
              </h2>
            )}

            {showDescription && hasRichContent(section.description) && (
              <div
                className={cn(
                  'mt-6 sm:mt-8 text-base sm:text-lg font-light leading-relaxed max-w-2xl',
                  !showTitle && 'mt-0'
                )}
                style={{ color: colors.secondaryText }}
              >
                <TiptapRenderer content={section.description} />
              </div>
            )}

            {showDescription && !hasRichContent(section.description) && descriptionText && (
              <p
                className={cn(
                  'mt-6 sm:mt-8 text-base sm:text-lg font-light leading-relaxed max-w-2xl',
                  !showTitle && 'mt-0'
                )}
                style={{ color: colors.secondaryText }}
              >
                {descriptionText}
              </p>
            )}
          </header>

          {headerImage && (
            <div className="relative order-first aspect-[4/3] sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:min-h-0 lg:min-w-0 lg:flex-1">
              <OptimizedImage
                src={headerImage}
                alt={section.image?.altText?.trim() || titleText || 'Service overview'}
                fill
                sizes={IMAGE_SIZES.sectionWide}
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}

      {section.services.length > 0 && (
        <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12 lg:px-16 xl:px-20 py-16 sm:py-20 lg:py-24 border-t" style={{ borderColor }}>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.services.map((service, index) => {
                const number = String(index + 1).padStart(2, '0');

                return (
                  <li
                    key={`${service.name}-${index}`}
                    className="flex flex-col rounded-sm border p-6 sm:p-7 transition-shadow hover:shadow-md"
                    style={{
                      borderColor,
                      backgroundColor: colors.pageBackground,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span
                        className="text-xs tabular-nums font-medium"
                        style={{ color: colors.secondaryText, opacity: 0.6 }}
                      >
                        {number}
                      </span>
                      {service.price && (
                        <span
                          className="text-xs font-medium uppercase tracking-wider shrink-0"
                          style={{ color: colors.primaryButton }}
                        >
                          {service.price}
                        </span>
                      )}
                    </div>

                    {service.imageUrl && (
                      <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-sm">
                        <OptimizedImage
                          src={service.imageUrl}
                          alt={service.imageAlt || service.name}
                          fill
                          sizes={IMAGE_SIZES.card}
                          className="object-cover"
                        />
                      </div>
                    )}

                    <h3
                      className="text-lg sm:text-xl leading-snug"
                      style={{ fontFamily: fonts.heading, color: colors.mainText }}
                    >
                      {service.name}
                    </h3>

                    {service.description && (
                      <p
                        className="mt-2 text-sm sm:text-base leading-relaxed flex-1"
                        style={{ color: colors.secondaryText }}
                      >
                        {service.description}
                      </p>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ServiceOverview;
