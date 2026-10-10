# Auditoria geral MINDMORPHIA · 9 de outubro de 2026

As correções encontradas nesta rodada foram implementadas e publicadas em https://mindmorphia-site.vercel.app. A falha mais grave impedia registrar uma compra no navegador, apesar de os testes anteriores do servidor passarem. Foi reproduzida, corrigida e novamente validada pelo navegador em ambiente local, com dados fictícios. A auditoria não equivale à homologação de uma transação financeira real, à certificação jurídica ou à comprovação de licenciamento dos fornecedores.

## Jornada em oito etapas

| Etapa | Saúde após correções | Evidência e limite |
| --- | --- | --- |
| 1. Descoberta na página inicial | Corrigida | Ofertas visíveis na página; categorias Websites, Assinaturas digitais e Mídia sob demanda. Links antigos que levavam a âncora inexistente foram corrigidos. |
| 2. Catálogo, artes e condições | Verificada em produção | Oito ofertas, artes originais preservadas, preços e períodos distintos. Canva 12 meses R$ 99,90; 24 meses R$ 129,90; Google AI Pro 18 meses R$ 249,90. Sites Impacto R$ 997, Autoridade R$ 1.997, Magnitude R$ 2.497. Mídia R$ 49,90 e R$ 99,90. |
| 3. Navegação e apresentação | Melhorada | Cabeçalho fixo recuperado durante rolagem; foco visível, salto ao conteúdo, contraste dos campos e movimento reduzido. Navegação e pesquisa examinadas em 390 e 320 px, sem transbordamento horizontal observado. Não houve certificação WCAG nem inspeção em todos os celulares. |
| 4. Sacola e contratação | Falha crítica corrigida | O erro checkoutKey is not defined foi eliminado. Registro de novo pedido fictício confirmado no navegador. Repetições recuperam o mesmo pedido; alterações de oferta invalidam o resumo anterior. Observações opcionais nos acessos digitais, briefing obrigatório nos serviços pertinentes. |
| 5. Pagamento | Configurado; homologação real pendente | Configuração produtiva de pagamento, e-mail e armazenamento indicada pela API pública. Testes cobrem validação do recebedor, assinatura, reconciliação e propriedade. Não foi efetuada compra real nesta rodada. |
| 6. Área do cliente | Melhorada; fluxo local validado | Pedido registrado aparece com saldo e status; resumo privado pode ser baixado. O resumo conserva a oferta contratada e não é nota fiscal. Isolamento de clientes e permissões são testados no servidor. |
| 7. Contato e gestão | Corrigida e validada localmente | Formulário registra solicitação no próprio sistema, gera protocolo e permite acompanhamento administrativo. Contato sintético visto e atualizado na gestão. E-mail fica em fila com controle de reenvio; aceite do provedor não prova entrega na caixa postal. |
| 8. Ativação, entrega e pós-venda | Regras implementadas; operação real pendente | Após pagamento confirmado, contato em até 24 horas para enviar link e confirmar ativação. Prazo acompanha projeto e alerta de atendimento. Mídia: até cinco dias úteis ou prazo combinado com Mind Marketing. Link legítimo e ativação efetiva ainda dependem do operador e fornecedor. |

## Achados prioritários e execução

1. **Crítico, resolvido:** registro de compra quebrado no navegador. Chave de tentativa agora calculada antes do envio, sem guardar briefing em texto puro nessa chave. Captura 03 demonstra o erro; captura 14 demonstra novo pedido aguardando pagamento, com R$ 0,00 pago, em ambiente fictício local.
2. **Alto, resolvido:** alteração de preço ou escopo entre resumo e registro. Resumo recebe impressão digital; servidor recalcula atomicamente e recusa oferta diferente. Pedido já registrado com a mesma chave é recuperado antes de reavaliar o catálogo. Teste cobre alteração e repetição.
3. **Alto, resolvido:** formulário externo não criava registro gerenciável. Substituído por contato interno com protocolo, validação, limite de envio, proteção contra robôs e acesso por permissão. Não cria conta ou pedido para o visitante.
4. **Alto, resolvido:** mensagens internas de erro podiam expor detalhes. Erros inesperados agora são genéricos; validação continua com mensagens úteis. Entrada de requisição limitada a 3 MB; identificadores e atributos administrativos tratados com restrição/escape.
5. **Médio, resolvido:** cabeçalho desaparecia na rolagem; produto escondido por navegação inadequada; falha com armazenamento do navegador bloqueado. Corrigidos, com categorias explícitas e funcionamento defensivo.
6. **Médio, resolvido:** equipe com permissão de projetos não conseguia editar projeto existente sem permissão de clientes. Ajustada edição, preservando limites de criação e arquivos.
7. **Médio, resolvido:** páginas comerciais tinham indexação prejudicada. Metadados específicos, canonical, sitemap e robots publicados. Acesso, cliente, gestão e checkout continuam fora da indexação. Isso não garante posição nos buscadores.
8. **Comercial, atualizado:** identificação pública GRUPO SV · MINDMORPHIA, CNPJ 44.776.233/0001-56 e Avenida Alpes · Goiânia/GO · CEP 74325-200. Dados fornecidos pelo titular; validação do dígito do CNPJ não é consulta cadastral. Número/complemento não fornecidos. Rodapé SAUVID clicável para https://www.gruposauvid.com.br.

