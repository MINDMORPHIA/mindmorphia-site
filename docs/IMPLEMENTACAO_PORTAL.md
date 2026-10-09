# Portal comercial MINDMORPHIA

Execução iniciada em 8 de outubro e verificada em 9 de outubro de 2026. Fonte normativa: Documento Mestre MINDMORPHIA v4.2, modelos v1.2 e complemento comercial com Magnitude por R$ 2.497. Autorização: desenvolvimento e publicação do site informado pelo responsável.

## Resultado implementado

O site institucional preserva sua composição e ganha entradas para Websites, Área do Cliente e Gestão. O catálogo apresenta Impacto R$ 997, Autoridade R$ 1.997 e Magnitude R$ 2.497. Planos incluem a oferta documentada de hospedagem e manutenção por 12 meses. Google AI Pro e Canva Pro permanecem fora da contratação por dependerem de comprovação operacional.

Sacola com quantidades, remoção, continuidade de compra, identificação autenticada, reaproveitamento do cadastro, cupom e resumo. O servidor calcula valores em centavos e salva a versão das condições. Contratação integral ou entrada mínima de 50%; saldo posterior disponível no pedido. Não há frete para os serviços digitais. Não foram copiados os descontos de primeira compra exclusivos da VIDSAU.

Autenticação por e-mail e senha protegida com scrypt. Cadastro requer ativação por e-mail. Recuperação e convite usam tokens de uma hora, uso único e somente hash no armazenamento. Sessão em cookie HttpOnly, SameSite Strict, Secure em HTTPS, validade de oito horas. Recuperação invalida sessões anteriores. O proprietário é ativado somente após comprovação do e-mail definido nas variáveis protegidas.

Área do Cliente: projetos, etapas, histórico, pedidos, pagamentos, solicitações, mensagens, anexos, propostas e decisão expressa. Notas internas não são incluídas na resposta ao cliente. Anexos PDF, PNG, JPEG, WebP e TXT com limite de 2 MB e validação de conteúdo. Imagens têm prévia autenticada; PDF e texto têm download autenticado.

Gestão: cadastro por convite, clientes e histórico, projetos e etapas, análise de solicitações, classificação de cobertura, responsáveis, prioridade, prazo, mensagens internas e públicas, propostas, catálogo, cupons, comunicados no portal, equipe com permissões por recurso, suspensão, auditoria e backup privado. Preferência de tela clara ou escura persistida no navegador.

## Infraestrutura

Código canônico: https://github.com/MINDMORPHIA/mindmorphia-site. Checkout local dentro do workspace, separado do projeto Gabriella. Projeto Vercel: mindmorphia-site, prj_bq0FhIdANxclSyc6AqWWLgPaet8N, equipe juniorsauder-7118. Node 24, build estático e função Node para API. O build conserva os projetos previamente centralizados em sites e projects.

Vercel Blob privado na região gru1: mindmorphia-portal-private. Registros em documento JSON privado, com escrita condicional por ETag, leitura sem cache e tentativas limitadas diante de conflito. Arquivos separados e privados. O agregado operacional tem limite de 8 MB. Esta arquitetura atende uma operação inicial de volume pequeno; crescimento exige migração planejada para banco relacional antes de atingir o limite. O teste de concorrência local valida o contrato de mutação; a concorrência distribuída do Blob depende do SDK e da escrita condicional oficial.

Credencial Blob limitada ao ambiente production. Preview e desenvolvimento não recebem acesso aos dados de produção. O servidor local tem dados separados em .local-data, fora do Git. Não há usuários de demonstração ou senhas padrão publicados. Backups são gerados sob demanda pelo proprietário, no mesmo armazenamento privado. Não há rotina automática de backup ou restauração automática.

## Pagamento

Integração preparada para Mercado Pago Checkout Pro, com preferência no servidor, limite de três parcelas, retorno ao portal e webhook assinado. O portal não coleta dados de cartão. As condições efetivas de parcelamento e juros precisam ser confirmadas na conta do provedor; esta entrega não certifica três parcelas sem juros.

Pagamento confirmado exige consulta ao provedor e validação de conta recebedora, BRL, valor, referência e modo real. Retorno do navegador não libera o serviço. Eventos repetidos e anteriores são ignorados. Entrada confirmada cria projeto; cancelamento antes de pagamento impede nova tentativa. Pagamento tardio em pedido cancelado fica em análise e não gera entrega automática. Cancelamento, estorno e contestação têm estados distintos. Não existe botão administrativo para declarar pagamento sem confirmação do provedor. Estornos financeiros são realizados no provedor e conciliados no portal.

## Validação

