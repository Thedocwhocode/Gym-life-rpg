# TODO — Gym Life RPG

Decisões arquiteturais e tarefas de desenvolvimento priorizadas.
Foco principal: **Dashboard Gamificado** e **Frontend RPG**.

---

## FASE 1 — Fundação do Sistema RPG

### [x] 1.1 — Sistema de XP e Níveis (State + Lógica)

**Decisão arquitetural:** Criada slice Redux dedicada `store/rpg/` separada do domínio de treino.

- [x] `store/rpg/index.ts` com a slice: `xp`, `level`, `title` (Iniciante → Lenda da Academia), `streakDays`, `totalWorkouts`
- [x] `store/rpg/effects.ts` — ouve `addStoredSession` e calcula XP ganho
- [x] Tabela de XP: nível N requer `(N-1)² × 100` XP (level 2 = 100 XP, level 3 = 400 XP…)
- [x] XP por: séries completadas (+10 XP), cardio completado (+15 XP), bônus de sessão (+50 XP)
- [x] Persistência via `preference-service.ts` / `keyValueStore` sob chave `'RpgState'`

---

### [x] 1.2 — Sistema de Conquistas (Achievements)

- [x] `store/rpg/index.ts` — `ACHIEVEMENTS` array com 9 conquistas + `achievements: Record<string, string>` no state
- [x] Conquistas: Primeira Missão, Consistência, Semana Perfeita, Veterano, Guerreiro, Centurião, Força Bruta, Em Ascensão, Veterano de Ferro
- [x] Verificação automática no `addStoredSession` effect

---

### [x] 1.3 — Missões Semanais / Diárias (Quests)

- [x] `store/rpg/index.ts` — interface `Quest` e `weeklyQuests: Quest[]` no state
- [x] 3 quests por semana geradas por `buildWeeklyQuests()` em `effects.ts`:
  - `workouts_this_week` — treinos esta semana
  - `total_sets_this_week` — séries completadas
  - `streak_days` — streak de dias
- [x] Targets escalados por nível (nível 1-4: básico, 5-9: intermediário, 10+: avançado)
- [x] Progress re-calculado após cada sessão salva

---

## FASE 2 — Dashboard Gamificado (Tela Principal)

**Decisão arquitetural:** Nova rota `app/(tabs)/dashboard/` como primeira tab. Tela de treino continua existindo como tab "Treinar".

### [x] 2.1 — Rota e Layout do Dashboard

- [x] `app/(tabs)/dashboard/_layout.tsx` — usa `<StackWithHeader />`
- [x] `app/(tabs)/dashboard/index.tsx` — página principal do dashboard
- [x] `app/(tabs)/_layout.tsx` — "Dashboard" como primeira tab

---

### [x] 2.2 — Hero Section (Ficha do Personagem)

- [x] `components/presentation/rpg/CharacterCard.tsx`
  - Ícone de escudo + nível em destaque + título (Press Start 2P)
  - Pills de stat: TREINOS, STREAK, CONQUISTAS
- [x] `components/presentation/rpg/XpProgressBar.tsx` — barra animada com gradiente dourado (Reanimated + LinearGradient)

---

### [x] 2.3 — Cards de Status (Atributos do Personagem)

- [x] `components/presentation/rpg/StatAttributeCard.tsx` — card com borda lateral colorida
- [x] Cards exibidos:
  - **FOR (Força):** séries completadas esta semana
  - **RES (Resistência):** minutos de treino este mês
  - **VIT (Vitalidade):** streak atual (do RPG state)
  - **DES (Destreza):** exercícios distintos esta semana
- [x] Grid 2×2 no dashboard

---

### [x] 2.4 — Quest Ativa (Missão em Andamento)

- [x] `components/presentation/rpg/ActiveQuestPanel.tsx`
  - Lista das 3 quests semanais com ProgressBar individual
  - Label de XP reward por quest
  - Check visual para quests concluídas

---

### [x] 2.5 — Últimas Conquistas (Achievements Recentes)

- [x] `components/presentation/rpg/AchievementBadge.tsx`
  - Visual desbloqueado (ícone colorido) / bloqueado (grayscale + cadeado)
  - Modal de detalhe ao tocar
