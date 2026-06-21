# DECISAO-APPS — Separação de Aplicações: Staff (web) e Parlamentar (mobile)

**Tipo:** Decisão de produto — regra definitiva de separação de contextos
**Data:** 2025-06

---

## Regra

O sistema é composto por **duas aplicações distintas** que compartilham o mesmo backend.
Cada uma atende um contexto completamente diferente e nunca se misturam.

---

## Aplicação 1 — Plataforma Staff (web, desktop)

**Quem usa:** TenantUser (Admin Staff e Staff) — funcionários da câmara

**O que fazem:**
- Gerenciam o sistema completo: sessões, pautas, matérias, normas, atos, parlamentares
- Abrem e encerram sessões plenárias
- Controlam a infraestrutura audiovisual via Jitsi (câmeras, áudio, LIBRAS, screen share)
- Iniciam a transmissão ao vivo para o YouTube (via Jibri)
- Rolam a pauta no painel TV durante a sessão
- Abrem e encerram votações (por ordem do Presidente)
- Acompanham o placar e o andamento da sessão em tempo real

**Dispositivo:** Desktop / notebook — browser web

**O que NÃO fazem:**
- Não votam em matérias
- Não pedem a palavra
- Não controlam pedidos de fala dos parlamentares

---

## Aplicação 2 — App Parlamentar (mobile)

**Quem usa:** ParlamentarianUser (vereadores e deputados)

**O que fazem:**
- Fazem login com CPF + senha
- Marcam a própria presença na sessão
- Acompanham a pauta e fase atual em tempo real (via WebSocket)
- Assistem a sessão ao vivo (via Jitsi SDK ou link YouTube)
- Votam eletronicamente: SIM / NÃO / ABSTENÇÃO
- Pedem a palavra (botão no app → fila gerenciada pelo Presidente)

**Dispositivo:** Tablet ou celular — app mobile (React Native / PWA)

**O que NÃO fazem:**
- Não gerenciam sessões, pautas ou documentos
- Não controlam câmeras ou áudio
- Não abrem ou encerram votações (exceto o Presidente)

---

## Presidente da Câmara — caso especial

O Presidente usa o **mesmo app do parlamentar**, com uma aba adicional de controles:

- Controla pedidos de fala: concede ou nega
- Pode abrir e encerrar votações (sem depender do Staff)
- Exerce voto de qualidade em empate de maioria simples

O sistema identifica o Presidente via `BoardMember` do Board ativo do tenant —
não há role especial no JWT. A aba de controles aparece automaticamente no app
quando `isPresidente = true` retornado por `GET /sessoes/sessao-ativa`.

---

## Infraestrutura audiovisual (Jitsi)

O Jitsi é gerenciado **exclusivamente pelos funcionários da câmara** via painel Staff.
Parlamentares participam da sala Jitsi apenas como espectadores/participantes —
sem controle de câmeras, áudio ou stream.

| Quem | Papel no Jitsi | Controla |
|------|---------------|---------|
| Staff | Moderador | Câmeras, áudio, stream YouTube |
| Câmera 1, Câmera 2 | Moderador | Apenas seu próprio vídeo |
| Tradutor LIBRAS | Moderador | Apenas seu próprio vídeo |
| Parlamentar | Participante | Apenas seu próprio microfone |
| Público (YouTube) | Viewer | Nada |

---

## Regra para o Claude Code

Ao implementar qualquer endpoint ou componente, verificar:

```
É ação de GERENCIAMENTO (sessão, pauta, votação, documentos, câmeras)?
  → Pertence à Plataforma Staff
  → Guard: StaffGuard (ou PresidentOrStaffGuard para votação/fase)
  → Interface: web desktop

É ação de PARTICIPAÇÃO LEGISLATIVA (presença, voto, palavra)?
  → Pertence ao App Parlamentar
  → Guard: ParlamentarianGuard (ou isPresidente para controles extras)
  → Interface: mobile/tablet
```

Nunca criar endpoint de votação acessível por Staff.
Nunca criar endpoint de gestão de sessão acessível por Parlamentar comum.
Nunca misturar as duas interfaces em uma única aplicação.
