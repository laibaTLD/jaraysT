'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBrandName, getHeaderNavItems } from '@/app/lib/siteContent';
import {
  getServingAreaLinksForService,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { getImageSrc } from '@/app/lib/utils';

const SERVICES_HREF = '/services';

const FALLBACK_NAV_LINKS = [
  { id: 'home', name: 'Home', href: '/' },
  { id: 'about', name: 'About', href: '/about-us' },
  { id: 'contact', name: 'Contact', href: '/contact-us' },
  { id: 'services', name: 'Services', href: SERVICES_HREF },
] as const;

const navLinkClass =
  'px-4 py-2 text-sm font-medium text-[var(--wb-text-main)] rounded-lg transition-colors hover:text-[var(--wb-primary)] hover:bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)]';

const mobileNavLinkClass =
  'px-3 py-2.5 text-sm font-medium text-[var(--wb-text-main)] rounded-lg transition-colors hover:text-[var(--wb-primary)] hover:bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)]';

const dropdownItemClass =
  'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-[var(--wb-text-main)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)] hover:text-[var(--wb-primary)]';

const dropdownItemActiveClass =
  'bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)] text-[var(--wb-primary)]';

const dropdownPanelClass =
  'overflow-hidden rounded-xl border border-gray-100 bg-[var(--wb-page-bg,white)] shadow-xl ring-1 ring-black/5';

const submenuPanelClass =
  'min-w-[15rem] shrink-0 bg-[color-mix(in_srgb,var(--wb-primary)_5%,var(--wb-page-bg,white))] px-2 py-3';

const submenuItemClass =
  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--wb-text-main)] transition-colors hover:bg-[var(--wb-page-bg,white)] hover:text-[var(--wb-primary)] hover:shadow-sm';

const submenuHeaderClass =
  'mb-2 border-b border-gray-200/70 px-2.5 pb-2.5';

type ServiceNavItem = {
  id: string;
  name: string;
  href: string;
  areas: ReturnType<typeof getServingAreaLinksForService>;
};

function isServicesNavItem(link: { href: string; name: string }) {
  const href = link.href.replace(/\/+$/, '') || '/';
  const name = link.name.trim().toLowerCase();
  return href === SERVICES_HREF || name === 'services' || name === 'service';
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 21s6-5.196 6-10a6 6 0 10-12 0c0 4.804 6 10 6 10z"
      />
      <circle cx="12" cy="11" r="2.25" strokeWidth={1.75} />
    </svg>
  );
}

