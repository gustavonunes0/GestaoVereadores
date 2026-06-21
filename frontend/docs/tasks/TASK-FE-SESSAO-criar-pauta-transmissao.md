# TASK-FE-SESSAO — SessoesPage: Criar Sessão, Gerenciar Pauta e Transmissão Jitsi

**Leia antes:** `frontend/docs/CLAUDE-FRONTEND.md` · `frontend/docs/architecture/PATTERNS-FE.md`
**Complementa:** `TASK-FE-WEB-plataforma-completa.md` T-09 (SessoesPage)
**Depende de:** TASK-FE-001 (fundação) concluída
**Roles:** `STAFF_AND_ABOVE` para tudo nesta task

---

## Princípios de UI desta task

1. Status sempre visível — status da sessão e fase ficam no cabeçalho, não enterrados numa aba.
2. Uma tela central — Pauta, Presenças e Transmissão são abas da `SessaoDetalhePage`.
3. Feedback inline — confirmação de remoção de item da pauta é inline na própria linha.
4. Responsividade real — `flex-wrap` em topbar e controles, `table-layout: fixed` na pauta.
5. Ações destrutivas separadas — encerrar/cancelar no cabeçalho com `confirmDestructive()`.

---

## Instalação

```bash
npm install @jitsi/react-sdk
npm run build   # verificar antes de continuar
```

---

## Mapa de arquivos

```
frontend/src/
├── api/
│   ├── paths.ts                                   ← ATUALIZAR
│   └── legislative/sessoes.api.ts                 ← ATUALIZAR
├── types/
│   └── sessoes.ts                                 ← CRIAR
├── hooks/
│   └── useSessaoRealtime.ts                       ← CRIAR
├── utils/
│   └── pautaInferencia.ts                         ← CRIAR
└── components/sessoes/
    ├── SessaoStatusBadge.tsx
    ├── FaseAtualBadge.tsx
    ├── SessaoCreateDialog.tsx
    ├── SessaoAcoesMenu.tsx
    ├── SessaoDetalhePage.tsx
    ├── pauta/
    │   ├── PautaManager.tsx
    │   ├── PautaItemRow.tsx
    │   ├── PautaBadges.tsx
    │   ├── AddPautaItemDialog.tsx
    │   └── PublicarPautaDialog.tsx
    └── transmissao/
        ├── TransmissaoPanel.tsx          ← orquestrador
        ├── StatusConexaoJitsi.tsx        ← barra de status
        ├── CameraSelector.tsx            ← painel de câmeras  ← NOVO
        ├── AudioMixer.tsx                ← painel de áudio    ← NOVO
        ├── StreamControles.tsx           ← aba transmissão    ← NOVO
        └── YoutubeConfigForm.tsx
```

---

## Tipos TypeScript — `types/sessoes.ts`

```ts
export type StatusSessao =
  | 'AGENDADA' | 'ABERTA' | 'SUSPENSA' | 'ENCERRADA' | 'CANCELADA';

export type FaseSessao =
  | 'NAO_INICIADA' | 'EXPEDIENTE' | 'ORDEM_DO_DIA'
  | 'EXPLICACOES_PESSOAIS' | 'ENCERRADA';

export type FasePauta =
  | 'PEQUENO_EXPEDIENTE' | 'GRANDE_EXPEDIENTE'
  | 'ORDEM_DO_DIA' | 'EXPLICACOES_PESSOAIS';

export type TipoPautaItem = 'LEITURA' | 'DELIBERACAO' | 'COMUNICACAO';
export type StatusPautaItem = 'RASCUNHO' | 'PUBLICADA' | 'ENCERRADA';

export interface SessaoPlenaria {
  id: string;
  tenantId: string;
  tipoSessao: { id: string; nome: string; sigla: string };
  dataInicio: string;
  horaInicio?: string;
  statusSessao: StatusSessao;
  faseAtual: FaseSessao;
  sessaoLegislativa?: { id: string; descricao: string };
  linkYoutube?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PautaItem {
  id: string;
  sessaoId: string;
  materia: {
    id: string; numero: string; ano: number; ementa: string;
    tipoMateria: { id: string; nome: string; sigla: string };
  };
  fase: FasePauta;
  tipoPautaItem: TipoPautaItem;
  ordem: number;
  status: StatusPautaItem;
}

export interface JitsiTokenData {
  token: string;
  roomName: string;   // "sessao-{id.slice(0,8)}" — gerado pelo backend
  domain: string;     // vem do backend, nunca hardcoded
}

// Representa uma câmera/fonte de vídeo disponível na sala Jitsi
export interface JitsiParticipant {
  id: string;
  displayName: string;
  role: 'moderator' | 'participant';
}

// Canal de áudio controlável no mixer
export interface AudioChannel {
  id: string;
  label: string;
  volume: number;       // 0–100
  muted: boolean;
  isOptional?: boolean; // ex.: Libras — não bloqueia se desconectado
}

export interface CreateSessaoDto {
  tipoSessaoId: string;
  dataInicio: string;
  sessaoLegislativaId?: string;
  linkYoutube?: string;
}

export interface AddPautaItemDto {
  materiaId: string;
  fase: FasePauta;
  tipoPautaItem: TipoPautaItem;
  ordem?: number;
}
```

