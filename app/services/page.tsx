'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { getThemeColors } from '@/app/lib/themeBuilder';

export default function ServicesPage() {
  const { site, pages, error } = useWebBuilder();

  const themeColors = getThemeColors(site);

  // Get theme fonts from site
  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  const servicesPage = pages.find((p: Page) => p.pageType === 'service-list');

  if (error && !site) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div 
          className="p-6 rounded-lg max-w-lg text-center"
          style={{ 
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.inactive,
            borderWidth: '1px'
          }}
        >
          <h2 
            className="text-xl font-bold mb-2"
            style={{ 
              color: themeColors.secondary,
              fontFamily: themeFonts.heading
            }}
          >
            Error
          </h2>
          <p 
            style={{ 
              color: themeColors.secondary,
              fontFamily: themeFonts.body
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!servicesPage) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ 
            color: themeColors.mainText,
            fontFamily: themeFonts.heading
          }}
        >
          No Services Page Found
        </h2>
        <p 
          style={{ 
            color: themeColors.secondaryText,
            fontFamily: themeFonts.body
          }}
        >
          Please create a page with type &quot;services&quot; in the site builder.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen selection:bg-black/10 selection:text-inherit"
      style={{ 
        backgroundColor: themeColors.pageBackground,
        fontFamily: themeFonts.body
      }}
    >

      <main>
        <HeroSection hero={servicesPage.hero} page={servicesPage} />
        <ServicesSection servicesSection={servicesPage.servicesSection} />
      </main>

      <Footer />
    </div>
  );
}
