
# Arkeologia eta Antzinako Historia Albiste-Biltzailea

Web aplikazio bat sortuko dugu mundu osoko arkeologia eta antzinako historiari buruzko albisteak biltzen dituena, Euskal Herria eta Europa lehenetsita.

## Funtzionalitatea

**Albiste-bilketa hibridoa** (backend-ean, ordutegi-tarteka eguneratua):
- **RSS jarioak** (oinarria, doan eta fidagarria):
  - Hedabide orokorrak: Berria, Argia, El País (Cultura), El Diario Vasco, BBC, Le Monde, ABC...
  - Espezializatuak: Heritage Daily, Archaeology.org, Antiquity, Live Science Archaeology, Past Horizons, National Geographic History
  - Erakundeak: Aranzadi, EHU/UPV, CSIC, British Museum, Louvre, Smithsonian
- **AI bilaketa osagarria** (Perplexity edo Firecrawl konektorea): astero "azken aurkikuntzak" gisako kontsultak egingo ditu, RSSak galtzen dituen albisteak harrapatzeko
- **Sare sozialak**: kontu publikoen RSS bridge-en bidez (Nitter/RSSHub) X, Mastodon eta Bluesky-ko arkeologo eta erakundeen jarioak

**Iragazki eta antolaketa**:
- Hizkuntza-iragazkia (EU/ES lehenetsita, baina EN/FR/DE/IT erakutsi)
- Gai-etiketak automatikoki esleituta gako-hitzen bidez: Prehistoria, Erromatarrak, Erdi Aroa, Egiptoarrak, Iberiarrak/Euskaldunak, Ekialde Hurbila, Amerika prekolonbiarra...
- Geografia-iragazkia: Euskal Herria / Iberiar penintsula / Europa / Mundua
- Bilatzailea testu librean
- "Gomendatuak" atala: Euskal Herriko albisteak gainean

**Albiste-fitxa bakoitzeko**:
- Titulua, laburpena, irudia (jariotik atera)
- Iturria + data + hizkuntza-bandera
- Etiketak (gaia, eskualdea)
- "Irakurri jatorrian" lotura
- Itzulpen-botoi aukerakoa (Lovable AI bidez euskarara)

**Erabiltzaile-funtzioak**:
- Albisteak gordetzeko aukera (gogokoak)
- "Irakurrita" markatzea
- Ez dago saio-hasierarik beharrezkoa (localStorage); etorkizunean kontuak gehi daitezke nahi izanez gero

## Diseinua

Albiste-zerrenda sinplea (eskatu bezala):
- Goiburu garbia tituluarekin eta iragazki-barrarekin
- Lerro bertikaleko albiste-zerrenda, bakoitzak: irudi txikia ezkerrean, titulua + laburpena + metadatuak (iturria, data, etiketak) eskuinean
- Tipografia irakurterraza, kontraste ona, mugikorrean lehenik
- Kolore-paleta sobria (lurraren tonuak: hare-kolorea, harri grisa, indigo iluna), ondareari keinu eginez baina garaikidea izanik
- Ilun/argi modua

## Arkitektura teknikoa

- **Lovable Cloud** (Supabase): albisteen datu-basea, kategoriak, iturrien zerrenda
- **Edge Functions**:
  - `fetch-rss`: RSS jarioak ekartzen ditu eta DBan gordetzen ditu (deduplikazioa URLaren bidez)
  - `ai-discover`: Perplexity/Firecrawl konektorea erabiltzen du gai-bilaketak egiteko
  - `translate`: Lovable AI Gateway euskarazko itzulpenetarako (eskaeran)
  - Eskuzko aktibazioarekin hasiko da; cron-eguneraketa gero gehi daiteke
- **Frontend**: React + Tailwind, albiste-zerrenda iragazki-aldagaiekin, infinite scroll edo orrikatzea

## Lehen mailako iturri-zerrenda (hasieran kargatuko dena)

Berria (kultura), Argia, EITB Kultura, Aranzadi albisteak, El País Cultura, El Diario Vasco kultura, ABC Cultura, Heritage Daily, Archaeology Magazine, Antiquity Journal, Past Horizons, Live Science Archaeology, BBC History, Le Figaro Histoire, National Geographic Historia, Smithsonian, plus 5-10 X/Mastodon kontu (DigVentures, Aranzadi, Museo Arqueológico Nacional...).

## Lehen iterazioan eraikiko dena

1. Datu-basearen eskema (albisteak, iturriak, etiketak)
2. RSS bilketa edge function-a + iturri lehenetsien zerrenda
3. Albiste-zerrendaren orri nagusia iragazkiekin
4. Albiste-fitxaren xehetasun-bista
5. AI bilaketa edge function-a (konektorea konfiguratu ondoren)
6. Gogokoak/irakurritakoak localStorage bidez

Hurrengo iterazioak: cron eguneraketa, push jakinarazpenak, mapa-bista, RSS esportazioa.
