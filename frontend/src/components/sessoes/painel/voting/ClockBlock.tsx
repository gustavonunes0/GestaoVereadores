export function ClockBlock({ clock, date }: { clock: string; date: string }) {
    return (
        <div
            className="vp-clock"
            role="timer"
            aria-live="off"
            aria-label={`Horário ${clock}, data ${date}`}
        >
            <div className="vp-clock__icon" aria-hidden>
                <i className="pi pi-clock" />
            </div>
            <div className="vp-clock__text">
                <span className="vp-clock__caption">Horário Oficial</span>
                <span className="vp-clock__time">{clock}</span>
                <span className="vp-clock__date">{date}</span>
            </div>
        </div>
    );
}
