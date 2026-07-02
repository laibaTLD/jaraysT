import type { Metadata } from 'next';
import type { BlogPost, Page, Project, Service, ServiceAreaPage, Site } from '@/app/lib/types';
import { findTestimonialsPage, getPageHref } from '@/app/lib/siteContent';
import { SERVICE_AREA_ROUTE_SEGMENT } from '@/app/lib/serviceAreaSlugs';
import {
  generateMetadata as buildMetadata,
  getBlogPostSeoData,
  getPageSeoData,
  getServiceSeoData,
  getSiteSeoData,
  mergePageSeoWithSite,
} from '@/app/lib/metadata';
import { fetchPublicCollection, fetchPublicSite, resolveApiBaseUrl } from '@/app/lib/webbuilder-server';
import { upstreamFetch } from '@/app/lib/upstream-fetch';

const FALLBACK_METADATA: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
};

async function fetchSiteWithPages(): Promise<{ site: Site; pages: Page[] }> {
  const site = await fetchPublicSite();
  const pages = await fetchPublicCollection<Page>(`/public/sites/${site.slug}/pages`);
  return { site, pages };
}

export async function buildMetadataForPageType(
  pageType: Page['pageType'],
  canonicalPath?: string
): Promise<Metadata> {
  try {
    const { site, pages } = await fetchSiteWithPages();
    const page = pages.find((p) => p.pageType === pageType);
    if (page) {
      return buildMetadata(mergePageSeoWithSite(page, site), site, canonicalPath);
    }
    return buildMetadata(getSiteSeoData(site), site, canonicalPath);
  } catch {
    return FALLBACK_METADATA;
  }
}

export async function buildMetadataForTestimonials(): Promise<Metadata> {
  try {
    const { site, pages } = await fetchSiteWithPages();
    const page = findTestimonialsPage(pages);
    if (page) {
      return buildMetadata(mergePageSeoWithSite(page, site), site, '/testimonials');
    }
    return buildMetadata(getSiteSeoData(site), site, '/testimonials');
  } catch {
    return FALLBACK_METADATA;
  }
}

export async function buildMetadataForPageSlug(pageSlug: string): Promise<Metadata> {
  try {
    const site = await fetchPublicSite();
    const pages = await fetchPublicCollection<Page>(`/public/sites/${site.slug}/pages`);
    const normalized = pageSlug.replace(/^\/+|\/+$/g, '').toLowerCase();
    const page = pages.find(
      (p) =>
        p.slug?.replace(/^\/+|\/+$/g, '').toLowerCase() === normalized ||
        getPageHref(p).replace(/^\/+|\/+$/g, '').toLowerCase() === normalized
    );
    if (page) {
      const path = getPageHref(page);
      return buildMetadata(mergePageSeoWithSite(page, site), site, path);
    }
  } catch {
    /* fall through */
  }
  return { title: 'Page Not Found', description: 'The requested page could not be found.' };
}

export async function buildMetadataForService(serviceSlug: string): Promise<Metadata> {
  try {
    const site = await fetchPublicSite();
    const services = await fetchPublicCollection<Service>(`/public/sites/${site.slug}/services`);
    const service = services.find((s) => s.slug === serviceSlug);
    if (service) {
      return buildMetadata(getServiceSeoData(service), site, `/service/${serviceSlug}`);
    }
  } catch {
    /* fall through */
  }
  return { title: 'Service Not Found', description: 'The requested service could not be found.' };
}

export async function buildMetadataForBlogPost(postSlug: string): Promise<Metadata> {
  try {
    const site = await fetchPublicSite();
    const posts = await fetchPublicCollection<BlogPost>(`/public/sites/${site.slug}/blog`);
    const post = posts.find((p) => p.slug === postSlug);
    if (post) {
      return buildMetadata(getBlogPostSeoData(post), site, `/blog/${postSlug}`);
    }
  } catch {
    /* fall through */
  }
  return { title: 'Blog Post Not Found', description: 'The requested blog post could not be found.' };
}

export async function buildMetadataForProject(projectSlug: string): Promise<Metadata> {
  try {
    const site = await fetchPublicSite();
    const projects = await fetchPublicCollection<Project>(`/public/sites/${site.slug}/projects`);
    const project = projects.find((p) => p.slug === projectSlug);
    if (project) {
      const seo = {
        title: project.seo?.title || project.title,
        description: project.seo?.description,
        keywords: project.seo?.keywords,
        ogImageUrl: project.seo?.ogImageUrl || project.featuredImage?.url,
      };
      return buildMetadata(seo, site, `/project-detail/${projectSlug}`);
    }
  } catch {
    /* fall through */
  }
  return { title: 'Project Not Found', description: 'The requested project could not be found.' };
}

export async function buildMetadataForLegalPage(
  type: 'privacy' | 'terms',
  canonicalPath: string
): Promise<Metadata> {
  try {
    const site = await fetchPublicSite();
    const legal = type === 'privacy' ? site.legal?.privacyPolicy : site.legal?.termsOfService;
    const seo = {
      ...getSiteSeoData(site),
      title: legal?.heading?.trim() || (type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'),
      description: legal?.description?.trim() || site.seo?.description,
    };
    return buildMetadata(seo, site, canonicalPath);
  } catch {
    return FALLBACK_METADATA;
  }
}

export async function buildMetadataForServiceArea(
  serviceSlug: string,
  areaSlug: string
): Promise<Metadata> {
  const canonicalPath = `/service/${serviceSlug}/${SERVICE_AREA_ROUTE_SEGMENT}/${areaSlug}`;

  try {
    const site = await fetchPublicSite();
    const response = await upstreamFetch(
      `${resolveApiBaseUrl()}/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${areaSlug}`,
      { cache: 'no-store', next: { revalidate: 0 } }
    );
    if (!response.ok) throw new Error(`Service area fetch failed (${response.status})`);

    const payload = await response.json();
    const areaPage = (payload?.data ?? payload) as ServiceAreaPage;
    if (areaPage && typeof areaPage === 'object' && areaPage._id) {
      return buildMetadata(mergePageSeoWithSite(areaPage, site), site, canonicalPath);
    }
  } catch {
    /* fall through */
  }

  const areaName = areaSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    title: `${areaName} - Construction Services`,
    description: `Professional construction and renovation services in ${areaName}. Contact us for all your building needs.`,
  };
}

export { getPageSeoData };
