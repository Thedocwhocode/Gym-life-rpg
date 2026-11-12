# Gym Life RPG — CLAUDE.md

## Sobre o Projeto

**Gym Life RPG** é um fork gamificado do [LiftLog](https://github.com/LiamMorrow/LiftLog), um aplicativo open-source de rastreamento de treinos na academia. A ideia central é transformar cada sessão de treino numa **jornada de RPG**: o usuário não apenas registra séries e pesos — ele ganha XP, sobe de nível, completa missões e evolui um personagem à medida que se torna mais forte de verdade.

---

## Repositório Oficial (Upstream)

| Campo        | Valor                                          |
|--------------|------------------------------------------------|
| Repositório  | https://github.com/LiamMorrow/LiftLog          |
| Autor        | Liam Morrow                                    |
| Licença      | AGPL-3.0                                       |
| Stack        | React Native + Expo + Redux Toolkit + .NET API |
| Design       | Material Design 3 via React Native Paper       |
| Plataformas  | Android, iOS, Web                              |

### Funcionalidades herdadas do LiftLog

- Rastreamento de treinos (séries, repetições, peso, cardio)
- Planejador de treinos com IA (OpenAI integration)
- Feed social com criptografia ponta-a-ponta (opt-in)
- Histórico de sessões e estatísticas com gráficos
- Internacionalização em 10+ idiomas via Tolgee/Weblate
- Backup remoto e exportação de dados (CSV, JSON, plaintext)
- Progressive overload automático

---

## Nosso Fork

| Campo        | Valor                                                      |
|--------------|------------------------------------------------------------|
| Repositório  | https://github.com/Thedocwhocode/Gym-life-rpg              |
| Branch base  | `main` (redesign em PRs empilhados `feat/redesign-f0…f9`)  |
| Autor        | Thedocwhocode (luizrodolfocc@gmail.com)                    |
| Objetivo     | Transformar o LiftLog num app gamificado de academia + RPG |
| Marca        | GymLife RPG · slug `gym-life-rpg` · scheme `gymliferpg`    |
| Bundle id    | `com.thedocwhocode.gymliferpg` (Android e iOS)             |

Fork independente: identificadores, URLs e contas do upstream foram removidos. Ficam de
propósito apenas o crédito/licença (`NOTICE.md`, README, diálogo "Sobre") e os fixtures
`*.liftlogbackup.gz`, que provam que backups do LiftLog continuam importando. Serviços externos
(API, Sentry, RevenueCat) só ligam via env `EXPO_PUBLIC_*` (ver README).

### O que já foi feito no fork

#### PR #1 — RPG Typography
- Adicionadas as fontes `Press Start 2P` (títulos/headlines, estilo pixel art retro) e `VT323` (corpo de texto, estilo terminal)
- Configurado `fontConfig` completo no `useAppTheme.tsx` para todos os tokens MD3 (`displayLarge` → `bodySmall`)

#### PR #2 — RPG Theme Overhaul
- Paleta de cores alterada para preto/vermelho/cinza (tom dark fantasy)
- Adicionados componentes `RpgCard` e `RpgIcon` (blocos estilo dashboard com visual de RPG)
- Atualizado `StatsPage` e cards de gráfico para usar os novos componentes RPG
- Fixado crash do `I18nManager` no web no root layout

---

## Visão de UI/UX — Academia como Jornada de RPG

O objetivo não é um skin superficial: é repensar cada tela como um elemento narrativo de um jogo de RPG.

### Princípios de Design

| Princípio               | Aplicação prática                                                               |
|-------------------------|---------------------------------------------------------------------------------|
| **Progressão visível**  | Barra de XP sempre presente, nível do personagem em destaque                   |
| **Recompensa imediata** | Animação de level-up ao completar treino, badge de conquista ao bater PR        |
| **Narrativa de jornada**| Histórico de treinos como "log de missões", não como tabela de dados            |
| **Dark fantasy**        | Paleta escura, bordas angulares, tipografia pixel art, ícones temáticos         |
| **Legibilidade RPG**    | VT323 para texto corrido (leitura fluida com estética retro), Press Start 2P para títulos impactantes |

### Mapeamento Academia → RPG

| Academia (LiftLog original) | RPG (Gym Life RPG)                    |
|-----------------------------|---------------------------------------|
| Sessão de treino            | Missão / Quest                        |
| Exercício concluído         | Habilidade usada                      |
| Série/repetição             | Ataque ou ação de combate             |
| Peso levantado              | Poder do personagem                   |
| Histórico de treinos        | Livro de Missões (Quest Log)          |
| Estatísticas                | Ficha de personagem (Character Sheet) |
| Progressão de carga         | Level up de atributo                  |
| Feed social                 | Guilda / Party                        |
| Settings                    | Taverna / Menu do herói               |
| Streak de treinos           | Combo / Streak de batalhas            |

---

## Redesign (F0–F9, `docs/redesign/`)

O plano e a spec do redesign estão em `docs/redesign/PLANO.md` e `docs/redesign/design-spec.md`.
O que mudou em relação às seções acima:

- **Fontes:** Pixelify Sans (títulos) e Space Mono (corpo), via `@expo-google-fonts/*`. Press
  Start 2P e VT323 saíram. Tokens em `app/theme/tokens.ts`.
- **Paletas:** Brasa (padrão), Ferro, Fósforo e Pergaminho em `app/theme/palettes.ts`, com teste
  de contraste ≥ 4,5:1. Primitivos pixel em `app/components/presentation/pixel/`.
- **Efeitos:** pixelfx vendorizado em `app/vendor/pixelfx/`, palco em
  `components/presentation/fx/FxStage.tsx`, transições de tela em `fx/transitions.ts` +
  `components/smart/screen-transition.tsx`. Ajuste "Efeitos: Completo/Reduzido/Desligado".
- **Rotas novas:** `(tabs)/dashboard` (Painel), `(session)/map` (mapa de masmorras),
  `settings/{inventory,grimoire,bestiary,training-days,pdf-import,dev-gallery}`.
- **Regras da jornada:** puras em `app/store/journey/rules/`, projeção em `app/store/rpg/derive.ts`.

---

## Estrutura do Projeto

```
Gym-life-rpg/
├── app/                        # Frontend React Native (Expo)
│   ├── app/(tabs)/             # Rotas de navegação por abas
│   │   ├── (session)/          # Tela de treino ativo
│   │   ├── feed/               # Feed social (Guilda)
│   │   ├── stats/              # Estatísticas (Ficha de personagem)
│   │   ├── history/            # Histórico (Quest Log)
│   │   └── settings/           # Configurações (Taverna)
│   ├── components/
│   │   ├── layout/             # Componentes estruturais
│   │   ├── presentation/       # Componentes visuais (dumb)
│   │   └── smart/              # Componentes conectados ao store
│   ├── hooks/
│   │   └── useAppTheme.tsx     # Tema RPG (fontes + cores + tokens)
│   ├── store/                  # Redux Toolkit (state global)
│   └── services/               # APIs, serviços externos
├── backend/                    # .NET 10 WebAPI GymLifeRpg.Api (feeds, IA, criptografia)
├── proto/                      # Protobuf schemas
└── docs/                       # Documentação técnica
```

---

## Tech Stack

| Camada          | Tecnologia                                         |
|-----------------|---------------------------------------------------|
| Framework       | React Native 0.81 + Expo 54                       |
| Navegação       | Expo Router (file-based)                          |
| Estado          | Redux Toolkit + react-redux                       |
| UI Base         | React Native Paper (MD3) + Material3 Theme        |
| Tipografia RPG  | Pixelify Sans (títulos) + Space Mono (corpo)      |
| Gráficos        | react-native-gifted-charts + @shopify/react-native-skia |
| Backend         | .NET 10 WebAPI (GymLifeRpg.Api)                   |
| IA              | OpenAI (planejador de treinos)                    |
| Pagamentos      | RevenueCat                                        |
| i18n            | Tolgee                                            |
| Testes          | Vitest                                            |

---

## Comandos de Desenvolvimento

```bash
cd app
npm install

npm run android   # Android
npm run ios       # iOS (macOS)
npm run web       # Web

npm test          # Rodar testes
npm run typecheck # Checar tipos TypeScript
npm run lint      # ESLint
```

---

## Branch de Trabalho

Cada fase do redesign tem sua branch, empilhada sobre a anterior: `feat/redesign-f0` (base
`main`) → `feat/redesign-f1` → … → `feat/redesign-f9`, com um PR por fase (#3 a #12). Correção
de uma fase vai na branch dela; o merge segue a ordem da pilha. Trabalho novo fora do redesign:
branch própria a partir de `main`.
