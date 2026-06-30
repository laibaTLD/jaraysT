import type { Metadata } from 'next';
import { buildMetadataForPageType } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForPageType('service-list', '/services');
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
