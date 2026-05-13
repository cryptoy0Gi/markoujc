# markoujc.com — Navodila za vzdrževanje

## 📁 Struktura map

```
markoujc.com/
├── index.html              ← Domača stran (/)
├── css/
│   └── style.css           ← VSE BARVE IN STILI — uredi tukaj
├── js/
│   └── main.js             ← Navigacija, animacije (ne treba urejati)
├── content/
│   ├── pages/              ← CMS vsebina za ključne strani
│   └── zapisi/             ← Markdown zapisi za blog
├── scripts/
│   └── build.js            ← Build iz CMS vsebine v HTML
├── trema/
│   └── index.html          ← Stran o tremi
├── strenirkaj-nastop/
│   └── index.html          ← Program sTRENIRkAJ NASTOP
├── o-marku/
│   └── index.html          ← O Marku
├── uprizoritev/
│   └── index.html          ← Uprizoritev (portfolio)
├── kontakt/
│   └── index.html          ← Kontaktna stran
├── zapisi/
│   └── index.html          ← Blog / zapisi
└── pravno/
    ├── pogoji.html
    ├── zasebnost.html
    └── piskotki.html
```

---

## 🚀 Kako objaviti

Stran je pripravljena za Vercel.

Pred objavo se izvede:

```bash
npm run build
```

Build prebere `content/` in posodobi statične HTML strani.

### Na WordPress
> **Opomba:** Ta stran je statični HTML in ne potrebuje WordPressa.
> Priporočamo gostovanje na navadnem strežniku (mnogo hitrejše).
>
> Če vseeno želiš WordPress:
> 1. Namesti vtičnik **"Static HTML Output"** ali **WP2Static**
> 2. Ali pa WordPress pusti za blog (`/zapisi`) in ostalo gostuj statično

---

## ✏️ Kako urejati besedilo

Za ključne vsebine ne urejaj najprej HTML-ja, ampak `content/`:

- `content/pages/trema.json`
- `content/pages/strenirkaj-nastop.json`
- `content/zapisi/*.md`

Po spremembi zaženi:

```bash
npm run build
```

HTML strani so build rezultat in osnovni layout.

### Najpomembnejše oznake za urejanje

| Kaj | Kje |
|-----|-----|
| Glavna barva (terracotta) | `css/style.css` → `--accent: #c4714a;` |
| Letnica v footerju | vsaka stran → zadnja vrstica pred `</footer>` |
| Kontaktni email | `kontakt/index.html` → `action=""` v obrazcu |
| Navigacijske povezave | vsaka stran → razdelek `<nav>` |

---

## 🎨 Kako spremeniti barve

Odpri `css/style.css` in poišči razdelek `:root` na vrhu:

```css
:root {
  --bg:        #0c0b09;   /* Ozadje — zelo temno */
  --cream:     #e8e0d0;   /* Besedilo */
  --accent:    #c4714a;   /* Glavna barva ← ZAMENJAJ TUKAJ */
}
```

Samo zamenjaj vrednost `#c4714a` z drugo barvo in vse strani se posodobijo.

---

## 📝 Kako dodati nov zapis (blog post)

1. Dodaj novo `.md` datoteko v `content/zapisi/`
2. Izpolni frontmatter: `title`, `slug`, `status`, `date`, `meta_description`
3. Nastavi `status: published`
4. Zaženi `npm run build`
5. Build ustvari stran v `zapisi/<slug>/` in doda zapis na `/zapisi/`

---

## 📷 Kako dodati fotografije

1. Fotografije shranjuj v mapo `slike/` (jo ustvari sam)
2. V HTML dodaj: `<img src="../slike/ime-fotografije.jpg" alt="Opis" />`
3. Priporočena velikost: max 1200px širina, JPG format

---

## ❓ Pogosta vprašanja

**Stran ne deluje po uploadu?**
Preveri da si naložil VSO vsebino mape, vključno s `css/` in `js/` mapama.

**Mobilna navigacija ne deluje?**
Preveri da je datoteka `js/main.js` pravilno naložena.

**Kako spremeniti naslov strani (tisto v brskalniku)?**
Poišči `<title>` oznako na vrhu vsake HTML datoteke.

---

*Vprašanja? Kontaktiraj razvijalca.*
