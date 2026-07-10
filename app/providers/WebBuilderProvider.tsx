'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Site, Page, Service, BlogPost, Project } from '@/app/lib/types';
import { siteApi, pageApi, serviceApi, blogApi, projectApi, testimonialApi, serviceAreaApi } from '@/app/lib/api';

const SITE_SLUG = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;

export type WebBuilderInitialData = {
  site: Site;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  serviceAreaPages: unknown[];
};

function readPollIntervalMs(envKey: string, defaultMs: number): number {
  const raw = process.env[envKey];
  if (raw === undefined || raw === '') return defaultMs;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : defaultMs;
}

const isProdBuild = process.env.NODE_ENV === 'production';

const SITE_POLL_INTERVAL_MS = readPollIntervalMs(
  'NEXT_PUBLIC_WEBBUILDER_SITE_POLL_INTERVAL_MS',
  isProdBuild ? 60_000 : 15_000
);

const CONTENT_POLL_INTERVAL_MS = readPollIntervalMs(
  'NEXT_PUBLIC_WEBBUILDER_CONTENT_POLL_INTERVAL_MS',
  isProdBuild ? 0 : 60_000
);

interface WebBuilderContextType {
  site: Site | null;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  testimonials: { title?: string; description?: string; testimonials: any[] } | null;
  serviceAreaPages: any[];
  currentPage: Page | null;
  setCurrentPage: (page: Page | null) => void;
  loading: boolean;
  error: string | null;
  loadPage: (siteSlug: string, pageSlug: string) => Promise<void>;
}

const WebBuilderContext = createContext<WebBuilderContextType | undefined>(undefined);

export const useWebBuilder = () => {
  const context = useContext(WebBuilderContext);
  if (context === undefined) {
    throw new Error('useWebBuilder must be used within a WebBuilderProvider');
  }
  return context;
};

interface WebBuilderProviderProps {
  children: ReactNode;
  initialData?: WebBuilderInitialData | null;
}

