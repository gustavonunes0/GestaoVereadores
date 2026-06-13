Task 1

Critérios de Aceite
1. Interface e Experiência do Usuário (Frontend / UI)
Apresentação: A tela de login deve ser única e responsiva (adaptável para resoluções mobile e desktop).

Seleção de Perfil: A tela deve exibir os cards de seleção de perfil. Para acomodar todos os usuários, deve haver as opções adequadas nivel Tenant (ex: "Vereador", "Presidente da Câmara" e "Equipe Administrativa/Staff").

Feedback Visual: Ao clicar em um card de perfil, ele deve receber um destaque visual claro (mudança de cor de fundo, borda destacada ou ícone de check).

Persistência de Estado: A seleção do card deve ser mantida caso o usuário alterne o foco para os campos de e-mail/CPF ou senha.

Validação de Formulário: O botão Entrar (Submit) deve iniciar desabilitado e só deve ser habilitado quando os campos de credenciais estiverem preenchidos E um perfil estiver selecionado.

2. Autenticação e Regras de Negócio (Backend / API)
   
Autenticação Base: O sistema deve primeiro validar as credenciais (e-mail/CPF e senha) no banco de dados.

Validação de Roles (Autorização): Após confirmar a identidade, a API deve analisar as flags do usuário (is_admin, is_parlamentar, super_admin).

Consistência de Perfil: O sistema deve validar se o perfil selecionado na tela de login condiz com os privilégios reais do usuário.

Exemplo: Se o usuário selecionou "Presidente da Câmara", o backend deve checar se ele possui a flag/role de Presidente. Caso seja apenas um is_parlamentar comum, o login deve retornar um erro de "Acesso negado para o perfil selecionado".

Exemplo 2: Se selecionou "Equipe Administrativa" e não for is_admin ou super_admin, bloquear o acesso.

1. Roteamento e Redirecionamento
Redirecionamento Administrativo: Se o usuário for validado como super_admin ou is_admin (e tiver selecionado o card correspondente), redirecionar para o Painel de Administração.

Redirecionamento Parlamentar: Se o usuário for validado como is_parlamentar, redirecionar para a Tela do Parlamentar.

Injeção de Contexto: Caso o usuário seja o Presidente da Câmara e tenha logado com esse card, o sistema deve carregar as permissões estendidas (ex: menus de pautas, votações master, etc.) na interface do parlamentar. Se ele for o Presidente, mas escolheu logar apenas com o card de "Vereador", carregar apenas as permissões padrão de vereador.