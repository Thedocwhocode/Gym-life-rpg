# GymLife RPG: digest do export do Claude Design (para portar ao React Native)

Fonte: `scratchpad/design-zip` (lido como texto, nada executado). Mockups web (React 18 + CSS vars, frame 390×844).
Contagens reais (o README está desatualizado e fala em "29 componentes"):
- **48 componentes** (core 8, progress 2, forms 5, navigation 4, feedback 3, rpg 9, session 5, world 3, fx 4, journey 5).
- **29 ids de tela** na galeria: 27 são telas e 2 são overlays (`reward`, `levelup`, ambos `RewardDialog`).
- **71 ids pixelfx distintos** (68 em `.jsx`; 3 só no card de demo `fx.card.html`). Todos existem em `vendor/pixelfx/src/fx/`.
- **43 ícones usados** dos 79 Pixelarticons, todos presentes em `assets/icons/`.

---

## A. Tokens

### A.1 Cores por paleta (alias semântico → hex)
Como cada tema é ativado: Brasa = `:root` (padrão), `[data-palette="ferro"]`, `[data-palette="fosforo"]`, `[data-theme="pergaminho"]` (claro). "herda" quer dizer que a paleta não sobrescreve o token e o valor da Brasa vale.

| alias | Brasa | Ferro | Fósforo | Pergaminho |
|---|---|---|---|---|
| bg-app | #0b0c0d | #0c0c0c | #0a0907 | #e6dcc5 |
| bg-sunken | #111315 | #111111 | #0e0c09 | #ddd1b6 |
| surface-1 | #16191b | #161616 | #13110c | #efe7d4 |
| surface-2 | #1c2023 | #1d1d1d | #1a1710 | #f5efe1 |
| surface-3 | #252a2e | #262626 | #241f15 | #d8cbad |
| surface-overlay | rgba(6,7,8,.82) | herda | herda | rgba(42,33,24,.55) |
| line-1 | #31373c | #333333 | #3a3021 | #c2b393 |
| line-2 | #454c52 | #4a4a4a | #574629 | #a39273 |
| line-frame | #c98a35 | #8c877d | #b9832f | #8a5a1c |
| line-focus | #f4c97a | #efe9db | #ffd38a | #5e3a0e |
| text-1 | #efe9db | #efe9db | #ffc46b | #2a2118 |
| text-2 | #b3ab99 | #aaa499 | #c9944a | #54473a |
| text-3 | #8a8374 | #7f7a71 | #8d6a37 | #7a6b5a |
| text-disabled | #635e54 | herda | herda | #a89a85 |
| text-on-accent | #0b0c0d | herda | herda | #f5efe1 |
| text-on-danger | #efe9db | herda | herda | herda |
| accent | #e6a94f | #efe9db | #ffb547 | #94591a |
| accent-strong | #f4c97a | #ffffff | #ffd38a | #6e3f0d |
| accent-muted | #7a5322 | #4a4741 | #6b4c1e | #c9a671 |
| accent-wash | #2e2111 | #1f1e1b | #2a1f0e | #e8d6b0 |
| danger | #cc4a3a | #c2362b | #e2513c | #9a2c21 |
| danger-strong | #e0705f | #de5446 | #ff7a63 | #7a1f17 |
| danger-deep | #a8342a | #8f241c | #a8342a | #6b1f1a |
| danger-wash | #2a110f | #2a100d | #2c120d | #ecd0c4 |
| success | #86a95c | #c9c3b5 | #d8c06a | #4f6d2c |
| success-wash | #1a2214 | herda | herda | #dbe0c2 |
| reward | #e8c15a | #efe9db | #ffd38a | #94591a |
| steel | #9aa3ab | herda | herda | #5d6670 |
| bar-xp | #e6a94f | #efe9db | #ffb547 | #94591a |
| bar-energy | #86a95c | #8c877d | #d8c06a | #4f6d2c |
| bar-hp | #cc4a3a | #c2362b | #e2513c | #9a2c21 |
| bar-track | #252a2e | #262626 | #241f15 | #d3c4a3 |
| attr-str | #d8683f | herda | herda | #a5431f |
| attr-dex | #b3b85a | herda | herda | #6e7124 |
| attr-con | #cf4a44 | herda | herda | #9a2c21 |
| attr-sta | #5fae6e | herda | herda | #2f6e3c |

Rampas base da Brasa (as telas usam os nomes crus em alguns pontos):
- carvão 950 #0b0c0d · 900 #111315 · 850 #16191b · 800 #1c2023 · 700 #252a2e · 600 #31373c · 500 #454c52 · 400 #5f676e
- osso 100 #efe9db · 200 #d9d1bf · 300 #b3ab99 · 400 #8a8374 · 500 #635e54
- âmbar 300 #f4c97a · 400 #e6a94f · 500 #c98a35 · 700 #7a5322 · 900 #2e2111
- sangue 300 #e0705f · 400 #cc4a3a · 500 #a8342a · 700 #6b1f1a · 900 #2a110f
- aço 300 #c4ccd3 · 400 #9aa3ab · 500 #6f7880; musgo 300 #a9c77f · 400 #86a95c · 700 #3f5229; ouro 400 #e8c15a

**Cores fixas que não mudam com a paleta** (é de propósito: o palco de FX é sempre escuro):
- `#0b0c0d` no fundo de FxStage, StatusBanner, MonsterCard e WeatherBanner e nos rótulos sobre os palcos.
- `#b3ab99` e `#efe9db` nos textos do WeatherBanner.
- glows fixos em âmbar `rgba(244,201,122,…)`, que continuam âmbar em Ferro e Pergaminho; o glow do MapNode boss é fixo `rgba(204,74,58,.5)`.

### A.2 Tipografia
- Famílias: display = `Pixelify Sans` (500–600: títulos, botões, nome do herói); mono = `Space Mono` (todo o resto). Regra: **números ≥ 20px em Space Mono 700**.
- Tamanhos: hero 56 · display 40 · title-lg 26 · title 20 · title-sm 16 · body-lg 15 · body 13 · small 12 · label 11 · micro 10.
- Line-heights: tight 1.05 · snug 1.25 · body 1.55. Tracking: label .14em · title .02em · ascii 0.

| estilo | peso / tamanho / lh / família |
|---|---|
| type-hero | 600 56/1 display |
| type-display | 600 40/1.05 display |
| type-title-lg | 600 26/1.25 display |
| type-title | 600 20/1.25 display |
| type-title-sm | 500 16/1.25 display |
| type-body-lg | 400 15/1.55 mono |
| type-body | 400 13/1.55 mono |
| type-small | 400 12/1.45 mono |
| type-label | 700 11/1.3 mono (CAIXA ALTA, tracking .14em) |
| type-micro | 400 10/1.3 mono |
| type-stat | 700 22/1 mono |
| type-ascii | 400 13/1.2 mono |

Valores avulsos que se repetem nos componentes:
- números grandes em 700 26/1 mono (Stepper, AttributeStat, RestTimer, temperatura);
- rótulo de botão em 500 {14|16|20}px display, `letter-spacing .04em`, uppercase;
- rótulo da TabBar em 700 9/1 mono, `.1em`.

### A.3 Espaçamento e medidas
- Escala de 4px: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 60, 64. Margem de página 16.
- `--px` 4px é a unidade de arte; mesmo assim, PixelBox usa px=2 por padrão.
- Alturas: hit-min 44 · tabbar 64 · appbar 56. Frame de referência 390×844, status bar mock de 40.

### A.4 Bordas e cantos em degrau
- **Sem border-radius em lugar nenhum.**
- Bordas: 1px (hairline) para ASCII e divisores; 2px para caixas pixel (PixelBox `px=2`); tracejado `1px dashed line-1` separa sub-blocos; leaders pontilhados `1px dotted line-2` ligam rótulo e valor.
- Degraus (`stepClip(n,u)`): **1 degrau** em controles ≤ 48px (IconButton, Switch, TextField, Select, Segmented, SetCounter, bolha de chat); **2** em cards e botões (padrão); **3** em diálogos (ConfirmDialog, RewardDialog, card de convite).
- Como é montado:
  - PixelBox = camada externa com o fundo da borda e clip `stepClip(steps, px)`, padding = px;
  - camada interna com o fill e clip `stepClip(steps-1, px)`;
  - polígono com n degraus de u px por canto.
- Token inconsistente: `--step: 4px` / `--clip-step` usam 4px, mas o README e o PixelBox usam degraus de 2px. Vale o de 2px.
- MapNode usa `stepClip(2,3)` por fora e `stepClip(2,2)` por dentro.

### A.5 Sombras e brilho
- Sombras sempre duras e sem blur:
  - `--shadow-px` 0 4px 0 rgba(0,0,0,.55); `--shadow-px-lg` 0 8px 0 rgba(0,0,0,.6);
  - no PixelBox, `shadow` aplica `drop-shadow(0 4px 0 rgba(0,0,0,.55))`;
  - `--shadow-inset-px`: inset 0 -2px 0 rgba(0,0,0,.35) + inset 0 2px 0 rgba(255,255,255,.06), usado nos botões.
- Brilhos:
  - `--glow-reward` 0 0 10px rgba(244,201,122,.35) + 0 0 2px rgba(244,201,122,.6);
  - `--glow-text` 0 0 8px rgba(244,201,122,.45);
  - `--glow-danger` 0 0 14px rgba(204,74,58,.35);
  - PixelBox `glow`: drop-shadow 0 0 6px rgba(244,201,122,.45);
  - PixelBar `glow`: 0 0 4px rgba(244,201,122,.5).
