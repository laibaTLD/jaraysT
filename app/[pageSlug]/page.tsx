import type { Metadata } from 'next';
import { buildMetadataForPageSlug } from '@/app/lib/pageMetadata';
import PageSlugClient from './PageSlugClient';

interface PageSlugPageProps {
  params: Promise<{ pageSlug: string }>;
}

export async function generateMetadata({ params }: PageSlugPageProps): Promise<Metadata> {
  const { pageSlug } = await params;
  return buildMetadataForPageSlug(pageSlug);
}

export default async function PageSlugPage({ params }: PageSlugPageProps) {
  const { pageSlug } = await params;
  return <PageSlugClient pageSlug={pageSlug} />;
}
