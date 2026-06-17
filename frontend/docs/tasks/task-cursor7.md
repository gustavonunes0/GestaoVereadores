Task: Redesign do card de Matéria na listagem

Objetivo

Melhorar a hierarquia visual e organização do card de matéria exibido na listagem (DataTable em formato de card), mantendo todas as informações já exibidas.


Problemas do layout atual


Sem hierarquia clara entre título, ementa e metadados — tudo com peso visual parecido
Metadados (Status, Última Tramitação, Comprovante, Autor) em colunas soltas sem alinhamento consistente
Ícones de ação (ver / editar / excluir) discretos e desalinhados verticalmente com o título
Sem separação visual entre o corpo do card e os metadados de rodapé
Número do protocolo e tipo de matéria pouco destacados



Estrutura do novo card

┌──┬────────────────────────────────────────────────────┐
│  │ ┌──┐  Projeto de Lei Ordinária         [👁][✎][🗑] │
│▌ │ │01│                                                │
│  │ └──┘  📅 23/06/2026   [Rascunho]                    │
│  │ Prot.                                                │
│  │       Lorem ipsum dolor sit amet, ementa da...       │
│  │       ─────────────────────────────────────────     │
│  │       AUTORIA      ÚLTIMA TRAM.   COMPROVANTE  AUT. │
│  │       👤 Teste      17/06/2026     📄 Ver       1   │
└──┴────────────────────────────────────────────────────┘


1. Container do card

tsx<div className="flex gap-4 p-4 bg-white border border-[#e2e5eb] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow">
  {/* faixa lateral + número + corpo */}
</div>

2. Faixa lateral (stripe) — indica tipo de matéria

tsx<div
  className="w-1 rounded-full flex-shrink-0"
  style={{ background: getStripeColor(materia.tipo) }}
/>

ts// Cor da faixa por tipo de matéria — usar accent ou variações
function getStripeColor(tipo: string): string {
  const colors: Record<string, string> = {
    PLO: '#2563a8',   // Projeto de Lei Ordinária
    ELOM: '#7c3aed',  // Emenda à Lei Orgânica
    REQ: '#0d9488',   // Requerimento
    IND: '#ea580c',   // Indicação
    // fallback
  };
  return colors[tipo] ?? '#8492a6';
}

3. Coluna de número/protocolo

tsx<div className="flex flex-col items-center gap-1.5 w-14 flex-shrink-0">
  <div className="w-11 h-11 rounded-[9px] bg-[#e8edf5] flex items-center justify-center">
    <span className="text-[18px] font-bold text-[#1c3557]">{materia.numeroProtocolo}</span>
  </div>
  <span className="text-[8.5px] text-[#b0bac8] text-center leading-tight">
    {materia.tipoSigla}<br/>Prot.
  </span>
</div>

4. Header — título + ações

