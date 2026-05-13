# CMS priprava za markoujc.com

## Izbrana smer

Priporočena smer je CloudCannon kot Git-based CMS.

Razlog: obstoječa stran lahko ostane statična, hitra in brez WordPress vzdrževanja, vsebina pa se ureja v brskalniku in ostane v Git repozitoriju.

## Kaj je pripravljeno

- `cloudcannon.config.yml` definira osnovne CloudCannon zbirke.
- `content/pages/trema.json` pripravi vsebinski model za glavno SEO stran.
- `content/pages/strenirkaj-nastop.json` pripravi vsebinski model za programsko stran.
- `content/zapisi/` pripravi prve draft zapise in model za SEO vsebino.
- `assets/uploads/` je predviden prostor za slike in datoteke.

## Prioritete

1. `content/zapisi/`  
   SEO motor za teme okoli treme.

2. `content/pages/trema.json`  
   Glavna vstopna stran: prepoznavanje problema, razlaga, prehod v program.

3. `content/pages/strenirkaj-nastop.json`  
   Konverzijska stran: program za tremo skozi trening in prakso.

## Build proces

Stran zdaj bere pripravljeno vsebino iz `content/`.

Ukaz:

```bash
npm run build
```

Build naredi:

- posodobi ključne SEO in prodajne tekste na `/trema/`;
- posodobi programsko stran `/strenirkaj-nastop/`;
- generira javne zapise iz `content/zapisi/*.md`;
- osveži indeks zapisov na `/zapisi/`.

Vercel ima v `vercel.json` nastavljen `buildCommand`, zato se build izvede tudi ob objavi.

## CloudCannon priklop

1. Poveži Git repozitorij s CloudCannon.
2. CloudCannon bo prebral `cloudcannon.config.yml`.
3. V navigaciji naj se pojavita zbirki:
   - Strani
   - Zapisi
4. Urejanje naj se začne pri `Zapisi`, potem `Trema`, potem `sTRENIRkAJ NASTOP`.

## Vsebinsko pravilo

Vsak zapis mora odgovoriti:

- Kaj človek prepozna pri sebi?
- Kaj se dejansko dogaja?
- Kaj ljudje pogosto narobe razumejo?
- Kaj pomeni praktično delo?
- Kam gre naslednji korak?

Če zapis zveni, kot da bi ga lahko napisal kdorkoli, ga je treba prepisati.
