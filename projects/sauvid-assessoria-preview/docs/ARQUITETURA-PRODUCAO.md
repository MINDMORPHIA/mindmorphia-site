# Arquitetura alvo — SAUVID Assessoria

Atualização: 12/10/2026.

## Objetivo

Transformar a interface de homologação em uma aplicação de produção sem importar dados pessoais para o código-fonte ou para o GitHub.

## Camadas

1. **Site público**
   - conteúdo institucional;
   - formulário inicial;
   - FAQ e educação;
   - sem exposição de base interna.

2. **API server-side**
   - validação de entrada;
   - autenticação e autorização;
   - criação de sessão por cookie HttpOnly;
   - acesso ao banco somente no servidor;
   - registro de auditoria;
   - emissão de respostas sem dados internos desnecessários.

3. **Identidade**
   - produção: autenticação por provedor/fluxo dedicado;
   - documento identifica cadastro, mas não é credencial;
   - recuperação de acesso independente do CPF;
   - sessão curta, revogável e com proteção contra enumeração de usuários.

4. **Banco PostgreSQL**
   - clientes;
   - vínculos de acesso;
   - atendimentos;
   - status por órgão;
   - eventos públicos e internos;
   - arquivos/evidências;
   - leads;
   - log de auditoria append-only.

5. **Armazenamento de arquivos**
   - bucket privado;
   - nomes internos não previsíveis;
   - URL assinada com expiração;
   - hash SHA-256 para integridade;
   - separação entre documento visível ao cliente e evidência interna.

## Dados pessoais

- CPF nunca em texto puro no GitHub, logs, URL ou HTML.
- Para busca determinística:
  - `cpf_lookup_hash = HMAC_SHA256(normalized_cpf, CPF_LOOKUP_SECRET)`.
- Para recuperação autorizada:
  - `cpf_ciphertext` criptografado no backend usando segredo/chave externa ao banco.
- Apenas os 4 últimos dígitos podem ser usados como máscara de exibição.
- Observações internas não são retornadas para endpoints de cliente.

## Regra de autorização

Cada consulta de cliente deve resolver:

`session.auth_subject -> app_users.id -> client_access.client_id -> recurso`

Nunca confiar em `client_id`, CPF ou e-mail enviado pelo navegador sem validar esse vínculo no servidor.

## Status por órgão

SPC, Serasa, Boa Vista e Protestos/Cartórios são registros independentes.

Uma alteração deve:

1. atualizar somente o órgão alvo;
2. registrar evento;
3. preservar estado anterior no histórico;
4. registrar ator e horário;
5. permitir visibilidade pública ou apenas interna;
6. não usar “confirmado” sem evidência/revisão correspondente.

## Auditoria

Operações mínimas auditáveis:

- login e falha de login;
- recuperação de acesso;
- consulta de cadastro por operador;
- criação/alteração de cliente;
- mudança de etapa;
- mudança de status por órgão;
- publicação/ocultação de evento;
- upload/download de evidência;
- concessão/revogação de acesso;
- alteração de permissão administrativa.

## Próxima decisão de infraestrutura

Antes de gravar dados reais é necessário escolher/provisionar:

- banco PostgreSQL;
- provedor de autenticação;
- armazenamento privado de arquivos;
- segredo de HMAC/criptografia em cofre de ambiente;
- canal oficial do formulário.

Até essas dependências existirem, a API de homologação continua exclusivamente com fixtures e sem persistência.
