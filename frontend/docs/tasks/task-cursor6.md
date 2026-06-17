Task: Criar Base Components do Projeto

Criar 4 componentes base reutilizáveis que substituem os componentes do PrimeReact problemáticos.
Todos devem usar HTML nativo na raiz, Tailwind CSS e @mui/icons-material.
Esses componentes são a fundação — serão usados em todas as pages e dialogs.


Localização dos arquivos

src/components/ui/
  ├── Dropdown.tsx
  ├── DateRangePicker.tsx
  ├── FileUpload.tsx
  └── PreviewImg.tsx


Design tokens — usar em todos os componentes

ts// src/components/ui/tokens.ts
export const tokens = {
  input: {
    bg:          '#fafbfc',
    border:      '#dde2ea',
    borderFocus: '#2563a8',
    borderHover: '#b0bac8',
    radius:      '6px',
    text:        '#374151',
    placeholder: '#b0bac8',
    shadow:      '0 0 0 3px rgba(37,99,168,0.12)',
  },
  accent:   '#2563a8',
  heading:  '#1c2f4a',
  muted:    '#8492a6',
  danger:   '#dc2626',
}

Equivalentes Tailwind para usar inline quando necessário:


border: border-[#dde2ea]
focus: focus:border-[#2563a8] focus:ring-2 focus:ring-[#2563a8]/10
bg input: bg-[#fafbfc]
text: text-[#374151]
placeholder: placeholder-[#b0bac8]



1. Dropdown

Props

tsxinterface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  id?: string;
  label?: string;
  options: DropdownOption[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

Comportamento


Construído com <div> + <ul> nativos — sem <select> nativo
Abre/fecha com click no trigger
Fecha ao clicar fora (useEffect + mousedown no document)
Fecha ao pressionar Escape
Navegação por teclado: ArrowUp / ArrowDown movem o foco, Enter seleciona
aria-expanded, aria-haspopup="listbox", role="listbox", role="option" para acessibilidade


Estrutura JSX

tsximport KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import CheckOutlined from '@mui/icons-material/CheckOutlined';

<div className="flex flex-col gap-1.5">
  {label && (
    <label htmlFor={id} className="text-[13px] font-medium text-[#374151]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )}

  {/* Trigger */}
  <div
    role="combobox"
    aria-expanded={open}
    aria-haspopup="listbox"
    tabIndex={0}
    onClick={() => setOpen(!open)}
    onKeyDown={handleKeyDown}
    className={[
      'relative flex items-center justify-between px-3 py-2 rounded-[6px] border cursor-pointer select-none transition-colors',
      'bg-[#fafbfc] text-[13px] text-[#374151]',
      open
        ? 'border-[#2563a8] ring-2 ring-[#2563a8]/10'
        : 'border-[#dde2ea] hover:border-[#b0bac8]',
      disabled && 'opacity-50 cursor-not-allowed',
      error && 'border-red-400',
    ].filter(Boolean).join(' ')}
  >
    <span className={selected ? 'text-[#374151]' : 'text-[#b0bac8]'}>
      {selected?.label ?? placeholder ?? 'Selecione...'}
    </span>
    <KeyboardArrowDownOutlined
      sx={{ fontSize: 18, color: '#8492a6' }}
      className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    />
  </div>

  {/* Dropdown list */}
  {open && (
    <div className="absolute z-50 mt-1 w-full bg-white border border-[#eef0f3] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
      <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
        {options.map((opt, i) => (
          <li
            key={opt.value}
            role="option"
            aria-selected={opt.value === value}
            onClick={() => handleSelect(opt)}
            className={[
              'flex items-center justify-between px-3 py-2 text-[13px] cursor-pointer transition-colors',
              opt.value === value
                ? 'bg-[#f0f4fa] text-[#2563a8] font-medium'
                : 'text-[#374151] hover:bg-[#f5f6f8]',
              focusedIndex === i && 'bg-[#f5f6f8]',
            ].filter(Boolean).join(' ')}
          >
            {opt.label}
            {opt.value === value && (
              <CheckOutlined sx={{ fontSize: 15, color: '#2563a8' }} aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </div>
  )}

  {error && (
    <p className="text-[11px] text-red-500 flex items-center gap-1">
      <ErrorOutlineOutlined sx={{ fontSize: 13 }} aria-hidden="true" />
      {error}
    </p>
  )}
</div>

Estado interno necessário

tsxconst [open, setOpen] = useState(false);
const [focusedIndex, setFocusedIndex] = useState(-1);
const containerRef = useRef<HTMLDivElement>(null);

// Fechar ao clicar fora
useEffect(() => {
  function handleOutside(e: MouseEvent) {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }
  document.addEventListener('mousedown', handleOutside);
  return () => document.removeEventListener('mousedown', handleOutside);
}, []);

// Fechar com Escape, navegar com arrows
function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === 'Escape') setOpen(false);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setFocusedIndex(i => Math.min(i + 1, options.length - 1));
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    setFocusedIndex(i => Math.max(i - 1, 0));
  }
  if (e.key === 'Enter' && focusedIndex >= 0) {
    handleSelect(options[focusedIndex]);
  }
}

Posicionamento do dropdown list

O <div> do dropdown list deve ser position: absolute em relação ao container com position: relative:

tsx<div ref={containerRef} className="relative">
  {/* trigger */}
  {/* list — position absolute, top-full, left-0, w-full */}
</div>


2. DateRangePicker

Props

tsxinterface DateRangePickerProps {
  id?: string;
  label?: string;
  value: [Date | null, Date | null];
  onChange: (range: [Date | null, Date | null]) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

Comportamento


Input visual que mostra "DD/MM/AAAA — DD/MM/AAAA" ao selecionar
Ao clicar, abre um popover com dois calendários lado a lado (mês atual e próximo)
Seleção em duas etapas: primeiro clique define start, segundo clique define end
Se start > end ao selecionar, inverter os valores automaticamente
Highlight do intervalo entre start e end durante hover
Botões "Limpar" e "Aplicar" no rodapé do popover
Fechar ao clicar fora ou pressionar Escape


Estrutura JSX

tsximport CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';

{/* Input trigger */}
<div
  onClick={() => setOpen(true)}
  className="flex items-center gap-2 px-3 py-2 rounded-[6px] border border-[#dde2ea] bg-[#fafbfc] cursor-pointer hover:border-[#b0bac8] transition-colors"
>
  <CalendarMonthOutlined sx={{ fontSize: 16, color: '#8492a6' }} aria-hidden="true" />
  <span className={`text-[13px] flex-1 ${hasValue ? 'text-[#374151]' : 'text-[#b0bac8]'}`}>
    {hasValue ? formatRange(value) : 'Início — Fim'}
  </span>
  {hasValue && (
    <button onClick={handleClear} className="text-[#b0bac8] hover:text-[#8492a6]">
      <CloseOutlined sx={{ fontSize: 14 }} aria-hidden="true" />
    </button>
  )}
</div>

{/* Popover */}
{open && (
  <div className="absolute z-50 mt-1 bg-white border border-[#eef0f3] rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-4">

    {/* Dois meses lado a lado */}
    <div className="flex gap-6">
      <CalendarGrid month={currentMonth} ... />
      <CalendarGrid month={nextMonth} ... />
    </div>

    {/* Rodapé */}
    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#eef0f3]">
      <button onClick={handleClear}
        className="text-[13px] text-[#8492a6] hover:text-[#374151] flex items-center gap-1">
        <CloseOutlined sx={{ fontSize: 14 }} aria-hidden="true" /> Limpar
      </button>
      <button onClick={() => setOpen(false)}
        className="px-4 py-1.5 bg-[#2563a8] text-white text-[13px] rounded-[6px] hover:bg-[#1d4f8a] transition-colors">
        Aplicar
      </button>
    </div>
  </div>
)}

CalendarGrid (sub-componente interno)

tsxinterface CalendarGridProps {
  month: Date;             // qual mês renderizar
  selected: [Date|null, Date|null];
  hoverDate: Date | null;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

Lógica de highlight por dia:

tsxconst isStart    = isSameDay(day, selected[0]);
const isEnd      = isSameDay(day, selected[1]);
const isInRange  = selected[0] && hoverDate && day > selected[0] && day <= hoverDate;
const isSelected = isStart || isEnd;

Classes por estado do dia:

isSelected  → bg-[#2563a8] text-white rounded-full
isInRange   → bg-[#f0f4fa] text-[#2563a8]
isToday     → font-semibold border border-[#2563a8] rounded-full
default     → hover:bg-[#f5f6f8] rounded-full
disabled    → text-[#b0bac8] cursor-not-allowed

Helper de formatação

tsxfunction formatRange([start, end]: [Date|null, Date|null]): string {
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR');
  if (start && end) return `${fmt(start)} — ${fmt(end)}`;
  if (start) return `${fmt(start)} — ...`;
  return '';
}


3. FileUpload

Props

tsxinterface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;          // default: '.pdf,.doc,.docx'
  required?: boolean;
  value: File | string | null;  // File = novo upload, string = URL já salva
  onChange: (file: File | null) => void;
  error?: string;
}

Estados visuais

EstadoAparênciaVazioBorda tracejada #dde2ea, ícone upload cinza, texto "Arraste ou clique para selecionar"Drag overBorda sólida #2563a8, fundo #f0f4fa, texto "Solte para enviar"PreenchidoBorda sólida #dde2ea, fundo #fafbfc, nome + tipo + tamanho, 3 botõesErroBorda #dc2626, fundo #fef2f2

Estrutura JSX

tsximport UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';

<div className="flex flex-col gap-1.5">
  {label && (
    <label className="text-[13px] font-medium text-[#374151]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )}

  <div
    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
    onDragLeave={() => setDragging(false)}
    onDrop={handleDrop}
    onClick={() => !hasFile && inputRef.current?.click()}
    className={[
      'flex items-center gap-3 px-4 py-3 rounded-[8px] border transition-colors',
      !hasFile && 'cursor-pointer',
      dragging  && 'border-[#2563a8] bg-[#f0f4fa]',
      hasFile   && !dragging && 'border-[#dde2ea] bg-[#fafbfc]',
      !hasFile  && !dragging && !error && 'border-dashed border-[#dde2ea] bg-white hover:border-[#2563a8] hover:bg-[#f0f4fa]',
      error     && 'border-red-400 bg-red-50',
    ].filter(Boolean).join(' ')}
  >
    {/* Ícone */}
    <div className={`flex items-center justify-center w-9 h-9 rounded-[7px] flex-shrink-0 ${hasFile ? 'bg-[#e8edf5]' : 'bg-[#f5f6f8]'}`}>
      {hasFile
        ? <InsertDriveFileOutlined sx={{ fontSize: 20, color: '#2563a8' }} aria-hidden="true" />
        : <UploadFileOutlined sx={{ fontSize: 20, color: '#8492a6' }} aria-hidden="true" />
      }
    </div>

    {/* Texto / nome */}
    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      {hasFile ? (
        <>
          <span className="text-[13px] font-medium text-[#374151] truncate">{fileName}</span>
          <span className="text-[11px] text-[#8492a6]">{fileTypeLabel}{fileSize ? ` · ${fileSize}` : ''}</span>
        </>
      ) : (
        <>
          <span className="text-[13px] text-[#374151]">
            {dragging ? 'Solte para enviar' : <>Arraste ou <span className="text-[#2563a8] font-medium">clique para selecionar</span></>}
          </span>
          <span className="text-[11px] text-[#b0bac8]">PDF, DOC ou DOCX</span>
        </>
      )}
    </div>

    {/* Ações (preenchido) */}
    {hasFile ? (
      <div className="flex items-center gap-1 flex-shrink-0">
        <button type="button" onClick={() => setPreview(true)}
          className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#e8edf5] hover:text-[#2563a8] transition-colors">
          <VisibilityOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors">
          <SwapHorizOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
        </button>
        <button type="button" onClick={handleRemove}
          className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-red-50 hover:text-red-500 transition-colors">
          <DeleteOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
        </button>
      </div>
    ) : (
      <span className="text-[10px] font-medium text-[#8492a6] bg-[#f0f4fa] px-2 py-0.5 rounded-[4px] flex-shrink-0">
        PDF / DOC
      </span>
    )}

    <input ref={inputRef} type="file" accept={accept} className="sr-only"
      onChange={(e) => handleFiles(e.target.files)} />
  </div>

  {error && (
    <p className="text-[11px] text-red-500 flex items-center gap-1">
      <ErrorOutlineOutlined sx={{ fontSize: 13 }} aria-hidden="true" />
      {error}
    </p>
  )}

  {/* Abre PreviewImg quando preview=true */}
  {preview && hasFile && (
    <PreviewImg
      src={getPreviewSrc(value!)}
      fileName={getFileName(value!)}
      mimeType={getMimeType(value!)}
      onClose={() => setPreview(false)}
    />
  )}
</div>

Helpers internos

tsxfunction formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileName(v: File | string) {
  return typeof v === 'string' ? v.split('/').pop() ?? v : v.name;
}

function getMimeType(v: File | string) {
  if (typeof v === 'string') return v.endsWith('.pdf') ? 'application/pdf' : undefined;
  return v.type;
}

function getPreviewSrc(v: File | string) {
  return typeof v === 'string' ? v : URL.createObjectURL(v);
}


4. PreviewImg

Props

tsxinterface PreviewImgProps {
  src: string;
  fileName?: string;
  mimeType?: string;
  onClose: () => void;
}

Comportamento


Modal responsivo centralizado com overlay escuro
Detecta tipo automaticamente: PDF → <iframe>, imagem → <img>
Fechar clicando no overlay, no botão ✕ ou pressionando Escape
Botões de ação no header: download + abrir em nova aba + fechar
Fallback visual se a imagem falhar ao carregar


Estrutura JSX

tsximport CloseOutlined from '@mui/icons-material/CloseOutlined';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import BrokenImageOutlined from '@mui/icons-material/BrokenImageOutlined';

const isPdf = mimeType === 'application/pdf' || src.endsWith('.pdf');

{/* Overlay — faux viewport para funcionar em todos os contextos */}
<div
  style={{ position: 'fixed', inset: 0, zIndex: 9999,
           background: 'rgba(0,0,0,0.6)', display: 'flex',
           alignItems: 'center', justifyContent: 'center', padding: '16px' }}
  role="dialog"
  aria-modal="true"
  aria-label={fileName ?? 'Visualizar arquivo'}
  onClick={(e) => e.target === e.currentTarget && onClose()}
>
  {/* Modal */}
  <div className="relative flex flex-col w-full max-w-4xl bg-white rounded-[12px] overflow-hidden"
       style={{ maxHeight: '90vh' }}>

    {/* Header */}
    <div className="flex items-center gap-3 px-5 py-3 border-b border-[#eef0f3]">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] flex-shrink-0
        ${isPdf ? 'bg-red-100 text-red-700' : 'bg-[#e8edf5] text-[#2563a8]'}`}>
        {isPdf ? 'PDF' : 'IMG'}
      </span>
      <span className="flex-1 text-[13px] font-medium text-[#1c2f4a] truncate">
        {fileName ?? (isPdf ? 'documento.pdf' : 'imagem')}
      </span>
      <div className="flex items-center gap-1">
        <a href={src} download={fileName} target="_blank" rel="noreferrer"
           className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors">
          <DownloadOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
        </a>
        <a href={src} target="_blank" rel="noreferrer"
           className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors">
          <OpenInNewOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
        </a>
        <button onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f5f6f8] hover:text-[#374151] transition-colors"
          aria-label="Fechar">
          <CloseOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
        </button>
      </div>
    </div>

    {/* Corpo */}
    <div className="flex items-center justify-center bg-[#f5f6f8] overflow-hidden"
         style={{ minHeight: '400px', maxHeight: 'calc(90vh - 56px)' }}>
      {isPdf ? (
        <iframe src={src} title={fileName} className="w-full border-0"
                style={{ height: 'calc(90vh - 56px)' }} />
      ) : imgError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-[#b0bac8]">
          <BrokenImageOutlined sx={{ fontSize: 48, color: '#dde2ea' }} aria-hidden="true" />
          <span className="text-[13px]">Não foi possível carregar a imagem.</span>
          <a href={src} target="_blank" rel="noreferrer"
             className="text-[13px] text-[#2563a8] hover:underline">
            Abrir em nova aba
          </a>
        </div>
      ) : (
        <img src={src} alt={fileName ?? 'imagem'}
             className="max-w-full object-contain p-4"
             style={{ maxHeight: 'calc(90vh - 56px)' }}
             onError={() => setImgError(true)} />
      )}
    </div>
  </div>
</div>

Hook para fechar com Escape

tsxuseEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [onClose]);


Como usar nos formulários

tsximport { Dropdown }        from '@/components/ui/Dropdown';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { FileUpload }      from '@/components/ui/FileUpload';
import { PreviewImg }      from '@/components/ui/PreviewImg';

// Substituir nos filtros das pages:
// <Dropdown do PrimeReact> → <Dropdown>
// <Calendar selectionMode="range"> → <DateRangePicker>

// Substituir nos dialogs:
// <input type="file"> → <FileUpload>

// PreviewImg é aberto internamente pelo FileUpload —
// não precisa instanciar manualmente na maioria dos casos.


Checklist de entrega

Dropdown


 Construído com <div> + <ul> — sem <select> nativo
 Abre/fecha com click, fecha fora com mousedown
 Fecha com Escape
 Navegação por teclado: ArrowUp, ArrowDown, Enter
 Item selecionado com check CheckOutlined + cor accent
 Estados: default, open, hover, selected, disabled, error
 aria-expanded, role="listbox", role="option" implementados
 Posicionamento absolute correto, não sai da tela


DateRangePicker


 Dois calendários lado a lado
 Seleção em dois cliques: start → end
 Inversão automática se start > end
 Highlight do intervalo durante hover
 Botões "Limpar" e "Aplicar" no rodapé
 Formatação DD/MM/AAAA — DD/MM/AAAA no input
 Botão ✕ para limpar dentro do input quando há valor
 Fecha com Escape e clique fora


FileUpload


 4 estados: vazio, drag over, preenchido, erro
 Drag and drop funcional
 3 botões no estado preenchido: visualizar, trocar, remover
 value aceita File (novo) e string (URL existente)
 Abre PreviewImg ao clicar em visualizar


PreviewImg


 Detecta PDF vs imagem automaticamente
 PDF renderiza <iframe>
 Imagem renderiza <img> com object-contain
 Fallback com BrokenImageOutlined se imagem falhar
 Fecha com Escape, clique no overlay e botão ✕
 Botões de download e abrir em nova aba funcionais
 position: fixed via inline style (não Tailwind) para funcionar fora de portais


Geral


 Todos os ícones importados de @mui/icons-material (variante Outlined)
 Todos os tokens de cor seguem a paleta do projeto (#2563a8, #dde2ea, #fafbfc etc.)
 Nenhuma dependência do PrimeReact nesses 4 componentes
 Exportar tudo via src/components/ui/index.ts



O que NÃO fazer


Não usar <select> nativo no Dropdown
Não usar position: fixed via Tailwind (quebra em iframes) — usar inline style quando necessário
Não importar nada do PrimeReact nesses componentes
Não usar variantes Filled dos ícones MUI (usar sempre Outlined)
Não criar CSS externo — apenas Tailwind + inline style quando necessário