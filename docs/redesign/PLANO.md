# Plano: redesign completo "Telas GymLife RPG"

> Status: **rascunho para revisão** (2026-11-04). Nada foi implementado ainda.
> Fonte: export do Claude Design "Design system GYMLIFE-RPG" (galeria `Telas GymLife RPG.html`,
> 29 telas em 7 grupos). O resumo técnico do export está em [`design-spec.md`](design-spec.md)
> (tokens, 48 componentes, telas, regras de jogo, assets, lacunas). Este plano diz **em que ordem**
> portar tudo para o app React Native e **o que precisa ser decidido antes**.

## 1. Escopo

A galeria cobre:

| Grupo | Telas | Situação hoje |
|---|---|---|
| Abas | Painel, Treinar, Quest Log, Guilda, Estatísticas, Herói | existem; Painel e Quest Log já usam componentes RPG |
| Treino | Sessão ativa (combate), Editar treino do histórico, **Masmorra** | Masmorra não existe |
| Planos | Planos, Editar plano, Editar treino, Planejador IA, **Importar PDF** | PDF não existe |
| Taverna | Config. do app, Idioma, Notificações, Backup, Backup remoto, Exportação texto, Exercícios | existem |
| Guilda | Convite de perfil, Item compartilhado | existem |
| Jornada | Onboarding (classe), **Grimório**, **Bestiário**, **Inventário** | onboarding existe (passo 0 do wizard); o resto não |
| Overlays | Missão concluída, Level up | existem (`SessionRewardScreen`, `LevelUpOverlay`) |

Além das telas, o design traz **sistemas de jogo novos**: corações (vida), status (buffs/debuffs),
clima real com modificador de XP, skills destraváveis por feitos reais, bestiário (maus hábitos como
monstros), inventário, combate na sessão (cada exercício é um monstro) e efeitos pixelfx ao vivo.

Decisões já tomadas pelo usuário (2026-11-04):
- **Fontes:** trocar Press Start 2P + VT323 por **Pixelify Sans** (títulos) + **Space Mono** (corpo,
  números, ASCII). Reverte parte do PR #1.
- **Escopo:** tudo, mas com este plano revisado antes de qualquer código.
- **Ordem das fases:** a deste plano, tela a tela (revisão CEO, opção B).
- **Lançamento:** big-bang. Tudo acumula em `feat/rebrand-gymlife-rpg` e sai numa versão única
  depois da F9. Fases intermediárias não precisam ser publicáveis sozinhas.
- **Expansões aceitas na revisão CEO** (todas dentro das fases abaixo):
  - E1 vibração no combate (F5)
  - E2 cartão compartilhável da missão (F5)
  - E3 regressão visual automática da galeria (F0)
  - E4 crônica semanal (F6)

Fora do escopo deste plano: modo estudo/pomodoros (Fase 5 do `TODO.md`), sprites próprios e sons
(pipeline externa), backend novo.

## 2. Decisões de produto pendentes (bloqueiam fases específicas)

O design deixa regras em aberto ou contraditórias (ver `design-spec.md` §F.3). Cada uma abaixo tem
uma proposta padrão; a fase que depende dela não começa sem a resposta.

| # | Decisão | Proposta padrão | Bloqueia |
|---|---|---|---|
| D1 | Paleta: o usuário escolhe entre Brasa / Ferro / Fósforo / Pergaminho, ou só Brasa? | Escolhível em Config. do app; Brasa padrão; "Pergaminho" substitui o switch "Modo escuro RPG" e a semente de cor atual (`colorSchemeSeed`) sai | F1 |
| D2 | Atributos: manter FOR/RES/VIT/DES (pt) ou adotar STR/DEX/CON/STA do design? INT entra? | Siglas do design (STR/DEX/CON/STA), fórmulas de hoje acumuladas na vida + "esta semana +N" (DR4); **INT fica fora** até a Fase 5 do TODO; escola Arcano aparece bloqueada com "em breve" | F2 |
| D3 | Fórmula de XP e empilhamento de multiplicadores (classe + skill + status + clima + itens) | **Fechado na revisão de design (DR11):** `sessionXp` como base; multiplicadores de classe, skill, status e itens **somados**, com teto de +50% e piso de −50%. A projeção percorre as sessões em ordem cronológica e usa as escolhas datadas vigentes em cada uma; só valem sessões a partir de `multiplicadoresDesde`. O clima fica fora (D8) | F6 |
| D4 | Corações: quem tira do estado Exausto e o que conta como "dia de treino planejado" | Dia planejado = dias da semana do plano ativo; sem plano com dias, corações ficam desligados. Sair do Exausto = 3 missões em 7 dias e volta com 2 corações; fora do Exausto vale +1 a cada 2 missões. **Complementado na revisão de design (DR8):** só conta a partir de `coracoesDesde`; aviso de coração perdido na abertura seguinte | F6 |
| D5 | Combate: HP do monstro = séries do exercício (sessão) ou HP fixo do bestiário? Como escolher o monstro de cada exercício? | HP = séries (o HP do bestiário vira só texto de lore). Monstro sorteado de forma determinística por `hash(exercício)`; chefe = último exercício; dano extra das skills fica para depois. **Complementado na revisão de design (DR21):** reps = 0 é esquiva, desmarcar devolve HP, monstro vivo foge, treino livre sem chefe. Chefe de sessão ≠ chefe de masmorra (DR22) | F5 |
| D6 | Skills: quais efeitos entram na v1? Equipada é global ou por exercício? | v1 destrava, aprende, equipa e muda o golpe animado; o efeito numérico entra pelo D3 (DR11). Skill equipada global, como escolha datada | F6 |
| D7 | Inventário: de onde vêm os itens e o que fazem | Drops de monstro derrotado e de conquistas; item equipado (escolha datada) dá o bônus do design-spec §D pelo D3 (DR11) | F6 |
| D8 | Clima: modificador real no XP ou só visual? | **Fechado na revisão eng:** só visual (banner + efeito). O clima não é gravado na sessão, então não entra na projeção | — |
| D9 | Importar PDF: parser local ou servidor? Aceita imagem (OCR)? | Usar o mesmo backend do Planejador IA (LLM lê o texto extraído do PDF); só PDF com texto, sem OCR na v1 | F8 |
| D10 | Textos dentro dos efeitos pixelfx (fonte sem acento): inglês ou português sem acento? | **Fechado na revisão de design (DR14):** o texto vem de `t()` e passa por `toFxText` (NFD, sem diacríticos, caixa alta) | F4 |

## 3. Decisões técnicas

### 3.1 Tokens → tema
- `tokens/colors.css` vira `app/theme/palettes.ts`: as 4 paletas como objetos TS com os aliases
  semânticos do design (`bgApp`, `surface1..3`, `line1/2/frame/focus`, `text1..3`, `accent*`,
  `danger*`, `success*`, `reward`, `attr.{str,dex,con,sta}`).
- `useAppTheme.tsx` passa a montar o `Material3Scheme` inteiro **a partir da paleta escolhida**
  (mapa explícito alias → papel MD3: `primary = accent`, `surface = bgApp`,
  `surfaceContainer = surface1`…), para os ~80 arquivos que usam Paper continuarem coerentes.
  Os 13 pares de cor extras (`orange`, `red`…) passam a apontar para os tons da paleta.
  `@pchmn/expo-material3-theme` e a harmonização por semente saem.
- O hook ganha `tokens` (paleta semântica + `type` + `space` + `motion`) para os componentes novos.
- Paper: `roundness: 0`. `rounding.*` vira 0 (as 28 ocorrências de `borderRadius` são revisadas
  na fase de cada tela).

### 3.2 Tipografia
- `@expo-google-fonts/pixelify-sans` e `@expo-google-fonts/space-mono` (0.4.2 no npm; trazem TTF
  estáticos por peso, então não há problema do eixo variável no Android).
