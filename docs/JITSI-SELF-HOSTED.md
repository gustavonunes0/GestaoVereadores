# JITSI-SELF-HOSTED — Arquitetura e Instalação

**Contexto:** A câmara opera com total privacidade e controle.
O Jitsi Meet é instalado em servidor próprio — nenhum dado de vídeo
passa por servidores externos.

---

## Arquitetura de servidores

```
┌─────────────────────────────────────────────────────────┐
│ Servidor 1 — Aplicação (já existe)                       │
│   Backend NestJS :3000                                   │
│   Frontend React :8080                                   │
│   PostgreSQL :5433                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Servidor 2 — Jitsi Meet (Debian/Ubuntu 22.04 LTS)       │
│   Jitsi Meet (nginx :80/:443)                           │
│   Jicofo (foco de conferência)                          │
│   Prosody (XMPP :5222/:5269/:5280)                      │
│   Jitsi Videobridge — JVB (:4443 TCP / :10000 UDP)      │
│                                                          │
│   Domínio: meet.camara.baturite.ce.gov.br               │
│   SSL: Let's Encrypt (obrigatório)                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Servidor 3 — Jibri (opcional — para gravar + YouTube)   │
│   Chrome headless (captura a sala Jitsi)                │
│   Envia RTMP → YouTube ao vivo                          │
│   Requer: CPU/GPU dedicada, min 4 vCPUs + 8 GB RAM      │
└─────────────────────────────────────────────────────────┘
```

---

## Instalação do Jitsi (Servidor 2)

### Pré-requisitos

```bash
# Debian/Ubuntu 22.04 LTS
# Mínimo recomendado: 4 vCPU, 4 GB RAM, 20 GB disco
# Portas necessárias (liberar no firewall/security group):
#   80/TCP   — HTTP (redirect para HTTPS)
#   443/TCP  — HTTPS (Jitsi Meet web)
#   4443/TCP — JVB (fallback TCP)
#   10000/UDP — JVB (vídeo/áudio — porta principal)
```

### Instalação via quick install (método oficial)

```bash
# 1. Configurar hostname
hostnamectl set-hostname meet.camara.baturite.ce.gov.br
echo "127.0.0.1 meet.camara.baturite.ce.gov.br" >> /etc/hosts

# 2. Adicionar repositório Jitsi
curl https://download.jitsi.org/jitsi-key.gpg.key | gpg --dearmor > /usr/share/keyrings/jitsi-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/" | tee /etc/apt/sources.list.d/jitsi-stable.list

# 3. Instalar
apt update && apt install -y jitsi-meet

# Durante a instalação, informar:
#   Hostname: meet.camara.baturite.ce.gov.br
#   SSL: opção "Let's Encrypt" (gera certificado automático)

# 4. Verificar que está rodando
systemctl status jitsi-videobridge2
systemctl status jicofo
systemctl status prosody
```

---

## Configuração de JWT (autenticação de sala)

Por padrão, qualquer pessoa com o link entra na sala. Para restringir
acesso (apenas Staff e parlamentares com token), ativar JWT:

### No Prosody (`/etc/prosody/conf.avail/meet.camara.baturite.ce.gov.br.cfg.lua`)

```lua
-- Adicionar/alterar:
authentication = "token"
app_id = "camara-baturite"         -- identificador da aplicação
app_secret = "SEU_SECRET_AQUI"     -- chave secreta compartilhada com o backend
```

### No backend NestJS — endpoint de token Jitsi

```ts
// src/legislativo/sessoes-plenarias/application/use-cases/get-jitsi-token.use-case.ts
import * as jwt from 'jsonwebtoken';

@Injectable()
export class GetJitsiTokenUseCase {
  async execute(sessaoId: string, user: JwtPayload, tenantId: string) {
    const sessao = await this.sessaoRepo.findById(sessaoId, tenantId);
    if (!sessao) throw new NotFoundException('Sessão não encontrada');

    const isModerador = isStaffSession(user); // Staff = moderador | Parlamentar = participante

    const roomName = `sessao-${sessaoId.slice(0, 8)}`;

    const token = jwt.sign(
      {
        context: {
          user: {
            id: user.sub,
            name: isStaffSession(user) ? 'Staff' : (user as any).parliamentaryName,
            avatar: '',
            email: '',
            moderator: isModerador.toString(),
          },
          room: { regex: false },
        },
        aud: 'jitsi',
        iss: 'camara-baturite',  // app_id do Prosody
        sub: 'meet.camara.baturite.ce.gov.br',
        room: roomName,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, // expira em 4h
      },
      process.env.JITSI_APP_SECRET, // mesma chave do Prosody
    );

    return { token, roomName, domain: process.env.JITSI_DOMAIN };
  }
}
```

```
GET /legislative/sessoes-plenarias/:id/jitsi-token
Guard: JwtAuthGuard + TenantGuard (Staff ou Parlamentar)
Response: { token: string, roomName: string, domain: string }
```

