# Comunicações SAUVID

A gestão tem uma aba Comunicações para preparar mensagens, comunicados e atualizações. Operador e administrador podem salvar rascunhos; somente o administrador autoriza e inicia o envio. Auditor consulta o histórico. Clientes não acessam as listas de destinatários ou o conteúdo da gestão.

Escolha os clientes (até 200 por comunicação), escreva assunto e texto, salve e revise o rascunho. A autorização congela os e-mails conferidos. O botão Enviar e-mails na fila inicia pequenos lotes; mantenha a tela aberta. Pode pausar entre lotes e retomar somente os itens ainda na fila. Mudanças de contato após a revisão exigem nova conferência. Endereços repetidos no mesmo lote recebem apenas uma mensagem.

Nos atendimentos, Preparar atualização por e-mail abre um rascunho individual com aviso para consultar a área protegida. Notas internas, CPFs e documentos não são copiados automaticamente. Nenhum envio ocorre apenas por alterar um status de órgão.

Cada cliente recebe uma mensagem individual pelo Resend, com a marca SAUVID, assinatura e link da área do cliente. Remetente: `SAUVID Assessoria <sauvid@mindmorphia.gruposauvid.com.br>`. Respostas: `sauvid.ass@gmail.com`. Os cadastros sem e-mail válido precisam ser completados em Pendências cadastrais.

Rascunhos e destinatários são persistidos no banco privado. O conteúdo e os endereços congelados são criptografados. Toda tentativa é registrada antes da chamada externa, e a chave de idempotência é exclusiva por destinatário. Timeout e resultados sem confirmação nunca retornam automaticamente à fila. Confira o Resend antes de criar uma nova comunicação para esses itens.

Aceita pelo serviço significa que a API retornou um identificador. Entrega confirmada significa confirmação ao servidor do destinatário por evento assinado do Resend; não comprova leitura nem colocação na caixa de entrada. Eventos repetidos, atrasados e de outras mensagens são ignorados. Reclamações de spam permanecem visíveis.

## Configuração de produção

Aplicar `db/004_communications.sql` com o migrador. Configurar somente na produção: `RESEND_API_KEY` (Sending access restrito ao domínio institucional), `SAUVID_EMAIL_FROM` (remetente acima), `SAUVID_EMAILS_ENABLED=true` e `RESEND_WEBHOOK_SECRET`.

Webhook: `https://sauvid-assessoria.vercel.app/api/email-events`, eventos `email.sent`, `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, `email.suppressed`. O corpo original e os cabeçalhos Svix são verificados com tolerância de cinco minutos. Nenhuma chave ampla de leitura do Resend é necessária. Webhooks só atualizam mensagens já conhecidas pelo ID do provedor.

Não disparar rascunhos ou filas antigas automaticamente ao ativar a configuração. O botão de teste envia somente ao e-mail de resposta SAUVID, com texto fixo sem dados de clientes e registro na auditoria. Fazer apenas um teste controlado previamente autorizado pelo responsável, antes de usar com clientes. Nunca colocar credenciais ou dados reais de destinatários no repositório.
