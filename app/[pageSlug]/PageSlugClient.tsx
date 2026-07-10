'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { FAQSection } from '@/app/components/sections/FAQSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { WhyChooseUsSection } from '@/app/components/sections/WhyChooseUsSection';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';
import { CTA2Section } from '@/app/components/sections/CTA2Section';
import { CTA3Section } from '@/app/components/sections/CTA3Section';
import { GallerySection } from '@/app/components/sections/GallerySection';
import { ContactSection } from '@/app/components/sections/ContactSection';
import { BlogSection } from '@/app/components/sections/BlogSection';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';
import api from '@/app/lib/fetch-api';
import { Page, ServiceAreaPage } from '@/app/lib/types';

interface PageSlugClientProps {
  pageSlug: string;
}

export default function PageSlugClient({ pageSlug: pageSlugProp }: PageSlugClientProps) {
  const params = useParams();
  const pageSlug = params.pageSlug as string || pageSlugProp;
  const { pages, currentPage, setCurrentPage, loading, site } = useWebBuilder();
  const themeColors = useThemeColors();
  const [serviceAreaPage, setServiceAreaPage] = useState<ServiceAreaPage | null>(null);
  const [serviceAreaLoading, setServiceAreaLoading] = useState(false);
  const hasAttemptedLoad = useRef(false);

  // Load service area page
  const loadServiceAreaPage = useCallback(async () => {
    if (!site || hasAttemptedLoad.current) return;

    hasAttemptedLoad.current = true;
    setServiceAreaLoading(true);

    try {
      const response = await api.get(`/public/sites/${site.slug}/service-areas/${pageSlug}`);
      if (response.success) {
        setServiceAreaPage(response.data);
      } else {
        setServiceAreaPage(null);
      }
    } catch {
      setServiceAreaPage(null);
    } finally {
      setServiceAreaLoading(false);
    }
  }, [site, pageSlug]);

  useEffect(() => {
    if (loading || pages.length === 0) return;

    const foundPage = pages.find(page => page.slug === pageSlug);
    if (foundPage) {
      setCurrentPage(foundPage);
      setServiceAreaPage(null);
    } else {
      setCurrentPage(null);
      if (!hasAttemptedLoad.current) {
        loadServiceAreaPage();
      }
    }
  }, [pageSlug, pages, loading, setCurrentPage, loadServiceAreaPage]);

  const displayPage = currentPage || serviceAreaPage;

  // No spinner — wait silently while builder / service-area data loads.
  if ((loading || serviceAreaLoading) && !displayPage) {
    return null;
  }

  if (!displayPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: themeColors.pageBackground }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.lightPrimaryText }}>Page Not Found</h2>
        <p style={{ color: themeColors.lightSecondaryText }}>The page &quot;{pageSlug}&quot; could not be found.</p>
        <Link href="/" className="mt-8 hover:underline" style={{ color: themeColors.primaryButton }}>Return Home</Link>
      </div>
    );
  }

  const page: Page | null = currentPage;
  const pageType = page?.pageType;
  const showServingAreas =
    page?.servingAreasSection?.enabled !== false &&
    (page?.servingAreasSection != null || pageType === 'home');

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.pageBackground }}>
      <main>
        {pageType === 'home' && (
          <>
            <HeroSection hero={page?.hero} />
            <AboutSection aboutSection={page?.aboutSection} />
            <ServicesSection servicesSection={page?.servicesSection} />
            <GallerySection gallerySection={page?.gallerySection} />
            <TestimonialsSection testimonialsSection={page?.testimonialsSection} />
            <FAQSection faqSection={page?.faqSection} />
            <ContactSection contactSection={page?.contactSection} />
            <BlogSection blogSection={page?.blogSection} />
            <CTASection ctaSection={page?.ctaSection} />
            <WhyChooseUsSection whyChooseUsSection={page?.whyChooseUsSection} />
            <CompanyDetailSection companyDetailSection={page?.companyDetailSection} />
            <ProjectsSection
              projectSection={page?.projectSection}
              projectsSection={page?.projectsSection}
            />
            <CTA2Section cta2Section={page?.cta2Section} />
            <CTA3Section cta3Section={page?.cta3Section} />
          </>
        )}

        {pageType === 'about' && (
          <>
            <HeroSection hero={page?.hero} />
            <AboutSection aboutSection={page?.aboutSection} />
            <WhyChooseUsSection whyChooseUsSection={page?.whyChooseUsSection} />
            <CompanyDetailSection companyDetailSection={page?.companyDetailSection} />
            <CTA2Section cta2Section={page?.cta2Section} />
          </>
        )}

        {pageType === 'contact' && (
          <>
            <HeroSection hero={page?.hero} />
            <ContactSection contactSection={page?.contactSection} />
          </>
        )}

        {pageType === 'service-list' && (
          <>
            <HeroSection hero={page?.hero} />
            <ServicesSection servicesSection={page?.servicesSection} />
          </>
        )}

        {pageType === 'blog-list' && (
          <>
            <HeroSection hero={page?.hero} />
            <BlogSection blogSection={page?.blogSection} />
          </>
        )}

        {pageType === 'project-detail' && (
          <HeroSection hero={page?.hero} />
        )}

        {page?.slug === 'testimonials' && (
          <>
            <HeroSection hero={page?.hero} />
            <TestimonialsSection testimonialsSection={page?.testimonialsSection} />
          </>
        )}

        {showServingAreas && (
          <ServingAreasSection
            servingAreasSection={page?.servingAreasSection ?? { enabled: true }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
