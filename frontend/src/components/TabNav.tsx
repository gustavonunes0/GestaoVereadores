import { NavLink } from 'react-router-dom';

export type TabItem = { to: string; label: string; end?: boolean };

type Props = {
  tabs: TabItem[];
  className?: string;
};

export function TabNav({ tabs, className = '' }: Props) {
  return (
    <nav className={`tab-nav ${className}`.trim()} aria-label="Abas">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `tab-nav-item${isActive ? ' active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
