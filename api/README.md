# Backend de contratação — fase de segurança

Esta fase adiciona *endpoints não operacionais* na pasta api/ para que o repositório possa evoluir na Vercel sem cobrar clientes prematuramente.

- GET api/checkout -> 405.
- POST api/checkout -> 503 por padrão.
- POST api/payment-webhook -> 503 até validação e homologação.
- api/_lib/plans.js é a tabela autoritativa de preços, no servidor (não confiar em preço enviado pelo navegador).

**Próxima fase obrigatória:** armazenamento durável de pedidos com transições atômicas e idempotência; integração HTTP oficial Mercado Pago para preferências/ordens; validação de assinatura webhook conforme documentação atual; consulta confirmatória de pagamento; e-mails, permissões LGPD e testes de ponta a ponta.

Não definir CHECKOUT_ENABLED=true antes de implementar todas as salvaguardas; mesmo ativado, o endpoint atual falha fechado. Sem cobranças reais. Não vincular anúncios ao checkout até homologação.