- Regra: brilho só dourado e só em recompensa.

### A.6 Texturas
- scanlines: linha de 1px a 2.5% de branco a cada 3px, sobre a tela inteira (z 60).
- dither: Bayer 2×2, preto a 35%, tile de 4×4.
- grão: feTurbulence, 120×120, alfa 0.05.
- vinheta: radial-gradient(120% 90% at 50% 30%, transparente 55% → rgba(0,0,0,.55)).
- Placeholder listrado: `repeating-linear-gradient(135deg, surface-2 0 6px, bg-sunken 6px 12px)`, com 4/8px em InventorySlot e 8/16px no mapa.

### A.7 Movimento
- Durações: dur-1 120ms · dur-2 240ms · dur-3 400ms · dur-xp 800ms.
- Easing: ease-step `steps(4,end)` (padrão) · ease-step-fine `steps(8,end)` (barras) · ease-fade `cubic-bezier(.2,0,0,1)` (só fades de overlay).
- Keyframes:
  - `gl-rise`: translateY 8px→0 + fade, em degraus; diálogos usam dur-2/dur-3.
  - `gl-shake`: ±2px.
  - `gl-blink`: 50% on/off.
  - `gl-pulse-glow`.
- Onde aparece:
  - PixelBar: largura em 800ms steps(8);
  - knob do Switch: left em 240ms steps(4);
  - indicador da TabBar: largura em 120ms steps(4);
  - AsciiSkeleton: tick de 90ms;
  - sprites FX a 30fps;
  - ScreenTransition em speed 2 (~0,4 a 0,7s até cobrir).
- Pressionar: Button desce 4px e perde a sombra; IconButton desce 2px. Hover = brightness(1.12).
- Foco ou próxima série: outline `1px dashed accent` com offset 3.
- `prefers-reduced-motion`: animações ficam em 0,01ms, o FxStage mostra um quadro parado, PixelFx não renderiza e transições não rodam.

---

## B. Componentes (48)

Legenda **[WEB]** = técnica só da web e o que ela precisa no RN.

Equivalências que valem para todos os componentes (citadas só pela sigla):
- **clip** = clip-path em degrau. No RN: componente `PixelBox` próprio, com Views empilhadas nos cantos ou um polígono via react-native-svg/Skia.
- **dshadow** = drop-shadow duro. No RN: View duplicada deslocada 4px; `elevation` não serve (borra).
- **grad** = repeating/linear-gradient. No RN: expo-linear-gradient, Image tile ou shader Skia.
- **steps** = steps() easing. No RN: Reanimated `Easing.steps(n)`, conferir disponibilidade, ou interpolação manual.
- **mask** = mask-image. No RN: N Views segmentadas.

### core/
| comp | propósito | props (.d.ts) | regras RN | mapeia p/ app |
|---|---|---|---|---|
| PixelBox | contêiner N2 com cantos em degrau | tone default\|raised\|sunken\|accent\|danger\|success, border, fill, px=2, steps=2, padding=12, shadow, glow, texture dither\|grain, style, innerStyle | Tons: default line-1/surface-1, raised line-2/surface-2, sunken line-1/bg-sunken, accent accent/accent-wash, danger, success. Glow só em recompensa. **[WEB]** clip, dshadow, filter glow (no RN, Skia blur ou omitir), textura data-URI SVG | novo (base de tudo) |
| Icon | glifo Pixelarticons, fill=currentColor | name, size(24/48), color, title, style | **[WEB]** busca SVG por fetch e injeta com innerHTML. No RN: react-native-svg + mapa estático de paths (remover o metadata c2pa de ~7,5 KB por arquivo). Usar 24 ou 48, 16 só em linhas densas | substitui ms-icon-source (Material Symbols) |
| AsciiFrame | moldura N1: hairline 1px, ticks `+` 11px nos cantos, nós `+===+` / `+== TÍTULO ==+` | title, knots=true, footer=true, tone frame\|muted\|danger\|reward, bg (tem que ser igual ao fundo), padding=16 | nó com fundo opaco que mascara a linha; tick montado com 2 gradientes (no RN, 2 Views de 1px). 1 a 2 por tela | novo |
| AsciiDivider | cabeçalho de seção `▸ LABEL ────` ou nó central | label, align center\|left, tone frame\|muted\|danger, meta | linha de 1px na cor line-frame; rótulo type-label text-2; meta text-3 | novo |
| Button | botão pixel com sombra dura que afunda 4px | variant primary\|danger\|secondary\|ghost, size sm(36)\|md(44)\|lg(56), icon, iconRight, block, disabled, onClick, type | primary: borda accent-strong, fill accent, texto on-accent. danger: danger-strong/danger-deep. secondary: line-2/surface-2. ghost: `[ LABEL ]` com colchetes text-3, texto accent. Inset shadow; disabled com opacidade .4. **[WEB]** clip, dshadow, hover | Paper Button |
| IconButton | botão quadrado só com ícone | icon, label (obrigatório, a11y), variant ghost\|secondary\|primary\|danger, size=44, active, disabled | ghost: fundo surface-2 no hover, ícone text-2 (accent se active). Caixa com steps=1; afunda 2px | Paper IconButton |
| Fab | ação flutuante com rótulo | icon=plus, label, onClick | borda accent, fill surface-2, altura 44, rótulo 500 15 display uppercase text-1; afunda 4px. Canto inferior direito, 16px das bordas | Paper FAB surface/small |
| Tag | valor inline `[ 120 KG ]` ou `+50 XP` | children, tone accent\|success\|danger\|reward\|muted\|str\|dex\|con\|sta\|cor, brackets=true, size sm 11 / md 13 / lg 15 | 700 mono uppercase, números tabulares; colchetes text-3 peso 400; gap 1ch | novo |

### progress/
| comp | propósito | props | regras RN | mapeia |
|---|---|---|---|---|
| AsciiBar | barra em texto `[||||....] 72% XP` | value 0..1, cells=20, char='\|', empty='.', tone xp\|energy\|hp\|muted\|reward, label, showPercent, fontSize=13 | XP usa `\|`, energia usa `#`; vazio em text-3 com opacidade .7. Texto puro, porta fácil | XpProgressBar |
| PixelBar | barra sólida segmentada | value, segments=20, tone, height=10, gap=2, glow, label | o preenchimento encaixa em segmentos inteiros; inset branco .22 em cima e preto .25 embaixo. **[WEB]** mask (N Views), steps (800ms steps(8)) | XpProgressBar |

### forms/
| comp | propósito | props | regras RN | mapeia |
|---|---|---|---|---|
| Switch | toggle pixel com knob quadrado | checked, onChange, disabled, label, description | track 48×28 steps=1; borda accent ou line-2; fill accent-wash ou bg-sunken; knob 16×16, left 4→24 em steps(4). Linha com label body-lg e descrição small text-3 | list-switch |
| Segmented | escolha única, 2 a 4 opções | options (string\|{value,label}), value, onChange | caixa sunken steps=1 pad 2; item ativo fill accent / texto on-accent; altura mín. 36; type-label | select-button |
| Select | dropdown compacto | options, value, onChange, label, size sm(32)\|md(40) | caixa raised steps=1, chevron girado 90° em accent. **[WEB]** `<select>` nativo invisível por cima: no RN, menu/BottomSheet/Picker | select-button |
| Stepper | incrementador de carga/reps | value, onChange, step=2.5, min, max, unit='KG', label | `[-] 120 KG [+]`, IconButton secondary; valor 700 26 mono. **Nenhuma tela usa** | editable-incrementer |
| TextField | input com rótulo em caixa alta | label, value, onChange, placeholder, multiline, rows=3, type, error, helper, prefix | caixa sunken steps=1, altura mín. 40; borda danger (erro), accent (foco) ou line-2; rótulo muda de cor junto; valor body-lg | Paper TextInput / LabelledForm |

### navigation/
| comp | propósito | props | regras RN | mapeia |
|---|---|---|---|---|
| AppHeader | barra superior | title, eyebrow, onBack, actions | altura mín. 56, borda inferior 1px line-1; eyebrow type-label text-3; título type-title com ellipsis; voltar = IconButton chevron-left | material-stack-header |
| TabBar | 6 abas inferiores | tabs (padrão DEFAULT_TABS), active, onChange | 64 de altura, fundo surface-1, borda superior 1px; aba ativa em accent com indicador de 2px no topo (24px de largura, steps(4) 120ms); rótulo 700 9 mono. Abas: Painel `shield`, Treinar `zap`, Quests `book-open`, Guilda `users`, Stats `chart-bar`, Herói `user` | material-bottom-tabs |
| Tabs | abas no topo (Guilda) | tabs (string\|{value,label,badge}), value, onChange | 44 de altura, type-label; sublinhado 2px accent (20% a 80% da largura); badge 16px danger-deep | react-native-paper-tabs |
| ListItem | linha de configuração | icon, title, description, meta, trailing, onClick, danger, chevron | altura mín. 56, borda inferior 1px line-1; ícone 24 accent (danger-strong se danger); title body-lg, desc small text-3; chevron automático quando tem onClick e não tem trailing | Paper List.Item |