- `fontConfig` MD3: display/headline/title → Pixelify 500/600; body/label → Space Mono 400/700.
- Regra do design: **números ≥ 20px em Space Mono 700**. Helper `<Num>` ou estilo `type.stat`.
- `useRpgFontSize` é revisto: a Pixelify é mais estreita que a Press Start 2P, então os tamanhos
  e cortes por largura de tela mudam.

### 3.3 Cantos em degrau, bordas e sombras (sem `clip-path` no RN)
- Primitivo `PixelBox` desenhado com **4 Views de canto** (quadrados de 2px na cor do fundo atrás)
  sobre uma View com borda de 2px. Barato, sem Skia, funciona em web e nativo.
  Variante Skia só se o perfil mostrar custo em listas longas.
- Sombra dura = View deslocada 4px atrás (não `shadow*`/`elevation`, que borram).
- Brilho dourado (recompensa) = `textShadow` no texto e borda dupla âmbar; sem blur de caixa.
- Scanlines: uma View absoluta `pointerEvents="none"` no root com padrão repetido (SVG pequeno).

### 3.4 Ícones
- Pixelarticons (MIT) via `react-native-svg` (já instalado, 15.12). Os 79 SVGs do export vêm com
  metadados c2pa (~8 KB cada): um script `scripts/build-pixel-icons.mjs` limpa e gera
  `app/components/presentation/pixel-icons.generated.ts` (nome → path `d`).
- A troca é feita **dentro de `MsIconSrc`**: tabela nome Material → nome Pixelarticon. Os ~100 call
  sites de `<Icon source="…">` não mudam. Nomes sem equivalente caem num ícone padrão e geram aviso
  em dev.

### 3.5 Movimento
- `Easing.steps(n)` do Reanimated 4 (já instalado) para barras, switch e entradas (`gl-rise`,
  `gl-shake`). Hook `useReducedMotion` (Reanimated) desliga tudo que não for fade.

### 3.6 Runtime pixelfx (a maior incerteza técnica)
O design usa 68 efeitos pixelfx ao vivo (MIT, JS puro que escreve num buffer de pixels).
Dois caminhos (ver `design-spec.md` §F.1):
- **(A) rodar o core no app**: copiar o buffer RGBA para uma imagem Skia a cada quadro
  (`Skia.Image.MakeImage` + `Canvas`). Necessário para os efeitos com texto/valor variável
  (dano, PR, combo, conquista, missão concluída) e para o `CombatStage`.
- **(B) pré-renderizar sprite sheets** com `tools/render.mjs --sheet` do repositório pixelfx e tocar
  no `PixelFx` atual. Serve para loops fixos (clima, status, monstros, skills, transições).

**Plano:** spike de 1–2 dias **antes da F4** com (A) em Android físico médio e web:
um efeito com texto + 8 instâncias simultâneas (caso do Bestiário). Critério de aceite:
≥ 30 fps com 1 instância, ≥ 24 fps com 8, sem travar a JS thread na sessão.
Se passar, (A) para tudo que é parametrizado e (B) para listas grandes (Grimório/Bestiário) e
como fallback em aparelho fraco. Se falhar, (B) para tudo e os efeitos variáveis viram texto RN
animado por cima de um sheet genérico.
**Resultado parcial** (A passa no web, mas não no Android médio): o Android usa (B) + texto RN animado
e (A) fica no web e em aparelhos que mantêm ≥ 30 fps nos primeiros 2 s de efeito (medido em runtime,
com recuo automático para B).

Web: o `PixelFx.web.tsx` atual evita Skia (CanvasKit ~7 MB); no web o runtime (A) desenha num
`<canvas>` 2D, que é o ambiente original do pixelfx.
O vendor entra em `app/vendor/pixelfx/` com o `LICENSE` MIT e crédito no `NOTICE.md`; os `import()`
dinâmicos do pixelfx viram um registro estático só com os 68 ids usados (Metro não faz code-split).

### 3.7 Estado: projeção pura das sessões (revisão eng, R1)
Bugs verificados no código atual que motivam a mudança:
- `store/rpg/effects.ts:171-215`: o XP só é dado quando surge uma sessão com id novo; apagar,
  editar ou restaurar sessão não corrige.
- `ActiveQuestPanel.tsx:70`: mostra "+XP" da quest, que nunca é aplicado.
- `effects.ts:36-37`: semana calculada em UTC.

```
 sessões salvas (stored-sessions) ──┐
 escolhas COM DATA (classe, plano/  ├─► project(sessões, escolhas, today: LocalDate)  [memo]
   dias planejados, skill/itens     │        │  (pura, determinística: hash, nunca Math.random)
   equipados, crônicas vistas) ─────┘        ▼
        { xp, nível, conquistas(data = da sessão), streak, quests(semana) + XP de quest,
          corações, status, skills destravadas, bestiário, drops }
                                             │
 persistCurrentSession('workoutSession') ─► diffProjection(antes, depois)
                                             ▼          ─► eventos [levelUp, conquista, skill, drop]
                               RewardDialog / FxBurst / vibração
 editar / apagar / restaurar / migração de peso ─► recalcula em silêncio (nível pode cair, sem overlay)
```
- **Contrato de entradas (voz externa, aceito):** a projeção só lê sessões, escolhas datadas e
  `today`. Trocar de plano ou de dias da semana grava uma escolha datada (`{desde, dias}`), e os
  corações de uma semana usam a escolha vigente naquela semana; trocar de plano não reescreve o
  passado. O clima nunca entra no XP (D8 fechado: só visual). A F5 usa golpe padrão até a F6 trazer
  a skill equipada. Os multiplicadores (DR11) são calculados num *fold* cronológico: o status de cada
  sessão sai das sessões anteriores, e classe, skill e itens saem das escolhas datadas vigentes.
  A escolha `multiplicadoresDesde` impede que eles reescrevam o XP antigo.
- **Nada derivado é persistido.** Somem a chave `RpgState`, a futura `JourneyState`, o
  versionamento e o teste "derivado == incremental", porque só existe um caminho de código.
  `store/rpg/effects.ts` é reescrito na F2 e a lógica vai para `store/rpg/derive.ts` (XP, semana,
  streak, quests) e `store/journey/rules/*.ts` (F6). Os dois são funções puras com Vitest.
- **Escolhas** (slice pequena `store/choices`, com persistência por debounce): classe, skill
  equipada, itens equipados, crônicas vistas. A paleta fica em `store/settings`.
- **Backup** (decisão CEO, mantida): o restore só precisa das sessões; as escolhas vão num campo
  novo e opcional do proto. Backups antigos (inclusive do LiftLog) voltam com XP.
- **XP de quest (R3):** soma de `sessionXp` + recompensas das quests completadas em cada semana do
  histórico. Quest = função de (semana, nível no início da semana). O nível de quem já usa pode subir
  na migração; isso é esperado.
- **Data local (R2, simplificado pela voz externa):** as sessões já guardam `LocalDate`
  (`models/session-models.ts:26`). As regras recebem `today: LocalDate` injetado (o chamador usa
  `LocalDate.now()`, que segue o fuso do aparelho) e trabalham só com `LocalDate` do js-joda, sem
  biblioteca de fuso. A chave de semana ISO sai do `LocalDate`, nunca de `toISOString`. O lint
  (`no-restricted-syntax`) proíbe `toISOString().slice(0, 10)` e `new Date()` em `store/**/derive*`
  e `store/journey/rules`.
- **Migração única no lançamento (REGRESSÃO CRÍTICA):**
  - `rpgClass` sai de `RpgState` para `store/choices`;
  - `forceDarkMode` e `colorSchemeSeed` viram a paleta;
  - o resto do `RpgState` é descartado e a chave é apagada só depois do sucesso.
  Teste sobre um snapshot real do store anterior (fixture JSON). Sem isso, quem já usa perde a
  classe ou o tema.
- Memo: seletor `createSelector` sobre a referência da lista de sessões salvas (a sessão em
  andamento fica em outra slice e não dispara recálculo).

