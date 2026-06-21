# PROMPT — FE: Criar Sessão, Gerenciar Pauta e Transmissão Jitsi

> Cole este prompt no Claude Code após `cd frontend && claude`.
> Pré-requisito: TASK-FE-001 (fundação) concluída.

```
Leia antes de começar:
1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/architecture/PATTERNS-FE.md
3. frontend/docs/tasks/TASK-FE-SESSAO-criar-pauta-transmissao.md

Confirme o escopo antes de escrever qualquer linha de código.

══════════════════════════════════════════════════════════════════
PASSO 0 — INSTALAÇÃO
══════════════════════════════════════════════════════════════════

npm install @jitsi/react-sdk
npm run build   ← deve passar sem erros

<JitsiMeeting> importado de @jitsi/react-sdk.
Nunca script dinâmico, nunca iframe manual.

══════════════════════════════════════════════════════════════════
BLOCO 1 — TIPOS E PATHS
══════════════════════════════════════════════════════════════════

Criar types/sessoes.ts com:
  StatusSessao, FaseSessao, FasePauta, TipoPautaItem, StatusPautaItem
  SessaoPlenaria, PautaItem
  JitsiTokenData { token, roomName, domain }
  JitsiParticipant { id, displayName, role }
  AudioChannel { id, label, volume (0-100), muted, isOptional? }
  CreateSessaoDto, AddPautaItemDto

Adicionar em api/paths.ts:
  sessaoById, sessaoAbrir, sessaoSuspender, sessaoEncerrar, sessaoCancelar,
  sessaoQuorum, sessaoPresencas,
  sessaoPauta, sessaoPautaItem, sessaoPautaPublicar,
  sessaoJitsiToken (id) => `/legislative/sessoes-plenarias/${id}/jitsi-token`
  tiposSessao, legislaturas

══════════════════════════════════════════════════════════════════
BLOCO 2 — BADGES
══════════════════════════════════════════════════════════════════

SessaoStatusBadge — <Tag> com severity e icon:
  AGENDADA  info      pi-calendar
  ABERTA    success   pi-circle-fill
  SUSPENSA  warning   pi-pause
  ENCERRADA secondary pi-check-circle
  CANCELADA danger    pi-times-circle

FaseAtualBadge — <Tag>:
  NAO_INICIADA         secondary  "Não iniciada"
  EXPEDIENTE           info       "Expediente"
  ORDEM_DO_DIA         warning    "Ordem do Dia"
  EXPLICACOES_PESSOAIS secondary  "Explicações Pessoais"
  ENCERRADA            secondary  "Encerrada"

══════════════════════════════════════════════════════════════════
BLOCO 3 — CRIAR SESSÃO
══════════════════════════════════════════════════════════════════

SessaoCreateDialog:
  grid-2: [Tipo de Sessão*] [Sessão Legislativa]
           [Data* dd/mm/yy]  [Horário hh:mm]
  full:   [Link YouTube — placeholder https://youtube.com/live/...]

  linkJitsi NUNCA no formulário.
  Carregar dropdowns com Skeleton ao abrir.
  Submit → POST /legislative/sessoes-plenarias
  Body: { tipoSessaoId, dataInicio (ISO8601), sessaoLegislativaId?, linkYoutube? }
  Após → fechar + rebuscar + toast "Sessão criada"

SessaoAcoesMenu:
  AGENDADA  → [Abrir] [Cancelar*]
  ABERTA    → [Suspender] [Encerrar*]
  SUSPENSA  → [Retomar] [Encerrar*]
  *destrutivas: confirmDestructive() antes da API

══════════════════════════════════════════════════════════════════
BLOCO 4 — SESSAODETALHE PAGE
══════════════════════════════════════════════════════════════════

Topbar (flex-wrap):
  [← Sessões] | Nome + data/hora | [status badge] [fase badge] [ws pill] | [Ações]
  wsConectado=true → pill verde "● Ao vivo"
  faseExibida = faseAtual (WS) ?? sessao.faseAtual

Banner de votação (só quando votacaoAberta !== null):
  fundo âmbar: "⚡ Votação: [titulo]  SIM: N | NÃO: N | ABSTENÇÃO: N"

TabView:
  [Pauta]  [Presenças]  [Transmissão ●]
  Ponto vermelho animado na aba Transmissão quando transmitindo=true.
  Aba Transmissão: só se statusSessao ∈ ['ABERTA','SUSPENSA']

══════════════════════════════════════════════════════════════════
BLOCO 5 — PAUTA
══════════════════════════════════════════════════════════════════

utils/pautaInferencia.ts:
  SIGLAS_PE = ['OFC','IND','REQ']
  inferirFase(sigla) → sigla ∈ SIGLAS_PE ? 'PEQUENO_EXPEDIENTE' : 'ORDEM_DO_DIA'
  inferirTipo(fase)  → fase === 'ORDEM_DO_DIA' ? 'DELIBERACAO' : 'COMUNICACAO'

PautaBadges:
  FasePautaBadge: P.EXP | G.EXP | O.D. | EXP.P. (fontSize 0.7rem)
  TipoPautaBadge: LEI secondary | DEL warning | COM info (fontSize 0.7rem)

PautaItemRow:
  [confirmando, setConfirmando] = useState(false)
  <tr> normal + <tr className="pauta-row-confirm" colSpan=5> (bg yellow-50)
  Coluna matéria: identificação (600) + ementa (-webkit-line-clamp:2)
  Botão ✕: disabled={publicada}, tooltip "Pauta publicada — remoção bloqueada"

PautaManager:
  Busca: GET /sessoes/:id/pauta ao montar
  pautaPublicada = itens.some(i => i.status === 'PUBLICADA')
  somenteLeitura = ['ENCERRADA','CANCELADA'].includes(sessao.statusSessao)
  Estado vazio: ícone pi-clipboard + texto + call-to-action
  Reordenação OTIMISTA: trocar local primeiro, PATCH depois, reverter em erro
  CSS: table-layout: fixed (obrigatório para não estourar em mobile)

AddPautaItemDialog:
  Busca: GET /materias?limit=100
  Ao selecionar matéria → inferirFase → inferirTipo → hint azul info
  Staff pode sobrescrever. Submit: POST /sessoes/:id/pauta

PublicarPautaDialog:
  Aviso: "• Parlamentares verão • Itens publicados não podem ser removidos
          • Novos itens ainda podem ser adicionados"
  Após PATCH /sessoes/:id/pauta/publicar → rebuscar + badge + ✕ disabled

══════════════════════════════════════════════════════════════════
BLOCO 6 — TRANSMISSÃO (redesenhado com 3 sub-abas)
══════════════════════════════════════════════════════════════════

TransmissaoPanel é o orquestrador. Ele mantém TODO o estado:
  externalApiRef, jitsiContainerRef, timerRef
  jitsiData, loadingToken, conectado, transmitindo
  modoTelaCheia, cameraAtiva, librasConectado, librasParticipantId
  canais (AudioChannel[]), linkYoutube, duracao, abaAtiva

Ao montar → GET /sessoes/:id/jitsi-token
  loading → ProgressSpinner + "Preparando sala de transmissão…"
  erro    → pi-exclamation-triangle + "Não foi possível obter o token. Recarregue."

handleApiReady(externalApi):
  externalApiRef.current = externalApi
  setConectado(true)
  addListener 'recordingStatusChanged' → setTransmitindo(on)
  addListener 'participantJoined' → detectar Libras por displayName
    regex: /libras|intérprete|interprete/i
    → setLibrasParticipantId(id) + setLibrasConectado(true)
  addListener 'participantLeft' → se id === librasParticipantId → desconectar

Estrutura de render:
  <StatusConexaoJitsi>
  <TabView interno> (abas pequenas, não as abas principais da sessão)
    [📷 Câmeras]  [🎚 Áudio]  [📡 Transmissão]

── ABA CÂMERAS ───────────────────────────────────────────────────

Parte 1 — Preview Jitsi:

  <div ref={jitsiContainerRef} style={{position:'relative'}}>
    <JitsiMeeting
      domain={jitsiData.domain}       ← do backend, NUNCA hardcoded
      roomName={jitsiData.roomName}   ← do backend
      jwt={jitsiData.token}           ← JWT assinado pelo backend
      configOverwrite={{
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,    ← entrar direto sem preview
        enableWelcomePage: false,
      }}
      interfaceConfigOverwrite={{
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        TOOLBAR_BUTTONS: ['microphone','camera','desktop','fullscreen','tileview','hangup'],
      }}
      userInfo={{ displayName: userName }}
      onApiReady={handleApiReady}
      getIFrameRef={(ref) => {
        ref.style.height = '420px'
        ref.style.width = '100%'
        ref.style.borderRadius = '8px'
        ref.style.border = '1px solid var(--surface-border)'
      }}
    />
    <button className="jitsi-fullscreen-btn" onClick={handleFullscreen}>
      <i className={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'} />
      {modoTelaCheia ? 'Sair' : 'Tela cheia'}
    </button>
  </div>

handleFullscreen:
  Tentar document.requestFullscreen() no jitsiContainerRef.current
  Se falhar (iframe sandboxed) → fallback CSS:
    el.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0c0c14;border-radius:0'
  ESC → sair do fallback (listener de keydown)

Botão de fullscreen (.jitsi-fullscreen-btn):
  position: absolute; top: 8px; right: 8px; z-index: 10;
  background: rgba(0,0,0,.55); color: rgba(255,255,255,.85);
  border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px;

Parte 2 — Grid de câmeras:

  Título: "Selecionar câmera em destaque"
  Grid: repeat(auto-fill, minmax(130px, 1fr)) gap 8px

  Câmeras FIXAS (sempre exibidas):
    { id:'camera1', label:'Câmera 1 — Leitor',   icon:'pi pi-desktop' }
    { id:'camera2', label:'Câmera 2 — Plenário', icon:'pi pi-desktop' }
    { id:'screen',  label:'Compartilhar tela',   icon:'pi pi-window' }

  Câmera LIBRAS (sempre exibida — estado muda):
    { id:'libras', label:'Intérprete — Libras', icon:'pi pi-hand-paper', opcional:true }
    librasConectado=false → card opacity .5, cursor:default, badge "Aguardando"
    librasConectado=true  → card normal, badge "Conectado" verde
    Clicar em Libras sem conectado → toast "Intérprete não está na sala"

  Cada card:
    Preview escuro (80px height) com ícone centralizado
    Rodapé: label + [Ativar]
    Card ativo (cameraAtiva === id): border 1.5px #185FA5 (azul)
    Card ativo Libras: border 1.5px #1D9E75 (verde)
    Badge de destaque no preview: "DESTAQUE" (azul) ou "LIBRAS" (verde)

  handleSelecionarCamera(cam):
    se cam.id === 'screen' → executeCommand('toggleShareScreen')
    se cam.id === 'libras' → executeCommand('setLargeVideoParticipant', librasParticipantId)
    demais → executeCommand('setLargeVideoParticipant', cam.id)
    setCameraAtiva(cam.id)

  Nota de rodapé do seletor:
    Badge âmbar "Libras — opcional"
    Texto: "Intérprete conectado automaticamente quando disponível na sala."

── ABA ÁUDIO ─────────────────────────────────────────────────────

AudioMixer com CANAIS_PADRAO:
  { id:'mic',     label:'Microfone', volume:85, muted:false }
  { id:'camera1', label:'Câmera 1',  volume:70, muted:false }
  { id:'camera2', label:'Câmera 2',  volume:60, muted:false }
  { id:'libras',  label:'Libras',    volume:80, muted:true,  isOptional:true }
  ─────── separador ───────
  { id:'master',  label:'Volume geral', volume:100, muted:false }

Cada canal:
  [label 96px] [slider flex:1 step=1 accent=primary] [val 38px "85%"] [mute btn 28px círculo]
  VU bar 3px abaixo: verde ≤70% | âmbar 70-90% | vermelho >90%
  Valor sempre exibido com Math.round(val) + '%'

Canal Libras:
  disabled={!librasConectado}
  Quando disabled → opacity .45 + texto "Intérprete não conectado — canal reservado"
  Quando conectado → habilitar + badge verde "Conectado"

Botão mute:
  Normal → borda cinza, ícone do canal
  Muted  → background red-50, cor red-600, borda red-200

handleVolumeChange(canal, valor):
  setCanais localmente
  se canal === 'mic'    → executeCommand('setAudioInputDevice',...) se disponível
  se canal === 'master' → externalApi.setAudioOutputVolume(valor/100 * 1) se disponível

handleMute(canal):
  setCanais localmente (toggle muted)
  se canal === 'mic' → executeCommand('toggleAudio')

VU meter em tempo real:
  externalApi.addListener('audioLevelsChanged', (levels) => setAudioLevels(levels))
  Mapear levels[participantId] para o canal correspondente

── ABA TRANSMISSÃO ───────────────────────────────────────────────

Seção 1 — Controle streaming:

  Se !transmitindo:
    [▶ Iniciar YouTube] severity=danger
    disabled={!linkYoutube}, tooltip="Configure o link do YouTube abaixo"
  Se transmitindo:
    [■ Parar transmissão] severity=secondary
    Badge "● AO VIVO" vermelho pulsando
    Timer: "mm:ss" atualizado a cada 1s

  handleIniciarStream:
    streamKey = extrairStreamKey(linkYoutube)  // regex /\/live\/([^?&/]+)/
    executeCommand('startRecording', { mode:'stream', youtubeStreamKey: streamKey })
    setTransmitindo(true)
    setDuracao(0)
    timerRef.current = setInterval(() => setDuracao(d => d + 1), 1000)

  handlePararStream:
    executeCommand('stopLiveStreaming')
    setTransmitindo(false)
    clearInterval(timerRef.current)

  formatarDuracao(s):
    m = Math.floor(s/60).toString().padStart(2,'0')
    ss = (s%60).toString().padStart(2,'0')
    return `${m}:${ss}`

Seção 2 — Link YouTube:
  [InputText link] [Salvar] [⎘ Copiar] [↗ Abrir]
  Copiar → navigator.clipboard.writeText(linkYoutube)
  Abrir  → window.open(linkYoutube, '_blank', 'noopener')
  Salvar → PATCH /sessoes/:id { linkYoutube } + toast

Seção 3 — Tela cheia (atalho):
  [⛶ Expandir sala de vídeo] → handleFullscreen()
  hint: "Expande o iframe Jitsi para toda a janela."

── StatusConexaoJitsi ────────────────────────────────────────────

Barra horizontal, flex-wrap, 3 zonas:
  Zona 1: ponto animado + texto
    conectado=false → amarelo pulse 1s + "Conectando à sala…"
    conectado=true  → verde   pulse 1.4s + "Conectado"
  Zona 2: ícone pi-video + "Sala:" + <code>sessao-abc12345</code>
           + badge azul "N participantes" (quando conectado)
  Zona 3: margin-left:auto
    transmitindo=true → badge vermelho pulsando "AO VIVO"

══════════════════════════════════════════════════════════════════
BLOCO 7 — WEBSOCKET
══════════════════════════════════════════════════════════════════

hooks/useSessaoRealtime.ts:
  io('/sessao', { auth:{token}, query:{sessaoId}, transports:['websocket'] })
  connect     → setWsConectado(true)
  disconnect  → setWsConectado(false)
  sessao:fase → setFaseAtual(data.faseAtual)
  votacao:aberta   → setVotacaoAberta(data); setPlacar(null)
  votacao:placar   → setPlacar(data)
  votacao:encerrada→ setVotacaoAberta(null); setPlacar(null)
  sessao:encerrada → setFaseAtual('ENCERRADA')
  cleanup: socket.disconnect()
  return { faseAtual, votacaoAberta, placar, wsConectado }

══════════════════════════════════════════════════════════════════
BLOCO 8 — CSS CRÍTICO
══════════════════════════════════════════════════════════════════

Adicionar em sigl-ui-patterns.css:

  .pauta-table        { table-layout: fixed }          ← OBRIGATÓRIO
  .pauta-mat-ementa   { -webkit-line-clamp: 2 }
  .pauta-row-confirm td { background: var(--yellow-50) !important }

  .jitsi-fullscreen-btn { position:absolute; top:8px; right:8px; z-index:10;
    background:rgba(0,0,0,.55); color:rgba(255,255,255,.85);
    border:none; border-radius:4px; padding:4px 8px; font-size:11px }

  .cam-selector-grid { display:grid;
    grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px }
  .cam-card.ativa       { border:1.5px solid #185FA5 }
  .cam-card.ativa-libras{ border:1.5px solid #1D9E75 }

  .mixer-label   { width:96px; flex-shrink:0 }
  .mixer-slider  { flex:1; min-width:0; accent-color:var(--primary-color) }
  .vu-bar        { height:3px; border-radius:2px; background:var(--surface-100) }
  .vu-fill       { background:var(--green-500); transition:width 80ms }
  .vu-fill.warn  { background:var(--yellow-500) }
  .vu-fill.clip  { background:var(--red-500) }
  .mixer-mute.muted { background:var(--red-50); color:var(--red-600) }
  .mixer-row-disabled { opacity:.45; pointer-events:none }

  @media (max-width:768px) {
    .pauta-mat-ementa  { display:none }
    .cam-selector-grid { grid-template-columns:repeat(2,1fr) }
    .mixer-label       { width:72px }
  }
  @media (max-width:480px) {
    .sessao-topbar > .topbar-actions { width:100%; justify-content:flex-end }
  }
  @keyframes sigl-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

══════════════════════════════════════════════════════════════════
ORDEM DE EXECUÇÃO
══════════════════════════════════════════════════════════════════

NÃO execute nada ainda. Confirme o escopo e aguarde aprovação.

Após confirmação:
  BLOCO 1: types/sessoes.ts + api/paths.ts
  BLOCO 2: SessaoStatusBadge + FaseAtualBadge
  BLOCO 3: SessaoCreateDialog + SessaoAcoesMenu
  BLOCO 4: SessaoDetalhePage (estrutura + TabView)
  BLOCO 5: pautaInferencia + PautaBadges + PautaItemRow
           + AddPautaItemDialog + PublicarPautaDialog + PautaManager
  BLOCO 6: StatusConexaoJitsi
           + CameraSelector (preview Jitsi + grid de câmeras)
           + AudioMixer
           + StreamControles + YoutubeConfigForm
           + TransmissaoPanel (orquestrador)
  BLOCO 7: useSessaoRealtime + integrar na SessaoDetalhePage
  BLOCO 8: CSS em sigl-ui-patterns.css

AO FINAL:
  npm run build        → zero erros TypeScript
  npm run validate:routes → sem divergências

══════════════════════════════════════════════════════════════════
REGRAS INVIOLÁVEIS
══════════════════════════════════════════════════════════════════

  1. @jitsi/react-sdk via npm — nunca script dinâmico
  2. domain Jitsi do endpoint /jitsi-token — nunca hardcoded
  3. linkJitsi não aparece em nenhum formulário
  4. Confirmação de pauta INLINE na linha — sem dialog separado
  5. Reordenação OTIMISTA — estado local primeiro
  6. pauta-table com table-layout:fixed — obrigatório
  7. Mixer: valores sempre Math.round() antes de exibir
  8. Fullscreen: requestFullscreen() com fallback CSS + ESC listener
  9. Libras: card sempre visível, estado muda com participantJoined/Left
  10. tenantId nunca vem do body — vem do JWT
  11. Perguntar antes de qualquer decisão não coberta aqui
```
