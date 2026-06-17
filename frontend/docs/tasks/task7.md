✨ Task: Adicionar campos de CPF e Senha na criação de Novo Parlamentar
Descrição:
Para suportar a nova arquitetura onde o back-end cria automaticamente o tenantUser ao cadastrar um Parlamentar, o front-end precisa coletar e enviar as credenciais de acesso do novo usuário. Atualmente, o modal de criação não possui os campos necessários (CPF e Senha) para compor esse payload.

Comportamento Atual (conforme image_bf7686.png):
O modal "Novo Parlamentar" exibe apenas os blocos de "Identificação" (Nome, Gabinete/Sala, Partido) e "Conteúdo" (Biografia).

Comportamento Esperado:
O formulário deve conter uma nova seção dedicada aos "Dados de Acesso" ou "Credenciais", permitindo a inserção do CPF (que atuará como identificador do usuário) e da Senha.

Critérios de Aceite:

[x] Adicionar um campo para CPF na interface (utilizando os componentes de input ).

[x] Aplicar máscara de formatação automática no campo de CPF (000.000.000-00).

[x] Implementar validação de CPF válido no client-side antes de habilitar o botão "Cadastrar".

[x] Adicionar um campo para Senha (tipo password, idealmente com ícone para alternar a visibilidade).

[x] Adicionar um campo de Confirmação de Senha com regra de validação para garantir que ambas as senhas coincidem.

[x] Atualizar o payload da requisição POST (REST) para incluir o cpf e a senha junto com os demais dados do parlamentar.