### 3.8 i18n
Todo texto novo passa pelo Tolgee (`t('…')`) com chaves em `i18n/pt.json` e `en.json`. As strings
RPG que hoje estão fixas em português (conquistas, quests, títulos, classes, abas) migram na fase em
que cada tela é tocada. O export traz um `pt.json` revisado (`source/i18n/pt.json`) que serve de base.

### 3.9 Testes de UI (e2e + regressão visual)
- O CI já roda **Cypress** contra o web (`.github/workflows/ui-test.yml`,
  `tests/cypress-tests/`), com 5 specs (sessão, plano, exercícios, feed, settings) que acham os
  elementos **pelo texto em inglês** (`cy.contains('Start workout')`) e por `aria-label`. O redesign
  troca TabBar, headers e diálogos, então cada fase precisa terminar com essa suíte verde: os
  textos `en` e os `aria-label` mudam junto com os testes, nunca às escondidas.
- E3 usa **o mesmo Cypress** e não adiciona Playwright: uma spec visita a galeria de dev
  (`?palette=…`), tira `cy.screenshot` de cada primitivo e tela e compara com a referência por um
  plugin de diff de imagem. Para a fonte renderizar igual, roda só no Linux do CI e as referências
  são geradas lá (artefato do job), com tolerância pequena. Com `EXPO_PUBLIC_FREEZE_MOTION=1`, animações, scanlines e efeitos pixelfx ficam no primeiro quadro (voz externa, aceito).
- **Sem testes de componente (R4):** toda decisão vira função pura em Vitest
  (`diffProjection`, `shouldShowChronicle`, `pickMonster`, `detectPr`, `weatherFallback`, …). A
  renderização fica com a regressão visual (E3) + Cypress, e o nativo com o checklist manual em
  Android nas F1/F4/F5.
- **Testes exigidos por fase** (além dos já citados):
  - F1: migração `forceDarkMode=false → Pergaminho` (**regressão**); contraste AA calculado por
    par de paleta (teste puro sobre `palettes.ts`).
  - F2: `derive.ts` (XP de sessão e de quest, nível, streak, chave de semana a partir de `LocalDate` na virada domingo→segunda
    de BRT); migração de `rpgClass` (**regressão**); `diffProjection` (level up, conquista, nada).
  - F4: error boundary do `FxStage` (efeito que lança erro de propósito na galeria, checado no Cypress).
  - F5: `pickMonster` determinístico; `detectPr` (primeira vez, empate, peso menor);
    e2e golpear → chefe → RewardDialog; compartilhar (web baixa PNG).
  - F6: regras da Jornada com casos de borda; e2e restore de backup LiftLog → XP recalculado;
    crônica (0 missões não aparece, semana perfeita = confete).
  - F7: clima negado, offline, cache expirado.
  - F8: PDF sem texto, 5xx/timeout do planejador; **eval** com 3 fichas reais anonimizadas como
    fixture (plano gerado tem nome, ≥ 1 treino e exercícios reconhecidos).
- A galeria precisa abrir no build web do CI. Ela é só `__DEV__` no nativo; no web fica atrás de
  uma flag de build (`EXPO_PUBLIC_DEV_GALLERY=1`) que só o CI liga.

## 4. Fases

Cada fase = um branch a partir de `feat/rebrand-gymlife-rpg` e um PR para ele, com typecheck, lint,
testes e verificação no web (desktop + 375 px) e num Android. Nenhum push sem confirmação.

### F0 — Preparação (≈1 dia)
- Instalar as fontes; gerar `pixel-icons.generated.ts`; copiar `icon_monochrome.png` se for novo
  (comparar antes os PNGs de `assets/` e `assets/fx/` com os atuais; não sobrescrever sem backup).
- `docs/redesign/` com este plano e o spec (feito).
- Tela de dev **"Galeria"** (`app/(tabs)/settings/dev-gallery.tsx`, só em `__DEV__`) que renderiza
  cada primitivo e cada tela com dados falsos, para comparar lado a lado com o export.
- **E3:** spec Cypress de regressão visual sobre a galeria (3.9), rodando no job `ui-test`.
  A F0 entrega só a infraestrutura, com o modo de movimento congelado. Não existe referência do visual antigo:
  cada primitivo ou tela ganha a referência na fase em que fica pronto, e mudanças posteriores atualizam em commit separado.
- **Aceite:** fontes carregam no web e no Android; galeria abre; job visual roda no CI (vazio até a F1).

### F1 — Fundações (≈3–4 dias) · depende de D1
- `theme/palettes.ts` + novo `useAppTheme` (3.1), `fontConfig` (3.2), `roundness: 0`.
- Seletor de paleta em Config. do app (`Segmented` com as 4) substitui `ThemeChooser` e o switch
  de modo escuro; migração: quem tinha `forceDarkMode=false` vai para Pergaminho.
- Primitivos em `components/presentation/pixel/`: `PixelBox`, `AsciiFrame`, `AsciiDivider`,
  `AsciiBar`, `PixelBar`, `Tag`, `Button`, `IconButton`, `Fab`, `Icon` (Pixelarticons), `Num`.
- `MsIconSrc` passa a desenhar Pixelarticons (3.4); overlay de scanlines; `useReducedMotion`.
- `app.json`: cor do splash e `primaryColor` da paleta Brasa.
- **Aceite:** o app inteiro abre nas 4 paletas sem texto ilegível (contraste AA medido nos pares
  texto/fundo de cada paleta); nenhuma tela quebra; galeria mostra todos os primitivos.

### F2 — Navegação e as 6 abas (≈6–7 dias, inclui a reescrita do estado RPG) · depende de D2
- `TabBar` (64px, indicador de 2px no topo, ícones do mapa de abas) no lugar do
  `BottomNavigation.Bar`; `AppHeader` (56px, borda de 1px) no `MaterialStackHeader`.
- Controles: `Switch`, `Segmented`, `Select`, `TextField`, `Stepper`, `ListItem`, `Tabs`.
- Componentes RPG existentes **restilizados no lugar** (mapa do README do design):
  `CharacterCard`+`XpProgressBar` → CharacterSheet/AsciiBar; `StatAttributeCard` → AttributeStat;
  `ActiveQuestPanel` → QuestPanel/QuestRow; `AchievementBadge`; `QuestLogItem` → SessionCard/QuestLogEntry.
- Telas: Painel (sem corações/clima/status ainda: entram na F6/F7), Treinar (lista de treinos +
  `CalendarCard`; Masmorra fica para F6), Quest Log, Guilda, Estatísticas (cores dos gráficos
  gifted-charts pela paleta), Herói/Taverna (índice).
- Projeção pura (3.7): `store/rpg/derive.ts` + `store/choices` + reescrita de `rpg/effects.ts`;
  corrige apagar/editar sessão, o XP de quest e a semana em UTC; migração de `rpgClass`.
- i18n das strings RPG tocadas.
- **Aceite:** as 6 abas batem com o export lado a lado na galeria (desktop e 375 px), navegação por
  teclado no web, zero erro novo no console.

### F3 — Rotas secundárias (≈4 dias)
- Treino: Editar treino do histórico.
- Planos: Planos, Editar plano, Editar treino, Planejador IA (composer fixo no rodapé).
- Taverna: as 7 telas de configuração; Guilda: Convite e Item compartilhado.
- Feedback: `ConfirmDialog` em todos os diálogos de confirmação, `EmptyState`, `AsciiSkeleton`
  no lugar dos loaders.
- **Aceite:** as 21 rotas atuais com o visual novo; nenhum `borderRadius` sobrando fora de exceção
  documentada.

### F4 — Runtime pixelfx (≈3–5 dias, inclui o spike) · depende de D10
- Spike (3.6) → decisão A/B registrada neste arquivo.
- `app/vendor/pixelfx` + registro estático dos 68 ids; componente `FxStage` (palco escuro, escala
  inteira, pausa fora da tela/fora de foco, quadro parado com reduced motion) e `FxBurst`
  (`UI_MOMENTS`).
