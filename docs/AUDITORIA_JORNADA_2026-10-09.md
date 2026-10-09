# Auditoria da jornada MINDMORPHIA · 09/10/2026

Estado: revisão parcial com correções publicadas. Não equivale a aceite de toda a operação comercial. Fonte: site oficial atual, navegador, aplicação local isolada com dados fictícios, testes anteriores e documentos do acervo.

## Percurso e evidências

1. **Descoberta em produção.** Oito ofertas na página inicial: três websites, três assinaturas e duas opções de mídia. Categorias separadas, com links para /websites, /assinaturas e /midia. As seis imagens principais da vitrine carregaram. Nove arquivos de arte tiveram SHA-256 idêntico às fontes do usuário. Nenhuma arte foi retocada. A imagem antiga com Magnitude R$ 3.497 foi excluída da publicação; preço vigente R$ 2.497.
2. **Navegação e estética.** Menu cortava a última ação em largura intermediária. Corrigido com quebra de linha. O conteúdo orbital excedia a largura no celular; contido, e faixa de palavras passa a quebrar linhas. Na largura simulada de 390 px, a página inicial passou a informar largura 390 e scrollWidth 390. Em 1280 px, scrollWidth 1265, sem excesso horizontal. A captura gráfica de 1280 apresentou composição duplicada da ferramenta e foi rejeitada como prova visual; não indica duplicação de conteúdo no DOM. A evidência visual válida usa a largura normal do painel e 390 px. Símbolo oficial nos cartões de mídia. Artes originais preservadas.
3. **Busca e categorias.** Na página de assinaturas, três ofertas visíveis. Busca Canva retornou duas; termo inexistente exibiu mensagem de nenhum produto. A limpeza restaurou as ofertas. Alternância claro/escuro funcionou e foi restaurada ao escuro. A página de mídia mostrou as duas opções esperadas.
4. **Sacola e checkout em produção.** Adição da mídia R$ 49,90 confirmou o item e mostrou subtotal/total corretos, sem frete e prazo de até cinco dias úteis ou combinado com Mind Marketing. Visitante precisa entrar ou criar acesso. Nenhum aceite de contratação, pedido ou cobrança foi criado pelo agente neste teste. Checkout passou a usar MINDMORPHIA / Contratação em todas as categorias. A sacola pessoal do Chrome não foi alterada neste percurso.
5. **Área do cliente em teste local.** Login com usuário fictício; projeto pago simulado mostra link HTTPS de ativação disponibilizado pela gestão, instruções e histórico. Pedido mostra R$ 99,90 confirmado e saldo zero. Solicitações, documentos, comunicados e cadastro abriram; estados vazios mostram orientações. Cliente criou solicitação fictícia; gestão respondeu; cliente viu a resposta no seu espaço. Não houve e-mail externo, pagamento ou ativação real de licença neste percurso.
6. **Gestão e limites de autorização.** Gestão local mostrou oito ofertas, histórico de entrega e atendimento, e zero avisos pendentes após envio simulado. A operação real anterior conferiu a conta recebedora pelo painel. A implementação exige pagamento integral para liberar link digital, autorização de pedidos/projetos e isolamento por usuário. 26 testes automatizados passaram na etapa comercial anterior; a revisão visual atual passou build e git diff --check. Não foram executados novamente os testes de servidor, pois a alteração atual ficou em apresentação e documentação.
7. **Rodapé, integrações e fontes.** Rodapé GRUPO SV · SAUVID aponta para https://www.gruposauvid.com.br e usa abertura segura em nova aba. /api/status e /api/catalog públicos consultados nesta revisão: payment=true, email=true, storage=true, oito ofertas e condições MM-COM-2026-10-09-v2. Esses indicadores confirmam configuração, não cobrança real. Mestre v4.3 e Modelos v1.3 atualizados, exportados a PDF, texto conferido e páginas alteradas inspecionadas visualmente.

## Evidências visuais aceitas

- 02-vitrine-menu-corrigido.png: navegação normal íntegra e categorias na página inicial.
- 06-assinaturas-mobile-390.png: categoria própria em largura móvel, menu e busca legíveis.
- 11-rodape-sauvid-publicado.png: SAUVID visível com link do grupo.

As capturas 01, 03, 04, 05, 07, 08, 09 e 10 foram preparatórias, incompletas ou limitadas pela captura/rolagem. Não sustentam aceite visual integral nem substituem as evidências aceitas acima.

## Pendências para aceite integral

- Compra real no Mercado Pago: checkout do provedor, retorno, webhook, confirmação, e-mail de compra e conciliação de um pagamento legítimo. O titular deve realizar o pagamento; nenhuma autorização de gasto específico foi inferida da autorização de desenvolvimento.
- Renovação de credenciais de teste e Client Secret que apareceram em resultados técnicos anteriores. Os valores não constam no Git, documentos ou evidências. Access Token produtivo e assinatura não foram impressos. Painel Mercado Pago atualmente informa limite de tentativas de validação. Titular deve renovar pelo fluxo oficial quando liberado; se houver alteração de segredo usado pelo site, atualizar a variável protegida correspondente e republicar.
- Entrega real de Canva/Google exige que a gestão obtenha links legítimos, respeitando disponibilidade do fornecedor. Não há integração automática de licenças. Após obtê-los, usar o projeto para enviar e notificar; não solicitar senhas de clientes.
- A revisão não percorreu exaustivamente todas as operações de equipe, propostas, upload/download, cancelamento/estorno, todos os navegadores ou estados de rede lenta/erro. Isolamento e validações possuem cobertura automatizada, mas a inspeção visual desses caminhos deve continuar.
- mindmorphia.com.br possui pendência externa no Registro.br no último painel conferido. O site segue disponível em vercel.app. Remetente ativo usa subdomínio do grupo; recebimento por MX e webhook de status Resend não estão implementados.

## Publicação

Código da vitrine: fdd1e6d. Correção SAUVID/menu: 47464a9, READY dpl_2Kpvja6dtAp4ouB4u8ea4SiaAMwC. Correção móvel/checkout: 52d2221, implantação mindmorphia-site-q830zcmn4-juniorsauder-7118.vercel.app confirmada Ready pela CLI. Comportamento conferido também em https://mindmorphia-site.vercel.app. Relatório e mestres preservam os limites de comprovação acima.
