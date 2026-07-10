import type { Metadata } from 'next'
import { Page, Site, Service, BlogPost, ServiceAreaPage } from './types'
import { buildCanonicalUrl, tiptapToText, toHttpsExceptLocal } from './seo'
import { resolveSiteBaseUrl } from '@/app/lib/webbuilder-server'
import { resolveSiteFaviconIcons } from '@/app/lib/favicon'

interface SEOData {
  title?: string
  description?: string
  keywords?: string[] | string
  ogImageUrl?: string
  noIndex?: boolean
}

function normalizeKeywords(keywords?: string[] | string | null): string[] | undefined {
  if (!keywords) return undefined
  if (Array.isArray(keywords)) {
    const cleaned = keywords.map((k) => k.trim()).filter(Boolean)
    return cleaned.length > 0 ? cleaned : undefined
  }
  const parts = keywords.split(',').map((k) => k.trim()).filter(Boolean)
  return parts.length > 0 ? parts : undefined
}

function normalizeRawSeo(raw: Record<string, unknown> | undefined | null): SEOData {
  if (!raw) return {}
  return {
    title: (raw.title || raw.metaTitle || raw.seoTitle) as string | undefined,
    description: (raw.description || raw.metaDescription) as string | undefined,
    keywords: normalizeKeywords((raw.keywords ?? raw.metaKeywords) as string[] | string | undefined),
    ogImageUrl: (raw.ogImageUrl || raw.ogImage) as string | undefined,
    noIndex: raw.noIndex === true,
  }
}

function resolveTitle(rawTitle: string | undefined, site?: Site): string {
  const siteName = site?.business?.name?.trim() || site?.name?.trim() || 'Web Builder Site'
  const title = rawTitle?.trim()
  if (!title) return siteName
  if (title.toLowerCase().includes(siteName.toLowerCase())) return title
  return `${title} | ${siteName}`
}

function resolveDescription(description: string | undefined, site?: Site): string {
  return (
    description?.trim() ||
    site?.seo?.description?.trim() ||
    tiptapToText(site?.business?.description) ||
    'Generated site using Web Builder'
  )
}

function resolveOgImageUrl(ogImageUrl: string | undefined, site?: Site): string | undefined {
  const url = ogImageUrl?.trim() || site?.seo?.ogImageUrl?.trim()
  if (!url) return undefined
  return toHttpsExceptLocal(url.startsWith('http') ? url : buildCanonicalUrl(url))
}

export function generateMetadata(seoData: SEOData, site?: Site, canonicalPath?: string): Metadata {
  const { title, description, keywords, ogImageUrl, noIndex } = seoData
  const finalTitle = resolveTitle(title, site)
  const finalDescription = resolveDescription(description, site)
  const keywordList = normalizeKeywords(keywords) ?? normalizeKeywords(site?.seo?.keywords)
  const imageUrl = resolveOgImageUrl(ogImageUrl, site)
  const canonical = canonicalPath ? buildCanonicalUrl(canonicalPath) : undefined

  const metadata: Metadata = {
    title: finalTitle,
    description: finalDescription,
    keywords: keywordList?.join(', '),
    ...(canonical && { alternates: { canonical } }),
  }

  metadata.openGraph = {
    title: finalTitle,
    description: finalDescription,
    type: 'website',
    ...(canonical && { url: canonical }),
    ...(imageUrl && {
      images: [{ url: imageUrl, width: 1200, height: 630, alt: finalTitle }],
    }),
  }

  metadata.twitter = {
    card: imageUrl ? 'summary_large_image' : 'summary',
    title: finalTitle,
    description: finalDescription,
    ...(imageUrl && { images: [imageUrl] }),
  }

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    }
  }

  return metadata
}

export function getPageSeoData(page: Page | ServiceAreaPage): SEOData {
  return normalizeRawSeo(page.seo as Record<string, unknown> | undefined)
}

export function mergePageSeoWithSite(page: Page | ServiceAreaPage, site: Site): SEOData {
  const pageSeo = getPageSeoData(page)
  return {
    title: pageSeo.title || site.seo?.title,
    description: pageSeo.description || site.seo?.description,
    keywords: pageSeo.keywords?.length ? pageSeo.keywords : site.seo?.keywords,
    ogImageUrl: pageSeo.ogImageUrl || site.seo?.ogImageUrl,
    noIndex: pageSeo.noIndex ?? false,
  }
}

export function getServiceSeoData(service: Service): SEOData {
  const seo = normalizeRawSeo(service.seo as Record<string, unknown> | undefined)
  return {
    title: seo.title || service.name,
    description: seo.description,
    keywords: seo.keywords,
    ogImageUrl: seo.ogImageUrl,
    noIndex: seo.noIndex,
  }
}

export function getBlogPostSeoData(blogPost: BlogPost): SEOData {
  const seo = normalizeRawSeo(blogPost.seo as Record<string, unknown> | undefined)
  return {
    title: seo.title || blogPost.title,
    description: seo.description || tiptapToText(blogPost.excerpt),
    keywords: seo.keywords,
    ogImageUrl: seo.ogImageUrl || blogPost.featuredImage?.url,
    noIndex: seo.noIndex,
  }
}

export function getSiteSeoData(site: Site): SEOData {
  return normalizeRawSeo(site.seo as Record<string, unknown> | undefined)
}

export function resolveSiteIcons(site: Site): Metadata['icons'] | undefined {
  return resolveSiteFaviconIcons(site)
}

export function buildSiteMetadata(site: Site): Metadata {
  const icons = resolveSiteIcons(site)
  const metadataBase = (() => {
    try {
      return new URL(resolveSiteBaseUrl())
    } catch {
      return undefined
    }
  })()

  return {
    ...(metadataBase ? { metadataBase } : {}),
    ...generateMetadata(getSiteSeoData(site), site),
    ...(icons ? { icons } : {}),
    verification: {
      google: '6iY7eJcwvueNUp21uCb2DKc46VO7UFOdxSmldLtwFKs',
    },
  }
}
