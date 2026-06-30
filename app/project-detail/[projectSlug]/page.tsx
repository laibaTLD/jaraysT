import type { Metadata } from 'next';
import { buildMetadataForProject } from '@/app/lib/pageMetadata';
import ProjectDetailClient from './ProjectDetailClient';

interface ProjectDetailPageProps {
  params: Promise<{ projectSlug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { projectSlug } = await params;
  return buildMetadataForProject(projectSlug);
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectSlug } = await params;
  return <ProjectDetailClient projectSlug={projectSlug} />;
}