---

## api/paths.ts — adicionar

```ts
sessoes:             '/legislative/sessoes-plenarias',
sessaoById:          (id: string) => `/legislative/sessoes-plenarias/${id}`,
sessaoAbrir:         (id: string) => `/legislative/sessoes-plenarias/${id}/abrir`,
sessaoSuspender:     (id: string) => `/legislative/sessoes-plenarias/${id}/suspender`,
sessaoEncerrar:      (id: string) => `/legislative/sessoes-plenarias/${id}/encerrar`,
sessaoCancelar:      (id: string) => `/legislative/sessoes-plenarias/${id}/cancelar`,
sessaoQuorum:        (id: string) => `/legislative/sessoes-plenarias/${id}/quorum`,
sessaoPresencas:     (id: string) => `/legislative/sessoes-plenarias/${id}/presencas`,
sessaoPauta:         (id: string) => `/legislative/sessoes-plenarias/${id}/pauta`,
sessaoPautaItem:     (sid: string, iid: string) =>
                       `/legislative/sessoes-plenarias/${sid}/pauta/${iid}`,
sessaoPautaPublicar: (id: string) => `/legislative/sessoes-plenarias/${id}/pauta/publicar`,
sessaoJitsiToken:    (id: string) => `/legislative/sessoes-plenarias/${id}/jitsi-token`,
tiposSessao:         '/dominios/tipos-sessao',
legislaturas:        '/legislative/legislaturas',
```

---

## FEATURE 1 — Badges

### T-01 · `SessaoStatusBadge`

```tsx
const CFG = {
  AGENDADA:  { label: 'Agendada',  severity: 'info',      icon: 'pi pi-calendar'     },
  ABERTA:    { label: 'Aberta',    severity: 'success',   icon: 'pi pi-circle-fill'  },
  SUSPENSA:  { label: 'Suspensa',  severity: 'warning',   icon: 'pi pi-pause'        },
  ENCERRADA: { label: 'Encerrada', severity: 'secondary', icon: 'pi pi-check-circle' },
  CANCELADA: { label: 'Cancelada', severity: 'danger',    icon: 'pi pi-times-circle' },
} as const;
export function SessaoStatusBadge({ status }: { status: StatusSessao }) {
  const c = CFG[status];
  return <Tag value={c.label} severity={c.severity} icon={c.icon} />;
}
```

### T-02 · `FaseAtualBadge`

```tsx
const CFG = {
  NAO_INICIADA:         { label: 'Não iniciada',        severity: 'secondary' },
  EXPEDIENTE:           { label: 'Expediente',           severity: 'info'     },
  ORDEM_DO_DIA:         { label: 'Ordem do Dia',         severity: 'warning'  },
  EXPLICACOES_PESSOAIS: { label: 'Explicações Pessoais', severity: 'secondary'},
  ENCERRADA:            { label: 'Encerrada',            severity: 'secondary'},
} as const;
export function FaseAtualBadge({ fase }: { fase: FaseSessao }) {
  const c = CFG[fase];
  return <Tag value={c.label} severity={c.severity} />;
}
```

---

## FEATURE 2 — Criar Sessão

### T-03 · `SessaoCreateDialog`

Grid 2 colunas:
- Tipo de Sessão* (`Dropdown`, `GET /dominios/tipos-sessao`)
- Sessão Legislativa (`Dropdown`, `GET /legislative/legislaturas`)
- Data* (`Calendar dateFormat="dd/mm/yy"`)
- Horário Previsto* (`Calendar timeOnly hourFormat="24"`)
- Link YouTube (full-width, placeholder `https://youtube.com/live/...`)

`linkJitsi` nunca aparece no formulário.

Submit → `POST /legislative/sessoes-plenarias`
Body: `{ tipoSessaoId, dataInicio (ISO 8601), sessaoLegislativaId?, linkYoutube? }`

### T-04 · `SessaoAcoesMenu`

```ts
const ACOES: Record<StatusSessao, Array<{label:string; path:string; destrutiva?:boolean}>> = {
  AGENDADA:  [{ label: 'Abrir sessão',    path: 'abrir' },
              { label: 'Cancelar sessão', path: 'cancelar', destrutiva: true }],
  ABERTA:    [{ label: 'Suspender sessão', path: 'suspender' },
              { label: 'Encerrar sessão',  path: 'encerrar', destrutiva: true }],
  SUSPENSA:  [{ label: 'Retomar sessão',  path: 'abrir' },
              { label: 'Encerrar sessão', path: 'encerrar', destrutiva: true }],
  ENCERRADA: [],
  CANCELADA: [],
};
```

