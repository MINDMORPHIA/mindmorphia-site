# MindMorphia — implantação de checkout (branch de desenvolvimento)

Status: **protótipo não publicado / sem cobrança habilitada**.

## Implementado nesta branch
- `contratar.html`: página independente de apresentação dos seis planos e preços de lançamento.
- `catalogo-planos.js`: catálogo centralizado para a interface. **A fonte segura de preços deverá existir também no backend**. Este arquivo público não é uma fonte confiável para criar cobranças.
- Formulário/checkout não foram ativados: a interface informa que estão em preparação, para não induzir pagamento fictício.

## Próximos passos obrigatórios para pagamentos reais
1. Definir persistência transacional de pedidos no servidor e plataforma de banco de dados.
2. Criar API autenticada para criação de pedidos, validação de preços exclusivamente no servidor e criação de preferência Mercado Pago usando credencial de ambiente.
3. Implementar webhook com verificação de origem/assinatura, consulta ao Mercado Pago para confirmar o estado, idempotência e reconciliação.
4. Implementar termos, política de privacidade, formulário com minimização de dados, email transacional e canal WhatsApp.
5. Criar painel administrativo com autenticação e controle de acesso.
6. Testar sandbox e cenários de fraude/estorno/falha. Aprovar antes de merge ou deploy.
7. Confirmar que o projeto Vercel está conectado ao repositório e que **esta branch não recebe deploy de produção**.

**Segurança:** não commitar chaves de API, dados de clientes ou credenciais Mercado Pago. Nunca considerar o retorno do browser prova de pagamento.

Planos: Impacto R$ 997; Autoridade R$ 1.997; Magnitude R$ 2.400; Google AI Pro 18 meses R$ 249,90; Canva Pro 12 meses R$ 99,90 e 24 meses R$ 129,90.

As informações sobre fornecedor foram validadas internamente pelo responsável da marca; o repositório não contém comprovante de contrato direto com Google ou Canva.
