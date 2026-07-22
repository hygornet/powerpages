# Análise e correção de performance/erros em JavaScript — Módulo de Anexos (Power Pages)

## Contexto

O usuário reporta que o carregamento de anexos no site Power Pages está, ora lento, ora gerando erros. Uma exploração completa e read-only do repositório (portal Dataverse-managed, não é Code Site — toda a lógica de anexos vive em `<script>` inline dentro de `web-pages/*/content-pages/*.webpage.copy.html`) confirmou várias causas raiz concretas, não apenas suspeitas. O objetivo deste trabalho é corrigir essas causas no próprio JavaScript/Liquid das páginas de anexos, sem alterar a arquitetura geral do site.

As skills `/power-pages:report-issue` (reporta bugs do plugin ao GitHub da Microsoft) e `/power-platform-architect` (gera arquitetura a partir de requisitos de negócio) não se aplicam a este pedido — o usuário confirmou que quer a análise técnica direta, então este plano trata diretamente da correção do código.

## Causas raiz identificadas (por severidade)

1. **Query FetchXML trazendo `documentbody` (arquivo em base64) para uma LISTA inteira de anexos, sem paginação** — `web-pages/anexos-atividades/content-pages/Anexos-Atividades.pt-BR.webpage.copy.html:24-43`. Isso baixa o binário completo de todo anexo relacionado à atividade no render da página, mesmo que o usuário só queira ver a lista. É a causa mais provável de lentidão severa/timeouts nessa página. As páginas `Anexos.pt-BR` e `Anexos-FSA.pt-BR` já fazem certo (buscam metadados e usam link sob demanda `/_entity/annotation/{id}/fileattachment`) — o padrão correto já existe no próprio projeto, só falta replicá-lo aqui.

2. **FetchXML sem `top`/paginação** em três páginas (`Anexos.pt-BR:93-110`, `Anexos-Atividades.pt-BR:24-43`, `Anexos-FSA.pt-BR:4-21`) — dependem apenas de regra de negócio (10-15 arquivos) para limitar crescimento, mas registros antigos que já passaram do limite continuam sendo renderizados sem corte, e o tempo de render cresce linearmente.

3. **Esperas artificiais fixas (`setTimeout`) em vez de eventos reais de conclusão** — a causa mais direta do "às vezes lento":
   - `Anexos.pt-BR.webpage.copy.html:1118-1120` — `TEMPO_MINIMO_CARREGANDO_MS = 12000` e `TEMPO_ESPERA_UPLOAD_MS = 8000` (8-12s de espera artificial embutida no fluxo, independente do tamanho real do arquivo).
   - `Anexos.pt-BR.webpage.copy.html:1799-1824` (`enviarAnexosManual`) — reporta sucesso ao iframe pai via `setTimeout(...,6000)` fixo, não pelo retorno real do servidor — pode reportar sucesso falso ou parecer travado.
   - Mesmo padrão de 2500/3500ms em `Anexos-Obra.pt-BR:42-72`, `Anexos-Obra-Final.pt-BR:60-92`, `Anexos-Análise-Preliminar.pt-BR:30-60`, `Anexo-Comprovante.pt-BR:38-68`.
   - `Status-Projeto.pt-BR.webpage.copy.html:4585,4713-4714` — após cada postMessage de anexo, recarrega a página inteira (8.109 linhas) via `window.location.reload()`, o que é caro e evitável.

4. **Polling em cascata via `setTimeout` + `MutationObserver` não escopado** — `Anexos.pt-BR:1684-1704` dispara até 9 timers e reescaneia o DOM inteiro do form a cada mutação; `Anexos-Obra-Final:94-111` e `Anexo-Comprovante:70-87` usam `MutationObserver` no `document.body` inteiro (`subtree:true`), reagindo a qualquer mudança no DOM da página, não só do formulário — gera trabalho de CPU desnecessário e picos de lentidão percebida.

5. **Chamadas `$.ajax` sem `timeout` configurado** — nenhuma das chamadas de exclusão de anexo (`Anexos.pt-BR:1419-1474`, duplicado em `Anexos-Atividades` e `Anexos-FSA`) define timeout; se o Cloud Flow travar, a UI pode parecer travada indefinidamente. Erros são reportados via `alert()`.

6. **`console.log/warn/error` esquecidos em produção** em praticamente todas as páginas de anexos (não bloqueante, mas deve ser limpo).

