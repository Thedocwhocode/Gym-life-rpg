# Gym Life RPG: dá para reescrever em Dioxus/Rust sem fallback e sem regressão?

Data: 25/11/2026. O estudo leu só código (cópia da `main` em `b0ce6dcf`) e fez pesquisa pública. Nenhum arquivo do repositório foi alterado.

## 0. Veredito

**Não é viável agora** no sentido literal do pedido ("zero fallback, zero regressão"). Na plataforma web, **depois do lançamento**, a resposta é **viável com condições**, e só se fallback quiser dizer "UI em Dioxus com ilhas de JavaScript". Antes do lançamento web, não cabe em nenhuma das leituras.

| Leitura de "zero fallback" | Web (1º lançamento) | Android/iOS (depois) |
|---|---|---|
| **A. 100% Rust, nenhum JS** | Não viável agora. Seria preciso portar 16 mil linhas do pixelfx, trocar o pdf.js, a captura do card de compartilhamento e o Sentry de navegador. Sentry em wasm32 sem SDK oficial confirmado. | Não viável. Não existe SDK Rust de RevenueCat. Notificações e permissões no Dioxus mobile não têm caminho documentado. |
| **B. UI e lógica em Dioxus, ilhas JS permitidas** (pdf.js, pixelfx, Sentry browser, html2canvas) | Viável com condições: cerca de 45–75 semanas-pessoa (estimativa, ver §4), Cypress como contrato de paridade, adiado para depois do lançamento. | Não viável com zero regressão. O Dioxus mobile renderiza num WebView, enquanto o app atual usa views nativas do RN e módulos Kotlin/Swift próprios. |

O porquê, em uma linha: o ganho seria trocar a stack, não ganhar uma funcionalidade. O custo é próximo de um ano-pessoa, e o ecossistema Dioxus ainda não tem equivalente maduro para a camada de UI (Material, listas virtualizadas, date picker, gestos) nem para as integrações nativas.

## 1. Inventário (o que existe hoje)

