import { mkdir, readFile, readdir, rm, stat, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "_site");
const repository = process.env.GITHUB_REPOSITORY || "kimyoungjin06/jg_runnerjarang";
const revision = process.env.GITHUB_SHA || "main";
const skippedRoots = new Set([".git", ".github", "_site", "scripts"]);

let copiedFiles = 0;
let copiedBytes = 0;
let rewrittenLinks = 0;

function shouldSkip(relativePath, entry) {
  const parts = relativePath.split(path.sep);

  if (skippedRoots.has(parts[0]) || entry.name === ".DS_Store") {
    return true;
  }

  return entry.isDirectory() && entry.name === "photos";
}

function encodePath(filePath) {
  return filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function rewriteAlbumLinks(html, relativePath) {
  const directory = path.posix.dirname(relativePath.split(path.sep).join("/"));
  const rawBase = `https://raw.githubusercontent.com/${repository}/${revision}/${directory}/photos/`;

  return html
    .replace(/href="photos\/([^"?#]+)"/g, (_match, filename) => {
      rewrittenLinks += 1;
      return `href="${rawBase}${encodePath(filename)}"`;
    })
    .replace(/this\.src='photos\/([^'?#]+)'/g, (_match, filename) => {
      rewrittenLinks += 1;
      return `this.src='${rawBase}${encodePath(filename)}'`;
    });
}

async function copyDirectory(sourceDirectory, relativeDirectory = "") {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);

    if (shouldSkip(relativePath, entry)) {
      continue;
    }

    const sourcePath = path.join(sourceDirectory, entry.name);
    const outputPath = path.join(output, relativePath);

    if (entry.isDirectory()) {
      await mkdir(outputPath, { recursive: true });
      await copyDirectory(sourcePath, relativePath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });

    if (path.extname(entry.name).toLowerCase() === ".html") {
      const html = await readFile(sourcePath, "utf8");
      await writeFile(outputPath, rewriteAlbumLinks(html, relativePath));
    } else {
      await copyFile(sourcePath, outputPath);
    }

    const fileStat = await stat(outputPath);
    copiedFiles += 1;
    copiedBytes += fileStat.size;
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyDirectory(root);
await writeFile(path.join(output, ".nojekyll"), "");

console.log(
  `Built ${copiedFiles} files (${(copiedBytes / 1024 / 1024).toFixed(1)} MB), rewrote ${rewrittenLinks} original-photo links.`,
);
