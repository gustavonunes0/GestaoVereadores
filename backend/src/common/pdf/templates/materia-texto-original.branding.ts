import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type MateriaPdfBranding = {
    topoDataUrl: string | null;
    logoDataUrl: string | null;
    rodapeDataUrl: string | null;
    endereco: string;
    telefone: string;
    email: string;
    cnpj: string;
};

const ASSET_CANDIDATES = [
    join(__dirname, '../assets'),
    join(process.cwd(), 'src/common/pdf/assets'),
    join(process.cwd(), 'dist/common/pdf/assets'),
];

function resolveAsset(fileName: string): string | null {
    for (const dir of ASSET_CANDIDATES) {
        const path = join(dir, fileName);
        if (existsSync(path)) return path;
    }
    return null;
}

function loadAssetDataUrl(fileName: string): string | null {
    const path = resolveAsset(fileName);
    return path ? fileToDataUrl(path) : null;
}

const BATURITE_DEFAULTS = {
    endereco: 'Trav. Cícero Segundo da Costa, 1215 - Centro, 62.760-000',
    telefone: '(85) 3347-0193',
    email: 'contato@camarabaturite.ce.gov.br',
};

function fileToDataUrl(path: string): string | null {
    if (!existsSync(path)) return null;
    const buf = readFileSync(path);
    const ext = path.split('.').pop()?.toLowerCase();
    const mime =
        ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'svg'
              ? 'image/svg+xml'
              : ext === 'webp'
                ? 'image/webp'
                : 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
}

function resolveUploadsPath(logo: string): string | null {
    const trimmed = logo.trim();
    if (!trimmed.startsWith('/uploads/') && !trimmed.startsWith('uploads/')) {
        return null;
    }
    const relative = trimmed.replace(/^\//, '');
    const absolute = join(process.cwd(), relative);
    return existsSync(absolute) ? absolute : null;
}

/**
 * Resolve cabeçalho/rodapé institucional para o PDF de matéria.
 * Preferência: logo do tenant; fallback nos assets oficiais da câmara.
 */
export function resolveMateriaPdfBranding(input: {
    logo?: string | null;
    municipio: string;
    contactPhone?: string | null;
    contactEmail?: string | null;
    cnpj?: string | null;
    endereco?: string | null;
}): MateriaPdfBranding {
    const isBaturite = /baturit[eé]/i.test(input.municipio);

    let logoDataUrl: string | null = null;
    if (input.logo?.startsWith('data:')) {
        logoDataUrl = input.logo;
    } else if (input.logo) {
        const fromUploads = resolveUploadsPath(input.logo);
        if (fromUploads) logoDataUrl = fileToDataUrl(fromUploads);
    }
    if (!logoDataUrl && isBaturite) {
        logoDataUrl = loadAssetDataUrl('camara-baturite-cabecalho.png');
    }

    const topoDataUrl = isBaturite
        ? loadAssetDataUrl('camara-baturite-topo.png')
        : null;
    const rodapeDataUrl = isBaturite
        ? loadAssetDataUrl('camara-baturite-rodape-ornamento.png')
        : null;

    return {
        topoDataUrl,
        logoDataUrl,
        rodapeDataUrl,
        endereco:
            input.endereco?.trim() ||
            (isBaturite ? BATURITE_DEFAULTS.endereco : ''),
        telefone:
            input.contactPhone?.trim() ||
            (isBaturite ? BATURITE_DEFAULTS.telefone : ''),
        email:
            input.contactEmail?.trim() ||
            (isBaturite ? BATURITE_DEFAULTS.email : ''),
        cnpj: input.cnpj?.trim() || '',
    };
}

export function buildMateriaPdfHeaderTemplate(branding: MateriaPdfBranding): string {
    const topo = branding.topoDataUrl
        ? `<img src="${branding.topoDataUrl}" style="width:100%;height:7px;display:block;border:0;" />`
        : `<div style="height:7px;background:linear-gradient(90deg,#0b3d91 0%,#0b3d91 38%,#2f6fd6 38%,#2f6fd6 72%,#7eb6ff 72%,#7eb6ff 100%);"></div>`;

    const logo = branding.logoDataUrl
        ? `<img src="${branding.logoDataUrl}" style="height:48px;max-width:280px;object-fit:contain;margin:6px auto 0;display:block;" />`
        : '';

    return `<div style="width:100%;padding:0 12mm;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;">${topo}${logo}</div>`;
}

export function buildMateriaPdfFooterTemplate(
    branding: MateriaPdfBranding,
): string {
    if (branding.rodapeDataUrl) {
        return `<div style="width:100%;padding:0 10mm;box-sizing:border-box;text-align:center;font-family:Arial,Helvetica,sans-serif;">
  <img src="${branding.rodapeDataUrl}" style="width:100%;max-height:52px;object-fit:contain;display:block;margin:0 auto;" />
  <div style="font-size:7px;color:#666;margin-top:2px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
</div>`;
    }

    const linhas = [
        branding.endereco,
        [branding.telefone, branding.email].filter(Boolean).join(' / '),
        branding.cnpj ? `CNPJ: ${branding.cnpj}` : '',
    ].filter(Boolean);

    return `<div style="width:100%;padding:0 12mm;box-sizing:border-box;text-align:center;font-family:Arial,Helvetica,sans-serif;color:#2a6bb5;font-size:8px;line-height:1.35;">
  ${linhas.map((l) => `<div>${l}</div>`).join('')}
  <div style="font-size:7px;color:#666;margin-top:3px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
</div>`;
}
