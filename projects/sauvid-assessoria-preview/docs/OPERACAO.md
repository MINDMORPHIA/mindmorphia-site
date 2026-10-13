# SAUVID Assessoria — operação 3.0

Data: 12/10/2026. Código canônico: `projects/sauvid-assessoria-preview` no GitHub MINDMORPHIA/mindmorphia-site.

## Gestão

Entre em `/gestao.html` com o acesso individual. Solicitações aparecem na caixa de entrada com protocolo, data e situação. Busca por nome, e-mail, protocolo ou CPF exige acesso à gestão; documento não aparece em URL.

Situações: Nova, Em contato, Em análise, Convertida e Arquivada. Arquivar conserva o registro. A observação interna não aparece para o cliente. Criar atendimento vincula o pedido ao cadastro e inicia SPC, Serasa, Boa Vista e Protestos de forma independente. Repetir a conversão não cria outro atendimento.

O administrador gera convites pessoais para clientes e equipe. O cliente escolhe sua senha, e acessa somente os atendimentos vinculados. Convites expiram em 48 horas e não podem ser reutilizados. Operadores administram pedidos e atualizações; auditores consultam sem gravar; administradores controlam acessos e revisam evidências.

Uma nota interna preserva o status público. Publicar uma atualização altera apenas o órgão escolhido e registra o histórico. Etapas e próximas ações também geram eventos. Histórico publicado não pode ser sobrescrito; correções são novas atualizações.

Documentos aceitos: PDF, PNG e JPEG até 2 MB. A gestão escolhe órgão e visibilidade. O servidor valida o conteúdo, calcula SHA-256 e guarda o arquivo em armazenamento privado. O download consulta o vínculo antes de entregar o arquivo. Uma baixa confirmada exige evidência revisada do mesmo órgão.

## Recuperação e suspensão

A recuperação é assistida: confirmar a identidade do titular antes de gerar um link individual em Acessos. Entregar o link diretamente ao titular. Expiração de uma hora, uso único e encerramento de sessões anteriores. A aplicação não envia mensagens automaticamente. Suspender ou reativar acesso encerra sessões; o servidor verifica a situação ativa em cada requisição.

O adaptador de recuperação por e-mail existe, mas fica desabilitado sem remetente validado e configuração de entrega. Não mostrar sucesso de envio quando o serviço não está ativo.

## Infraestrutura

- Vercel: projeto SAUVID exclusivo, funções na região `gru1`.
- Neon: recurso gratuito `sauvid-assessoria-db`, região São Paulo.
- Blob: armazenamento privado `sauvid-documentos`, região São Paulo.
- Better Auth 1.7.7: sessões persistentes, cookies HttpOnly/SameSite e Secure em produção.
- CPF: índice de busca HMAC e valor AES-256-GCM. Descrição e notas do pedido: AES-256-GCM.
- RLS: papel `sauvid_runtime` com contexto do ator aplicado dentro de transação. Autorização do usuário baseada no vínculo, nunca em informação do navegador.
- Auditoria: alterações atômicas, autor/data e recursos afetados; registro sem UPDATE/DELETE pelo runtime.
- Rate limits persistentes: login, ativação, formulário e operações de gestão.
- Nenhum cadastro real foi importado de outras bases.

Segredos ficam nas variáveis da Vercel e na configuração local ignorada. Não executar configuração inicial novamente: trocar chaves sem migração torna dados antigos ilegíveis. Rota pública de cadastro livre não está exposta. Endpoints demonstrativos antigos retornam 410.

## Validação e recuperação técnica

`node scripts/check.cjs` valida JavaScript, assinatura binária das imagens e retirada da demonstração. `node --test tests/operation.test.cjs` testa regras RLS em PostgreSQL local PGlite. `node --env-file=.env.local scripts/e2e.cjs` cria bancos temporários exclusivos de QA, percorre a jornada com dados sintéticos e os remove ao concluir.

O teste de snapshot/restauração recusa bancos de produção. Confirma integridade dos pedidos, órgãos e auditoria após restauração em outro banco sintético. Ele não exporta dados reais nem constitui backup operacional agendado. Retenção e recuperação contínua da produção devem ser configuradas no provedor antes de adotar um SLA; chaves de criptografia precisam ser recuperáveis separadamente do banco.

Rollback de código: promover a implantação anterior na Vercel. A versão anterior era demonstrativa: seu retorno desativa a jornada operacional, mas não apaga os dados gravados. Migrações desta versão são aditivas; não apagar tabelas ou registros para reverter a página.

## Domínio

Decisão vigente em 12/10/2026: manter `https://sauvid-assessoria.vercel.app`. Domínio próprio adiado. O endereço `www.sauvid.ass.com.br` chegou a ser vinculado ao projeto, mas não possui DNS configurado. O endereço depende da zona base `ass.com.br`; não confundir com `sauvidass.com.br`.

Registro recomendado pela Vercel: CNAME `www.sauvid` na zona `ass.com.br`, valor `e9a3cd36b7b4c053.vercel-dns-017.com.`. Validar titularidade/configuração da zona antes de alterar DNS. Nenhum domínio foi comprado.

Enquanto o domínio não resolver com HTTPS, usar `https://sauvid-assessoria.vercel.app` e manter `noindex`. Depois: trocar origem de autenticação, validar cookies/login no domínio, canonical, Open Graph, sitemap e robots. Não retirar noindex antes desse fechamento.
