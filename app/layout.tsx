import type { Metadata } from 'next';
import './globals.css';
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider';
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary';
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { LenisProvider } from '@/app/components/cinematic/LenisProvider';
import { AmbientFoundation } from '@/app/components/cinematic/AmbientFoundation';
import { HeroIntroProvider } from '@/app/providers/HeroIntroProvider';
import { Header } from '@/app/components/layout/Header';
import { BuilderSchemaJsonLdClient } from '@/app/components/seo/BuilderSchemaJsonLdClient';
import { BuilderFaviconClient } from '@/app/components/seo/BuilderFaviconClient';
import { fetchPublicSite } from '@/app/lib/webbuilder-server';
import { buildSiteMetadata } from '@/app/lib/metadata';

const FALLBACK_METADATA: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const site = await fetchPublicSite();
    return buildSiteMetadata(site);
  } catch {
    return FALLBACK_METADATA;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <ErrorBoundary>
          <WebBuilderProvider>
            <BuilderFaviconClient />
            <BuilderSchemaJsonLdClient />
            <LanguageProvider>
              <LenisProvider>
                <AmbientFoundation />
                <HeroIntroProvider>
                  <ThemeFontWrapper>
                    <Header />
                    <main className="relative z-10 min-h-screen pt-20 lg:pt-24">
                      {children}
                    </main>
                  </ThemeFontWrapper>
                </HeroIntroProvider>
              </LenisProvider>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
