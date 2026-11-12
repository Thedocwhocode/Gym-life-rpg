// Gerado por um script a partir de docs/redesign (export Claude Design): só os efeitos que o app usa.
// Metro não faz code-split, então os import() dinâmicos do pixelfx viram este registro estático.
/* eslint-disable import/no-namespace */
import * as arcane_arcane_missiles from '@/vendor/pixelfx/src/fx/arcane/arcane-missiles.js';
import * as arcane_magic_circle_cast from '@/vendor/pixelfx/src/fx/arcane/magic-circle-cast.js';
import * as arcane_spell_charge from '@/vendor/pixelfx/src/fx/arcane/spell-charge.js';
import * as arcane_time_stop from '@/vendor/pixelfx/src/fx/arcane/time-stop.js';
import * as critters_bat from '@/vendor/pixelfx/src/fx/critters/bat.js';
import * as critters_eyeball from '@/vendor/pixelfx/src/fx/critters/eyeball.js';
import * as critters_flying_skull from '@/vendor/pixelfx/src/fx/critters/flying-skull.js';
import * as critters_ghost from '@/vendor/pixelfx/src/fx/critters/ghost.js';
import * as critters_slime from '@/vendor/pixelfx/src/fx/critters/slime.js';
import * as critters_snake from '@/vendor/pixelfx/src/fx/critters/snake.js';
import * as critters_wisp from '@/vendor/pixelfx/src/fx/critters/wisp.js';
import * as holy_blessing from '@/vendor/pixelfx/src/fx/holy/blessing.js';
import * as holy_divine_shield from '@/vendor/pixelfx/src/fx/holy/divine-shield.js';
import * as holy_heal from '@/vendor/pixelfx/src/fx/holy/heal.js';
import * as holy_resurrection from '@/vendor/pixelfx/src/fx/holy/resurrection.js';
import * as melee_dagger_flurry from '@/vendor/pixelfx/src/fx/melee/dagger-flurry.js';
import * as melee_double_slash from '@/vendor/pixelfx/src/fx/melee/double-slash.js';
import * as melee_hammer_smash from '@/vendor/pixelfx/src/fx/melee/hammer-smash.js';
import * as melee_heavy_cleave from '@/vendor/pixelfx/src/fx/melee/heavy-cleave.js';
import * as melee_spin_slash from '@/vendor/pixelfx/src/fx/melee/spin-slash.js';
import * as melee_sword_slash from '@/vendor/pixelfx/src/fx/melee/sword-slash.js';
import * as melee_thrust from '@/vendor/pixelfx/src/fx/melee/thrust.js';
import * as moves_arrow_shot from '@/vendor/pixelfx/src/fx/moves/arrow-shot.js';
import * as moves_dash_strike from '@/vendor/pixelfx/src/fx/moves/dash-strike.js';
import * as moves_ground_pound from '@/vendor/pixelfx/src/fx/moves/ground-pound.js';
import * as moves_holy_smite from '@/vendor/pixelfx/src/fx/moves/holy-smite.js';
import * as moves_sword_combo from '@/vendor/pixelfx/src/fx/moves/sword-combo.js';
import * as scifi_scanner from '@/vendor/pixelfx/src/fx/scifi/scanner.js';
import * as spawn_coin_drop from '@/vendor/pixelfx/src/fx/spawn/coin-drop.js';
import * as spawn_dissolve_burn from '@/vendor/pixelfx/src/fx/spawn/dissolve-burn.js';
import * as spawn_poof from '@/vendor/pixelfx/src/fx/spawn/poof.js';
import * as spawn_soul_rise from '@/vendor/pixelfx/src/fx/spawn/soul-rise.js';
import * as spawn_summon_rise from '@/vendor/pixelfx/src/fx/spawn/summon-rise.js';
import * as status_cursed from '@/vendor/pixelfx/src/fx/status/cursed.js';
import * as status_haste from '@/vendor/pixelfx/src/fx/status/haste.js';
import * as status_rage from '@/vendor/pixelfx/src/fx/status/rage.js';
import * as status_sleep from '@/vendor/pixelfx/src/fx/status/sleep.js';
import * as status_slowed from '@/vendor/pixelfx/src/fx/status/slowed.js';
import * as transitions_blinds from '@/vendor/pixelfx/src/fx/transitions/blinds.js';
import * as transitions_burn_away from '@/vendor/pixelfx/src/fx/transitions/burn-away.js';
import * as transitions_crt_off from '@/vendor/pixelfx/src/fx/transitions/crt-off.js';
import * as transitions_diamond_wipe from '@/vendor/pixelfx/src/fx/transitions/diamond-wipe.js';
import * as transitions_glitch_wipe from '@/vendor/pixelfx/src/fx/transitions/glitch-wipe.js';
import * as transitions_iris from '@/vendor/pixelfx/src/fx/transitions/iris.js';
import * as transitions_pixel_dissolve from '@/vendor/pixelfx/src/fx/transitions/pixel-dissolve.js';
import * as transitions_shatter_wipe from '@/vendor/pixelfx/src/fx/transitions/shatter-wipe.js';
import * as transitions_slash_wipe from '@/vendor/pixelfx/src/fx/transitions/slash-wipe.js';
import * as transitions_star_iris from '@/vendor/pixelfx/src/fx/transitions/star-iris.js';
import * as ui_achievement from '@/vendor/pixelfx/src/fx/ui/achievement.js';
import * as ui_coin_collect from '@/vendor/pixelfx/src/fx/ui/coin-collect.js';
import * as ui_combo_counter from '@/vendor/pixelfx/src/fx/ui/combo-counter.js';
import * as ui_confetti from '@/vendor/pixelfx/src/fx/ui/confetti.js';
import * as ui_countdown from '@/vendor/pixelfx/src/fx/ui/countdown.js';
import * as ui_crit_number from '@/vendor/pixelfx/src/fx/ui/crit-number.js';
import * as ui_damage_number from '@/vendor/pixelfx/src/fx/ui/damage-number.js';
import * as ui_exclamation from '@/vendor/pixelfx/src/fx/ui/exclamation.js';
import * as ui_health_bar_hit from '@/vendor/pixelfx/src/fx/ui/health-bar-hit.js';
import * as ui_heart_lost from '@/vendor/pixelfx/src/fx/ui/heart-lost.js';
import * as ui_level_up from '@/vendor/pixelfx/src/fx/ui/level-up.js';
import * as ui_quest_complete from '@/vendor/pixelfx/src/fx/ui/quest-complete.js';
import * as weather_clouds from '@/vendor/pixelfx/src/fx/weather/clouds.js';
import * as weather_falling_leaves from '@/vendor/pixelfx/src/fx/weather/falling-leaves.js';
import * as weather_fog from '@/vendor/pixelfx/src/fx/weather/fog.js';
import * as weather_god_rays from '@/vendor/pixelfx/src/fx/weather/god-rays.js';
import * as weather_rain from '@/vendor/pixelfx/src/fx/weather/rain.js';
import * as weather_shooting_stars from '@/vendor/pixelfx/src/fx/weather/shooting-stars.js';
import * as weather_snow from '@/vendor/pixelfx/src/fx/weather/snow.js';
import * as weather_storm from '@/vendor/pixelfx/src/fx/weather/storm.js';