---

## FEATURE 3 — SessaoDetalhePage

```tsx
const { faseAtual, votacaoAberta, placar, wsConectado } = useSessaoRealtime(id!);
const faseExibida = faseAtual ?? sessao?.faseAtual;
const mostrarTransmissao = ['ABERTA', 'SUSPENSA'].includes(sessao?.statusSessao ?? '');

// Topbar: flex-wrap para mobile
// Badges de status e fase sempre visíveis no topbar
// Indicador WebSocket "● Ao vivo" quando wsConectado=true
// Botões de ciclo de vida à direita

// TabView:
//   [Pauta] [Presenças] [Transmissão ●]  ← ponto vermelho animado quando transmitindo
// Aba Transmissão só renderiza se mostrarTransmissao=true
```

---

## FEATURE 4 — PautaManager

### T-05 · Layout

```
Header: "Pauta da sessão" | [Publicar Pauta]
[+ Adicionar matéria] — disabled se publicada ou sessão encerrada
Estado vazio: ícone + "Nenhuma matéria." + call-to-action

Tabela (table-layout: fixed):
  Cols: # (▲num▼) | Matéria (id + ementa 2 linhas) | Fase | Tipo | ✕
```

### T-06 · `PautaBadges`

```ts
const FASE_ABREV = { PEQUENO_EXPEDIENTE:'P.EXP', GRANDE_EXPEDIENTE:'G.EXP',
                     ORDEM_DO_DIA:'O.D.', EXPLICACOES_PESSOAIS:'EXP.P.' };
const TIPO_CFG   = { LEITURA:{abbr:'LEI',severity:'secondary'},
                     DELIBERACAO:{abbr:'DEL',severity:'warning'},
                     COMUNICACAO:{abbr:'COM',severity:'info'} };
```

### T-07 · `PautaItemRow` — confirmação inline

```tsx
const [confirmando, setConfirmando] = useState(false);
// Render: <tr> normal + <tr className="pauta-row-confirm"> (colSpan=5)
// pauta-row-confirm: background var(--yellow-50), mensagem + [Sim, remover] [Não]
```

### T-08 · Reordenação otimista

```ts
// 1. trocar no estado local imediatamente
// 2. PATCH /sessoes/:id/pauta/:itemId { ordem: novaOrdem }
// 3. em erro: reverter + showApiError
```

### T-09 · `AddPautaItemDialog`

```ts
// utils/pautaInferencia.ts
const SIGLAS_PE = ['OFC', 'IND', 'REQ'];
export const inferirFase   = (sigla: string): FasePauta =>
  SIGLAS_PE.includes(sigla.toUpperCase()) ? 'PEQUENO_EXPEDIENTE' : 'ORDEM_DO_DIA';
export const inferirTipo   = (fase: FasePauta): TipoPautaItem =>
  fase === 'ORDEM_DO_DIA' ? 'DELIBERACAO' : 'COMUNICACAO';
```

Ao selecionar matéria → inferir fase e tipo → mostrar hint azul → staff pode sobrescrever.

### T-10 · `PublicarPautaDialog`

Texto: "Após publicar: parlamentares verão a pauta · itens publicados não podem ser removidos · novos itens ainda podem ser adicionados."

Após `PATCH /sessoes/:id/pauta/publicar` → rebuscar + badge "Publicada" + ✕ disabled.

---

## FEATURE 5 — TransmissaoPanel (redesenhado)

### T-11 · Estrutura com sub-abas internas

O `TransmissaoPanel` usa um `TabView` interno com três abas:

```
┌─ Status bar ───────────────────────────────────────────────────┐
│  ● Conectado   📹 sessao-a4f82c19   [4 participantes]  ● AO VIVO │
├─ Sub-tabs ─────────────────────────────────────────────────────┤
│  [📷 Câmeras]  [🎚 Áudio]  [📡 Transmissão]                    │
└────────────────────────────────────────────────────────────────┘
```

**Fluxo de inicialização:**
1. `useEffect` → `GET /sessoes/:id/jitsi-token`
2. Loading: `ProgressSpinner` + "Preparando sala…"
3. Erro: alerta com instrução de recarregar
4. Sucesso: renderizar tudo com `domain`, `roomName`, `jwt` do token

---

### T-12 · StatusConexaoJitsi (barra de status)

Três zonas em `flex` com `flex-wrap`:

| Zona | Conteúdo |
|---|---|
| Esquerda | Ponto animado + texto "Conectado"/"Conectando…" |
| Centro | Ícone + `<code>sessao-{roomName}</code>` + badge participantes |
| Direita (`margin-left: auto`) | Badge "● AO VIVO" — só quando `transmitindo=true` |

