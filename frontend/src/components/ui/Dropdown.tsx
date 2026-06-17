import { useEffect, useId, useRef, useState } from 'react';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';

export interface DropdownOption {
    label: string;
    value: string | number;
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
    error?: string;
    className?: string;
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
    error,
    className = '',
}: DropdownProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [open, setOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((opt) => opt.value === value) ?? null;

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
            return;
        }
        const selectedIndex = options.findIndex((opt) => opt.value === value);
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }, [open, options, value]);

    function handleSelect(option: DropdownOption) {
        if (disabled) return;
        onChange(option.value);
        setOpen(false);
    }

    function handleKeyDown(event: React.KeyboardEvent) {
        if (disabled) return;

        if (event.key === 'Escape') {
            setOpen(false);
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!open) {
                setOpen(true);
                return;
            }
            if (focusedIndex >= 0 && options[focusedIndex]) {
                handleSelect(options[focusedIndex]);
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) {
                setOpen(true);
                return;
            }
            setFocusedIndex((index) => Math.min(index + 1, options.length - 1));
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
                        'relative flex items-center justify-between px-3 py-2 rounded-[6px] border cursor-pointer select-none transition-colors',
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
                    <span className={selected ? 'text-[#374151]' : 'text-[#b0bac8]'}>
                        {selected?.label ?? placeholder ?? 'Selecione...'}
                    </span>
                    <KeyboardArrowDownOutlined
                        sx={{ fontSize: 18, color: '#8492a6' }}
                        className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </div>

                {open ? (
                    <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-[#eef0f3] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
                        <ul
                            id={`${fieldId}-listbox`}
                            role="listbox"
                            className="max-h-56 overflow-y-auto py-1"
                        >
                            {options.map((option, index) => (
                                <li
                                    key={String(option.value)}
                                    role="option"
                                    aria-selected={option.value === value}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    onClick={() => handleSelect(option)}
                                    className={[
                                        'flex items-center justify-between px-3 py-2 text-[13px] cursor-pointer transition-colors',
                                        option.value === value
                                            ? 'bg-[#f0f4fa] text-[#2563a8] font-medium'
                                            : 'text-[#374151] hover:bg-[#f5f6f8]',
                                        focusedIndex === index && option.value !== value
                                            ? 'bg-[#f5f6f8]'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    {option.label}
                                    {option.value === value ? (
                                        <CheckOutlined
                                            sx={{ fontSize: 15, color: '#2563a8' }}
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </li>
                            ))}
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