7. **Sem validação client-side de tamanho/tipo antes do submit** — o limite é apenas server-side (`adx_attachfilemaxsize`), então o usuário só descobre que o arquivo foi rejeitado depois do delay de auto-submit de 2.5-3.5s. `Anexos-Documentos-Projetos.basicform.yml` permite até ~81 MB por arquivo, sem restrição de tipo (`adx_attachfileaccept: '*/*'` em todas as forms) — arquivos grandes sem validação prévia agravam a lentidão da página `Anexos.pt-BR`.

8. **Duplicação de código** — a lógica de exclusão de anexo via Cloud Flow (`/_api/cloudflow/v1.0/trigger/274f69ba-...`) está replicada quase identicamente em 3 páginas (~150-300 linhas cada), dificultando manutenção e corrigir bugs de forma consistente.

## Alerts nativos com mensagens não amigáveis (achado adicional)

Contagem exata no repositório: **451 chamadas a `alert()` em 17 páginas** — não é um problema pontual, é um padrão sistêmico de UX em todo o site, não só nas páginas de anexo:

| Página | Nº de `alert()` |
|---|---|
| `Status-Obra.pt-BR.webpage.copy.html` | 99 |
| `Status-Projeto-Aegea.pt-BR.webpage.copy.html` | 81 |
| `Status-Projeto.pt-BR.webpage.copy.html` | 52 |
| `Status.pt-BR.webpage.copy.html` | 34 |
| `Status-projeto.custom_javascript.js` | 30 |
| `Status-obra.custom_javascript.js` | 32 |
| `Status.custom_javascript.js` | 21 |
| `Editar-Solicitacoes-2.pt-BR.webpage.copy.html` | 21 |
| `Minhas-Solicitações...custom_javascript.js` | 20 |
| `Atualizar-Dados-da-Solicitação.pt-BR.webpage.copy.html` | 19 |
| `Editar-Solicitacoes-3.pt-BR.webpage.copy.html` | 17 |
| `Anexos.pt-BR`, `Anexos-Atividades.pt-BR`, `Anexos-FSA.pt-BR` (cada uma) | 4 |
| `Editar-Solicitacoes.pt-BR.webpage.copy.html` | 5 |
| `Status-Projeto-Aegea...custom_javascript.js` | 7 |
| `Account-Register-PageCopy...contentsnippet.html` | 1 |

### Por que isso é um problema de UX (não só volume)

1. **`alert()` nativo do navegador bloqueia a thread principal** — enquanto o alerta está aberto, nada mais na página (nem no iframe pai `Status-*`) responde; em um fluxo com iframes de anexos aninhados isso trava toda a experiência, não só o widget que gerou o erro.
2. **Não pode ser estilizado** — aparece com a UI padrão do navegador (ex.: "aegea-viabilidade.powerappsportals.com diz:"), quebrando a identidade visual do portal e parecendo um erro de sistema, não uma mensagem de produto.
3. **Muitas mensagens expõem detalhes técnicos internos ao usuário final**, em vez de linguagem de negócio — exemplos reais encontrados em `Status-Obra.pt-BR.webpage.copy.html`:
   - `"RecordID não encontrado."`, `"BoletoID não encontrado."`, `"CroquiId não encontrado."`, `"AtividadeId não encontrado."`, `"AnaliseID não encontrado."`, `"DocumentoID não encontrado."` (linhas 5334, 5616, 6635, 5730, 6896, 9312, etc.) — nomes de campos internos/GUIDs vazados na mensagem.
   - `"ID da análise de documentos obrigatórios não encontrado. O campo data-analise-id está vazio."` (linha 10283) — expõe literalmente o nome do atributo HTML (`data-analise-id`) usado internamente no código.
   - `"Modal modalAnexoPreliminar não encontrado."` / `"Iframe iframeAnexoPreliminar não encontrado."` (linhas 10288, 10293) — nomes de variáveis/IDs de elemento DOM expostos crus ao usuário.
   - `"Contexto de segurança não disponível."` (aparece **dezenas de vezes**, ex. linhas 5361, 5626, 5735, 6283, 6640, 6773, 6880, 7127, 7323, 7575, 7782, 8387, 8533, 8663, 8842, 9107, 9319, 9577, 10034, 10171, 10681) — jargão técnico (falha ao carregar `shell.ajaxSafePost`) sem nenhuma orientação prática ao usuário (ex. "recarregue a página").
   - `"Erro ao ler o arquivo selecionado."` / `"Erro ao ler o arquivo."` (linhas 6319, 9390) — diretamente ligado a upload de anexo, sem indicar causa (arquivo corrompido? tipo não suportado? tamanho excedido?) nem próximo passo.
