'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { Cormorant } from 'next/font/google';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  getBrandName,
  getCopyrightText,
  getFooterDescriptionContent,
  getFooterNavLinks,
} from '@/app/lib/siteContent';
import { getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import { useThemeColors } from '@/app/hooks/useTheme';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';

const cormorant = Cormorant({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
});

const DEFAULT_FOOTER_DESCRIPTION =
  "Jay Ray's Custom Remodeling is a trusted local contractor serving Pensacola, FL and surrounding areas. We specialize in painting, drywall repairs, and carpentry, delivering quality craftsmanship and reliable service for every project we take on.";

const DEFAULT_FOOTER_COPYRIGHT =
  "2026 © Jay Ray's Custom Remodeling. All Rights Reserved. Built with love by US Brand Booster LLC";

const BRAND_BOOSTER_URL = 'https://usbrandbooster.com/';
const BRAND_BOOSTER_PATTERN = /US\s+Brand\s+Booster(?:\s+LLC)?/i;

const copyrightLinkClass =
  'relative z-10 underline underline-offset-2 transition-colors hover:text-[var(--wb-primary)]';

const tiptapLinkClass =
  '[&_a]:relative [&_a]:z-10 [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a:hover]:text-[var(--wb-primary)]';

const FALLBACK_NAV_LINKS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About', href: '/about-us' },
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'contact', label: 'Contact', href: '/contact-us' },
] as const;

const LEGAL_LINKS = [
  { href: '/terms-of-service', label: 'Terms of Service', Icon: ShieldIcon },
  { href: '/privacy-policy', label: 'Privacy Policy', Icon: DocumentIcon },
] as const;

const legalLinkClass =
  'inline-flex items-center gap-2 text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-primary)]';

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 3l7.5 3v5.5c0 4.15-2.55 7.95-7.5 9-4.95-1.05-7.5-4.85-7.5-9V6L12 3z"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14 3v5h5" />
      <circle cx="9.5" cy="13" r="1.25" strokeWidth={1.75} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.5 16.5h5" />
    </svg>
  );
}

function isTiptapCopyright(content: unknown): boolean {
  if (!content) return false;
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return typeof doc === 'object' && doc !== null && (doc as { type?: string }).type === 'doc';
  } catch {
    return false;
  }
}

function tiptapHasLinks(content: unknown): boolean {
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return JSON.stringify(doc).includes('"type":"link"');
  } catch {
    return false;
  }
}

function normalizeBrandText(text: string) {
  return text.replace(/J Rays Custom Remodeling/g, "Jay Ray's Custom Remodeling");
}