Cores dos pontos:
- Conectando → amarelo (`var(--yellow-500)`) pulsando 1s
- Conectado → verde (`var(--green-500)`) pulsando 1.4s
- AO VIVO → vermelho (`var(--red-500)`) pulsando 0.9s

---

### T-13 · Aba "Câmeras" — `CameraSelector`

**Tela dividida em duas partes:**

#### Parte 1 — Preview ao vivo (iframe Jitsi)

```tsx
<div className="jitsi-container" style={{ position: 'relative' }}>
  <JitsiMeeting
    domain={jitsiData.domain}
    roomName={jitsiData.roomName}
    jwt={jitsiData.token}
    configOverwrite={{
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      prejoinPageEnabled: false,
      enableWelcomePage: false,
    }}
    interfaceConfigOverwrite={{
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      TOOLBAR_BUTTONS: ['microphone','camera','desktop','fullscreen','tileview','hangup'],
    }}
    userInfo={{ displayName: userName }}
    onApiReady={handleApiReady}
    getIFrameRef={(ref) => {
      ref.style.height = '420px';
      ref.style.width = '100%';
      ref.style.borderRadius = '8px';
      ref.style.border = '1px solid var(--surface-border)';
    }}
  />

  {/* Botão de tela cheia sobreposto ao canto superior direito do iframe */}
  <button
    className="jitsi-fullscreen-btn"
    onClick={handleFullscreen}
    aria-label={modoTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
  >
    <i className={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'} />
    {modoTelaCheia ? 'Sair' : 'Tela cheia'}
  </button>
</div>
```

CSS do botão de fullscreen:
```css
.jitsi-fullscreen-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}
.jitsi-fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
}
```

**Modo tela cheia (`handleFullscreen`):**

A API do navegador (`document.requestFullscreen`) é chamada sobre o elemento `<div>` que envolve o `<JitsiMeeting>`. Se não disponível (iframe sandboxed), fallback: expandir o container para `position: fixed; inset: 0; z-index: 9999; background: #0c0c14`.

```ts
const jitsiContainerRef = useRef<HTMLDivElement>(null);
const [modoTelaCheia, setModoTelaCheia] = useState(false);

const handleFullscreen = () => {
  const el = jitsiContainerRef.current;
  if (!el) return;

  if (!document.fullscreenElement) {
    el.requestFullscreen?.()
      .then(() => setModoTelaCheia(true))
      .catch(() => {
        // fallback: expansão via CSS
        el.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0c0c14;border-radius:0';
        setModoTelaCheia(true);
      });
  } else {
    document.exitFullscreen?.().then(() => setModoTelaCheia(false));
    // limpar fallback se aplicado
    if (el) el.style.cssText = '';
  }
};

// Ouvir ESC para sair do modo fallback
useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modoTelaCheia) {
      setModoTelaCheia(false);
      if (jitsiContainerRef.current) jitsiContainerRef.current.style.cssText = '';
    }
  };
  document.addEventListener('keydown', onKeyDown);
  return () => document.removeEventListener('keydown', onKeyDown);
}, [modoTelaCheia]);
```

#### Parte 2 — Seletor de câmera em destaque

Grid de cards clicáveis, um por câmera/fonte disponível:

```
┌──────────────────────────────────────────────────────────────┐
│  Selecionar câmera em destaque                               │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────┐ │
│  │ [ícone TV]   │ │ [ícone TV]   │ │ [ícone mão]  │ │ [⬜] │ │
│  │ [DESTAQUE]   │ │              │ │ [LIBRAS]     │ │     │ │
│  │ Câm 1 Leitor │ │ Câm 2 Plená │ │ Int. Libras  │ │ Tela│ │
│  │ [Ativar]     │ │ [Ativar]     │ │ [Ativar]     │ │[Ati]│ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘ │
│  Card selecionado: borda azul 1.5px                          │
│  Card Libras: borda verde 1.5px quando ativo                 │
└──────────────────────────────────────────────────────────────┘
```

**Câmeras disponíveis (lista fixa + dinâmica):**

```ts
// Câmeras fixas (sempre mostradas)
const CAMERAS_FIXAS: CameraSource[] = [
  { id: 'camera1',        label: 'Câmera 1 — Leitor',   icon: 'pi pi-desktop',    comando: 'setLargeVideoParticipant' },
  { id: 'camera2',        label: 'Câmera 2 — Plenário', icon: 'pi pi-desktop',    comando: 'setLargeVideoParticipant' },
  { id: 'screen',         label: 'Compartilhar tela',   icon: 'pi pi-window',     comando: 'toggleShareScreen' },
];

// Câmera de Libras (opcional — só aparece se alguém com displayName contendo
// "libras" ou "intérprete" estiver conectado)
const CAMERA_LIBRAS: CameraSource = {
  id: 'libras',
  label: 'Intérprete — Libras',
  icon: 'pi pi-sign-language',   // fallback: pi pi-hand
  comando: 'setLargeVideoParticipant',
  opcional: true,
};
```

