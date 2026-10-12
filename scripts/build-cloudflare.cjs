const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const sharp = require(require.resolve("sharp", { paths: [path.dirname(require.resolve("next/package.json"))] }));

const root = path.resolve(__dirname, "..");
const output = path.join(root, "public/cloudflare-images");
const images = [
  ["intro-graphics-original.png", "intro-graphics.webp", 1080],
  ["sites/pacomepertant-com-b16b412f/shared/intro-avatar.png", "intro-avatar.webp", 256],
  ["sites/pacomepertant-com-b16b412f/shared/about-avatar.png", "about-avatar.webp", 2048],
];

async function build() {
  await fs.mkdir(output, { recursive: true });
  for (const [source, destination, width] of images) {
    const result = await sharp(path.join(root, "public", source))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 100, alphaQuality: 100 })
      .toFile(path.join(output, destination));
    console.log(`${destination}: ${result.width} × ${result.height}, ${result.size} bytes`);
  }

  const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
    cwd: root,
    env: { ...process.env, CLOUDFLARE_STATIC_BUILD: "1" },
    stdio: "inherit",
  });
  child.on("error", (error) => { console.error(error); process.exitCode = 1; });
  child.on("exit", (code) => { process.exitCode = code ?? 1; });
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