As contagens usam `git ls-files` em `main-ro`. Elas **incluem** o merge do leitor por IA (HEAD = PR #28), mas o esforço do §4 **exclui** essa parte (`AiSheetController`, `readAi`, `models/ai-models`).

| Item | Número |
|---|---|
| Arquivos em `app/app/` (Expo Router) | 36 = **28 telas + 8 `_layout`** (`dev-gallery` só aparece com `__DEV__`; sobram 27 telas de produção) |
| Specs vitest | **36 arquivos, 358 casos** (`it`/`test`); cerca de 5,3 mil linhas. Desses, 111 casos estão em `store/journey` + `store/rpg` |
| E2E Cypress (`tests/cypress-tests`) | 6 specs (sessão, plano, exercícios, feed, configurações, visual); 41 `cy.contains` e 10 `cy.get` (os `get` usam `[data-testid=...]`); `baseUrl` `http://127.0.0.1:8081` (servidor web do Expo). O app tem 211 `testID=`. **A suíte não foi rodada neste estudo.** |
| TS/TSX do app (sem testes, `gen/` e `vendor/`) | ~39,8 mil linhas: components 16,0k (141 .tsx: 115 presentation, 25 smart, 1 layout), store 8,2k, models 5,8k, telas 4,3k, services 3,5k |
| Código gerado do protobuf (`app/gen`) | ~19,2 mil linhas (protobufjs `--force-long`) |
| pixelfx vendorizado | 102 arquivos, ~16,4 mil linhas JS (Canvas 2D) |
| Backend .NET | ~60 mil linhas C# (fica como está) |
| i18n | 14 idiomas; `en`/`pt` com 815 chaves, os outros entre 278 e 400 (parciais); árabe RTL; Tolgee `FormatSimple`, JSON embutido |

**Rotas (28 telas)**: sessão (início, sessão ativa), dashboard, feed (lista, compartilhar, item compartilhado `[id]`), histórico (lista, editar), estatísticas, configurações (índice, configuração do app, backup e restauração, exportação em texto, backup remoto, bestiário, galeria dev, catálogo de exercícios, grimório, inventário, idioma, gerenciar exercícios, programa `[programId]`, sessão do programa `[sessionIndex]`, mapa, notificações, importar PDF, lista de programas, dias de treino).

**Stores (`app/store/`)**: app, choices, current-session, feed, journey (com `rules/`: bestiary, chronicle, combat, dungeon, energy, hearts, items, multipliers, opening, skills, status), program, rpg (derive 591 linhas, decay, progress), session-editor, settings (backup local/remoto, efeitos), stats, stored-sessions. Redux Toolkit com efeitos próprios.

**Serviços (`app/services/`)**: feed-api, feed-follow, feed-identity, feed-inbox-decryption, encryption (web `crypto.subtle`; nativo em `modules/native-crypto` Kotlin/Swift), key-value-store (web `localStorage`; nativo arquivos com escrita atômica), preference, progress-repository, session, exercise-catalog, sheet-parser e pdf-text/pdf-import (pdf.js, **só web**), weather (expo-location), notification (**stub vazio na web**, real só no nativo), file picker/export, tolgee, logger, pro-paywall (RevenueCat).

**Libs por uso (nº de arquivos que importam)**: `@tolgee/react` 92, `@js-joda/core` 85, `react-native-paper` 54, `bignumber.js` 32, `react-native-reanimated` 13, `@shopify/flash-list` 7, `react-native-svg` 6, `@sentry/react-native` 5, `react-native-gifted-charts` 4 (3 cards de gráfico), `react-native-purchases` 3, `react-native-paper-dates` 2, `@gorhom/bottom-sheet` 2, `pdfjs-dist` 2, Skia 1 (só `FxSurface.tsx` nativo; na web é `FxSurface.web.tsx` com Canvas 2D), `html2canvas` 1 (card de compartilhamento na web), notificações, localização, haptics e keep-awake 1 cada.

### Linha de base real na web (o que "não regredir" significa no lançamento)

- **Notificações:** `notification-service.ts` é no-op na web. Não há o que regredir.
- **RevenueCat:** `revenueCatApiKey` só é definido para `ios`/`android` (`services/api-consts.ts`), então na web o `Purchases.configure` nunca roda. O lock tem `react-native-purchases` 9.4.2, e o suporte web só chegou na 9.7.6 [R1]; `purchases-ui` não tem paywall web. O único consumidor restante é o leitor por IA (`pdf-import.tsx`, `pro-paywall.ts`), que está saindo. **Na web, compras estão fora da linha de base.**
- **Skia:** fora da web. Os efeitos web são Canvas 2D (`FxSurface.web.tsx`).
- **Criptografia:** `crypto.subtle` puro na web.
- **PDF:** pdf.js no aparelho, só web; parser tabular por regex (`sheet-parser.ts`).
- **APIs do navegador que já funcionam ou degradam na web e entram no escopo:**
  - clima por geolocalização (`hooks/useLiveWeather.ts` + Open-Meteo);
  - tela ligada durante o treino (`expo-keep-awake`);
  - vibração no timer de descanso (`expo-haptics`, que na web é no-op);
  - escolher arquivo (`expo-document-picker`) e exportar/baixar arquivo;
  - card de compartilhamento (`html2canvas`) e links de compartilhamento.

## 2. Equivalentes em Dioxus (estável atual: **0.7.10**, de 30/07/2026; 0.8 está em alpha) [D1]

| Capacidade | Hoje | Dioxus 0.7 | Maturidade / lacuna |
|---|---|---|---|
| Roteamento | Expo Router, 28 telas, abas, rotas dinâmicas | `Routable` enum tipado, segmentos dinâmicos, `Link` [D3]; hash router e divisão de bundle por rota [D2]. Layouts aninhados constam no índice da documentação, mas a página não foi lida (**não confirmado**) | Bom. As abas e a pilha por aba precisam ser montadas à mão. |
| Estado global | Redux Toolkit + efeitos + seletores memoizados | Signals, contexto e `#[derive(Store)]` para estado aninhado [D2] | Bom, mas é reescrita do zero das ~8,2 mil linhas de store/efeitos. |
| Armazenamento local | Web: `localStorage` com protobuf em base64 e chaves `-Version`; nativo: arquivos | `web-sys` para `localStorage` (**não verificado** nesta pesquisa); `dioxus-sdk-storage` existe, mas o próprio SDK avisa "Expect breaking changes!" e não declara plataformas [D4] | Na web dá para ler as mesmas chaves (mesma origem). No mobile, o formato atual em arquivo exige reimplementação. |
| APIs do navegador já usadas (geolocalização, wake lock, arquivo, download, captura do card) | Expo + html2canvas | `dioxus-sdk-geolocation` declara Web [D4]; o resto via `web-sys` ou ilha JS (**não verificado**) | Médio. São pequenas, mas cada uma é paridade a testar. |
| Criptografia do feed | AES-CBC-128; RSA-2048 OAEP-SHA256 em blocos de 122 bytes; RSA-PSS-SHA256 com salt 32 | Web: `web-sys::SubtleCrypto` (os mesmos bytes, sem crate de RSA). Nativo: crate `rsa`, cuja versão sem o problema Marvin (RUSTSEC-2023-0071) é a 0.10.0, estável só desde 08/11/2026 [C1][C2] | Viável, mas é bloco sensível; ver §3. |
| Gráficos | gifted-charts em 3 cards (peso corporal, exercício, sessão), todos `LineChart` | `dioxus-charts` 0.4.0 (jan/2026, ~30 mil downloads) [D5] ou SVG à mão | Médio. Só linha é necessário; falta confirmar tooltips e eixos. |
| Efeitos pixelfx | JS vendorizado + Canvas 2D (web) / Skia (nativo) | Ilha JS via `document::eval` [D6], ou port para Rust com `web-sys` Canvas | Ilha: 1–2 semanas. Port: 16 mil linhas (6–10 semanas). |
| Fontes e assets | `@expo-google-fonts` (Pixelify Sans, Space Mono) | `asset!` (manganis); fontes via CSS `@font-face` na web [D7] | Web trivial. No Android, `asset_path` não funciona no bundle [D7]. |
| i18n | Tolgee, 14 idiomas, RTL, `FormatSimple` | `dioxus-i18n` 0.6.0 (Fluent) [D8]; compatibilidade com Dioxus 0.7 **não confirmada** (a 0.7 está em alpha) | Precisa converter 815 chaves × 14 idiomas para Fluent, ou escrever um carregador próprio. Perde o DevTools do Tolgee. |
| PDF | pdf.js 4.10 (web) | Ilha JS com o mesmo pdf.js, ou crate Rust de PDF (candidatas não pesquisadas) | Ilha: paridade fácil. Rust puro: risco de extrair texto diferente e quebrar o `sheet-parser`. |
| Notificações | Web: nenhuma. Nativo: expo-notifications (timer de descanso, alarme exato no Android) | `dioxus-sdk-notifications` só desktop [D4]; no mobile não há caminho documentado. Existe um macro `#[ffi]` no manganis 0.7.9 sem guia (**não confirmado**) [D9] | Web sem impacto. Mobile: bloqueio. |
| Compras | RevenueCat (só nativo hoje) | Não há SDK Rust. Na web seria `@revenuecat/purchases-js` como ilha JS [R2]. A documentação diverge sobre suporte a Stripe Billing (**não confirmado**) | Web fora da linha de base. Mobile: ponte Kotlin/Swift própria. |
| Sentry | `@sentry/react-native` | O caminho oficial no navegador é o SDK JS + `@sentry/wasm` [S1]. A crate Rust `sentry` não documenta wasm32 (transporte padrão reqwest/native-tls) (**não confirmado**) [S2] | Ilha JS. Sem ela, a perda de observabilidade é uma regressão. |
| Build web | `expo export -p web` | `dx build --platform web`, divisão de bundle WASM [D2] | Maduro. |
| Build Android/iOS | RN nativo + módulos Kotlin/Swift | WebView da plataforma, WGPU experimental; o renderer nativo Blitz é "work in progress" [D2][D10] | WebView não equivale a views nativas. A documentação diz que animações e widgets nativos do Android ainda não são suportados [D10]. |
| Componentes de UI | react-native-paper (54), reanimated (13), flash-list (7), paper-dates, bottom-sheet, swipe-list, pager-view | Primitivas Radix-like oficiais distribuídas por cópia (`dx components add`), não por crate versionada (a `dioxus-primitives` no crates.io é 0.0.0) [D11][D12]. Material: `material-dioxus` 0.0.3-dev (2023), `dioxus-material` 0.3.0 (Dioxus 0.6). Lista virtual: `dioxus-lazy` 0.2.0 (2024). **Nenhum date picker Dioxus encontrado** [U1] | **Maior lacuna.** É reescrita de todo o design system em HTML/CSS. |
| Acessibilidade | RN-web mapeia `accessibilityLabel/Role` para ARIA (130 ocorrências); nativo usa a acessibilidade da plataforma | Web: DOM real, ARIA manual; primitivas com WAI-ARIA [D11]. Mobile: leitor de tela lê o DOM do WebView (inferência, não testada) | Web: viável com auditoria. Mobile: experiência diferente da nativa (TalkBack/VoiceOver), o que conta como regressão. |
| Protobuf | protobufjs (gerado, `--force-long`) | `prost` + `prost-build` a partir dos mesmos `.proto` [P1] (página **não verificada** nesta pesquisa) | Esperado maduro; o formato protobuf é o mesmo nos dois lados. |
| gzip | `CompressionStream`/`DecompressionStream` | `flate2` [P2] (suporte a wasm **não verificado** nesta pesquisa) | Esperado maduro. |
| Datas e decimais | js-joda (85 arquivos), bignumber.js (32) | crates de data e decimal do ecossistema Rust (ex.: `chrono`, `rust_decimal`; **não verificadas**) | É port, não troca de biblioteca: arredondamento de peso e semana ISO precisam de testes de paridade. |

## 3. Compatibilidade de dados (não pode quebrar)

1. **Backup `*.liftlogbackup.gz`**: a exportação grava gzip sobre `ExportedDataDaoV2` (`store/settings/export-backup-effects.ts`).
   - A importação (`import-backup-effects.ts`) tenta descompactar o gzip; se falhar, **aceita o protobuf cru** (`unGzipIfZipped` devolve os bytes originais).
   - Dentro do DAO há `choices_json`, um `StringValue` com o JSON do `store/choices`. Backups antigos do LiftLog ou de antes da F6 não têm esse campo, e o XP é recalculado das sessões.
   - Também vêm `feedState` e `activeProgramId`, e a importação dispara a migração de peso (`checkIfWeightMigrationRequired`).
   - O port precisa cobrir os dois formatos de entrada e os três casos acima.
   - O `prost` lê os mesmos `.proto`. Atenção a `DecimalValue {int64 units; sfixed32 nanos}`, `DateTimeDao` com `ZoneOffsetDao` opcional (backups antigos não têm o offset e usam o fuso do sistema) e `UuidDao` em bytes. Vetor dourado pronto: `app/models/storage/export.liftlogbackup.gz` (já usado em `conversions.spec.ts` e `backup-choices.spec.ts`).
2. **Dados já gravados no navegador**: o usuário web não faz backup antes de atualizar. O app Rust precisa ler **no lugar** as mesmas chaves de `localStorage`, com o mesmo base64 (inclusive o caso de string entre aspas tratado em `getItemBytes`) e a mesma lógica de `-Version` de cada store (current-session, feed, program, stored-sessions). Para isso o app novo precisa ser servido na **mesma origem**.
3. **Feed com criptografia ponta a ponta**, compatível com o backend .NET e com quem ainda usa o app antigo:
   - AES-CBC com chave de 128 bits e IV por mensagem.
   - A assinatura RSA-PSS (SHA-256, salt 32, 256 bytes) vai **dentro** do texto cifrado, concatenada ao payload.
   - **Detalhe que um port precisa reproduzir:** o código calcula `SHA-256(data)` e passa esse digest ao `crypto.subtle.sign` com RSA-PSS/SHA-256, que faz hash de novo (`encryption-service.ts` linhas 115–117 e 248–257). A assinatura é sobre `SHA-256(SHA-256(data))`. Uma implementação "correta" em Rust que assine `data` direto fica incompatível.
   - RSA-OAEP-SHA256 em blocos de 122 bytes; chaves exportadas em SPKI/PKCS#8.
   - Vetores dourados: `services/test-assets/rsa/*.bin` e `services/test-assets/aes/privateKey.bin`.
4. **Backend .NET**: a API de feed é JSON sobre HTTP (`feed-api.ts`), e os itens compartilhados usam `SharedItem.proto`. Não precisa mudar, desde que os itens 1–3 acima sejam respeitados.

## 4. Avaliação "zero fallback / zero regressão" e esforço

As semanas-pessoa são **estimativas**. A premissa é um dev sênior que já sabe Rust e faz uma rampa curta em Dioxus. O leitor por IA fica fora. A faixa baixa supõe ilhas JS (leitura B).

| Bloco | O que exige | Equivalente maduro? | Semanas-pessoa |
|---|---|---|---|
| Fundação: projeto, rotas (28 telas + abas), tema, fontes | Reescrita | Sim | 3–5 |
| Design system e componentes (141 arquivos, ~16k linhas): paper, reanimated, bottom-sheet, swipe-list, date picker, lista virtual | Reescrita do zero em HTML/CSS | **Não** (Material e date picker ausentes; lista virtual imatura) | 12–18 |
| Telas (~4,3k linhas) | Reescrita | Sim | 4–6 |
| Modelos, conversões DAO, prost, datas e decimais (~5,8k linhas) | Port com paridade | Sim | 4–6 |
| Stores e efeitos (~8,2k linhas, Redux para Signals/Store) | Reescrita | Sim | 5–8 |
| Regras puras (`journey/rules` + `rpg/derive`, ~2k linhas) | Port | Sim | 2–3 |
| i18n (14 idiomas para Fluent ou carregador próprio, RTL) | Conversão | Parcial (`dioxus-i18n` na 0.7 não confirmado) | 1–2 |
| Feed, criptografia e API | Port byte a byte | Sim (SubtleCrypto via web-sys) | 2–4 |
| Backup local e remoto, exportação em texto/CSV | Port | Sim | 2–3 |
| Gráficos (3 cards de linha) | Reescrita | Parcial | 1–2 |
| APIs do navegador (geolocalização/clima, wake lock, arquivo, download) | Port | Sim, via web-sys/SDK (não verificado) | incluído em Fundação/Telas |
| pixelfx | Ilha JS (A: port) | Ilha: sim / Rust: não | 1–2 (A: 6–10) |
| PDF + sheet-parser | Ilha pdf.js + port do parser (A: crate Rust) | Ilha: sim / Rust: arriscado | 1–2 (A: 3–5) |
| Card de compartilhamento (html2canvas), Sentry browser | Ilhas JS (A: sem equivalente) | Ilha: sim / Rust: não | 1–2 |
| Port dos 358 casos de teste para Rust + adaptar Cypress | Reescrita | Sim | 4–6 |
| QA de paridade, acessibilidade, 375 px, RTL | Trabalho novo | — | 3–5 |
| **Total web, leitura B** | | | **~46–74** |
| **Total web, leitura A** (100% Rust) | | | **~55–90**, com Sentry e card ainda sem solução confirmada |
| **Mobile depois** (notificações exatas, haptics, keep-awake, file system, picker, sharing, localização, RevenueCat, cripto nativa, acessibilidade nativa) | Pontes Kotlin/Swift próprias, sem sistema de plugins documentado | **Não** | +15–30, sem garantia de paridade |

**Principais riscos**

- Regressão silenciosa de dados: double-hash do PSS, base64 com aspas, offset ausente em backups antigos, arredondamento de `DecimalValue`.
- Duas bases de código vivas durante meses: o RN continua recebendo features enquanto o Rust tenta alcançar.
- Dioxus pré-1.0 com 0.8 a caminho: troca de API no meio do projeto (o próprio `eval` muda na 0.8 [D6]).
- Crate `rsa` sem Marvin com só 17 dias de estável.
- Perda do DevTools do Tolgee e do fluxo de tradução atual.
- Licença: o fork é AGPL-3.0, e a reescrita continua obrigada a ela. Não é bloqueio, mas o NOTICE precisa acompanhar.

## 5. Alternativas

1. **Não migrar (recomendado para o lançamento).** Lançar a web no RN/Expo atual, que já tem linha de base, testes e E2E. Custo zero.
2. **Núcleo Rust compartilhado via WASM só para regras puras** (`store/journey/rules/`, `rpg/derive`, `decay`). Estimativa de 3–5 semanas-pessoa.
   - Contras: as regras importam `LocalDate` (js-joda), `RootState`, seletores e tipos de UI (`FxId`, `TranslationKey`), então a fronteira exige DTOs serializados e conversão de datas a cada chamada. O backend é .NET, logo não há segundo consumidor do núcleo Rust.
   - Prós: os 111 casos vitest de `store/journey` e `store/rpg` continuam rodando contra o WASM, servindo de contrato. Os outros 247 não exercitam esse núcleo.
   - Só vale se houver um motivo concreto, como desempenho medido ou reuso futuro num cliente Rust.
3. **Migração incremental (strangler) depois do lançamento.** Uma rota simples por vez (ex.: bestiário ou grimório) em Dioxus web na mesma origem, com o mesmo `localStorage` e roteamento por caminho no proxy. Permite medir o custo real por tela antes de se comprometer. Mobile fica no RN.
4. **Reescrita total** (leitura B, só web): ~1 ano-pessoa, só depois do lançamento e com a validação abaixo.

## 6. Estratégia de validação de paridade (se for adiante)

1. **Contrato E2E primeiro:** os 6 specs Cypress usam texto visível e `data-testid`, contra `baseUrl` `127.0.0.1:8081`. Manter os mesmos 211 `testID` como `data-testid` no Dioxus e servir o build na mesma porta, para os specs rodarem sem mudança contra os dois builds. O spec `visual` compara snapshots, então ele vai acusar qualquer diferença de pixel (o que é desejável). A suíte não foi rodada aqui. Ampliar a cobertura antes de começar, porque hoje 6 specs não cobrem as 28 telas.
2. **Vetores dourados:** backup `.liftlogbackup.gz`, arquivos RSA/AES de `test-assets` e dumps de `localStorage` de um navegador real (anonimizados), comparados por igualdade de bytes e de estado.
3. **Specs como contrato:** portar os 358 casos para `cargo test` mantendo nome e entrada iguais, e rodar os dois lados com os mesmos fixtures. No caso do núcleo WASM, as specs vitest rodam direto.
4. **Testes de propriedade:** o projeto já tem `fast-check`; gerar entradas aleatórias para regras e conversões e comparar a saída TS contra Rust.
5. **Checklist por rota (28):** ações principais, estados vazio/erro/carregando, 375 px, teclado e foco, leitor de tela (NVDA/VoiceOver na web), RTL em árabe, 14 idiomas sem chave faltando, zero erro novo no console.
6. **Critério de corte:** nenhuma rota troca de stack sem Cypress verde, vetores dourados idênticos e leitura dos dados existentes do `localStorage` testada.

## Fontes

- [D1] crates.io, dioxus (versões): https://crates.io/crates/dioxus/versions — API consultada: https://crates.io/api/v1/crates/dioxus
- [D2] Release Dioxus 0.7.0: https://github.com/DioxusLabs/dioxus/releases/tag/v0.7.0
- [D3] Router 0.7: https://dioxuslabs.com/learn/0.7/essentials/router/
- [D4] Dioxus SDK: https://github.com/DioxusLabs/sdk
- [D5] dioxus-charts: https://crates.io/crates/dioxus-charts
- [D6] `document::eval` (0.7.10 e 0.8 alpha): https://docs.rs/crate/dioxus-document/0.7.10/source/docs/eval.md · https://docs.rs/crate/dioxus-document/0.8.0-alpha.1/source/docs/eval.md
- [D7] Assets 0.7: https://dioxuslabs.com/learn/0.7/essentials/ui/assets
- [D8] dioxus-i18n: https://crates.io/crates/dioxus-i18n · https://github.com/dioxus-community/dioxus-i18n
- [D9] manganis-macro `#[ffi]` (fonte, sem guia): https://docs.rs/crate/manganis-macro/0.7.9/source/src/ffi.rs
- [D10] Mobile 0.7: https://dioxuslabs.com/learn/0.7/guides/platforms/mobile
- [D11] Componentes oficiais: https://github.com/DioxusLabs/components
- [D12] dioxus-primitives no crates.io (0.0.0): https://crates.io/crates/dioxus-primitives
- [U1] Crates de UI de terceiros: https://docs.rs/crate/material-dioxus/latest · https://docs.rs/crate/dioxus-material/0.3.0 · https://lib.rs/crates/dioxus-lazy · https://lib.rs/crates/dioxus-tw-components
- [C1] RUSTSEC-2023-0071 (Marvin): https://rustsec.org/advisories/RUSTSEC-2023-0071.html
- [C2] crate rsa (0.10.0 estável em 08/11/2026): https://crates.io/crates/rsa
- [R1] RevenueCat RN com suporte web (9.7.6): https://www.revenuecat.com/blog/engineering/revenuecat-react-native-sdk-adds-react-native-web-support
- [R2] RevenueCat Web SDK: https://www.revenuecat.com/docs/web/web-billing/web-sdk · Stripe: https://www.revenuecat.com/docs/web/integrations/stripe
- [S1] Sentry WASM no navegador (SDK JS): https://docs.sentry.io/platforms/javascript/guides/wasm/
- [S2] Crate sentry (Rust): https://docs.rs/crate/sentry/latest
- [P1] prost (não aberto nesta pesquisa): https://crates.io/crates/prost
- [P2] flate2 (não aberto nesta pesquisa): https://crates.io/crates/flate2