- Gerar sheets (B) para os loops fixos.
- `FxStage` dentro de um error boundary próprio: se um efeito lançar exceção, ele some, registra
  no Sentry (quando ligado) e a tela segue. Um efeito quebrado nunca pode impedir registrar uma série.
- **Aceite:** galeria toca os 68 efeitos; metas de fps do spike mantidas; efeito que lança erro de
  propósito na galeria não derruba a tela.

### F5 — Sessão como combate + overlays (≈5–6 dias, +1 pela revisão de design: DR2, DR3, DR21, DR23) · depende de D5, F2 e F4
- `CombatStage` no topo da sessão: monstro por exercício (HP = séries), chefe no último,
  golpe padrão a cada série (`cycleExerciseReps`; a skill equipada substitui o golpe a partir da F6), efeito de morte ao zerar.
- `ExerciseCard`/`SetCounter` restilizados; `RestTimer` + CTA "Golpear" fixos no rodapé.
- Momentos: contagem 3-2-1 ao entrar, dano por série, combo a cada 3 séries, PR (precisa de
  detecção de PR por exercício: comparar com o histórico).
- `RewardDialog` (missão → level up) no lugar de `SessionRewardScreen`/`LevelUpOverlay`, com os
  efeitos `ui/quest-complete` e `ui/level-up`.
- Treino livre (sem plano): monstros sorteados, sem chefe.
- **E1 vibração:** reaproveita o módulo nativo que já existe
  (`modules/native-crypto/src/ReactNativeHapticsModule.ts`: `triggerClickHaptic`,
  `triggerSlowRiseHaptic`), sem dependência nova. Série = clique; PR e chefe derrotado = slow rise;
  level up = slow rise no `RewardDialog`. Switch "Vibração" em Config. do app, ligado por padrão.
- **E2 cartão compartilhável:** botão "Compartilhar" no `RewardDialog` → View fora da tela
  (herói, nível, chefe, XP, nome do treino; **sem** peso corporal, localização ou nome real) →
  `react-native-view-shot` (dependência nova) → `expo-sharing` (já instalado). No web, baixa o PNG.
- **Aceite:** fluxo Treinar → sessão → golpear até zerar → missão concluída → level up → Painel
  roda num Android médio sem queda perceptível; a sessão continua utilizável com efeitos desligados.

### F6 — Jornada: estado + telas novas (≈8–10 dias, +2 pela revisão de design: DR11, DR13, DR22) · depende de D3, D4, D6, D7
- `store/journey/rules` (3.7), entrando na projeção, com regras puras e testes: corações (D4), status Exausto/Amaldiçoado/
  Enferrujado/Fúria/Embalo, skills (20, com rastreio dos requisitos que já existem nos dados:
  missões, séries/semana, PR, nível, cardio, streak; os que dependem de peso corporal, km ou
  pomodoro ficam "em breve"), bestiário, inventário (cosmético).
- Telas e rotas novas: **Masmorra** (`(session)/map`: plano como mapa de nós), **Grimório**,
  **Bestiário**, **Inventário** (a partir do Herói ou do Painel); Onboarding de classe restilizado.
- Painel ganha `HeartBar` e `StatusBanner`.
- Backup (3.7): campo opcional novo no proto (`proto/` + regenerar `gen/`) só com as escolhas;
  depois do restore, a projeção recalcula tudo a partir das sessões.
- **E4 crônica semanal:** na primeira abertura a partir de segunda (data local), um card de tela
  cheia, que dá para pular, resume a semana anterior (missões, chefes, corações, skills novas, XP)
  com `ui/achievement`, ou `ui/confetti` na semana perfeita. Só aparece se houve ≥ 1 missão na
  semana. "Vista" fica nas escolhas persistidas, e a crônica nunca bloqueia o início de um treino.
- **Aceite:** testes das regras cobrindo os casos de borda (virada de semana, fuso, dia sem plano,
  restore de backup antigo do LiftLog → XP recalculado, mesma projeção com sessões em ordem diferente); cobertura ≥ 80%
  em `journey/rules`.

### F7 — Clima (≈1–2 dias) · depende de D8
- `WeatherBanner` com `expo-location` (permissão pedida só ao tocar no banner, não no boot) +
  Open-Meteo, uma leitura por abertura, cache de 1 h, fallback São Paulo e offline.
- Coordenadas arredondadas para 2 casas e nunca persistidas além do cache local (`PRIVACY.md`
  atualizado: localização aproximada, enviada só ao Open-Meteo).
- **Aceite:** funciona negando a permissão e offline.

### F8 — Importar PDF (≈3–4 dias) · depende de D9
- Rota `settings/pdf-import`; `expo-document-picker`; extração de texto; envio ao backend do
  Planejador IA; revisão do plano gerado (nome, treinos A/B/C, aviso "Confira as cargas") → salvar
  em Planos. Animação `scifi/scanner` + log ASCII durante o processamento real (não simulado).
- Antes do primeiro envio, um aviso curto: o texto do PDF vai ao servidor do Planejador IA e à
  OpenAI, e fichas podem ter dados de saúde (LGPD). O usuário confirma uma vez e a escolha é
  lembrada. Só o texto extraído sai do aparelho, nunca o arquivo, e o servidor não guarda nada.
- **Aceite:** um PDF de ficha real vira plano editável; erro claro para PDF escaneado sem texto.

### F9 — Transições e polimento (≈2–3 dias)
- `ScreenTransition` com o mapa de `TRANSITIONS` (troca de aba, subpágina, combate…), 2× de
  velocidade, desligável e desligado com reduced motion.
- Auditoria final: contraste AA nas 4 paletas, leitor de tela nos primitivos (`accessibilityRole`,
  rótulos), 375 px, textos em `en`.
- Atualizar `README.md`, `CLAUDE.md` (fontes, paletas, novas rotas) e `NOTICE.md`
  (Pixelarticons MIT, pixelfx MIT, fontes OFL).

**Total estimado:** ≈ 38–48 dias de trabalho (31–41 + ~5 das expansões E1–E4 e do backup + ~2 da
reescrita do estado RPG como projeção na F2), sem contar respostas às decisões.

## 5. Ordem e paralelismo

```
F0 → F1 → F2 → F3
          └→ spike F4 (pode rodar junto com F2) → F4 ─┐
          F2 ───────────────────────────────────────┴→ F5
                                    D3–D7 → F6 → F7
                                         D9 → F8
                                     F2..F8 → F9
```
F3 e F6 mexem em arquivos diferentes e podem andar em paralelo depois da F2.

## 6. Riscos

| Risco | Mitigação |
|---|---|
| Desempenho do pixelfx ao vivo no Android | spike com critério de fps antes de investir; fallback em sheets |
| Paper com `roundness: 0` e cores fixas pode deixar componentes MD3 estranhos (Menu, Dialog, Searchbar) | revisar cada componente Paper usado na galeria na F1; substituir pelos primitivos quando não der |
| Regras de jogo punitivas (corações, Exausto) desanimarem o usuário | D4 com padrões brandos; tudo desligável em Config. do app |
| Estado RPG fora do backup = perda de progresso (já acontece hoje com o `RpgState`) | projeção pura (3.7): o restore só precisa das sessões + escolhas |
| Suíte Cypress existente quebra com a troca de componentes | cada fase termina com `ui-test` verde; textos `en`/`aria-label` mudam junto com as specs (3.9) |
| Regressão visual instável por fonte/antialias | referências geradas só no Linux do CI, tolerância pequena, atualização em commit separado |
| Regra não determinística muda o passado a cada boot | `hash` em vez de `Math.random`, `agora`/fuso injetados, teste "projeção estável entre duas execuções" |
| Escopo cresce (sprites, sons, Arcano) | fora deste plano; slots listrados do design ficam como placeholder |
| Divergência com o upstream LiftLog | o fork já é independente; manter a lógica de treino intocada e concentrar o novo em `pixel/`, `journey/`, `theme/` |

