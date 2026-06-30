import type { Metadata } from 'next';
import { buildMetadataForLegalPage } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForLegalPage('privacy', '/privacy-policy');
}

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
