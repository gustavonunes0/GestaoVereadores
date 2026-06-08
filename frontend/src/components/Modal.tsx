import { type ReactNode } from 'react';

type Props = {
    title: string;
    onClose: () => void;
    children: ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
    return (
        <div className="modal-backdrop" onClick={onClose} role="presentation">
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="modal-header">
                    <h2 id="modal-title">{title}</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        <i className="pi pi-times" aria-hidden />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