function CopyrightText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(BRAND_BOOSTER_PATTERN.source, 'gi');

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={BRAND_BOOSTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={copyrightLinkClass}
      >
        {match[0]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (parts.length === 0) {
    return <>{text}</>;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

function FooterCopyright({ site }: { site: ReturnType<typeof useWebBuilder>['site'] }) {
  const rawCopyright = site?.footer?.copyright;

  if (isTiptapCopyright(rawCopyright) && tiptapHasLinks(rawCopyright)) {
    return (
      <div className={`${tiptapLinkClass} [&_p]:m-0`}>
        <TiptapRenderer content={rawCopyright} className="text-inherit max-w-none" />
      </div>
    );
  }

  const fromSite = tiptapToText(rawCopyright) || getCopyrightText(site);
  const yearOnly = `©${new Date().getFullYear()}`;
  const text = normalizeBrandText(
    fromSite && fromSite !== yearOnly ? fromSite : DEFAULT_FOOTER_COPYRIGHT
  );

  return <CopyrightText text={text} />;
}

function getSocialIcon(platform: string) {
  const p = platform.toLowerCase();
  switch (p) {
    case 'facebook':
      return (
        <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.991 4.388 10.967 10.125 11.854v-8.385H7.078V12.07h3.047V9.412c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.492 0-1.955.927-1.955 1.878v2.261h3.328l-.532 3.472h-2.796v8.385C19.612 23.04 24 18.064 24 12.073z" />
      );
    case 'instagram':
      return (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.056 1.97.24 2.427.403a4.92 4.92 0 0 1 1.775 1.153 4.92 4.92 0 0 1 1.153 1.775c.163.457.347 1.257.403 2.427.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.403 2.427a4.92 4.92 0 0 1-1.153 1.775 4.92 4.92 0 0 1-1.775 1.153c-.457.163-1.257.347-2.427.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.427-.403a4.92 4.92 0 0 1-1.775-1.153 4.92 4.92 0 0 1-1.153-1.775c-.163-.457-.347-1.257-.403-2.427C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.056-1.17.24-1.97.403-2.427A4.92 4.92 0 0 1 3.789 2.948 4.92 4.92 0 0 1 5.564 1.795c.457-.163 1.257-.347 2.427-.403C9.256 1.334 9.636 1.322 12 1.322zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm7.2-1.442a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
      );
    default:
      return null;
  }
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className={`${cormorant.className} mb-4 text-lg font-semibold text-[var(--wb-text-main)]`}
    >
      {children}
    </h4>
  );
}

export function Footer() {
  const { site, pages } = useWebBuilder();
  const colors = useThemeColors();

  const businessName = useMemo(
    () => normalizeBrandText(getBrandName(site) || "Jay Ray's Custom Remodeling"),
    [site]
  );

  const logoImage = useMemo(() => {
    const url = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return url ? getImageSrc(url) : '/logo.png';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const businessDescription = useMemo(() => {
    const text = tiptapToText(getFooterDescriptionContent(site));
    return normalizeBrandText(text || DEFAULT_FOOTER_DESCRIPTION);
  }, [site]);

  const navLinks = useMemo(() => {
    const links = getFooterNavLinks(pages);
    return links.length > 0 ? links : [...FALLBACK_NAV_LINKS];
  }, [pages]);

  const business = site?.business;
  const showSocialLinks = site?.footer?.showSocialLinks !== false;

  const addressLine = useMemo(() => {
    const addr = business?.address;
    if (!addr) return null;
    const line = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
    return line || null;
  }, [business?.address]);

  const socialLinks = showSocialLinks ? site?.socialLinks ?? [] : [];

  return (
    <footer
      id="contact"
      className="border-t border-gray-100"
      style={{ backgroundColor: colors.pageBackground }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/#home" className="mb-4 inline-block">
              <Image
                src={logoImage || '/logo.png'}
                alt={`${businessName} logo`}
                width={360}
                height={100}
                className="h-24 w-auto object-contain sm:h-28"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--wb-text-secondary)]">
              {businessDescription}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-5 flex gap-2">
                {socialLinks.map((social, index) => {
                  const iconPath = getSocialIcon(social.platform);
                  if (!iconPath || !social.url?.trim()) return null;
                  return (
                    <a
                      key={`${social.platform}-${index}`}
                      href={social.url}
                      className="rounded-lg p-2 text-[var(--wb-text-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)] hover:text-[var(--wb-primary)]"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Follow us on ${social.platform}`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {iconPath}
                      </svg>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <nav className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <FooterHeading>Contact</FooterHeading>
            <ul className="space-y-3 text-sm text-[var(--wb-text-secondary)]">
              {business?.phone && (
                <li>
                  <a
                    href={`tel:${business.phone}`}
                    className="transition-colors hover:text-[var(--wb-primary)]"
                  >
                    {business.phone}
                  </a>
                </li>
              )}
              {business?.email && (
                <li>
                  <a
                    href={`mailto:${business.email}`}
                    className="break-all transition-colors hover:text-[var(--wb-primary)]"
                  >
                    {business.email}
                  </a>
                </li>
              )}
              {addressLine && (
                <li className="leading-relaxed">
                  <address className="not-italic">{addressLine}</address>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(addressLine)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[var(--wb-primary)] hover:underline"
                  >
                    Get directions
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <nav
            className="mb-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            aria-label="Legal"
          >
            {LEGAL_LINKS.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={legalLinkClass}>
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="text-center text-xs leading-relaxed text-[var(--wb-text-secondary)] sm:text-sm">
            <FooterCopyright site={site} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
