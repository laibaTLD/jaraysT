import type { Metadata } from 'next';
import { buildMetadataForTestimonials } from '@/app/lib/pageMetadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForTestimonials();
}

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