## 7. Como verificar cada fase
- `npm run typecheck`, `npm run lint`, `npm test` (em background; a suíte é rápida).
- Cypress: as 5 specs e2e + a spec visual da galeria (job `ui-test`).
- Web: `preview_start app-web` (porta 8081), desktop e 375 px, console sem erros novos,
  fluxo da fase de ponta a ponta.
- Android: build de dev num aparelho médio para F1, F4 e F5 (desempenho).
- iOS: simulador nas F1 e F5 (fontes, vibração, `react-native-view-shot`, compartilhamento).
- Comparação visual com o export: a galeria de dev ao lado do `Telas GymLife RPG.html`.

## 8. Saídas das revisões (2026-11-04)

### Revisão CEO: modo SELECTIVE EXPANSION, abordagem B (ordem atual)

**Expansões (cherry-pick):** E1 vibração, E2 cartão compartilhável, E3 regressão visual e E4 crônica
semanal entraram as quatro; nenhuma foi adiada ou pulada.

| # | Seção | Achado | Decisão |
|---|---|---|---|
| C1 | Dados / backup | `ExportedDataDaoV2` não leva o `RpgState`: o restore já perde XP, nível e conquistas | Derivar das sessões + campo mínimo no proto só com as escolhas (usuário) |
| C2 | Deploy | 10 fases numa branch só, sem estratégia de lançamento | Big-bang depois da F9 (usuário) |
| C3 | Testes | 5 specs Cypress acham elementos por texto `en` e `aria-label`, e o redesign quebra essas specs | Cada fase fecha com `ui-test` verde (3.9) |
| C4 | Reuso | E1 com `expo-haptics` duplicaria o módulo nativo `GymLifeHaptics` | Reusar o módulo existente |
| C5 | Reuso | E3 com Playwright duplicaria o runner Cypress do CI | Cypress + plugin de diff de imagem |
| C6 | Erros | Uma exceção num efeito pixelfx podia derrubar a sessão | Error boundary no `FxStage` (F4) |
| C7 | Segurança / LGPD | O texto do PDF vai à OpenAI e pode ter dados de saúde | Aviso + confirmação única; só o texto sai do aparelho (F8) |
| C8 | Privacidade | O cartão compartilhável podia vazar peso, localização ou nome | Campos limitados por especificação (F5) |

**Delta para o estado ideal:** o plano entrega o visual completo e os sistemas de jogo em modo
"leve" (cosmético ou só texto). Ficam para depois:
- multiplicadores reais (TODO.md "FASE 6");
- sons;
- Arcano;
- Guilda com chefes semanais em grupo.

O caminho continua aberto porque o estado é uma projeção pura das sessões e de escolhas datadas.

**Não executado na revisão CEO:** voz externa e o loop de revisão de spec. A revisão de engenharia
cobriu os dois depois.

### Revisão de engenharia

### Já existe e é reaproveitado
| Peça | Situação |
|---|---|
| `models/session-models.ts` (`LocalDate` nas sessões) | base da projeção e de `today` (R2) |
| `store/rpg/effects.ts` (`sessionXp`, `isoWeekKey`, conquistas) | **reescrito** como `derive.ts` puro; corrige 3 bugs (3.7) |
| Módulo nativo `GymLifeHaptics` | E1 sem dependência nova |
| `expo-sharing`, `expo-document-picker`, `expo-haptics` | já instalados |
| Cypress + `ui-test.yml` | e2e + E3, sem Playwright |
| `PixelFx` + frames + `pixel-fx-frames.spec.ts` | base do caminho B |
| Backend do Planejador IA | F8 sem backend novo |

### Fora do escopo (considerado e adiado)
- ~~Multiplicadores numéricos de classe, skill, status e itens~~: trazidos para a F6 na revisão de design (DR11). O XP passado fica intacto por causa de `multiplicadoresDesde`.
- Testes de componente (RNTL), R4: o custo de manter mocks de Reanimated, Skia e Paper não se paga.
- Bônus de clima no XP, D8: o clima não é gravado na sessão.
- Modo estudo / INT / Arcano, sons, sprites próprios, backend novo.
- Distribuição: nenhum artefato novo; os workflows Android, iOS e web existentes publicam a versão big-bang.

### Modos de falha
| Caminho novo | Falha realista | Teste | Tratamento | Usuário vê |
|---|---|---|---|---|
| projeção | seletor sem memo recalcula a cada render | perf manual F2 | `createSelector` | lentidão |
| `diffProjection` | restore solta rajada de overlays | unit F2 | diff só em `workoutSession` | nada (silencioso, correto) |
| migração no lançamento | `rpgClass` perdido | unit com snapshot | apagar a chave só depois do sucesso | classe mantida |
| `FxStage` | efeito lança exceção | Cypress F4 | error boundary + Sentry | efeito some, a sessão segue |
| PR por exercício | primeira vez sem histórico | unit F5 | conta como PR? definir no teste | sem crash |
| clima | permissão negada / offline | unit F7 | fallback São Paulo + cache | banner genérico |
| PDF | escaneado sem texto / 5xx | unit + eval F8 | mensagem + retry | erro claro |
| cartão compartilhável | view-shot falha no web | e2e F5 | fallback download PNG | erro claro |

Nenhum gap crítico (sem teste, sem tratamento e silencioso ao mesmo tempo).

### Paralelização
| Passo | Módulos | Depende de |
|---|---|---|
| F1 tema/primitivos | `theme/`, `components/presentation/pixel/`, `hooks/` | F0 |
| F2 abas + projeção | `app/(tabs)/`, `store/rpg/`, `store/choices/` | F1 |
| F3 rotas secundárias | `app/(tabs)/settings/`, telas de plano | F2 |
| Spike/F4 pixelfx | `vendor/pixelfx/`, `components/presentation/fx/` | F1 |
| F6 regras da Jornada | `store/journey/rules/` | F2 |
| F7 clima / F8 PDF | `services/`, `app/(tabs)/settings/pdf-import` | F2 |

- Lane A: F0 → F1 → F2 → F3 (sequencial; componentes compartilhados)
- Lane B: spike → F4 → F5 (depois da F1; a F5 também espera a F2)
- Lane C: regras puras da F6 (depois da F2; telas da F6 depois da F5)
- Lane D: F7 e F8 (depois da F2)

Conflito: as lanes A e D tocam `app/(tabs)/settings/`, então a F3 entra antes da F8.

### Implementation Tasks
- [x] **T1 (P1, human ~2d / CC ~40min)**: `store/rpg`: projeção pura `derive.ts` + `store/choices` + reescrita de `effects.ts`
  - Origem: Arquitetura R1 + voz externa 1
  - Arquivos: `app/store/rpg/*`, `app/store/choices/*`
  - Verificar: `npm test` (derive, diffProjection)
- [x] **T2 (P1, human ~4h / CC ~15min)**: `store`: migração única de `RpgState` / `forceDarkMode` / `colorSchemeSeed`
  - Origem: regressão crítica
  - Arquivos: `app/store/choices`, `app/store/settings`
  - Verificar: teste com snapshot real
- [ ] **T3 (P1, human ~2h / CC ~10min)**: `derive`: XP de quest na projeção
  - Origem: R3 (`ActiveQuestPanel.tsx:70`)
  - Verificar: unit
- [x] **T4 (P1, human ~3h / CC ~10min)**: `derive`: `today: LocalDate` + lint `no-restricted-syntax`
  - Origem: R2 + voz externa 4
  - Arquivos: `app/store/rpg/derive.ts`, `eslint.config.*`
  - Verificar: `npm run lint`, unit na virada de semana
- [ ] **T5 (P2, human ~2h / CC ~10min)**: `diff`: overlays só em `persistCurrentSession('workoutSession')`
  - Origem: voz externa 2
  - Arquivos: `app/store/current-session/effects.ts`
  - Verificar: unit + e2e
