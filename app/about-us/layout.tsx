import type { Metadata } from 'next';
import { buildMetadataForPageType } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForPageType('about', '/about-us');
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
