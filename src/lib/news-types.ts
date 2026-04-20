export type NewsLang = 'eu' | 'es' | 'en' | 'fr' | 'it' | 'ca' | 'gl' | 'pt';
export type NewsRegion = 'basque' | 'iberia' | 'europe' | 'near-east' | 'america' | 'asia' | 'world';

export interface NewsSource {
  id: string;
  name: string;
  lang?: NewsLang;
  region?: NewsRegion;
  kind?: string;
  ok?: boolean;
  fetched?: number;
  kept?: number;
  droppedOffTopic?: number;
  droppedModern?: number;
  elapsedMs?: number;
  error?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { id: string; name: string };
  lang: NewsLang;
  region: NewsRegion;
  topics: string[];
}

export interface NewsFeed {
  generatedAt: string;
  count: number;
  sources: NewsSource[];
  items: NewsItem[];
}

export const TOPIC_LABELS: Record<string, string> = {
  prehistoria: 'Historiaurrea',
  erromatarrak: 'Erromatarrak',
  'erdi-aroa': 'Erdi Aroa',
  egiptoarrak: 'Egiptoarrak',
  greziarrak: 'Greziarrak',
  iberiarrak: 'Iberiarrak / Euskal Herria',
  'ekialde-hurbila': 'Ekialde Hurbila',
  amerika: 'Amerika prekolonbiarra',
  asia: 'Asia',
  museoak: 'Museoak / Erakusketak',
  aurkikuntza: 'Aurkikuntza berriak',
};

export const REGION_LABELS: Record<NewsRegion, string> = {
  basque: 'Euskal Herria',
  iberia: 'Iberiar penintsula',
  europe: 'Europa',
  'near-east': 'Ekialde Hurbila',
  america: 'Amerika prekolonbiarra',
  asia: 'Asia',
  world: 'Mundua',
};

export const LANG_LABELS: Record<NewsLang, string> = {
  eu: 'Euskara',
  es: 'Español',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  ca: 'Català',
  gl: 'Galego',
  pt: 'Português',
};

export const LANG_FLAGS: Record<NewsLang, string> = {
  eu: '🟢',
  es: '🇪🇸',
  en: '🇬🇧',
  fr: '🇫🇷',
  it: '🇮🇹',
  ca: '🟡',
  gl: '🔵',
  pt: '🇵🇹',
};
