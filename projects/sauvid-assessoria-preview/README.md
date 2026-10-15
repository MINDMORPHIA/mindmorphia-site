# SAUVID Assessoria — versão operacional 3.0

Atualizada em 12/10/2026. Código canônico nesta pasta, repositório MINDMORPHIA/mindmorphia-site.

- Site: https://sauvid-assessoria.vercel.app
- Gestão e Área do Cliente: https://sauvid-assessoria.vercel.app/gestao.html
- Domínio solicitado: www.sauvid.ass.com.br (adiado; manter endereço Vercel).
- Vercel: sauvid-assessoria / prj_U3RuoOTlguk1IrC7Y8EaN6gV3XOU.

## Implementado

Solicitações persistentes na gestão com protocolo, filtro, situação, anotação interna e conversão em atendimento. Login real por convite, senhas individuais e sessões revogáveis. Isolamento por cliente aplicado no servidor e PostgreSQL RLS. Etapa, próxima ação, quatro órgãos independentes e histórico preservado. Documentos privados com autorização e evidência revisada específica por órgão. Acessos de cliente, operador, administrador e auditor. Recuperação assistida e suspensão. Auditoria sem alteração pelo runtime, limites de requisição e proteção de origem.

Banco Neon exclusivo e Blob privado em São Paulo. CPF e relatos protegidos por criptografia e índices HMAC. Dados de clientes e importações ficam exclusivamente na base privada, fora do GitHub. Demonstrações anteriores desativadas. Três ativos corrompidos recuperados das referências fornecidas, mantendo a identidade aprovada.

## Validação

13 testes de regras PostgreSQL passaram. Teste E2E em bancos temporários com dados sintéticos confirmou ativação, login, envio, caixa de entrada, conversão, isolamento entre contas, status independente, notas internas, documento privado, recuperação, suspensão, logout, CSRF e snapshot/restauração. Bancos de QA removidos após o teste.

Ver docs/OPERACAO.md e RELEASE_VERIFICATION.json para instruções, evidências, implantação e limites.

## Fechamento externo

Conta administrativa ativada pelo responsável. Endereço Vercel mantido por decisão de 12/10/2026; domínio próprio adiado. SEO do domínio fica bloqueado por noindex até essa validação. Recuperação por e-mail não está habilitada: a gestão gera links individuais após confirmação de identidade. Backup agendado/retencão operacional depende da configuração no provedor; o teste de restauração executado usa dados sintéticos.
