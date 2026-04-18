import type { NewsItem } from './news-types';

// GitHub-en "new file" URL bat sortzen du, kanpoko albiste batetik abiatuta,
// CMSean editatzeko prest dagoen markdown zirriborro batekin.
//
// Ingurune-aldagaiak (Vite): VITE_GITHUB_OWNER, VITE_GITHUB_REPO, VITE_GITHUB_BRANCH (defektuz "main").
// Hauek ezarri ezean, sortutako URL-a oraindik baliagarria izango da, baina aldatu beharko duzu.

const OWNER = import.meta.env.VITE_GITHUB_OWNER ?? 'OWNER';
const REPO = import.meta.env.VITE_GITHUB_REPO ?? 'REPO';
const BRANCH = import.meta.env.VITE_GITHUB_BRANCH ?? 'main';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function todayISO(): string {
  return new Date().toISOString();
}

function frontmatter(item: NewsItem, kind: 'article' | 'note'): string {
  const date = todayISO();
  const tags = item.topics?.length ? item.topics : [];
  const yamlTags = tags.length
    ? `tags:\n${tags.map((t) => `  - ${t}`).join('\n')}`
    : 'tags: []';

  if (kind === 'note') {
    return [
      '---',
      `title: ${JSON.stringify(item.title)}`,
      `date: ${date}`,
      yamlTags,
      `excerpt: ${JSON.stringify(item.summary || '')}`,
      '---',
      '',
      `${item.summary || ''}`,
      '',
      `**Iturria**: [${item.source.name}](${item.url})`,
      '',
    ].join('\n');
  }

  // article
  return [
    '---',
    `title: ${JSON.stringify(item.title)}`,
    `subtitle: ""`,
    `date: ${date}`,
    `author: ""`,
    item.image ? `image: ${item.image}` : `# image: `,
    yamlTags,
    `excerpt: ${JSON.stringify(item.summary || '')}`,
    'source:',
    `  name: ${JSON.stringify(item.source.name)}`,
    `  url: ${item.url}`,
    '---',
    '',
    '> Zirriborro automatikoa kanpo-iturri batetik abiatuta. Editatu eta osatu argitaratu aurretik.',
    '',
    `## Laburpena`,
    '',
    item.summary || '',
    '',
    '## Garapena',
    '',
    '_(Hemen idatzi artikulu landuaren testua)_',
    '',
    '---',
    '',
    `Jatorrizko iturria: [${item.source.name}](${item.url})`,
    '',
  ].join('\n');
}

export function buildCreateOnGithubUrl(item: NewsItem, kind: 'article' | 'note'): string {
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${today}-${slugify(item.title)}.md`;
  const folder = kind === 'note' ? 'content/notes' : 'content/articles';
  const value = frontmatter(item, kind);
  // GitHub "new file" URL: query params filename + value
  const url = new URL(`https://github.com/${OWNER}/${REPO}/new/${BRANCH}/${folder}`);
  url.searchParams.set('filename', filename);
  url.searchParams.set('value', value);
  return url.toString();
}
