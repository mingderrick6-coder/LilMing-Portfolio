import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const projectImages = [
  ["paths-of-life", "53f8a4a889052e6d9f92fc347533062abaf7c28a-1396x770.png"],
  ["the-disease-spread-on-tiktok", "19fa225f5d92c65608e2234c0b0bd1fb2e3d681c-3840x1920.png"],
  ["ah-psychedelics", "1ca122cfaaff3f8b109554a29cc7a1132d13a0c6-1280x717.png"],
  ["thought", "41a99c4ae85965e19dcc6befe7caaae6c2d54d9c-1146x644.png"],
  ["jupiter", "bff6c9518d1b998df04c33101d61ad965fd23a98-1413x760.png"],
  ["chromatik", "80de59a860bc12ff92d9d349ffe319cfb92a8de8-1258x984.png"],
  ["digital-travel", "219c0768c852e48380fd831ed0772f7c173ac0ea-1280x719.png"],
  ["mercedes-amg", "f430b963c80253937547780211cd3abe7b23924c-1920x1080.png"],
  ["the-purity-revealed", "689cc8437a49fac1ba8f12012d73cf9d20ce46fb-3840x2160.png"]
].map(([slug, file]) => ({
  url: `https://cdn.sanity.io/images/u7lvkmbp/production/${file}?w=1024&auto=format`,
  path: `public/sites/pacomepertant-com-b16b412f/root-8a5edab2/projects/${slug}.avif`
}));

const staticAssets = [
  ["https://pacomepertant.com/_nuxt/logo-big.elJIbpew.png", "public/sites/pacomepertant-com-b16b412f/shared/logo.png"],
  ["https://pacomepertant.com/_nuxt/reel-thumbnail.Cx_2hmdl.png", "public/sites/pacomepertant-com-b16b412f/shared/reel-thumbnail.png"],
  ...Array.from({ length: 12 }, (_, index) => [
    `https://pacomepertant.com/img/stickers-${index + 1}.webp`,
    `public/sites/pacomepertant-com-b16b412f/root-8a5edab2/stickers/sticker-${index + 1}.webp`
  ])
].map(([url, path]) => ({ url, path }));

const queue = [...projectImages, ...staticAssets];

async function download({ url, path }) {
  await mkdir(dirname(path), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
  return basename(path);
}

for (let index = 0; index < queue.length; index += 4) {
  const names = await Promise.all(queue.slice(index, index + 4).map(download));
  console.log(names.join(", "));
}
