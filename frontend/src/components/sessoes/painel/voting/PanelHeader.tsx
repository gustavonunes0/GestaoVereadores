export function PanelHeader({ title }: { title: string }) {
    return (
        <header className="vp-header">
            <h1 className="vp-header__title">{title}</h1>
        </header>
    );
}