### feedback/
| comp | propósito | props | regras RN | mapeia |
|---|---|---|---|---|
| AsciiSkeleton | carregamento em ASCII | variant lines\|card\|list\|sheet\|spinner, lines=3, rows=3, label='Carregando' | rampa `. : - = # = - :` andando a cada 90ms; spinner `\| / - \`; card com borda 1px dashed. Só texto (setInterval) | substitui Loader |
| ConfirmDialog | diálogo de confirmação | open, headline, children, okText='OK', cancelText='Cancelar', additionalText, onOk, onCancel, onAdditional, danger | scrim surface-overlay; PixelBox raised steps=3 com sombra, pad 20, largura máx. 340; headline title (danger-strong se danger); botões sm ghost / secondary / primary ou danger; entra com gl-rise 240ms | confirmation-dialog |
| EmptyState | lista vazia | icon='article', title, children, action | ícone 48 line-2, title-sm text-2, texto small text-3 com largura máx. 280, pad 40/24 | empty-info |

### rpg/
| comp | propósito | props | regras RN | mapeia |
|---|---|---|---|---|
| Portrait | slot de sprite (herói, item, chefe) | src, alt, label, width=96, height=120, tone | sem src mostra listras + legenda micro. **[WEB]** grad, `image-rendering: pixelated` (no RN, expo-image com filtro nearest / escala inteira) | novo |
| AttributeStat | atributo STR/DEX/CON/STA | attr, value, label, subtitle, delta, variant card\|inline | card: PixelBox pad 12, altura mín. 92, valor 700 26 mono. Exporta `ATTRIBUTES`: STR human-handsup Força · DEX speed-fast Destreza · CON heart Constituição · STA battery-full Stamina | StatAttributeCard (FOR/RES/VIT/DES → STR/DEX/CON/STA) |
| CharacterSheet | cabeçalho do herói | name, level, title, xp, xpText, energy, attributes[], portrait, bg | AsciiFrame; Portrait 92×116 ("sprite 46×58"); "NOME: Gael (NÍVEL 8)"; AsciiBar de XP e de Energia com 12 células; linha de 4 atributos inline com borda superior tracejada | CharacterCard + XpProgressBar |
| QuestRow | uma quest semanal | description, progress, target, xp, done | ▸ ou check; descrição riscada quando concluída; PixelBar com 1 segmento por unidade se target ≤ 12 (senão 20); tom energy quando concluída | ActiveQuestPanel |
| QuestPanel | lista de quests | title='Missões da semana', quests[], bg | AsciiFrame com título e sem rodapé | ActiveQuestPanel |
| AchievementBadge | conquista | name, icon=trophy, unlocked, fresh, size=56 | desbloqueada: tom accent + ícone reward; bloqueada: sunken, cadeado, opacidade .5; fresh = glow; nome micro limitado a 2 linhas | AchievementBadge/AchievementsRow |
| QuestLogEntry | missão no histórico | date, title, duration, xp, status complete\|partial, exercises[{name,sets,weight,pr}] | leaders pontilhados; selo PR em fundo reward. **Nenhuma tela usa** (o QuestLog usa SessionCard) | QuestLogItem |
| RewardDialog | momento de recompensa em tela cheia | variant mission\|levelup, level, title, xp, achievements[], fx, onClose, actionLabel='Continuar' | scrim + scanlines; PixelBox steps=3 pad 24 largura máx. 340. levelup: borda reward + glow, `LEVEL_UP_ASCII` em 400 9/1.05 mono reward com glow-text, "NÍVEL n" type-display. mission: check 48 success, "MISSÃO CONCLUÍDA", caixa accent com glow "+XP", lista de conquistas. FX ao vivo por padrão (`ui/level-up` ou `ui/quest-complete`) acima do card | LevelUpOverlay + SessionRewardScreen |
| PixelFx | player de sprite sheet | src, sheet{fps,loop,frames,frameSize,columns}, scale=2, loop, onEnd | troca background-position via rAF. **Nenhuma tela usa**: o RewardDialog agora toca o pixelfx ao vivo. Porta fácil (Image + offset), útil como fallback | PixelFx / pixel-fx-assets |

### session/
| comp | propósito | props | regras RN | mapeia |
|---|---|---|---|---|
| SetCounter | uma série ("ataque") | reps, target=5, weight, unit='kg', next, readonly, onTap | largura 60, steps=1. Topo de 56: pendente surface-2 "–"; feita accent; falha (reps < target) danger-deep. Divisor de 2px; base de 24 com a carga. next = borda accent + outline tracejado | PotentialSetCounter |
| ExerciseCard | exercício com as séries | index, name, weight, unit, target, sets[{reps,weight}], meta, notes, active, onTapSet | active: tom raised + borda line-frame; "01." accent; nome 600 18 display uppercase; Tags "x / y séries" e carga; notas em itálico `// …` | WeightedExercise |
| RestTimer | descanso | seconds, total, label='Descanso', onSkip | PixelBox raised com sombra; mm:ss em 700 26; ao zerar: "PRONTO P/ GOLPEAR" em success; PixelBar de 24 segmentos tom energy; ghost "Pular" | rest-timer |
| SessionCard | resumo de treino | title, date, eyebrow, eyebrowTone, exercises[{name,sets,weight,done}], filled, actions, highlight, onClick | grid de 2 colunas (título/data \| leaders) com divisor vertical tracejado; highlight = raised + line-frame | SplitCardControl + SessionSummary |
| CalendarCard | calendário do mês | year, month 0-11, sessionDays[], today, onPrev, onNext, onSelect, firstDay=0 | células de 34px com clip de 1 degrau; dia com sessão = fill accent; hoje = surface-3 + inset de 2px accent; DOW `D S T Q Q S S` | history-calendar-card |

### world/
| comp | propósito | props | regras RN | mapeia |
|---|---|---|---|---|
| BossBar | HP do inimigo/chefe em séries | name, label='Chefe'\|'Inimigo', subtitle, hp, maxHp | "CHEFE: NOME (SUB)" 500 16 display, nome em danger-strong; PixelBar com segmentos = maxHp, altura 10, gap 4, tom hp | novo |
| InventorySlot | célula de inventário | src, label, equipped, selected, rarity comum\|raro\|epico\|lendario, size=64 | sunken; selecionada: borda accent-strong + glow; equipada: line-frame; faixa de raridade de 4px (comum steel, raro attr-sta, épico accent, lendário danger); vazia mostra `·` | novo |
| MapNode | parada no mapa | state done\|current\|open\|locked\|boss, label, sublabel, size=22, labelPosition bottom\|right | fills: done accent-muted (com furo), current e open accent, locked surface-3, boss danger. current = glow âmbar, boss = glow vermelho; boss com "CHEFE". Conectar com linha pontilhada de 2px accent-muted. **[WEB]** clip, filter | novo |

### fx/ (todos dependem do runtime pixelfx: ver F.1)
| comp | propósito | props | regras RN |
|---|---|---|---|
| FxStage | player pixelfx ao vivo em canvas | fx, act, target, body, palette, options, size [w,h] (px de arte), scale=2, fill, bg auto\|ground\|carvao\|none, repeat, hold, playKey, paused, flip, speed, cover, companions[{fx,x\|'target',y,flip,palette,options}], onDone, onHit, label | **[WEB]** canvas 2D + `putImageData`, import() dinâmico de JS, IntersectionObserver, image-rendering pixelated. Desenha o fundo "brasaBackdrop" (dither Bayer + piso de pedra). Efeitos com `act` são encenados pelo boneco padrão. 30fps em passo fixo |
| CombatStage | herói (move = skill) × monstro em loop | move, monster, monsterPalette, deathFx='spawn/coin-drop', defeated, playKey, size=[200,104], palette, onHit, onDone | FxStage com companion = monstro na posição `target`; playKey 0 = pose de guarda (hold); defeated troca o monstro pelo deathFx |
| FxBurst | FX único por cima da UI | fx, options, palette, playKey, scale=2, x='50%', y='40%', speed, onDone, label | posição absoluta, z 45, some ao terminar. Exporta `UI_MOMENTS` (D.6). Texto dentro dos efeitos só em ASCII |
| ScreenTransition | transição de tela em tela cheia | fx, playKey, speed=2, onCover, onDone | z 70; chama onCover em `cover/speed` s. Exporta `TRANSITIONS` (D.7). No RN precisa interceptar a navegação do expo-router (overlay acima do Stack) |

### journey/
| comp | propósito | props | regras RN |
|---|---|---|---|
| HeartBar | vida do herói | hearts=5, max=5, size=24, lostKey, label | "VIDA" type-label bar-hp; coração cheio = ícone heart bar-hp + preenchimento a 85%; vazio = line-2. Mudança em lostKey toca FxBurst `ui/heart-lost` sobre o coração perdido. Exporta `HEART_RULES` |
| StatusBanner | buff ou debuff ativo | status exausto\|amaldicoado\|lento\|furia\|pressa, progress | PixelBox danger ou success; FxStage de 92px à esquerda; "STATUS NEGATIVO"/"STATUS" + Tag ±%XP; nome, motivo, "▸ Cura:", PixelBar de 3 segmentos para o progresso da cura. Exporta `DEBUFFS`, `BUFFS` |
| WeatherBanner | "Clima do reino" | live=true, code, isDay, temp, place, height=112 | FxStage `cover` com o clima; degradê horizontal escuro (**[WEB]** grad); "CLIMA DO REINO · LUGAR", temperatura 700 26, nome, Tag com o modificador; "Consultando os céus…". Exporta `weatherFromCode`, `useLiveWeather` |
| SkillCard | skill do Grimório | name, fx, school aco\|vento\|luz\|arcano, tier, req, effect, state locked\|available\|learned\|equipped, progress, variant card\|compact | bloqueada: grayscale + brilho .55 e FX congelado (hold) com cadeado (**[WEB]** CSS filter: no RN, ColorMatrix do Skia ou sprite cinza pré-renderizado); pronta: borda reward + glow; equipada: line-frame. Card: atributo da escola, "tier I–IV", Tag de estado, efeito em success, requisito + PixelBar de 10 segmentos. Exporta `SCHOOLS`, `SKILLS` |
| MonsterCard | entrada do Bestiário | name, fx, region, hp, weak STR\|DEX\|CON\|STA\|INT, drop, boss, state unknown\|seen\|defeated | unknown = silhueta com `brightness(0) drop-shadow` (**[WEB]** filter: no RN, tint preto) e "???"; chefe = borda danger + "CHEFE {SEMANAL}"; derrotado = "† DERROTADO" + "✦ drop". Exporta `BESTIARY` |

