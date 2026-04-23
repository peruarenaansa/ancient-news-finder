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

// Arkeologia/aurrehistoria/antzinaroarekin lotura ZUZENA duten gako-hitzak.
// Iturri orokorretarako: hauetako bat aipatzen ez badu, baztertu.
const ARCHAEOLOGY_KEYWORDS = [
  // Diziplina
  'arqueolog', 'arkeolog', 'archéolog', 'archaeolog', 'archeolog', 'archäolog',
  'paleontolog', 'paleoantropolog', 'paleolingüís',
  // Indusketak eta aztarnategiak
  'excavac', 'excavación', 'excavation', 'fouille', 'ausgrabung',
  'yacimien', 'aztarnategi', 'site archéo', 'fundstätte', 'archaeological site',
  // Aurrehistoria/Antzinaroa
  'prehistor', 'préhistoire', 'preistoria', 'urzaharra',
  'paleolít', 'paleolithic', 'paléolithique', 'paleolitico',
  'mesolít', 'mesolithic', 'mésolithique',
  'neolít', 'neolithic', 'néolithique', 'neolitico',
  'calcolít', 'chalcolithic', 'calcolitico',
  'edad de bronce', 'bronze age', 'âge du bronze', 'età del bronzo', 'brontzearo',
  'edad de hierro', 'iron age', 'âge du fer', 'età del ferro', 'burdin aro',
  'megalit', 'dolmen', 'menhir', 'tumul', 'túmul', 'cromlech',
  'arte rupestre', 'rock art', 'art rupestre', 'pintura rupestre', 'cave painting',
  // Antzinaroa
  'antigüedad clásica', 'classical antiquity', 'antiquité classique', 'antichità',
  'romano', 'romain', 'römisch', 'erromatar', 'imperio romano', 'empire romain', 'roman empire', 'roman period',
  'griego antiguo', 'ancient greek', 'grèce antique', 'antico greco',
  'egipto antiguo', 'ancient egypt', 'égypte ancienne', 'antico egitto',
  'mesopotam', 'sumer', 'babilon', 'asiri', 'asyri', 'fenici', 'phoenic',
  'íbero', 'ibero', 'celta', 'celtic', 'celtíbero', 'celtibero', 'tartess', 'visigod', 'visigoth',
  'pompei', 'pompey', 'herculan', 'troya', 'troy', 'cartago', 'carthag', 'micena', 'mycen', 'minoa', 'minoan',
  'pharaoh', 'faraón', 'pyramid', 'pirámide', 'pyramide', 'piramide',
  // Goi Erdi Aroa (500-1000)
  'alta edad media', 'early medieval', 'haut moyen âge', 'frühmittelalter', 'altomedieva',
  'merovingi', 'carolingi', 'visigod', 'anglosajón', 'anglo-saxon', 'angelsachsen',
  'viking', 'vikingo', 'wikinger',
  // Aurkikuntza arkeologikoak
  'hallazgo arqueológic', 'descubrimiento arqueológic', 'archaeological discovery', 'découverte archéologique',
  'tumba antigua', 'ancient tomb', 'tombe antique', 'sepultura antigua',
  'fósil', 'fossil', 'fossile', 'fosil',
  'osamenta', 'restos humanos antiguos', 'ancient human remains', 'restes humains',
  'aztarna arkeolog',
];

// Iturri orokorrak: gaiagatik iragazi behar direnak (ez dira espezializatuak)
const GENERAL_SOURCES = new Set([
  // Hedabide orokorrak (kultura sailak)
  'elpais-cultura', 'eldiario-cultura',
  'diariovasco-cultura',
  'lemonde-sciences', 'lemonde-archeo', 'lefigaro-histoire',
  'francetvinfo-archeo', 'sciencesetavenir-archeo', 'sudouest-culture',
  'ansa-cultura', 'repubblica-cultura', 'corriere-cultura',
  // Zientzia orokorra
  'live-science-arch', 'sciencedaily-arch',
  // Arkeologia espezializatua baina batzuetan zabalegia
  'ancient-origins', 'bbc-history',
  // Indusketa-agentzia: monumentu modernoetan ere lan egiten du
  'inrap',
  // Aldizkari orokorrak (gaiagatik iragazi)
  'jas-reports', 'sciencedirect-jas',
]);

function isArchaeologyRelated(text) {
  const lower = text.toLowerCase();
  return ARCHAEOLOGY_KEYWORDS.some((k) => lower.includes(k));
}

