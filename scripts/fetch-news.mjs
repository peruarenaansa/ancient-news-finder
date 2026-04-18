// Arkeologia albiste-biltzailea — RSS bilketa script-a
// GitHub Actions-ek orduro exekutatzen du. public/news.json sortzen du.

import Parser from 'rss-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCES = JSON.parse(
  await fs.readFile(path.join(__dirname, 'sources.json'), 'utf8')
);

// Gako-hitzen bidezko etiketatzea (gai eta eskualdea)
const TOPIC_KEYWORDS = {
  prehistoria: ['prehistor', 'paleolit', 'neolit', 'mesolit', 'bronze', 'iron age', 'edad de bronce', 'edad de hierro', 'preistoria', 'préhistoire', 'urzaharra'],
  erromatarrak: ['roman', 'roma ', 'romano', 'romain', 'römisch', 'erromatar', 'pompei', 'caesar', 'imperio romano', 'empire romain'],
  'erdi-aroa': ['medieval', 'middle ages', 'edad media', 'moyen âge', 'mittelalter', 'erdi aro', 'viking', 'castle', 'castillo', 'monaster'],
  egiptoarrak: ['egypt', 'egipto', 'égypte', 'pharaoh', 'faraón', 'pirámide', 'pyramid', 'tutankham', 'nile', 'nilo'],
  greziarrak: ['greek', 'griego', 'grec', 'griechisch', 'athen', 'atena', 'sparta', 'mycen', 'minoan', 'helenist'],
  iberiarrak: ['iberian', 'íbero', 'ibero', 'celtibero', 'celtíbero', 'tartess', 'vasc', 'euskal', 'aquitan', 'navarra', 'gipuzkoa', 'bizkaia', 'araba', 'iparralde'],
  'ekialde-hurbila': ['mesopotam', 'sumer', 'babilon', 'asyri', 'asiri', 'persia', 'hittite', 'hitita', 'levant', 'jerusalem', 'jericó', 'jericho'],
  amerika: ['maya', 'azteca', 'aztec', 'inca', 'olmec', 'precolomb', 'pre-columb', 'andes', 'mesoamer', 'teotihuac'],
  asia: ['china', 'japan', 'japón', 'korea', 'india', 'indus', 'angkor', 'khmer', 'mongol'],
  museoak: ['museum', 'museo', 'musée', 'exhibition', 'exposición', 'erakusketa'],
  aurkikuntza: ['discover', 'descubr', 'découvert', 'aurkitu', 'unearth', 'excav', 'excavac', 'fund'],
};

const REGION_KEYWORDS = {
  basque: ['euskal', 'vasco', 'basque', 'navarra', 'navarre', 'gipuzkoa', 'guipúzcoa', 'bizkaia', 'vizcaya', 'araba', 'álava', 'iparralde', 'iruñea', 'pamplona', 'donostia', 'bilbao', 'baiona', 'bayonne'],
  iberia: ['españa', 'spain', 'portugal', 'iberia', 'ibérica', 'península'],
  europe: ['europe', 'europa', 'francia', 'france', 'italia', 'italy', 'germany', 'alemania', 'reino unido', 'united kingdom', 'greece', 'grecia'],
};

function detectTopics(text) {
  const lower = text.toLowerCase();
  const tags = new Set();
  for (const [tag, kws] of Object.entries(TOPIC_KEYWORDS)) {
    if (kws.some((k) => lower.includes(k))) tags.add(tag);
  }
  return [...tags];
}

function detectRegion(text, sourceRegion) {
  const lower = text.toLowerCase();
  if (REGION_KEYWORDS.basque.some((k) => lower.includes(k))) return 'basque';
  if (REGION_KEYWORDS.iberia.some((k) => lower.includes(k))) return 'iberia';
  if (REGION_KEYWORDS.europe.some((k) => lower.includes(k))) return 'europe';
  return sourceRegion || 'world';
}

// Iragazi arkeologia/historia ez direnak (iturri orokorretarako)
const ARCHAEOLOGY_KEYWORDS = [
  'arche', 'arch', 'arqueol', 'arkeolo', 'archéo', 'archäo',
  'history', 'historia', 'histoire', 'geschichte',
  'ancient', 'antig', 'antik', 'antique',
  'excav', 'dig ', 'yacimien', 'aztarna', 'site arché', 'fundstätte',
  'museo', 'museum', 'musée',
  'prehistor', 'paleolit', 'neolit', 'roman', 'medieval', 'edad media', 'moyen âge', 'mittelalter',
  'erromatar', 'erdi aro', 'aurkikuntza', 'descubrimiento', 'discovery', 'découverte',
  'fossil', 'fósil', 'tumba', 'tomb', 'tombe', 'burial', 'enterr',
  'ruins', 'ruinas', 'ruines', 'hondakin',
];

