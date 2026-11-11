# Política de Privacidade — GymLife RPG

> Rascunho. Revisar (e preencher o contato) antes de publicar nas lojas.

Última atualização: 2026-11-10

O GymLife RPG é um app de código aberto (AGPL-3.0), oferecido gratuitamente e "como está".

## Dados que ficam no seu aparelho

Treinos, planos, progresso de RPG (XP, nível, conquistas) e configurações são gravados
**apenas no seu aparelho**. Nós não temos acesso a eles. Backups e exportações são arquivos
que você mesmo gera e guarda onde quiser.

## Recursos opcionais que enviam dados

Nenhum dos itens abaixo funciona sem que você o ative.

- **Feed social**: os treinos que você publica são criptografados ponta a ponta no seu aparelho
  antes do envio. O servidor guarda só o conteúdo criptografado, um identificador aleatório
  e sua chave pública. Ele não consegue ler seus treinos. Apenas quem você aprovar consegue
  decifrá-los.
- **Planejador com IA (pro)**: as mensagens que você escreve e o contexto de treino que você
  escolher incluir são enviados ao nosso servidor e repassados à OpenAI para gerar a resposta.
  Esses dados **não** têm criptografia ponta a ponta, porque precisam ser legíveis pelo modelo.
- **Relatórios de erro**: com sua autorização (pedida na primeira abertura), falhas do app são
  enviadas ao Sentry com dados técnicos: modelo e sistema do aparelho, versão do app, horário e
  endereço IP. Esses relatórios nunca incluem o conteúdo dos treinos nem chaves de criptografia.
- **Compras**: assinaturas são processadas pela Google Play/App Store e gerenciadas via
  RevenueCat. Não recebemos dados do seu cartão.
- **Importar ficha em PDF (pro)**: o texto é extraído no seu aparelho; o arquivo PDF nunca sai
  dele. Antes do primeiro envio o app pede sua confirmação. O texto vai ao nosso servidor e à
  OpenAI para montar o plano, sem criptografia ponta a ponta. Fichas podem ter dados de saúde
  (peso, lesões, observações médicas). Nosso servidor não grava o texto: ele fica só na memória
  da conversa e some quando ela termina.
- **Backup remoto**: envia o arquivo de backup só para o servidor que **você** configurar.
- **Clima do reino**: o Painel consulta o [Open-Meteo](https://open-meteo.com/) para mostrar o
  clima. Sem a sua permissão, a consulta usa São Paulo. Se você tocar na faixa de clima e permitir,
  o app envia ao Open-Meteo a sua **localização aproximada** (arredondada para cerca de 1 km),
  só a ele e sem nenhum identificador seu. As coordenadas não ficam gravadas: o aparelho guarda
  por até 1 hora apenas a última leitura do clima.

## Terceiros

[Google Play Services](https://policies.google.com/privacy) ·
[Apple](https://www.apple.com/legal/privacy/) ·
[Sentry](https://sentry.io/privacy/) ·
[RevenueCat](https://www.revenuecat.com/privacy/) ·
[OpenAI](https://openai.com/policies/privacy-policy/) ·
[Open-Meteo](https://open-meteo.com/en/terms)

## O que não fazemos

Não usamos cookies de rastreamento nem anúncios. Não vendemos dados e não montamos perfis.

## Seus direitos (LGPD)

Você pode apagar os dados locais desinstalando o app ou limpando os dados dele. Para remover
dados do feed, revogue os seguidores e despublique no próprio app, ou peça a remoção pelo
contato abaixo.

## Crianças

O app não é direcionado a menores de 13 anos.

## Contato

TODO: e-mail de contato · [issues no GitHub](https://github.com/Thedocwhocode/Gym-life-rpg/issues)

---

# Privacy Policy — GymLife RPG (English)

> Draft. Review (and fill in the contact) before publishing to the stores.

GymLife RPG is an open source app (AGPL-3.0), provided free of charge and as is.

- **On-device data**: workouts, plans, RPG progress and settings are stored **only on your
  device**. We have no access to them.
- **Social feed (opt-in)**: published workouts are end-to-end encrypted on your device. The
  server stores only ciphertext, a random user ID and your public key.
- **AI planner (pro, opt-in)**: the messages you send and the workout context you choose are
  sent to our server and forwarded to OpenAI. This data is not end-to-end encrypted.
- **Crash reports (opt-in)**: technical diagnostics (device, OS, app version, time, IP) are sent
  to Sentry. Workout content and keys are never included.
- **Purchases**: handled by Google Play / App Store via RevenueCat. We never see your card data.
- **Remote backup**: backups go only to a server **you** configure.
- No tracking cookies, no ads, no data sales.
- Third parties: Google Play Services, Apple, Sentry, RevenueCat, OpenAI (links above).
- Not directed at children under 13.
- Contact: TODO: contact e-mail · [GitHub issues](https://github.com/Thedocwhocode/Gym-life-rpg/issues)
