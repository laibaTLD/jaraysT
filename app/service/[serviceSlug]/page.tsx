import type { Metadata } from 'next';
import { buildMetadataForService } from '@/app/lib/pageMetadata';
import ServiceClient from './ServiceClient';

interface ServicePageProps {
  params: Promise<{ serviceSlug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  return buildMetadataForService(serviceSlug);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { serviceSlug } = await params;
  return <ServiceClient serviceSlug={serviceSlug} />;
}
