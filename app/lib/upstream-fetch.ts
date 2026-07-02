import https from 'node:https';
import http from 'node:http';

/** Remote builder API origin (no trailing slash). */
export function resolveUpstreamApiOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(raw);
  let base = raw.startsWith('http://') && !isLocal ? raw.replace(/^http:\/\//i, 'https://') : raw;
  return base.replace(/\/$/, '');
}

function nodeRequest(url: string, init: RequestInit, rejectUnauthorized: boolean): Promise<Response> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;
    const method = init.method ?? 'GET';

    const headerRecord: Record<string, string> = {};
    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headerRecord[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        for (const [key, value] of init.headers) headerRecord[key] = value;
      } else {
        Object.assign(headerRecord, init.headers);
      }
    }

    const req = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers: headerRecord,
        ...(isHttps ? { rejectUnauthorized } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          resolve(
            new Response(body, {
              status: res.statusCode ?? 500,
              headers: res.headers as HeadersInit,
            })
          );
        });
      }
    );

    req.on('error', reject);

    if (init.body) {
      if (typeof init.body === 'string') {
        req.write(init.body);
      } else if (init.body instanceof ArrayBuffer) {
        req.write(Buffer.from(init.body));
      } else if (Buffer.isBuffer(init.body)) {
        req.write(init.body);
      }
    }

    req.end();
  });
}

/** Server-side fetch to the builder API; relaxes TLS in local dev (Windows/corp CA issues). */
export async function upstreamFetch(url: string, init: RequestInit = {}): Promise<Response> {
  if (process.env.NODE_ENV === 'production') {
    return fetch(url, init);
  }
  return nodeRequest(url, init, false);
}
