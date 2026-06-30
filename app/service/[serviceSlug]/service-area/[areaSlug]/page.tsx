import type { Metadata } from 'next';
import { buildMetadataForServiceArea } from '@/app/lib/pageMetadata';
import ServiceAreaClient from './ServiceAreaClient';

interface ServiceAreaPageProps {
  params: Promise<{ serviceSlug: string; areaSlug: string }>;
}

export async function generateMetadata({ params }: ServiceAreaPageProps): Promise<Metadata> {
  const { serviceSlug, areaSlug } = await params;
  return buildMetadataForServiceArea(serviceSlug, areaSlug);
}

export default async function ServiceAreaPage({ params }: ServiceAreaPageProps) {
  const { serviceSlug, areaSlug } = await params;
  return <ServiceAreaClient serviceSlug={serviceSlug} areaSlug={areaSlug} />;
}
