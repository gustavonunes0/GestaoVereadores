import { useEffect, useId, useMemo, useRef, useState } from 'react';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import type { DropdownOption } from './Dropdown';

export interface MultiSelectProps {
    id?: string;
    label?: string;
    options: DropdownOption[];
    value: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    filter?: boolean;
}

export function MultiSelect({
    id,
    label,
    options,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    className = '',
    filter = false,
}: MultiSelectProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [open, setOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [filterText, setFilterText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const filterInputRef = useRef<HTMLInputElement>(null);

    const selectedOptions = useMemo(
        () => options.filter((opt) => value.includes(opt.value)),
        [options, value],
    );

    const filteredOptions = useMemo(() => {
        const query = filterText.trim().toLowerCase();
        if (!query) return options;
        return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [filterText, options]);

    useEffect(() => {
        function handleOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    useEffect(() => {
        if (!open) {
            setFocusedIndex(-1);
            setFilterText('');
            return;
        }
        if (filter) {
            filterInputRef.current?.focus();
        }
        setFocusedIndex(filteredOptions.length > 0 ? 0 : -1);
    }, [open, filter, filteredOptions.length]);

    function toggleValue(optionValue: string | number) {
        if (disabled) return;
        if (value.includes(optionValue)) {
            onChange(value.filter((item) => item !== optionValue));
            return;
        }
        onChange([...value, optionValue]);
    }

    function removeValue(optionValue: string | number, event: React.MouseEvent) {
        event.stopPropagation();
        if (disabled) return;
        onChange(value.filter((item) => item !== optionValue));
    }

    function handleKeyDown(event: React.KeyboardEvent) {
        if (disabled) return;

        if (event.key === 'Escape') {
            setOpen(false);
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            if (event.target === filterInputRef.current) return;
            event.preventDefault();
            if (!open) {
                setOpen(true);
                return;
            }
            if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                toggleValue(filteredOptions[focusedIndex].value);
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) {
                setOpen(true);
                return;
            }
            setFocusedIndex((index) =>
                Math.min(index + 1, filteredOptions.length - 1),
            );
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
                setOpen(true);
                return;
            }
            setFocusedIndex((index) => Math.max(index - 1, 0));
        }
    }

    return (
        <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
            {label ? (
                <label htmlFor={fieldId} className="text-[13px] font-medium text-[#374151]">
                    {label}
                    {required ? <span className="text-red-500 ml-0.5">*</span> : null}
                </label>
            ) : null}

            <div ref={containerRef} className="relative">
                <div
                    id={fieldId}
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-controls={`${fieldId}-listbox`}
                    aria-invalid={error ? true : undefined}
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => {
                        if (!disabled) setOpen((prev) => !prev);
                    }}
                    onKeyDown={handleKeyDown}
                    className={[
                        'relative flex items-center justify-between gap-2 min-h-[38px] px-3 py-1.5 rounded-[6px] border cursor-pointer select-none transition-colors',
                        'bg-[#fafbfc] text-[13px] text-[#374151]',
                        open
                            ? 'border-[#2563a8] ring-2 ring-[#2563a8]/10'
                            : 'border-[#dde2ea] hover:border-[#b0bac8]',
                        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                        error && 'border-red-400',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 py-0.5">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((option) => (
                                <span
                                    key={String(option.value)}
                                    className="inline-flex items-center gap-1 max-w-full px-2 py-0.5 rounded-[4px] bg-[#eef2f8] text-[12px] text-[#2563a8] font-medium"
                                >
                                    <span className="truncate">{option.label}</span>
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        aria-label={`Remover ${option.label}`}
                                        onClick={(event) => removeValue(option.value, event)}
                                        className="inline-flex items-center justify-center rounded-full hover:bg-[#dbe4f2] transition-colors"
                                    >
                                        <CloseOutlined sx={{ fontSize: 13 }} aria-hidden="true" />
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="text-[#b0bac8] py-0.5">
                                {placeholder ?? 'Selecione...'}
                            </span>
                        )}
                    </div>
                    <KeyboardArrowDownOutlined
                        sx={{ fontSize: 18, color: '#8492a6', flexShrink: 0 }}
                        className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </div>

                {open ? (
                    <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-[#eef0f3] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
                        {filter ? (
                            <div className="p-2 border-b border-[#eef0f3]">
                                <input
                                    ref={filterInputRef}
                                    type="text"
                                    value={filterText}
                                    onChange={(event) => setFilterText(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Buscar..."
                                    className="w-full px-2.5 py-1.5 text-[13px] text-[#374151] border border-[#dde2ea] rounded-[6px] outline-none focus:border-[#2563a8] focus:ring-2 focus:ring-[#2563a8]/10"
                                />
                            </div>
                        ) : null}

                        <ul
                            id={`${fieldId}-listbox`}
                            role="listbox"
                            aria-multiselectable="true"
                            className="max-h-56 overflow-y-auto py-1"
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const selected = value.includes(option.value);
                                    return (
                                        <li
                                            key={String(option.value)}
                                            role="option"
                                            aria-selected={selected}
                                            onMouseEnter={() => setFocusedIndex(index)}
                                            onClick={() => toggleValue(option.value)}
                                            className={[
                                                'flex items-center justify-between px-3 py-2 text-[13px] cursor-pointer transition-colors',
                                                selected
                                                    ? 'bg-[#f0f4fa] text-[#2563a8] font-medium'
                                                    : 'text-[#374151] hover:bg-[#f5f6f8]',
                                                focusedIndex === index && !selected
                                                    ? 'bg-[#f5f6f8]'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        >
                                            {option.label}
                                            {selected ? (
                                                <CheckOutlined
                                                    sx={{ fontSize: 15, color: '#2563a8' }}
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="px-3 py-2 text-[13px] text-[#b0bac8]">
                                    Nenhuma opção encontrada
                                </li>
                            )}
                        </ul>
                    </div>
                ) : null}
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
