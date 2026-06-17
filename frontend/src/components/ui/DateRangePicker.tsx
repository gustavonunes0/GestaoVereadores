import { useEffect, useId, useRef, useState } from 'react';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import { CalendarGrid } from './CalendarGrid';
import {
    addMonths,
    formatRange,
    startOfDay,
} from './date-utils';

export interface DateRangePickerProps {
    id?: string;
    label?: string;
    value: [Date | null, Date | null];
    onChange: (range: [Date | null, Date | null]) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export function DateRangePicker({
    id,
    label,
    value,
    onChange,
    placeholder = 'Início — Fim',
    required = false,
    disabled = false,
    error,
    className = '',
}: DateRangePickerProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<[Date | null, Date | null]>(value);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(() =>
        startOfDay(value[0] ?? new Date()),
    );

    const hasValue = Boolean(value[0] || value[1]);
    const nextMonth = addMonths(currentMonth, 1);

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
        if (open) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    function openPopover() {
        if (disabled) return;
        setDraft(value);
        setCurrentMonth(startOfDay(value[0] ?? new Date()));
        setHoverDate(null);
        setOpen(true);
    }

    function handleDayClick(day: Date) {
        const clicked = startOfDay(day);

        if (!draft[0] || (draft[0] && draft[1])) {
            setDraft([clicked, null]);
            return;
        }

        const start = startOfDay(draft[0]);
        if (clicked.getTime() < start.getTime()) {
            setDraft([clicked, start]);
        } else {
            setDraft([start, clicked]);
        }
    }

    function handleClear(event?: React.MouseEvent) {
        event?.stopPropagation();
        setDraft([null, null]);
        onChange([null, null]);
        setHoverDate(null);
    }

    function handleApply() {
        onChange(draft);
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
                    aria-haspopup="dialog"
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
                        {hasValue ? formatRange(value) : placeholder}
                    </span>
                    {hasValue && !disabled ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-[#b0bac8] hover:text-[#8492a6]"
                            aria-label="Limpar período"
                        >
                            <CloseOutlined sx={{ fontSize: 14 }} aria-hidden="true" />
                        </button>
                    ) : null}
                </div>

                {open ? (
                    <div
                        role="dialog"
                        aria-label="Selecionar período"
                        className="absolute z-50 top-full left-0 mt-1 bg-white border border-[#eef0f3] rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-4"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                            <CalendarGrid
                                month={currentMonth}
                                selected={draft}
                                hoverDate={hoverDate}
                                onDayClick={handleDayClick}
                                onDayHover={setHoverDate}
                                onPrevMonth={() => setCurrentMonth(addMonths(currentMonth, -1))}
                                showPrev
                            />
                            <CalendarGrid
                                month={nextMonth}
                                selected={draft}
                                hoverDate={hoverDate}
                                onDayClick={handleDayClick}
                                onDayHover={setHoverDate}
                                onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                showNext
                            />
                        </div>

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
