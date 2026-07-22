# Relatório de Ajustes — Performance e UX do Módulo de Anexos (Power Pages)

Branch: `analise-pp` | Data: 2026-07-11

---

## Task 1 — Query de anexos baixando arquivo inteiro em base64

**Nome da Task:** Remover `documentbody` do FetchXML de anexos por atividade

**Ajuste necessário identificado:** A consulta FetchXML da página `Anexos-Atividades.pt-BR` incluía o atributo `documentbody`, retornando o conteúdo binário (base64) de **todos** os anexos da atividade, mesmo ao apenas listar os arquivos.

**Motivo do ajuste:** Um único PDF de 5 MB vira ~6,7 MB de texto base64 embutido no HTML da página; com vários anexos, isso gera lentidão severa e possíveis timeouts só para exibir a lista, sem que o usuário tenha pedido o download.

**O que foi alterado:** Removido o atributo `documentbody` da query em `web-pages/anexos-atividades/content-pages/Anexos-Atividades.pt-BR.webpage.copy.html`; o download continua funcionando sob demanda via link `/_entity/annotation/{id}/fileattachment` (mesmo padrão já usado em `Anexos.pt-BR` e `Anexos-FSA.pt-BR`). Adicionado `top="100"` como teto de segurança.

---

## Task 2 — Consultas de anexos sem limite de registros

**Nome da Task:** Adicionar paginação (`top`) às queries FetchXML de anexos

**Ajuste necessário identificado:** As queries de anexos em `Anexos.pt-BR`, `Anexos-Atividades.pt-BR` e `Anexos-FSA.pt-BR` não tinham `top`, retornando todas as linhas sem limite.

**Motivo do ajuste:** O tempo de renderização da página cresce proporcionalmente à quantidade de anexos existentes; sem um teto, registros antigos/duplicados fazem a página crescer indefinidamente.

**O que foi alterado:** Adicionado `top="100"` como teto de segurança nas três queries (`Anexos.pt-BR`, `Anexos-Atividades.pt-BR`, `Anexos-FSA.pt-BR`), sem alterar o comportamento normal de uso.

---

## Task 3 — Esperas artificiais fixas no upload de anexos

**Nome da Task:** Eliminar esperas artificiais de 6-12s no fluxo de upload de `Anexos.pt-BR`

**Ajuste necessário identificado:** O script mantinha a tela de "carregando" por 8-12 segundos fixos após o upload já ter sido confirmado como concluído pelo servidor, e um fallback cego de 6s que podia reportar sucesso antes do upload realmente terminar.

**Motivo do ajuste:** Essa é a causa mais direta do "às vezes é lento" relatado — o atraso era imposto pelo código, não pela rede ou pelo servidor.

**O que foi alterado:** Em `Anexos.pt-BR.webpage.copy.html`: removidas as constantes de espera mortas (`TEMPO_MINIMO_CARREGANDO_MS`, `TEMPO_ESPERA_UPLOAD_MS`); o aviso ao iframe pai após sucesso confirmado passou de 8s para 600ms; o fallback cego passou de 6s para 15s (rede de segurança genuína) e ganhou uma flag (`uploadJaNotificadoAoPai`) para nunca reportar sucesso duplicado/falso.

---

## Task 4 — Loop de auto-alimentação do MutationObserver

**Nome da Task:** Corrigir loop de reprocessamento contínuo do formulário de anexos

**Ajuste necessário identificado:** A função que habilita/desabilita o botão "Salvar" alterava atributos do DOM a cada chamada, mesmo sem mudança de estado; como um `MutationObserver` observava esse mesmo formulário, cada alteração disparava o observer, que reagendava mais verificações — criando um ciclo que nunca se estabilizava enquanto a página ficasse aberta.

**Motivo do ajuste:** Esse ciclo consome CPU continuamente no navegador do usuário, travando a interface e piorando a lentidão percebida, especialmente em máquinas mais fracas.

**O que foi alterado:** Em `Anexos.pt-BR.webpage.copy.html`, a função `controlarBotoesSalvarAnexos()` agora só mexe no DOM quando o estado realmente muda; a cascata de até 9 `setTimeout` por evento foi reduzida a 2-3 checkpoints, e o `MutationObserver` passou a usar debounce (reaproveita o mesmo timer em vez de empilhar um novo grupo a cada mutação).

---

## Task 5 — Auto-submit com delay fixo nas páginas de anexo de obra

**Nome da Task:** Trocar espera fixa por detecção real de arquivo pronto no auto-submit

**Ajuste necessário identificado:** As páginas `Anexos-Obra`, `Anexos-Obra-Final`, `Anexos-Análise-Preliminar` e `Anexos-Diretrizes` aguardavam ~6 segundos fixos (independente do tamanho do arquivo) antes de submeter o formulário automaticamente após a seleção do arquivo.