tsx<div className="flex items-start justify-between gap-3">
  <h3 className="text-[14.5px] font-semibold text-[#1c2f4a] leading-snug">
    {materia.titulo}
  </h3>
  <div className="flex gap-0.5 flex-shrink-0">
    <button onClick={() => onVer(materia)}
      className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f0f4fa] hover:text-[#2563a8] transition-colors"
      aria-label="Ver matéria">
      <VisibilityOutlined sx={{ fontSize: 17 }} aria-hidden="true" />
    </button>
    {canEdit && (
      <button onClick={() => onEditar(materia)}
        className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f0f4fa] hover:text-[#2563a8] transition-colors"
        aria-label="Editar matéria">
        <EditOutlined sx={{ fontSize: 17 }} aria-hidden="true" />
      </button>
    )}
    {canDelete && (
      <button onClick={() => onDeletar(materia)}
        className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-red-50 hover:text-red-600 transition-colors"
        aria-label="Excluir matéria">
        <DeleteOutlined sx={{ fontSize: 17 }} aria-hidden="true" />
      </button>
    )}
  </div>
</div>

5. Pills de metadados (data + status)

tsximport CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';

<div className="flex items-center gap-2 flex-wrap">
  <span className="flex items-center gap-1 text-[10.5px] font-medium px-2.5 py-1 rounded-[6px] bg-[#f0f2f7] text-[#4b5563]">
    <CalendarMonthOutlined sx={{ fontSize: 12 }} aria-hidden="true" />
    {formatDate(materia.dataApresentacao)}
  </span>

  <StatusPill status={materia.status} />
</div>


Não exibir nenhum badge de "ambiente de teste" ou similar — esse elemento não faz parte do sistema, era apenas dado de exemplo no print de referência.



Componente StatusPill (cores por status)

tsxconst STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  RASCUNHO:    { bg: '#fef3e2', text: '#92400e' },
  TRAMITANDO:  { bg: '#e0f2fe', text: '#075985' },
  APROVADO:    { bg: '#dcfce7', text: '#166534' },
  REJEITADO:   { bg: '#fee2e2', text: '#991b1b' },
  ARQUIVADO:   { bg: '#f3f4f6', text: '#4b5563' },
};

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.ARQUIVADO;
  return (
    <span
      className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px]"
      style={{ background: style.bg, color: style.text }}
    >
      {formatStatusLabel(status)}
    </span>
  );
}

6. Ementa

tsx<p className="text-[12.5px] text-[#6b7280] leading-relaxed line-clamp-2">
  {materia.ementa}
</p>


Usar line-clamp-2 (plugin Tailwind @tailwindcss/line-clamp ou nativo no Tailwind 3.3+) para truncar ementas longas com "..." automático.



7. Divisor + footer de metadados

tsx<div className="border-t border-[#f0f2f5] my-1" />

<div className="grid grid-cols-4 gap-4">
  {/* Autoria */}
  <div className="flex flex-col gap-1">
    <span className="text-[9.5px] font-semibold text-[#9aa3b2] uppercase tracking-wide">Autoria</span>
    <AuthorChip nome={materia.autorPrincipal.nome} gabinete={materia.autorPrincipal.gabinete} />
  </div>

  {/* Última tramitação */}
  <div className="flex flex-col gap-1">
    <span className="text-[9.5px] font-semibold text-[#9aa3b2] uppercase tracking-wide">Última tramitação</span>
    <span className="text-[12px] text-[#374151] font-medium">{formatDate(materia.ultimaTramitacao)}</span>
  </div>

  {/* Comprovante */}
  <div className="flex flex-col gap-1">
    <span className="text-[9.5px] font-semibold text-[#9aa3b2] uppercase tracking-wide">Comprovante</span>
    <a href={materia.comprovanteUrl} target="_blank" rel="noreferrer"
       className="text-[12px] text-[#2563a8] font-medium flex items-center gap-1 hover:underline">
      <DescriptionOutlined sx={{ fontSize: 14 }} aria-hidden="true" />
      Ver documento
    </a>
  </div>

  {/* Autor(es) — avatares, não número */}
  <div className="flex flex-col gap-1">
    <span className="text-[9.5px] font-semibold text-[#9aa3b2] uppercase tracking-wide">Autor(es)</span>
    <AuthorAvatarGroup autores={materia.autores} />
  </div>
</div>

AuthorAvatarGroup — mostra foto/iniciais de todos os autores, sobrepostos

tsxinterface Autor {
  id: string;
  nome: string;
  fotoUrl?: string | null;
}

function AuthorAvatarGroup({ autores }: { autores: Autor[] }) {
  const visiveis = autores.slice(0, 3);
  const restantes = autores.length - visiveis.length;

  return (
    <div className="flex items-center" title={autores.map(a => a.nome).join(', ')}>
      {visiveis.map((autor, i) => (
        <AuthorAvatar
          key={autor.id}
          nome={autor.nome}
          fotoUrl={autor.fotoUrl}
          className={i > 0 ? '-ml-2' : ''}
        />
      ))}
      {restantes > 0 && (
        <span className="-ml-2 w-6 h-6 rounded-full bg-[#e8edf5] border-2 border-white text-[#1c3557] text-[9px] font-bold flex items-center justify-center">
          +{restantes}
        </span>
      )}
    </div>
  );
}