18 testes automatizados passaram: cálculo, cupom, entrada, catálogo inválido, cookie seguro, CSRF, logout, isolamento de clientes e arquivos, notas internas, permissões e suspensão, aceite com versão de proposta, idempotência e preço preservado, assinatura e titularidade do pagamento, repetição de eventos, cancelamento com pagamento tardio, recuperação e revogação, formato e tamanho de anexo, comunicados, concorrência, ativação do proprietário, reconciliação de pagamento alheio, configuração inicial e convites sem e-mail. Pagamentos e e-mail nestes testes são simulações em memória, com contas fictícias.

Catálogo e sacola foram conferidos no navegador em largura de celular. O build na Vercel passou. A API publicada devolveu catálogo correto e storage=true. Estado de integrações na primeira publicação preparada: payment=false e email=false. Não foi realizada transação financeira real, envio de ativação real ou login oficial do proprietário. A validação visual autenticada e os fluxos reais continuam condicionados à ativação de e-mail e pagamentos.

## Ativação pendente

Resend: os termos foram aceitos na página da Vercel, e existe a instalação icfg_53lb1B62SnOuO21VjEVlzWh9. Nenhum recurso de envio foi provisionado: o serviço exige domínio remetente próprio, região e plano. A CLI exibiu somente opções pagas para o recurso; nenhuma assinatura paga foi contratada. Confirmar domínio, conta e eventual custo antes de prosseguir. O endereço mindmorphia-site.vercel.app é o destino do site, mas o usuário não controla o DNS de vercel.app para autenticar remetente. Configurar RESEND_API_KEY e EMAIL_FROM em production, sem enviar chaves pelo chat. Cadastro público e recuperação automática por e-mail permanecem bloqueados até a configuração; convites individuais já operam pela gestão.

Mercado Pago: configurar a conta autorizada para MINDMORPHIA e MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET e MERCADOPAGO_COLLECTOR_ID em production. Webhook https://mindmorphia-site.vercel.app/api/webhooks/mercadopago, evento payment. Confirmar meios disponíveis, parcelamento e custos. Não reutilizar segredos ou conta de outra marca sem autorização específica. Testar pagamento, retorno, webhook, consulta e eventual estorno no ambiente apropriado.

Primeiro acesso independente de e-mail: link temporário de configuração aberto diretamente no navegador do responsável. OWNER_SETUP_HASH guarda somente hash; OWNER_SETUP_EXPIRES define validade de uma hora. O responsável preenche nome e senha pessoal. A API bloqueia o link após existir proprietário ativo. Em seguida, entrar com o e-mail autorizado e a senha definida. Nenhuma senha é entregue ou registrada por esta execução. Quando e-mail estiver ativo, o proprietário também poderá usar Recuperar acesso.

A gestão emite convites de cliente ou equipe e links de recuperação com validade de uma hora. O link aparece somente na resposta autenticada da gestão e no seu painel. A equipe sem permissão de clientes não pode emiti-lo, e somente o proprietário pode recuperar acessos de equipe. Confirmar a identidade do titular por canal de atendimento antes de compartilhar recuperação. O cadastro público não emite links sem comprovação de e-mail.

Correção de publicação: o catch-all inicial da Vercel não atendia caminhos aninhados. A função api/router.mjs e a reescrita /api/:path* corrigem o despacho. Conferido no endereço oficial: /api/auth/me retorna user=null para visitante, /api/dashboard retorna HTTP 401 e /api/auth/login com dados fictícios não cadastrados retorna HTTP 401. O último teste criou somente um contador de tentativas no armazenamento privado, sem conta fictícia publicada.

A CLI exibiu a credencial técnica de proteção no modo debug ao interpretar o parâmetro curl -d. A credencial criada pela CLI foi imediatamente revogada pela API oficial. Não repetir esse comando com flags ambíguas nem registrar credenciais em evidências. Nenhuma credencial consta deste relatório ou do Git.

MCP adicional: endpoint https://mcp.vercel.com adicionado ao config.toml global. A primeira autorização OAuth expirou. A nova autorização foi concluída com sucesso após aprovação explícita do responsável para leitura e escrita nos projetos e equipes acessíveis. O endpoint compartilhado está conectado no Codex. O plugin Vercel já instalado e seu conector continuam operacionais. CLI 63.1.0 autenticada como juniorsauder-7118.

## Retomada e publicação

