import type { Metadata } from 'next';
import { buildMetadataForPageType } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForPageType('contact', '/contact-us');
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
