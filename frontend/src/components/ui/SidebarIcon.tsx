import type { SvgIconComponent } from '@mui/icons-material';

interface SidebarIconProps {
    icon: SvgIconComponent;
    iconActive: SvgIconComponent;
    active: boolean;
}

export function SidebarIcon({ icon: Icon, iconActive: IconActive, active }: SidebarIconProps) {
    const Component = active ? IconActive : Icon;
    return (
        <Component
            aria-hidden="true"
            sx={{
                fontSize: 20,
                flexShrink: 0,
                color: active ? 'var(--sidebar-item-active-icon)' : 'var(--sidebar-item-icon)',
            }}
        />
    );
}