**Detecção automática do intérprete de Libras:**

```ts
// Em onApiReady — ouvir participantes conectados
externalApi.addListener('participantJoined', ({ id, displayName }) => {
  const isLibras = /libras|intérprete|interprete/i.test(displayName ?? '');
  if (isLibras) {
    setLibrasParticipantId(id);
    setLibrasConectado(true);
  }
});

externalApi.addListener('participantLeft', ({ id }) => {
  if (id === librasParticipantId) {
    setLibrasParticipantId(null);
    setLibrasConectado(false);
  }
});
```

O card de Libras é sempre exibido, mas com estado visual diferente:
- Intérprete ausente → card acinzentado + badge "Opcional — aguardando"
- Intérprete conectado → card com borda verde + badge "Conectado"

Clicar "Ativar" em Libras quando não conectado → toast "Intérprete de Libras não está na sala"

**Ação de seleção:**

```ts
const handleSelecionarCamera = (cam: CameraSource) => {
  if (cam.id === 'screen') {
    externalApiRef.current?.executeCommand('toggleShareScreen');
    return;
  }
  const participantId = cam.id === 'libras'
    ? librasParticipantId
    : cam.id; // 'camera1' ou 'camera2' são IDs reais na sala

  externalApiRef.current?.executeCommand('setLargeVideoParticipant', participantId);
  setCameraAtiva(cam.id);
};
```

---

### T-14 · Aba "Áudio" — `AudioMixer`

**Mixer com um canal por fonte de áudio:**

```
┌─ Mixer de áudio ──────────────────────────────────────────────┐
│                                                                │
│  Microfone     [━━━━━━━━━━━━━━━━━━━━━━━━◉──]  85%  [🎤]      │
│                ██████████████████████░░░░░░░ (VU verde)        │
│                                                                │
│  Câmera 1      [━━━━━━━━━━━━━━━◉──────────]  70%  [📺] [🔇]   │
│                █████████████░░░░░░░░░░░░░░░ (VU verde)        │
│                                                                │
│  Câmera 2      [━━━━━━━━━━━◉───────────────]  60%  [📺]       │
│                ██████████░░░░░░░░░░░░░░░░░░ (VU âmbar)        │
│                                                                │
│  Libras        [────────────────────────────]  —   [🤟]       │
│  (opcional)    Intérprete não conectado — canal reservado      │
│                                                                │
│  ─────────────────────────────────────────────────────────    │
│  Volume geral  [━━━━━━━━━━━━━━━━━━━━━━━━━━◉] 100%  [🔊]      │
│                ████████████████████████████ (VU verde)         │
└───────────────────────────────────────────────────────────────┘
```

**Canais padrão:**

```ts
const CANAIS_PADRAO: AudioChannel[] = [
  { id: 'mic',    label: 'Microfone', volume: 85, muted: false },
  { id: 'camera1', label: 'Câmera 1', volume: 70, muted: false },
  { id: 'camera2', label: 'Câmera 2', volume: 60, muted: false },
  { id: 'libras',  label: 'Libras',   volume: 80, muted: true, isOptional: true },
];
```

**Canal de Libras:**
- `disabled` quando `librasConectado = false`
- Slider cinza + texto "Intérprete não conectado — canal reservado"
- Quando conectado → habilitar slider + remover texto + badge "Conectado" verde

**VU meter (barra de nível de áudio):**

```ts
// Simulação visual — barra de 4px de altura
// Cores: verde até 70%, âmbar 70–90%, vermelho acima de 90%

// Em produção, usar externalApi.addListener('audioLevelsChanged', ...) para valor real:
externalApi.addListener('audioLevelsChanged', (levels: Record<string, number>) => {
  setAudioLevels(levels);
});
```

**Controle de volume via External API:**

```ts
const handleVolumeChange = (canal: string, valor: number) => {
  setCanais(prev => prev.map(c => c.id === canal ? { ...c, volume: valor } : c));

  // A External API do Jitsi expõe apenas volume do participante local
  // Para microfone local:
  if (canal === 'mic') {
    // Não há comando direto — usar Web Audio API ou MediaDevices
    // alternativa: externalApi.executeCommand('setAudioOutputVolume', valor) para saída
  }
  // Para câmeras remotas: setLargeVideoParticipant não tem controle de volume por participante
  // Usar ganho via Web Audio API se necessário (avançado)
  // Para esta iteração: controlar volume de saída global
  if (canal === 'master') {
    externalApiRef.current?.executeCommand('setVideoQuality', valor > 50 ? 720 : 360);
    // volume de saída do navegador (se suportado)
  }
};

const handleMute = (canal: string) => {
  setCanais(prev => prev.map(c =>
    c.id === canal ? { ...c, muted: !c.muted } : c
  ));
  if (canal === 'mic') {
    externalApiRef.current?.executeCommand('toggleAudio');
  }
};
```

