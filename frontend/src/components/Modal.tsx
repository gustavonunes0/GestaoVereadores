import { type ReactNode } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