function ServicesAreasSubmenu({
  service,
  submenuOnLeft,
  onNavigate,
}: {
  service: ServiceNavItem;
  submenuOnLeft: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={`${submenuPanelClass} ${
        submenuOnLeft ? 'border-r border-gray-200/70' : 'border-l border-gray-200/70'
      }`}
      role="menu"
    >
      <div className={submenuHeaderClass}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--wb-text-secondary)]">
          Serving Areas
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[var(--wb-primary)]">{service.name}</p>
      </div>

      <ul className="space-y-0.5">
        {service.areas.map((area) => (
          <li key={area.id}>
            <Link
              href={area.href}
              className={submenuItemClass}
              role="menuitem"
              onClick={onNavigate}
            >
              <MapPinIcon className="h-4 w-4 shrink-0 text-[var(--wb-primary)] opacity-80" />
              <span className="truncate">{area.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={service.href}
        className="mt-2.5 flex items-center gap-1 border-t border-gray-200/70 px-2.5 pt-2.5 text-xs font-semibold text-[var(--wb-primary)] transition-colors hover:text-[var(--wb-primary-hover,var(--wb-primary))]"
        onClick={onNavigate}
      >
        View service details
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function Header() {
  const { site, pages, services, serviceAreaPages } = useWebBuilder();
  const businessName = useMemo(
    () => getBrandName(site) || "Jay Ray's Custom Remodeling",
    [site]
  );
  const logoSrc = useMemo(() => {
    const url = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return url ? getImageSrc(url) : '/logo.png';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);
  const navLinks = useMemo(() => {
    const items = getHeaderNavItems(pages);
    return items.length > 0 ? items : [...FALLBACK_NAV_LINKS];
  }, [pages]);

  const serviceLinks = useMemo<ServiceNavItem[]>(
    () =>
      (services ?? [])
        .filter((service) => service.status === 'published' && service.name?.trim())
        .map((service) => ({
          id: service._id,
          name: service.name.trim(),
          href: `/service/${resolveServiceSlug(service)}`,
          areas: getServingAreaLinksForService(service, serviceAreaPages, services ?? []),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [services, serviceAreaPages]
  );

  const activeService = useMemo(
    () => serviceLinks.find((s) => s.areas.length > 0) ?? null,
    [serviceLinks]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileExpandedServiceId, setMobileExpandedServiceId] = useState<string | null>(null);
  const servicesTriggerRef = useRef<HTMLDivElement>(null);
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right'>('left');
  const [submenuOnLeft, setSubmenuOnLeft] = useState(false);

  const hoveredService =
    serviceLinks.find((s) => s.id === activeServiceId) ?? activeService;

  const hasSubmenu = Boolean(hoveredService && hoveredService.areas.length > 0);

  useLayoutEffect(() => {
    if (!servicesMenuOpen || !servicesTriggerRef.current) return;

    const trigger = servicesTriggerRef.current.getBoundingClientRect();
    const primaryWidth = 224; // 14rem
    const submenuWidth = hasSubmenu ? 240 : 0; // 15rem
    const totalWidth = primaryWidth + submenuWidth;
    const padding = 16;
    const spaceOnRight = window.innerWidth - trigger.left - padding;
    const spaceOnLeft = trigger.right - padding;

    if (totalWidth > spaceOnRight) {
      setDropdownAlign('right');
      setSubmenuOnLeft(hasSubmenu);
    } else if (hasSubmenu && submenuWidth > spaceOnRight - primaryWidth) {
      setDropdownAlign('left');
      setSubmenuOnLeft(true);
    } else {
      setDropdownAlign('left');
      setSubmenuOnLeft(false);
    }

    // If still overflowing both sides, prefer right anchor with submenu on left
    if (totalWidth > spaceOnRight && totalWidth > spaceOnLeft && hasSubmenu) {
      setDropdownAlign('right');
      setSubmenuOnLeft(true);
    }
  }, [servicesMenuOpen, hasSubmenu, hoveredService?.id]);

  const closeMenu = () => {
    setIsOpen(false);
    setMobileServicesOpen(false);
    setMobileExpandedServiceId(null);
    setServicesMenuOpen(false);
    setActiveServiceId(null);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between lg:h-24">
          <Link href="/" className="flex shrink-0 items-center" onClick={closeMenu}>
            <Image
              src={logoSrc}
              alt={`${businessName} logo`}
              width={320}
              height={96}
              className="h-16 w-auto object-contain sm:h-[4.5rem] lg:h-20"
              priority
            />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) =>
              isServicesNavItem(link) && serviceLinks.length > 0 ? (
                <div
                  key={link.href}
                  ref={servicesTriggerRef}
                  className="relative"
                  onMouseEnter={() => {
                    setServicesMenuOpen(true);
                    setActiveServiceId((current) => {
                      if (current) return current;
                      const firstWithAreas = serviceLinks.find((s) => s.areas.length > 0);
                      return firstWithAreas?.id ?? null;
                    });
                  }}
                  onMouseLeave={() => {
                    setServicesMenuOpen(false);
                    setActiveServiceId(null);
                    setDropdownAlign('left');
                    setSubmenuOnLeft(false);
                  }}
                >
                  <Link
                    href={link.href}
                    className={`${navLinkClass} inline-flex items-center gap-1`}
                    aria-haspopup="menu"
                    aria-expanded={servicesMenuOpen}
                  >
                    {link.name}
                    <ChevronIcon
                      className={`h-4 w-4 transition-transform ${servicesMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </Link>

                  {servicesMenuOpen && (
                    <div
                      className={`absolute top-full z-50 pt-1.5 ${
                        dropdownAlign === 'right' ? 'right-0' : 'left-0'
                      }`}
                      role="menu"
                    >
                      <div
                        className={`flex items-stretch ${dropdownPanelClass}${
                          submenuOnLeft && hasSubmenu ? ' flex-row-reverse' : ''
                        }`}
                      >
                        <div className="min-w-[14rem] shrink-0 py-1.5">
                          <p className="px-4 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--wb-text-secondary)]">
                            Services
                          </p>
                          <Link
                            href={link.href}
                            className={dropdownItemClass}
                            role="menuitem"
                            onMouseEnter={() => setActiveServiceId(null)}
                          >
                            All Services
                          </Link>
                          {serviceLinks.map((service) => {
                            const isActive = activeServiceId === service.id;
                            const hasAreas = service.areas.length > 0;
                            const AreaChevron = submenuOnLeft && hasSubmenu ? ChevronLeftIcon : ChevronRightIcon;
                            return (
                              <Link
                                key={service.id}
                                href={service.href}
                                className={`${dropdownItemClass}${isActive ? ` ${dropdownItemActiveClass}` : ''}`}
                                role="menuitem"
                                onMouseEnter={() => setActiveServiceId(hasAreas ? service.id : null)}
                              >
                                <span className="truncate">{service.name}</span>
                                {hasAreas && (
                                  <AreaChevron className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                )}
                              </Link>
                            );
                          })}
                        </div>

                        {hasSubmenu && hoveredService && (
                          <ServicesAreasSubmenu
                            service={hoveredService}
                            submenuOnLeft={submenuOnLeft}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.href} href={link.href} className={navLinkClass}>
                  {link.name}
                </Link>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--wb-text-main)] transition-colors hover:bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)] hover:text-[var(--wb-primary)] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-gray-100 pb-4 md:hidden">
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) =>
                isServicesNavItem(link) && serviceLinks.length > 0 ? (
                  <div key={link.href}>
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((open) => !open)}
                      className={`${mobileNavLinkClass} flex w-full items-center justify-between`}
                      aria-expanded={mobileServicesOpen}
                    >
                      <span>{link.name}</span>
                      <ChevronIcon
                        className={`h-4 w-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileServicesOpen && (
                      <div className={`ml-1 mt-1 ${dropdownPanelClass}`}>
                        <Link
                          href={link.href}
                          onClick={closeMenu}
                          className={dropdownItemClass}
                        >
                          All Services
                        </Link>
                        {serviceLinks.map((service) => (
                          <div key={service.id}>
                            {service.areas.length > 0 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMobileExpandedServiceId((current) =>
                                      current === service.id ? null : service.id
                                    )
                                  }
                                  className={`${dropdownItemClass}${
                                    mobileExpandedServiceId === service.id
                                      ? ` ${dropdownItemActiveClass}`
                                      : ''
                                  }`}
                                  aria-expanded={mobileExpandedServiceId === service.id}
                                >
                                  <span className="truncate">{service.name}</span>
                                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                </button>
                                {mobileExpandedServiceId === service.id && (
                                  <div
                                    className={`mx-2 mb-2 mt-1 rounded-lg border border-gray-200/80 ${submenuPanelClass}`}
                                  >
                                    <div className={submenuHeaderClass}>
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--wb-text-secondary)]">
                                        Serving Areas
                                      </p>
                                      <p className="mt-0.5 truncate text-sm font-semibold text-[var(--wb-primary)]">
                                        {service.name}
                                      </p>
                                    </div>
                                    <ul className="space-y-0.5">
                                      {service.areas.map((area) => (
                                        <li key={area.id}>
                                          <Link
                                            href={area.href}
                                            onClick={closeMenu}
                                            className={submenuItemClass}
                                          >
                                            <MapPinIcon className="h-4 w-4 shrink-0 text-[var(--wb-primary)] opacity-80" />
                                            <span className="truncate">{area.label}</span>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                    <Link
                                      href={service.href}
                                      onClick={closeMenu}
                                      className="mt-2.5 flex items-center gap-1 border-t border-gray-200/70 px-2.5 pt-2.5 text-xs font-semibold text-[var(--wb-primary)]"
                                    >
                                      View service details
                                      <ChevronRightIcon className="h-3.5 w-3.5" />
                                    </Link>
                                  </div>
                                )}
                              </>
                            ) : (
                              <Link
                                href={service.href}
                                onClick={closeMenu}
                                className={dropdownItemClass}
                              >
                                <span className="truncate">{service.name}</span>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={link.href} href={link.href} onClick={closeMenu} className={mobileNavLinkClass}>
                    {link.name}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