4. **Mensagens genéricas demais em outras** — `"Erro ao executar fluxo."`, `"Erro ao executar flow de cancelamento."` não dizem o que o usuário deve fazer.
5. **Confirmam achado (E) do diagnóstico de performance**: como nenhuma chamada `$.ajax` define `timeout`, quando um Cloud Flow trava, o único feedback ao usuário — minutos depois — é um desses `alert()` genéricos (`"Erro ao excluir o anexo. Verifique o console do navegador."`, em `Anexos-FSA.pt-BR:1003`, que pior ainda instrui o usuário leigo a abrir o DevTools).

### Recomendação a incluir na correção

Substituir os `alert()` por um componente de notificação não bloqueante (toast/banner) já usado ou a criar como padrão único no site, com mensagens reescritas em linguagem de negócio (sem IDs internos, nomes de variável ou nomes de campos HTML), priorizando primeiro as páginas de anexos (`Anexos.pt-BR`, `Anexos-Atividades.pt-BR`, `Anexos-FSA.pt-BR`, e os handlers de anexo dentro de `Status-Obra.pt-BR`/`Status-Projeto.pt-BR`/`Status-Projeto-Aegea.pt-BR`) por serem o foco da queixa do usuário; as páginas `Editar-Solicitacoes-*`, `Atualizar-Dados-da-Solicitação` e `Minhas-Solicitações` podem ser tratadas em uma segunda leva por terem volume menor.

## Detalhamento: o que cada trecho suspeito de lentidão faz (explicação linha a linha)

