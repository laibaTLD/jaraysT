'use client';

import { useParams } from 'next/navigation';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { ServiceDetail } from '@/app/components/sections/ServiceDetail';
import { Footer } from '@/app/components/layout/Footer';
import { normalizeSlug, resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import Link from 'next/link';

interface ServiceClientProps {
  serviceSlug: string;
}

export default function ServiceClient({ serviceSlug: serviceSlugProp }: ServiceClientProps) {
  const params = useParams();
  const serviceSlug = params.serviceSlug as string || serviceSlugProp;
  
  const { site, services, loading, error } = useWebBuilder();
  
  const normSlug = normalizeSlug(serviceSlug);
  const service = services.find((s) => resolveServiceSlug(s) === normSlug);

  if (loading && !service) {
    return null;
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-4">The service "{serviceSlug}" could not be found.</p>
          <Link href="/" className="inline-block text-blue-600 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ServiceDetail service={service} allServices={services} />
      <Footer />
    </div>
  );
}
