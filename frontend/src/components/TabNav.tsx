import { NavLink } from 'react-router-dom';
import { ModuleTitle } from './common/ModuleTitle';

export type TabItem = { to: string; label: string; icon?: string; end?: boolean };

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
          <ModuleTitle icon={tab.icon} as="span" className="tab-nav-item__label">
            {tab.label}
          </ModuleTitle>
        </NavLink>
      ))}
    </nav>
  );
}
