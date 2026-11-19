import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import pt from '../../i18n/pt.json';
import { buildWeeklyQuests } from './derive';
import { ACHIEVEMENTS } from './index';

// A descrição gravada no estado é pt; a tela traduz por id/tipo, então toda chave precisa existir.
describe('textos traduzíveis do RPG', () => {
  const quests = buildWeeklyQuests('2026-W46', 1);
  const keys = [
    ...quests.map((q) => `rpg.quests.${q.type}`),
    ...ACHIEVEMENTS.flatMap((a) => [
      `rpg.achievement.${a.id}.name`,
      `rpg.achievement.${a.id}.description`,
    ]),
  ];
  it.each([
    ['en', en],
    ['pt', pt],
  ] as const)('%s tem todas as chaves', (_, dict) => {
    const missing = keys.filter((k) => !(k in dict));
    expect(missing).toEqual([]);
  });
});
