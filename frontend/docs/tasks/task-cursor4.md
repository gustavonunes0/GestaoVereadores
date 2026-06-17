Task: Sidebar — paleta clara institucional

Referência visual

Opção 2 aprovada: sidebar branca/cinza clara, active state azul-acinzentado suave, sem cores intensas.


Tokens de cor (adicionar no arquivo de variáveis globais)

css/* Sidebar — paleta institucional clara */
--sidebar-bg:              #f8f9fb;
--sidebar-border:          #e5e7eb;  /* borda direita e divisores internos */

--sidebar-logo-area-bg:    #f8f9fb;  /* fundo da área do logo (mesmo da sidebar) */
--sidebar-logo-text:       #1c3557;  /* nome da câmara — se existir texto junto à logo */
--sidebar-logo-sub:        #6b7280;  /* subtítulo */

--sidebar-group-label:     #6b7280;  /* "LEGISLATIVO", "PESSOAS" etc. */

--sidebar-item-text:       #6b7280;  /* itens inativos */
--sidebar-item-icon:       #9ca3af;  /* ícones inativos */

--sidebar-item-active-bg:  #e8edf5;  /* fundo do item ativo */
--sidebar-item-active-text:#1c3557;  /* texto do item ativo */
--sidebar-item-active-icon:#1c3557;  /* ícone do item ativo */

--sidebar-item-hover-bg:   #f0f2f7;  /* hover em item inativo */
--sidebar-item-hover-text: #374151;  /* texto no hover */


CSS completo da sidebar

css/* Container */
.sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Área do logo — preservar a logo original da Câmara */
.sidebar-logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 14px 14px;        /* ajuste de padding apenas */
  border-bottom: 1px solid var(--sidebar-border);
  background: var(--sidebar-logo-area-bg);
}

/*
  ✋ NÃO substituir o conteúdo do logo.
  A logo atual (imagem da Câmara Municipal de Baturité) deve ser mantida exatamente como está.
  Apenas ajustar o container ao redor:
*/

/* Tamanho da imagem da logo — garantir que não fique cortada */
.sidebar-logo-area img {
  width: auto;
  height: 44px;           /* altura máxima — ajustar se necessário */
  object-fit: contain;
  flex-shrink: 0;
}

/* Textos ao lado da logo (se existirem) */
.sidebar-logo-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--sidebar-logo-text);
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.sidebar-logo-sub {
  font-size: 9px;
  color: var(--sidebar-logo-sub);
  line-height: 1.3;
}

/* Nav */
.sidebar nav {
  padding: 10px 0 16px;
  flex: 1;
  overflow-y: auto;
}

/* Label de grupo */
.sidebar-group-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--sidebar-group-label);
  padding: 10px 16px 4px;
  pointer-events: none;
}

/* Item de navegação */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 1px 8px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 400;
  color: var(--sidebar-item-text);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  text-decoration: none;
}

.sidebar-item i,
.sidebar-item .p-menuitem-icon {
  font-size: 16px;
  color: var(--sidebar-item-icon);
  flex-shrink: 0;
  transition: color 0.12s;
}

/* Hover */
.sidebar-item:hover:not(.active) {
  background: var(--sidebar-item-hover-bg);
  color: var(--sidebar-item-hover-text);
}

.sidebar-item:hover:not(.active) i {
  color: var(--sidebar-item-hover-text);
}

/* Ativo */
.sidebar-item.active,
.sidebar-item.p-highlight {
  background: var(--sidebar-item-active-bg);
  color: var(--sidebar-item-active-text);
  font-weight: 500;
}

.sidebar-item.active i,
.sidebar-item.p-highlight i {
  color: var(--sidebar-item-active-icon);
}


Ícones — usar @mui/icons-material (já instalado: v9.1.1)

Substituir todos os ícones pi pi-* da sidebar por componentes do @mui/icons-material.

Variantes disponíveis

Cada ícone MUI existe em 5 variantes. Usar as duas abaixo:

VarianteImportQuando usarOutlinedDashboardOutlinedItem inativo — mais levedefault (filled)DashboardItem ativo — reforça o estado

O contraste outlined → filled é a única indicação visual de ativo, sem precisar de cor intensa.

Mapeamento completo — item por item

tsximport DashboardOutlined       from '@mui/icons-material/DashboardOutlined';
import Dashboard               from '@mui/icons-material/Dashboard';

import GavelOutlined           from '@mui/icons-material/GavelOutlined';
import Gavel                   from '@mui/icons-material/Gavel';

