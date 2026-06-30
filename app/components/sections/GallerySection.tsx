'use client';

import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

type GalleryImage = {
  id: string;
  title: string;
  altText: string;
  imageUrl: string;
};

const FALLBACK_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'fallback-1',
    title: 'Morning Meditation',
    altText: 'Person meditating at sunrise',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
  },
  {
    id: 'fallback-2',
    title: 'Yoga Practice',
    altText: 'Yoga pose in nature',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  },
  {
    id: 'fallback-3',
    title: 'Spa Relaxation',
    altText: 'Spa stones and candles',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
  },
  {
    id: 'fallback-4',
    title: 'Mindful Breathing',
    altText: 'Person practicing breathing exercises',
    imageUrl: 'https://images.unsplash.com/photo-1515377909023-d2a60a1b8a26?w=800',
  },
  {
    id: 'fallback-5',
    title: 'Nature Therapy',
    altText: 'Peaceful nature scene',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800',
  },
];

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function normalizeGalleryImages(gallerySection?: Page['gallerySection']): GalleryImage[] {
  const cmsImages =
    gallerySection?.images
      ?.filter((img) => img?.url?.trim())
      .map((img, index) => {
        const caption = tiptapToText(img.caption);
        return {
          id: `gallery-${index}`,
          title: caption || `Gallery image ${index + 1}`,
          altText: img.altText?.trim() || caption || 'Gallery image',
          imageUrl: getImageSrc(img.url),
        };
      }) ?? [];

  return cmsImages.length > 0 ? cmsImages : FALLBACK_GALLERY_IMAGES;
}

function getTileLayoutClass(index: number, total: number): string {
  if (total === 1) {
    return 'sm:col-span-2 lg:col-span-3';
  }
  if (total >= 3 && index === 0) {
    return 'sm:col-span-2 lg:col-span-2 lg:row-span-2';
  }
  return '';
}

interface GalleryTileProps {
  image: GalleryImage;
  index: number;
  total: number;
  visible: boolean;
  onOpen: (image: GalleryImage) => void;
}

function GalleryTile({ image, index, total, visible, onOpen }: GalleryTileProps) {
  const theme = useSectionTheme();
  const { colors, fonts, styles } = theme;
  const isFeatured = total >= 3 && index === 0;
  const isSingle = total === 1;

  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      className={cn(
        'group relative block w-full overflow-hidden rounded-2xl text-left lg:rounded-3xl',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        getTileLayoutClass(index, total),
        isFeatured
          ? 'min-h-[340px] sm:min-h-[440px] lg:min-h-0 lg:h-full'
          : isSingle
            ? 'min-h-[360px] sm:min-h-[480px] lg:min-h-[560px]'
            : 'min-h-[200px] sm:min-h-[220px] lg:min-h-0 lg:h-full lg:min-h-[240px]',
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
      aria-label={`View ${image.title}`}
    >
      <OptimizedImage
        src={image.imageUrl}
        alt={image.altText}
        fill
        sizes={
          isFeatured || isSingle ? IMAGE_SIZES.sectionWide : IMAGE_SIZES.galleryTile
        }
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:p-5">
        <span
          className="mb-2 inline-block rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest backdrop-blur-sm"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--wb-card-bg-light) 85%, transparent)',
            color: colors.mainText,
            fontFamily: fonts.body,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <p
          className="text-sm font-semibold text-white drop-shadow-md sm:text-base"
          style={{ fontFamily: fonts.heading }}
        >
          {image.title}
        </p>
      </div>
      <div
        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100"
        style={{ backgroundColor: 'color-mix(in srgb, var(--wb-card-bg-light) 90%, transparent)' }}
        aria-hidden
      >
        <svg className="h-4 w-4" style={{ color: colors.primaryButton }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </div>
    </button>
  );
}

