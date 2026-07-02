import type { Site } from '@/app/lib/types';

export function resolveSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

function parseBuilderSchemaJson(raw: string): unknown[] {
  const parsed = JSON.parse(raw) as unknown;
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') return [parsed];
  return [];
}

function absolutizeSchemaNode(node: unknown, baseUrl: string): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => absolutizeSchemaNode(item, baseUrl));
  }

  if (!node || typeof node !== 'object') {
    if (typeof node === 'string' && node.startsWith('/')) {
      return `${baseUrl}${node}`;
    }
    return node;
  }

  const record = { ...(node as Record<string, unknown>) };
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' && (key === 'url' || key === '@id') && value.startsWith('/')) {
      record[key] = `${baseUrl}${value}`;
    } else if (value && typeof value === 'object') {
      record[key] = absolutizeSchemaNode(value, baseUrl);
    }
  }
  return record;
}

export function buildDefaultSchemaDocuments(site: Site, baseUrl: string): unknown[] {
  const schemas: unknown[] = [];

  if (site.business?.name) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.business.name,
      url: baseUrl,
      ...(site.theme?.logoUrl && { logo: `${baseUrl}${site.theme.logoUrl}` }),
      ...(site.business?.email && {
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: site.business.phone || undefined,
          contactType: 'customer service',
          email: site.business.email,
        },
      }),
      ...(site.business?.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.business.address.street,
          addressLocality: site.business.address.city,
          addressRegion: site.business.address.state,
          postalCode: site.business.address.zipCode,
          addressCountry: site.business.address.country || 'US',
        },
      }),
      ...(site.socialLinks?.length && {
        sameAs: site.socialLinks.map((link) => link.url).filter(Boolean),
      }),
    });
  }

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: baseUrl,
    ...(site.seo?.description && { description: site.seo.description }),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  return schemas.map((schema) => absolutizeSchemaNode(schema, baseUrl));
}

/** Builder custom schema fully replaces auto-generated schema when present. */
export function resolveSchemaDocuments(site: Site, baseUrl: string): unknown[] {
  const customRaw = site.files?.schemaJson?.trim();
  if (customRaw) {
    try {
      return parseBuilderSchemaJson(customRaw).map((schema) =>
        absolutizeSchemaNode(schema, baseUrl)
      );
    } catch (error) {
      console.warn('Invalid builder schema JSON:', error);
    }
  }

  return buildDefaultSchemaDocuments(site, baseUrl);
}
