'use client';

import { useEffect } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  resolveFaviconAppPath,
  resolveFaviconMimeType,
  resolveFaviconUpstreamUrl,
} from '@/app/lib/favicon';

const ICON_SELECTOR = "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']";

function upsertIconLink(rel: string, href: string, type?: string) {
  const selector = `link[rel='${rel}']`;
  let link = document.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
  if (type) {
    link.type = type;
  } else {
    link.removeAttribute('type');
  }
}

export function BuilderFaviconClient() {
  const { site } = useWebBuilder();

  useEffect(() => {
    if (!site?.seo?.faviconUrl?.trim()) return;

    const appPath = resolveFaviconAppPath();
    const upstream = resolveFaviconUpstreamUrl(site);
    const type = upstream ? resolveFaviconMimeType(upstream) : 'image/webp';

    document.querySelectorAll<HTMLLinkElement>(ICON_SELECTOR).forEach((node) => node.remove());

    upsertIconLink('icon', appPath, type);
    upsertIconLink('shortcut icon', appPath, type);
    upsertIconLink('apple-touch-icon', appPath, type);
  }, [site?.seo?.faviconUrl]);

  return null;
}

export default BuilderFaviconClient;
