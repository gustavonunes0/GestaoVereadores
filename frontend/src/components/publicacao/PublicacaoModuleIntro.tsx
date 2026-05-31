import type { PublicacaoModuleId } from '../../app/publicacao';
import { PUBLICACAO_MODULES } from '../../app/publicacao';

type Props = {
  moduleId: PublicacaoModuleId;
};

/** Contexto conceitual — distingue normas (legislativo) de atos (administrativo). */
export function PublicacaoModuleIntro({ moduleId }: Props) {
  const mod = PUBLICACAO_MODULES[moduleId];
  const ruleHint = 'ruleHint' in mod ? mod.ruleHint : undefined;

  return (
    <div className={`publicacao-module-intro ${mod.accentClass}`} role="note">
      <div className="publicacao-module-intro__icon" aria-hidden>
        <i className={mod.icon} />
      </div>
      <div className="publicacao-module-intro__body">
        <p className="publicacao-module-intro__title">{mod.introTitle}</p>
        <p className="publicacao-module-intro__text">{mod.introText}</p>
        {ruleHint && (
          <p className="publicacao-module-intro__rule">
            <i className="pi pi-info-circle" aria-hidden /> {ruleHint}
          </p>
        )}
      </div>
    </div>
  );
}
