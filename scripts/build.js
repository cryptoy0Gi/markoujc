const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, value) {
  fs.writeFileSync(path.join(root, file), value);
}

function ensureDir(dir) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return esc(value).replace(/'/g, "&#39;");
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: source };

  const data = {};
  const lines = match[1].split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;

    const key = pair[1];
    let value = pair[2].trim();
    if (value === "") {
      const list = [];
      while (lines[i + 1] && /^\s+-\s+/.test(lines[i + 1])) {
        i += 1;
        list.push(stripQuotes(lines[i].replace(/^\s+-\s+/, "").trim()));
      }
      data[key] = list;
    } else {
      data[key] = stripQuotes(value);
    }
  }

  return { data, body: match[2].trim() };
}

function markdownToHtml(markdown) {
  const blocks = markdown.split(/\n{2,}/);
  return blocks.map((block) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return `<h2>${esc(trimmed.slice(3))}</h2>`;
    }
    if (trimmed.startsWith("# ")) {
      return `<h1>${esc(trimmed.slice(2))}</h1>`;
    }
    return `<p>${trimmed.split("\n").map(esc).join("<br>")}</p>`;
  }).join("\n");
}

function excerpt(markdown) {
  return markdown
    .replace(/^#+\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 190)
    .replace(/\s+\S*$/, "") + "...";
}

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("sl-SI", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function replaceBetween(source, start, end, replacement) {
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(source)) {
    throw new Error(`Missing generated block: ${start} ... ${end}`);
  }
  return source.replace(pattern, `${start}\n${replacement}\n${end}`);
}

function setMeta(html, page) {
  const title = `${page.seo?.meta_title || page.title} - Marko Ujc`;
  const description = page.seo?.meta_description || "";
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${attr(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${attr(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${attr(description)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${attr(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${attr(description)}" />`);
}

function heroHeadline(headline) {
  const parts = headline.replace(/\.$/, "").split(". ");
  if (parts.length >= 3) {
    return `${esc(parts[0])}.<br>${esc(parts[1])}.<br>${esc(parts.slice(2).join(". "))}.`;
  }
  return esc(headline);
}

function buildTrema() {
  const page = JSON.parse(read("content/pages/trema.json"));
  let html = setMeta(read("trema/index.html"), page);

  html = html
    .replace(/<p class="hero-eyebrow">[\s\S]*?<\/p>/, `<p class="hero-eyebrow">${esc(page.hero.eyebrow)}</p>`)
    .replace(/<h1 class="hero-h1">[\s\S]*?<\/h1>/, `<h1 class="hero-h1">${heroHeadline(page.hero.headline).replace("signal.", "<em>signal.</em>")}</h1>`)
    .replace(/<p class="hero-intro">[\s\S]*?<\/p>/, `<p class="hero-intro">${esc(page.hero.intro)}</p>`)
    .replace(/<p class="hero-body">[\s\S]*?<\/p>/, `<p class="hero-body">${esc(page.conversion.body)}</p>`);

  const sections = page.sections.map((section, index) => `
      <a href="#${attr(section.id)}" class="pnav-item">
        <span class="pnav-num">${index + 1}.</span> ${esc(section.label)}
      </a>`).join("");

  html = html.replace(/<div class="progress-nav-inner">[\s\S]*?<\/div>\n<\/nav>/, `<div class="progress-nav-inner">${sections}
  </div>
</nav>`);

  html = html
    .replace(/<section id="kako-se-kaze" class="kaze">/, `<section id="${attr(page.sections[1].id)}" class="kaze">`)
    .replace(/<section id="kaj-deluje" class="deluje">/, `<section id="${attr(page.sections[3].id)}" class="deluje">`)
    .replace(/<p class="kaj-opening reveal">[\s\S]*?<\/p>/, `<p class="kaj-opening reveal">${esc(page.sections[0].body[0])}</p>`)
    .replace(/<p class="kaj-conclusion reveal rd2">[\s\S]*?<\/p>/, `<p class="kaj-conclusion reveal rd2">
        <strong>${esc(page.sections[0].headline)}</strong><br><br>
        ${page.sections[0].body.slice(1).map(esc).join("<br><br>")}
      </p>`)
    .replace(/<p class="nedeluje-desc reveal rd2">[\s\S]*?<\/p>/, `<p class="nedeluje-desc reveal rd2">${esc(page.sections[1].body[0])}</p>`)
    .replace(/<p class="nedeluje-verdict reveal rd3">[\s\S]*?<\/p>/, `<p class="nedeluje-verdict reveal rd3">${esc(page.sections[1].body[1])}</p>`)
    .replace(/<p class="deluje-intro reveal rd2">[\s\S]*?<\/p>/, `<p class="deluje-intro reveal rd2">
        <strong>${esc(page.sections[3].headline)}</strong> ${esc(page.sections[3].body.join(" "))}
      </p>`)
    .replace(/<p class="naprej-desc reveal rd2">[\s\S]*?<\/p>/, `<p class="naprej-desc reveal rd2">${esc(page.conversion.body)}</p>`);

  write("trema/index.html", html);
}

function buildProgram() {
  const page = JSON.parse(read("content/pages/strenirkaj-nastop.json"));
  let html = setMeta(read("strenirkaj-nastop/index.html"), page);

  html = html
    .replace(/<p class="hero-eyebrow">[\s\S]*?<\/p>/, `<p class="hero-eyebrow">${esc(page.hero.eyebrow)}</p>`)
    .replace(/<p class="hero-intro">[\s\S]*?<\/p>/, `<p class="hero-intro">${esc(page.hero.headline)}</p>`)
    .replace(/<p class="hero-body">[\s\S]*?<\/p>/, `<p class="hero-body">${esc(page.hero.intro)}</p>`)
    .replace(/<a href="\.\.\/kontakt\/index\.html" class="btn-primary">[\s\S]*?<\/a>/, `<a href="../kontakt/index.html" class="btn-primary">${esc(page.hero.cta_label)}</a>`)
    .replace(/<p class="kajje-opening reveal">[\s\S]*?<\/p>/, `<p class="kajje-opening reveal">${esc(page.recognition.headline)}</p>`)
    .replace(/<p class="kajje-body reveal rd2">[\s\S]*?<\/p>/, `<p class="kajje-body reveal rd2">
        <strong>${esc(page.reframe.headline)}</strong> ${esc(page.reframe.body)}
      </p>`)
    .replace(/<p class="komu-desc reveal rd2">[\s\S]*?<\/p>/, `<p class="komu-desc reveal rd2">${esc(page.recognition.body.join(" "))}</p>`);

  const distinctions = page.difference.not.map((notItem, index) => `
        <li class="kajje-dist">
          <span class="kajje-dist-no">${esc(notItem)}</span>
          <span class="kajje-dist-yes">${esc(page.difference.is[index] || "")}</span>
        </li>`).join("");
  html = html.replace(/<ul class="kajje-distinctions reveal rd1">[\s\S]*?<\/ul>/, `<ul class="kajje-distinctions reveal rd1">${distinctions}
      </ul>`);

  const cards = page.for_who.slice(0, 4).map((item) => `
      <div class="komu-card">
        <div class="komu-card-title">${esc(item)}</div>
        <div class="komu-card-desc">Za ljudi, ki želijo bolj jasno stati pred drugimi, tudi kadar se pojavi trema.</div>
      </div>`).join("");
  html = html.replace(/<div class="komu-grid reveal rd1">[\s\S]*?<\/div>\n  <\/div>\n<\/section>/, `<div class="komu-grid reveal rd1">${cards}
    </div>
  </div>
</section>`);

  const structure = `
<!-- CMS:PROGRAM_STRUCTURE:START -->
<section class="program-structure">
  <div class="program-structure-inner">
    <div>
      <p class="section-label reveal">Struktura programa</p>
      <h2 class="program-structure-headline reveal rd1">8 tednov.<br><em>Trening, praksa, ponovitev.</em></h2>
    </div>
    <div class="program-structure-grid">
      ${page.structure.map((block, index) => `
      <div class="program-structure-card reveal rd${Math.min(index + 1, 4)}">
        <div class="program-structure-weeks">Tedna ${esc(block.weeks)}</div>
        <h3>${esc(block.title)}</h3>
        <ul>
          ${block.items.map((item) => `<li>${esc(item)}</li>`).join("\n          ")}
        </ul>
      </div>`).join("")}
    </div>
  </div>
</section>
<!-- CMS:PROGRAM_STRUCTURE:END -->`;

  if (html.includes("<!-- CMS:PROGRAM_STRUCTURE:START -->")) {
    html = replaceBetween(html, "<!-- CMS:PROGRAM_STRUCTURE:START -->", "<!-- CMS:PROGRAM_STRUCTURE:END -->", structure.replace("<!-- CMS:PROGRAM_STRUCTURE:START -->\n", "").replace("\n<!-- CMS:PROGRAM_STRUCTURE:END -->", ""));
  } else {
    html = html.replace("<!-- OBLIKE SODELOVANJA -->", `${structure}\n\n<!-- OBLIKE SODELOVANJA -->`);
  }

  write("strenirkaj-nastop/index.html", html);
}

function articleTemplate(post, bodyHtml) {
  const title = post.data.meta_title || post.data.title;
  const description = post.data.meta_description || excerpt(post.body);
  return `<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} - Marko Ujc</title>
  <meta name="description" content="${attr(description)}" />
  <link rel="canonical" href="https://markoujc.com/zapisi/${attr(post.data.slug)}/" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230c0b09'/><text y='.88em' font-size='68' font-family='Georgia,serif' fill='%23c4714a' font-style='italic' x='8'>M</text></svg>" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${attr(title)} - Marko Ujc" />
  <meta property="og:description" content="${attr(description)}" />
  <meta property="og:url" content="https://markoujc.com/zapisi/${attr(post.data.slug)}/" />
  <meta property="og:site_name" content="Marko Ujc" />
  <meta property="og:locale" content="sl_SI" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${attr(title)} - Marko Ujc" />
  <meta name="twitter:description" content="${attr(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Syne:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../css/style.css" />
  <style>
    .article-inner { max-width: 780px; margin: 0 auto; padding: 12rem 3.5rem 7rem; }
    .article-kicker { font-size: .63rem; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: var(--accent); margin-bottom: 2rem; }
    .article-title { font-family: var(--ff-disp); font-size: clamp(3rem, 7vw, 6.5rem); font-weight: 300; line-height: .95; margin-bottom: 1.5rem; }
    .article-date { font-size: .68rem; letter-spacing: .18em; text-transform: uppercase; color: var(--cream-xs); margin-bottom: 4rem; }
    .article-body { color: var(--cream-dim); font-size: 1rem; line-height: 1.9; }
    .article-body h2 { font-family: var(--ff-disp); font-size: clamp(2rem, 3vw, 3rem); font-weight: 300; line-height: 1.05; color: var(--cream); margin: 3.6rem 0 1rem; }
    .article-body p { margin-bottom: 1.25rem; }
    .article-cta { margin-top: 4rem; border-top: 1px solid var(--line); padding-top: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
    .article-cta p { font-family: var(--ff-disp); font-size: 1.45rem; font-style: italic; color: var(--cream); line-height: 1.35; }
    @media (max-width: 960px) {
      .article-inner { padding: 10rem 1.8rem 5rem; }
      .article-cta { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
<nav class="site-nav" id="site-nav">
  <a href="../../index.html" class="nav-logo">Marko <span>Ujc</span></a>
  <ul class="nav-links">
    <li><a href="../../trema/index.html">Trema</a></li>
    <li><a href="../../strenirkaj-nastop/index.html">sTRENIRkAJ</a></li>
    <li><a href="../../uprizoritev/index.html">Uprizoritev</a></li>
    <li><a href="../../o-marku/index.html">O Marku</a></li>
    <li><a href="../../zapisi/index.html" class="active">Zapisi</a></li>
  </ul>
  <button class="nav-hamburger" id="hamburger" aria-label="Meni"><span></span><span></span><span></span></button>
  <a href="../../kontakt/index.html" class="nav-cta">Kontakt</a>
</nav>
<div class="nav-mobile" id="nav-mobile">
  <a href="../../trema/index.html">Trema</a>
  <a href="../../strenirkaj-nastop/index.html">sTRENIRkAJ NASTOP</a>
  <a href="../../uprizoritev/index.html">Uprizoritev</a>
  <a href="../../o-marku/index.html">O Marku</a>
  <a href="../../zapisi/index.html" class="active">Zapisi</a>
  <a href="../../kontakt/index.html">Kontakt</a>
</div>
<main class="article-inner">
  <p class="article-kicker">Zapis</p>
  <h1 class="article-title">${esc(post.data.title)}</h1>
  <div class="article-date">${esc(formatDate(post.data.date))}</div>
  <article class="article-body">
${bodyHtml}
  </article>
  <div class="article-cta">
    <p>Če želiš s tremo delati praktično, je naslednji korak izkušnja.</p>
    <a class="btn-primary" href="${attr(post.data.cta_url || "/strenirkaj-nastop/")}">${esc(post.data.cta_label || "Preveri program")}</a>
  </div>
</main>
<footer class="site-footer">
  <div class="footer-logo">Marko Ujc</div>
  <ul class="footer-links">
    <li><a href="../../pravno/pogoji.html">Pogoji</a></li>
    <li><a href="../../pravno/zasebnost.html">Zasebnost</a></li>
    <li><a href="../../pravno/piskotki.html">Piškotki</a></li>
  </ul>
  <div class="footer-copy">© 2026 markoujc.com</div>
</footer>
<script src="../../js/main.js"></script>
</body>
</html>
`;
}

function buildArticles() {
  const posts = fs.readdirSync(path.join(root, "content/zapisi"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const parsed = parseFrontmatter(read(`content/zapisi/${file}`));
      return { ...parsed, source: file };
    })
    .filter((post) => post.data.status !== "draft")
    .sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));

  for (const post of posts) {
    ensureDir(`zapisi/${post.data.slug}`);
    write(`zapisi/${post.data.slug}/index.html`, articleTemplate(post, markdownToHtml(post.body)));
  }

  let index = read("zapisi/index.html");
  const cards = posts.map((post, index) => `
  <article class="zapis-card anim-fadeup anim-delay-${Math.min(index + 3, 4)}">
    <div class="zapis-datum">${esc(formatDate(post.data.date))}</div>
    <h2 class="zapis-naslov"><a href="./${attr(post.data.slug)}/">${esc(post.data.title)}</a></h2>
    <p class="zapis-excerpt">${esc(excerpt(post.body))}</p>
    <a class="zapis-link" href="./${attr(post.data.slug)}/">Preberi zapis -></a>
  </article>`).join("\n");

  const block = cards || `
  <article class="zapis-card anim-fadeup anim-delay-4">
    <div class="zapis-datum">Prvi zapis prihaja</div>
    <h2 class="zapis-naslov"><a href="../trema/index.html">Začni pri tremi</a></h2>
    <p class="zapis-excerpt">Dokler prvi zapis še nastaja, je najboljša vstopna točka stran o tremi.</p>
    <a class="zapis-link" href="../trema/index.html">Preberi o tremi -></a>
  </article>`;

  if (!index.includes("<!-- CMS:ZAPISI:START -->")) {
    index = index.replace(/  <article class="zapis-card[\s\S]*?<\/article>/, `  <!-- CMS:ZAPISI:START -->\n${block}\n  <!-- CMS:ZAPISI:END -->`);
  } else {
    index = replaceBetween(index, "<!-- CMS:ZAPISI:START -->", "<!-- CMS:ZAPISI:END -->", block);
  }
  write("zapisi/index.html", index);
}

buildTrema();
buildProgram();
buildArticles();

console.log("Built CMS content into static HTML.");
