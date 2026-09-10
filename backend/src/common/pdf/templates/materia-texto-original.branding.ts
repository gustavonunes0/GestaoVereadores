import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { escHtml } from './materia-texto-original.helpers';

export type MateriaPdfBranding = {
    topoDataUrl: string | null;
    logoDataUrl: string | null;
    rodapeDataUrl: string | null;
    iconsDataUrl: string | null;
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

    return {
        topoDataUrl: isBaturite
            ? loadAssetDataUrl('camara-baturite-topo.png')
            : null,
        logoDataUrl,
        rodapeDataUrl: isBaturite
            ? loadAssetDataUrl('camara-baturite-rodape-ornamento.png')
            : null,
        iconsDataUrl: isBaturite
            ? loadAssetDataUrl('camara-baturite-rodape-icons.png')
            : null,
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

/** CSS do chrome institucional (barra no topo / ornamentos na base, sem margem). */
export function buildMateriaPdfChromeStyles(): string {
    return `
  .doc-cabecalho {
    flex: 0 0 auto;
    width: 100%;
    margin: 0;
    padding: 0;
    background: #fff;
  }
  .doc-cabecalho .barra-topo {
    display: block;
    width: 100%;
    height: 11px;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .doc-cabecalho .barra-topo-css {
    height: 11px;
    width: 100%;
    background: linear-gradient(90deg,#0b3d91 0%,#0b3d91 38%,#2f6fd6 38%,#2f6fd6 72%,#7eb6ff 72%,#7eb6ff 100%);
  }
  .doc-cabecalho .logo-wrap {
    text-align: center;
    padding: 8px 18mm 4px;
  }
  .doc-cabecalho .logo-wrap img {
    width: 70%;
    max-width: 440px;
    height: auto;
    max-height: 68px;
    object-fit: contain;
    display: inline-block;
  }

  .doc-rodape {
    flex: 0 0 auto;
    width: 100%;
    margin: 0;
    padding: 0;
    background: #fff;
    text-align: center;
    margin-top: auto;
  }
  .doc-rodape .contato {
    color: #2a6bb5;
    font-size: 9.5px;
    line-height: 1.35;
    padding: 8px 16mm 4px;
  }
  .doc-rodape .contato div { margin: 0; }
  .doc-rodape .ornamento {
    display: block;
    width: 100%;
    height: auto;
    max-height: 34px;
    margin: 0;
    padding: 0;
    border: 0;
    object-fit: contain;
    object-position: center bottom;
  }
`;
}

/** HTML fixo do cabeçalho — barra colada no topo da folha. */
export function buildMateriaPdfCabecalhoHtml(branding: MateriaPdfBranding): string {
    const barra = branding.topoDataUrl
        ? `<img class="barra-topo" src="${branding.topoDataUrl}" alt="" />`
        : `<div class="barra-topo-css"></div>`;
    const logo = branding.logoDataUrl
        ? `<div class="logo-wrap"><img src="${branding.logoDataUrl}" alt="Câmara" /></div>`
        : '';
    return `<div class="doc-cabecalho">${barra}${logo}</div>`;
}

/** HTML fixo do rodapé — ornamentos colados na base da folha. */
export function buildMateriaPdfRodapeHtml(branding: MateriaPdfBranding): string {
    const linhas = [
        branding.endereco,
        [branding.telefone, branding.email].filter(Boolean).join(' / '),
        branding.cnpj ? `CNPJ: ${escHtml(branding.cnpj)}` : '',
    ].filter(Boolean);

    const contato =
        linhas.length > 0
            ? `<div class="contato">${linhas.map((l) => `<div>${l}</div>`).join('')}</div>`
            : '';

    const ornamentoSrc =
        branding.iconsDataUrl || branding.rodapeDataUrl || null;
    const ornamento = ornamentoSrc
        ? `<img class="ornamento" src="${ornamentoSrc}" alt="" />`
        : '';

    return `<div class="doc-rodape">${contato}${ornamento}</div>`;
}
