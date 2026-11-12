import type { PixelIconName } from '@/components/presentation/pixel-icons.generated';

export interface PixelIconRef {
  name: PixelIconName;
  /** Graus; o conjunto Pixelarticons não tem setas/chevrons em todas as direções. */
  rotate?: number;
}

type Entry = PixelIconName | PixelIconRef;

/** Ícone usado quando o nome não está no mapa (avisa em desenvolvimento). */
export const FALLBACK_PIXEL_ICON: PixelIconName = 'info-box';

// Nomes Material (herdados do LiftLog) -> Pixelarticons. O conjunto tem só 79 ícones:
// `search` não tem equivalente e usa `list` até a F2 desenhar o ícone.
const entries = {
  add: 'plus',
  arrowDownward: { name: 'arrow-up', rotate: 180 },
  arrowUpward: 'arrow-up',
  assignment: 'list-box',
  assignmentFill: 'list-box',
  bugReport: 'warning-box',
  close: 'close',
  contentCopy: 'note',
  copyAll: 'note',
  assignmentAdd: 'list-box',
  language: 'map',
  delete: 'trash',
  edit: 'edit',
  error: 'alert',
  history: 'clock',
  info: 'info-box',
  minus: 'minus',
  moreHoriz: { name: 'more-vertical', rotate: 90 },
  playArrow: 'play',
  moreVert: 'more-vertical',
  notes: 'notes',
  personRemove: 'user',
  cancel: 'close',
  notesFill: 'notes',
  notifications: 'notification',
  plus: 'plus',
  star: 'bookmark',
  unfoldLess: { name: 'chevron-right', rotate: -90 },
  unfoldMore: { name: 'chevron-right', rotate: 90 },
  openInBrowser: 'external-link',
  promptSuggestion: 'message',
  send: 'message',
  bolt: 'zap',
  remove: 'minus',
  save: 'save',
  forum: 'message',
  forumFill: 'message',
  search: 'list',
  directionsRun: 'human-run',
  directionsRunFill: 'human-run',
  trailLength: 'trending',
  timer: 'clock',
  settings: 'sliders',
  settingsFill: 'sliders',
  analytics: 'analytics',
  analyticsFill: 'analytics',
  settingsBackupRestore: 'reload',
  public: 'map',
  publicFill: 'map',
  vpnKey: 'lock-open',
  stop: 'checkbox',
  replay: 'reload',
  vpnKeyFill: 'lock-open',
  share: 'external-link',
  text: 'article',
  reload: 'reload',
  check: 'check',
  'menu-down': { name: 'chevron-right', rotate: 90 },
  arrowDropDown: { name: 'chevron-right', rotate: 90 },
  arrowDropUp: { name: 'chevron-right', rotate: -90 },
  expandCircleDown: { name: 'chevron-right', rotate: 90 },
  expandCircleUp: { name: 'chevron-right', rotate: -90 },
  'pencil-outline': 'edit',
  'menu-up': { name: 'chevron-right', rotate: -90 },
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  backup: 'upload',
  description: 'article',
  descriptionFill: 'article',
  calendar: 'calendar',
  'calendar-blank': 'calendar',
  cloudUpload: 'upload',
  translate: 'article',
  weight: 'coin',
  fitnessCenter: 'human-handsup',
  fitnessCenterFill: 'human-handsup',
  inventory: 'briefcase',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  playCircle: 'play',
  physicalTherapy: 'human',
  physicalTherapyFill: 'human',
  barChart: 'chart-bar',
  barChartFill: 'chart-bar',
  infoFill: 'info-box',
  cake: 'gift',
  cakeFill: 'gift',
  socialLeaderboard: 'trophy',
  socialLeaderboardFill: 'trophy',
  male: 'human',
  maleFill: 'human',
  exerciseFill: 'human-run',
  speed: 'speed-fast',
  speedFill: 'speed-fast',
  event: 'calendar-week',
  eventFill: 'calendar-week',
  monitorWeight: 'dashboard',
  monitorWeightFill: 'dashboard',
  person: 'user',
  personFill: 'user',
  targetFill: 'radio-on',
  pauseCircle: 'pause',
  airlineSeatReclineExtraFill: 'human',
  pause: 'pause',
  shield: 'shield',
  shieldFill: 'shield',
  menuBook: 'book-open',
  menuBookFill: 'book-open',
  groups: 'users',
  groupsFill: 'users',
  localFireDepartment: 'drop',
  checkCircle: 'check',
  lock: 'lock',
  militaryTech: 'flag',
  workspacePremium: 'trophy',
  trendingUp: 'trending-up',
  diamond: 'gift',
} satisfies Record<string, Entry>;

export type PixelIconKey = keyof typeof entries;

export function resolvePixelIcon(name: string): PixelIconRef {
  const entry: Entry | undefined = (entries as Record<string, Entry>)[name];
  if (!entry) {
    if (__DEV__) console.warn(`[Icon] sem Pixelarticon para "${name}"`);
    return { name: FALLBACK_PIXEL_ICON };
  }
  return typeof entry === 'string' ? { name: entry } : entry;
}

export const pixelIconKeys = Object.keys(entries) as PixelIconKey[];
