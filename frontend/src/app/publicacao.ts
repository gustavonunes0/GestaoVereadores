import { MODULE_ICONS, ROUTES } from './navigation';

/** Metadados dos módulos de documentos no pipeline (rotas independentes). */
export const PUBLICACAO_MODULES = {
  normas: {
    id: 'normas' as const,
    domain: 'normative' as const,
    pipelineStep: 4,
    to: ROUTES.normasJuridicas,
    title: 'Normas jurídicas',
    icon: MODULE_ICONS.normas,
    introTitle: 'Natureza normativa e legislativa',
    introText:
      'Leis, resoluções, decretos legislativos e demais normas com força jurídica. Identifique espécie, número, ano, ementa e vínculo com matéria aprovada.',
    ruleHint:
      'Somente matérias com status APROVADA podem originar norma jurídica.',
    footerHint: 'Resultado formal do processo legislativo.',
    accentClass: 'publicacao-module--norma',
    listPanelTitle: 'Normas registradas',
    listPanelDesc: 'Espécie, número, ano, ementa e data de publicação.',
  },
  atos: {
    id: 'atos' as const,
    domain: 'administrative' as const,
    pipelineStep: 5,
    to: ROUTES.atosAdministrativos,
    title: 'Atos administrativos',
    icon: MODULE_ICONS.atos,
    introTitle: 'Gestão administrativa interna',
    introText:
      'Portarias, nomeações, exonerações, designações e demais decisões de execução da Câmara. Priorize tipo, classificação, número e vigência.',
    footerHint: 'Decisões de gestão, distintas das normas jurídicas.',
    accentClass: 'publicacao-module--ato',
    listPanelTitle: 'Atos registrados',
    listPanelDesc: 'Tipo, classificação, número, vigência e publicação.',
  },
} as const;

export type PublicacaoModuleId = keyof typeof PUBLICACAO_MODULES;