// Argi ez-arkeologikoak diren gaiak: aurkitzen badira, beti baztertu
const OFF_TOPIC_KEYWORDS = [
  // Zinema eta telesailak
  'película', 'film', 'cine ', 'cinema', 'movie', 'tráiler', 'trailer', 'estreno', 'box office',
  'serie de televisión', 'tv series', 'telesail', 'netflix', 'hbo', 'amazon prime', 'disney+',
  'temporada ', 'episode', 'episodio', 'capítulo de la serie',
  'festival de cine', 'film festival', 'festival du film', 'festival cinema',
  'oscar', 'goya award', 'premios goya', 'cannes', 'berlinale', 'san sebastián',
  'director de cine', 'filmmaker', 'cinéaste', 'actor', 'actriz', 'actress',
  // Zezenketak
  'toros', 'toreo', 'torero', 'corrida', 'tauromaquia', 'matador', 'plaza de toros',
  // Musika garaikidea
  'concierto', 'concert', 'gira ', 'tour musical', 'álbum', 'single ', 'spotify',
  'pop ', 'rock ', 'rap ', 'reggaeton', 'eurovisión', 'eurovision',
  // Literatura garaikidea
  'novela ', 'novel ', 'roman ', 'romanzo', 'eleberri',
  'best seller', 'bestseller', 'feria del libro', 'book fair', 'sant jordi',
  'premio nobel', 'nobel prize', 'premio planeta', 'premio cervantes', 'booker prize',
  'escritor contemporáneo', 'contemporary writer',
  // Arte garaikidea
  'arte contemporáneo', 'contemporary art', 'art contemporain',
  'goya pintor', 'picasso', 'dalí', 'miró', 'kandinsky', 'warhol',
  // Crossword/jolasak
  'crossword', 'crucigrama', 'mots croisés', 'puzzle', 'quiz',
  // Politika/kirola
  'fútbol', 'football', 'soccer', 'baloncesto', 'basketball',
  'elecciones', 'election', 'gobierno', 'parlamento',
];

function isOffTopic(text) {
  const lower = text.toLowerCase();
  return OFF_TOPIC_KEYWORDS.some((k) => lower.includes(k));
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
  'xi secolo', 'xii secolo', 'xiii secolo', 'xiv secolo', 'xv secolo',
  'xvi secolo', 'xvii secolo', 'xviii secolo', 'xix secolo', 'xx secolo', 'xxi secolo',
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
  'illuminati', 'iluminados de baviera',
  'notre-dame de paris', 'notre dame de paris', 'catedral de notre',
  // Gertaera modernoak
  'world war', 'segunda guerra mundial', 'primera guerra mundial', 'guerra civil',
  'guerre mondiale', 'weltkrieg', 'cold war', 'guerra fría',
  'napoleon', 'napoleón', 'franco', 'hitler', 'stalin', 'mussolini',
  'colonial', 'colonización', 'colonization', 'colonisation', 'kolonial',
  'ilustración', 'enlightenment', 'lumières', 'aufklärung',
  'revolución francesa', 'french revolution', 'révolution française',
  'renacimiento', 'renaissance', 'wiedergeburt',
  'goya ', 'velázquez', 'el greco', 'rembrandt', 'caravaggio',
  'reina regente', 'crucero ', 'acorazado', 'fragata del siglo',
];

// Aro modernoetako urteen patroia (1500-2099)
// Albiste gehienetan urte zehatzak agertzen dira (1789, 1895, 2026...)
const MODERN_YEAR_REGEX = /\b(1[5-9]\d{2}|20\d{2})\b/;

// 1000. urtea arteko gai garbiak: iragazkia gainditzen dute beti
const PRE_MODERN_STRONG = [
  'prehistor', 'paleolit', 'neolit', 'mesolit', 'calcolít', 'calcolithic',
  'edad de bronce', 'edad de hierro',
  'bronze age', 'iron age', 'âge du bronze', 'âge du fer', 'bronzezeit', 'eisenzeit',
  'romano', 'romain', 'römisch', 'erromatar', 'imperio romano', 'empire romain', 'roman empire', 'roman period',
  'antigüedad clásica', 'classical antiquity', 'antiquité classique',
  'egipto antiguo', 'ancient egypt', 'égypte ancienne',
  'pharaoh', 'faraón', 'pyramid of', 'pirámide de', 'pyramide de',
  'ancient greek', 'griego antiguo', 'grèce antique', 'mycen', 'minoan', 'minoic', 'minoica',
  'mesopotam', 'sumer', 'babilon', 'asyri', 'asiri', 'hittite', 'hitita', 'fenici', 'phoenic',
  'celta', 'celtic', 'celtibero', 'celtíbero', 'íbero', 'ibero', 'tartess', 'visigod', 'visigoth',
  'merov', 'caroling', 'carolingian', 'carolingio', 'carolingien',
  // Erdi Aro goiztiarra (500-1000): onartzen dira
  'early medieval', 'alta edad media', 'haut moyen âge', 'frühmittelalter',
  'anglo-saxon', 'anglosajón', 'anglo-sajón', 'angelsachsen',
  // Bikingoak: gehienbat 793-1066, mugan, baina onartzen ditugu
  'viking', 'vikingo', 'wikinger',
  // Aurrehistoriako urteak (a.C., BC, av. J.-C.)
  'a.c.', 'a. c.', 'a.n.e', 'antes de cristo', 'avant j.-c', 'av. j.-c', ' bc ', ' bce ', 'b.c.e',
];