A identificação do fornecedor, as condições claras e os canais de atendimento foram considerados com base no [Decreto 7.962/2013](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm). Os dados empresariais publicados vieram do titular. Esta revisão não declara conformidade jurídica integral.

## Verificação técnica e publicação

- 37 testes aprovados; build e git diff --check aprovados.
- Auditoria pnpm audit --prod sem avisos de vulnerabilidade no instantâneo desta rodada; não substitui auditoria integral de segurança.
- Commits funcionais desta rodada: 862bb06, 98f8ecc, ac41667, e4e716e e a783836.
- Publicação a783836 observada READY na Vercel: mindmorphia-site-o5tunoy1g-juniorsauder-7118.vercel.app. Destino oficial: mindmorphia-site.vercel.app.
- Termos comerciais MM-COM-2026-10-09-v3; prazo digital preservado também na oferta e no pedido. Projetos antigos não foram preenchidos retroativamente com prazo que não estava registrado.
- Navegador público usado para examinar catálogo, acesso e rodapé. Contatos e pedidos de teste permaneceram em memória no servidor local, sem cobrança ou cadastro fictício na produção.

## Pendências concretas

**Antes de considerar o fluxo financeiro homologado:** realizar compra controlada pelo titular, conferir pagamento no Mercado Pago, webhook assinado, atualização do pedido, e-mail recebido e envio/ativação legítima do link. A execução financeira final requer o titular. Não foi usada evidência de e-mail histórico como comprovação nova desta auditoria.

**Segurança externa:** renovar as credenciais de teste e Client Secret do Mercado Pago indicadas no relatório anterior, que apareceram em saída de ferramenta. Elas não foram incluídas no código, Git ou documentos. Segredos produtivos não foram impressos nesta rodada. A situação atual da rotação não foi revalidada.

**Dados comerciais:** completar número/complemento do endereço, se existentes; confirmar garantia adicional e condições do fornecedor sem inventar promessas. Formalizar emissão fiscal, retenção de dados e operação de reembolso. A venda pela página não prova autorização/licenciamento de terceiros.

**Operação antes de ampliar volume:** automatizar reprocessamento de notificações, comprovar entrega de e-mail por evento autenticado, definir backup e testar restauração; migrar armazenamento agregado para banco adequado ao crescimento. Armazenamento atual tem limite agregado e contatos limitados a 2.000. Não houve ensaio de carga, Core Web Vitals, restauração ou operação de todos os provedores móveis.

**Domínio:** endereço vercel.app verificado. Pendências históricas de domínio próprio e recebimento de e-mail não foram tratadas como resolvidas sem nova evidência.

## Documentos ativos e evidências

Documento Mestre v4.4 e Aperfeiçoamentos e Modelos v1.4, datados de 09/10/2026, atualizados em DOCX e PDF na pasta ENTREGAS/PORTAL_MINDMORPHIA_2026-10-09. Versões anteriores preservadas como histórico. Arquivos locais não foram importados automaticamente para as Fontes do projeto ChatGPT.

Capturas desta execução em ENTREGAS/AUDITORIA_GERAL_2026-10-09:

| Captura | Uso |
| --- | --- |
| 01-vitrine-antes.png | Página inicial e descoberta antes da correção do cabeçalho. |
| 02-contato-antes.png | Formulário anterior. |
| 03-checkout-falha-local.png | Falha crítica reproduzida com dados fictícios. |
| 05-contato-protocolo-local.png | Protocolo local após envio. |
| 06-contato-gestao-local.png | Contato sintético atualizado na gestão local. |
| 10-mobile-chrome-publicado.png | Navegação e pesquisa em 390 px. |
| 11-mobile-320-publicado.png | Navegação e pesquisa em 320 px; captura parcialmente rolada. |
| 12-identificacao-publicada.png | CNPJ, endereço e rodapé em produção. |
| 13-acesso-publicado.png | Tela de acesso pública. |
| 14-pedido-novo-local.png | Novo pedido fictício, sem pagamento. |
| 15-assinaturas-publicadas.png | Artes originais e preços em produção. |

Capturas 04, 07 e 08 não são evidência final: 04 enquadra pedido pré-carregado fictício, e 07/08 sofreram recorte inadequado da emulação IAB. Captura 09 descartada por mostrar a superfície incorreta. Todas as capturas usadas foram inspecionadas visualmente. A cobertura e os limites acima fazem parte da entrega.
