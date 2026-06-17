import AccountBalance from '@mui/icons-material/AccountBalance';
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import Article from '@mui/icons-material/Article';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import Badge from '@mui/icons-material/Badge';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import BarChart from '@mui/icons-material/BarChart';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import Balance from '@mui/icons-material/Balance';
import BalanceOutlined from '@mui/icons-material/BalanceOutlined';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import Dashboard from '@mui/icons-material/Dashboard';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import Description from '@mui/icons-material/Description';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Flag from '@mui/icons-material/Flag';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import Gavel from '@mui/icons-material/Gavel';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import Groups from '@mui/icons-material/Groups';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import ManageAccounts from '@mui/icons-material/ManageAccounts';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import People from '@mui/icons-material/People';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import PersonAdd from '@mui/icons-material/PersonAdd';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import Public from '@mui/icons-material/Public';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import RecentActors from '@mui/icons-material/RecentActors';
import RecentActorsOutlined from '@mui/icons-material/RecentActorsOutlined';
import Task from '@mui/icons-material/Task';
import TaskOutlined from '@mui/icons-material/TaskOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export interface SidebarIconPair {
    icon: SvgIconComponent;
    iconActive: SvgIconComponent;
}

export const SIDEBAR_ICONS = {
    badge: { icon: BadgeOutlined, iconActive: Badge },
    article: { icon: ArticleOutlined, iconActive: Article },
    dashboard: { icon: DashboardOutlined, iconActive: Dashboard },
    gavel: { icon: GavelOutlined, iconActive: Gavel },
    description: { icon: DescriptionOutlined, iconActive: Description },
    balance: { icon: BalanceOutlined, iconActive: Balance },
    task: { icon: TaskOutlined, iconActive: Task },
    groups: { icon: GroupsOutlined, iconActive: Groups },
    recent_actors: { icon: RecentActorsOutlined, iconActive: RecentActors },
    people: { icon: PeopleOutlined, iconActive: People },
    flag: { icon: FlagOutlined, iconActive: Flag },
    person_add: { icon: PersonAddOutlined, iconActive: PersonAdd },
    calendar_month: { icon: CalendarMonthOutlined, iconActive: CalendarMonth },
    bar_chart: { icon: BarChartOutlined, iconActive: BarChart },
    account_balance: { icon: AccountBalanceOutlined, iconActive: AccountBalance },
    public: { icon: PublicOutlined, iconActive: Public },
    manage_accounts: { icon: ManageAccountsOutlined, iconActive: ManageAccounts },
} as const satisfies Record<string, SidebarIconPair>;

export type SidebarIconKey = keyof typeof SIDEBAR_ICONS;
