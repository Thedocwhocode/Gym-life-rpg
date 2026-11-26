# GymLife RPG

**Repositório oficial:** [github.com/Thedocwhocode/Gym-life-rpg](https://github.com/Thedocwhocode/Gym-life-rpg)
· [Issues](https://github.com/Thedocwhocode/Gym-life-rpg/issues)
· [Pull requests](https://github.com/Thedocwhocode/Gym-life-rpg/pulls)

Cada treino é uma missão. O **GymLife RPG** é um app de registro de treinos de academia com
progressão de RPG: você registra séries e cargas, ganha XP, sobe de nível, cumpre missões
semanais e desbloqueia conquistas.

É um projeto próprio, mantido pela Thedocwhocode, com marca, identidade visual, regras de jogo e
roadmap independentes. Ele nasceu de um fork do LiftLog e mantém a licença AGPL-3.0 e os créditos
do trabalho original (veja [Licença e créditos](#licença-e-créditos)). Bugs, sugestões e
contribuições vão para **este** repositório, não para o projeto de origem.

O lançamento é **só na web**, gratuito, com layout mobile first que se adapta ao tamanho da tela.
Android e iOS saíram do repositório e serão reconstruídos no futuro. O app não tem nenhum recurso
de IA nem compras.

### Principais recursos

- Registro de treinos (séries, repetições, carga, cardio) e progressão automática de carga
- XP, níveis, títulos, missões semanais e conquistas
- Jornada: classe, skills, itens, corações dos dias de treino, mapa de masmorras com chefes e
  combate por série (cada série golpeia o monstro); grimório, bestiário e inventário
- Visual pixel art em 4 paletas (Brasa, Ferro, Fósforo, Pergaminho), efeitos e transições de
  tela com pixelfx; ajuste "Efeitos: Completo / Reduzido / Desligado" e vibração separada
- Importar ficha em PDF (web): o app lê a ficha no próprio aparelho, sem IA e sem enviar o
  arquivo, e mostra uma tabela para conferir antes de salvar; ficha escaneada (foto) não tem texto
  para ler
- Catálogo de exercícios (texto do openGym) para sugerir nomes ao importar
- Backup local/remoto e exportação em CSV/JSON; backups do LiftLog continuam importando
- Opcional, só com backend próprio configurado: feed social com criptografia ponta a ponta
- 14 idiomas via Tolgee

---

## Início rápido

Pré-requisito: Node.js 20+.

```bash
git clone https://github.com/Thedocwhocode/Gym-life-rpg.git
cd Gym-life-rpg/app
npm install
npm run web       # Web
npm test          # testes (vitest)
npm run typecheck
```

### Variáveis de ambiente do app (todas opcionais)

| Variável | Efeito quando ausente |
|---|---|
| `EXPO_PUBLIC_API_URL` | Feed fica escondido no build de release |
| `EXPO_PUBLIC_WEB_URL` | Links de compartilhamento do feed ficam relativos |
| `EXPO_PUBLIC_SENTRY_DSN` | Relatórios de erro desligados |

### Backend

API .NET 10 com PostgreSQL, usada pelo feed. Veja [`backend/README.md`](./backend/README.md).

---

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [`app/`](./app/) | App web em React Native Web (Expo Router, Redux Toolkit, React Native Paper) |
| [`backend/GymLifeRpg.Api`](./backend/GymLifeRpg.Api) | WebAPI .NET: feeds criptografados |
| [`proto/`](./proto/) | Schemas protobuf (armazenamento local, backups, feed) |
| [`tests/`](./tests/) | Testes de integração da API e testes Cypress da web |
| [`docs/`](./docs/) | [Redesign](./docs/redesign/PLANO.md) · [Feed](./docs/FeedProcess.md) · [Backup remoto](./docs/RemoteBackup.md) · [Exportação em texto](./docs/PlaintextExport.md) |

## Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md). Abra bugs e sugestões nas
[issues deste repositório](https://github.com/Thedocwhocode/Gym-life-rpg/issues) e mande PRs
contra a branch `main`.

## Privacidade

[PRIVACY.md](./PRIVACY.md)

## Licença e créditos

AGPL-3.0 ([LICENSE](./LICENSE)). O GymLife RPG começou como fork do
[LiftLog](https://github.com/LiamMorrow/LiftLog), de Liam Morrow e colaboradores, e hoje segue
como projeto separado; o código herdado continua sob a mesma licença e com os créditos do autor
original. Os créditos completos de terceiros (LiftLog, pixelfx, openGym, fontes) estão em
[NOTICE.md](./NOTICE.md).