---

## C. Telas (29 ids)

Comum a todas:
- **TabBar** escondida em `onboarding`, `session` e `ai-planner`.
- **Aba destacada** (`TAB_OF`): dashboard→dashboard; train/map/session→session; history/history-edit→history; stats→stats; feed/feed-share/shared-item→feed; todo o resto→settings.
- **Skeleton simulado** por 650ms (spinner + skeleton): stats/train/history usam `card`; feed/manage-exercises/program-list usam `list`.
- **Transição** (`transitionFor`): →session slash-wipe; entre abas pixel-dissolve; →grimoire/bestiary/inventory diamond-wipe; →pdf-import/ai-planner glitch-wipe; →aba vinda de subpágina iris; o resto blinds.
- **Scanlines** cobrindo a tela toda.

### Abas
**dashboard** (Painel) · rota `dashboard/` · `Dashboard.jsx` `DashboardScreen`
- Layout:
  - AppHeader (eyebrow "Semana 44 · Outubro", título "Painel", ação notification "Avisos");
  - WeatherBanner;
  - CharacterSheet (Gael, nv 8, "Guerreiro da Penumbra", xp .72, "4.320 / 4.900 XP · faltam 580", energia .45);
  - HeartBar + ghost [Simular falta]/[Treinar] (atalhos de protótipo);
  - linha micro com `HEART_RULES.lose` (ou `.zero` com 0 corações);
  - StatusBanner exausto (0 corações) ou pressa (5 corações);
  - "▸ ATRIBUTOS · esta semana": grade 2×2 de AttributeStat (STR 24 "séries esta semana" +4 · DEX 7 "exercícios distintos" · CON 5d "streak atual" +1 · STA 186 "min de treino no mês");
  - QuestPanel ("Complete 3 treinos" 2/3 +150 · "40 séries na semana" 40/40 +100 · "Streak de 5 dias" 3/5 +120);
  - "Conquistas 4 / 9": scroll horizontal de AchievementBadge (Primeira missão flag, Consistência calendar, Força bruta trophy fresh, Em ascensão trending-up, Centurião bloqueada).
- Novo além do re-skin: clima (expo-location + Open-Meteo); estado de corações e status; cálculo dos 4 atributos; quests semanais com XP; total de conquistas; curva de nível e XP; barra de Energia (sem regra definida).

**train** (Treinar) · rota `(session)/` · `Train.jsx` `TrainHomeScreen`
- Layout:
  - AppHeader (eyebrow = nome do plano "Força 5×5", título "GymLife RPG", ação `map` → map);
  - grade de botões: secondary "Escolher plano"→program-list, "Editar treinos"→manage-workouts, ghost em largura total "Importar ficha em PDF"→pdf-import;
  - "▸ MISSÃO EM ANDAMENTO": SessionCard highlight (eyebrow "Em andamento · 2/9 séries", "Iniciado 18:42") com trash (ConfirmDialog "Limpar treino atual?" / "Isso limpará o treino atual sem salvá-lo no seu histórico." / Limpar, danger) e "Retomar treino";
  - "▸ PRÓXIMAS MISSÕES": SessionCards com edit→manage-session e "Iniciar treino" (se houver treino em andamento: "Substituir o treino atual?" / "Já existe um treino em andamento. Deseja substituir sem salvar?" / Substituir);
  - Fab zap "Treino livre"→session.
- Novo: atalho para o mapa e para o PDF; o resto é re-skin do PlanManager.

**history** (Quest Log) · rota `history/` · `QuestLog.jsx`
- Layout:
  - AppHeader ("Histórico", "Quest Log");
  - CalendarCard (dias com sessão; tocar → history-edit);
  - EmptyState calendar "Nada registrado neste mês" / "Complete um treino ou mude para outro mês para visualizar sessões.";
  - SessionCard filled por sessão: eyebrow "Missão completa" (success) ou "Missão parcial" (accent); Tag "+XP"; play "Iniciar esse treino"; trash ("Apagar treino?" / "O treino X, de qua 29 out, será excluído do histórico. Isso não pode ser desfeito." / Apagar, danger); "Editar treino".
- Novo: guardar o **XP por sessão** e o status completa/parcial (precisa de regra de parcial); QuestLogEntry existe mas não é usado.

**feed** (Guilda) · rota `feed/` · `Plans.jsx` `GuildScreen`
- Layout:
  - AppHeader ("Feed social", "Guilda", ação external-link → feed-share);
  - Tabs Feed / Seguindo / Seguidores (badge 1);
  - Feed: SessionCards filled com eyebrow "Ana · Paladina nv 11";
  - Seguindo: ListItems com Tag "seguindo";
  - Seguidores: "Bia · Quer seguir você" + "Aceitar", EmptyState users "Compartilhe seu link".
- Novo: classe e nível do autor no item do feed. **Depende de servidor.** O ui_kits/README diz "Guilda é um estado vazio", mas a tela vem populada.

**stats** (Estatísticas) · rota `stats/` · `Stats.jsx`
- Layout:
  - AppHeader ("Ficha do personagem", "Estatísticas");
  - 2 Selects: treino ("Todos os treinos", A/B/C) e período (7/14/30/90/180/365 dias, "Todo o período");
  - TextField "Buscar exercício" com prefixo ⌕;
  - grade 2×2 de cards: "Carga máxima em um treino" 6.840 KG · "Duração média do treino" 49 min · "Maior tempo gasto" Agachamento · "Maior carga" 120 KG (Levantamento terra);
  - "Volume por sessão" (t × 1000) e "Peso corporal" (success): `PixelLine`;
  - um gráfico por exercício com meta "+N kg";
  - busca sem resultado: "Tente alterar os filtros na parte superior.".
- `PixelLine` é **local** do Stats.jsx (pontos de 8×8, hastes de 2px, grade a cada 24px, último ponto com glow) e precisa virar componente RN (Views ou Skia). Fora isso, é re-skin.

**settings** (Herói) · rota `settings/` · `Hero.jsx` `HeroScreen`
- Layout:
  - AppHeader ("Taverna", "Herói");
  - Portrait 64×80, "Gael", "Guerreiro · Nível 8", Tag str "classe: STR +10%";
  - "Jornada": Inventário (meta 3/20), Grimório ("Skills destravadas por feitos reais", 4/20), Bestiário (2/8);
  - "Configuração": Gerenciar planos, Gerenciar exercícios, Configurações do app, Idioma e Região, Notificações, "Exportar, backup e restaurar";
  - "Recursos Pro": Planejador IA;
  - "Suporte": Sugerir funcionalidade / Relatório de erro / Sugerir uma tradução (↗ externos) e "Informações do app" (diálogo "GymLife RPG é um app open source, baseado no LiftLog e licenciado sob AGPL-3.0. Código no GitHub. Versão 2.0.0." com botão Fechar).
- Novo: perfil do herói (classe) e os contadores da Jornada. Descrições vêm de `source/i18n/pt.json`.

### Treino
**session** (Sessão ativa · combate) · rota `(session)/session` · `Session.jsx`
- Layout:
  - AppHeader ("Missão do dia", "Treino de Força", voltar → train, more);
  - CombatStage 184×100 dentro de outline 1px, com FxBurst por cima;
  - linha "GOLPE [nome da skill]" + Tag "COMBO ×n";
  - BossBar ("Inimigo" ou "Chefe", nome do monstro, hp = séries restantes, subtítulo = exercício ou "derrotado");
  - AsciiDivider "Ataques";
  - ExerciseCards (meta "Inimigo: Gosma da Preguiça" / "Chefe: Caveira Ardente"; ativo = primeiro com série pendente);
  - rodapé sticky com o único degradê permitido: RestTimer + Button danger lg zap "Concluir série / Golpear" ("Finalizar missão" quando acabou).
- Interações:
  - **countdown** ao entrar;
  - "Golpear" preenche a próxima série pendente com reps = target, incrementa playKey e combo, e depois de 420ms toca o FX (`pr` no exercício 0, `combo` se combo%3==0, senão `set` "-reps");
  - descanso volta para 120;
  - na última série do exercício, ao terminar o golpe, toca a morte do monstro; no último exercício, `onFinish` depois de 1,6s → reward;
  - tocar numa série cicla reps: vazio → target → target-1 … → 0 → vazio.
- Novo:
  - atribuir monstro a cada exercício;
  - skill equipada por exercício;
  - combo de sessão;
  - **detecção de PR**;
  - HP = séries;
  - morte do monstro;
  - XP da missão e momentos de FX;
  - tudo isso por cima do SessionComponent atual.