> **Nota de implementação:** O Jitsi Meet SDK não expõe controle de volume por participante
> remoto via External API. Os sliders de câmera 1/2 controlam visualmente o estado local
> do mixer e podem ser usados futuramente com Web Audio API para processamento real.
> O controle do microfone local e do áudio de saída geral funcionam nativamente.

**CSS do mixer:**

```css
.audio-mixer {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mixer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 0.5px solid var(--surface-border);
}
.mixer-row:last-child { border-bottom: none; }

.mixer-label {
  width: 96px;
  font-size: 12px;
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.mixer-slider { flex: 1; min-width: 0; accent-color: var(--primary-color); }

.mixer-val {
  width: 38px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-family-monospace);
}

.mixer-mute {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1px solid var(--surface-border);
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
}
.mixer-mute:hover { background: var(--surface-100); }
.mixer-mute.muted  { background: var(--red-50); color: var(--red-600); border-color: var(--red-200); }

.vu-bar {
  height: 3px;
  border-radius: 2px;
  background: var(--surface-100);
  overflow: hidden;
  margin-top: 3px;
}
.vu-fill         { height: 100%; border-radius: 2px; background: var(--green-500); transition: width 80ms; }
.vu-fill.warn    { background: var(--yellow-500); }
.vu-fill.clip    { background: var(--red-500); }

.mixer-row-disabled { opacity: 0.45; pointer-events: none; }
.mixer-canal-hint {
  font-size: 11px;
  color: var(--text-color-secondary);
  padding-left: 106px;
  margin-top: -6px;
  padding-bottom: 8px;
}
```

---

### T-15 · Aba "Transmissão" — `StreamControles`

```
┌─ Controle de transmissão ─────────────────────────────────────┐
│  [▶ Iniciar YouTube]  ● AO VIVO  00:12:43                     │
│                                                                │
│  Link do YouTube                                               │
│  [https://youtube.com/live/xK9…] [Salvar] [⎘] [↗]           │
│  ℹ A stream key é extraída automaticamente da URL.            │
├───────────────────────────────────────────────────────────────┤
│  Tela cheia                                                   │
│  [⛶ Expandir sala de vídeo]                                   │
│  Expande o iframe Jitsi para ocupar toda a janela.            │
└───────────────────────────────────────────────────────────────┘
```

**Controle de streaming:**

```tsx
// Botão alterna entre Iniciar e Parar
// Timer de duração atualizado a cada segundo enquanto transmitindo=true

const [duracao, setDuracao] = useState(0);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

const iniciarStream = () => {
  const streamKey = extrairStreamKey(linkYoutube);
  externalApiRef.current?.executeCommand('startRecording', {
    mode: 'stream',
    youtubeStreamKey: streamKey,
  });
  setTransmitindo(true);
  setDuracao(0);
  timerRef.current = setInterval(() => setDuracao(d => d + 1), 1000);
};

const pararStream = () => {
  externalApiRef.current?.executeCommand('stopLiveStreaming');
  setTransmitindo(false);
  if (timerRef.current) clearInterval(timerRef.current);
};

// Formatar timer: mm:ss
const formatarDuracao = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
};
```

Extração da stream key:
```ts
const extrairStreamKey = (url: string): string =>
  url.match(/\/live\/([^?&/]+)/)?.[1] ?? url;
```

**Botão de tela cheia na aba Transmissão** (atalho alternativo ao botão sobreposto):

```tsx
<Button
  label={modoTelaCheia ? 'Sair da tela cheia' : 'Expandir sala de vídeo'}
  icon={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'}
  size="small"
  outlined
  onClick={handleFullscreen}
/>
<small>Expande o iframe Jitsi para ocupar toda a janela do navegador.</small>
```

---

### T-16 · TransmissaoPanel — estado compartilhado

Os três sub-componentes (`CameraSelector`, `AudioMixer`, `StreamControles`) compartilham
estado via props vindas do `TransmissaoPanel` orquestrador:

