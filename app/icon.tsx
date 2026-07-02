import { fetchPublicSite } from '@/app/lib/webbuilder-server';
import {
  resolveFaviconMimeType,
  resolveFaviconUpstreamUrl,
} from '@/app/lib/favicon';
import { upstreamFetch } from '@/app/lib/upstream-fetch';

export const dynamic = 'force-dynamic';

export default async function Icon() {
  try {
    const site = await fetchPublicSite();
    const upstreamUrl = resolveFaviconUpstreamUrl(site);
    if (!upstreamUrl) {
      return new Response(null, { status: 404 });
    }

    const upstream = await upstreamFetch(upstreamUrl, { cache: 'no-store' });
    if (!upstream.ok) {
      return new Response(null, { status: upstream.status });
    }

    const body = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get('content-type')?.split(';')[0]?.trim() ||
      resolveFaviconMimeType(upstreamUrl);

    return new Response(body, {
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