**history-edit** (Editar treino do histórico) · rota `history/edit` · `Train.jsx` `HistoryEditScreen`
- Layout:
  - AppHeader ("Quest Log · seg 27 out", "O Abismo dos Agachamentos", voltar, more);
  - Tags 47 min / "10 / 10 séries" / "+160 XP";
  - ExerciseCards sem combate (tocar cicla reps);
  - "Adicionar exercício";
  - "Corpo": TextField "Peso corporal" com prefixo KG;
  - "Salvar".
- Novo: nome de masmorra no título e o XP da sessão.

**map** (Masmorra) · sem rota · `DungeonMap.jsx`
- Layout:
  - AppHeader ("Programa · Força 5×5", "Masmorra", ação sliders);
  - PixelBox sunken de 420 de altura com listras "tilemap top-down 16-bit · 358×420", linha pontilhada vertical e 4 MapNodes com rótulo à direita: done "O Abismo dos Agachamentos" (Treino A · seg), current "A Forja da Resistência" (Treino B · hoje, tocar → session), open "A Cripta do Supino" (Treino C · sex), boss "O Guardião da Carga" (Teste de 1RM · dom);
  - "Próxima missão": título + Tags "3 exercícios", "~50 min", "+180 XP de recompensa";
  - Button lg play "Entrar na missão".
- Novo:
  - nome de masmorra por treino;
  - dia previsto;
  - duração estimada;
  - prévia de XP;
  - **nó de chefe = teste de 1RM** (conceito novo);
  - tilemap (sprite externo).

### Planos
**program-list** (Planos) · rota `settings/program-list` · `Plans.jsx`
- Layout:
  - AppHeader ("Gerenciar planos", "Planos", voltar, ação upload → pdf-import);
  - secondary "Importar treino de PDF";
  - um PixelBox por plano (accent quando ativo, ◆/◇, nome, "3 treinos · criado 02 set", Tag "ativo", edit → manage-workouts);
  - Fab "Adicionar plano".
- Novo: entrada para o PDF.

**manage-workouts** (Editar plano) · rota `manage-workouts/[programId]`
- Layout: TextField "Nome do plano"; SessionCards (date "Treino n", tocar → manage-session); Fab "Adicionar treino".
- Re-skin.

**manage-session** (Editar treino) · rota `manage-session/[sessionIndex]`
- Layout:
  - TextFields "Nome do treino" e "Notas do treino" (multiline, 2 linhas);
  - "Exercícios n": linha PixelBox ("01.", nome, Tags "3 × 5" muted, "100 KG", "+2.5 KG/sucesso", edit, trash);
  - "Adicionar exercício";
  - "Salvar".
- Re-skin (a progressão de carga já existe no LiftLog).

**ai-planner** (Planejador IA) · rota `settings/ai/planner` · sem TabBar
- Layout:
  - AppHeader ("Recursos Pro", ação reload "Reiniciar conversa");
  - bolhas PixelBox steps=1 (usuário = accent, alinhada à direita): "Saudações, herói. Qual é o seu objetivo…", "Força, 3 dias, barra e anilhas.", "Forjei um plano para você…";
  - SessionCards "Plano gerado";
  - "Salvar novo plano";
  - composer sticky (TextField "Descreva seu objetivo…" + IconButton primary arrow-up).
- **Depende do servidor/LLM do LiftLog.** Visualmente, é re-skin.

**pdf-import** (Importar PDF) · sem rota · `PdfImport.jsx`
- Layout por fases:
  - **pick**: texto "Suba a ficha de treino que a academia te deu…"; área tracejada (borda 1px dashed line-frame, ícone upload 48, "Escolher PDF", "ATÉ 10 MB · FICHA, PLANILHA OU PRINT"); "Usar ficha de exemplo";
  - **scan**: FxStage `scifi/scanner` 160×96 + selo "ESCANEANDO"; AsciiBar de 22 células "#" com o nome do arquivo; log ASCII verde (9 linhas, uma a cada 520ms: "> ABRINDO …", "> 3 PÁGINAS · 412 KB", "> LENDO PÁGINA 1/3 ........ OK" ×3, "> 9 EXERCÍCIOS ENCONTRADOS", "> SÉRIES/REPS/CARGA ....... OK", "> MONTANDO 3 TREINOS (A B C)", "> PLANO PRONTO ✓", cursor "> _"); AsciiSkeleton card "Montando treinos";
  - **done**: FxBurst `ui/quest-complete` com o texto "PLANO PRONTO"; TextField "Nome do plano"; "Treinos encontrados 3"; SessionCards "do PDF"; aviso "Confira as cargas antes de salvar…"; botões "Outro PDF" / "Salvar plano".
- Novo: **tudo** (seletor de documento, parser, mapear para o modelo de plano). O log é **simulado** e não há parser especificado.

### Taverna
**app-config** · rota `settings/app-configuration`
- Layout:
  - 7 Switches: Modo escuro RPG; Exibir peso corporal; Mostrar feed ("Exibir a Guilda na barra de navegação"); Notas do treino expandidas por padrão; Manter a tela ligada (Durante o treino); Mostrar dicas; Enviar relatórios de erro;
  - "Tema": Segmented Brasa/Ferro/Fósforo/Claro;
  - secondary "Refazer configuração inicial" → onboarding.
- Novo: seletor de paleta persistido. O switch "Modo escuro RPG" entra em conflito com "Claro" (ver F).

**localization** · rota `settings/localization`
- Layout: Switch "Usar unidades imperiais"; ListItem "Primeiro dia da semana" com Select (Domingo/Segunda/Sábado); ListItem "Idioma" com Select (Sistema/Português/English/Español).
- Re-skin.

**notifications** · rota `settings/notifications`
- Layout: Switch "Notificações de descanso"; ListItem clock "Solicitar permissão para alarmes e lembretes" (Android).
- Re-skin.

**backup** · rota `settings/backup-and-restore`
- Layout:
  - ListItems: "Fazer backup de dados" (diálogo "Backup da conta" / "Incluir sua conta da Guilda no backup? Quem tiver o arquivo poderá publicar como você." / "Incluir feed" + "Apenas meus dados"); "Restaurar dados"; "Backup remoto automático" → remote-backup; "Exportação de texto simples" → plaintext-export;
  - Switch "Lembretes de backup".
- Re-skin. O backup precisa passar a incluir os estados novos do jogo (D.10).

**remote-backup** · rota `backup-and-restore/remote-backup`
- Layout:
  - nota sunken "Recurso avançado…";
  - TextField "Endpoint" (erro "O endpoint precisa começar com https://");
  - TextField "Chave de API" (password);
  - Switch "Incluir conta do feed";
  - "Testar" / "Salvar" (desabilitado com erro).
- Re-skin; servidor do usuário.

**plaintext-export** · rota `backup-and-restore/plain-text-export`
- Layout: nota + link "Ler documentação"; Select "Formato" CSV/JSON; "Exportar".
- Re-skin.

**manage-exercises** · rota `settings/manage-exercises`
- Layout:
  - TextField "Buscar";
  - Segmented Todos/Força/Cardio;
  - ListItems (ícone human-run para cardio, human-handsup para força; descrição = grupos musculares, ex. "Quadríceps · Glúteos");
  - EmptyState "Nenhum exercício encontrado.";
  - Fab "Adicionar exercício".
- Possível dado novo: **grupos musculares** por exercício (conferir se o modelo atual tem).

### Guilda
**feed-share** (Convite de perfil) · rota `feed/share`
- Layout: card PixelBox raised steps=3 centralizado com Portrait 72×90 "avatar", "Ana quer compartilhar o perfil dela", "Aceitar para seguir: você verá os treinos que ela publicar na Guilda.", botões Cancelar / Aceitar.
- Servidor.

**shared-item** (Item compartilhado) · rota `feed/shared-item/[id]`
- Layout: aviso accent "Este plano foi compartilhado com você."; título title-lg "Hipertrofia ABC"; SessionCards "Treino A/B/C"; "Salvar plano".
- Servidor.

### Jornada (novo)
**onboarding** (classe) · rota `welcome-wizard` (página 0) · `Onboarding.jsx` · sem TabBar
- Layout:
  - "PASSO 1 / 4" + PixelBar de 4 segmentos;
  - "Escolha sua classe" / "Sua classe muda como você ganha XP. Dá pra trocar depois na Taverna.";
  - 3 cards PixelBox (accent quando selecionado): Portrait 64×80 "sprite 32×40", nome, Tag com o atributo, bônus, ◆/◇. Guerreiro STR "+10% XP em séries de força"; Explorador DEX "+15% XP em cardio"; Paladino CON "Streak protegido 1×/semana";
  - AsciiDivider;
  - Button lg "Começar jornada" → dashboard.
- Novo: classe persistida. **Só o passo 1 de 4 foi desenhado.**

**grimoire** (Grimório) · sem rota · `Grimoire.jsx`
- Layout:
  - AppHeader (eyebrow "Skills · aprendidas / 20", voltar → settings);
  - Segmented Aço/Vento/Luz/Arcano;
  - linha "<ATTR> · <classe> — <blurb>";
  - SkillCard grande da skill selecionada;
  - CTA conforme o estado: "Aprender skill" (pronta) ou "Equipar no próximo combate" (aprendida);
  - "Árvore · escola x": grade de 2 colunas com SkillCards compactos (selecionado com outline tracejado).
- Novo: catálogo SKILLS, estado por skill, progresso dos requisitos, skill equipada, preview de FX ao vivo em todos os cards (até 7 canvases por tela).

