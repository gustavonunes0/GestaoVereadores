import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import BalanceOutlined from '@mui/icons-material/BalanceOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import RecentActorsOutlined from '@mui/icons-material/RecentActorsOutlined';
import TaskOutlined from '@mui/icons-material/TaskOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

/** Mapeia classes PrimeIcons (`pi pi-*`) para ícones MUI nos page headers. */
const MODULE_HEADER_ICON_MAP: Record<string, SvgIconComponent> = {
    'pi-th-large': DashboardOutlined,
    'pi-file-edit': DescriptionOutlined,
    'pi-calendar': GavelOutlined,
    'pi-chart-bar': BarChartOutlined,
    'pi-calendar-plus': CalendarMonthOutlined,
    'pi-sitemap': AccountBalanceOutlined,
    'pi-users': GroupsOutlined,
    'pi-briefcase': PeopleOutlined,
    'pi-flag': FlagOutlined,
    'pi-id-card': RecentActorsOutlined,
    'pi-user-edit': PersonAddOutlined,
    'pi-history': HistoryOutlined,
    'pi-file': BalanceOutlined,
    'pi-inbox': TaskOutlined,
    'pi-shield': ManageAccountsOutlined,
    'pi-home': DashboardOutlined,
    'pi-align-left': ArticleOutlined,
    'pi-globe': PublicOutlined,
};

export function resolveModuleHeaderIcon(
    iconClass?: string,
): SvgIconComponent | null {
    if (!iconClass) return null;
    const key = iconClass.trim().split(/\s+/).find((part) => part.startsWith('pi-'));
    if (!key) return null;
    return MODULE_HEADER_ICON_MAP[key] ?? null;
}
