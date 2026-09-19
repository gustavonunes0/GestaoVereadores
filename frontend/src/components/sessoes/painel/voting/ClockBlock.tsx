export function ClockBlock({ clock, date }: { clock: string; date: string }) {
    return (
        <div
            className="vp-clock"
            role="timer"
            aria-live="off"
            aria-label={`Horário ${clock}, data ${date}`}
        >
            <span className="vp-clock__time" aria-hidden>
                {clock}
            </span>
            <span className="vp-clock__date" aria-hidden>
                {date}
            </span>
        </div>
    );
}
