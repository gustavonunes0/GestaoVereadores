import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from 'react';
import { Checkbox } from 'primereact/checkbox';
import { estiloFoto } from '../../utils/estiloFoto';
import '../../styles/enquadramento-foto.css';

export type EnquadramentoFotoValue = {
    photoPosX: number;
    photoPosY: number;
    photoZoom: number;
    photoPositionConfirmed: boolean;
};

type Props = {
    /** URL object/data/http da foto, ou null se ainda não houver. */
    photoSrc: string | null;
    value: EnquadramentoFotoValue;
    onChange: (next: EnquadramentoFotoValue) => void;
    /** Mensagem de erro da API (422) ou validação local. */
    error?: string | null;
    disabled?: boolean;
};

const DEFAULT: EnquadramentoFotoValue = {
    photoPosX: 50,
    photoPosY: 30,
    photoZoom: 1,
    photoPositionConfirmed: false,
};

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

export function defaultEnquadramento(
    partial?: Partial<EnquadramentoFotoValue>,
): EnquadramentoFotoValue {
    return { ...DEFAULT, ...partial };
}

export function EnquadramentoFoto({
    photoSrc,
    value,
    onChange,
    error,
    disabled,
}: Props) {
    const stageRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const [marked, setMarked] = useState(
        () =>
            value.photoPositionConfirmed ||
            value.photoPosX !== 50 ||
            value.photoPosY !== 30 ||
            value.photoZoom !== 1,
    );
    const prevSrc = useRef(photoSrc);

    useEffect(() => {
        if (prevSrc.current === photoSrc) return;
        prevSrc.current = photoSrc;
        // Nova foto → exige marcar de novo.
        setMarked(false);
    }, [photoSrc]);

    const framing = useMemo(
        () =>
            estiloFoto({
                photoPosX: value.photoPosX,
                photoPosY: value.photoPosY,
                photoZoom: value.photoZoom,
            }),
        [value.photoPosX, value.photoPosY, value.photoZoom],
    );

    function emit(
        patch: Partial<EnquadramentoFotoValue>,
        opts?: { keepConfirmed?: boolean; asMarked?: boolean },
    ) {
        const next: EnquadramentoFotoValue = {
            ...value,
            ...patch,
            photoPositionConfirmed: opts?.keepConfirmed
                ? Boolean(patch.photoPositionConfirmed ?? value.photoPositionConfirmed)
                : false,
        };
        if (opts?.asMarked) setMarked(true);
        onChange(next);
    }

    function setFromClientPoint(clientX: number, clientY: number) {
        const el = stageRef.current;
        if (!el || disabled) return;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
        const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
        emit({ photoPosX: Math.round(x * 100) / 100, photoPosY: Math.round(y * 100) / 100 }, {
            asMarked: true,
        });
    }

    function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
        if (disabled || !photoSrc) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        setFromClientPoint(e.clientX, e.clientY);
    }

    function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (!dragging.current) return;
        setFromClientPoint(e.clientX, e.clientY);
    }

    function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
        dragging.current = false;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            /* already released */
        }
    }

    function nudge(dx: number, dy: number) {
        if (disabled || !photoSrc) return;
        emit(
            {
                photoPosX: clamp(Math.round((value.photoPosX + dx) * 100) / 100, 0, 100),
                photoPosY: clamp(Math.round((value.photoPosY + dy) * 100) / 100, 0, 100),
            },
            { asMarked: true },
        );
    }

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (disabled || !photoSrc) return;
        const step = e.shiftKey ? 5 : 1;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            nudge(-step, 0);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nudge(step, 0);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            nudge(0, -step);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            nudge(0, step);
        }
    }

    if (!photoSrc) {
        return (
            <div className="enquadramento-foto enquadramento-foto--empty">
                <p className="text-color-secondary m-0">
                    Envie uma foto para definir o enquadramento do rosto.
                </p>
            </div>
        );
    }

    const canConfirm = marked || value.photoPositionConfirmed;

    return (
        <div className="enquadramento-foto">
            <p className="enquadramento-foto__hint m-0">
                Clique ou arraste o marcador até o centro do rosto. Use as setas do teclado
                para ajuste fino (1%).
            </p>

            <div className="enquadramento-foto__layout">
                <div className="enquadramento-foto__editor">
                    <span className="enquadramento-foto__preview-label">Ajuste do rosto</span>
                    <div
                        ref={stageRef}
                        className="enquadramento-foto__stage"
                        role="application"
                        tabIndex={disabled ? -1 : 0}
                        aria-label="Marcador do centro do rosto"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        onKeyDown={onKeyDown}
                    >
                        <img
                            src={photoSrc}
                            alt=""
                            className="enquadramento-foto__stage-img"
                            draggable={false}
                        />
                        <span
                            className="enquadramento-foto__marker"
                            style={{
                                left: `${value.photoPosX}%`,
                                top: `${value.photoPosY}%`,
                            }}
                            aria-hidden
                        />
                    </div>

                    <div className="enquadramento-foto__zoom">
                        <label htmlFor="eq-zoom">
                            Zoom ({Math.round(value.photoZoom * 100)}%)
                        </label>
                        <input
                            id="eq-zoom"
                            type="range"
                            min={1}
                            max={2.5}
                            step={0.05}
                            value={value.photoZoom}
                            disabled={disabled}
                            onChange={(e) =>
                                emit(
                                    { photoZoom: Number(e.target.value) },
                                    { asMarked: true },
                                )
                            }
                        />
                    </div>
                </div>

                <div className="enquadramento-foto__result">
                    <span className="enquadramento-foto__preview-label">Enquadramento</span>
                    <div className="enquadramento-foto__card enquadramento-foto__card--result">
                        <div className="enquadramento-foto__card-photo">
                            <img src={photoSrc} alt="" style={framing} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="enquadramento-foto__confirm flex align-items-center gap-2">
                <Checkbox
                    inputId="eq-confirm"
                    checked={value.photoPositionConfirmed}
                    disabled={disabled || !canConfirm}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            photoPositionConfirmed: Boolean(e.checked),
                        })
                    }
                />
                <label htmlFor="eq-confirm">
                    Conferi o enquadramento
                </label>
            </div>

            {!marked && !value.photoPositionConfirmed ? (
                <small className="p-error">Falta: marcar o rosto na foto</small>
            ) : null}
            {marked && !value.photoPositionConfirmed ? (
                <small className="p-error">Falta: confirmar o enquadramento</small>
            ) : null}
            {error ? <small className="p-error">{error}</small> : null}
        </div>
    );
}
