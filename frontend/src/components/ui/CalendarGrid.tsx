import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import {
    formatMonthYear,
    getCalendarDays,
    getWeekdayLabels,
    isDateInRange,
    isSameDay,
    isSameMonth,
    startOfDay,
} from './date-utils';

export interface CalendarGridProps {
    month: Date;
    selected: [Date | null, Date | null];
    hoverDate: Date | null;
    onDayClick: (date: Date) => void;
    onDayHover: (date: Date) => void;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
    showPrev?: boolean;
    showNext?: boolean;
}

export function CalendarGrid({
    month,
    selected,
    hoverDate,
    onDayClick,
    onDayHover,
    onPrevMonth,
    onNextMonth,
    showPrev = false,
    showNext = false,
}: CalendarGridProps) {
    const today = startOfDay(new Date());
    const days = getCalendarDays(month);
    const weekdays = getWeekdayLabels();

    return (
        <div className="w-[252px]">
            <div className="flex items-center justify-between mb-3 px-1">
                {showPrev ? (
                    <button
                        type="button"
                        onClick={onPrevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeftOutlined sx={{ fontSize: 18 }} aria-hidden="true" />
                    </button>
                ) : (
                    <span className="w-8" />
                )}
                <span className="text-[13px] font-semibold text-[#1c2f4a]">
                    {formatMonthYear(month)}
                </span>
                {showNext ? (
                    <button
                        type="button"
                        onClick={onNextMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors"
                        aria-label="Próximo mês"
                    >
                        <ChevronRightOutlined sx={{ fontSize: 18 }} aria-hidden="true" />
                    </button>
                ) : (
                    <span className="w-8" />
                )}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {weekdays.map((label) => (
                    <span
                        key={label}
                        className="text-[10px] font-medium text-[#8492a6] text-center py-1"
                    >
                        {label}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (!day) {
                        return <span key={`empty-${index}`} className="h-8" />;
                    }

                    const inMonth = isSameMonth(day, month);
                    const isStart = isSameDay(day, selected[0]);
                    const isEnd = isSameDay(day, selected[1]);
                    const isSelected = isStart || isEnd;
                    const isInRange = isDateInRange(day, selected[0], selected[1], hoverDate);
                    const isToday = isSameDay(day, today);

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            disabled={!inMonth}
                            onClick={() => onDayClick(day)}
                            onMouseEnter={() => onDayHover(day)}
                            className={[
                                'h-8 w-8 mx-auto flex items-center justify-center text-[12px] transition-colors',
                                !inMonth && 'text-[#b0bac8] cursor-not-allowed',
                                inMonth && isSelected && 'bg-[#2563a8] text-white rounded-full',
                                inMonth &&
                                    !isSelected &&
                                    isInRange &&
                                    'bg-[#f0f4fa] text-[#2563a8] rounded-full',
                                inMonth &&
                                    !isSelected &&
                                    !isInRange &&
                                    isToday &&
                                    'font-semibold border border-[#2563a8] rounded-full text-[#374151]',
                                inMonth &&
                                    !isSelected &&
                                    !isInRange &&
                                    !isToday &&
                                    'text-[#374151] hover:bg-[#f5f6f8] rounded-full',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
