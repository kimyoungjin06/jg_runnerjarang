import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [albumDirectory, date, albumName, caption] = process.argv.slice(2);

if (!albumDirectory || !date || !albumName || !caption) {
  console.error(
    "Usage: node scripts/generate-album.mjs <album-directory> <date> <album-name> <caption>",
  );
  process.exit(1);
}

const photosDirectory = path.join(albumDirectory, "photos");
const photos = (await readdir(photosDirectory))
  .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const thumbnails = photos
  .map(
    (file, index) => `
            <article>
              <a class="thumbnail" href="photos/${file}" data-position="center"><img src="thumb/${file}" alt="${date} 러닝 사진 ${index + 1}" loading="lazy" onerror="this.onerror=null;this.src='photos/${file}';" /></a>
              <h2>${albumName}</h2>
              <p>${caption}</p>
            </article>`,
  )
  .join("");

const html = `<!DOCTYPE HTML>
<!--
  Lens by HTML5 UP
  html5up.net | @ajlkn
  Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->
<html lang="ko">
  <head>
    <title>전국러너자랑 - ${date}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
    <link rel="icon" type="image/png" href="../../../images/jgjr.png" />
    <link rel="stylesheet" href="../../../album-assets/css/main.css" />
    <noscript><link rel="stylesheet" href="../../../album-assets/css/noscript.css" /></noscript>
  </head>
  <body class="is-preload-0 is-preload-1 is-preload-2">

    <div id="main">
      <header id="header">
        <div class="logo-row">
          <a class="logo-link" href="https://www.instagram.com/jg_runnerjarang/">
            <img src="../../../images/jgjr.png" alt="전국러너자랑 로고" class="logo-mark" />
          </a>
          <a class="logo-link" href="https://www.instagram.com/modu_running/">
            <img src="../../../images/MRC_logggo.png" alt="MRC 로고" class="logo-mark" />
          </a>
          <a class="logo-link" href="https://www.instagram.com/1987rrr_official/">
            <img src="../../../images/rrr.png" alt="달토끼 로고" class="logo-mark" />
          </a>
        </div>
        <h1>${albumName}</h1>
        <p>전국러너자랑<br />
          @jg_runnerjarang<br />
          ${date} Sun</p>
        <ul class="actions special">
          <li><a class="button" href="../index.html">회차로 돌아가기</a></li>
        </ul>
      </header>

      <section id="thumbnails">${thumbnails}
      </section>

      <footer id="footer">
        <div class="footer-logos">
          <a class="logo-link" href="https://www.instagram.com/jg_runnerjarang/">
            <img src="../../../images/jgjr.png" alt="전국러너자랑 로고" class="footer-logo" />
          </a>
          <a class="logo-link" href="https://www.instagram.com/modu_running/">
            <img src="../../../images/MRC_logggo.png" alt="MRC 로고" class="footer-logo" />
          </a>
          <a class="logo-link" href="https://www.instagram.com/1987rrr_official/">
            <img src="../../../images/rrr.png" alt="달토끼 로고" class="footer-logo" />
          </a>
        </div>
        <ul class="copyright">
          <li>전국러너자랑 (@jg_runnerjarang)</li><li>Design by Young Jin Kim. Download photos at Repository</li>
        </ul>
      </footer>
    </div>

    <script src="../../../album-assets/js/jquery.min.js"></script>
    <script src="../../../album-assets/js/browser.min.js"></script>
    <script src="../../../album-assets/js/breakpoints.min.js"></script>
    <script src="../../../album-assets/js/main.js"></script>
  </body>
</html>
`;

await writeFile(path.join(albumDirectory, "index.html"), html);
console.log(`Generated ${photos.length} entries in ${albumDirectory}/index.html`);