Executar node --test tests/*.test.mjs e node scripts/build.mjs. Enviar o commit ao GitHub. Publicar com Vercel no projeto vinculado, conferir /api/status e /api/catalog e testar as páginas oficiais. Conferir os estados de e-mail e pagamento antes de liberar operação comercial. A publicação dos arquivos não substitui essas ativações.

Rollback institucional: deployment anterior dpl_4xsq7F26Y8xSE5fst5jyGT1JA1fA, commit 086343cfb2331c143085ecb4cf4c137d0814818e. Promover a versão anterior reverte a interface; não apaga dados privados. Manter o armazenamento, backups e segredos. Antes de restaurar registros, preservar snapshot atual e validar compatibilidade da versão.


Validação da persistência em produção: a leitura Blob retornava ETag fraco, incompatível com a escrita condicional. A carga passou a consultar o ETag canônico dos metadados e conferir sua correspondência com o conteúdo lido. Conflitos usam a classe de erro do SDK e repetem a leitura antes de tentar novamente. Dois testes de regressão reproduzem versão fraca e leitura desatualizada. A atualização real passou na URL oficial. Código da correção: 9c9a52ae8c2befee0484af1cd4a021b6e8ed9b92.

Conta oficial de proprietário ativada pelo responsável e confirmada diretamente no armazenamento privado em 09/10/2026. A primeira configuração está bloqueada para novas tentativas. Esta comprovação certifica a criação da conta; não substitui o teste visual de todos os módulos autenticados nem a operação de e-mail e pagamento.

## Decisões de integração confirmadas em 09/10/2026

O responsável autorizou a mesma conta Mercado Pago do grupo para receber os pagamentos da MINDMORPHIA. Informou que há uma divisão chamada loja Mind Marketing. A existência e o tipo dessa divisão ainda precisam ser verificados no painel autenticado. Preferir aplicação própria MINDMORPHIA para organizar a integração; não afirmar saldo separado, vinculação à loja ou segregação financeira antes de comprovar os recursos da conta.

As preferências do checkout identificam a marca no título, statement_descriptor, additional_info e metadata, com pedido e tentativa; external_reference permanece igual ao ID do pedido para conciliação. O descritor efetivamente exibido depende do meio e do provedor. Nenhuma alteração foi feita na configuração global da conta. Um teste adicional confere os dados enviados ao adaptador: 19 testes passaram, com pagamento ainda simulado.

O responsável delegou a escolha técnica do e-mail. Domínio remetente escolhido: mail.mindmorphia.com.br, condicionado à autenticação DNS e verificação Resend. Remetente proposto: MINDMORPHIA <acesso@mail.mindmorphia.com.br>. Priorizar plano gratuito. As páginas Mercado Pago, Resend e Registro.br solicitaram login no Chrome; a etapa externa aguarda autenticação pessoal do titular. Nenhuma chave foi obtida ou configurada nesta etapa.

Referência oficial de preferência: https://www.mercadopago.com.br/developers/en/reference/online-payments/checkout-pro-preferences/create-preference/post.

## Ativação externa conferida em 09/10/2026

O Registro.br confirmou mindmorphia.com.br temporariamente publicado, com pagamento pendente e DNS bloqueado. Não foi realizado pagamento de domínio. A escolha delegada de e-mail passou para mindmorphia.gruposauvid.com.br, no domínio do grupo já ativo. Foram adicionados DKIM TXT e dois CNAME exclusivos do subdomínio. Os três registros de envio foram verificados no Resend. O domínio tem status geral parcial porque recebimento está habilitado, com MX pendente; envio está verificado.

RESEND_API_KEY foi criada com permissão Sending access restrita a esse domínio, após autorização específica, e salva como Secret somente em production. EMAIL_FROM define MINDMORPHIA <acesso@mindmorphia.gruposauvid.com.br>. A republicação dpl_EyusWy41vxSB2jok5JE4YfAZrcT4 confirmou email=true no endereço oficial. Um pedido de recuperação pelo portal ao e-mail do proprietário resultou no evento entregue registrado no painel Resend, mensagem 01a12057-65bf-7591-b498-14219e698253. Não existe webhook Resend de acompanhamento no portal. O teste inicial tinha assunto Ativar acesso para proprietário já ativo; a seleção de finalidade foi corrigida para recuperação, preservando a ativação inicial.

Aplicação Mercado Pago 8386986675603094 renomeada MINDMORPHIA Websites, com endereço oficial e setor Serviços de TI. O titular concluiu autenticação adicional, CAPTCHA, aceite e ativação produtiva. Webhook salvo somente para eventos payment na URL oficial. O titular salvou MERCADOPAGO_ACCESS_TOKEN como Secret em production. A assinatura exige transferência pessoal no navegador porque a automação recebe valor mascarado. Nenhum Client Secret é necessário para Checkout Pro nesta implementação.

Consulta autenticada /users/me fornece a conta recebedora quando MERCADOPAGO_COLLECTOR_ID não é definido, com validação de ID e bloqueio de test_user. O collector_id da preferência e do pagamento deve corresponder. Se o identificador fixo for definido, continua sendo usado como restrição explícita. 21 testes e build passaram após estas mudanças, com novos casos para preferência de outra conta, conta de teste e assunto da recuperação do proprietário.

Incidente de leitura do painel: uma credencial de teste e o Client Secret da aplicação apareceram em resultados técnicos antes de a ocultação integral dos campos ser aplicada. Os valores não foram adicionados ao código, documentos ou Git. A renovação desses dois itens deve ser concluída pelo titular no painel; não reutilizar os valores expostos. O Access Token produtivo e a assinatura do webhook não foram impressos.