```tsx
// TransmissaoPanel.tsx
export function TransmissaoPanel({ sessao, userName }: TransmissaoPanelProps) {
  const externalApiRef  = useRef<any>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  const [jitsiData, setJitsiData]         = useState<JitsiTokenData | null>(null);
  const [loadingToken, setLoadingToken]   = useState(true);
  const [conectado, setConectado]         = useState(false);
  const [transmitindo, setTransmitindo]   = useState(false);
  const [modoTelaCheia, setModoTelaCheia] = useState(false);
  const [cameraAtiva, setCameraAtiva]     = useState<string>('camera1');
  const [librasConectado, setLibrasConectado]       = useState(false);
  const [librasParticipantId, setLibrasParticipantId] = useState<string | null>(null);
  const [canais, setCanais]               = useState<AudioChannel[]>(CANAIS_PADRAO);
  const [linkYoutube, setLinkYoutube]     = useState(sessao.linkYoutube ?? '');
  const [duracao, setDuracao]             = useState(0);
  const [abaAtiva, setAbaAtiva]           = useState<'cameras' | 'audio' | 'stream'>('cameras');

  const handleApiReady = (externalApi: any) => {
    externalApiRef.current = externalApi;
    setConectado(true);

    externalApi.addListener('recordingStatusChanged', ({ on }: { on: boolean }) => {
      setTransmitindo(on);
    });

    externalApi.addListener('participantJoined', ({ id, displayName }: any) => {
      if (/libras|intérprete|interprete/i.test(displayName ?? '')) {
        setLibrasParticipantId(id);
        setLibrasConectado(true);
      }
    });

    externalApi.addListener('participantLeft', ({ id }: any) => {
      if (id === librasParticipantId) {
        setLibrasParticipantId(null);
        setLibrasConectado(false);
      }
    });
  };

  // ... renderização com StatusConexaoJitsi + TabView interno
}
```

---

## FEATURE 6 — WebSocket `useSessaoRealtime`

```tsx
export function useSessaoRealtime(sessaoId: string) {
  const [faseAtual, setFaseAtual]           = useState<FaseSessao | null>(null);
  const [votacaoAberta, setVotacaoAberta]   = useState<any | null>(null);
  const [placar, setPlacar]                 = useState<any | null>(null);
  const [wsConectado, setWsConectado]       = useState(false);

  useEffect(() => {
    const socket = io('/sessao', {
      auth: { token: localStorage.getItem('access_token') },
      query: { sessaoId },
      transports: ['websocket'],
    });

    socket.on('connect',            () => setWsConectado(true));
    socket.on('disconnect',         () => setWsConectado(false));
    socket.on('sessao:fase',        ({ faseAtual }) => setFaseAtual(faseAtual));
    socket.on('votacao:aberta',     (data) => { setVotacaoAberta(data); setPlacar(null); });
    socket.on('votacao:placar',     (data) => setPlacar(data));
    socket.on('votacao:encerrada',  ()     => { setVotacaoAberta(null); setPlacar(null); });
    socket.on('sessao:encerrada',   ()     => setFaseAtual('ENCERRADA'));

    return () => { socket.disconnect(); };
  }, [sessaoId]);

  return { faseAtual, votacaoAberta, placar, wsConectado };
}
```

---

## CSS — novos padrões

```css
/* ── Topbar ─────────────────────────────────────────── */
.sessao-topbar {
  display: flex; align-items: center; gap: 0.75rem;
  flex-wrap: wrap;               /* responsivo */
  padding: 0.75rem 1.25rem;
  background: var(--surface-0);
  border-bottom: 1px solid var(--surface-border);
}

/* ── Pauta ─────────────────────────────────────────── */
.pauta-table           { width: 100%; border-collapse: collapse; table-layout: fixed; }
.pauta-mat-ementa      { -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                         display: -webkit-box; overflow: hidden; }
.pauta-row-confirm td  { background: var(--yellow-50) !important; }
.pauta-inline-confirm  { display: flex; align-items: center; gap: 0.75rem; }

/* ── Transmissão — tela cheia ───────────────────────── */
.jitsi-fullscreen-btn {
  position: absolute; top: 8px; right: 8px; z-index: 10;
  display: flex; align-items: center; gap: 4px;
  padding: 4px 8px;
  background: rgba(0,0,0,.55); color: rgba(255,255,255,.85);
  border: none; border-radius: 4px; font-size: 11px; cursor: pointer;
}
.jitsi-fullscreen-btn:hover { background: rgba(0,0,0,.8); color: #fff; }

/* ── Câmera selector ────────────────────────────────── */
.cam-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
}
.cam-card {
  border: 0.5px solid var(--surface-border);
  border-radius: var(--border-radius-md);
  overflow: hidden; cursor: pointer;
}
.cam-card:hover           { border-color: var(--surface-300); }
.cam-card.ativa           { border: 1.5px solid var(--blue-500); }
.cam-card.ativa-libras    { border: 1.5px solid var(--teal-500); }
.cam-card.desconectada    { opacity: 0.5; cursor: default; }

/* ── Audio mixer ─────────────────────────────────────── */
.mixer-row          { display: flex; align-items: center; gap: 10px; padding: 10px 0;
                      border-bottom: 0.5px solid var(--surface-border); }
.mixer-label        { width: 96px; font-size: 12px; flex-shrink: 0; }
.mixer-slider       { flex: 1; min-width: 0; accent-color: var(--primary-color); }
.mixer-val          { width: 38px; text-align: right; font-size: 12px; font-weight: 600; }
.vu-bar             { height: 3px; border-radius: 2px; background: var(--surface-100); overflow: hidden; }
.vu-fill            { height: 100%; border-radius: 2px; transition: width 80ms; background: var(--green-500); }
.vu-fill.warn       { background: var(--yellow-500); }
.vu-fill.clip       { background: var(--red-500); }
.mixer-row-disabled { opacity: 0.45; pointer-events: none; }

/* ── Animações ──────────────────────────────────────── */
.tab-ao-vivo-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--red-500); animation: sigl-pulse .9s infinite;
}
@keyframes sigl-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── Responsivo ─────────────────────────────────────── */
@media (max-width: 768px) {
  .pauta-mat-ementa   { display: none; }
  .cam-selector-grid  { grid-template-columns: repeat(2, 1fr); }
  .mixer-label        { width: 72px; }
}
@media (max-width: 480px) {
  .sessao-topbar > .topbar-actions { width: 100%; justify-content: flex-end; }
  .cam-selector-grid               { grid-template-columns: 1fr 1fr; }
}
```

