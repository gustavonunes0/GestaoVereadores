import { useEffect, useId, useRef, useState } from 'react';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import { CalendarGrid } from './CalendarGrid';
import { addMonths, startOfDay } from './date-utils';

export interface DatePickerProps {
    id?: string;
    label?: string;
    value: Date | null;
    onChange: (value: Date | null) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    withTime?: boolean;
    className?: string;
}

function formatDateValue(value: Date | null, withTime: boolean): string {
    if (!value) return '';
    const date = value.toLocaleDateString('pt-BR');
    if (!withTime) return date;
    const time = value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
}

function applyTime(base: Date, hours: number, minutes: number): Date {
    const next = new Date(base);
    next.setHours(hours, minutes, 0, 0);
    return next;
}

export function DatePicker({
    id,
    label,
    value,
    onChange,
    placeholder = 'Selecione a data',
    required = false,
    disabled = false,
    error,
    withTime = false,
    className = '',
}: DatePickerProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<Date | null>(value);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(() => startOfDay(value ?? new Date()));
    const [hours, setHours] = useState(() => String(value?.getHours() ?? 0).padStart(2, '0'));
    const [minutes, setMinutes] = useState(() => String(value?.getMinutes() ?? 0).padStart(2, '0'));

    const hasValue = value !== null;

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
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setOpen(false);
        }
        if (open) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    function openPopover() {
        if (disabled) return;
        setDraft(value);
        setCurrentMonth(startOfDay(value ?? new Date()));
        setHours(String(value?.getHours() ?? 0).padStart(2, '0'));
        setMinutes(String(value?.getMinutes() ?? 0).padStart(2, '0'));
        setHoverDate(null);
        setOpen(true);
    }

    function handleDayClick(day: Date) {
        const selected = startOfDay(day);
        if (withTime) {
            setDraft(
                applyTime(
                    selected,
                    Number.parseInt(hours, 10) || 0,
                    Number.parseInt(minutes, 10) || 0,
                ),
            );
        } else {
            setDraft(selected);
        }
    }

    function handleClear(event?: React.MouseEvent) {
        event?.stopPropagation();
        setDraft(null);
        onChange(null);
        setOpen(false);
    }

    function handleApply() {
        if (!draft) {
            onChange(null);
            setOpen(false);
            return;
        }
        if (withTime) {
            onChange(
                applyTime(
                    startOfDay(draft),
                    Number.parseInt(hours, 10) || 0,
                    Number.parseInt(minutes, 10) || 0,
                ),
            );
        } else {
            onChange(startOfDay(draft));
        }
        setOpen(false);
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
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-expanded={open}
                    onClick={openPopover}
                    onKeyDown={(event) => {
                        if (disabled) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openPopover();
                        }
                    }}
                    className={[
                        'flex items-center gap-2 px-3 py-2 rounded-[6px] border bg-[#fafbfc] transition-colors',
                        disabled
                            ? 'opacity-50 cursor-not-allowed border-[#dde2ea]'
                            : 'cursor-pointer border-[#dde2ea] hover:border-[#b0bac8]',
                        error && 'border-red-400',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <CalendarMonthOutlined
                        sx={{ fontSize: 16, color: '#8492a6' }}
                        aria-hidden="true"
                    />
                    <span
                        className={`text-[13px] flex-1 ${hasValue ? 'text-[#374151]' : 'text-[#b0bac8]'}`}
                    >
                        {hasValue ? formatDateValue(value, withTime) : placeholder}
                    </span>
                    {hasValue && !disabled ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-[#b0bac8] hover:text-[#8492a6]"
                            aria-label="Limpar data"
                        >
                            <CloseOutlined sx={{ fontSize: 14 }} aria-hidden="true" />
                        </button>
                    ) : null}
                </div>

                {open ? (
                    <div
                        role="dialog"
                        aria-label="Selecionar data"
                        className="absolute z-50 top-full left-0 mt-1 bg-white border border-[#eef0f3] rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-4"
                    >
                        <CalendarGrid
                            month={currentMonth}
                            selected={[draft, null]}
                            hoverDate={hoverDate}
                            onDayClick={handleDayClick}
                            onDayHover={setHoverDate}
                            onPrevMonth={() => setCurrentMonth(addMonths(currentMonth, -1))}
                            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            showPrev
                            showNext
                        />

                        {withTime ? (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#eef0f3]">
                                <label className="text-[12px] text-[#8492a6]" htmlFor={`${fieldId}-hora`}>
                                    Hora
                                </label>
                                <input
                                    id={`${fieldId}-hora`}
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={hours}
                                    onChange={(event) => setHours(event.target.value.padStart(2, '0').slice(-2))}
                                    className="w-14 px-2 py-1 text-[13px] border border-[#dde2ea] rounded-[6px] bg-[#fafbfc]"
                                />
                                <span className="text-[#8492a6]">:</span>
                                <input
                                    id={`${fieldId}-min`}
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={minutes}
                                    onChange={(event) => setMinutes(event.target.value.padStart(2, '0').slice(-2))}
                                    className="w-14 px-2 py-1 text-[13px] border border-[#dde2ea] rounded-[6px] bg-[#fafbfc]"
                                />
                            </div>
                        ) : null}

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#eef0f3]">
                            <button
                                type="button"
                                onClick={() => handleClear()}
                                className="text-[13px] text-[#8492a6] hover:text-[#374151] flex items-center gap-1"
                            >
                                <CloseOutlined sx={{ fontSize: 14 }} aria-hidden="true" />
                                Limpar
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="px-4 py-1.5 bg-[#2563a8] text-white text-[13px] rounded-[6px] hover:bg-[#1d4f8a] transition-colors"
                            >
                                Aplicar
                            </button>
                        </div>
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
