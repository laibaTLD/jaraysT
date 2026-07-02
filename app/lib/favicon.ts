import type { Site } from '@/app/lib/types';
import { resolveUpstreamApiOrigin } from '@/app/lib/upstream-fetch';

function extractUploadsFilename(input: string): string | null {
  const matchPathname = (pathname: string) => {
    const m = pathname.match(/^\/(?:api\/)?uploads\/(.+)$/i);
    return m?.[1] ?? null;
  };

  if (/^https?:\/\//i.test(input)) {
    try {
      return matchPathname(new URL(input).pathname);
    } catch {
      return null;
    }
  }

  const p = input.replace(/^\//, '');
  const m = p.match(/^(?:api\/)?uploads\/(.+)$/i);
  return m?.[1] ?? null;
}

/** Absolute URL on the builder API host (reliable for server-side fetch). */
export function resolveFaviconUpstreamUrl(site?: Site | null): string | undefined {
  const raw = site?.seo?.faviconUrl?.trim();
  if (!raw) return undefined;

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/^http:\/\//i, 'https://');
  }

  const filename = extractUploadsFilename(raw);
  if (!filename) return undefined;

  const apiOrigin = resolveUpstreamApiOrigin();
  return `${apiOrigin}/uploads/${filename}`;
}

/** Same-origin path served by app/favicon.ico/route.ts */
export function resolveFaviconAppPath(): string {
  return '/favicon.ico';
}

export function resolveFaviconMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/x-icon';
}

export function resolveSiteFaviconIcons(site?: Site | null): {
  icon: Array<{ url: string; type?: string; sizes?: string }>;
  shortcut: string;
  apple: string;
} | undefined {
  if (!site?.seo?.faviconUrl?.trim()) return undefined;

  const upstream = resolveFaviconUpstreamUrl(site);
  const appPath = resolveFaviconAppPath();
  const type = upstream ? resolveFaviconMimeType(upstream) : 'image/webp';

  return {
    icon: [{ url: appPath, type, sizes: 'any' }],
    shortcut: appPath,
    apple: appPath,
  };
}
