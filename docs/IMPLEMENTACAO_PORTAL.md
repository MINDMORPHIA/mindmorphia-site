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

14 testes automatizados passaram: cálculo, cupom, entrada, catálogo inválido, cookie seguro, CSRF, logout, isolamento de clientes e arquivos, notas internas, permissões e suspensão, aceite com versão de proposta, idempotência e preço preservado, assinatura e titularidade do pagamento, repetição de eventos, cancelamento com pagamento tardio, recuperação e revogação, formato e tamanho de anexo, comunicados, concorrência, ativação do proprietário e reconciliação de pagamento alheio. Pagamentos e e-mail nestes testes são simulações em memória, com contas fictícias.

Catálogo e sacola foram conferidos no navegador em largura de celular. O build na Vercel passou. A API publicada devolveu catálogo correto e storage=true. Estado de integrações na primeira publicação preparada: payment=false e email=false. Não foi realizada transação financeira real, envio de ativação real ou login oficial do proprietário. A validação visual autenticada e os fluxos reais continuam condicionados à ativação de e-mail e pagamentos.

## Ativação pendente

Resend: a instalação foi iniciada, mas a Vercel exige aceite dos termos pelo responsável em https://vercel.com/juniorsauder-7118/~/integrations/accept-terms/resend?source=cli. Após aceite, retomar a instalação existente, verificar a conta e domínio remetente e configurar RESEND_API_KEY e EMAIL_FROM em production. A criação de novas credenciais deve ocorrer no serviço, sem envio pelo chat. Cadastro, convite e recuperação permanecem bloqueados com mensagem explícita até a configuração.

Mercado Pago: configurar a conta autorizada para MINDMORPHIA e MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET e MERCADOPAGO_COLLECTOR_ID em production. Webhook https://mindmorphia-site.vercel.app/api/webhooks/mercadopago, evento payment. Confirmar meios disponíveis, parcelamento e custos. Não reutilizar segredos ou conta de outra marca sem autorização específica. Testar pagamento, retorno, webhook, consulta e eventual estorno no ambiente apropriado.

Primeiro acesso: após configurar o e-mail, abrir /acesso, usar Recuperar acesso com o e-mail do proprietário autorizado, receber link e definir senha pessoal no navegador. Nenhuma senha é entregue ou registrada por esta execução.

MCP adicional: endpoint https://mcp.vercel.com adicionado ao config.toml global. A autorização OAuth aberta expirou sem retorno; concluir login quando o responsável estiver presente. O plugin Vercel já instalado e seu conector continuam operacionais. CLI 63.1.0 autenticada como juniorsauder-7118.

## Retomada e publicação

Executar node --test tests/*.test.mjs e node scripts/build.mjs. Enviar o commit ao GitHub. Publicar com Vercel no projeto vinculado, conferir /api/status e /api/catalog e testar as páginas oficiais. Conferir os estados de e-mail e pagamento antes de liberar operação comercial. A publicação dos arquivos não substitui essas ativações.

Rollback institucional: deployment anterior dpl_4xsq7F26Y8xSE5fst5jyGT1JA1fA, commit 086343cfb2331c143085ecb4cf4c137d0814818e. Promover a versão anterior reverte a interface; não apaga dados privados. Manter o armazenamento, backups e segredos. Antes de restaurar registros, preservar snapshot atual e validar compatibilidade da versão.