// Iturri orokorrak: gaiagatik iragazi behar direnak (ez dira espezializatuak)
const GENERAL_SOURCES = new Set([
  'elpais-cultura', 'abc-cultura', 'eldiario-cultura', 'lemonde-sciences',
  'live-science-arch', 'phys-arch', 'sciencedaily-arch', 'nature-arch',
  'eitb-kultura', 'eitb-albisteak', 'berria', 'berria-azala', 'argia', 'naiz-kultura',
  'diariovasco-cultura', 'noticiasdegipuzkoa-cultura', 'deia-cultura',
  'noticiasdenavarra-cultura', 'mediabask',
  'lefigaro-histoire', 'geo-histoire', 'sudouest-culture', 'francebleu-paysbasque',
  'futura-archeo',
  'praza-cultura', 'nosdiario-cultura', 'galiciaconfidencial-cultura',
  'vilaweb-cultura', 'ara-cultura', 'elnacional-cultura-cat',
  'publico-cultura-pt', 'observador-cultura', 'rtp-cultura',
  'ansa-cultura', 'repubblica-cultura', 'corriere-cultura',
]);

function isArchaeologyRelated(text) {
  const lower = text.toLowerCase();
  return ARCHAEOLOGY_KEYWORDS.some((k) => lower.includes(k));
}

// 1000. urtetik aurrerako (XI. mendetik aurrera) gaiak baztertzeko gako-hitzak
const MODERN_KEYWORDS = [
  // Mendeak: XI.etik aurrera (1000+)
  'siglo xi', 'siglo xii', 'siglo xiii', 'siglo xiv', 'siglo xv',
  'siglo xvi', 'siglo xvii', 'siglo xviii', 'siglo xix', 'siglo xx', 'siglo xxi',
  'xi mendea', 'xii mendea', 'xiii mendea', 'xiv mendea', 'xv mendea',
  'xvi mendea', 'xvii mendea', 'xviii mendea', 'xix mendea', 'xx mendea', 'xxi mendea',
  '11th century', '12th century', '13th century', '14th century', '15th century',
  '16th century', '17th century', '18th century', '19th century', '20th century', '21st century',
  'xie siècle', 'xiie siècle', 'xiiie siècle', 'xive siècle', 'xve siècle',
  'xvie siècle', 'xviie siècle', 'xviiie siècle', 'xixe siècle', 'xxe siècle', 'xxie siècle',
  '11. jahrhundert', '12. jahrhundert', '13. jahrhundert', '14. jahrhundert', '15. jahrhundert',
  '16. jahrhundert', '17. jahrhundert', '18. jahrhundert', '19. jahrhundert', '20. jahrhundert',
  // Erdi Aro beranduagoko eta ondorengo aroak
  'late medieval', 'high medieval', 'baja edad media', 'plena edad media', 'bas moyen âge', 'spätmittelalter',
  'edad moderna', 'edad contemporánea', 'aro modernoa', 'aro garaikidea',
  'modern era', 'early modern', 'contemporary history', 'industrial revolution',
  'temps modernes', 'époque moderne', 'époque contemporaine', 'révolution industrielle',
  'neuzeit', 'frühe neuzeit', 'industrielle revolution',
  // Erdi Aro beranduagoko gertaerak/figurak (1000+)
  'crusade', 'cruzada', 'croisade', 'kreuzzug',
  'reconquista', 'reconquête',
  'gothic', 'gótico', 'gothique', 'gotik', 'romanesque', 'románico', 'romanik',
  'templar', 'templario', 'templier', 'tempelritter',
  'cathar', 'cátaro', 'inquisition', 'inquisición',
  'black death', 'peste negra', 'peste noire', 'schwarzer tod',
  'hundred years', 'guerra de los cien años', 'guerre de cent ans',
  // Gertaera modernoak
  'world war', 'segunda guerra mundial', 'primera guerra mundial', 'guerra civil',
  'guerre mondiale', 'weltkrieg', 'cold war', 'guerra fría',
  'napoleon', 'napoleón', 'franco', 'hitler', 'stalin', 'mussolini',
  'colonial', 'colonización', 'colonization', 'colonisation', 'kolonial',
  'ilustración', 'enlightenment', 'lumières', 'aufklärung',
  'revolución francesa', 'french revolution', 'révolution française',
  'renacimiento', 'renaissance', 'wiedergeburt',
];