- [x] `components/presentation/rpg/AchievementsRow.tsx` — FlatList horizontal com contador

---

### [x] 2.6 — Quest Log (Histórico como Missões)

- [x] `app/(tabs)/history/index.tsx` — título alterado para "Quest Log"
- [x] `components/presentation/rpg/QuestLogItem.tsx` — wrapper com badge "MISSÃO COMPLETA" e XP ganho calculado por sessão

---

## FASE 3 — Polimento Visual e Animações

### [x] 3.1 — Animação de Level Up

- [x] `components/presentation/rpg/LevelUpOverlay.tsx` — overlay full-screen com animação (Portal + Reanimated)
- [x] Disparado via `state.rpg.pendingLevelUp` observado no root layout
- [x] Auto-dismiss após 3.3s com fade-out animado

---

### [x] 3.2 — Efeitos de Conclusão de Treino

- [x] `components/presentation/rpg/SessionRewardScreen.tsx` — tela de recompensa pós-sessão (Portal)
- [x] Exibe XP ganho + conquistas desbloqueadas naquela sessão
- [x] Integrado via `state.rpg.lastSessionReward` no root layout

---

### [x] 3.3 — Refinamento de Tipografia

- [x] `hooks/useRpgFontSize.ts` — hook que ajusta `fontSize` de PressStart2P por breakpoint de tela

> **Pendente:** Auditoria de todos os usos de `headlineLarge` etc. para verificar quebra em telas < 375px

---

### [x] 3.4 — Tema Escuro como Padrão

- [x] `forceDarkMode: boolean` (padrão `true`) adicionado ao `SettingsState` em `store/settings/index.ts`
- [x] `setForceDarkMode` action exportada
- [x] `getForceDarkMode`/`setForceDarkMode` adicionados ao `PreferenceService`
- [x] Leitura no `initializeSettingsStateSlice` + efeito de persistência em `store/settings/effects.ts`
- [x] `useAppTheme.tsx`: `isDark = forceDarkMode || colorScheme === 'dark'`; `schemedTheme` usa `isDark` em vez de `colorScheme`
- [x] Toggle "Modo Escuro RPG" adicionado em `settings/app-configuration.tsx`

> **Pendente:** Auditoria WCAG AA da paleta vermelho/preto em modo claro

---

## FASE 4 — Navegação e UX

### [x] 4.1 — Redesign das Tabs

| Posição | Tab         | Rota          | Ícone RPG              |
|---------|-------------|---------------|------------------------|
| 1       | Dashboard   | `dashboard/`  | `shield` / `shieldFill`|
| 2       | Treinar     | `(session)/`  | `fitnessCenter` + Fill |
| 3       | Quest Log   | `history/`    | `menuBook` + Fill      |
| 4       | Guilda      | `feed/`       | `groups` + Fill        |
| 5       | Stats       | `stats/`      | `analytics` + Fill     |
| 6       | Herói       | `settings/`   | `person` + Fill        |

- [x] Tabs atualizadas em `app/(tabs)/_layout.tsx`
- [x] Novos ícones registrados em `ms-icon-source.tsx` (shield, menuBook, groups, localFireDepartment, checkCircle, lock, militaryTech, workspacePremium, trendingUp, diamond)

---

### [x] 4.2 — Onboarding RPG

- [x] `rpgClass?: 'warrior' | 'scout' | 'paladin'` adicionado ao `RpgState` + `setRpgClass` action
- [x] `setRpgClass` incluído no `addDebouncedEffect` de persistência em `store/rpg/effects.ts`
- [x] Página 0 "Escolha sua Classe" adicionada ao `welcome-wizard.tsx` (Guerreiro / Explorador / Paladino com bônus descrito)
- [x] Wizard passou de 3 para 4 páginas; páginas existentes deslocadas para índices 1-3

> **Pendente:** Integração do `rpgClass` com multiplicador de XP no `sessionXp()` (efeitos diferentes por classe)

---

## Débito Técnico a Resolver

