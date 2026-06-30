import type { Metadata } from 'next';
import { buildMetadataForPageType } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForPageType('blog-list', '/blog');
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
