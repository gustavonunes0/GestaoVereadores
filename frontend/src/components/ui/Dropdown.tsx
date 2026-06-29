import {
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { tokens } from './tokens';

export interface DropdownOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface DropdownProps {
    id?: string;
    label?: string;
    options: DropdownOption[];
    value: string | number | null;
    onChange: (value: string | number) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    className?: string;
    filter?: boolean;
    filterPlaceholder?: string;
    /** Render custom option row (label still used for filter). */
    itemTemplate?: (option: DropdownOption) => ReactNode;
}

export function Dropdown({
    id,
    label,
    options,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    loading = false,
    error,
    className = '',
    filter = false,
    filterPlaceholder = 'Buscar...',
    itemTemplate,
}: DropdownProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const listboxId = `${fieldId}-listbox`;

    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
    const [panelZ, setPanelZ] = useState(1200);

    const isDisabled = disabled || loading;
    const selected = options.find((opt) => opt.value === value) ?? null;

    const filteredOptions = useMemo(() => {
        const query = filterText.trim().toLowerCase();
        if (!query) return options;
        return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [filterText, options]);

    const close = () => setOpen(false);

    const updatePanelPos = () => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPanelPos({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        });

        // O painel é portado para o body, então precisa ficar acima do overlay
        // ancestral mais alto (ex.: Dialog do PrimeReact usa autoZIndex que
        // incrementa a cada abertura e pode ultrapassar um z-index fixo).
        let node: HTMLElement | null = el;
        let maxZ = 0;
        while (node) {
            const z = Number.parseInt(window.getComputedStyle(node).zIndex, 10);
            if (!Number.isNaN(z)) maxZ = Math.max(maxZ, z);
            node = node.parentElement;
        }
        setPanelZ(maxZ > 0 ? maxZ + 1 : 1200);
    };

    useLayoutEffect(() => {
        if (open) updatePanelPos();
    }, [open]);

    useEffect(() => {
        if (!open) {
            setFilterText('');
            return;
        }

        if (filter) {
            filterRef.current?.focus();
        }

        const onReposition = () => updatePanelPos();
        window.addEventListener('resize', onReposition);
        window.addEventListener('scroll', onReposition, true);

        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (panelRef.current?.contains(target)) return;
            close();
        };

        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, filter]);

    function handleSelect(option: DropdownOption) {
        if (isDisabled || option.disabled) return;
        onChange(option.value);
        close();
    }

    function toggleOpen() {
        if (isDisabled) return;
        setOpen((prev) => !prev);
    }

    function handleTriggerKeyDown(event: KeyboardEvent) {
        if (isDisabled) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleOpen();
        }
    }

    const triggerClasses = [
        'relative flex items-center justify-between gap-2 w-full min-h-[38px] px-3 py-2 rounded-[6px] border cursor-pointer select-none transition-colors text-[13px]',
        'bg-[#fafbfc]',
        open
            ? 'border-[#2563a8] ring-2 ring-[#2563a8]/10'
            : 'border-[#dde2ea] hover:border-[#b0bac8]',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        error && 'border-red-400',
    ]
        .filter(Boolean)
        .join(' ');

    const panel =
        open && typeof document !== 'undefined' ? (
            <div
                ref={panelRef}
                className="sigl-ui-dropdown-panel bg-white border border-[#eef0f3] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden"
                style={{
                    position: 'fixed',
                    top: panelPos.top,
                    left: panelPos.left,
                    width: panelPos.width,
                    zIndex: panelZ,
                }}
            >
                {filter ? (
                    <div className="p-2 border-b border-[#eef0f3]">
                        <input
                            ref={filterRef}
                            type="text"
                            value={filterText}
                            onChange={(event) => setFilterText(event.target.value)}
                            placeholder={filterPlaceholder}
                            className="w-full px-2.5 py-1.5 text-[13px] text-[#374151] border border-[#dde2ea] rounded-[6px] outline-none focus:border-[#2563a8] focus:ring-2 focus:ring-[#2563a8]/10"
                        />
                    </div>
                ) : null}

                <ul id={listboxId} role="listbox" className="max-h-56 overflow-y-auto py-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <li
                                    key={String(option.value)}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={option.disabled || undefined}
                                    onClick={() => handleSelect(option)}
                                    className={[
                                        'flex items-center justify-between px-3 py-2 text-[13px] transition-colors',
                                        option.disabled
                                            ? 'text-[#b0bac8] cursor-not-allowed'
                                            : 'cursor-pointer hover:bg-[#f5f6f8]',
                                        isSelected
                                            ? 'bg-[#f0f4fa] text-[#2563a8] font-medium'
                                            : 'text-[#374151]',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    <span className="min-w-0 truncate">
                                        {itemTemplate ? itemTemplate(option) : option.label}
                                    </span>
                                    {isSelected ? (
                                        <CheckOutlined
                                            sx={{ fontSize: 15, color: tokens.accent }}
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </li>
                            );
                        })
                    ) : (
                        <li className="px-3 py-2 text-[13px] text-[#b0bac8]">
                            {loading ? 'Carregando…' : 'Nenhuma opção encontrada'}
                        </li>
                    )}
                </ul>
            </div>
        ) : null;

    return (
        <div className={`sigl-ui-dropdown flex flex-col gap-1.5 w-full ${className}`.trim()}>
            {label ? (
                <label htmlFor={fieldId} className="text-[13px] font-medium text-[#374151]">
                    {label}
                    {required ? <span className="text-red-500 ml-0.5">*</span> : null}
                </label>
            ) : null}

            <div className="relative w-full">
                <div
                    ref={triggerRef}
                    id={fieldId}
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-controls={listboxId}
                    aria-invalid={error ? true : undefined}
                    aria-busy={loading || undefined}
                    tabIndex={isDisabled ? -1 : 0}
                    onClick={toggleOpen}
                    onKeyDown={handleTriggerKeyDown}
                    className={triggerClasses}
                >
                    <span
                        className={`truncate ${selected ? 'text-[#374151]' : 'text-[#b0bac8]'}`}
                    >
                        {loading
                            ? 'Carregando…'
                            : (selected?.label ?? placeholder ?? 'Selecione...')}
                    </span>
                    <KeyboardArrowDownOutlined
                        sx={{ fontSize: 18, color: tokens.muted, flexShrink: 0 }}
                        className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </div>

                {panel ? createPortal(panel, document.body) : null}
            </div>

            {error ? (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <ErrorOutlineOutlined sx={{ fontSize: 13 }} aria-hidden="true" />
                    {error}
                </p>
            ) : null}
        </div>
    );
}
