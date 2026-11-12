# NOTICE

GymLife RPG
Copyright (C) Thedocwhocode e colaboradores

Distribuído sob a GNU Affero General Public License v3.0 (veja [LICENSE](./LICENSE)).

## Trabalho original

O GymLife RPG é uma versão **modificada** do LiftLog:

- Projeto: LiftLog — https://github.com/LiamMorrow/LiftLog
- Copyright (C) Liam Morrow e colaboradores
- Licença: AGPL-3.0

Principais modificações: nova marca e identificadores; sistema de progressão RPG (XP, níveis,
missões e conquistas); tema e tipografia pixel art; serviços externos (API, Sentry,
RevenueCat) passaram a ser opcionais e configurados por variáveis de ambiente. O histórico
completo das mudanças está no git deste repositório.

## Componentes de terceiros

### pixelfx

Os efeitos, as transições de tela e o combate rodam com o pixelfx
(https://github.com/patch-gg/pixelfx), sob a licença MIT. `app/vendor/pixelfx/` é uma cópia do
código do pixelfx (o core e só os efeitos que o app toca), com o `LICENSE` e o `NOTICE.md` originais.

- Copyright (c) 2026 Patch
- Copyright (c) 2026 Hugo Duprez

Partes do pixelfx adaptam os VFX em pixel art do Sprite Fusion (Hugo Duprez, MIT) e o
Hollow Crown (rehan-remade, MIT).

Texto da licença:

```
MIT License

Copyright (c) 2026 Patch
Copyright (c) 2026 Hugo Duprez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Pixelarticons

Os caminhos de ícone em `app/components/presentation/pixel-icons.generated.ts` vêm do
Pixelarticons (https://github.com/halfmage/pixelarticons), sob a licença MIT.

- Copyright (c) Gerrit Halfmann

### Fontes

- Pixelify Sans — Copyright 2021 The Pixelify Sans Project Authors
  (https://github.com/eifetx/Pixelify-Sans), SIL Open Font License 1.1.
- Space Mono — Copyright 2016 The Space Mono Project Authors
  (https://github.com/googlefonts/spacemono), SIL Open Font License 1.1.

As duas são distribuídas pelos pacotes `@expo-google-fonts/*`, que trazem o texto da licença.

### PDF.js

A importação de ficha em PDF lê o texto no aparelho com o `pdfjs-dist`
(https://github.com/mozilla/pdf.js), sob a Apache License 2.0. O texto da licença vem no pacote.

- Copyright Mozilla Foundation e colaboradores

### Open-Meteo

A faixa de clima do Painel usa a API do Open-Meteo (https://open-meteo.com), cujos dados são
distribuídos sob CC BY 4.0: "Weather data by Open-Meteo.com".