// 1000. urtea arteko gai garbiak: iragazkia gainditzen dute beti
const PRE_MODERN_STRONG = [
  'prehistor', 'paleolit', 'neolit', 'mesolit', 'calcolít', 'edad de bronce', 'edad de hierro',
  'bronze age', 'iron age', 'âge du bronze', 'âge du fer', 'bronzezeit', 'eisenzeit',
  'roman', 'romano', 'romain', 'römisch', 'erromatar', 'imperio romano', 'empire romain',
  'antigüedad', 'antiquity', 'antiquité', 'antike',
  'egypt', 'egipto', 'égypte', 'pharaoh', 'faraón', 'pyramid', 'pirámide',
  'greek', 'griego', 'grec', 'griechisch', 'mycen', 'minoan',
  'mesopotam', 'sumer', 'babilon', 'asyri', 'hittite', 'hitita',
  'celta', 'celtic', 'celtibero', 'íbero', 'ibero', 'tartess', 'visigod', 'visigoth',
  'merov', 'caroling', 'carolingian', 'carolingio', 'carolingien',
  // Erdi Aro goiztiarra (500-1000): onartzen dira
  'early medieval', 'alta edad media', 'haut moyen âge', 'frühmittelalter',
  'anglo-saxon', 'anglosajón', 'anglo-sajón', 'angelsachsen',
  // Bikingoak: gehienbat 793-1066, mugan, baina onartzen ditugu
  'viking', 'vikingo', 'wikinger',
];

function isModernEra(text) {
  const lower = text.toLowerCase();
  // Erdi Aroko gai garbi bat aipatzen badu, onartu (modernoa ere aipa lezake testuinguruan)
  if (PRE_MODERN_STRONG.some((k) => lower.includes(k))) return false;
  // Modernotasun-marka argia badu, baztertu
  return MODERN_KEYWORDS.some((k) => lower.includes(k));
}

function extractImage(item) {
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  const html = item['content:encoded'] || item.content || item.summary || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function summarize(text, max = 240) {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'ArchaeoNewsBot/1.0 (+https://github.com)' },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
});

async function fetchSource(source) {
  const startedAt = Date.now();
  try {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).slice(0, 30);
    let droppedOffTopic = 0;
    let droppedModern = 0;
    const filtered = items
      .map((item) => {
        const title = item.title || '';
        const description = stripHtml(item.contentSnippet || item.content || item.summary || '');
        const text = `${title} ${description}`;

        // 1) Iturri orokorretarako: arkeologia/historiarekin lotuta egon behar du
        if (GENERAL_SOURCES.has(source.id) && !isArchaeologyRelated(text)) {
          droppedOffTopic++;
          return null;
        }

        // 2) Erdi Aro ondorengo gaiak baztertu (denentzat)
        if (isModernEra(text)) {
          droppedModern++;
          return null;
        }

        const url = item.link || item.guid;
        if (!url) return null;

        return {
          id: `${source.id}:${url}`,
          title: stripHtml(title),
          summary: summarize(description, 280),
          url,
          image: extractImage(item),
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          source: { id: source.id, name: source.name },
          lang: source.lang,
          region: detectRegion(text, source.region),
          topics: detectTopics(text),
        };
      })
      .filter(Boolean);
    const elapsed = Date.now() - startedAt;
    console.log(`✓ ${source.name}: ${filtered.length}/${items.length} albiste (off-topic: ${droppedOffTopic}, modern: ${droppedModern}, ${elapsed}ms)`);
    return {
      items: filtered,
      status: { id: source.id, ok: true, fetched: items.length, kept: filtered.length, droppedOffTopic, droppedModern, elapsedMs: elapsed },
    };
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    console.warn(`✗ ${source.name} (${source.url}): ${err.message}`);
    return {
      items: [],
      status: { id: source.id, ok: false, error: err.message, elapsedMs: elapsed },
    };
  }
}

async function main() {
  console.log(`\n📜 Bilketa hasten... ${SOURCES.length} iturri\n`);

  const results = await Promise.all(SOURCES.map(fetchSource));
  const all = results.flatMap((r) => r.items);
  const statusById = Object.fromEntries(results.map((r) => [r.status.id, r.status]));

  // Deduplikazioa URLaren bidez
  const seen = new Map();
  for (const item of all) {
    if (!seen.has(item.url)) seen.set(item.url, item);
  }

  const deduped = [...seen.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Azken 90 egunetakoak bakarrik mantendu, eta gehienez 500
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recent = deduped
    .filter((i) => new Date(i.publishedAt).getTime() > cutoff)
    .slice(0, 500);

  const out = {
    generatedAt: new Date().toISOString(),
    count: recent.length,
    sources: SOURCES.map((s) => ({
      id: s.id,
      name: s.name,
      lang: s.lang,
      region: s.region,
      kind: s.kind || 'news',
      ...statusById[s.id],
    })),
    items: recent,
  };

  const outPath = path.join(ROOT, 'public', 'news.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');

  const failed = results.filter((r) => !r.status.ok).length;
  console.log(`\n✅ ${recent.length} albiste idatzi dira: public/news.json`);
  console.log(`   ${SOURCES.length - failed}/${SOURCES.length} iturri ondo${failed ? ` — ${failed} hutsegite` : ''}`);
}

main().catch((err) => {
  console.error('Errore larria:', err);
  process.exit(1);
});