| # | Arquivo : linhas | O que o código faz | Por que isso causa lentidão/demora percebida |
|---|---|---|---|
| 1 | `Anexos-Atividades.pt-BR.webpage.copy.html:24-43` | O bloco `{% fetchxml anexosAtividade %}` inclui `<attribute name="documentbody" />` na consulta `annotation`. Isso instrui o Dataverse a devolver, para **cada** anexo relacionado à atividade, o conteúdo binário completo do arquivo codificado em base64 (não apenas nome/tamanho/data) — e o Liquid renderiza isso no HTML da página inteira antes mesmo do usuário pedir para baixar algo. | Um PDF de 5 MB vira ~6,7 MB de texto base64 embutido no HTML da página. Com vários anexos na mesma atividade, o servidor precisa ler todos esses binários do banco e o navegador precisa baixar/parsear um HTML muito maior só para exibir uma lista — mesmo que o usuário nunca clique em "baixar". Isso é o oposto do padrão usado em `Anexos.pt-BR` e `Anexos-FSA.pt-BR`, que buscam só metadados e usam um link `/_entity/annotation/{id}/fileattachment` que baixa o arquivo somente quando clicado. |
| 2 | `Anexos.pt-BR:93-110`, `Anexos-Atividades.pt-BR:24-43`, `Anexos-FSA.pt-BR:4-21` | As três consultas FetchXML não têm atributo `top` (limite de linhas) — o Dataverse devolve todas as linhas de `annotation` que casarem com o filtro, sem cortar em N registros. | Se por qualquer motivo (duplicidade histórica, importação, bug anterior) existirem mais anexos do que o esperado pela regra de negócio (10-15), a página cresce e demora proporcionalmente a esse número — sem um teto de segurança no código, só depende de disciplina de dados. |
| 3 | `Anexos.pt-BR:1118-1120` e `1242-1244` | Define duas constantes de espera fixas — `TEMPO_MINIMO_CARREGANDO_MS = 12000` (12s) e `TEMPO_ESPERA_UPLOAD_MS = 8000` (8s) — e usa `setTimeout` com esses valores para manter a tela de "carregando" visível e só então avisar o iframe pai que o upload terminou. | Mesmo que o Power Pages já tenha salvo o arquivo em 1 segundo, o usuário é forçado a esperar até 8-12 segundos de tela de carregamento antes de qualquer feedback — é uma demora **artificial**, imposta pelo código, não pela rede ou pelo servidor. É provavelmente a explicação mais direta do "às vezes é lentidão" relatado. |
| 4 | `Anexos.pt-BR:1799-1824` (função `enviarAnexosManual`) | Simula um clique no botão nativo de submit (`setTimeout(...click(), 500)`) e, **sem checar se o upload realmente terminou**, dispara `finalizarUploadFilho()` via `setTimeout(...,6000)` — ou seja, avisa "concluído" ao iframe pai 6 segundos depois, sempre, tenha o upload demorado 1s ou 20s. | Para arquivos pequenos: espera desnecessária de até 6s. Para arquivos grandes/rede lenta: pode informar "sucesso" ao usuário **antes** do arquivo realmente estar salvo no servidor, gerando a sensação de erro quando o anexo "some" (na verdade ainda está sendo processado ou falhou silenciosamente). |
| 5 | `Anexos.pt-BR:1684-1704` | A cada evento `change` do campo de arquivo, agenda 5 chamadas `setTimeout(controlarBotoesSalvarAnexos, …)` (500/1000/2000/3000/5000ms). Além disso, um `MutationObserver` escutando o formulário inteiro (`childList, subtree, characterData, attributes`) dispara, a cada mutação do DOM, mais 4 `setTimeout` (200/800/1500/2500ms) que rodam a mesma função `controlarBotoesSalvarAnexos()`. Essa função varre o DOM várias vezes com `querySelectorAll`/`innerText` para decidir se o botão "Salvar" deve ficar habilitado. | Selecionar um único arquivo pode dessa forma disparar dezenas de varreduras de DOM em poucos segundos (5 timers do change + N timers do observer × cada mutação subsequente, inclusive causadas pelas próprias varreduras). Isso consome CPU no navegador do usuário e trava a interface durante o pico, especialmente em máquinas/navegadores mais fracos. |
| 6 | `Anexos-Obra.pt-BR:42-72`, `Anexos-Obra-Final.pt-BR:60-92`, `Anexos-Análise-Preliminar.pt-BR:30-60` | Ao detectar arquivo selecionado, aguardam `setTimeout(…, 3500)` e depois mais `setTimeout(…, 2500)` antes de simular o clique de envio automático do formulário. `Anexos-Obra-Final` adiciona ainda um `MutationObserver` em `document.body` (`subtree:true`) para detectar uma classe de sucesso. | Cada upload nessas três páginas carrega, por design, ~6 segundos de espera fixa antes mesmo de começar o envio real — de novo, atraso artificial, não de rede. O `MutationObserver` no `document.body` inteiro (em vez de escopado ao formulário) reage a qualquer mudança em qualquer lugar da página, incluindo animações/relógios/outros widgets, gerando processamento supérfluo. |
| 7 | `Anexo-Comprovante.pt-BR:38-68` | Mesmo padrão de auto-submit, mas com espera menor (500ms) — porém mantém o mesmo `MutationObserver` irrestrito em `document.body`. | Delay artificial menor aqui, mas ainda soma custo de CPU pelo observer amplo em toda navegação da página, não só durante o upload. |
| 8 | `Status-Projeto.pt-BR.webpage.copy.html:4585` (constante `TEMPO_REFRESH_ANEXOS = 3000`) e `4713-4714` (`window.location.reload()`) | Após receber a notificação (`postMessage`) de que um anexo foi enviado/excluído em um dos iframes filhos, esta página — que tem **8.109 linhas e 241 KB** de HTML/JS — aguarda 3s e então recarrega a página inteira do zero. | Recarregar essa página gigante do zero (reprocessar todo o Liquid, todos os `fetchxml`, todo o JS) é uma operação cara em si mesma, disparada a cada upload/exclusão de anexo — é o tipo de operação que, multiplicada por vários anexos enviados em sequência, faz o fluxo inteiro de "status do projeto" parecer lento, mesmo que o upload individual tenha sido rápido. |
| 9 | `$.ajax` de exclusão de anexo — `Anexos.pt-BR:1419-1474`, e cópias quase idênticas em `Anexos-Atividades.pt-BR` (~1032-1080) e `Anexos-FSA.pt-BR` (~960-1010) | Faz um POST para o endpoint do Cloud Flow de exclusão (`/_api/cloudflow/v1.0/trigger/274f69ba-...`) sem configurar a opção `timeout` do jQuery. | Sem timeout definido, se o Cloud Flow (Power Automate) travar, ficar lento ou enfileirado, o navegador fica esperando indefinidamente (até o timeout default do navegador/servidor, que pode ser bem longo) sem dar nenhum feedback ao usuário — a tela simplesmente "não responde" por um tempo indeterminado. |

### Resumo direto para o usuário
- A causa mais provável do **"às vezes é lento"** são os `setTimeout` fixos de 6-12 segundos embutidos no fluxo de upload da página **Anexos.pt-BR** (itens 3 e 4 da tabela) — isso é atraso de código, não de rede.
- A causa mais provável de **lentidão severa/possível erro/timeout** em anexos de **Atividades** é a query que baixa o arquivo inteiro (base64) da lista inteira de anexos de uma vez (item 1).
- A causa da sensação de "trava" ao excluir anexo ou quando o fluxo de aprovação demora é a ausência de `timeout` nas chamadas ao Cloud Flow (item 9) combinada com os `alert()` técnicos que só aparecem bem depois.

## Abordagem de correção

### Arquivos críticos a alterar

