'use client';

import { useMemo } from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

interface ServiceDetailsProps {
  details: unknown;
  className?: string;
}

type DetailItem = {
  id: string;
  title?: unknown;
  description?: unknown;
  titleText: string;
  descriptionText: string;
};

type SectionData = {
  title?: unknown;
  description?: unknown;
  items: DetailItem[];
};

function hasRichContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function pushItem(
  items: DetailItem[],
  raw: Record<string, unknown>,
  index: number,
  prefix: string
) {
  const title = raw.title ?? raw.label ?? raw.name;
  const description =
    raw.description ?? raw.fullDescription ?? raw.shortDescription ?? raw.value;
  const titleText = tiptapToText(title) || (typeof title === 'string' ? title.trim() : '');
  const descriptionText =
    tiptapToText(description) || (typeof description === 'string' ? description.trim() : '');

  if (!titleText && !descriptionText && !hasRichContent(title) && !hasRichContent(description)) {
    return;
  }

  const id =
    (typeof raw._id === 'string' && raw._id) ||
    `${prefix}-${index}-${titleText.slice(0, 24) || index}`;

  items.push({ id, title, description, titleText, descriptionText });
}

function normalizeServiceDetails(details: unknown): SectionData | null {
  if (!details || typeof details !== 'object') return null;

  const data = details as Record<string, unknown>;
  if (data.enabled === false) return null;

  const items: DetailItem[] = [];

  const featureLists = [
    { key: 'features', prefix: 'feature' },
    { key: 'process', prefix: 'process' },
    { key: 'benefits', prefix: 'benefit' },
    { key: 'details', prefix: 'detail' },
  ] as const;

  for (const { key, prefix } of featureLists) {
    const list = data[key];
    if (!Array.isArray(list)) continue;
    list.forEach((entry, index) => {
      if (entry && typeof entry === 'object') {
        pushItem(items, entry as Record<string, unknown>, index, prefix);
      }
    });
  }

  const title = data.title;
  const description = data.description ?? data.subtitle;

  if (!title && !description && items.length === 0) return null;

  return { title, description, items };
}

function DetailRow({
  item,
  index,
  visible,
}: {
  item: DetailItem;
  index: number;
  visible: boolean;
}) {
  const theme = useSectionTheme();
  const { colors, fonts, styles } = theme;
  const isRight = index % 2 === 0;
  const number = String(index + 1).padStart(2, '0');

  const showTitle = hasRichContent(item.title) || Boolean(item.titleText);
  const showDescription = hasRichContent(item.description) || Boolean(item.descriptionText);

  return (
    <li
      className={cn(
        'transition-all duration-1000',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        isRight ? 'lg:ml-auto lg:text-right' : 'lg:mr-auto lg:text-left'
      )}
      style={{ transitionDelay: `${index * 150}ms`, maxWidth: '42rem' }}
    >
      <div
        className={cn(
          'mb-5 flex items-center gap-4',
          isRight ? 'lg:flex-row-reverse' : 'lg:flex-row'
        )}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums shadow-md"
          style={{
            backgroundColor: colors.primaryButton,
            color: colors.buttonText,
            fontFamily: fonts.body,
          }}
        >
          {number}
        </div>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: `color-mix(in srgb, ${colors.primaryButton} 35%, transparent)` }}
        />
      </div>

      {showTitle && (
        <h3
          className="text-2xl font-semibold leading-snug sm:text-3xl"
          style={{ fontFamily: fonts.heading, color: colors.mainText }}
        >
          {hasRichContent(item.title) ? (
            <TiptapRenderer content={item.title} as="inline" />
          ) : (
            item.titleText
          )}
        </h3>
      )}

      {showDescription && (
        <div
          className={cn('mt-3 text-sm leading-relaxed sm:text-base', isRight && 'lg:ml-auto')}
          style={{ color: colors.secondaryText, fontFamily: fonts.body, maxWidth: '36rem' }}
        >
          {hasRichContent(item.description) ? (
            <TiptapRenderer content={item.description} />
          ) : (
            <p>{item.descriptionText}</p>
          )}
        </div>
      )}

      <div
        className={cn(
          'mt-5 flex items-center gap-2',
          isRight ? 'lg:justify-end' : 'lg:justify-start'
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={styles.dividerDot} />
        <span
          className="h-px w-8"
          style={{ backgroundColor: `color-mix(in srgb, ${colors.primaryButton} 25%, transparent)` }}
        />
        <span
          className="h-1 w-1 rounded-full opacity-70"
          style={{ backgroundColor: colors.hoverActive }}
        />
        <span
          className="h-px w-5"
          style={{ backgroundColor: `color-mix(in srgb, ${colors.primaryButton} 18%, transparent)` }}
        />
      </div>
    </li>
  );
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({ details, className }) => {
  const theme = useSectionTheme();
  const { colors, fonts, styles } = theme;

  const section = useMemo(() => normalizeServiceDetails(details), [details]);

  const titleText = useMemo(() => tiptapToText(section?.title), [section?.title]);
  const descriptionText = useMemo(
    () => tiptapToText(section?.description),
    [section?.description]
  );

  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: listRef, visibleItems } = useStaggeredAnimation(section?.items.length ?? 0, 120);

  if (!section) return null;

  const showTitle = hasRichContent(section.title) || Boolean(titleText);
  const showDescription = hasRichContent(section.description) || Boolean(descriptionText);

  return (
    <section
      className={cn('relative overflow-hidden py-16 sm:py-20 lg:py-28', className)}
      style={{ backgroundColor: colors.pageBackground, fontFamily: fonts.body }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {(showTitle || showDescription) && (
          <header
            ref={headerRef}
            className={cn(
              'mx-auto mb-14 max-w-3xl text-center transition-all duration-1000 sm:mb-16 lg:mb-20',
              headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            {showTitle && (
              <h2
                className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: fonts.heading, ...styles.titleGradient }}
              >
                {hasRichContent(section.title) ? (
                  <TiptapRenderer content={section.title} as="inline" />
                ) : (
                  titleText
                )}
              </h2>
            )}

            {showTitle && showDescription && (
              <div className="mt-6 flex items-center justify-center">
                <div className="h-px w-12" style={styles.dividerLine} />
                <div className="mx-4 h-2 w-2 rounded-full" style={styles.dividerDot} />
                <div className="h-px w-12" style={styles.dividerLine} />
              </div>
            )}

            {showDescription && (
              <div
                className={cn(
                  'text-base leading-relaxed sm:text-lg',
                  showTitle ? 'mt-6' : 'mt-0'
                )}
                style={{ color: colors.secondaryText }}
              >
                {hasRichContent(section.description) ? (
                  <TiptapRenderer content={section.description} />
                ) : (
                  <p>{descriptionText}</p>
                )}
              </div>
            )}
          </header>
        )}

        {section.items.length > 0 && (
          <div ref={listRef}>
            <ul className="space-y-14 sm:space-y-16 lg:space-y-20">
              {section.items.map((item, index) => (
                <DetailRow
                  key={item.id}
                  item={item}
                  index={index}
                  visible={visibleItems.includes(index)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceDetails;
