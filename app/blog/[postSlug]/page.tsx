import type { Metadata } from 'next';
import { buildMetadataForBlogPost } from '@/app/lib/pageMetadata';
import BlogPostClient from './BlogPostClient';

interface BlogPostPageProps {
  params: Promise<{ postSlug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { postSlug } = await params;
  return buildMetadataForBlogPost(postSlug);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { postSlug } = await params;
  return <BlogPostClient postSlug={postSlug} />;
}
