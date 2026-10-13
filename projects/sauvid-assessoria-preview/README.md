# SAUVID Assessoria — homologação v2.1

Atualizado em **12/10/2026**. Esta é a referência vigente do site SAUVID Assessoria no repositório central MINDMORPHIA.

## Preview publicado

- URL: `https://sauvid-assessoria.vercel.app`
- Projeto Vercel: `sauvid-assessoria`
- Projeto ID: `prj_U3RuoOTlguk1IrC7Y8EaN6gV3XOU`
- Deployment verificado como `READY`: `dpl_FjVtGBS4HQxrG9qMSvzji1uwsHgX`
- Commit de referência do código: `0b075126fed773f8d2cac3340f6277482fd8184e`
- Branch de preview: `sauvid-preview`

O preview permanece com `noindex` e `robots.txt` bloqueando indexação até a definição do domínio e da publicação definitiva.

## Estado atual

- Site institucional: implementado e pronto para revisão em ambiente publicado.
- Narrativa: reabilitação de crédito, regularização cadastral, acompanhamento e diferenciação entre dívida, negativação e score.
- Órgãos: Serasa, SPC Brasil, Boa Vista e Protestos/Cartórios tratados separadamente.
- Jornada: **Entender → Estruturar → Acompanhar → Avançar**.
- Formulário: interface em duas etapas, ainda sem destinatário real conectado.
- Área do Cliente: protótipo de homologação com dados fictícios.
- Administração SAUVID: protótipo de homologação com ações simuladas.
- Segurança de preview: `noindex`, `robots.txt` bloqueando indexação e headers básicos no Vercel.
- Crédito MINDMORPHIA: símbolo oficial + assinatura clicável no rodapé.
- Acessibilidade: foco visível, link “Pular para o conteúdo”, menu mobile com estado ARIA e respeito a redução de movimento.

## Segurança e conteúdo

- Nenhum CPF ou cliente real está embutido no HTML.
- CPF/CNPJ identifica o cadastro, mas não funciona como senha.
- “Baixa confirmada” não deve ser usada sem evidência e revisão.
- Uma atualização em um órgão não altera automaticamente os demais.
- O site não promete quitação de dívida, score específico, concessão de crédito ou aprovação de financiamento.
- Prazos são tratados como estimativas.

## Rotas de homologação

- Página: `/`
- Área do Cliente: `/#acompanhar`
- Painel administrativo demonstrativo: `/#admin-demo`
- Privacidade: `/#privacidade`
- Termos: `/#termos`

## Próxima camada

Para produção definitiva ainda devem ser conectados: autenticação real, banco privado, isolamento por cliente, persistência, armazenamento de evidências/arquivos, trilha de auditoria, recuperação de acesso, canal oficial do formulário, políticas definitivas, domínio e SEO de produção.

O preview não deve ser tratado como portal autenticado real até esses itens serem implementados e testados.
