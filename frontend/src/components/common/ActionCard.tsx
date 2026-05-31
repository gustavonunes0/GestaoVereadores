import type { FormEvent, ReactNode } from 'react';

type ActionCardProps = {
  title: string;
  description: string;
  footer: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
};

/** Card de ação com altura igual na grid e botão alinhado ao rodapé. */
export function ActionCard({ title, description, footer, onSubmit }: ActionCardProps) {
  const content = (
    <>
      <h2 className="sigl-action-card__title">{title}</h2>
      <p className="sigl-action-card__description">{description}</p>
      <div className="sigl-action-card__footer">{footer}</div>
    </>
  );

  if (onSubmit) {
    return (
      <form className="sigl-action-card" onSubmit={onSubmit}>
        {content}
      </form>
    );
  }

  return <article className="sigl-action-card">{content}</article>;
}
