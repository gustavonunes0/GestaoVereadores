Task: Reorganizar Front-end do Portal do Parlamentar

Problema

O portal do Parlamentar (área logada do ParlamentarUser) está sem estrutura de layout aplicada. O print mostra:


Menu de navegação renderizado como texto corrido, sem sidebar (Perfil Parlamentar, Biografia, Dashboard, Matérias, Comissões, Mandato, Filiação — tudo em uma linha sem componente de menu)
Card de perfil do parlamentar (foto, nome, partido, e-mail, gabinete) sem nenhum estilo — parece HTML puro sem CSS
Seção "Minhas matérias" / "Próximas sessões" / "Comissões" sem padding, sem grid, sem cards
Nenhuma identidade visual aplicada — parece que o CSS/Tailwind não está sendo carregado nessas rotas, ou os componentes de layout do admin não foram reaproveitados aqui


Objetivo

Aplicar a mesma estrutura de layout do portal administrativo (sidebar + PageHeader + cards) na área do Parlamentar, reaproveitando os componentes já existentes e padronizados no projeto.


1. Sidebar do Portal do Parlamentar

Reaproveitar o componente de sidebar já usado no portal administrativo (mesma paleta clara institucional: bg #f8f9fb, active state #e8edf5, ícones MUI outlined).

Itens do menu — baseado no print

tsxconst parlamentarMenuItems = [
  {
    label: 'Perfil',
    items: [
      { label: 'Perfil Parlamentar', icon: BadgeOutlined,        route: '/portal/perfil' },
      { label: 'Biografia',          icon: ArticleOutlined,      route: '/portal/biografia' },
      { label: 'Dashboard',          icon: DashboardOutlined,    route: '/portal/dashboard' },
    ]
  },
  {
    label: 'Atuação',
    items: [
      { label: 'Matérias',           icon: DescriptionOutlined,  route: '/portal/materias' },
      { label: 'Comissões',          icon: PeopleOutlined,       route: '/portal/comissoes' },
      { label: 'Mandato',            icon: CalendarMonthOutlined,route: '/portal/mandato' },
      { label: 'Filiação',           icon: FlagOutlined,         route: '/portal/filiacao' },
    ]
  },
]


Confirmar com o backend se "Dashboard" do parlamentar é uma rota separada do Dashboard administrativo — pelo print, parece ser uma página própria dentro do mesmo grupo "Perfil".



Estrutura do componente (reaproveitar do admin)

tsx// src/components/layout/ParlamentarSidebar.tsx
import { Sidebar } from '@/components/layout/Sidebar'; // componente já existente

export function ParlamentarSidebar() {
  return (
    <Sidebar
      logo={<LogoCamara />}            // mesma logo da câmara, já preservada no admin
      items={parlamentarMenuItems}
      footerUser={{
        nome: parlamentar.nome,
        cargo: `${parlamentar.nome} Parlamentar`,
        avatarUrl: parlamentar.fotoUrl,
      }}
    />
  );
}

Se o componente Sidebar do admin não for genérico o suficiente para aceitar itens diferentes, extrair a parte visual (estilo, ícones, active state) para um componente compartilhado e passar items como prop — não duplicar CSS.


2. Topbar — usuário logado

No print, o topo mostra avatar "T", nome "teste123" e "teste123 Parlamentar" sem nenhuma estrutura. Substituir por:

tsx<div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#eef0f3]">
  <div /> {/* breadcrumb ou título, se necessário */}

  <div className="flex items-center gap-3">
    <div className="flex flex-col items-end">
      <span className="text-[13px] font-semibold text-[#1c2f4a]">{parlamentar.nome}</span>
      <span className="text-[11px] text-[#8492a6]">{parlamentar.cargo}</span>
    </div>

    {parlamentar.fotoUrl ? (
      <img src={parlamentar.fotoUrl} alt={parlamentar.nome}
           className="w-9 h-9 rounded-full object-cover border border-[#e2e5eb]" />
    ) : (
      <div className="w-9 h-9 rounded-full bg-[#2563a8] text-white text-[13px] font-bold flex items-center justify-center">
        {parlamentar.nome.charAt(0).toUpperCase()}
      </div>
    )}

    <button onClick={handleSair}
      className="flex items-center gap-1 text-[13px] text-[#8492a6] hover:text-[#374151] transition-colors">
      <LogoutOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
      Sair
    </button>
  </div>
</div>


3. PageHeader — Perfil Parlamentar

Usar o mesmo PageHeader já padronizado nas pages administrativas:

tsx<PageHeader
  icon={<BadgeOutlined sx={{ fontSize: 24, color: '#4a7ab5' }} />}
  title="Perfil Parlamentar"
/>


4. Card de identificação do parlamentar

Reconstruir o card "teste123 / teste123 Parlamentar / DC / ALECE" do print com estrutura adequada:

tsx<div className="bg-white border border-[#e2e5eb] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex gap-4">

  {/* Foto do parlamentar */}
  {parlamentar.fotoUrl ? (
    <img src={parlamentar.fotoUrl} alt={parlamentar.nome}
         className="w-20 h-20 rounded-[10px] object-cover border border-[#e2e5eb] flex-shrink-0" />
  ) : (
    <div className="w-20 h-20 rounded-[10px] bg-[#e8edf5] text-[#1c3557] text-[24px] font-bold flex items-center justify-center flex-shrink-0">
      {parlamentar.nome.charAt(0).toUpperCase()}
    </div>
  )}

  <div className="flex-1 flex flex-col gap-1">
    <h2 className="text-[18px] font-semibold text-[#1c2f4a]">{parlamentar.nome}</h2>
    <span className="text-[13px] text-[#8492a6]">{parlamentar.cargo}</span>
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563a8] bg-[#e8edf5] px-2 py-0.5 rounded-[4px] w-fit mt-1">
      {parlamentar.partidoSigla}
    </span>
  </div>

  {/* Dados de contato — alinhados à direita */}
  <div className="flex flex-col gap-1.5 justify-center text-right flex-shrink-0">
    <div className="text-[12px] text-[#374151]">
      <span className="text-[#8492a6]">E-mail: </span>{parlamentar.email}
    </div>
    <div className="text-[12px] text-[#374151]">
      <span className="text-[#8492a6]">Gabinete: </span>{parlamentar.gabinete}
    </div>
  </div>
</div>


O "ALECE" no print parece ser um logo/selo institucional (Assembleia Legislativa do Ceará?) — confirmar se deve aparecer no card ou se é um elemento de outra integração. Se for um selo de verificação/filiação, tratar como badge separado.




5. Grid de cards-resumo (Minhas matérias / Próximas sessões / Comissões)

tsx<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <SummaryCard
    icon={DescriptionOutlined}
    title="Minhas matérias"
    description='Acesse "Minhas Matérias" para ver detalhes.'
    onClick={() => navigate('/portal/materias')}
  />
  <SummaryCard
    icon={CalendarMonthOutlined}
    title="Próximas sessões"
    description="Calendário legislativo em breve."
    onClick={() => navigate('/portal/mandato')}
  />
  <SummaryCard
    icon={PeopleOutlined}
    title="Comissões"
    description='Acesse "Comissões" para ver sua participação.'
    onClick={() => navigate('/portal/comissoes')}
  />
</div>

Componente SummaryCard

tsxinterface SummaryCardProps {
  icon: React.ComponentType<{ sx?: object }>;
  title: string;
  description: string;
  onClick: () => void;
}

function SummaryCard({ icon: Icon, title, description, onClick }: SummaryCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-[#e2e5eb] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-2 text-left hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow"
    >
      <div className="w-9 h-9 rounded-[8px] bg-[#e8edf5] flex items-center justify-center">
        <Icon sx={{ fontSize: 18, color: '#2563a8' }} />
      </div>
      <h3 className="text-[15px] font-semibold text-[#1c2f4a]">{title}</h3>
      <p className="text-[12.5px] text-[#8492a6]">{description}</p>
    </button>
  );
}


6. Estrutura geral da page

tsx<div className="flex min-h-screen bg-[#e8ecf0]">
  <ParlamentarSidebar />

  <div className="flex-1 flex flex-col">
    <ParlamentarTopbar />

    <main className="flex-1 p-6">
      <PageHeader
        icon={<BadgeOutlined sx={{ fontSize: 24, color: '#4a7ab5' }} />}
        title="Perfil Parlamentar"
      />

      <ParlamentarProfileCard />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <SummaryCard ... />
        <SummaryCard ... />
        <SummaryCard ... />
      </div>
    </main>
  </div>
</div>


Checklist

Sidebar


 ParlamentarSidebar criada reaproveitando o componente Sidebar do admin
 Itens agrupados em "Perfil" e "Atuação"
 Ícones MUI outlined aplicados (sem ícones quebrados/texto corrido)
 Active state funcionando ao navegar entre rotas
 Logo da câmara preservada no topo


Topbar


 Avatar do parlamentar (foto real com fallback de inicial)
 Nome e cargo alinhados, tipografia consistente com o admin
 Botão "Sair" com ícone LogoutOutlined


Conteúdo


 PageHeader padronizado aplicado em "Perfil Parlamentar"
 Card de identificação com foto, nome, partido e dados de contato organizados
 Grid de SummaryCard para Minhas Matérias / Próximas Sessões / Comissões
 Fundo da página #e8ecf0, cards #ffffff com borda e sombra — mesma hierarquia já aplicada no admin


Geral


 Confirmar que o CSS/Tailwind está sendo carregado corretamente nas rotas /portal/*
 Confirmar se o layout do portal do parlamentar compartilha o mesmo _app ou layout root do admin, ou se está em um bundle/rota separada sem os estilos importados
 Testar responsividade em mobile (sidebar deve colapsar)


Pontos para confirmar antes de implementar


O selo "ALECE" no card — é uma integração externa (Assembleia Legislativa do Ceará) ou erro de dados de teste?
A rota "Dashboard" dentro do grupo "Perfil" é uma página própria do parlamentar ou reaproveita o dashboard do admin com dados filtrados?
O componente Sidebar atual do admin aceita prop de items dinâmica, ou precisa ser refatorado para isso?


O que NÃO alterar


Lógica de autenticação do ParlamentarUser
Rotas e nomes das páginas (Biografia, Mandato, Filiação, etc.)
Dados exibidos — apenas a estrutura visual