export const WebBuilderProvider: React.FC<WebBuilderProviderProps> = ({
  children,
  initialData = null,
}) => {
  const hasBootstrap = Boolean(initialData?.site);

  const [site, setSite] = useState<Site | null>(initialData?.site ?? null);
  const [pages, setPages] = useState<Page[]>(initialData?.pages ?? []);
  const [services, setServices] = useState<Service[]>(initialData?.services ?? []);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialData?.blogPosts ?? []);
  const [projects, setProjects] = useState<Project[]>(initialData?.projects ?? []);
  const [testimonials, setTestimonials] = useState<{
    title?: string;
    description?: string;
    testimonials: any[];
  } | null>(null);
  const [serviceAreaPages, setServiceAreaPages] = useState<any[]>(
    initialData?.serviceAreaPages ?? []
  );
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  // SSR bootstrap means first paint already has data — never block on a loading screen.
  const [loading, setLoading] = useState(!hasBootstrap);
  const [error, setError] = useState<string | null>(null);

  const loadPages = async (siteSlug: string) => {
    try {
      const pagesData = await pageApi.getPagesBySite(siteSlug);
      setPages(pagesData);
    } catch (err) {
      console.warn('Failed to load pages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadServicesBySiteSlug = async (siteSlug: string) => {
    try {
      const servicesData = await serviceApi.getServicesBySite(siteSlug);
      setServices(servicesData);
    } catch (err) {
      console.warn('Failed to load services:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadBlogPosts = async (siteSlug: string, limit?: number) => {
    try {
      const postsData = await blogApi.getPostsBySite(siteSlug, limit);
      setBlogPosts(postsData);
    } catch (err) {
      console.warn('Failed to load blog posts:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadProjects = async (siteSlug: string, limit?: number) => {
    try {
      const projectsData = await projectApi.getProjectsBySite(siteSlug, limit);
      setProjects(projectsData);
    } catch (err) {
      console.warn('Failed to load projects:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadTestimonials = async (siteSlug: string) => {
    try {
      const testimonialsData = await testimonialApi.getTestimonialsBySite(siteSlug);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.warn(
        '[WebBuilderProvider] Failed to load testimonials:',
        err instanceof Error ? err.message : err
      );
    }
  };

  const loadServiceAreaPages = async (siteSlug: string) => {
    try {
      const serviceAreaPagesData = await serviceAreaApi.getServiceAreaPagesBySite(siteSlug);
      setServiceAreaPages(serviceAreaPagesData);
    } catch (err) {
      console.warn('Failed to load service area pages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  /** Full load used only when SSR bootstrap is missing. */
  const loadSite = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const siteData = await siteApi.getSiteBySlug(slug);
      setSite(siteData);

      await loadPages(siteData.slug);
      setLoading(false);

      void Promise.all([
        loadServicesBySiteSlug(siteData.slug),
        loadBlogPosts(siteData.slug),
        loadProjects(siteData.slug),
        loadTestimonials(siteData.slug),
        loadServiceAreaPages(siteData.slug),
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load site';
      setError(
        msg.includes('500')
          ? 'The site builder API is temporarily unavailable. Refresh the page or try again shortly.'
          : msg
      );
      setLoading(false);
    }
  };

  /** Background refresh — never toggles loading (keeps UI painted). */
  const refreshInBackground = async (slug: string) => {
    try {
      const siteData = await siteApi.getSiteBySlug(slug, { silent: true });
      setSite(siteData);
      void Promise.all([
        loadPages(siteData.slug),
        loadServicesBySiteSlug(siteData.slug),
        loadBlogPosts(siteData.slug),
        loadProjects(siteData.slug),
        loadTestimonials(siteData.slug),
        loadServiceAreaPages(siteData.slug),
      ]);
    } catch {
      /* ignore background refresh errors */
    }
  };

  const loadPage = async (siteSlug: string, pageSlug: string) => {
    try {
      setError(null);
      const pageData = await pageApi.getPageBySlug(siteSlug, pageSlug);
      setCurrentPage(pageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    }
  };

  useEffect(() => {
    if (!SITE_SLUG) {
      setError(
        'NEXT_PUBLIC_WEBBUILDER_SITE_SLUG environment variable is not defined. Please check your .env file.'
      );
      setLoading(false);
      return;
    }

    if (hasBootstrap) {
      // Soft refresh only — content already painted from SSR.
      void refreshInBackground(SITE_SLUG);
      return;
    }

    void loadSite(SITE_SLUG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!site?.slug || SITE_POLL_INTERVAL_MS <= 0) return;

    const siteFingerprint = (s: Site) =>
      JSON.stringify({
        theme: s.theme,
        serviceAreas: s.serviceAreas,
        business: s.business,
        footer: s.footer,
        socialLinks: s.socialLinks,
        legal: s.legal,
        files: s.files,
        seo: s.seo,
        updatedAt: s.updatedAt,
      });

    const intervalId = setInterval(async () => {
      try {
        const siteData = await siteApi.getSiteBySlug(site.slug, { silent: true });
        setSite((prevSite) => {
          if (!prevSite) return siteData;
          return siteFingerprint(prevSite) !== siteFingerprint(siteData) ? siteData : prevSite;
        });
      } catch {
        /* ignore polling errors */
      }
    }, SITE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const projectsData = await projectApi.getProjectsBySite(site.slug, undefined, {
          silent: true,
        });
        setProjects((prevProjects) =>
          JSON.stringify(prevProjects) !== JSON.stringify(projectsData)
            ? projectsData
            : prevProjects
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const pagesData = await pageApi.getPagesBySite(site.slug, { silent: true });
        setPages((prevPages) =>
          JSON.stringify(prevPages) !== JSON.stringify(pagesData) ? pagesData : prevPages
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const servicesData = await serviceApi.getServicesBySite(site.slug, { silent: true });
        setServices((prevServices) =>
          JSON.stringify(prevServices) !== JSON.stringify(servicesData)
            ? servicesData
            : prevServices
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  useEffect(() => {
    if (!site?.slug || CONTENT_POLL_INTERVAL_MS <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const data = await serviceAreaApi.getServiceAreaPagesBySite(site.slug, { silent: true });
        setServiceAreaPages((prev) =>
          JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
        );
      } catch {
        /* ignore */
      }
    }, CONTENT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  const contextValue: WebBuilderContextType = {
    site,
    pages,
    services,
    blogPosts,
    projects,
    testimonials,
    serviceAreaPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    loadPage,
  };

  return (
    <WebBuilderContext.Provider value={contextValue}>{children}</WebBuilderContext.Provider>
  );
};
