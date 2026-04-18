export type ArticleType = 'article' | 'note';

export interface Article {
  slug: string;
  type: ArticleType;
  title: string;
  subtitle?: string;
  date: string;
  author?: string;
  image?: string;
  tags?: string[];
  excerpt?: string;
  body: string;
  source?: { name: string; url: string };
}

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

// Frontmatter parser sinplea (YAML azpimultzo bat: string, zenbaki, zerrenda eta objektu lauak).
function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, fm, content] = match;
  const data: Record<string, any> = {};
  const lines = fm.split(/\r?\n/);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) {
      i++;
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const [, key, rest] = m;
    const val = rest.trim();

    if (val === '') {
      // Begiratu hurrengo lerroak: zerrenda (- ...) ala objektu nested (sangratuta)
      const items: string[] = [];
      const obj: Record<string, string> = {};
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j];
        const listMatch = next.match(/^\s+-\s+(.*)$/);
        const objMatch = next.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
        if (listMatch) {
          items.push(stripQuotes(listMatch[1].trim()));
          j++;
        } else if (objMatch) {
          obj[objMatch[1]] = stripQuotes(objMatch[2].trim());
          j++;
        } else {
          break;
        }
      }
      if (items.length) data[key] = items;
      else if (Object.keys(obj).length) data[key] = obj;
      else data[key] = '';
      i = j;
    } else if (val === '[]') {
      data[key] = [];
      i++;
    } else {
      data[key] = stripQuotes(val);
      i++;
    }
  }

  return { data, content: content ?? '' };
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    try {
      return JSON.parse(s.startsWith("'") ? `"${s.slice(1, -1).replace(/"/g, '\\"')}"` : s);
    } catch {
      return s.slice(1, -1);
    }
  }
  return s;
}

function parse(path: string, raw: string, type: ArticleType): Article {
  const { data, content } = parseFrontmatter(raw);
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  return {
    slug,
    type,
    title: data.title ?? slug,
    subtitle: data.subtitle,
    date: data.date ?? new Date().toISOString(),
    author: data.author,
    image: data.image,
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: data.excerpt,
    body: content,
    source: data.source && typeof data.source === 'object' ? data.source : undefined,
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
