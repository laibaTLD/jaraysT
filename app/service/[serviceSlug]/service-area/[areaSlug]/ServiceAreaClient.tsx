'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Footer } from '@/app/components/layout/Footer';
import { ServingAreasdetailSection } from '@/app/components/sections/ServingAreasdetailSection';
import api from '@/app/lib/fetch-api';

interface ServiceAreaClientProps {
  serviceSlug: string;
  areaSlug: string;
}

export default function ServiceAreaClient({
  serviceSlug: serviceSlugProp,
  areaSlug: areaSlugProp,
}: ServiceAreaClientProps) {
  const params = useParams();
  const serviceSlug = (params.serviceSlug as string) || serviceSlugProp;
  const areaSlug = (params.areaSlug as string) || areaSlugProp;

  const { site } = useWebBuilder();
  const [serviceAreaPage, setServiceAreaPage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const areaName = areaSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  useEffect(() => {
    const fetchServiceAreaPage = async () => {
      if (!site) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          `/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${areaSlug}`
        );

        if (response.success) {
          setServiceAreaPage(response.data);
        } else {
          setServiceAreaPage(createFallbackData(areaName, serviceSlug));
        }
      } catch (err: unknown) {
        const status =
          err && typeof err === 'object' && 'status' in err
            ? (err as { status?: number }).status
            : undefined;
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: unknown }).message)
            : '';

        if (status === 404 || message.includes('404')) {
          setServiceAreaPage(createFallbackData(areaName, serviceSlug));
        } else {
          setError('Failed to load service area page');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAreaPage();
  }, [site, serviceSlug, areaSlug, areaName]);

  if (loading && !serviceAreaPage) {
    return null;
  }

  if (error || !serviceAreaPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Area Not Found</h2>
          <p className="text-gray-600 mb-4">The service area page could not be found.</p>
          <a href="/" className="inline-block text-blue-600 hover:underline">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main>
        <ServingAreasdetailSection
          data={{
            hero: serviceAreaPage.hero,
            highlights: serviceAreaPage.highlights,
            about: serviceAreaPage.about,
            ourServices: serviceAreaPage.ourServices,
            pageServiceId:
              typeof serviceAreaPage.serviceId === 'string'
                ? serviceAreaPage.serviceId
                : (serviceAreaPage.serviceId as { _id?: string })?._id,
            cta: serviceAreaPage.cta,
            serviceDetails: serviceAreaPage.serviceDetails,
            serviceOverview: serviceAreaPage.serviceOverview,
            whyChooseUs: serviceAreaPage.whyChooseUs,
            faqs: serviceAreaPage.faqs,
            servingAreas: serviceAreaPage.servingAreas,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}

function createFallbackData(areaName: string, serviceSlug: string) {
  return {
    hero: {
      enabled: true,
      title: areaName,
      description: `Professional construction and renovation services in ${areaName}. Our team delivers exceptional quality and craftsmanship for residential and commercial projects.`,
      primaryCta: {
        label: 'Get Started',
        href: '/contact',
      },
      mediaItems: [
        {
          type: 'image',
          url: 'https://picsum.photos/seed/construction1/800/600.jpg',
          altText: 'Construction project 1',
        },
        {
          type: 'image',
          url: 'https://picsum.photos/seed/construction2/400/500.jpg',
          altText: 'Construction project 2',
        },
        {
          type: 'image',
          url: 'https://picsum.photos/seed/construction3/400/500.jpg',
          altText: 'Construction project 3',
        },
      ],
    },
    about: {
      title: `Serving ${areaName} with Excellence`,
      description: `With years of experience serving the ${areaName} community, we've built a reputation for delivering exceptional construction and renovation services. Our team understands the unique needs of local homeowners and businesses, providing tailored solutions that exceed expectations.`,
      image: {
        url: 'https://picsum.photos/seed/about/600/600.jpg',
        altText: `Our work in ${areaName}`,
      },
    },
    serviceOverview: {
      title: `Our ${areaName} Service Overview`,
      description: `Discover how our comprehensive construction services can transform your property in ${areaName}.`,
      services: [
        { name: 'Residential Construction', description: 'Custom homes and renovations', icon: 'home' },
        { name: 'Commercial Projects', description: 'Business construction and remodeling', icon: 'building' },
        { name: 'Outdoor Living', description: 'Decks, patios, and landscaping', icon: 'trees' },
      ],
    },
    serviceDetails: {
      title: `Comprehensive Services in ${areaName}`,
      description: `We offer a full range of construction services designed to meet the diverse needs of ${areaName} residents and businesses.`,
      features: [
        {
          title: 'Custom Construction',
          shortDescription: 'Bespoke building solutions',
          icon: 'zap',
          fullDescription:
            'Fully customized construction projects tailored to your specific requirements and vision.',
        },
        {
          title: 'Renovation & Remodeling',
          shortDescription: 'Transform existing spaces',
          icon: 'trending',
          fullDescription: 'Complete renovation services that breathe new life into your property.',
        },
        {
          title: 'Quality Assurance',
          shortDescription: 'Guaranteed craftsmanship',
          icon: 'shield',
          fullDescription: 'Every project is backed by our quality guarantee and industry best practices.',
        },
      ],
      process: [
        { title: 'Consultation', description: 'We begin with a thorough consultation to understand your needs and vision.' },
        { title: 'Planning & Design', description: 'Our team creates detailed plans and designs that align with your goals.' },
        { title: 'Construction', description: 'Expert craftsmen bring your project to life with attention to detail.' },
        { title: 'Final Review', description: 'We ensure every aspect meets our high standards before completion.' },
      ],
      benefits: [
        {
          title: 'Local Expertise',
          description: `Years of experience working specifically in ${areaName} and surrounding areas.`,
          icon: 'zap',
        },
        { title: 'Timely Completion', description: 'Projects completed on schedule with minimal disruption.', icon: 'trending' },
        { title: 'Competitive Pricing', description: 'Transparent pricing with no hidden costs.', icon: 'shield' },
        { title: 'Satisfaction Guaranteed', description: 'We stand behind our work with comprehensive warranties.', icon: 'check' },
      ],
    },
    highlights: {
      title: `${areaName} Project Highlights`,
      subtitle: "Recent projects we're proud of",
      projects: [
        {
          title: 'Modern Kitchen Remodel',
          description: `Complete kitchen transformation in downtown ${areaName}`,
          image: { url: 'https://picsum.photos/seed/kitchen/400/300.jpg', altText: 'Kitchen remodel project' },
        },
        {
          title: 'Custom Home Build',
          description: `New construction project in ${areaName} suburbs`,
          image: { url: 'https://picsum.photos/seed/home/400/300.jpg', altText: 'Custom home project' },
        },
        {
          title: 'Office Renovation',
          description: `Commercial space makeover in ${areaName} business district`,
          image: { url: 'https://picsum.photos/seed/office/400/300.jpg', altText: 'Office renovation project' },
        },
      ],
    },
    ourServices: {
      label: 'Available Services',
      title: `All Services Available in ${areaName}`,
      description: `Professional construction services tailored for ${areaName} residents`,
      items: [
        {
          title: 'New Construction',
          description:
            'Complete build services from ground up with custom designs and quality craftsmanship',
          features: ['Custom Design', 'Quality Materials', 'Project Management'],
          image: 'https://picsum.photos/seed/construction-new/400/300.jpg',
          ctaButton: { text: 'Learn More', url: '/services/new-construction' },
        },
        {
          title: 'Renovations',
          description: 'Transform your existing space with expert remodeling and modern updates',
          features: ['Space Planning', 'Modern Finishes', 'Minimal Disruption'],
          image: 'https://picsum.photos/seed/construction-reno/400/300.jpg',
          ctaButton: { text: 'Learn More', url: '/services/renovations' },
        },
        {
          title: 'Additions',
          description: 'Expand your living space with seamless home additions and extensions',
          features: ['Seamless Integration', 'Permit Handling', 'Structural Integrity'],
          image: 'https://picsum.photos/seed/construction-add/400/300.jpg',
          ctaButton: { text: 'Learn More', url: '/services/additions' },
        },
      ],
    },
    servingAreas: {
      title: 'Service Areas',
      description: 'We proudly serve multiple areas in the region',
      serviceSlug,
    },
    whyChooseUs: {
      title: `Why Choose Us for ${areaName} Projects?`,
      reasons: [
        {
          title: 'Local Experience',
          description: `Years of experience working specifically in ${areaName} and surrounding areas.`,
        },
        { title: 'Quality Materials', description: 'We use only the finest materials to ensure lasting results.' },
        { title: 'Expert Team', description: 'Our skilled craftsmen bring decades of combined experience.' },
        { title: 'Customer Focus', description: 'Your satisfaction is our top priority throughout every project.' },
      ],
    },
    faqs: {
      title: `Frequently Asked Questions about ${areaName} Services`,
      description: 'Find answers to common questions about our construction services in your area.',
      items: [
        {
          question: `Do you handle permits for ${areaName} construction projects?`,
          answer: 'Yes, we manage all necessary permits and ensure compliance with local building codes.',
        },
        {
          question: `How long does a typical renovation project in ${areaName} take?`,
          answer: 'Project timelines vary depending on scope, but most renovations are completed within 3-6 months.',
        },
        {
          question: `Do you serve all neighborhoods in ${areaName}?`,
          answer: `Yes, we provide services throughout ${areaName} and surrounding communities.`,
        },
      ],
    },
    cta: {
      enabled: true,
      title: `Ready to Start Your ${areaName} Project?`,
      description: 'Contact us today for a free consultation and estimate.',
      label: 'Get Your Free Quote',
      ctaButton: {
        text: 'Contact Us Now',
        url: '/contact',
      },
      backgroundImage: 'https://picsum.photos/seed/cta/1920/1080.jpg',
    },
  };
}