### No frontend — usar o token JWT do Jitsi

```tsx
// TransmissaoPanel — buscar token antes de renderizar <JitsiMeeting>
const { data: jitsiData } = useQuery(
  ['jitsi-token', sessao.id],
  () => api(`${API_PATHS.sessaoJitsiToken(sessao.id)}`),
  { enabled: !!sessao.id }
);

<JitsiMeeting
  domain={jitsiData.domain}
  roomName={jitsiData.roomName}
  jwt={jitsiData.token}          // ← token JWT para autenticação
  configOverwrite={{ ... }}
  onApiReady={handleApiReady}
  getIFrameRef={(ref) => { ref.style.height = '480px'; }}
/>
```

---

## Jibri — Gravação e Streaming YouTube (Servidor 3)

Jibri é o componente que grava e faz live stream. Precisa de servidor separado
porque usa Chrome headless com GPU para capturar o vídeo.

### Instalação básica (no Servidor 3)

```bash
apt install -y jibri

# Configurar em /etc/jitsi/jibri/jibri.conf:
jibri {
  id = "jibri-baturite-1"
  xmpp-environments = [{
    name = "camara-prod"
    xmpp-server-hosts = ["meet.camara.baturite.ce.gov.br"]
    xmpp-domain = "meet.camara.baturite.ce.gov.br"
    ...
  }]
}
```

### Como o Staff usa pelo sistema

Quando o Staff clica **"Iniciar YouTube"** no `TransmissaoPanel`:

```ts
// 1. Staff tem o Stream Key do YouTube Studio configurado
// 2. Sistema extrai do linkYoutube ou Staff cola diretamente

externalApiRef.current.executeCommand('startRecording', {
  mode: 'stream',
  youtubeStreamKey: streamKey,
  // Jibri recebe o comando via XMPP e inicia o Chrome headless
});
```

O Jibri se conecta à sala Jitsi como participante invisível, captura
todo o vídeo/áudio, e envia via RTMP para:
`rtmp://a.rtmp.youtube.com/live2/{streamKey}`

---

## Variáveis de ambiente

### Backend (`.env`)

```bash
JITSI_DOMAIN=meet.camara.baturite.ce.gov.br
JITSI_APP_ID=camara-baturite
JITSI_APP_SECRET=sua_chave_secreta_longa_aqui  # mesma do Prosody
```

### Frontend (`.env.local` e `.env.production`)

```bash
VITE_JITSI_DOMAIN=meet.camara.baturite.ce.gov.br
```

---

## Resumo do fluxo completo durante uma sessão

```
Staff abre sessão na plataforma
  → sistema cria sessão no banco com id único
  → roomName = "sessao-{id.slice(0,8)}"

Staff abre aba "Transmissão"
  → frontend chama GET /sessoes/:id/jitsi-token
  → backend gera JWT Jitsi com moderador=true
  → <JitsiMeeting> renderiza com domain + roomName + jwt
  → Staff entra na sala como moderador

Técnico conecta Câmera 1 (leitor) no PC da câmera
  → Abre https://meet.camara.baturite.ce.gov.br/sessao-{id}
  → Entra com câmera ligada (moderador via JWT)

Técnico conecta Câmera 2 (plenário) no outro PC
  → Mesmo processo, outro participante moderador

Staff no painel:
  → Clica "Câmera 1 (Leitor)" → aquela câmera fica em destaque
  → Clica "Compartilhar Painel" → screen share da tela do sistema
  → Clica "Iniciar YouTube" → Jibri começa a transmitir via RTMP

Parlamentar no app mobile:
  → Não entra na sala Jitsi — assiste pelo linkYoutube (público)
  → Ou: abre linkJitsi no browser com JWT de participante (sem moderação)

Sessão encerrada → Staff clica "Parar Transmissão"
  → Jibri para o streaming
  → YouTube salva o vídeo automaticamente no canal
```

---

## Checklist de infraestrutura (antes de usar em produção)

- [ ] Servidor 2 (Jitsi) com Debian/Ubuntu 22.04, min 4 vCPU + 4 GB RAM
- [ ] Domínio `meet.camara.baturite.ce.gov.br` com DNS apontando para o Servidor 2
- [ ] SSL via Let's Encrypt configurado (gerado durante o `apt install jitsi-meet`)
- [ ] Portas abertas: 80, 443, 4443 TCP e 10000 UDP
- [ ] JWT ativado no Prosody com `app_id` e `app_secret`
- [ ] `JITSI_APP_SECRET` no backend igual ao `app_secret` do Prosody
- [ ] Endpoint `GET /sessoes/:id/jitsi-token` implementado e testado
- [ ] Frontend com `VITE_JITSI_DOMAIN` apontando para o domínio correto
- [ ] Servidor 3 (Jibri) configurado para streaming YouTube (se usar live stream)
- [ ] Conta YouTube da câmara com canal verificado e stream key ativo
