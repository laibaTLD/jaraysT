import type { Metadata } from 'next';
import { buildMetadataForLegalPage } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForLegalPage('terms', '/terms-of-service');
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