function isModernEra(text) {
  const lower = text.toLowerCase();
  // Erdi Aroko gai garbi bat aipatzen badu, onartu (modernoa ere aipa lezake testuinguruan)
  if (PRE_MODERN_STRONG.some((k) => lower.includes(k))) return false;
  // Modernotasun-marka argia badu, baztertu
  if (MODERN_KEYWORDS.some((k) => lower.includes(k))) return true;
  // Aro modernoko urte bat (1500-2099) eta antzinatasun-markarik ez → baztertu
  if (MODERN_YEAR_REGEX.test(lower)) return true;
  return false;
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
  headers: {
    // Webgune askok botak blokeatzen dituzte; nabigatzaile-itxurako User-Agent erabiltzen dugu.
    'User-Agent':
      'Mozilla/5.0 (compatible; ArchaeoNewsBot/1.0; +https://aztarnak.lovable.app) Chrome/120 Safari/537.36',
    Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8',
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
});

// OpenAlex API: aldizkari akademikoetarako (RSSrik ez dutenak)
// kind:'openalex' + issn edo openalexId zehaztu sources.json-en
async function fetchOpenAlexSource(source) {
  const startedAt = Date.now();
  try {
    const filterParts = [];
    if (source.issn) {
      filterParts.push(`primary_location.source.issn:${source.issn}`);
    } else if (source.openalexId) {
      filterParts.push(`primary_location.source.id:${source.openalexId}`);
    } else {
      throw new Error('OpenAlex iturriak issn edo openalexId behar du');
    }
    // Aukerako kontzeptu-iragazkia: arkeologia (C166957645) bezalakoak.
    // PNAS bezalako iturri orokorretan, gaiari lotutako artikuluak bakarrik ekartzeko.
    if (source.conceptId) {
      filterParts.push(`concepts.id:${source.conceptId}`);
    }
    const filter = filterParts.join(',');
    const url = `https://api.openalex.org/works?filter=${filter}&sort=publication_date:desc&per-page=30&mailto=archaeo-news-bot@example.com`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ArchaeoNewsBot/1.0 (mailto:archaeo-news-bot@example.com)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const works = data.results || [];
    let droppedOffTopic = 0;
    let droppedModern = 0;
    const filtered = works
      .map((w) => {
        const title = w.title || w.display_name || '';
        // Abstract OpenAlex-en inverted index gisa dator → berreraiki
        let abstract = '';
        if (w.abstract_inverted_index) {
          const positions = [];
          for (const [word, idxs] of Object.entries(w.abstract_inverted_index)) {
            for (const i of idxs) positions[i] = word;
          }
          abstract = positions.filter(Boolean).join(' ');
        }
        const text = `${title} ${abstract}`;

        if (isOffTopic(text)) { droppedOffTopic++; return null; }
        if (isModernEra(text)) { droppedModern++; return null; }

        const link = w.primary_location?.landing_page_url || w.doi || w.id;
        if (!link) return null;

        return {
          id: `${source.id}:${w.id}`,
          title: stripHtml(title),
          summary: summarize(abstract || title, 280),
          url: link,
          image: null,
          publishedAt: w.publication_date
            ? new Date(w.publication_date).toISOString()
            : new Date().toISOString(),
          source: { id: source.id, name: source.name },
          lang: source.lang,
          region: detectRegion(text, source.region),
          topics: detectTopics(text),
        };
      })
      .filter(Boolean);
    const elapsed = Date.now() - startedAt;
    console.log(`✓ ${source.name} [openalex]: ${filtered.length}/${works.length} albiste (off-topic: ${droppedOffTopic}, modern: ${droppedModern}, ${elapsed}ms)`);
    return {
      items: filtered,
      status: { id: source.id, ok: true, fetched: works.length, kept: filtered.length, droppedOffTopic, droppedModern, elapsedMs: elapsed },
    };
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    console.warn(`✗ ${source.name} [openalex]: ${err.message}`);
    return {
      items: [],
      status: { id: source.id, ok: false, error: err.message, elapsedMs: elapsed },
    };
  }
}

