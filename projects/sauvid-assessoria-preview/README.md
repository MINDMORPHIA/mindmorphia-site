# SAUVID Assessoria — versão operacional 3.3

Atualizada em 16/10/2026. Código canônico nesta pasta, repositório MINDMORPHIA/mindmorphia-site.

- Site: https://sauvid-assessoria.vercel.app
- Gestão e Área do Cliente: https://sauvid-assessoria.vercel.app/gestao.html
- Domínio solicitado: www.sauvid.ass.com.br (adiado; manter endereço Vercel).
- Vercel: sauvid-assessoria / prj_U3RuoOTlguk1IrC7Y8EaN6gV3XOU.

## Implementado

Solicitações persistentes na gestão com protocolo, filtro, situação, anotação interna e conversão em atendimento. Login real por convite, senhas individuais e sessões revogáveis. Isolamento por cliente aplicado no servidor e PostgreSQL RLS. Etapa, próxima ação, quatro órgãos independentes e histórico preservado. Documentos privados com autorização e evidência revisada específica por órgão. Acessos de cliente, operador, administrador e auditor. Recuperação assistida e suspensão. Auditoria sem alteração pelo runtime, limites de requisição e proteção de origem.

Banco Neon exclusivo e Blob privado em São Paulo. CPF e relatos protegidos por criptografia e índices HMAC. Dados de clientes e importações ficam exclusivamente na base privada, fora do GitHub. Demonstrações anteriores desativadas. Três ativos corrompidos recuperados das referências fornecidas, mantendo a identidade aprovada.

## Validação

32 testes de regras e segurança passaram. Teste E2E em bancos temporários com dados sintéticos confirmou ativação, login, envio, caixa de entrada, conversão, isolamento entre contas, status independente, notas internas, documento privado, recuperação, suspensão, logout, CSRF e snapshot/restauração. Bancos de QA removidos após o teste.

Ver docs/OPERACAO.md e RELEASE_VERIFICATION.json para instruções, evidências, implantação e limites.

## Fechamento externo

Conta administrativa ativada pelo responsável. Endereço Vercel mantido por decisão de 12/10/2026; domínio próprio adiado. SEO do domínio fica bloqueado por noindex até essa validação. Recuperação por e-mail configurada via Resend; a gestão também gera links individuais após confirmação de identidade. Backup agendado/retencão operacional depende da configuração no provedor; o teste de restauração executado usa dados sintéticos.

## Comunicações

Mensagens, comunicados e avisos individuais pela gestão, com rascunhos, revisão, autorização do administrador, envio Resend e confirmação de entrega por webhook assinado. Ver `docs/COMUNICACOES.md`. A ativação não dispara rascunhos ou filas anteriores automaticamente.

## Acesso por digital

Chaves de acesso do administrador em Digital e segurança, compatíveis com Windows Hello e Android. Cadastro confirmado pessoalmente em cada aparelho. Ver `docs/ACESSO_DIGITAL.md`.

Envio Resend verificado em produção em 16/10/2026: teste sem dados de clientes entregue ao e-mail administrativo e evento assinado recebido com HTTP 200.


## Aparência, navegação e entrega — 17/10/2026

Versão 3.3.1: `appearance.js` aplica a preferência do sistema antes da pintura e persiste a escolha local entre site e gestão. `appearance.css` cobre as superfícies públicas e os componentes existentes do portal. Cabeçalhos sticky em ambas as páginas, offsets medidos e menu compacto com Escape e retorno por teclado. Grupo SV no rodapé aponta para https://www.gruposauvid.com.br/.

Consulte `docs/ACEITE_TEMAS_CABECALHO_2026-10-17.md` antes de declarar entrega definitiva. Não declarar domínio próprio concluído enquanto o DNS não resolver.
