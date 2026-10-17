# SAUVID Assessoria — revisão de aparência e entrega

Data: 17/10/2026, America/Sao_Paulo. Versão 3.3.1.

Repositório: MINDMORPHIA/mindmorphia-site, projects/sauvid-assessoria-preview.
Base conferida com a produção: a957d9998fa43d92fa7f2ac27edbfd6483d0e55b.
Rollback: deployment dpl_H1wPuHH6xp4hmEkoYEofatEZxaik, versão 3.3.0.
Destino: projeto Vercel sauvid-assessoria, prj_U3RuoOTlguk1IrC7Y8EaN6gV3XOU, equipe team_2H4EhZRJmSFKHDYDqAlnhUVz.

## Verificações realizadas

| Item | Resultado e evidência |
| --- | --- |
| Tema claro e escuro públicos | APROVADO em prévia local: navegação, cartões, formulário, privacidade e rodapé; marca e imagens preservadas. |
| Tema inicial e persistência | APROVADO em navegador: sistema inicialmente escuro; escolha clara persistiu no recarregamento e ao entrar em gestao.html; alternância escura reaplicada ao formulário. |
| Foco e contraste | APROVADO nos controles inspecionados; bordas, foco e campos usam variantes legíveis. Não equivale a auditoria integral WCAG. |
| Cabeçalho e âncoras | APROVADO: celular 390 px, cabeçalho em y=0; âncora Serviços em y=84.54 após menu fechado, abaixo do cabeçalho de 68.8 px; logo por Enter retornou scrollY=0. |
| Menu móvel | APROVADO: abre, fecha ao navegar e fecha com Escape devolvendo foco ao botão. |
| Responsividade | APROVADO: sem overflow horizontal em 320, 390 e 1280 px no site; 390 px na entrada da gestão. |
| Movimento reduzido | APROVADO: CSS existente e regra compartilhada respeitam prefers-reduced-motion; âncoras exercitadas com a preferência emulada. |
| Recuperação e entrada | APROVADO visualmente: formulário de recuperação abre; entrada por senha e botão digital permanecem. Nenhum envio de recuperação realizado. |
| Áreas autenticadas | NÃO EXECUTADO visualmente com conta real nesta revisão; estilos cobrem os componentes existentes, sem alterar lógica de autorização. |
| Autorização, documentos e digital | APROVADO nos 32 testes automatizados existentes, com dados sintéticos; 0 falhas. Não foram feitas migrações ou escritas em cadastros de produção. |
| Build | NÃO APLICÁVEL: HTML/CSS/JS estáticos com funções Node Vercel; validação de sintaxe e suíte do projeto executadas. |
| Domínio próprio e HTTPS | REPROVADO: www.sauvid.ass.com.br retorna ENOTFOUND e HTTPS não abre. Cadastro Vercel verificado não comprova DNS válido. |
| URL independente disponível | APROVADO antes da alteração: https://sauvid-assessoria.vercel.app/api/health respondeu 200 e versão 3.3.0 via fetch sem cookies. Publicação nova será registrada em RELEASE_APPEARANCE_2026-10-17.json após validação. |
| SEO e compartilhamento | APROVADO no código: canonical e og:url apontam para a URL Vercel atualmente utilizável; imagem absoluta adicionada. noindex e robots preservados até definição definitiva do domínio. |
| Dependência ChatGPT pública | APROVADO no código do projeto: nenhuma referência de prévia ChatGPT; hospedagem Vercel e autenticação própria mantidas. |
| Crédito MINDMORPHIA | APROVADO: símbolo, texto e link existentes preservados nas duas páginas. |
| Link Grupo SV | APROVADO: endereço https://www.gruposauvid.com.br/ respondeu 200; texto do rodapé passa a ser link sublinhado com foco de teclado. |
| Dispositivo externo físico | NÃO EXECUTADO; navegador real com viewport emulado e requisições sem cookies usados. |
| Titularidade de domínio e acessos contratuais | NÃO EXECUTADO; não foram transferidos ativos, alterados acessos ou expostos segredos. |

## Checklist recorrente

Em futuras entregas: verificar ambos os temas em todas as rotas e estados alterados; preferência do sistema e persistência; foco e contraste; navegação e menu em celular; âncoras sem sobreposição; canonical/OG/assets; acesso sem sessão do desenvolvedor; crédito institucional; GitHub, deployment e rollback; domínio/DNS/HTTPS; autorização e dados preservados. Classificar itens não exercitados como NÃO EXECUTADO.

O domínio próprio permanece pendente. A publicação Vercel não deve ser descrita como entrega integral em domínio próprio. A pendência requer configuração autorizada do DNS do domínio; nenhum domínio alternativo foi comprado ou inventado.
