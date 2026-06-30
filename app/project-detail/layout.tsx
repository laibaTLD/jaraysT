import type { Metadata } from 'next';
import { buildMetadataForPageType } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForPageType('project-detail', '/project-detail');
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