**bestiary** (Bestiário) · sem rota · `Bestiary.jsx`
- Layout:
  - texto "Todo monstro é um mau hábito. Derrote-o completando as séries do exercício em que ele aparece.";
  - AsciiBar de 18 células "#" tom hp "n/8 derrotados";
  - "Chefes": grade de 2 MonsterCards; "Criaturas": grade de 2 colunas.
- Novo: BESTIARY e estado por monstro (unknown/seen/defeated); até 8 canvases FX por tela.

**inventory** (Inventário) · sem rota · `Inventory.jsx`
- Layout:
  - Portrait 150×190 "herói equipado 64×80" + grade de 2 colunas com 6 slots de equipamento de 56px (elmo, ombreira, peitoral, arma, luvas, cinto; arma e peitoral equipados);
  - "Bolsa 3 / 20": grade de 5 colunas com **15** slots de 60px;
  - card de detalhe raised: nome, Tag de raridade, "▸ bônus" em success, "ORIGEM: …".
- Itens do mock:
  - Espada de Ferro Frio, épico, "+5% XP em séries de força", origem "Chefe · O Guardião da Carga";
  - Cota de Malha Gasta, raro, "+1 CON por semana completa", origem "Missão · 40 séries";
  - Botas de Couro, comum, "+5% XP em cardio", origem "Conquista · Primeira missão".
- Novo: sistema de itens inteiro (drops, slots, bônus). **Não há ação de equipar desenhada.**

### Overlays
**reward** (Missão concluída) · substitui `SessionRewardScreen`
- Layout: RewardDialog mission, xp 180, conquistas [Força bruta trophy, Em ascensão trending-up]; FX `ui/quest-complete` acima do card.
- Interação: "Continuar" → levelup.
- Novo: lista de conquistas desbloqueadas na missão.

**levelup** (Level up) · substitui `LevelUpOverlay`
- Layout: RewardDialog levelup, level 9, título "Guerreiro da Penumbra"; arte ASCII "LEVEL UP"; FX `ui/level-up`.
- Interação: "Continuar" → dashboard.
- Novo: título por nível (o mock repete o título do nível 8).

---

## D. Sistemas de jogo (regras e dados exatos)

### D.1 Corações (`HEART_RULES`, HeartBar.jsx)
- max: 5.
- lose: "Perde 1 coração por dia de treino planejado que passar sem missão."
- gain: "Recupera 1 coração a cada 2 missões completas (máximo 5)."
- zero: "Com 0 corações o herói fica Exausto."
- Ao perder um coração toca `ui/heart-lost`. O README liga 0 corações à transição `burn-away` ("derrota").
- Protótipo: começa com 3 corações; [Treinar] dá +1 por toque, o que é atalho e não a regra.

### D.2 Status (StatusBanner.jsx)
| key | nome | fx | XP | motivo (`why`) | cura |
|---|---|---|---|---|---|
| exausto | Exausto | status/sleep | −50% | Perdeu todos os corações | Complete 3 missões em 7 dias (PixelBar de 3 segmentos) |
| amaldicoado | Amaldiçoado | status/cursed | −25% | 2 semanas abaixo da meta | Volte a bater a meta semanal |
| lento | Enferrujado | status/slowed | −15% | 7+ dias sem treinar | Uma missão completa |
| furia (buff) | Fúria | status/rage | +20% | Bateu um PR nesta semana | — |
| pressa (buff) | Embalo | status/haste | +10% | Streak de 5+ dias | — |

### D.3 Clima (`weatherFromCode(code, isDay, wind)` + `useLiveWeather`)
- **Ordem de avaliação** (a primeira condição verdadeira vence):

| # | condição | fx | nome | modificador |
|---|---|---|---|---|
| 1 | code ≥ 95 | weather/storm | Tempestade | +15% XP · treinou na tempestade |
| 2 | 71–77, 85 ou 86 | weather/snow | Neve | +10% XP de STA |
| 3 | 51–67 ou 80–82 | weather/rain | Chuva | +10% XP · determinação |
| 4 | 45 ou 48 | weather/fog | Neblina | Monstros escondidos no mapa |
| 5 | wind ≥ 40 | weather/falling-leaves | Ventania | +5% XP de DEX |
| 6 | 1–3 | weather/clouds | "Nublado" (3) ou "Poucas nuvens" | Sem modificador |
| 7 | resto, de dia | weather/god-rays | Céu limpo | +5% XP de cardio ao ar livre |
| 7 | resto, à noite | weather/shooting-stars | Noite limpa | Bônus noturno: +5% XP |

  Como o vento é testado antes das nuvens, nublado com ventania vira Ventania.
- **API**: `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current=temperature_2m,weather_code,is_day,wind_speed_10m`, sem chave, **uma vez ao montar**. O vento vem em km/h (padrão do Open-Meteo); o limiar é 40.
- Localização:
  - geolocalização com timeout de 2,5s e maximumAge de 10 min; lat/lon arredondadas para 2 casas; rótulo "Sua região";
  - se falhar ou expirar, São Paulo (−23.55, −46.63);
  - erro de fetch → código 0, dia, `offline: true`.
- Forçar `code` mostra o rótulo "Simulado".
- No RN: expo-location + a mesma API. **Não está definido como o modificador entra no XP** (no início ou no fim da missão? cardio ao ar livre como é detectado?).

### D.4 Escolas e skills (SkillCard.jsx)
- **4 escolas**:

| key | nome | classe | atributo | cor | blurb |
|---|---|---|---|---|---|
| aco | Aço | Guerreiro | STR | attr-str | "Força bruta. Skills de lâmina e impacto destravadas por carga e séries." |
| vento | Vento | Explorador | DEX | attr-dex | "Velocidade e alcance. Destravadas por cardio, variedade e streak." |
| luz | Luz | Paladino | CON | **attr-sta** (bug) | "Constância e recuperação. Destravadas por semanas sem faltar e descanso." |
| arcano | Arcano | Todos | INT | accent | "Foco. Destravadas pelo modo estudo (pomodoros)." |

- **20 skills** (escola · tier · nome · fx · requisito → efeito):

| id | escola | tier | nome | fx | requisito | efeito |
|---|---|---|---|---|---|---|
| corte | aço | 1 | Corte do Recruta | melee/sword-slash | Inicial do Guerreiro | +10% XP em séries de força |
| cruzado | aço | 2 | Corte Cruzado | melee/double-slash | 10 missões completas | Séries 2× valem +5 XP |
| talho | aço | 2 | Talho Pesado | melee/heavy-cleave | STR 20 (séries na semana) | +1 de dano no chefe por série pesada |
| martelo | aço | 3 | Martelo da Carga | melee/hammer-smash | PR no levantamento terra | Cada PR vira golpe crítico (+50 XP) |
| colosso | aço | 3 | Queda do Colosso | moves/ground-pound | Agachamento ≥ peso corporal | Atordoa o chefe: série final vale 2 HP |
| combo | aço | 4 | Combo de Ferro | moves/sword-combo | Nível 10 | 3 séries seguidas sem falhar = combo +30 XP |
| estocada | vento | 1 | Estocada | melee/thrust | Inicial do Explorador | +15% XP em cardio |
| adagas | vento | 2 | Rajada de Adagas | melee/dagger-flurry | 30 min de cardio numa sessão | Intervalos curtos valem +5 XP |
| giro | vento | 2 | Giro Cortante | melee/spin-slash | Streak de 7 dias | Acerta todos os inimigos da sala |
| investida | vento | 3 | Investida Fantasma | moves/dash-strike | 5 km na semana | Começa o combate com 1 golpe grátis |
| flecha | vento | 4 | Flecha Paciente | moves/arrow-shot | 100 min de cardio na semana | Dano à distância: conta séries de outro dia |
| respiro | luz | 1 | Respiro | holy/heal | Inicial do Paladino | Descanso respeitado recupera Energia |
| egide | luz | 2 | Égide | holy/divine-shield | 4 semanas sem faltar | Protege o streak 1×/semana |
| bencao | luz | 2 | Bênção | holy/blessing | 3 treinos/semana por 4 semanas | +5% XP para a guilda |
| smite | luz | 3 | Martelo Sagrado | moves/holy-smite | 50 missões | Golpe final do chefe vale o dobro |
| retorno | luz | 4 | Retorno | holy/resurrection | Voltar após 14+ dias parado | Recupera metade do streak perdido |
| foco | arcano | 1 | Foco | arcane/spell-charge | 1 pomodoro completo | +10 INT por pomodoro sem pausa |
| misseis | arcano | 2 | Mísseis Arcanos | arcane/arcane-missiles | 10 pomodoros sem pausa | Pausas custam 0 INT 1×/dia |
| circulo | arcano | 3 | Círculo de Estudo | arcane/magic-circle-cast | Tarefa de estudo concluída | +20 INT bônus por tarefa |
| tempo | arcano | 4 | Tempo Parado | arcane/time-stop | 25 pomodoros na semana | Congela o timer de descanso 1× |

- Estados: locked (Bloqueada) → available ("Pronta p/ aprender") → learned (Aprendida) → equipped (Equipada).
- Estado do mock:
  - equipada: corte;
  - aprendidas: cruzado, talho, foco;
  - pronta: martelo;
  - progresso nas bloqueadas: colosso .85, combo .8, giro 5/7, egide .5, misseis .3.
- Dados que os requisitos exigem rastrear: contagem de missões; séries na semana; PR por exercício; peso corporal; nível; minutos de cardio por sessão e por semana; **km** na semana; streak; semanas sem faltar; frequência semanal; retorno após 14 dias ou mais; **pomodoros e tarefas de estudo (não existem)**.