import DescriptionOutlined     from '@mui/icons-material/DescriptionOutlined';
import Description             from '@mui/icons-material/Description';

import BalanceOutlined         from '@mui/icons-material/BalanceOutlined';
import Balance                 from '@mui/icons-material/Balance';

import TaskOutlined            from '@mui/icons-material/TaskOutlined';
import Task                    from '@mui/icons-material/Task';

import GroupsOutlined          from '@mui/icons-material/GroupsOutlined';
import Groups                  from '@mui/icons-material/Groups';

import RecentActorsOutlined    from '@mui/icons-material/RecentActorsOutlined';
import RecentActors            from '@mui/icons-material/RecentActors';

import PeopleOutlined          from '@mui/icons-material/PeopleOutlined';
import People                  from '@mui/icons-material/People';

import FlagOutlined            from '@mui/icons-material/FlagOutlined';
import Flag                    from '@mui/icons-material/Flag';

import PersonAddOutlined       from '@mui/icons-material/PersonAddOutlined';
import PersonAdd               from '@mui/icons-material/PersonAdd';

import CalendarMonthOutlined   from '@mui/icons-material/CalendarMonthOutlined';
import CalendarMonth           from '@mui/icons-material/CalendarMonth';

import BarChartOutlined        from '@mui/icons-material/BarChartOutlined';
import BarChart                from '@mui/icons-material/BarChart';

import AccountBalanceOutlined  from '@mui/icons-material/AccountBalanceOutlined';
import AccountBalance          from '@mui/icons-material/AccountBalance';

Item de menuInativo (Outlined)Ativo (Filled)DashboardDashboardOutlinedDashboardSessões LegislativasGavelOutlinedGavelMatériasDescriptionOutlinedDescriptionNormas JurídicasBalanceOutlinedBalanceAtos AdministrativosTaskOutlinedTaskParlamentaresGroupsOutlinedGroupsMesa DiretoraRecentActorsOutlinedRecentActorsComissõesPeopleOutlinedPeopleFrentes ParlamentaresFlagOutlinedFlagAutor ExternoPersonAddOutlinedPersonAddAgendaCalendarMonthOutlinedCalendarMonthRelatóriosBarChartOutlinedBarChartCâmara GestãoAccountBalanceOutlinedAccountBalance

Prop sx para tamanho e cor

Não usar CSS global para ícones MUI — usar a prop sx diretamente:

tsx// Ícone inativo
<DescriptionOutlined
  aria-hidden="true"
  sx={{ fontSize: 20, color: 'var(--sidebar-item-icon)', flexShrink: 0 }}
/>

// Ícone ativo
<Description
  aria-hidden="true"
  sx={{ fontSize: 20, color: 'var(--sidebar-item-active-icon)', flexShrink: 0 }}
/>

Componente auxiliar recomendado

Criar um helper para evitar repetição do filled/outlined por toda a sidebar:

tsx// components/ui/SidebarIcon.tsx
import { SvgIconComponent } from '@mui/icons-material';

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

Uso:

tsx<div className={`sidebar-item ${active ? 'active' : ''}`}>
  <SidebarIcon
    icon={DescriptionOutlined}
    iconActive={Description}
    active={active}
  />
  Matérias
</div>

Se usar PrimeReact Menu/PanelMenu

Passar o ícone via prop icon como função:

tsxconst menuItems = [
  {
    label: 'Legislativo',
    items: [
      {
        label: 'Matérias',
        icon: () => (
          <DescriptionOutlined
            aria-hidden="true"
            sx={{ fontSize: 20, color: 'var(--sidebar-item-icon)', mr: 1 }}
          />
        ),
        command: () => navigate('/materias'),
      },
    ]
  },
]


Agrupamento dos itens do menu