---

## Checklist completo

### Fundação
- [x] `npm install @jitsi/react-sdk` + build sem erros
- [x] `types/sessoes.ts` com `JitsiParticipant` e `AudioChannel`
- [x] Todos os paths em `api/paths.ts`

### Badges e criar sessão
- [x] `SessaoStatusBadge` (5 status + ícones)
- [x] `FaseAtualBadge` (5 fases)
- [x] `SessaoCreateDialog` sem `linkJitsi`
- [x] `SessaoAcoesMenu` com confirmDestructive

### Tela de detalhe
- [x] Topbar com `flex-wrap`, badges sempre visíveis
- [x] Indicador WebSocket no topbar
- [x] Aba Transmissão oculta em status final
- [x] Ponto vermelho na aba quando transmitindo

### Pauta
- [x] `PautaBadges` com abreviações corretas
- [x] `PautaItemRow` com confirmação inline (sem dialog)
- [x] Estado vazio com call-to-action
- [x] Reordenação otimista com rollback
- [x] `AddPautaItemDialog` com inferência + hint
- [x] `PublicarPautaDialog` + bloqueio de ✕ após publicar

### Transmissão — câmeras
- [x] `StatusConexaoJitsi` com 3 zonas e animações
- [x] `<JitsiMeeting>` com `domain`/`roomName`/`jwt` do endpoint
- [x] `prejoinPageEnabled: false`
- [x] Botão de tela cheia sobre o iframe (posição absolute)
- [x] `requestFullscreen` com fallback CSS
- [x] ESC sai do modo fullscreen (fallback)
- [x] `CameraSelector` com grid de cards clicáveis
- [x] Câmeras fixas: Câmera 1, Câmera 2, Compartilhar Tela
- [x] Card Libras sempre visível, estado depende de `librasConectado`
- [x] Detecção automática por `displayName` via `participantJoined`
- [x] Toast se clicar em Libras quando não conectado
- [x] Card ativo: borda azul / card Libras ativo: borda verde

### Transmissão — áudio
- [x] `AudioMixer` com 4 canais + master
- [x] Sliders com `step="1"` e valor exibido em `%`
- [x] Botão mute por canal (estado visual muted)
- [x] Canal Libras disabled quando não conectado
- [x] VU meter por canal (barra 3px, 3 cores)
- [x] `audioLevelsChanged` listener para atualizar VU em tempo real

### Transmissão — stream
- [x] `StreamControles` com botão iniciar/parar
- [x] Timer de duração formatado em `mm:ss`
- [x] Badge "AO VIVO" visível quando transmitindo
- [x] `YoutubeConfigForm` com salvar + copiar + abrir
- [x] Botão de tela cheia alternativo na aba

### WebSocket
- [x] `useSessaoRealtime` com todos os eventos + cleanup
- [x] Integrado na `SessaoDetalhePage`

### CSS e responsividade
- [x] `pauta-table` com `table-layout: fixed`
- [x] `cam-selector-grid` com `auto-fill minmax(130px, 1fr)`
- [x] Ementa oculta em < 768px
- [x] `@keyframes sigl-pulse` para todos os pontos animados

### Verificações finais
- [x] `npm run build` → zero erros TypeScript
- [x] `domain` Jitsi vem de `/jitsi-token`, nunca hardcoded
- [x] `linkJitsi` não aparece em nenhum formulário
- [x] Números no mixer sempre arredondados (`Math.round`)
