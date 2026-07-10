import type { Metadata } from 'next';
import Script from 'next/script';
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

const GA_MEASUREMENT_ID = 'G-GSCF0VC5DQ';

const FALLBACK_METADATA: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
  verification: {
    google: '6iY7eJcwvueNUp21uCb2DKc46VO7UFOdxSmldLtwFKs',
  },
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
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