tsxconst menuItems = [
  {
    label: 'Geral',
    items: [
      { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    ]
  },
  {
    label: 'Legislativo',
    items: [
      { label: 'Sessões Legislativas', icon: 'pi pi-building',         route: '/sessoes' },
      { label: 'Matérias',             icon: 'pi pi-file',             route: '/materias' },
      { label: 'Normas Jurídicas',     icon: 'pi pi-balance-scale',    route: '/normas' },
      { label: 'Atos Administrativos', icon: 'pi pi-file-check',       route: '/atos' },
    ]
  },
  {
    label: 'Pessoas',
    items: [
      { label: 'Parlamentares',        icon: 'pi pi-users',            route: '/parlamentares' },
      { label: 'Mesa Diretora',        icon: 'pi pi-clipboard',        route: '/mesa-diretora' },
      { label: 'Comissões',            icon: 'pi pi-sitemap',          route: '/comissoes' },
      { label: 'Frentes Parlamentares',icon: 'pi pi-flag',             route: '/frentes' },
      { label: 'Autor Externo',        icon: 'pi pi-user-plus',        route: '/autores-externos' },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Agenda',               icon: 'pi pi-calendar',         route: '/agenda' },
      { label: 'Relatórios',           icon: 'pi pi-chart-bar',        route: '/relatorios' },
      { label: 'Câmara Gestão',        icon: 'pi pi-building-columns', route: '/camara-gestao' },
    ]
  },
]


Overrides PrimeReact (se usar PanelMenu ou Menu)

css/* Remover estilos padrão do PrimeReact na sidebar */
.sidebar .p-panelmenu-header-content,
.sidebar .p-submenu-header {
  background: transparent !important;
  border: none !important;
  padding: 10px 16px 4px !important;
  font-size: 9px !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--sidebar-group-label) !important;
  pointer-events: none;
  cursor: default;
}

.sidebar .p-menuitem-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px !important;
  margin: 1px 8px;
  border-radius: 7px !important;
  font-size: 13px !important;
  color: var(--sidebar-item-text) !important;
  transition: background 0.12s, color 0.12s;
}

.sidebar .p-menuitem-link:hover {
  background: var(--sidebar-item-hover-bg) !important;
  color: var(--sidebar-item-hover-text) !important;
}

.sidebar .p-menuitem-link .p-menuitem-icon {
  font-size: 16px !important;
  color: var(--sidebar-item-icon) !important;
}

.sidebar .p-menuitem.p-highlight > .p-menuitem-link {
  background: var(--sidebar-item-active-bg) !important;
  color: var(--sidebar-item-active-text) !important;
  font-weight: 500 !important;
}

.sidebar .p-menuitem.p-highlight > .p-menuitem-link .p-menuitem-icon {
  color: var(--sidebar-item-active-icon) !important;
}

/* Remover sombras e borders padrão */
.sidebar .p-panelmenu-panel,
.sidebar .p-panelmenu {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}


Tailwind (alternativa ao CSS puro)

Se o projeto usa Tailwind, as classes equivalentes por estado:

sidebar container:    bg-[#f8f9fb] border-r border-[#e5e7eb]
logo icon bg:         bg-[#1c3557]
logo text:            text-[#1c3557] font-bold text-xs tracking-wide
group label:          text-[9px] font-semibold uppercase tracking-widest text-gray-500
item inativo:         text-gray-500 text-[13px]
item icon inativo:    text-gray-400 text-base
item hover:           hover:bg-[#f0f2f7] hover:text-gray-700
item ativo:           bg-[#e8edf5] text-[#1c3557] font-medium
item icon ativo:      text-[#1c3557]
item padding/radius:  px-3 py-2 mx-2 my-px rounded-lg


Checklist


 Tokens CSS criados no arquivo de variáveis globais
 background da sidebar → #f8f9fb
 border-right da sidebar → 1px solid #e5e7eb
 Logo original (<img>) preservada — apenas padding do container ajustado
 Font size dos itens → 13px
 Todos os ícones pi pi-* da sidebar substituídos por componentes @mui/icons-material
 Ícone inativo usa variante Outlined (ex: DescriptionOutlined)
 Ícone ativo usa variante filled (ex: Description)
 Prop sx={{ fontSize: 20 }} em todos os ícones
 aria-hidden="true" em todos os ícones
 Componente SidebarIcon criado em components/ui/SidebarIcon.tsx
 margin: 1px 8px + border-radius: 7px em cada item
 Active state: background #e8edf5, texto e ícone #1c3557
 Hover state: background #f0f2f7, texto #374151
 Labels de grupo: 9px, uppercase, #6b7280
 Overrides PrimeReact aplicados (se usar componente de menu do PrimeReact)
 Testar active state ao navegar entre rotas
 Confirmar que não há cores de fundo azuis/coloridas remanescentes na sidebar


O que NÃO alterar


Logo da Câmara Municipal de Baturité — preservar imagem original, sem substituir por ícone genérico
Largura da sidebar
Rotas e lógica de navegação
Ícones de cada item (apenas tamanho)
Lógica de collapse do "Câmara Gestão"
Seletor de legislatura no topo (<select> de 20ª atual)