**Motivo do ajuste:** Delay artificial desnecessário para arquivos pequenos, e insuficiente/arriscado para arquivos grandes — o tempo correto depende do processamento real do controle de anexo, não de um valor fixo.

**O que foi alterado:** Substituído o `setTimeout` fixo por um polling curto (a cada 300ms) que verifica se o controle já processou o arquivo (nome do arquivo visível + botão de remover disponível), com teto de segurança de 6s caso a detecção falhe.

---

## Task 6 — MutationObserver observando a página inteira

**Nome da Task:** Escopar `MutationObserver` ao formulário de anexo

**Ajuste necessário identificado:** Em `Anexos-Obra-Final` e `Anexo-Comprovante`, o `MutationObserver` que detecta sucesso do upload observava `document.body` inteiro (`subtree: true`), reagindo a qualquer mudança em qualquer parte da página.

**Motivo do ajuste:** Processamento desnecessário de CPU durante toda a navegação na página, não só durante o upload.

**O que foi alterado:** Observer escopado ao contêiner do formulário (`#custom-modern-form`) em vez de `document.body`.

---

## Task 7 — Ausência de timeout nas chamadas de exclusão de anexo

**Nome da Task:** Adicionar timeout e mensagens de erro específicas nas chamadas ao Cloud Flow de exclusão

**Ajuste necessário identificado:** As chamadas `$.ajax` para excluir anexo (em `Anexos.pt-BR`, `Anexos-Atividades.pt-BR`, `Anexos-FSA.pt-BR`) não configuravam `timeout`; se o Cloud Flow travasse, a tela ficava sem resposta por tempo indeterminado.

**Motivo do ajuste:** Sem timeout, o usuário não recebe nenhum feedback quando o fluxo de exclusão trava, dando a sensação de página travada.

**O que foi alterado:** Adicionado `timeout: 20000` (20s) às três chamadas, com mensagem de erro específica para o caso de timeout ("A exclusão está demorando mais que o esperado...").

---

## Task 8 — Alerts nativos com mensagens não amigáveis

**Nome da Task:** Substituir `alert()` por notificação não bloqueante nas páginas de anexo

**Ajuste necessário identificado:** Erros de exclusão/identificação de anexo usavam `alert()` nativo do navegador, que trava a thread principal (inclusive o iframe pai) e exibe um popup não estilizado.

**Motivo do ajuste:** UX ruim — a interface trava enquanto o alerta está aberto, quebra a identidade visual do portal e, no levantamento geral do site, esse padrão aparece 451 vezes em 17 páginas.

**O que foi alterado:** Criada uma função de toast (`exibirNotificacaoAnexo`) em `Anexos.pt-BR`, `Anexos-Atividades.pt-BR`, `Anexos-FSA.pt-BR` e `Anexos-Diretrizes.pt-BR`, substituindo todos os `alert()` dessas páginas por notificações não bloqueantes com mensagens reescritas em linguagem de negócio (sem IDs internos ou termos técnicos).

---

## Task 9 — Reload completo da página após upload/exclusão de anexo

**Nome da Task:** Reduzir delay artificial antes do reload em `Status-Projeto.pt-BR`

**Ajuste necessário identificado:** Após receber a confirmação de upload/exclusão de anexo via `postMessage`, a página `Status-Projeto.pt-BR` (8.109 linhas) aguardava 3 segundos artificiais antes de recarregar por completo para buscar a lista atualizada.

**Motivo do ajuste:** A mensagem recebida já confirma que a operação terminou no servidor — os 3s extras eram espera pura, sem propósito funcional. (O reload em si foi mantido: é o mecanismo que busca os dados atualizados do servidor; removê-lo exigiria reestruturar a página para atualização parcial, o que não foi feito nesta rodada por ser uma mudança de maior risco sem ambiente de teste disponível.)

**O que foi alterado:** Delay reduzido de 3000ms para 500ms em dois pontos de `Status-Projeto.pt-BR.webpage.copy.html`; removidos `console.log` de debug residuais no mesmo trecho.

---

## Pendente para uma próxima rodada (fora do escopo desta entrega)

Identificado no levantamento, mas não tratado nesta rodada por estar fora do escopo direto de "anexos" e por envolver arquivos muito extensos (8.000-10.000 linhas, múltiplos domínios de negócio):

- Limpeza de `alert()` não amigáveis em `Status-Obra.pt-BR` (99 ocorrências), `Status-Projeto-Aegea.pt-BR` (81) e `Status.pt-BR` (34), incluindo casos que expõem nomes de campos internos e atributos HTML ao usuário final.
- Mesma limpeza nas páginas `Editar-Solicitacoes-2`, `Editar-Solicitacoes-3`, `Atualizar-Dados-da-Solicitação` e `Minhas-Solicitações`.
