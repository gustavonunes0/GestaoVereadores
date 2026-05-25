# Desenho do Banco de Dados (ERD) — Módulo Legislativo

Este documento contém o diagrama visual das tabelas, atributos e relacionamentos do **módulo legislativo** do IntGest (SIGL), inferidos de `engenharia_reversa_intgest.md` e alinhados ao fluxo de Atividade Legislativa descrito em `fluxos_de_trabalho.md`.

A implementação em código está em `backend/prisma/schema.prisma` (PostgreSQL). Para subir API + banco + frontend placeholder, use o `docker-compose.yml` na raiz do repositório.

Foram excluídos fluxos de backoffice e cidadão: frota, e-SIC, ouvidoria, licitações/contratos, diárias, atos administrativos, portal institucional/transparência e demais telas que não compõem o core legislativo (parlamentares, comissões, matérias, sessões, normas e relatórios correlatos).

```mermaid
erDiagram

    COMISSAO {
        string mensagem
    }
    FRENTE {
        string mensagem
    }
    MATERIA {
        int_fk tipo
        string ementa
        int numero
        int numero_protocolo
        int_fk ano
        int_fk tematica
        int_fk o
        int_fk tipo_listagem
        datetime data_apresentacao_0
        datetime data_apresentacao_1
        datetime data_publicacao_0
        datetime data_publicacao_1
        int_fk autoria__autor__tipo
        int_fk autoria__autor
        int_fk autoria__primeiro_autor
        int_fk relatoria__parlamentar_id
        int_fk local_origem_externa
        int_fk tramitacao__unidade_tramitacao_destino
        int_fk tramitacao__status
        int_fk em_tramitacao
        string salvar
        string mensagem
    }
    MATERIA }o--|| AUTORIA__AUTOR__TIPO : "autoria__autor__tipo"
    MATERIA }o--|| TIPO_LISTAGEM : "tipo_listagem"
    MATERIA }o--|| AUTORIA__AUTOR : "autoria__autor"
    MATERIA }o--|| TRAMITACAO__STATUS : "tramitacao__status"
    MATERIA }o--|| ANO : "ano"
    MATERIA }o--|| TRAMITACAO__UNIDADE_TRAMITACAO_DESTINO : "tramitacao__unidade_tramitacao_destino"
    MATERIA }o--|| TIPO : "tipo"
    MATERIA }o--|| AUTORIA__PRIMEIRO_AUTOR : "autoria__primeiro_autor"
    MATERIA }o--|| TEMATICA : "tematica"
    MATERIA }o--|| LOCAL_ORIGEM_EXTERNA : "local_origem_externa"
    MATERIA }o--|| EM_TRAMITACAO : "em_tramitacao"
    MATERIA }o--|| RELATORIA__PARLAMENTAR : "relatoria__parlamentar_id"
    MATERIA }o--|| O : "o"
    MATERIA_PESQUISAR {
        int_fk tipo
        string ementa
        int numero
        int numero_protocolo
        int_fk ano
        int_fk tematica
        int_fk o
        int_fk tipo_listagem
        datetime data_apresentacao_0
        datetime data_apresentacao_1
        datetime data_publicacao_0
        datetime data_publicacao_1
        int_fk autoria__autor__tipo
        int_fk autoria__autor
        int_fk autoria__primeiro_autor
        int_fk relatoria__parlamentar_id
        int_fk local_origem_externa
        int_fk tramitacao__unidade_tramitacao_destino
        int_fk tramitacao__status
        int_fk em_tramitacao
        string salvar
        string mensagem
    }
    MATERIA_PESQUISAR }o--|| AUTORIA__PRIMEIRO_AUTOR : "autoria__primeiro_autor"
    MATERIA_PESQUISAR }o--|| TIPO_LISTAGEM : "tipo_listagem"
    MATERIA_PESQUISAR }o--|| RELATORIA__PARLAMENTAR : "relatoria__parlamentar_id"
    MATERIA_PESQUISAR }o--|| O : "o"
    MATERIA_PESQUISAR }o--|| ANO : "ano"
    MATERIA_PESQUISAR }o--|| TRAMITACAO__UNIDADE_TRAMITACAO_DESTINO : "tramitacao__unidade_tramitacao_destino"
    MATERIA_PESQUISAR }o--|| TEMATICA : "tematica"
    MATERIA_PESQUISAR }o--|| TRAMITACAO__STATUS : "tramitacao__status"
    MATERIA_PESQUISAR }o--|| EM_TRAMITACAO : "em_tramitacao"
    MATERIA_PESQUISAR }o--|| AUTORIA__AUTOR__TIPO : "autoria__autor__tipo"
    MATERIA_PESQUISAR }o--|| AUTORIA__AUTOR : "autoria__autor"
    MATERIA_PESQUISAR }o--|| TIPO : "tipo"
    MATERIA_PESQUISAR }o--|| LOCAL_ORIGEM_EXTERNA : "local_origem_externa"
    MESADIRETORA {
        int_fk legislatura
        int_fk sessao
        int_fk composicao_mesa
        string mensagem
    }
    MESADIRETORA }o--|| COMPOSICAO_MESA : "composicao_mesa"
    MESADIRETORA }o--|| SESSAO : "sessao"
    MESADIRETORA }o--|| LEGISLATURA : "legislatura"
    MFA {
        string username
        string password
        boolean remember
    }
    NORMA_PESQUISAR {
        int_fk tipo
        string numero
        int_fk ano
        datetime data_0
        datetime data_1
        datetime data_publicacao_0
        datetime data_publicacao_1
        int_fk esfera_federacao
        string ementa
        int_fk identificador
        string salvar
        string mensagem
    }
    NORMA_PESQUISAR }o--|| ANO : "ano"
    NORMA_PESQUISAR }o--|| TIPO : "tipo"
    NORMA_PESQUISAR }o--|| ESFERA_FEDERACAO : "esfera_federacao"
    NORMA_PESQUISAR }o--|| IDENTIFICADOR : "identificador"
    OBJETIVOSDESENVOLVIMENTOSUSTENTAVEL {
        string mensagem
    }
    PARLAMENTAR {
        int_fk pk
        string mensagem
    }
    PARLAMENTAR }o--|| PK : "pk"
    RELATORIOS_ATIVIDADELEGISLATIVACOMPLETO {
        int_fk legislatura
        int_fk sessao_legislativa
        datetime data_inicio_0
        datetime data_inicio_1
        string salvar
        string print
        string mensagem
    }
    RELATORIOS_ATIVIDADELEGISLATIVACOMPLETO }o--|| SESSAO_LEGISLATIVA : "sessao_legislativa"
    RELATORIOS_ATIVIDADELEGISLATIVACOMPLETO }o--|| LEGISLATURA : "legislatura"
    RELATORIOS_ATIVIDADELEGISLATIVAGERAL {
        int_fk legislatura
        datetime data_apresentacao_0
        datetime data_apresentacao_1
        string print
        int_fk tipo_autor
        int_fk autor
        string salvar
        string mensagem
    }
    RELATORIOS_ATIVIDADELEGISLATIVAGERAL }o--|| AUTOR : "autor"
    RELATORIOS_ATIVIDADELEGISLATIVAGERAL }o--|| TIPO_AUTOR : "tipo_autor"
    RELATORIOS_ATIVIDADELEGISLATIVAGERAL }o--|| LEGISLATURA : "legislatura"
    RELATORIOS_PRESENCAANALITICA {
        int_fk legislatura
        int_fk sessao_legislativa
        string print
        int_fk tipo_sessao
        int_fk sessao_plenaria
        datetime data_inicio_0
        datetime data_inicio_1
        string salvar
        string mensagem
    }
    RELATORIOS_PRESENCAANALITICA }o--|| TIPO_SESSAO : "tipo_sessao"
    RELATORIOS_PRESENCAANALITICA }o--|| SESSAO_LEGISLATIVA : "sessao_legislativa"
    RELATORIOS_PRESENCAANALITICA }o--|| SESSAO_PLENARIA : "sessao_plenaria"
    RELATORIOS_PRESENCAANALITICA }o--|| LEGISLATURA : "legislatura"
    RELATORIOS_PRESENCAGERAL {
        int_fk legislatura
        int_fk sessao_legislativa
        string print
        int_fk tipo_sessao
        string salvar
        string mensagem
    }
    RELATORIOS_PRESENCAGERAL }o--|| LEGISLATURA : "legislatura"
    RELATORIOS_PRESENCAGERAL }o--|| TIPO_SESSAO : "tipo_sessao"
    RELATORIOS_PRESENCAGERAL }o--|| SESSAO_LEGISLATIVA : "sessao_legislativa"
    SESSAO {
        int_fk data_inicio__year
        int_fk data_inicio__month
        int_fk data_inicio__day
        int_fk tipo
        int_fk situacao
        string salvar
        string mensagem
    }
    SESSAO }o--|| TIPO : "tipo"
    SESSAO }o--|| DATA_INICIO__DAY : "data_inicio__day"
    SESSAO }o--|| SITUACAO : "situacao"
    SESSAO }o--|| DATA_INICIO__YEAR : "data_inicio__year"
    SESSAO }o--|| DATA_INICIO__MONTH : "data_inicio__month"
    SESSAO_186 {
        string mensagem
    }
    SESSAO_187 {
        string mensagem
    }
    SESSAO_188 {
        string mensagem
    }
    SESSAO_PESQUISAR {
        int_fk data_inicio__year
        int_fk data_inicio__month
        int_fk data_inicio__day
        int_fk tipo
        int_fk situacao
        string salvar
        string mensagem
    }
    SESSAO_PESQUISAR }o--|| TIPO : "tipo"
    SESSAO_PESQUISAR }o--|| DATA_INICIO__YEAR : "data_inicio__year"
    SESSAO_PESQUISAR }o--|| DATA_INICIO__MONTH : "data_inicio__month"
    SESSAO_PESQUISAR }o--|| SITUACAO : "situacao"
    SESSAO_PESQUISAR }o--|| DATA_INICIO__DAY : "data_inicio__day"
```

## Entidades mantidas

| Entidade | Papel no fluxo legislativo |
|---|---|
| `PARLAMENTAR` | Cadastro de vereadores |
| `COMISSAO` | Comissões permanentes/temporárias |
| `FRENTE` | Frentes parlamentares |
| `MESADIRETORA` | Composição da mesa diretora |
| `MATERIA` / `MATERIA_PESQUISAR` | Proposições e tramitação |
| `SESSAO` / `SESSAO_PESQUISAR` / `SESSAO_186`–`188` | Sessões plenárias e pauta |
| `NORMA_PESQUISAR` | Normas jurídicas publicadas |
| `OBJETIVOSDESENVOLVIMENTOSUSTENTAVEL` | Vínculo ODS à atividade legislativa |
| `RELATORIOS_*` | Relatórios de atividade e presença |
| `MFA` | Autenticação do SIGL |

## Entidades removidas (fora do escopo legislativo)

Administrativo geral, agenda, portal institucional/transparência, arquivos do portal, comunicados oficiais, configurações de usuário, contratos, diárias, e-SIC, FAQ, frota, licitações (incl. comissão de licitação), ouvidoria, atos administrativos, portal social, serviços e sistema de IA.