### D.5 Bestiário (`BESTIARY`, 8 entradas)
| id | nome | fx | região | hp | fraco a | drop | morte | chefe |
|---|---|---|---|---|---|---|---|---|
| gosma | Gosma da Preguiça | critters/slime | Pântano do Sofá | 3 | STR | Botas de couro | spawn/poof | — |
| morcego | Morcego da Insônia | critters/bat | Cripta da Madrugada | 4 | CON | Capuz da noite | spawn/poof | — |
| serpente | Serpente da Desculpa | critters/snake | Trilha do Amanhã | 4 | DEX | Cinto de escamas | spawn/coin-drop | — |
| espectro | Espectro do Cansaço | critters/ghost | Ruínas da Rotina | 5 | STA | Manto pálido | spawn/soul-rise | — |
| olho | O Olho que Julga | critters/eyeball | Espelho da Academia | 5 | CON | Amuleto da coragem | spawn/poof | — |
| fatuo | Fogo-fátuo da Distração | critters/wisp | Biblioteca Esquecida | 4 | INT | Vela do foco | spawn/soul-rise | — |
| caveira | Caveira Ardente | critters/flying-skull | Fornalha | 6 | STR | Elmo chamuscado | spawn/coin-drop | semanal |
| guardiao | O Guardião da Carga | spawn/summon-rise | Trono de Ferro | 8 | STR | Espada de Ferro Frio | spawn/dissolve-burn | do programa |

- Estado do mock: derrotados gosma e morcego; vistos serpente, espectro e caveira; desconhecidos olho, fatuo e guardiao.
- Nota: o `death` da tabela **não é passado** ao CombatStage na sessão; lá vale o padrão `spawn/coin-drop`.

### D.6 Momentos de UI (`UI_MOMENTS`, FxBurst.jsx)
| chave | fx | quando | options |
|---|---|---|---|
| combo | ui/combo-counter | N séries seguidas sem falhar | {count:n, label:'COMBO'} |
| pr | ui/crit-number | Recorde pessoal (PR) | {label:'PR', text: kg+'KG!'} |
| set | ui/damage-number | Série concluída: dano = reps | {text:'-'+reps} |
| xp | ui/coin-collect | XP coletado ao fim da missão | {} |
| achievement | ui/achievement | Conquista desbloqueada | {title:'CONQUISTA', text: t\|\|'DESBLOQUEADA'} |
| heartLost | ui/heart-lost | Faltou num dia de treino | {} |
| bossHit | ui/health-bar-hit | Golpe no chefe | {from, to} |
| countdown | ui/countdown | Início da missão (3, 2, 1, GO) | {} |
| alert | ui/exclamation | Aviso/dica no herói | {} |
| confetti | ui/confetti | Semana perfeita | {} |
| quest | ui/quest-complete | Missão concluída | {text:'QUEST COMPLETE'} (no PDF: 'PLANO PRONTO') |
| levelUp | ui/level-up | Subiu de nível | {} |

- Na sessão do protótipo só disparam countdown, pr, combo e set. xp, achievement, bossHit, alert e confetti não estão ligados a nenhuma tela.

### D.7 Transições (`TRANSITIONS`, tempo de cobertura em s com speed 1; o padrão é speed 2)
| fx | cover (s) | uso |
|---|---|---|
| transitions/pixel-dissolve | 1.0 | troca de aba |
| transitions/slash-wipe | 0.75 | entrar no combate |
| transitions/iris | 1.0 | voltar / fechar |
| transitions/blinds | 0.95 | abrir subpágina da Taverna |
| transitions/diamond-wipe | 0.95 | abrir Grimório / Bestiário (e Inventário) |
| transitions/star-iris | 1.0 | recompensa / level up |
| transitions/crt-off | 0.9 | sair do app / logout |
| transitions/glitch-wipe | 0.8 | importar PDF / IA |
| transitions/burn-away | 1.4 | derrota (perdeu todos os corações) |
| transitions/shatter-wipe | 1.2 | chefe derrotado |

- star-iris, crt-off, burn-away e shatter-wipe estão definidas, mas **nunca disparam** no protótipo.

### D.8 Combate
- Cada exercício da sessão é um monstro com **HP = número de séries** do exercício; o **último exercício é o chefe**.
- Cada série concluída = 1 golpe da skill equipada (incrementa `playKey`) e 1 de dano. HP zerado → efeito de morte (`spawn/poof`, `coin-drop`, `soul-rise`…).
- No protótipo:
  - os inimigos são fixos (`FOES`): slime + hammer-smash "Martelo da Carga"; snake + heavy-cleave "Talho Pesado"; flying-skull + double-slash "Corte Cruzado" (chefe);
  - o combo começa em 2;
  - o FX de PR sempre dispara no exercício 0 (carga + 2,5);
  - o descanso volta para 120 s a cada golpe.

### D.9 Importação de PDF
- Fluxo: pick → scan → done.
- pick: seletor (accept application/pdf, "até 10 MB") ou "ficha de exemplo".
- scan: `scifi/scanner` + log ASCII (9 linhas, 520ms cada) + AsciiBar.
- done: `ui/quest-complete` "PLANO PRONTO", nome editável, treinos A/B/C, aviso "Confira as cargas", Salvar → program-list.
- **O parser é simulado.** Entrada: Treinar (ghost), Planos (botão + ação no header).

### D.10 Estado que precisa ser persistido (novo)
- **Herói**: classe; nível, XP total e título; Energia (sem regra).
- **Corações**: 0–5, último dia avaliado, contador de missões desde o último coração recuperado.
- **Status ativo**: id, data de início, progresso da cura (missões numa janela de 7 dias); flag de PR na semana (Fúria); streak (Embalo).
- **Skills**: estado por skill (4 estados), progresso de cada requisito, skill equipada (global ou por exercício: não definido).
- **Bestiário**: estado por monstro; regra de atribuição exercício → monstro (persistida por treino/plano para ser estável).
- **Inventário**: itens (raridade, bônus, origem), 6 slots de equipamento, capacidade 20.
- **Quests semanais** (progresso, XP) e conquistas (desbloqueada/fresh), com total 4/9.
- **XP por sessão** (histórico) e status completa/parcial.
- **Preferências**: paleta, transições, dicas.
- **Clima**: cache da última leitura e do modificador aplicado à missão.
- **Pomodoros e tarefas de estudo**, se o Arcano entrar.
- Tudo isso entra no backup, no restore e na exportação.

---

## E. Assets

- **Fontes** (`assets/fonts/`, woff2):
  - PixelifySans-400-700 variável (latin + latin-ext);
  - SpaceMono 400, 400 itálico e 700 (latin + latin-ext).
  - No RN/expo-font: converter para TTF; Pixelify precisa de instâncias estáticas 500 e 600 (Android não lê o eixo variável).
- **Ícones**: 79 Pixelarticons v1.8.1 (MIT) em `assets/icons/`, ~8 KB cada por causa do metadata **c2pa**. Remover o metadata e gerar um mapa de paths para react-native-svg.
  - Usados nas telas (43): alert, arrow-up, article, battery-full, book, book-open, briefcase, calendar, chart-bar, check, chevron-left, chevron-right, clock, dice, download, edit, external-link, flag, gift, heart, human-handsup, human-run, info-box, lock, map, message, minus, more-vertical, notification, play, plus, reload, save, shield, sliders, speed-fast, trash, trending-up, trophy, upload, user, users, zap.
  - Os outros 36 estão no pacote sem uso nas telas. Não existem espada, halter, caveira nem estrela: XP usa `zap` e conquistas usam `trophy`.
- **Sprite sheets FX** (`assets/fx/*.png` + json, 30fps; são legado do PixelFx e nenhuma tela usa):

| sheet | frames | tamanho do frame | colunas | loop |
|---|---|---|---|---|
| level-up | 103 | 200×140 | 9 | não |
| confetti | 72 | 176×138 | 8 | não |
| power-star | 48 | 88×84 | 7 | sim |
| xp-orb | 54 | 72×56 | 7 | sim |

Os valores de cada linha vêm dos .json, mas a associação entre nome e valores foi inferida pela ordem de leitura. Conferir nos 4 arquivos .json.

- **Marca**: `icon.png` (12,6 KB, escudo vermelho + halter + espada), `icon_foreground.png` e `icon_monochrome.png` (ícone adaptativo/temático Android), `splash.png` (4,8 KB). Sem wordmark: "GYMLIFE **RPG**" composto em Pixelify, com RPG em âmbar.
- **Sprites próprios ainda inexistentes**:
  - herói 46×58 (ficha), 32×40 (classe), 64×80 (inventário);
  - itens 24 ou 32;
  - chefes 64–96;
  - tilemap 16px, 358×420 por trecho;
  - sons ElevenLabs (golpe < 300ms, tick de XP < 150ms, level up 1,5–2,5s, missão ~1,5s, −14 LUFS).
