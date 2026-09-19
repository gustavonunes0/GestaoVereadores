import { useClock } from './useClock';
import { ROLE_LABEL_APRESENTACAO, type Councilor } from './types';
import { resolveMateriaTextoOriginalUrl } from '../../../../utils/materiaDisplay';

const MESES_CURTO = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
] as const;

function resolvePhoto(url?: string | null): string | null {
    const trimmed = url?.trim();
    if (!trimmed) return null;
    return resolveMateriaTextoOriginalUrl(trimmed);
}

function Avatar({
    name,
    photoUrl,
    size,
}: {
    name: string;
    photoUrl?: string | null;
    size: 'lg' | 'md';
}) {
    const src = resolvePhoto(photoUrl);
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');

    return (
        <div className={`mesa-avatar mesa-avatar--${size}`} aria-hidden={!src}>
            {src ? (
                <img src={src} alt="" className="mesa-avatar__img" />
            ) : (
                <span className="mesa-avatar__fallback">{initials || '—'}</span>
            )}
        </div>
    );
}

function roleLabel(member: Councilor): string {
    if (member.role) return ROLE_LABEL_APRESENTACAO[member.role];
    if (member.cargoLabel?.trim()) return member.cargoLabel.trim().toUpperCase();
    return 'MESA';
}

export function MesaApresentacaoPanel({
    sessaoLabel,
    logoSrc,
    institutionName,
    president,
    mesa,
    aoVivo,
}: {
    sessaoLabel: string;
    logoSrc: string;
    institutionName: string;
    president: Councilor | null;
    mesa: Councilor[];
    aoVivo?: boolean;
}) {
    const { clock, dateLabel } = useClock();
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = MESES_CURTO[now.getMonth()];
    const timeHm = clock.slice(0, 5);

    const demais = mesa.filter((m) => m.id !== president?.id);
    const ticker = [
        sessaoLabel,
        institutionName,
        'COMPOSIÇÃO DA MESA DIRETORA',
        ...demais.map((m) => `${roleLabel(m)}: ${m.name}`),
    ]
        .filter(Boolean)
        .join('  ·  ');

    return (
        <section
            className="mesa-apresentacao"
            aria-label="Composição da mesa diretora"
        >
            <header className="mesa-apresentacao__top">
                <img src={logoSrc} alt="" className="mesa-apresentacao__logo" />
                <div className="mesa-apresentacao__top-center">
                    <p className="mesa-apresentacao__sessao">{sessaoLabel}</p>
                    <h1 className="mesa-apresentacao__titulo">Composição da Mesa</h1>
                </div>
                {aoVivo ? (
                    <span className="mesa-apresentacao__live">
                        <span className="mesa-apresentacao__live-dot" aria-hidden />
                        Ao vivo
                    </span>
                ) : (
                    <span className="mesa-apresentacao__live mesa-apresentacao__live--off" />
                )}
            </header>

            <div className="mesa-apresentacao__body">
                <div className="mesa-apresentacao__presidente">
                    {president ? (
                        <>
                            <Avatar
                                name={president.name}
                                photoUrl={president.photoUrl}
                                size="lg"
                            />
                            <span className="mesa-apresentacao__cargo">Presidente</span>
                            <strong className="mesa-apresentacao__nome mesa-apresentacao__nome--presidente">
                                {president.name}
                            </strong>
                            {president.party ? (
                                <span className="mesa-apresentacao__partido">
                                    {president.party}
                                </span>
                            ) : null}
                        </>
                    ) : (
                        <p className="mesa-apresentacao__vazio">Presidente não informado</p>
                    )}
                </div>

                <ul className="mesa-apresentacao__lista">
                    {demais.length === 0 ? (
                        <li className="mesa-apresentacao__vazio">
                            Demais cargos da mesa não cadastrados
                        </li>
                    ) : (
                        demais.map((m) => (
                            <li key={m.id} className="mesa-apresentacao__membro">
                                <Avatar name={m.name} photoUrl={m.photoUrl} size="md" />
                                <div className="mesa-apresentacao__membro-texto">
                                    <span className="mesa-apresentacao__cargo">
                                        {roleLabel(m)}
                                    </span>
                                    <strong className="mesa-apresentacao__nome">
                                        {m.name}
                                    </strong>
                                    {m.party ? (
                                        <span className="mesa-apresentacao__partido">
                                            {m.party}
                                        </span>
                                    ) : null}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <footer className="mesa-apresentacao__footer">
                <div className="mesa-apresentacao__relogio" aria-label={`Horário ${timeHm}`}>
                    <span className="mesa-apresentacao__data-box">
                        {day} {month}
                    </span>
                    <div className="mesa-apresentacao__hora-wrap">
                        <span className="mesa-apresentacao__hora">{timeHm}</span>
                        <span className="mesa-apresentacao__hora-label">Horário local</span>
                    </div>
                </div>
                <div className="mesa-apresentacao__ticker" aria-hidden>
                    <div className="mesa-apresentacao__ticker-track">
                        <span>{ticker}</span>
                        <span>{ticker}</span>
                    </div>
                </div>
                <span className="mesa-apresentacao__data-full" aria-hidden>
                    {dateLabel}
                </span>
            </footer>
        </section>
    );
}