- [ ] **T6 (P2, human ~2h / CC ~10min)**: E3: `EXPO_PUBLIC_FREEZE_MOTION` + referência por peça
  - Origem: voz externa 3
  - Arquivos: `tests/cypress-tests/`
  - Verificar: job `ui-test`
- [ ] **T7 (P2, human ~1h / CC ~5min)**: verificação iOS (simulador) nas F1 e F5
  - Origem: voz externa 4
  - Verificar: checklist §7

### Revisão de design (`/plan-design-review`, 2026-11-04)

Nota inicial 6/10. Mockups das 4 peças sem design aprovados (ver "Approved Mockups" abaixo).
Voz externa: subagent Claude (Codex não rodou), então a revisão é de modelo único.

#### Passada 1 — Arquitetura da informação (5 → 8)
- **DR1 Painel:** ordem nova, nesta sequência:
  1. CharacterSheet compacto;
  2. HeartBar e StatusBanner, só quando houver algo a dizer;
  3. card **"Próxima missão"** com Button lg "Iniciar" ou "Retomar" (treino sugerido do plano ativo);
  4. quests;
  5. atributos;
  6. conquistas.

  O clima desce para uma faixa de 48 px abaixo das quests. Sai a ação "Avisos" do AppHeader
  (não existe central de avisos). Afeta a F2.
- **DR2 Sessão a 375×667:**
  - o CombatStage colapsa para uma faixa de 64 px depois do 1º golpe (tocar expande);
  - o rodapé fixo tem no máximo 120 px;
  - o botão diz o que grava ("Golpear · 5 × 100 kg") e abre um Toast "Desfazer" de 4 s;
  - a contagem 3-2-1 do descanso não bloqueia toque e não toca ao retomar a sessão.

  Afeta a F5.
- **DR3 Fila de recompensas:** RewardDialog paginado, com no máximo 3 páginas:
  1. Missão;
  2. Level up, se houver;
  3. "Espólio" (conquistas, skills prontas e drops, em lista).

  "Pular" fica sempre visível e "Compartilhar" aparece na última página. A crônica semanal (E4)
  nunca abre na mesma abertura do RewardDialog; fica para a próxima. Afeta a F5 e a F6.
- **DR4 Atributos cumulativos:** STR, DEX, CON e STA mostram o total da vida (ou um nível derivado
  dele), com o subtítulo "esta semana +N". É uma fórmula pura a mais em `derive.ts`, com teste.
  Afeta a F2 (T1).
  - **Revisado em 2026-11-09 (decisão do produto):** o herói **pode** ficar mais fraco. Depois de
    14 dias sem treinar ele perde XP (logo, nível e título) e atributos (CON etc.). A perda começa
    pequena e acelera: 1% no dia 14, dobrando a cada 7 dias (2% no 21, 4% no 28, 16% no 42), teto
    de 80%. Regra pura em `app/store/rpg/decay.ts` (`DECAY` tem os 4 knobs). Enquanto parado, o XP
    mostrado já vem descontado (`selectEffectiveXp`); ao voltar a treinar, `applyInactivityDecay`
    grava a perda antes do XP novo. Os atributos descontam cada pausa de 14+ dias do histórico.

#### Passada 2 — Estados de interação (4 → 8)
- **DR5 Tabela de estados:** a tabela abaixo entra no aceite da fase de cada tela. Regras:
  - o AsciiSkeleton só aparece depois de 300 ms de carga real, nunca carga simulada;
  - o texto vem do i18n.

| Tela | Carregando | Vazio / 1º uso | Erro / offline |
|---|---|---|---|
| Painel | — (dado local) | nível 1 sem plano: card "Escolha um plano para a primeira missão" + "Ver planos"; sem quests: "Nenhuma missão nesta semana" | clima: faixa "Céus desconhecidos" |
| Sessão | — | treino livre: monstros sem chefe (DR21) | — |
| Masmorra | — | sem plano: "Nenhuma masmorra aberta" + "Ver planos" | — |
| Bestiário | — | monstros não vistos como "???" em silhueta; nenhum visto: "Treine para encontrar monstros" | — |
| Grimório | — | skills bloqueadas com cadeado + requisito ("Bloqueada · nível 5") | — |
| Inventário | — | 0/15: grade vazia + "Derrote chefes para ganhar espólio" | — |
| Stats | — | menos de 2 sessões: "Treine mais para ver tendências", sem gráfico vazio | — |
| Histórico | — | "Nenhuma missão registrada" + "Iniciar" | — |
| Guilda | skeleton > 300 ms | feed desligado: explica o opt-in + "Ativar"; sem posts: "A guilda está quieta" | inline + "Tentar" |
| Planejador IA | skeleton > 300 ms | — | inline + "Tentar"; aviso LGPD antes do envio |
| Importar PDF | progresso real | — | escaneado sem texto: mensagem própria; 5xx: inline + "Tentar" |

- **DR6 Inventário:** 15 slots (grade 5×3) e contador "0/15". O 16º item em diante abre uma 2ª
  página. Não há regra de capacidade na v1.
- **DR7 Erro e offline:** o erro aparece inline, no lugar do conteúdo: ícone, uma frase e "Tentar".
  - Nunca uma tela inteira de erro e nunca dado falso.
  - Clima offline mostra "Céus desconhecidos"; o fallback de local tem o rótulo "São Paulo (padrão)".
  - Ação do usuário que falha usa o Toast de erro aprovado.

#### Passada 3 — Jornada e arco emocional (5 → 8)
- **DR8 Corações sem punição retroativa:** a escolha datada `coracoesDesde` entra em `store/choices`.
  - Ela é gravada na 1ª abertura com a feature; nada antes dela conta na projeção.
  - Coração perdido: na abertura seguinte, o app toca `ui/heart-lost` e mostra a frase
    "Faltou na Forja de qua 29/10". O "último estado visto" fica guardado para não repetir o aviso.
  - Corações desligados escondem HeartBar e StatusBanner e mostram o ListItem
    "Defina dias de treino…".

  Afeta a F6 (regra pura com teste na virada de `coracoesDesde`).
- **DR9 Recálculo visível:**
  - Na 1ª abertura pós-migração aparece um card de boas-vindas, no mesmo componente do placar E4:
    "Sua jornada foi recalculada · nível 8 · 42 missões".
  - Se uma edição de sessão antiga baixar o nível, aparece o Toast
    "Histórico recalculado · nível 8". Não existe overlay de level down.

  Afeta a F2 (migração T2) e a F6.
- **DR10 Onboarding:** o welcome-wizard existente é restilizado, sem passo novo.
  - O passo 1 é a escolha de classe do export, com retrato.
  - Os passos 2 a 4 são as páginas atuais (crash reports, localização, notificações + feed) com o
    visual novo e a mesma lógica de consentimento.

  Afeta a F3.

#### Passada 4 — Visual genérico e promessas falsas (5 → 8)
- **DR11 Multiplicadores na F6 (decisão do usuário, contra a recomendação):** o D3 é implementado
  na F6. Entram classe, skill, status e itens, somados, com teto de ±50%, num *fold* cronológico
  puro (§3.7).
  - Só valem sessões a partir de `multiplicadoresDesde` (escolha datada).
  - O clima continua fora do XP (D8), e a Tag de clima não mostra %.
  - D6 e D7 foram atualizados. O TODO.md "FASE 6" foi marcado como incorporado.
  - Testes:
    - empilhamento (soma, teto e piso);
    - sessão antes e depois de `multiplicadoresDesde`;
    - troca de classe no meio do histórico;
    - Exausto aplicado só às sessões dentro do período.
  - Regra de UI: todo ±% que aparece na tela tem que vir da mesma função que calcula o XP. Nenhum
    número decorativo.
- **DR12 Sem listras no lançamento:**
  - retrato = quadro parado do herói pixelfx, na cor da classe;
  - item = glifo Pixelarticons na cor da raridade;
  - Masmorra = nós e linhas, sem tilemap.
