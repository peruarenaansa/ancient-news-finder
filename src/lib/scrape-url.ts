import type { NewsItem, NewsLang, NewsRegion } from '@/lib/news-types';

/**
 * Eskuz gehitutako artikulu baterako NewsItem bat eraikitzen du.
 * Erabiltzaileak titulua eta (aukeran) laburpena ematen ditu eskuz.
 */
export function buildManualNewsItem(params: {
  url: string;
  title: string;
  summary?: string;
  lang: NewsLang;
  region: NewsRegion;
}): NewsItem {
  const { url, title, summary, lang, region } = params;
  const id = `manual:${slugify(url)}`;
  const sourceId = `manual:${safeHostname(url)}`;
  return {
    id,
    title: title.trim(),
    summary: (summary || '').trim(),
    url,
    image: null,
    publishedAt: new Date().toISOString(),
    source: { id: sourceId, name: safeHostname(url) },
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