export const FX_REGISTRY = {
  'arcane/arcane-missiles': arcane_arcane_missiles,
  'arcane/magic-circle-cast': arcane_magic_circle_cast,
  'arcane/spell-charge': arcane_spell_charge,
  'arcane/time-stop': arcane_time_stop,
  'critters/bat': critters_bat,
  'critters/eyeball': critters_eyeball,
  'critters/flying-skull': critters_flying_skull,
  'critters/ghost': critters_ghost,
  'critters/slime': critters_slime,
  'critters/snake': critters_snake,
  'critters/wisp': critters_wisp,
  'holy/blessing': holy_blessing,
  'holy/divine-shield': holy_divine_shield,
  'holy/heal': holy_heal,
  'holy/resurrection': holy_resurrection,
  'melee/dagger-flurry': melee_dagger_flurry,
  'melee/double-slash': melee_double_slash,
  'melee/hammer-smash': melee_hammer_smash,
  'melee/heavy-cleave': melee_heavy_cleave,
  'melee/spin-slash': melee_spin_slash,
  'melee/sword-slash': melee_sword_slash,
  'melee/thrust': melee_thrust,
  'moves/arrow-shot': moves_arrow_shot,
  'moves/dash-strike': moves_dash_strike,
  'moves/ground-pound': moves_ground_pound,
  'moves/holy-smite': moves_holy_smite,
  'moves/sword-combo': moves_sword_combo,
  'scifi/scanner': scifi_scanner,
  'spawn/coin-drop': spawn_coin_drop,
  'spawn/dissolve-burn': spawn_dissolve_burn,
  'spawn/poof': spawn_poof,
  'spawn/soul-rise': spawn_soul_rise,
  'spawn/summon-rise': spawn_summon_rise,
  'status/cursed': status_cursed,
  'status/haste': status_haste,
  'status/rage': status_rage,
  'status/sleep': status_sleep,
  'status/slowed': status_slowed,
  'transitions/blinds': transitions_blinds,
  'transitions/burn-away': transitions_burn_away,
  'transitions/crt-off': transitions_crt_off,
  'transitions/diamond-wipe': transitions_diamond_wipe,
  'transitions/glitch-wipe': transitions_glitch_wipe,
  'transitions/iris': transitions_iris,
  'transitions/pixel-dissolve': transitions_pixel_dissolve,
  'transitions/shatter-wipe': transitions_shatter_wipe,
  'transitions/slash-wipe': transitions_slash_wipe,
  'transitions/star-iris': transitions_star_iris,
  'ui/achievement': ui_achievement,
  'ui/coin-collect': ui_coin_collect,
  'ui/combo-counter': ui_combo_counter,
  'ui/confetti': ui_confetti,
  'ui/countdown': ui_countdown,
  'ui/crit-number': ui_crit_number,
  'ui/damage-number': ui_damage_number,
  'ui/exclamation': ui_exclamation,
  'ui/health-bar-hit': ui_health_bar_hit,
  'ui/heart-lost': ui_heart_lost,
  'ui/level-up': ui_level_up,
  'ui/quest-complete': ui_quest_complete,
  'weather/clouds': weather_clouds,
  'weather/falling-leaves': weather_falling_leaves,
  'weather/fog': weather_fog,
  'weather/god-rays': weather_god_rays,
  'weather/rain': weather_rain,
  'weather/shooting-stars': weather_shooting_stars,
  'weather/snow': weather_snow,
  'weather/storm': weather_storm,
} as const;

export type FxId = keyof typeof FX_REGISTRY;
export const FX_IDS = Object.keys(FX_REGISTRY) as FxId[];