- **DR13 Energia = recuperação:** 5 pontos. Cada dia seguido de treino gasta 1 e cada dia de
  descanso devolve 2.
  - Com 0–1 ponto, o card "Próxima missão" mostra "Dia de descanso recomendado". Não bloqueia nada
    e não tira XP.
  - O Respiro devolve +1.
  - É derivada só das datas das sessões, como regra pura em `store/journey/rules/energy.ts`, com
    teste.
- **DR14 Texto dos FX:** `t()` + `toFxText()` (NFD, sem diacríticos, caixa alta), com teste
  unitário. Resolve o conflito entre o D10 e o §3.8.

#### Passada 5 — Sistema de design (6 → 9)
- **DR15 Catálogo:**
  - Toast, cartão E2 (pôster do chefe) e placar E4 entram no §B do design-spec (tokens, medidas,
    estados) e na galeria da F1.
  - Não são portados, porque não têm tela ou gatilho:
    - QuestLogEntry e Stepper;
    - as transições star-iris, crt-off, burn-away e shatter-wipe;
    - os momentos de UI sem gatilho.
- **DR16 Tokens corrigidos no tema:**
  - escola Luz = `attr-con`;
  - degrau = 2 px;
  - cada paleta define o seu `attr-*` e o seu glow (no Ferro, atributos em tons de cinza + ícone);
  - teste: as 4 paletas têm o mesmo conjunto de chaves.

#### Passada 6 — Responsivo e acessibilidade (4 → 7)
- **DR17 Contraste:** os tokens são ajustados até ≥ 4,5:1 em todas as superfícies.
  - Valores de partida para o text-3, a revalidar:
    - Brasa ~#9a9282;
    - Ferro ~#8f8a80;
    - Fósforo ~#a07a40;
    - Pergaminho ~#66594a.
  - Texto vermelho usa `danger-strong`; texto accent no Pergaminho usa `accent-strong`.
  - Teste Vitest: matriz texto × superfície das 4 paletas. Afeta a F1.
- **DR18 Leitor de tela e escala de fonte: adiado para a F9 (decisão do usuário).** A F9 ganha:
  - `progressbar` nas barras ASCII e pixel;
  - `header` no AsciiDivider;
  - FX e scanlines escondidos do leitor;
  - live region na sessão;
  - teto de escala de 1,3× nos títulos e `minHeight` no lugar de altura fixa;
  - rótulo da TabBar com no mínimo 10 px.

  Risco aceito: retrabalho nos componentes da F1–F5.
- **DR19 Toque, cor e flash:**
  - CalendarCard com célula de 44 px e `hitSlop` nos alvos pequenos;
  - série falhada com ícone (×) além da cor;
  - efeitos com mais de 3 flashes/s cortados ou desacelerados. O spike pixelfx mede isso.

  Afeta a F1, a F4 e a F5.
- **DR20 Movimento e web:**
  - ajuste "Efeitos: Completo / Reduzido / Desligado" na F1, que já parte do `reduceMotion` do
    sistema;
  - vibração em ajuste separado;
  - troca de aba sem transição (ou fade ≤ 150 ms);
  - web com coluna máxima de 560 px centralizada.

#### Passada 7 — Decisões em aberto (5 → 8)
- **DR21 Combate (completa o D5):** regras puras, com teste na F5.
  - Reps > 0 tira 1 HP; reps = 0 é "esquiva" (sem dano e sem punição).
  - Desmarcar a série devolve o HP.
  - Monstro vivo ao finalizar "foge": fica como visto no Bestiário, sem drop.
  - Série parcial = série prevista sem registro.
  - Treino livre tem monstros e nenhum chefe.
- **DR22 Masmorra com chefe (decisão do usuário, contra a recomendação):**
  - os nós são os treinos do ciclo do plano ativo, e o nome de cada um é o nome do treino;
  - o nó atual é o próximo sugerido (o mesmo do card "Próxima missão");
  - o **último treino do ciclo é o nó de chefe**;
  - concluir esse treino conta uma "masmorra limpa" e o mapa recomeça;
  - o contador sai das sessões (vezes em que o último treino do ciclo foi feito), puro e com teste;
  - largura de 100%; sem tilemap (DR12).

  **Dois chefes, papéis distintos:** o chefe de sessão (D5, último exercício) é o que aparece no
  cartão E2. O chefe de masmorra (último treino do ciclo) é o que a caixa "chefes" do placar E4
  conta, como masmorras limpas na semana.
  Ao vencer o chefe de masmorra, o RewardDialog mostra a página "Masmorra limpa ×N" (dentro do limite de
  3 páginas do DR3, no lugar de "Espólio" quando os dois existirem, com o espólio em lista na mesma
  página).
- **DR23 Descanso:** o timer visual usa o tempo configurado no exercício. 120 s é só o padrão de
  quem nunca configurou. O 3-2-1 segue o DR2.
- **DR24 Cartão E2:** 1080×1350 (4:5), sempre na paleta Brasa. Sem peso, sem localização e sem
  nome, como no mockup aprovado.
