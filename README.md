# GymLife RPG

Cada treino é uma missão. O **GymLife RPG** é um app de registro de treinos de academia com
progressão de RPG: você registra séries e cargas, ganha XP, sobe de nível, cumpre missões
semanais e desbloqueia conquistas. Roda em Android, iOS e web (React Native + Expo).

### Principais recursos

- Registro de treinos (séries, repetições, carga, cardio) e progressão automática de carga
- XP, níveis, títulos, missões semanais e conquistas
- Visual dark fantasy com tipografia pixel art e efeitos de recompensa em pixel art
- Backup local/remoto e exportação em CSV/JSON
- Opcionais, só com backend próprio configurado: feed social com criptografia ponta a ponta
  e planejador de treinos com IA
- 14 idiomas via Tolgee

---

## Início rápido

Pré-requisitos: Node.js 20+, Android Studio (Android) e Xcode (iOS, só no macOS).

```bash
cd app
npm install
npm run android   # Android
npm run ios       # iOS (macOS)
npm run web       # Web
npm test          # testes (vitest)
npm run typecheck
```

### Variáveis de ambiente do app (todas opcionais)

| Variável | Efeito quando ausente |
|---|---|
| `EXPO_PUBLIC_API_URL` | Feed e planejador com IA ficam escondidos no build de release |
| `EXPO_PUBLIC_WEB_URL` | Links de compartilhamento do feed ficam relativos |
| `EXPO_PUBLIC_SENTRY_DSN` | Relatórios de erro desligados |
| `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` / `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY` | Recursos "pro" indisponíveis no nativo |

### Backend

API .NET 10 com PostgreSQL, usada pelo feed e pelo planejador com IA. Veja
[`backend/README.md`](./backend/README.md).

---

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [`app/`](./app/) | App React Native (Expo Router, Redux Toolkit, React Native Paper) |
| [`backend/GymLifeRpg.Api`](./backend/GymLifeRpg.Api) | WebAPI .NET: feeds criptografados, IA, compras |
| [`backend/RevenueCat`](./backend/RevenueCat) | Cliente gerado da API do RevenueCat |
| [`proto/`](./proto/) | Schemas protobuf (armazenamento local, backups, feed) |
| [`tests/`](./tests/) | Testes de integração da API e testes Cypress da web |
| [`docs/`](./docs/) | [Feed](./docs/FeedProcess.md) · [Backup remoto](./docs/RemoteBackup.md) · [Exportação em texto](./docs/PlaintextExport.md) |

## Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md). Bugs e sugestões:
[issues](https://github.com/Thedocwhocode/Gym-life-rpg/issues).

## Privacidade

[PRIVACY.md](./PRIVACY.md)

## Licença e créditos

AGPL-3.0 ([LICENSE](./LICENSE)). O GymLife RPG é um fork independente do
[LiftLog](https://github.com/LiamMorrow/LiftLog), de Liam Morrow e colaboradores. Os créditos
completos de terceiros estão em [NOTICE.md](./NOTICE.md).
