# Aztarnak — Hedapena eta CMS

## 1. Lovable → GitHub konexioa

1. Lovable-en **Connectors → GitHub → Connect project** (oraindik egin gabe baduzu).
2. Repo bat sortu (adib. `aztarnak`).

## 2. Netlify-n hedatu

1. [Netlify](https://app.netlify.com)-en **Add new site → Import from GitHub** eta hautatu repo-a.
2. Build settings: **automatikoki detektatzen ditu** `netlify.toml`-tik (`npm run build` → `dist/`).
3. Site name: adibidez `aztarnak` → URL: `aztarnak.netlify.app`.

### Ingurune-aldagaiak

Netlify-n **Site settings → Environment variables** atalean ezarri:

```
VITE_GITHUB_OWNER=zureusername
VITE_GITHUB_REPO=aztarnak
VITE_GITHUB_BRANCH=main
```

Hauek ezartzeke "Artikulua sortu" botoiak GitHub URL okerra sortuko du.

## 3. Decap CMS — Netlify Identity + Git Gateway

1. Netlify dashboard-ean: **Site → Integrations → Identity → Enable Identity**.
2. **Identity → Registration**: aldatu `Open` → **`Invite only`**.
3. **Identity → External providers → Add provider → GitHub**: aktibatu (Netlify-ren OAuth app erabiliko du, ez duzu zuk ezer egin behar).
4. **Identity → Services → Git Gateway → Enable Git Gateway** (bere kabuz konektatuko da repo-ra).
5. **Identity → Invite users**: gonbidatu zure posta. Postaz iritsiko zaizun esteketik klikatu eta pasahitza ezarri (edo "Login with GitHub" sakatu).
6. Joan `https://zure-domeinua/admin/`-era → CMSean sartzen zara.

## 4. Iturrien monitorearen pasahitza

`/iturriak` rutarako pasahitza: **`Aztarn4k-2026!Mon`**

Aldatzeko: kalkulatu `sha256` hash berria eta jarri `src/components/PasswordGate.tsx`-ko `PASSWORD_HASH` aldagaian.

```bash
echo -n "ZURE-PASAHITZ-BERRIA" | shasum -a 256
```

## 5. Egitura

- `/` → Gune publikoa (Albiste landuak + Ohar laburrak)
- `/albistea/:slug`, `/oharra/:slug` → Eduki indibiduala
- `/iturriak` → Kanpo-iturrien RSS monitorea (pasahitza)
- `/admin/` → Decap CMS (Netlify Identity)

Edukia repo-an gordetzen da `content/articles/` eta `content/notes/` karpetetan, Markdown formatuan.
