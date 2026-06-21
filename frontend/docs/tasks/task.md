# TASK-FE-UI-001 — Melhorias de UI: Dialog TenantPartner (Autor Externo)

**Origem:** Revisão visual do dialog `TenantPartnerEditDialog`
**Componente:** `components/TenantPartnerCreateDialog.tsx` e `TenantPartnerEditDialog.tsx`
**Prioridade:** Alta — afeta usabilidade diária do Staff

---

## Problemas identificados

### P1 — Seções sem hierarquia visual clara

**Problema:** Os rótulos de seção ("Identificação", "Complemento", "Usuário vinculado")
são texto simples sem nenhuma separação visual. O usuário não percebe onde uma
seção termina e outra começa.

**Correção:**
```tsx
// Antes: texto solto
<span>Identificação</span>

// Depois: Divider com label integrado do PrimeReact
<Divider align="left">
  <span className="text-sm font-semibold text-color-secondary">Identificação</span>
</Divider>
```

Aplicar em todas as seções: Identificação, Complemento, Usuário vinculado.

---

### P2 — Campo "Identificação" com nome ambíguo

**Problema:** O campo chama-se "Identificação" dentro da seção "Identificação" —
confuso e redundante. O conteúdo é um documento (CPF ou CNPJ).

**Correção:**
```tsx
// Antes:
<label>Identificação</label>

// Depois:
<label>CPF / CNPJ</label>
<InputText placeholder="000.000.000-00 ou 00.000.000/0001-00" />
```

---

### P3 — Campo UF em linha sozinho

**Problema:** UF ocupa uma linha inteira, usando apenas 50% do espaço.
Fica deslocado visualmente após dois campos em linha dupla.

**Correção:** Colocar UF ao lado do campo CPF/CNPJ na mesma linha:

```tsx
// Linha com CPF/CNPJ (flex: 2) + UF (flex: 1)
<div className="flex gap-3">
  <div className="sigl-filtro-campo" style={{ flex: 2 }}>
    <label>CPF / CNPJ</label>
    <InputText />
  </div>
  <div className="sigl-filtro-campo" style={{ flex: 1 }}>
    <label>UF</label>
    <Dropdown options={UF_OPTIONS} placeholder="Selecione" />
  </div>
</div>
```

---

### P4 — Seção "Usuário vinculado" confusa

**Problema:** A seção mistura dois propósitos sem separação:
1. Criar/vincular usuário (Nome + CPF + botão)
2. Upload de foto de perfil

Além disso, não há feedback visual de "usuário já vinculado" vs. "nenhum usuário".

**Correção — dois estados visuais distintos:**

```tsx
// Estado: SEM usuário vinculado
<div className="p-3 border-1 border-dashed border-300 border-round">
  <p className="text-sm text-color-secondary mb-3">
    Nenhum usuário vinculado. O parceiro não precisa de acesso ao sistema.
  </p>
  <div className="flex gap-3 align-items-end">
    <div className="sigl-filtro-campo" style={{ flex: 2 }}>
      <label>Nome do representante</label>
      <InputText placeholder="Nome completo" />
    </div>
    <div className="sigl-filtro-campo" style={{ flex: 1 }}>
      <label>CPF</label>
      <InputMask mask="999.999.999-99" />
    </div>
    <Button label="Vincular" icon="pi pi-link" size="small" />
  </div>
</div>

// Estado: COM usuário vinculado
<div className="p-3 surface-100 border-round flex align-items-center gap-3">
  <Avatar label={usuario.nome[0]} shape="circle" />
  <div>
    <p className="font-semibold m-0">{usuario.nome}</p>
    <p className="text-sm text-color-secondary m-0">{usuario.cpf}</p>
  </div>
  <Button icon="pi pi-times" text rounded severity="danger"
    aria-label="Desvincular usuário"
    onClick={handleDesvincular}
    style={{ marginLeft: 'auto' }} />
</div>
```

---

### P5 — Foto de perfil desalinhada

**Problema:** `FileUpload` de foto fica à esquerda e o botão "Vincular usuário" à
direita sem grid consistente — parecem elementos independentes sem relação.

