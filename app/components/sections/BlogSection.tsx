'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import type { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';

type BlogSectionInput = NonNullable<Page['blogSection']> & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: BlogSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function resolvePostImageRaw(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string | undefined {
  const img = post?.featuredImage;
  if (typeof img === 'string' && img.trim()) return img;
  if (img && typeof img === 'object' && (img as { url?: string }).url) {
    return (img as { url: string }).url;
  }
  if (post?.seo?.ogImageUrl) return post.seo.ogImageUrl;
  return undefined;
}

function getPostImageSrc(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string {
  const raw = resolvePostImageRaw(post);
  return raw ? getImageSrc(raw) : '';
}

function getPostImageAlt(post: { featuredImage?: unknown; title?: string }): string {
  const img = post?.featuredImage;
  if (img && typeof img === 'object' && (img as { altText?: string }).altText) {
    return (img as { altText: string }).altText;
  }
  return post?.title || '';
}

function formatPostDate(iso: string | undefined, show: boolean): string | null {
  if (!show || !iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

interface BlogSectionProps {
  blogSection?: Page['blogSection'];
  className?: string;
}

type BlogPostItem = {
  _id: string;
  slug: string;
  title?: string;
  excerpt?: unknown;
  publishedAt?: string;
  createdAt?: string;
  author?: { name?: string };
  categories?: string[];
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
};

export const BlogSection: React.FC<BlogSectionProps> = ({ blogSection, className }) => {
  const theme = useSectionTheme();
  const { colors, fonts, styles } = theme;
  const { blogPosts, loading, pages } = useWebBuilder();

  const sectionData = useMemo(() => {
    const fallback = pages.find((p) => p.pageType === 'blog-list')?.blogSection as
      | BlogSectionInput
      | undefined;
    const current = blogSection as BlogSectionInput | undefined;
    if (!current && !fallback) return undefined;

    return {
      enabled: current?.enabled ?? fallback?.enabled ?? false,
      postsToShow: current?.postsToShow ?? fallback?.postsToShow ?? 3,
      showExcerpt: current?.showExcerpt ?? fallback?.showExcerpt ?? true,
      showDate: current?.showDate ?? fallback?.showDate ?? true,
      title: pickSectionField(current, 'title') ?? pickSectionField(fallback, 'title'),
      description:
        pickSectionField(current, 'description') ??
        pickSectionField(fallback, 'description'),
    };
  }, [blogSection, pages]);

  const titleContent = sectionData?.title;
  const descriptionContent = sectionData?.description;
  const hasTitle = hasTiptapContent(titleContent);
  const hasDescription = hasTiptapContent(descriptionContent);

  const { ref: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 });
  const { ref: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  if (!sectionData?.enabled) return null;

  const count = Math.min(Math.max(sectionData.postsToShow || 3, 1), 12);
  const displayPosts = blogPosts.slice(0, count);
  const showExcerpt = Boolean(sectionData.showExcerpt);
  const showDate = Boolean(sectionData.showDate);

  if (loading && blogPosts.length === 0) {
    return null;
  }

  if (displayPosts.length === 0 && !hasTitle && !hasDescription) {
    return null;
  }

  const [featured, ...morePosts] = displayPosts as BlogPostItem[];

  return (
    <section
      id="blog"
      className={cn('relative overflow-hidden py-20 lg:py-32', className)}
      style={{ fontFamily: fonts.body, backgroundColor: colors.pageBackground }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full opacity-20 animate-float"
            style={{
              left: `${12 + i * 13}%`,
              top: `${8 + i * 12}%`,
              animationDelay: `${i * 0.6}s`,
              backgroundColor: colors.primaryButton,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center lg:mb-20">
          <div
            className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-1000 ${
              titleVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
            style={styles.iconBadge}
          >
            <svg
              className="h-8 w-8"
              style={{ color: 'var(--wb-text-on-dark, #fff)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>

          {hasTitle && (
            <h2
              ref={titleRef}
              className={cn(
                'text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 transition-all duration-1000',
                titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{
                fontFamily: fonts.heading,
                ...styles.titleGradient,
              }}
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
                'mx-auto max-w-3xl text-lg leading-relaxed wb-text-on-light-secondary transition-all duration-1000 delay-300',
                descVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
            >
              <TiptapRenderer content={descriptionContent} as="inline" />
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              href="/blog"
              className="inline-block px-8 py-4 text-sm font-medium uppercase tracking-wide transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
              style={styles.primaryCta}
            >
              View All Articles →
            </Link>
          </div>
        </div>

        {displayPosts.length === 0 ? (
          <p className="text-center text-sm wb-text-on-light-secondary">
            No published posts yet. Add posts in the builder to show them here.
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {featured && (
              <FeaturedPostCard
                post={featured}
                showExcerpt={showExcerpt}
                showDate={showDate}
                className="lg:col-span-7"
              />
            )}

            {morePosts.length > 0 && (
              <div className="lg:col-span-5">
                <p
                  className="mb-6 text-sm font-medium uppercase tracking-wide"
                  style={styles.accentText}
                >
                  More Articles
                </p>
                <ul className="space-y-4">
                  {morePosts.map((post) => (
                    <li key={post._id}>
                      <MorePostCard post={post} showDate={showDate} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

function PostMeta({
  post,
  showDate,
  className,
}: {
  post: BlogPostItem;
  showDate: boolean;
  className?: string;
}) {
  const { colors, fonts, styles } = useSectionTheme();
  const dateLabel = formatPostDate(post.publishedAt || post.createdAt, showDate);
  const author = post.author?.name?.trim();
  const category = post.categories?.[0];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide wb-text-on-light-secondary',
        className
      )}
      style={{ fontFamily: fonts.body }}
    >
      {category && (
        <span
          className="rounded-full border px-2.5 py-0.5 font-medium"
          style={{
            borderColor: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--wb-primary) 10%, transparent)',
            color: colors.primaryButton,
          }}
        >
          {category}
        </span>
      )}
      {author && <span>By {author}</span>}
      {dateLabel && <span>{dateLabel}</span>}
    </div>
  );
}

function FeaturedPostCard({
  post,
  showExcerpt,
  showDate,
  className,
}: {
  post: BlogPostItem;
  showExcerpt: boolean;
  showDate: boolean;
  className?: string;
}) {
  const { colors, fonts, styles } = useSectionTheme();
  const imgSrc = getPostImageSrc(post);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-3xl border bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl',
        className
      )}
      style={{ fontFamily: fonts.body, ...styles.card }}
    >
      <Link href={`/blog/${post.slug}`} className="block no-underline">
        <div className="relative aspect-[16/10] overflow-hidden" style={styles.imagePlaceholder}>
          {imgSrc ? (
            <OptimizedImage
              src={imgSrc}
              alt={getPostImageAlt(post)}
              fill
              sizes={IMAGE_SIZES.sectionHalf}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ color: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)' }}
            >
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-4 p-6 md:p-8">
          <PostMeta post={post} showDate={showDate} />
          {post.title && (
            <h3
              className="text-2xl font-semibold wb-text-on-light transition-colors group-hover:text-[var(--wb-primary)] md:text-3xl"
              style={{ fontFamily: fonts.heading }}
            >
              {post.title}
            </h3>
          )}
          {showExcerpt && Boolean(post.excerpt) && (
            <div className="line-clamp-3 text-sm leading-relaxed wb-text-on-light-secondary">
              <TiptapRenderer content={post.excerpt} as="inline" />
            </div>
          )}
          <span className="inline-block text-xs font-medium uppercase tracking-wide" style={styles.accentText}>
            Read Article →
          </span>
        </div>
      </Link>
    </article>
  );
}

function MorePostCard({ post, showDate }: { post: BlogPostItem; showDate: boolean }) {
  const { fonts, styles } = useSectionTheme();
  const imgSrc = getPostImageSrc(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 overflow-hidden rounded-3xl border bg-white/90 p-4 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl no-underline"
      style={{ fontFamily: fonts.body, ...styles.card }}
    >
      <div
        className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-28"
        style={styles.imagePlaceholder}
      >
        {imgSrc ? (
          <OptimizedImage
            src={imgSrc}
            alt={getPostImageAlt(post)}
            fill
            sizes={IMAGE_SIZES.thumb}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ color: 'color-mix(in srgb, var(--wb-primary) 30%, transparent)' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <PostMeta post={post} showDate={showDate} className="mb-2" />
        {post.title && (
          <h4
            className="text-base font-semibold wb-text-on-light transition-colors group-hover:text-[var(--wb-primary)] sm:text-lg"
            style={{ fontFamily: fonts.heading }}
          >
            {post.title}
          </h4>
        )}
        <span
          className="mt-2 inline-block text-xs font-medium uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100"
          style={styles.accentText}
        >
          Read →
        </span>
      </div>
    </Link>
  );
}

export default BlogSection;
