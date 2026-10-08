# MindMorphia — implantação de checkout (branch de desenvolvimento)

Status: **protótipo não publicado / sem cobrança habilitada**.

## Implementado nesta branch
- `contratar.html`: página independente de apresentação dos seis planos e preços de lançamento.
- `catalogo-planos.js`: catálogo centralizado para a interface. **A fonte segura de preços existe também no backend** em `api/_lib/plans.js`; o arquivo público nunca deve ser usado como autoridade para criar cobranças.
- Endpoints de backend permanecem bloqueados por padrão com `CHECKOUT_ENABLED=false`.
- Persistência PostgreSQL, reconciliação e validação de webhook estão em preparação e ainda não devem ser tratadas como produção.
- A proteção contra repetição de solicitações usa chave de idempotência e rejeita reutilização da mesma chave com plano/dados divergentes.

## Próximos passos obrigatórios para pagamentos reais
1. Provisionar um banco PostgreSQL **exclusivo de teste** para a MindMorphia e executar a migração somente nesse ambiente.
2. Revisar a integração Mercado Pago antes da homologação. Para integração nova, a documentação atual do Mercado Pago recomenda Checkout Pro via **Orders API**; portanto, não ativar o protótipo baseado em Preferences API sem essa decisão técnica.
3. Configurar credenciais e segredo de webhook apenas nas variáveis de ambiente seguras do ambiente Preview/teste.
4. Validar webhook com assinatura, consulta confirmatória ao Mercado Pago, idempotência, reconciliação e repetição segura de eventos.
5. Implementar termos, política de privacidade, minimização de dados, e-mail transacional e canal WhatsApp.
6. Criar painel administrativo com autenticação e controle de acesso.
7. Testar sandbox/usuários de teste e cenários de duplicidade, falha, pendência, aprovação, cancelamento, estorno e indisponibilidade externa.
8. Somente depois da homologação, revisar e aprovar merge/deploy. Produção deve continuar com checkout desabilitado até autorização expressa.

**Segurança:** não commitar chaves de API, dados de clientes ou credenciais Mercado Pago. Nunca considerar o retorno do navegador prova de pagamento.

Planos oficiais nesta branch: Impacto R$ 997; Autoridade R$ 1.997; Magnitude R$ 3.497; Google AI Pro 18 meses R$ 249,90; Canva Pro 12 meses R$ 99,90 e 24 meses R$ 129,90.

As informações sobre fornecedor foram validadas internamente pelo responsável da marca; o repositório não contém comprovante de contrato direto com Google ou Canva.