- [x] **Fontes grandes em mobile:** `useRpgFontSize` aplicado no `CharacterCard.tsx` para o display de nível (`displaySmall` 36px PressStart2P); restante auditado — outros usos de `headlineLarge` estão em telas não-RPG
- [ ] **i18n das strings RPG:** "Quest", "XP", "Level Up", "MISSÃO COMPLETA" estão hardcoded — adicionar ao Tolgee
- [x] **Testes unitários:** `store/rpg/index.spec.ts` criado — cobre `xpForLevel`, `levelFromXp`, `titleForLevel`, `xpProgress` com casos de borda
- [x] **Tema escuro forçado:** ver item 3.4 acima (implementado)
- [x] **Onboarding RPG:** ver item 4.2 acima (implementado)

---

---

## FASE 5 — Modo Estudo (INT Attribute)

**Visão:** Estender o sistema RPG para cobrir estudo e foco, não apenas treino físico. Cada sessão pomodoro bem executada ganha pontos de Inteligência (INT), criando um loop de progressão para o "herói completo".

### [ ] 5.1 — Modelo e Estado

**Decisão arquitetural:** `StudyTask` e `PomodoroSession` como entidades separadas do `RpgState`; slice própria `store/study/`.

- [ ] Atributo `int: number` adicionado ao `RpgState` (paralelo a XP/streak)
- [ ] `store/study/index.ts` — slice com:
  - `StudyTask`: `id`, `title`, `targetPomodoros`, `completedPomodoros`, `date`
  - `PomodoroSession`: `taskId`, `startedAt`, `completedAt?`, `pauseCount`, `cancelled`
  - State: `tasks: StudyTask[]`, `activeSession?: PomodoroSession`
- [ ] `store/study/effects.ts` — ao completar pomodoro, `awardIntPoints(points)` baseado em regras de pontuação

### [ ] 5.2 — Regras de Pontuação INT

| Evento                          | Pontos INT |
|---------------------------------|------------|
| Pomodoro completo sem pausas    | 10         |
| Pomodoro completo com pausas    | 5          |
| Pomodoro cancelado/interrompido | 0          |
| Cada pausa durante pomodoro     | -1 (penalidade acumulada no próximo) |
| Tarefa concluída (todos pomodoros) | +20 bônus |

### [ ] 5.3 — Timer Pomodoro (Tela Full-Screen Dark)

- [ ] `app/(tabs)/study/` — nova tab entre Stats e Herói
- [ ] `app/(tabs)/study/index.tsx` — lista de tarefas do dia com `StudyTask` cards
- [ ] `components/presentation/study/PomodoroTimer.tsx` — tela escura (Portal) com:
  - Timer regressivo: 25min foco → 5min descanso
  - Anel animado (Reanimated) mostrando progresso
  - Botões: Pausar / Retomar / Cancelar
  - Contagem de pausas visível
- [ ] Auto-transição foco → descanso ao terminar; descanso → próximo foco com confirmação

### [ ] 5.4 — Detecção de Interrupção (Opcional/Avançado)

- [ ] `AppState` listener: app em background durante sessão = interrupção registrada
- [ ] Cada vez que o app vai para background durante foco: `pauseCount++` ou penalidade automática
- [ ] Notificação de retorno ao foco se app foi minimizado

> **Nota arquitetural:** Não é possível detectar "uso do celular para outros fins" diretamente no React Native sem permissões especiais de acessibilidade (Android) ou Screen Time API (iOS). A abordagem prática é detectar `AppState` mudanças para `background`/`inactive`. Confirmar escopo de privacidade com o usuário antes de implementar.

### [ ] 5.5 — Dashboard INT

- [ ] `StatAttributeCard` com `abbr="INT"`, `label="Inteligência"`, `value={intPoints}`, `icon="psychology"` adicionado ao Dashboard (grid 2×3 ou novo row)
- [ ] Missões semanais de estudo: `study_pomodoros_this_week` como novo tipo de quest

---

## Referências de Inspiração

- Habitica (gamificação de hábitos)
- Final Fantasy (ficha de personagem, barra de XP)
- Dark Souls (visual dark fantasy, progressão de stats)
- Pokémon GO (conquistas, streaks diários)
