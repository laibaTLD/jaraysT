import { fetchPublicSite } from '@/app/lib/webbuilder-server';
import {
  resolveFaviconMimeType,
  resolveFaviconUpstreamUrl,
} from '@/app/lib/favicon';
import { upstreamFetch } from '@/app/lib/upstream-fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const site = await fetchPublicSite();
    const upstreamUrl = resolveFaviconUpstreamUrl(site);
    if (!upstreamUrl) {
      return new Response('Favicon not configured', { status: 404 });
    }

    const upstream = await upstreamFetch(upstreamUrl, { cache: 'no-store' });
    if (!upstream.ok) {
      return new Response('Favicon unavailable', { status: upstream.status });
    }

    const body = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get('content-type')?.split(';')[0]?.trim() ||
      resolveFaviconMimeType(upstreamUrl);

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response('Favicon error', { status: 502 });
  }
}