- `web-pages/anexos-atividades/content-pages/Anexos-Atividades.pt-BR.webpage.copy.html` — **prioridade máxima**: remover `documentbody` do fetchxml (linhas 24-43), trocar por metadados + link sob-demanda, seguindo o padrão já usado em `Anexos.pt-BR` e `Anexos-FSA.pt-BR`. Adicionar `top` ao fetchxml.
- `web-pages/anexos/content-pages/Anexos.pt-BR.webpage.copy.html` — adicionar `top` ao fetchxml (linhas 93-110); substituir os `setTimeout` fixos de 8-12s (linhas 1118-1120, 1242-1244) e o de 6s em `enviarAnexosManual` (linhas 1799-1824) por detecção real de conclusão (evento de submit/callback do form, ou polling curto com backoff só enquanto necessário); simplificar o polling em cascata (linhas 1684-1704) para reagir a um único evento de mudança de estado em vez de múltiplos timers + MutationObserver irrestrito; adicionar `timeout` e tratamento de erro mais robusto no `$.ajax` de exclusão (linhas 1419-1474); remover `console.log` (1417, 1433).
- `web-pages/anexos-fsa/content-pages/Anexos-FSA.pt-BR.webpage.copy.html` — mesmos ajustes de `top` no fetchxml e limpeza do `$.ajax`/console.log duplicados.
- `web-pages/anexos-obra/content-pages/Anexos-Obra.pt-BR.webpage.copy.html`, `anexos-obra-final`, `anexos-análise-preliminar`, `anexo-comprovante` — trocar o padrão `setTimeout(2500/3500ms)` de auto-submit por um listener no evento `change` do input de arquivo que dispara o submit imediatamente (sem espera arbitrária), e escopar os `MutationObserver` ao formulário/contêiner relevante em vez de `document.body`.
- `web-pages/status-projeto/content-pages/Status-Projeto.pt-BR.webpage.copy.html` — trocar `window.location.reload()` completo (linha 4713-4714) por atualização pontual (recarregar apenas o iframe de anexos ou buscar só os dados novos via fetch/postMessage), evitando re-render de uma página de 8k linhas a cada upload.

- Substituir os `alert()` das páginas de anexos (`Anexos.pt-BR`, `Anexos-Atividades.pt-BR`, `Anexos-FSA.pt-BR`) e dos handlers de anexo em `Status-Obra.pt-BR` / `Status-Projeto.pt-BR` / `Status-Projeto-Aegea.pt-BR` por um componente de notificação não bloqueante, reescrevendo as mensagens para linguagem de negócio (sem IDs internos, nomes de variável/atributo HTML). Ver seção "Alerts nativos com mensagens não amigáveis" acima para o inventário completo e exemplos.

### Padrão a extrair (opcional, mas recomendado para reduzir duplicação)

Criar um content-snippet ou trecho de JS compartilhado para a lógica de exclusão de anexo via Cloud Flow (usada em 3 páginas), reduzindo ~450-900 linhas duplicadas para uma única fonte. Como Power Pages não tem bundling de JS custom entre páginas fora de web-files, a forma prática é: publicar a função como um `web-file` `.js` estático (carregado via `<script src>` em cada página) em vez de inline duplicada.

### Fora de escopo desta correção (apenas observações)

- `table-permissions/` — os escopos (Global/Account) não foram auditados; se a lentidão persistir após os fixes de JS, vale investigar se joins de permissão amplos estão contribuindo (mencionar ao usuário, não mexer agora).
- `Incluir-Comprovante.basicform.yml` está sem `adx_attachfilemaxsize` definido — recomendar definir um limite explícito (config, não JS).

## Verificação

1. Abrir cada página de anexos alterada no navegador (via ambiente de dev/preview do Power Pages) e testar upload de: arquivo pequeno, arquivo grande (próximo do limite), múltiplos arquivos.
2. Confirmar no DevTools (Network) que a página `Anexos-Atividades` não baixa mais `documentbody` na carga inicial da lista — payload da requisição deve cair drasticamente.
3. Medir o tempo entre selecionar arquivo e o "sucesso" ser reportado — deve refletir o tempo real de upload, não os 8-12s fixos anteriores.
4. Confirmar no Console que não há mais `console.log` residual nem erros JS não tratados durante o fluxo de upload/exclusão.
5. Testar exclusão de anexo em cada uma das 3 páginas com o Cloud Flow lento/indisponível (throttle de rede no DevTools) para validar que o `timeout` evita travamento indefinido da UI.
6. Publicar as alterações via `pac pages upload` (ou fluxo de deploy do projeto) para o ambiente de dev e revalidar em produção-like antes de promover.