function AuthorAvatar({ nome, fotoUrl, className = '' }: { nome: string; fotoUrl?: string | null; className?: string }) {
  const initial = nome.charAt(0).toUpperCase();

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        className={`w-6 h-6 rounded-full border-2 border-white object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <span className={`w-6 h-6 rounded-full bg-[#2563a8] border-2 border-white text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${className}`}>
      {initial}
    </span>
  );
}


Avatares sobrepostos (-ml-2) com borda branca — padrão comum para mostrar múltiplos autores sem ocupar muito espaço. Se houver foto cadastrada do parlamentar/autor, ela é exibida; caso contrário, cai no fallback de iniciais.



AuthorChip — usado na coluna "Autoria" (autor principal)

tsxfunction AuthorChip({ nome, gabinete, fotoUrl }: { nome: string; gabinete?: string; fotoUrl?: string | null }) {
  const initial = nome.charAt(0).toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#f0f2f7] rounded-full pl-0.5 pr-2.5 py-0.5 w-fit">
      {fotoUrl ? (
        <img src={fotoUrl} alt={nome} className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
      ) : (
        <span className="w-4 h-4 rounded-full bg-[#2563a8] text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0">
          {initial}
        </span>
      )}
      <span className="text-[11px] text-[#374151]">
        {nome}{gabinete ? ` · ${gabinete}` : ''}
      </span>
    </span>
  );
}


Imports MUI necessários

tsximport VisibilityOutlined  from '@mui/icons-material/VisibilityOutlined';
import EditOutlined        from '@mui/icons-material/EditOutlined';
import DeleteOutlined      from '@mui/icons-material/DeleteOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';


Componente completo — montagem final

tsx<div className="flex gap-4 p-4 bg-white border border-[#e2e5eb] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow">
  <div className="w-1 rounded-full flex-shrink-0" style={{ background: getStripeColor(materia.tipo) }} />

  <div className="flex flex-col items-center gap-1.5 w-14 flex-shrink-0">
    <div className="w-11 h-11 rounded-[9px] bg-[#e8edf5] flex items-center justify-center">
      <span className="text-[18px] font-bold text-[#1c3557]">{materia.numeroProtocolo}</span>
    </div>
    <span className="text-[8.5px] text-[#b0bac8] text-center leading-tight">
      {materia.tipoSigla}<br/>Prot.
    </span>
  </div>

  <div className="flex-1 min-w-0 flex flex-col gap-2">
    {/* header */}
    {/* pills */}
    {/* ementa */}
    {/* divider */}
    {/* footer grid */}
  </div>
</div>


Checklist


 Faixa lateral colorida por tipo de matéria implementada
 Número de protocolo destacado em badge quadrado com background: #e8edf5
 Ícones de ação (ver/editar/excluir) usando @mui/icons-material, alinhados ao título
 Pills de data e status substituindo tags genéricas
 Nenhum badge de "ambiente de teste" ou similar — elemento não existe no sistema
 StatusPill com cores semânticas por status (rascunho/tramitando/aprovado/rejeitado/arquivado)
 Ementa com line-clamp-2 para truncar textos longos
 Divisor sutil entre corpo e footer de metadados
 Footer em grid de 4 colunas com labels uppercase pequenos
 AuthorChip (autoria) exibindo foto real do autor quando disponível, com fallback de iniciais
 AuthorAvatarGroup (autor[es]) exibindo avatares sobrepostos em vez do número "1" — não mostrar contador puro
 Link de comprovante com ícone + hover underline
 Hover no card inteiro aumenta sutilmente a sombra


O que NÃO alterar


Lógica de busca, paginação e filtros
Dados exibidos (manter todos os campos já existentes)
Rotas de ver/editar/excluir
Permissões canEdit / canDelete