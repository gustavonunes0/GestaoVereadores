import { Link } from 'react-router-dom';
import { PUBLICACAO_MODULES, type PublicacaoModuleId } from '../../app/publicacao';

type Props = {
  current: PublicacaoModuleId;
};

/** Link discreto para o outro módulo de documentos no pipeline. */
export function ModulePipelineFooter({ current }: Props) {
  const sibling = current === 'normas' ? PUBLICACAO_MODULES.atos : PUBLICACAO_MODULES.normas;

  return (
    <footer className="module-pipeline-footer" aria-label="Outro módulo do fluxo">
      <span className="module-pipeline-footer__label">Também no fluxo:</span>
      <Link to={sibling.to} className="module-pipeline-footer__link">
        <i className={sibling.icon} aria-hidden />
        {sibling.title}
      </Link>
      <span className="module-pipeline-footer__hint">{sibling.footerHint}</span>
    </footer>
  );
}
