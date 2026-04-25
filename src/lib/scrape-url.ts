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
  const errors: string[] = [];

  // 1) Microlink (lehenengo aukera, doan eta CORS gaituta)
  try {
    return await scrapeWithMicrolink(url);
  } catch (e) {
    errors.push(`Microlink: ${e instanceof Error ? e.message : 'errorea'}`);
  }

  // 2) jina.ai reader (orri konplexuen fallback-a, JS render-ekin)
  try {
    return await scrapeWithJina(url);
  } catch (e) {
    errors.push(`Jina: ${e instanceof Error ? e.message : 'errorea'}`);
  }

  // 3) Azken aukera: URL-aren beraren oinarrizko metadatuak
  try {
    return buildFallbackFromUrl(url);
  } catch {
    throw new Error(
      `Ezin izan dira metadatuak atera. Saiakerak: ${errors.join(' | ')}`
    );
  }
}

async function scrapeWithMicrolink(url: string): Promise<ScrapedMeta> {
  const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
  const r = await fetch(endpoint, { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const json = (await r.json()) as MicrolinkResponse;
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'huts egin du');
  }
  const d = json.data;
  const meta: ScrapedMeta = {
    title: d.title?.trim() || '',
    description: d.description?.trim() || '',
    image: d.image?.url || null,
    publishedAt: d.date || null,
    sourceName: d.publisher || hostnameFromUrl(url),
  };
  if (!meta.title) throw new Error('izenbururik gabe');
  return meta;
}

/**
 * jina.ai reader-ek edozein orri markdown bezala itzultzen du, JS render eta guzti.
 * Ez du autentifikaziorik behar erabilera apalerako eta CORS gaituta dauka.
 * Ikus: https://jina.ai/reader/
 */
async function scrapeWithJina(url: string): Promise<ScrapedMeta> {
  const endpoint = `https://r.jina.ai/${url}`;
  const r = await fetch(endpoint, {
    cache: 'no-store',
    headers: { Accept: 'application/json', 'X-Return-Format': 'json' },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const json = (await r.json()) as {
    code?: number;
    data?: {
      title?: string;
      description?: string;
      content?: string;
      url?: string;
      publishedTime?: string;
      images?: Record<string, string>;
    };
  };
  const d = json.data;
  if (!d) throw new Error('erantzun hutsa');
  const title = (d.title || '').trim();
  if (!title) throw new Error('izenbururik gabe');
  let description = (d.description || '').trim();
  if (!description && d.content) {
    description = d.content.replace(/\s+/g, ' ').trim().slice(0, 280);
  }
  let image: string | null = null;
  if (d.images && typeof d.images === 'object') {
    const first = Object.values(d.images).find((v) => typeof v === 'string');
    if (first) image = first;
  }
  return {
    title,
    description,
    image,
    publishedAt: d.publishedTime || null,
    sourceName: hostnameFromUrl(url),
  };
}

function buildFallbackFromUrl(url: string): ScrapedMeta {
  const host = hostnameFromUrl(url);
  let pathTitle = '';
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop() || '';
    pathTitle = decodeURIComponent(last)
      .replace(/[-_]+/g, ' ')
      .replace(/\.(html?|php|aspx?)$/i, '')
      .trim();
  } catch {
    /* ignore */
  }
  return {
    title: pathTitle || host,
    description: '',
    image: null,
    publishedAt: null,
    sourceName: host,
  };
}

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Ezezaguna';
  }
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
