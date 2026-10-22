# WEBSITES — REGISTRO CENTRAL

Fonte única para localizar os projetos web sob gestão da organização GitHub **MINDMORPHIA**.

| Projeto | Status | Código / registro no GitHub | Página / domínio conhecido |
|---|---|---|---|
| MINDMORPHIA | Institucional e portal comercial implementado; e-mail e pagamento aguardam ativação | `MINDMORPHIA/mindmorphia-site` → `/index.html`, `/commerce`, `/api`, `/lib` | `https://mindmorphia-site.vercel.app`; ver `docs/IMPLEMENTACAO_PORTAL.md` |
| SAUVID Assessoria | Operação 3.0 — gestão persistente, contas individuais e documentos privados; endereço Vercel mantido | `MINDMORPHIA/mindmorphia-site` → `/projects/sauvid-assessoria-preview/` | `https://sauvid-assessoria.vercel.app` |
| Grupo SV | Snapshot GitHub criado | `MINDMORPHIA/mindmorphia-site` → `/sites/grupo-sv/` | `grupo-sauvid.juniorsauder.chatgpt.site`; domínio institucional: `gruposauvid.com.br` |
| Amanda Carrijo / Dra. Amanda Pelo Mundo | Snapshot GitHub criado | `MINDMORPHIA/mindmorphia-site` → `/sites/amanda-carrijo/` | `amanda-carrijo-viagens.juniorsauder.chatgpt.site`; domínio definido: `www.draamandapelomundo.com.br` |
| Gabriella Sauder | Código ativo | `MINDMORPHIA/gabriella-sauder-site` | repositório próprio |
| VONCETS | Publicado na Vercel; catálogo para consulta e gestão implementados; ativação comercial pendente | `MINDMORPHIA/voncets-site` → `main` | https://voncets-site.vercel.app/ |
| Max Tattoo | Projeto registrado | `MINDMORPHIA/mindmorphia-site` → `/projects/max-tattoo/` | ainda sem página publicada consolidada |
| Bruna Monteiro — demo influencer | Projeto registrado | `MINDMORPHIA/mindmorphia-site` → `/projects/bruna-monteiro-demo/` | demonstrativo; ainda sem fonte publicada canônica |

## Convenção daqui para frente

1. O GitHub da organização **MINDMORPHIA** é a referência central de código e histórico.
2. Site novo não deve ficar somente em construtor, hospedagem, domínio ou conversa.
3. Antes de considerar uma página finalizada, confirmar neste registro o local do código.
4. Projetos com repositório próprio permanecem separados; projetos sem repositório próprio ficam em `/sites/` ou `/projects/`.
5. Se o projeto ganhar repositório próprio, atualizar este arquivo e manter apenas um local canônico de edição.
6. Evitar duplicar versões editáveis do mesmo site em caminhos diferentes.

Atualizado em 12/10/2026.

## VONCETS — atualização verificada em 22/10/2026

- Fonte canônica: `MINDMORPHIA/voncets-site`, branch `main`, commit `2ea5b068cc65b577696c1cf8b65fa402165577e5`.
- Produção: https://voncets-site.vercel.app/ — endereço técnico, HTTPS e acesso público verificados. Domínio próprio VONCETS ainda não confirmado.
- Deployment Vercel: `dpl_5pwQHtRqNUctwRov2f8c8Avp1pHs`, READY, commit acima; URL imutável https://voncets-site-qndi6nz2j-juniorsauder-7118.vercel.app/ . Não foi homologado um preview independente; previews não recebem o armazenamento produtivo.
- Projeto: `prj_kB8adDMw7tnrdUG9Sk3WLdyrowwd`, equipe `juniorsauder-7118`. Stack HTML/CSS/ES modules, API Node 24, Blob privado OIDC somente produção, SimpleWebAuthn, Mercado Pago e Resend preparados no código.
- Operação: GRUPO SV / titular; manutenção técnica MINDMORPHIA. Administração própria em /gestao, com catálogo, fotos, variantes, preços, estoque, rascunho, arquivamento, lixeira e histórico. Frete e cupons em formulários.
- Catálogo inicial: 25 configurações e 24 fotos Samsung. Condições de 25/08/2026 preservadas como referência interna; vitrine consultiva sem presumir preço ou estoque atual.
- Mercado Pago: aplicação VONCETS Loja Oficial `8577475468011567`, Checkout Pro, token/assinatura na Vercel e webhook exclusivo. Configuração não comprova checkout homologado ou cobrança real.
- Pendentes: acesso pessoal do titular e passkeys físicas, e-mail transacional homologado, recebedor/checkout, domínio final, preço/estoque/frete e condições comerciais vigentes. Vendas continuam bloqueadas.
- Grupo SV: versão 85 publicada, commit `f260cc2be2ba229a310eaf6c9d7702a4ec7bbba7`; cards e https://www.gruposauvid.com.br/marcas/voncets direcionam ao site Vercel e preservam Instagram.
- Higgsfield https://voncets-oficial.higgsfield.app/ preservada; fonte histórica recuperada em `legacy/higgsfield`, sem segundo código canônico.
- Continuidade: README e docs/GUIA_DE_GESTAO.md, STATUS_E_PENDENCIAS.md, TESTES_ACEITE.md e DEPLOY_E_ROLLBACK.md no repositório VONCETS. Segredos não integram este registro.