function GalleryLightbox({
  image,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  image: GalleryImage;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close gallery"
      />
      <div className="relative z-10 flex w-full max-w-5xl flex-col">
        <div className="relative aspect-[4/3] min-h-[50vh] w-full max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl sm:aspect-[16/10] sm:rounded-3xl">
          <OptimizedImage
            src={image.imageUrl}
            alt={image.altText}
            fill
            quality={IMAGE_QUALITY_HIGH}
            className="object-contain p-4"
            sizes={IMAGE_SIZES.fullWidth}
            priority
          />
        </div>
        <div
          className="mt-4 flex items-center justify-between gap-4 rounded-2xl px-5 py-4 backdrop-blur-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--wb-card-bg-light) 95%, transparent)',
          }}
        >
          <p className="text-lg font-semibold sm:text-xl" style={{ fontFamily: fonts.heading, color: colors.mainText }}>
            {image.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {hasPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.primaryButton, color: colors.buttonText }}
                aria-label="Previous image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                onClick={onNext}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.primaryButton, color: colors.buttonText }}
                aria-label="Next image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:opacity-80"
              style={{ borderColor: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)', color: colors.mainText }}
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GallerySection({ gallerySection, className }: GallerySectionProps) {
  const theme = useSectionTheme();
  const { colors, fonts, styles } = theme;

  const titleContent = gallerySection?.title;
  const descriptionContent = gallerySection?.description;
  const hasTitle = hasTiptapContent(titleContent);
  const hasDescription = hasTiptapContent(descriptionContent);

  const galleryImages = useMemo(() => normalizeGalleryImages(gallerySection), [gallerySection]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: gridRef, visibleItems } = useStaggeredAnimation(galleryImages.length, 90);

  const openLightbox = useCallback((image: GalleryImage) => {
    const idx = galleryImages.findIndex((i) => i.id === image.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  }, [galleryImages]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const lightboxImage = lightboxIndex != null ? galleryImages[lightboxIndex] : null;

  if (!gallerySection || gallerySection.enabled === false) return null;

  const hasCmsImages = (gallerySection.images?.filter((img) => img?.url?.trim()).length ?? 0) > 0;
  if (!hasTitle && !hasDescription && !hasCmsImages) return null;

  return (
    <section
      id="gallery"
      className={cn('relative overflow-hidden py-20 lg:py-32', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="absolute inset-0" style={styles.sectionGradientBgSoft} />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full opacity-20 animate-float"
            style={{
              ...styles.floatingDot,
              left: `${12 + i * 14}%`,
              top: `${10 + i * 12}%`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(hasTitle || hasDescription) && (
          <div className="mb-12 text-center lg:mb-16">
            <div
              className={cn(
                'mx-auto mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-1000',
                titleVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              )}
              style={styles.iconBadge}
            >
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            {hasTitle && (
              <h2
                ref={titleRef}
                className={cn(
                  'mb-6 text-4xl font-semibold transition-all duration-1000 md:text-5xl lg:text-6xl',
                  titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                )}
                style={{ fontFamily: fonts.heading, ...styles.titleGradient }}
              >
                <TiptapRenderer content={titleContent} as="inline" />
              </h2>
            )}

            <div className="mb-6 flex items-center justify-center">
              <div className="h-px w-16" style={styles.dividerLine} />
              <div className="mx-6 h-4 w-4 animate-pulse rounded-full" style={styles.dividerDot} />
              <div className="h-px w-16" style={styles.dividerLine} />
            </div>

            {hasDescription && (
              <div
                ref={descRef}
                className={cn(
                  'wb-text-on-light-secondary mx-auto max-w-2xl text-base leading-relaxed transition-all duration-1000 delay-300 md:text-lg',
                  descVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                )}
                style={{ color: colors.secondaryText, fontFamily: fonts.body }}
              >
                <TiptapRenderer content={descriptionContent} as="inline" />
              </div>
            )}
          </div>
        )}

        <div
          ref={gridRef}
          className={cn(
            'grid gap-4 sm:gap-5 lg:gap-6',
            galleryImages.length === 3
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 lg:min-h-[520px] lg:max-h-[720px]'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {galleryImages.map((image, index) => (
            <GalleryTile
              key={image.id}
              image={image}
              index={index}
              total={galleryImages.length}
              visible={visibleItems.includes(index)}
              onOpen={openLightbox}
            />
          ))}
        </div>

        <p
          className="mt-10 text-center text-xs uppercase tracking-widest"
          style={{ color: colors.secondaryText, fontFamily: fonts.body }}
        >
          Tap any image to view full size
        </p>
      </div>

      {lightboxImage && lightboxIndex != null && (
        <GalleryLightbox
          image={lightboxImage}
          onClose={closeLightbox}
          onPrev={() => setLightboxIndex((i) => (i != null && i > 0 ? i - 1 : i))}
          onNext={() =>
            setLightboxIndex((i) =>
              i != null && i < galleryImages.length - 1 ? i + 1 : i
            )
          }
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < galleryImages.length - 1}
        />
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