// Iturri bakoitzeko denbora-muga gogorra (rss-parser-en timeout-a ez baita beti betetzen)
const HARD_TIMEOUT_MS = 20000;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Denbora-muga gainditua (${ms}ms) — ${label}`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function fetchSource(source) {
  if (source.kind === 'openalex') {
    return withTimeout(fetchOpenAlexSource(source), HARD_TIMEOUT_MS, source.id).catch((err) => ({
      items: [],
      status: { id: source.id, ok: false, error: err.message, elapsedMs: HARD_TIMEOUT_MS },
    }));
  }
  const startedAt = Date.now();
  // OJS-eko aldizkari batzuk (Cuadernos, Veleia, RAMPAS…) mantsoak dira eta noizean
  // behin huts egiten dute. Saiakera bat baino gehiago egiten dugu transiziozko
  // erroreak (timeout, ECONNRESET…) saihesteko.
  const MAX_ATTEMPTS = 3;
  let lastErr;
  let feed;
  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        feed = await withTimeout(parser.parseURL(source.url), HARD_TIMEOUT_MS, source.id);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
        }
      }
    }
    if (lastErr) throw lastErr;
    const items = (feed.items || []).slice(0, 30);
    let droppedOffTopic = 0;
    let droppedModern = 0;
    const filtered = items
      .map((item) => {
        const title = item.title || '';
        const description = stripHtml(item.contentSnippet || item.content || item.summary || '');
        const text = `${title} ${description}`;

        // 1) Argi off-topic direnak (zinema, zezenak, crossword...) beti baztertu
        if (isOffTopic(text)) {
          droppedOffTopic++;
          return null;
        }

        // 2) Iturri orokorretarako: arkeologiarekin lotura zuzena izan behar du
        if (GENERAL_SOURCES.has(source.id) && !isArchaeologyRelated(text)) {
          droppedOffTopic++;
          return null;
        }

        // 3) Erdi Aro ondorengo gaiak baztertu (denentzat)
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
  const fresh = results.flatMap((r) => r.items);
  const statusById = Object.fromEntries(results.map((r) => [r.status.id, r.status]));

  // Lehendik dagoen news.json kargatu (existitzen bada), albisteak behin bakarrik
  // karga daitezen. URL ezagunak ez dira berriro prozesatzen eta lehengo metadatuak
  // gordetzen dira (jatorrizko publishedAt, irudia, etab.).
  const outPath = path.join(ROOT, 'public', 'news.json');
  let existing = [];
  try {
    const prev = JSON.parse(await fs.readFile(outPath, 'utf8'));
    if (Array.isArray(prev.items)) existing = prev.items;
    console.log(`📂 Lehengo news.json: ${existing.length} albiste aurkitu dira`);
  } catch {
    console.log('📂 Lehengo news.json ez dago — lehen exekuzioa');
  }

  // Deduplikazioa URLaren bidez. Lehentasuna lehengo sarrerei (existing) ematen
  // zaie: jada ezagunak diren albisteak ez ditugu berriz "berri" gisa kargatzen.
  const seen = new Map();
  for (const item of existing) {
    if (item?.url && !seen.has(item.url)) seen.set(item.url, item);
  }
  let added = 0;
  for (const item of fresh) {
    if (item?.url && !seen.has(item.url)) {
      seen.set(item.url, item);
      added++;
    }
  }
  console.log(`🆕 ${added} albiste berri gehitu dira (${fresh.length} ekarrita guztira)`);

  const deduped = [...seen.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Albisteetarako (kind=news) 90 eguneko mozketa aplikatzen dugu, freskoak izan
  // daitezen. Ikerketa-aldizkarietarako (research/openalex) ez dugu mozketarik
  // jartzen: artikulu zientifikoak zaharragoak izan daitezke baina interesgarriak
  // dira (Munibe, FLV, Kobie, Aquitania, Cambridge…).
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const isResearch = (item) => {
    const src = SOURCES.find((s) => s.id === item.source?.id);
    const kind = src?.kind || 'news';
    return kind === 'research' || kind === 'openalex';
  };
  const recent = deduped
    .filter((i) => isResearch(i) || new Date(i.publishedAt).getTime() > cutoff)
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

