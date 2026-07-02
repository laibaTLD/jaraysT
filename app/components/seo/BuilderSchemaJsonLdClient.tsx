'use client';

import { useEffect, useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { resolveSchemaDocuments, resolveSiteBaseUrl } from '@/app/lib/builderSchema';

const SCRIPT_ID = 'builder-schema-jsonld';

export function BuilderSchemaJsonLdClient() {
  const { site } = useWebBuilder();

  const payload = useMemo(() => {
    if (!site) return null;
    return resolveSchemaDocuments(site, resolveSiteBaseUrl());
  }, [site]);

  useEffect(() => {
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!payload?.length) {
      script?.remove();
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(payload.length === 1 ? payload[0] : payload);
  }, [payload]);

  return null;
}

export default BuilderSchemaJsonLdClient;
