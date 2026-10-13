# SAUVID Assessoria — backend de homologação

Implementado em 12/10/2026.

## APIs

- `GET /api/health`: integridade e versão do serviço.
- `POST /api/demo-login`: valida documento + código de homologação no servidor e cria cookie HttpOnly assinado.
- `GET /api/demo-session`: exige sessão válida e retorna exclusivamente dados fictícios.
- `POST /api/logout`: encerra a sessão demonstrativa.
- `POST /api/lead`: valida o formulário no servidor; sem webhook configurado não persiste nem encaminha dados.

## Variáveis

- `SAUVID_SESSION_SECRET`: segredo de assinatura da sessão; obrigatório e não versionado.
- `SAUVID_DEMO_CODE`: código de homologação.
- `SAUVID_LEAD_WEBHOOK_URL`: opcional. Enquanto ausente, o formulário opera em modo de homologação sem persistência.

## Limites desta etapa

Isto melhora a separação cliente/servidor e impede que a Área do Cliente seja aberta apenas pelo JavaScript da página. Ainda não substitui autenticação de produção, banco, recuperação de acesso, trilha de auditoria ou isolamento de dados reais por usuário.
