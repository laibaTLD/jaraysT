import type { Metadata } from 'next';
import { buildMetadataForPageType } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForPageType('gallery', '/gallery');
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
