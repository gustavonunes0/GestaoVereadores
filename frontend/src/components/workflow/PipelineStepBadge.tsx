type Props = {
  step: number;
  total?: number;
  label: string;
  /** normative = legislativo/normas; administrative = gestão interna */
  domain: 'normative' | 'administrative';
};

/** Indicador de etapa no fluxo SIGL (topo das páginas do pipeline). */
export function PipelineStepBadge({ step, total = 6, label, domain }: Props) {
  return (
    <p
      className={`pipeline-step-badge pipeline-step-badge--${domain}`}
      aria-label={`Etapa ${step} de ${total}: ${label}`}
    >
      <span className="pipeline-step-badge__index">
        {step}
        <span className="pipeline-step-badge__of">/{total}</span>
      </span>
      <span className="pipeline-step-badge__label">{label}</span>
    </p>
  );
}