**Correção:** Foto de perfil deve ser uma seção própria, separada de "Usuário vinculado",
logo abaixo do nome/cargo (pertence aos dados do parceiro, não do usuário):

```tsx
// Mover foto para a seção "Complemento", após Partido:
<div className="sigl-filtro-campo">
  <label>Foto</label>
  <FileUpload
    mode="basic"
    accept="image/*"
    maxFileSize={2000000}
    chooseLabel="Selecionar foto"
    auto
    customUpload
    uploadHandler={handleFotoUpload}
  />
</div>
```

O `FileUpload` atual aceita PDF/DOC — **incorreto** para foto. Alterar para `accept="image/*"`.

---

### P6 — Nota técnica no rodapé

**Problema:** O texto menciona termos internos (`User`, `TenantPartnerUser`) que
o usuário final não conhece e não precisa saber.

**Correção:**
```tsx
// Antes:
"Cria a identidade interna (User + TenantPartnerUser) com os dados informados.
 Não concede login — senha gerada automaticamente pelo sistema."

// Depois:
<Message
  severity="info"
  text="Este parceiro não terá acesso ao sistema. As informações são usadas
        apenas para identificação como autor em matérias legislativas."
/>
```

Usar `<Message severity="info">` do PrimeReact em vez de texto solto.

---

### P7 — Ícone do botão "Vincular usuário"

**Problema:** Usa ícone de grupo (pi-users) que sugere "gerenciar vários usuários".
O ícone correto para "vincular/conectar" é `pi-link`.

**Correção:**
```tsx
// Antes:
<Button icon="pi pi-users" label="Vincular usuário" />

// Depois:
<Button icon="pi pi-link" label="Vincular" />
```

---

### P8 — Partido em linha sozinho

**Problema:** Campo "Partido" (visível apenas para categoria D — político externo)
ocupa linha inteira sendo um campo curto.

**Correção:** Colocar Partido ao lado de UF quando ambos forem visíveis:

```tsx
<div className="flex gap-3">
  <div className="sigl-filtro-campo" style={{ flex: 1 }}>
    <label>Partido</label>
    <InputText placeholder="Ex: PT, PSDB..." />
  </div>
  <div className="sigl-filtro-campo" style={{ flex: 1 }}>
    <label>UF</label>
    <Dropdown options={UF_OPTIONS} />
  </div>
</div>
```

---

## Layout final corrigido

```
┌─────────────────────────────────────────────────────────┐
│  Editar — [nome do parceiro]                        ✕   │
├─────────────────────────────────────────────────────────┤
│  ── Identificação ──────────────────────────────────    │
│  Nome da instituição *     │  CPF / CNPJ  │  UF         │
│  [___________________]     │  [__________]│  [___]      │
│                                                          │
│  ── Complemento ────────────────────────────────────    │
│  Cargo / função            │  Registro (OAB, CRM...)     │
│  [___________________]     │  [_____________________]   │
│                                                          │
│  Partido              │  UF  (apenas cat. D)             │
│  [______________]     │  [__]                            │
│                                                          │
│  
│                                                          │
│  ℹ️  Este parceiro não terá acesso ao sistema.           │
│                                                          │
│                          [Cancelar]  [✓ Salvar]         │
└─────────────────────────────────────────────────────────┘
```

---

## Checklist

- [ ] Seções com `<Divider align="left">` + label em `text-color-secondary`
- [ ] Campo "Identificação" renomeado para "CPF / CNPJ"
- [ ] UF ao lado de CPF/CNPJ (proporção 2:1)
- [ ] Foto com `accept="image/*"` (não PDF/DOC)
- [ ] Foto movida para seção "Complemento" (não "Usuário vinculado")
- [ ] "Usuário vinculado" com dois estados: sem usuário (borda dashed) e com usuário (surface-100 + avatar)
- [ ] Botão "Vincular" com ícone `pi-link`
- [ ] Partido ao lado de UF quando visíveis juntos (categoria D)
- [ ] Nota de rodapé como `<Message severity="info">` com texto em linguagem de usuário
- [ ] `npm run build` sem erros TypeScript