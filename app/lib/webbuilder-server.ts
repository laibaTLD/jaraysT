import type { BlogPost, Page, Project, Service, Site } from '@/app/lib/types';
import { getPageHref, isPublishedPage } from '@/app/lib/siteContent';
import { resolveUpstreamApiOrigin, upstreamFetch } from '@/app/lib/upstream-fetch';

export const BUILDER_NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

export function resolveApiBaseUrl(): string {
  return resolveUpstreamApiOrigin();
}

export function resolveSiteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '');
  }

  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export { resolveSchemaDocuments, buildDefaultSchemaDocuments } from '@/app/lib/builderSchema';

function unwrapApiPayload<T>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') return payload as T;
  const record = payload as { data?: unknown };
  if (record.data && typeof record.data === 'object' && 'data' in (record.data as object)) {
    return (record.data as { data: T }).data;
  }
  return (record.data ?? payload) as T;
}

export async function fetchPublicSite(siteSlug?: string): Promise<Site> {
  const slug = siteSlug || process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
  if (!slug) {
    throw new Error('Site slug not configured');
  }

  const response = await upstreamFetch(`${resolveApiBaseUrl()}/public/sites/${slug}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch site (${response.status})`);
  }

  const payload = await response.json();
  return unwrapApiPayload<Site>(payload);
}

export type WebBuilderBootstrap = {
  site: Site;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  serviceAreaPages: unknown[];
};

/** Server-side bootstrap so first paint has site + pages (no client loading blank). */
export async function fetchWebBuilderBootstrap(
  siteSlug?: string
): Promise<WebBuilderBootstrap | null> {
  const slug = siteSlug || process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
  if (!slug) return null;

  try {
    const site = await fetchPublicSite(slug);
    const sitePath = `/public/sites/${site.slug}`;

    const [pages, services, blogPosts, projects, serviceAreaPages] = await Promise.all([
      fetchPublicCollection<Page>(`${sitePath}/pages`),
      fetchPublicCollection<Service>(`${sitePath}/services`),
      fetchPublicCollection<BlogPost>(`${sitePath}/blog`),
      fetchPublicCollection<Project>(`${sitePath}/projects`),
      fetchPublicCollection<unknown>(`${sitePath}/service-area-pages`),
    ]);

    return {
      site,
      pages,
      services,
      blogPosts,
      projects,
      serviceAreaPages,
    };
  } catch (err) {
    console.warn(
      '[fetchWebBuilderBootstrap]',
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export async function fetchPublicCollection<T>(path: string): Promise<T[]> {
  const response = await upstreamFetch(`${resolveApiBaseUrl()}${path}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!response.ok) return [];

  const payload = await response.json();
  const data = unwrapApiPayload<T[]>(payload);
  return Array.isArray(data) ? data : [];
}

export function resolveRobotsTxt(site: Site, baseUrl: string): string {
  const defaultRobots = `User-agent: *
Disallow:
Sitemap: ${baseUrl}/sitemap.xml`;

  const custom = site.files?.robotsTxt?.trim();
  if (!custom) return defaultRobots;

  return custom
    .replace(/Sitemap:\s*\/?sitemap\.xml/gi, `Sitemap: ${baseUrl}/sitemap.xml`)
    .replace(/Sitemap:\s*(https?:\/\/[^\s/]+)\/sitemap\.xml/gi, `Sitemap: ${baseUrl}/sitemap.xml`);
}

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

function formatLastMod(value?: string): string {
  if (!value) return new Date().toISOString().split('T')[0];
  return new Date(value).toISOString().split('T')[0];
}

export function buildGeneratedSitemapXml(
  site: Site,
  baseUrl: string,
  pages: Page[],
  services: Service[],
  blogPosts: BlogPost[]
): string {
  const entries: SitemapEntry[] = [
    {
      loc: baseUrl,
      lastmod: formatLastMod(site.updatedAt),
      changefreq: 'weekly',
      priority: '1.0',
    },
  ];

  const seenLocs = new Set<string>([baseUrl]);

  for (const page of pages) {
    if (!isPublishedPage(page)) continue;
    const href = getPageHref(page);
    const loc = href === '/' ? baseUrl : `${baseUrl}${href}`;
    if (seenLocs.has(loc)) continue;
    seenLocs.add(loc);
    entries.push({
      loc,
      lastmod: formatLastMod(page.updatedAt),
      changefreq: page.pageType === 'home' ? 'weekly' : 'monthly',
      priority: page.pageType === 'home' ? '1.0' : '0.8',
    });
  }

  for (const service of services) {
    if (service.status !== 'published' || !service.slug) continue;
    const loc = `${baseUrl}/service/${service.slug}`;
    if (seenLocs.has(loc)) continue;
    seenLocs.add(loc);
    entries.push({
      loc,
      lastmod: formatLastMod(service.updatedAt),
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  for (const post of blogPosts) {
    if (post.status !== 'published' || !post.slug) continue;
    const loc = `${baseUrl}/blog/${post.slug}`;
    if (seenLocs.has(loc)) continue;
    seenLocs.add(loc);
    entries.push({
      loc,
      lastmod: formatLastMod(post.updatedAt),
      changefreq: 'weekly',
      priority: '0.6',
    });
  }

  if (site.legal?.termsOfService) {
    entries.push({
      loc: `${baseUrl}/terms-of-service`,
      lastmod: formatLastMod(site.updatedAt),
      changefreq: 'monthly',
      priority: '0.5',
    });
  }

  if (site.legal?.privacyPolicy) {
    entries.push({
      loc: `${baseUrl}/privacy-policy`,
      lastmod: formatLastMod(site.updatedAt),
      changefreq: 'monthly',
      priority: '0.5',
    });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

function normalizeCustomSitemapXml(raw: string, baseUrl: string): string {
  let xml = raw.trim();
  if (!xml) return xml;

  xml = xml.replace(/<loc>\s*\//g, `<loc>${baseUrl}/`);
  xml = xml.replace(/<loc>(?!https?:\/\/)([^<]+)/g, (_, path: string) => {
    const trimmed = path.trim();
    if (trimmed.startsWith('http')) return `<loc>${trimmed}`;
    return `<loc>${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
  });

  if (!xml.includes('<urlset')) {
    if (xml.includes('<url>')) {
      xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>`;
    }
  }

  if (!xml.startsWith('<?xml')) {
    xml = `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
  }

  return xml;
}

/** Builder custom sitemap fully replaces auto-generated sitemap when present. */
export function resolveSitemapXml(
  site: Site,
  baseUrl: string,
  pages: Parameters<typeof buildGeneratedSitemapXml>[2],
  services: Parameters<typeof buildGeneratedSitemapXml>[3],
  blogPosts: Parameters<typeof buildGeneratedSitemapXml>[4]
): string {
  const custom = site.files?.sitemap?.trim();
  if (custom) {
    return normalizeCustomSitemapXml(custom, baseUrl);
  }

  return buildGeneratedSitemapXml(site, baseUrl, pages, services, blogPosts);
}