- **pixelfx**: `vendor/pixelfx` (MIT, 2,9 MB, 266 arquivos JS; o README fala em 244 efeitos).
  - O renderizador `tools/render.mjs --sheet` está **só em `uploads/pixelfx-main/tools/`**, não no vendor.
  - **Ids usados nos componentes e telas (68)**:
    - melee (7): sword-slash, double-slash, heavy-cleave, hammer-smash, thrust, dagger-flurry, spin-slash (skills e sessão).
    - moves (5): ground-pound, sword-combo, dash-strike, arrow-shot, holy-smite (skills).
    - holy (4): heal, divine-shield, blessing, resurrection (skills).
    - arcane (4): spell-charge, arcane-missiles, magic-circle-cast, time-stop (skills).
    - critters (7): slime, bat, snake, ghost, eyeball, wisp, flying-skull (monstros).
    - spawn (5): poof, coin-drop, soul-rise, dissolve-burn, summon-rise (mortes e o Guardião).
    - status (5): sleep, cursed, slowed, rage, haste.
    - weather (8): storm, snow, rain, fog, falling-leaves, clouds, god-rays, shooting-stars.
    - ui (12): combo-counter, crit-number, damage-number, coin-collect, achievement, heart-lost, health-bar-hit, countdown, exclamation, confetti, quest-complete, level-up.
    - transitions (10): pixel-dissolve, slash-wipe, iris, blinds, diamond-wipe, star-iris, crt-off, glitch-wipe, burn-away, shatter-wipe.
    - scifi (1): scanner.
    - Soma: 7+5+4+4+7+5+5+8+12+10+1 = 68.
  - Só no card de demo: arcane/portal, fire/torch, pickups/xp-orb.
  - Efeitos **parametrizados em tempo de execução** (não dá para pré-renderizar como sheet fixa): damage-number (texto), crit-number (kg), combo-counter (contagem), achievement (texto), health-bar-hit (from/to), quest-complete (texto), todos com recolor por `palette`; e CombatStage (move × monstro × fundo).

---

## F. Lacunas e riscos

### F.1 Bifurcação técnica principal: o runtime pixelfx no RN
O core do pixelfx é JS puro e gera um buffer de pixels; só o `putImageData` depende do DOM. Há dois caminhos:
- **(a) pré-renderizar sheets** com `render.mjs` e tocar no `PixelFx`/Image. Serve para loops estáticos (clima, status, monstros do Bestiário, skills, transições). **Não serve** para os efeitos parametrizados (D.6) nem para o CombatStage composto.
- **(b) rodar o core no RN** e copiar o Uint8 buffer a cada quadro para react-native-skia ou expo-gl. É barato: cerca de 200×104 px a 30fps. Atenção a muitas instâncias simultâneas (Grimório ~7 e Bestiário ~8 canvases), a pausar fora da tela (sem IntersectionObserver: usar foco/viewability) e ao import() dinâmico, que no Metro vira um registro estático de módulos.
- **Recomendação:** (b) como gate para UI_MOMENTS e CombatStage; (a) para loops fixos e como fallback de baixo desempenho.

### F.2 Técnicas web a substituir
- clip-path em degrau (todos os PixelBox, Segmented, células do CalendarCard, MapNode);
- drop-shadow duro e glow (filter);
- gradientes e texturas data-URI (scanlines, dither, grão, vinheta, listras de placeholder, degradê do WeatherBanner, rodapé da sessão);
- mask-image (PixelBar);
- `steps()`;
- composites com o shorthand `font:`;
- `<select>` nativo;
- `-webkit-line-clamp` (→ `numberOfLines`);
- CSS filter grayscale e brightness(0) (skill bloqueada, silhueta);
- `image-rendering: pixelated`;
- `position: sticky` (CTA da sessão, FABs, composer da IA);
- overlay de scanlines por cima de tudo (no RN, uma View absoluta com `pointerEvents="none"`);
- `prefers-reduced-motion` → `AccessibilityInfo.isReduceMotionEnabled`.

### F.3 Inconsistências no próprio design
1. `SCHOOLS.luz` tem `attr: 'CON'` mas a cor é `--attr-sta` (verde); deveria ser `--attr-con`.
2. **INT** aparece (escola Arcano, `weak: 'INT'` do Fogo-fátuo, efeitos "+10 INT"), mas `ATTRIBUTES` só tem STR/DEX/CON/STA. O app tem FOR/RES/VIT/DES. É preciso decidir entre um 5º atributo e adiar o Arcano (o README diz "Fase 5 do TODO"; o modo estudo/pomodoro não existe).
3. Três ideias de "chefe" que não se encaixam:
   - último exercício da sessão = chefe;
   - Caveira Ardente = chefe **semanal**;
   - O Guardião da Carga = chefe **do programa**, que no mapa é o nó "Teste de 1RM · dom".
4. HP do monstro: o combate diz HP = séries do exercício, mas o `BESTIARY.hp` é fixo (3–8). Skills falam em "dano", "série final vale 2 HP", "+1 de dano por série pesada", "acerta todos os inimigos da sala", "conta séries de outro dia": um modelo de dano que não existe.
5. **Não há regra** para mapear exercício → monstro (a sessão usa FOES fixo). A "região" do bestiário não aparece em nenhuma tela.
6. A morte do monstro na sessão usa o padrão `coin-drop` e ignora `BESTIARY.death`.
7. Combo: UI_MOMENTS dispara "a cada 3 séries limpas" para todos, mas a skill `combo` (nível 10) define "3 séries seguidas sem falhar = combo +30 XP". Não está claro se combo é universal ou depende da skill.
8. Bônus de classe duplicam skills de tier 1 (Guerreiro +10% força = Corte do Recruta; Explorador +15% cardio = Estocada). O bônus do Paladino ("Streak protegido 1×/semana") é o efeito da **Égide** (tier 2), e não do Respiro, que é o inicial dele. Não há classe para o Arcano.
9. Saída do estado Exausto: a cura é "3 missões em 7 dias", mas os corações voltam "+1 a cada 2 missões". Não está dito qual regra tira do Exausto nem se a cura devolve corações.
10. Protótipo × regra:
    - Embalo aparece quando hearts===5, mas a regra é streak ≥ 5;
    - [Treinar] dá +1 coração por toque, mas a regra é +1 a cada 2 missões;
    - o HeartBar começa em 3 no index.html e o padrão do Dashboard é 5.
11. **Fórmula de XP indefinida**: XP base por missão (180/160/70 no mock), XP das quests, empilhamento de multiplicadores (classe + skill + status ±% + clima + itens) e curva de nível (nv 8 = 4.320/4.900). Os títulos por nível não existem (o level up repete "Guerreiro da Penumbra"; o README cita "Iniciante → Lenda da Academia").
12. A barra de **Energia** e o efeito do Respiro ("recupera Energia") não têm regra.
13. Modificadores de clima: não se sabe quando aplicam, e "cardio ao ar livre" e "Monstros escondidos no mapa" (neblina) não têm mecânica. Risco de abuso: o clima é lido uma vez ao abrir o app.
14. Itens: as Botas de couro são drop da Gosma no BESTIARY, mas no inventário vêm de "Conquista · Primeira missão". A bolsa diz capacidade 20 mas a grade mostra 15. Não há ação de equipar nem regra de bônus.
15. Paleta: as opções são apresentadas como "A/B/C" no guia, mas o AppConfig entrega as 4 num Segmented. Decisão de produto: tema escolhível pelo usuário ou só uma paleta padrão? O switch "Modo escuro RPG" conflita com a opção "Claro".
16. Ferro e Fósforo herdam da Brasa `--attr-*`, `--steel`, `--success-wash`, `--text-disabled` e `--surface-overlay`, então o Ferro "monocromático" mantém os atributos coloridos. Os glows âmbar ficam fixos em todas as paletas.
17. Componentes não usados por nenhuma tela: QuestLogEntry (o histórico usa SessionCard), Stepper e PixelFx. As 4 sprite sheets PNG viraram legado.
18. Quatro transições (star-iris, crt-off, burn-away, shatter-wipe) e cinco momentos de UI (xp, achievement, bossHit, alert, confetti) estão definidos mas não ligados a nada. "Derrota" (burn-away) não tem tela.
19. Onboarding: só o passo 1 de 4 foi desenhado.
20. O ui_kits/README diz que "Guilda é um estado vazio", mas a tela vem populada.
21. O PDF aceita "ficha, planilha ou print" no texto, mas o input só aceita `application/pdf`. "Print" implica OCR de imagem.
22. "Treino livre" (FAB) entra no combate sem plano: como ficam monstros e chefe?
23. Token `--step` = 4px contra degraus de 2px no PixelBox e no README.
24. O texto dentro dos FX é só ASCII, porque a fonte do pixelfx não tem acentos ("QUEST COMPLETE", "PLANO PRONTO"). Mistura inglês e português.

### F.4 O que o design marca como pendente ou simulado
- Nenhum arquivo usa literalmente "Para decidir".
- Pendências explícitas:
  - Arcano/INT = "Fase 5 do TODO";
  - "Sprites ainda não existem" (slots listrados);
  - "Guilda é um estado vazio, porque o feed depende de servidor próprio";
  - telas "novas (sem rota ainda)": Masmorra, Grimório, Bestiário, Inventário;
  - sons a produzir (ElevenLabs).
- Simulações: `WeatherBanner` com code forçado mostra "Simulado"; botões [Simular falta]/[Treinar]; log do PDF; carregamento de 650ms; FOES fixos; combo começando em 2; PR sempre no exercício 0.

### F.5 O que depende de servidor
- Guilda: feed, seguidores, `feed/share`, `feed/shared-item/[id]`; o backup "incluir conta do feed".
- Planejador IA (LLM, "Recursos Pro").
- Backup remoto (endpoint do usuário).
- Importação de PDF, se o parser ou o OCR rodar fora do dispositivo (não especificado).
- Open-Meteo (API pública, sem chave, mas precisa de rede; fallback offline = céu limpo).
- Bênção "+5% XP para a guilda" (social).
