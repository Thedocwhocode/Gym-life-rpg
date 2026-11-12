# Contribuindo com o GymLife RPG

Obrigado pelo interesse! Correções, recursos, documentação e ideias são bem-vindos.

## Estilo

- TypeScript: [Prettier](https://prettier.io/) + [ESLint](https://eslint.org/) (`npm run lint` em `app/`).
- C#: [CSharpier](https://csharpier.com/) — rode `dotnet csharpier .` nas pastas do backend antes de commitar.
- Mensagens de commit no formato conventional commits (`feat:`, `fix:`, `refactor:`...).
- Siga a estrutura e os nomes que já existem no código.

## Fluxo

1. Crie um branch: `git checkout -b feat/minha-feature`
2. Rode os testes:
   - App: `cd app && npm test && npm run typecheck`
   - Backend (precisa do Postgres de `tests/docker-compose.yml`):
     `cd tests && docker compose up -d && cd GymLifeRpg.Tests.Api && dotnet run`
3. Abra um Pull Request contra `main`.

## Efeitos pixel art

Os efeitos rodam ao vivo pelo [pixelfx](https://github.com/patch-gg/pixelfx) (MIT), vendorizado em
`app/vendor/pixelfx/`. O player é `app/components/presentation/fx/FxStage.tsx` e a lista de efeitos fica
em `app/components/presentation/fx/registry.ts`: para adicionar um efeito, copie o módulo para
`app/vendor/pixelfx/src/fx/` e registre-o ali.
Para criar efeitos novos no Claude Code existe a skill: `/plugin marketplace add patch-gg/pixelfx`.

## Checklist do PR

- [ ] Compila e passa nos testes
- [ ] Lint e formatação ok
- [ ] Descrição explica a mudança
- [ ] Documentação atualizada
- [ ] Nenhum segredo ou dado sensível

## Issues

[Abra uma issue](https://github.com/Thedocwhocode/Gym-life-rpg/issues) com o máximo de detalhes.

## Licença

Ao contribuir, você concorda que sua contribuição será licenciada sob a [AGPL v3](LICENSE).
