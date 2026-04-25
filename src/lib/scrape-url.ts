import type { NewsItem, NewsLang, NewsRegion } from '@/lib/news-types';

/**
 * URL bateko metadatuak (titulua, deskribapena, irudia, data, iturria) automatikoki
 * lortzen ditu Microlink-en API publikoaren bidez (CORS gaituta, doan, autentifikaziorik gabe).
 *
 * Ikus: https://microlink.io/docs/api/getting-started/overview
 */
export interface ScrapedMeta {
  title: string;
  description: string;
  image: string | null;
  publishedAt: string | null;
  sourceName: string;
}

interface MicrolinkResponse {
  status: 'success' | 'fail';
  data?: {
    title?: string;
    description?: string;
    url?: string;
    image?: { url?: string } | null;
    logo?: { url?: string } | null;
    publisher?: string;
    date?: string;
  };
  message?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedMeta> {
  const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
  const r = await fetch(endpoint, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Microlink-ek huts egin du (${r.status})`);
  const json = (await r.json()) as MicrolinkResponse;
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Ezin izan dira metadatuak atera');
  }
  const d = json.data;
  let sourceName = d.publisher || '';
  if (!sourceName) {
    try {
      sourceName = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      sourceName = 'Ezezaguna';
    }
  }
  return {
    title: d.title?.trim() || '(Izenbururik gabe)',
    description: d.description?.trim() || '',
    image: d.image?.url || null,
    publishedAt: d.date || null,
    sourceName,
  };
}

/**
 * Eskuz gehitutako artikulu baterako NewsItem bat eraikitzen du.
 */
export function buildManualNewsItem(params: {
  url: string;
  meta: ScrapedMeta;
  lang: NewsLang;
  region: NewsRegion;
}): NewsItem {
  const { url, meta, lang, region } = params;
  const id = `manual:${slugify(url)}`;
  const sourceId = `manual:${safeHostname(url)}`;
  return {
    id,
    title: meta.title,
    summary: meta.description,
    url,
    image: meta.image,
    publishedAt: meta.publishedAt || new Date().toISOString(),
    source: { id: sourceId, name: meta.sourceName },
    lang,
    region,
    topics: [],
  };
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'ezezaguna';
  }
}

function slugify(input: string): string {
  // Hash sinple bat ID egonkor baterako
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
