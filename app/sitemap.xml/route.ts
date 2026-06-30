import { NextResponse } from 'next/server';
import type { BlogPost, Page, Service } from '@/app/lib/types';
import {
  BUILDER_NO_CACHE_HEADERS,
  fetchPublicCollection,
  fetchPublicSite,
  resolveSiteBaseUrl,
  resolveSitemapXml,
} from '@/app/lib/webbuilder-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = resolveSiteBaseUrl();

  try {
    const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
    if (!siteSlug) {
      throw new Error('Site slug not configured');
    }

    const site = await fetchPublicSite(siteSlug);
    const [pages, services, blogPosts] = await Promise.all([
      fetchPublicCollection<Page>(`/public/sites/${siteSlug}/pages`),
      fetchPublicCollection<Service>(`/public/sites/${siteSlug}/services`),
      fetchPublicCollection<BlogPost>(`/public/sites/${siteSlug}/blog`).catch(() => [] as BlogPost[]),
    ]);

    const sitemapXml = resolveSitemapXml(site, baseUrl, pages, services, blogPosts);

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        ...BUILDER_NO_CACHE_HEADERS,
      },
    });
  } catch (error) {
    console.error('Error generating sitemap.xml:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
          ...BUILDER_NO_CACHE_HEADERS,
        },
      }
    );
  }
}
