export type NewsLang = 'eu' | 'es' | 'en' | 'fr' | 'de' | 'it';
export type NewsRegion = 'basque' | 'iberia' | 'europe' | 'world';

export interface NewsSource {
  id: string;
  name: string;
  lang?: NewsLang;
  region?: NewsRegion;
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
  prehistoria: 'Prehistoria',
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
  world: 'Mundua',
};

export const LANG_LABELS: Record<NewsLang, string> = {
  eu: 'Euskara',
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
};

export const LANG_FLAGS: Record<NewsLang, string> = {
  eu: '🟢',
  es: '🇪🇸',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};
