# Efeitos sonoros

Coloque aqui os mp3 gerados no ElevenLabs (ver `NOTICE.md`), com o id do som como nome:
`ui_tap.mp3`, `ui_confirm.mp3`, `ui_cancel.mp3`, `ui_tab.mp3`, `hit_set.mp3`, `monster_faint.mp3`,
`level_up.mp3`, `quest_complete.mp3`, `heart_lost.mp3`, `system_notice.mp3`.

Depois ligue cada um em `FILES` de `app/services/sound.ts`
(`ui_tap: require('@/assets/sound/sfx/ui_tap.mp3')`). Sem o arquivo, toca o sintetizado.
