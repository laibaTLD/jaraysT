import type { Metadata } from 'next';
import { buildMetadataForServiceArea } from '@/app/lib/pageMetadata';
import ServiceAreaClient from './ServiceAreaClient';

interface ServiceAreaPageProps {
  params: Promise<{ serviceSlug: string; citySlug: string }>;
}

export async function generateMetadata({ params }: ServiceAreaPageProps): Promise<Metadata> {
  const { serviceSlug, citySlug } = await params;
  return buildMetadataForServiceArea(serviceSlug, citySlug);
}

export default async function ServiceAreaPage({ params }: ServiceAreaPageProps) {
  const { serviceSlug, citySlug } = await params;
  return <ServiceAreaClient serviceSlug={serviceSlug} citySlug={citySlug} />;
}
