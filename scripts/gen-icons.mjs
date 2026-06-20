// Generates PWA + apple-touch icons from an inline SVG (a sun-over-waves coastal
// mark — font-free so it rasterizes identically everywhere). Run: npm run gen:icons
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "icons");

function svg({ scale = 1 } = {}) {
  const mark = `
    <g transform="translate(256,256) scale(${scale}) translate(-256,-256)">
      <circle cx="256" cy="196" r="62" fill="#ffffff" fill-opacity="0.96"/>
      <g fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round">
        <path d="M64 322 q48 -42 96 0 t96 0 t96 0 t96 0" stroke-opacity="0.96"/>
        <path d="M64 378 q48 -42 96 0 t96 0 t96 0 t96 0" stroke-opacity="0.7"/>
        <path d="M64 434 q48 -42 96 0 t96 0 t96 0 t96 0" stroke-opacity="0.45"/>
      </g>
    </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2a86d0"/>
        <stop offset="0.55" stop-color="#125a9e"/>
        <stop offset="1" stop-color="#0a223c"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="96" fill="url(#g)"/>
    ${mark}
  </svg>`;
}

// full-bleed gradient (no rounded corners) for maskable / apple
function svgFullBleed({ scale = 1 } = {}) {
  return svg({ scale }).replace('rx="96" ', "");
}

async function render(svgStr, size, file) {
  const png = await sharp(Buffer.from(svgStr)).resize(size, size).png().toBuffer();
  await writeFile(path.join(OUT, file), png);
  console.log("wrote", file, `${size}x${size}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await render(svg(), 192, "icon-192.png");
  await render(svg(), 512, "icon-512.png");
  await render(svgFullBleed({ scale: 0.72 }), 512, "maskable-512.png");
  await render(svgFullBleed(), 180, "apple-touch-icon.png");
  await render(svg(), 32, "favicon-32.png");
  // also drop a copy at the web root for the bare /favicon.ico request
  await writeFile(path.join(process.cwd(), "public", "favicon.ico"), await sharp(Buffer.from(svg())).resize(48, 48).png().toBuffer());
  console.log("icons done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
