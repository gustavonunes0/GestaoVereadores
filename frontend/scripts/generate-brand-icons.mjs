/**
 * Gera marca CâmaraGest (login) + ícones PWA a partir de assets/login logo.jpeg
 * NÃO altera assets/logo.png (logo do cliente / câmara).
 *
 * node scripts/generate-brand-icons.mjs
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'assets', 'login logo.jpeg');
/** Marca do produto — só login / favicon PWA */
const brandLogo = path.join(root, 'assets', 'camara-gest-logo.png');
const iconsDir = path.join(root, 'public', 'icons');

if (!fs.existsSync(source)) {
    console.error('Fonte não encontrada:', source);
    process.exit(1);
}

fs.mkdirSync(iconsDir, { recursive: true });

async function squareIcon(size, outPath, { maskable = false } = {}) {
    const pad = maskable ? Math.round(size * 0.18) : Math.round(size * 0.08);
    const inner = size - pad * 2;
    const bg = { r: 255, g: 255, b: 255, alpha: 1 };

    const logo = await sharp(source)
        .rotate()
        .resize(inner, inner, {
            fit: 'contain',
            background: bg,
        })
        .png()
        .toBuffer();

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: bg,
        },
    })
        .composite([{ input: logo, left: pad, top: pad }])
        .png()
        .toFile(outPath);

    console.log('  wrote', path.relative(root, outPath));
}

async function main() {
    console.log('Fonte marca CâmaraGest:', source);
    console.log('(logo.png do cliente NÃO é alterado)');

    await sharp(source)
        .rotate()
        .resize(640, 640, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(brandLogo);
    console.log('  wrote', path.relative(root, brandLogo));

    const sizes = [16, 32, 48, 72, 96, 128, 144, 180, 192, 256, 384, 512];
    for (const size of sizes) {
        if (size === 16 || size === 32) {
            await squareIcon(size, path.join(iconsDir, `favicon-${size}x${size}.png`));
        }
        if (size === 180) {
            await squareIcon(size, path.join(iconsDir, 'apple-touch-icon.png'));
        }
        await squareIcon(size, path.join(iconsDir, `icon-${size}.png`));
        await squareIcon(size, path.join(iconsDir, `maskable-${size}.png`), {
            maskable: true,
        });
    }

    await squareIcon(32, path.join(iconsDir, 'favicon-32x32.png'));
    await squareIcon(16, path.join(iconsDir, 'favicon-16x16.png'));

    console.log('OK — marca CâmaraGest + ícones PWA.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