- **DR25 Títulos de nível:** a tabela `titleForLevel` (`app/store/rpg/index.ts`) já existe. Ela vai
  para o i18n e o level up passa a mostrar o título do novo nível (corrige o F.3 #11).

#### Fora do escopo (design)
- Leitor de tela e escala de fonte antes da F9 (DR18): decisão do usuário, com risco de retrabalho.
- Sprites próprios (retratos, itens, tiles): TODO.md; o DR12 cobre o lançamento.
- Componentes, transições e momentos de UI sem gatilho (DR15).
- Clima no XP (D8 mantido): exigiria gravar o clima na sessão e permitiria abuso.
- Mockups das 29 telas: o export já é a referência; só as 4 peças sem design ganharam esboço.

#### Já existe e é reaproveitado (design)
- `docs/redesign/design-spec.md` faz o papel de DESIGN.md (tokens §A, componentes §B, telas §C,
  regras §D).
- `welcome-wizard.tsx` (4 páginas): restilizado no DR10.
- `snackbar-provider.tsx`: vira a base do Toast (DR15), sem segundo sistema de aviso.
- `titleForLevel` (`store/rpg/index.ts`): títulos do level up (DR25).
- Descanso configurável por exercício: o timer do DR23.

#### Implementation Tasks (design)
- [ ] **TD1 (P1, human ~3h / CC ~15min)** — `theme` — contraste ≥ 4,5, `attr-*`/glow por paleta, teste de matriz e de chaves
  - Origem: Passadas 5/6, DR16 + DR17 · Arquivos: `app/theme/*`, teste Vitest · Verificar: `npm test`
- [ ] **TD2 (P1, human ~4h / CC ~20min)** — `Painel` — nova ordem + card "Próxima missão" + faixa de clima de 48 px
  - Origem: Passada 1, DR1 · Arquivos: Painel em `app/app/(tabs)/`, `components/presentation/pixel/` · Verificar: e2e + E3
- [ ] **TD3 (P1, human ~3h / CC ~15min)** — `derive` — atributos cumulativos + "esta semana +N"
  - Origem: Passada 1, DR4 (revisado 2026-11-09: perda por inatividade) · Arquivos: `app/store/rpg/derive.ts`, `decay.ts` · Verificar: unit
- [ ] **TD4 (P1, human ~1d / CC ~30min)** — `journey/rules` — multiplicadores no fold cronológico + `multiplicadoresDesde`
  - Origem: Passada 4, DR11 · Arquivos: `app/store/journey/rules/multipliers.ts`, `derive.ts`, `store/choices` · Verificar: unit (soma, teto, piso, antes/depois da data, troca de classe)
- [ ] **TD5 (P1, human ~4h / CC ~20min)** — `journey/rules` — `coracoesDesde` + último estado visto + aviso "Faltou na…"
  - Origem: Passada 3, DR8 · Arquivos: `app/store/journey/rules/hearts.ts`, `store/choices` · Verificar: unit
- [ ] **TD6 (P1, human ~1d / CC ~30min)** — `sessão` — regras de combate puras + layout compacto + "Golpear · 5 × 100 kg" + Desfazer + descanso configurado
  - Origem: Passadas 1/7, DR2 + DR21 + DR23 · Arquivos: `app/app/(tabs)/(session)/`, `store/journey/rules/combat.ts` · Verificar: unit + e2e a 375×667
- [ ] **TD7 (P1, human ~4h / CC ~20min)** — `RewardDialog` — no máximo 3 páginas, "Pular", "Compartilhar", masmorra limpa, crônica adiada
  - Origem: Passadas 1/7, DR3 + DR22 · Arquivos: overlays em `components/smart/` · Verificar: unit da fila + e2e
- [x] **TD8 (P2, human ~3h / CC ~15min)** — `Toast` — sobre o `snackbar-provider`, sucesso/erro, live region
  - Origem: Passada 5, DR15 (mockup aprovado) · Arquivos: `components/smart/snackbar-provider.tsx` · Verificar: galeria F1 + E3
- [ ] **TD9 (P2, human ~1d / CC ~30min)** — `telas` — tabela de estados (vazio, erro, offline, skeleton > 300 ms)
  - Origem: Passada 2, DR5 + DR7 · Arquivos: cada tela da F2/F3/F7/F8 · Verificar: checklist de aceite por fase
- [ ] **TD10 (P2, human ~3h / CC ~15min)** — `journey/rules` — energia de recuperação + masmorra limpa ×N
  - Origem: Passadas 4/7, DR13 + DR22 · Arquivos: `store/journey/rules/energy.ts`, `dungeon.ts` · Verificar: unit
- [ ] **TD11 (P2, human ~2h / CC ~10min)** — `fx` — `toFxText` + textos via `t()` + limite de 3 flashes/s
  - Origem: Passadas 4/6, DR14 + DR19 · Arquivos: `components/presentation/fx/` · Verificar: unit + medição no spike
- [ ] **TD12 (P2, human ~4h / CC ~20min)** — `migração/onboarding` — card de boas-vindas, Toast de recálculo, wizard restilizado, títulos no i18n
  - Origem: Passadas 3/7, DR9 + DR10 + DR25 · Arquivos: `welcome-wizard.tsx`, `store/rpg/index.ts`, i18n · Verificar: unit da migração + e2e
- [ ] **TD13 (P2, human ~3h / CC ~15min)** — `config/web` — "Efeitos: Completo/Reduzido/Desligado", vibração separada, coluna de 560 px, alvos de 44 px, ícone ×
  - Origem: Passada 6, DR19 + DR20 · Arquivos: `app/app/(tabs)/settings/`, layout raiz · Verificar: e2e web + 375 px
- [ ] **TD14 (P2, human ~2h / CC ~10min)** — `share` — cartão E2 1080×1350 na Brasa
  - Origem: Passada 7, DR24 · Arquivos: componente do cartão + `expo-sharing` · Verificar: e2e (fallback web)
- [ ] **TD15 (P2, human ~1d / CC ~30min)** — `a11y` — pacote da F9 (progressbar, header, FX oculto, live region, escala 1,3×, TabBar ≥ 10 px)
  - Origem: Passada 6, DR18 (adiado) · Arquivos: primitivos `pixel/` · Verificar: TalkBack/VoiceOver + fonte de 200%

## Approved Mockups

| Peça | Mockup | Direção | Restrições |
|---|---|---|---|
| E2 cartão compartilhável | `~/.gstack/projects/luizr/designs/pecas-sem-design-20261104/board.html` (seção E2-A) | Pôster do chefe: AsciiFrame "MISSAO CONCLUIDA", quadro do CombatStage, XP dourado em 40 px, tags | 1080×1350, sempre Brasa, sem peso/localização/nome (DR24); "CHEFE" = chefe de sessão (D5) |
| E4 crônica semanal | mesmo arquivo (seção E4-B) | Placar de 7 dias: células de 44 px, 3 caixas (missões/chefes/XP), skill nova em success | "Pular" ghost + "Continuar jornada"; nunca na mesma abertura do RewardDialog (DR3); caixa "chefes" = masmorras limpas na semana (DR22) |
| Toast | mesmo arquivo (seção Toast) | Acima da TabBar (bottom 84), ícone + texto; sucesso com "Desfazer"; erro em danger-wash com "Tentar" | some em 4 s; erro com ação fica até o toque; `accessibilityLiveRegion="polite"` |
| Aviso LGPD (Planejador IA / PDF) | mesmo arquivo (seção LGPD) | ConfirmDialog de 3 degraus, 4 itens; "Cancelar" / "Entendi, enviar" | aparece antes do 1º envio; escolha gravada |

Escolhas gravadas em `.../pecas-sem-design-20261104/approved.json`. São esboços HTML (o designer
do gstack não tinha chave OpenAI), não PNG.

#### Completion Summary
```
  +====================================================================+
  |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | sem DESIGN.md; design-spec.md faz o papel   |
  | Step 0               | 6/10; foco: as 7 passadas                   |
  | Pass 1  (Info Arch)  | 5/10 → 8/10 after fixes                    |
  | Pass 2  (States)     | 4/10 → 8/10 after fixes                    |
  | Pass 3  (Journey)    | 5/10 → 8/10 after fixes                    |
  | Pass 4  (AI Slop)    | 5/10 → 8/10 after fixes                    |
  | Pass 5  (Design Sys) | 6/10 → 9/10 after fixes                    |
  | Pass 6  (Responsive) | 4/10 → 7/10 after fixes (a11y na F9)       |
  | Pass 7  (Decisions)  | 5 resolved, 0 deferred                     |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (5 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 1 item proposed (aceito)                    |
  | Approved Mockups     | 6 esboçados, 4 approved                     |
  | Decisions made       | 25 added to plan (DR1–DR25)                 |
  | Decisions deferred   | 1 (DR18, para a F9)                         |
  | Overall design score | 6/10 → 8/10                                 |
  +====================================================================+
```
A Passada 6 fica em 7 porque o usuário adiou o leitor de tela e a escala de fonte para a F9.
DR11 e DR22 foram escolhas do usuário contra a recomendação e já estão refletidas no D3, D6, D7 e §3.7.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | 4 propostas, 4 aceitas, 0 adiadas; 8 achados (backup, release, Cypress, reuso, erros, LGPD) |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | ISSUES (Claude subagent; Codex bloqueado pela política de permissões) | 8 achados: 5 aceitos (1, 3, 4, 6, 8), 1 já corrigido (5), 1 rejeitado (7: mantém spike A), 1 parcial (2 junto com 1) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 12 achados, 0 gaps críticos; R1 projeção pura, R2 data local, R3 XP de quest, R4 testes puros + visual (R = decisões da revisão eng; D = decisões de produto do §2) |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (PLAN) | nota 6/10 → 8/10, 25 decisões (DR1–DR25); 4 mockups aprovados; DR18 (a11y de leitor/fonte) adiado para a F9 |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** as vozes externas (eng e design) vieram de outro contexto do mesmo modelo
  (Claude), então não houve cruzamento de modelos. Na revisão de design, a voz externa trouxe
  15 achados, quase todos coincidentes com os meus.
- **Mudanças sobre a revisão eng:** a pedido do usuário, o DR11 traz os multiplicadores (D3) para
  a F6. Eles são calculados num fold cronológico puro, com `multiplicadoresDesde`, e o clima
  continua fora (D8). O TODO.md "FASE 6" foi marcado como incorporado.
- **Pendências de produto (não bloqueiam o plano):** D1 e D9 (§2) seguem com proposta padrão.
  D3, D8 e D10 foram fechados; D2, D4, D5, D6 e D7 foram complementados pelas DRs da revisão de design.
  As estimativas da F5 (+1 dia) e da F6 (+2 dias) já foram ajustadas. Cada uma bloqueia só a sua fase.
- **VERDICT:** CEO + ENG + DESIGN CLEARED, pronto para implementar a partir da F0 depois da sua
  aprovação.

NO UNRESOLVED DECISIONS
