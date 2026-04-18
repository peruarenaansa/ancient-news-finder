import matter from 'gray-matter';

export type ArticleType = 'article' | 'note';

export interface Article {
  slug: string;
  type: ArticleType;
  title: string;
  subtitle?: string;
  date: string; // ISO
  author?: string;
  image?: string;
  tags?: string[];
  excerpt?: string;
  body: string; // markdown
  source?: { name: string; url: string };
}

// Vite glob: Markdown fitxategi guztiak eraikuntza-garaian inportatu.
const articleFiles = import.meta.glob('/content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const noteFiles = import.meta.glob('/content/notes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parse(path: string, raw: string, type: ArticleType): Article {
  const { data, content } = matter(raw);
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  return {
    slug,
    type,
    title: data.title ?? slug,
    subtitle: data.subtitle,
    date: data.date ?? new Date().toISOString(),
    author: data.author,
    image: data.image,
    tags: data.tags ?? [],
    excerpt: data.excerpt,
    body: content,
    source: data.source,
  };
}

export function getAllContent(): Article[] {
  const all: Article[] = [
    ...Object.entries(articleFiles).map(([p, r]) => parse(p, r, 'article')),
    ...Object.entries(noteFiles).map(([p, r]) => parse(p, r, 'note')),
  ];
  return all.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getArticles(): Article[] {
  return getAllContent().filter((a) => a.type === 'article');
}

export function getNotes(): Article[] {
  return getAllContent().filter((a) => a.type === 'note');
}

export function getBySlug(slug: string): Article | undefined {
  return getAllContent().find((a) => a.slug === slug);
}
