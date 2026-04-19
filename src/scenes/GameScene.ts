import {
  Scene,
  UIEntityBuilder,
  EntityBuilder,
  globalEventBus,
  globalTheme,
  globalTweens,
  globalAudio,
  Easing,
  Time,
  UI_TEXT_COMPONENT,
  UI_TRANSFORM_COMPONENT,
  UI_PROGRESS_BAR_COMPONENT,
  SPRITE_COMPONENT,
  TRANSFORM_COMPONENT,
  SPINE_COMPONENT,
  MathUtils,
} from 'agent-gamedev';
import type {
  IWorld,
  TransformComponent,
  UITextComponent,
  UITransformComponent,
  UIProgressBarComponent,
  SpriteComponent,
  SpineComponent,
} from 'agent-gamedev';
import {
  GAME_CONFIG,
  FONT,
  EVENTS,
  STORY_CHAPTERS,
  TOTAL_CHAPTERS,
  INITIAL_STATS,
  STAT_MIN,
  STAT_MAX,
  STAT_LABELS,
  STAT_COLORS,
  UNIVERSITIES,
  MAJORS,
  SURVIVAL_EVENTS,
  EVENT_TRIGGER_CHANCE,
  HOUSING_TIMING_OPTIONS,
  HOUSING_BRANCH_EVENTS,
  CRISIS_THRESHOLD,
  CRISIS_EVENT_MAP,
  MIRACLE_STAT_THRESHOLD,
  MIRACLE_TRIGGER_CHANCE,
  MIRACLE_TRIGGER_STATS,
  MIRACLE_EVENT_IDS,
  UNI_HOVER_TAGS,
  GLITCH_TRIGGER_STATS,
  GLITCH_OVERLAY_COLOR,
  GLITCH_OVERLAY_ALPHA,
  GLITCH_DESAT_COLOR,
  GLITCH_DESAT_ALPHA,
  GLITCH_STRIP_COUNT,
  GLITCH_STRIP_COLOR,
  GLITCH_STRIP_ALPHA,
  GLITCH_STRIP_H,
  GLITCH_STRIP_JITTER,
  GLITCH_RGB_R_COLOR,
  GLITCH_RGB_C_COLOR,
  GLITCH_RGB_ALPHA,
  GLITCH_RGB_OFFSET,
  GLITCH_PULSE_SPEED,
  GLITCH_AUDIO_HEARTBEAT,
  GLITCH_AUDIO_WHISPER,
  TOAST_STAT_THRESHOLD,
  SYSTEM_TOAST_MESSAGES,
  EVENT_SERIES_IMAGE_MAP,
} from '../constants';
import type { PlayerStats, StoryChoice, UniversityDef, MajorDef, SurvivalEvent, HousingTimingDef } from '../constants';

/** Insert line break after each Chinese period for multi-line display. */
function wrapAtPeriod(text: string): string {
  return text.replace(/。/g, '。\n');
}

/** Short emoji labels for stat effects shown on choice buttons. */
const EFFECT_ICONS: Record<keyof PlayerStats, string> = {
  hkd: '💰', san: '🧠', energy: '⚡', gpa: '📊', cantonese: '🗣', english: '🔤',
};

/** Format stat effects into a compact string for button labels. */
function formatEffects(effects: Partial<PlayerStats>): string {
  const parts: string[] = [];
  for (const k of STAT_KEYS) {
    const v = effects[k];
    if (v != null && v !== 0) {
      parts.push(`${EFFECT_ICONS[k]}${v > 0 ? '+' : ''}${v}`);
    }
  }
  return parts.length > 0 ? `  [${parts.join(' ')}]` : '';
}

const W = GAME_CONFIG.WIDTH;
const H = GAME_CONFIG.HEIGHT;

const MAX_CHOICES = 3;
const STAT_KEYS: (keyof PlayerStats)[] = ['hkd', 'san', 'energy', 'gpa', 'cantonese', 'english'];

// ── Layout constants ──────────────────────────────────────────────
const MARGIN = 24;
const TOP_Y = 52;
const STATS_W = 250;
const STATS_X = W - STATS_W - MARGIN;
const CONTENT_W = STATS_X - MARGIN - 14;

// Image viewport (top area, full content width)
const IMG_X = MARGIN;
const IMG_Y = TOP_Y;
const IMG_W = CONTENT_W;
const IMG_H = 340;

// Narration panel (below image, right-aligned to clear character)
const STORY_CONTENT_LEFT = 380;
const NAR_X = STORY_CONTENT_LEFT;
const NAR_Y = IMG_Y + IMG_H + 8;
const NAR_W = W - MARGIN - STORY_CONTENT_LEFT;
const NAR_TITLE_H = 40;
const NAR_TEXT_PAD = 20;
const NAR_TEXT_W = NAR_W - NAR_TEXT_PAD * 2 - 10;
const NAR_BODY_H = 210;
const NAR_PANEL_H = NAR_TITLE_H + NAR_BODY_H + 30;

// Choice buttons (below narration, 2×2 grid layout like reference)
const CHOICE_Y = NAR_Y + NAR_PANEL_H + 8;
const CHOICE_FULL_W = NAR_W;
const CHOICE_GRID_GAP_X = 12;
const CHOICE_GRID_GAP_Y = 10;
const CHOICE_BTN_W = Math.floor((CHOICE_FULL_W - CHOICE_GRID_GAP_X) / 2);
const CHOICE_BTN_H = 72;
const BRACKET_LEN = 28;
const BRACKET_THICK = 3;

// ── Viewport particle constants ─────────────────────────────────
const VP_PARTICLE_COUNT = 10;
const VP_PARTICLE_COLORS = [0x007788, 0x005566, 0x44bbcc, 0x338899, 0x6644aa];

// ── Character (Spine) constants ─────────────────────────────────
const SPINE_MALE = 'assets/spine/male-student.json';

// ── Full-screen scrolling night background ──────────────────────
const NIGHT_BG_SCROLL_SPEED = 0.3;
const SPINE_FEMALE = 'assets/spine/female-student.json';
const SPINE_MALE_HUMANITIES = 'assets/spine/male-humanities.json';
const SPINE_FEMALE_HUMANITIES = 'assets/spine/female-humanities.json';
const SPINE_MALE_FINANCE = 'assets/spine/male-finance.json';
const SPINE_FEMALE_FINANCE = 'assets/spine/female-finance.json';
const CHAR_SELECT_SCALE = 0.55;
const CHAR_GAME_SCALE = 1.0625;              // 1.25 × 0.85 — shrink to 85%
const CHAR_GAME_X = MARGIN + 80;             // left side of screen
const CHAR_GAME_Y = H - 20;

/** Major-specific spine path mapping: {majorId}_{gender} → spine path. */
const MAJOR_SPINE_MAP: Record<string, string> = {
  'humanities_male': SPINE_MALE_HUMANITIES,
  'humanities_female': SPINE_FEMALE_HUMANITIES,
  'finance_male': SPINE_MALE_FINANCE,
  'finance_female': SPINE_FEMALE_FINANCE,
};

// Chapter-based Spine animation mapping
const IDLE_ANIMS = ['walk'];                  // always walking — journey feel
const RUN_CHAPTER_THRESHOLD = 5;              // chapter index >= 5 → run animation
const RUN_ANIM = 'walk';

// ── Selection card layout ─────────────────────────────────────────
const SEL_TITLE_Y = 80;
const SEL_SUBTITLE_Y = 150;
const SEL_CARDS_Y = 220;
const SEL_CARD_GAP = 20;

// ── Retro CRT visual constants ────────────────────────────────────
const SCANLINE_SPACING = 4;
const SCANLINE_ALPHA = 0.06;
const VIGNETTE_ALPHA = 0.45;

// ── Hover effect constants ───────────────────────────────────────
const HOVER_GLOW_COLOR = 0xff2244;
const HOVER_TAG_COLOR = 0xff4466;
const HOVER_TAG_FONT_SIZE = 15;
const GLITCH_BAR_COLOR = 0xff1133;
const GLITCH_BAR_ALPHA = 0.35;
const GLITCH_BAR_H = 3;

// ── System toast (粤语调侃) constants ────────────────────────────
const TOAST_W = 700;
const TOAST_H = 50;
const TOAST_Y = IMG_Y + IMG_H - TOAST_H - 10;
const TOAST_X = IMG_X + IMG_W / 2;
const TOAST_BG_COLOR = 0x110022;
const TOAST_BG_ALPHA = 0.92;
const TOAST_TEXT_COLOR = 0xff6644;
const TOAST_FONT_SIZE = 18;
const TOAST_DURATION = 3.5;

type GamePhase = 'select-gender' | 'select-university' | 'select-major' | 'select-housing' | 'narration' | 'choosing' | 'event-narration' | 'event-choosing';

export class GameScene extends Scene {
  readonly name = 'GameScene';

  private stats: PlayerStats = { ...INITIAL_STATS };
  private chapterIndex = 0;
  private phase: GamePhase = 'select-gender';
  private selectedUniversity: UniversityDef | null = null;
  private selectedMajor: MajorDef | null = null;
  private selectedGender: 'male' | 'female' | null = null;
  private selectedHousingTiming: HousingTimingDef | null = null;
  private _spinePath = '';

  // Random event tracking
  private usedEventIds: Set<string> = new Set();
  private currentEvent: SurvivalEvent | null = null;

  private bgEntity = -1;
  private gridBgEntity = -1;
  private chapterTitleEntity = -1;
  private narrationEntity = -1;
  private continueHintEntity = -1;
  private choiceEntities: number[] = [];
  private statBarEntities: Record<keyof PlayerStats, number> = {
    hkd: -1, san: -1, energy: -1, gpa: -1, cantonese: -1, english: -1,
  };
  private statLabelEntities: Record<keyof PlayerStats, number> = {
    hkd: -1, san: -1, energy: -1, gpa: -1, cantonese: -1, english: -1,
  };
  private statValueEntities: Record<keyof PlayerStats, number> = {
    hkd: -1, san: -1, energy: -1, gpa: -1, cantonese: -1, english: -1,
  };
  private progressEntity = -1;
  private overlayEntity = -1;
  private chapterImageEntity = -1;
  private choicePanelEntity = -1;
  private characterEntity = -1;
  private nightBgEntity = -1;

  private selectionEntities: number[] = [];
  private storyUIEntities: number[] = [];
  private storyUIBuilt = false;
  private _vpParticles: number[] = [];
  private _vpParticleSpeeds: number[] = [];

  private _onContinue: (() => void) | null = null;
  private _choiceHandlers: Array<() => void> = [];
  private _choiceEventNames: string[] = [];

  // ── Hover effect state ──────────────────────────────────────────
  private _uniCardRects: { x: number; y: number; w: number; h: number; uniId: string }[] = [];
  private _uniHoverTagEntities: number[] = [];
  private _uniHoverGlowEntity = -1;
  private _uniHoveredIdx = -1;
  private _choiceBtnRects: { x: number; y: number; w: number; h: number }[] = [];
  private _choiceGlitchEntities: number[] = [];
  private _choiceHoveredIdx = -1;

  // ── Cyber glitch effect state ─────────────────────────────────
  private _glitchActive = false;
  private _glitchDesatEntity = -1;
  private _glitchOverlayEntity = -1;
  private _glitchRgbREntity = -1;
  private _glitchRgbCEntity = -1;
  private _glitchStripEntities: number[] = [];
  private _glitchHeartbeatId = -1;
  private _glitchWhisperId = -1;
  private _glitchTimer = 0;

  // ── Animated scan line state ─────────────────────────────────────
  private _gameScanLineEntity = -1;

  // ── Cost info bar entity ──────────────────────────────────────────
  private _costInfoEntity = -1;

  // ── System toast state ──────────────────────────────────────────
  private _toastShownForStat: Set<string> = new Set();
  private _toastEntity = -1;
  private _toastBgEntity = -1;

  onEnter(world: IWorld): void {
    globalTheme.setTheme('cyberpunk');

    this.stats = { ...INITIAL_STATS };
    this.chapterIndex = 0;
    this.phase = 'select-gender';
    this.selectedUniversity = null;
    this.selectedMajor = null;
    this.selectedGender = null;
    this.selectedHousingTiming = null;
    this._spinePath = '';
    this.choiceEntities = [];
    this._choiceHandlers = [];
    this._choiceEventNames = [];
    this.selectionEntities = [];
    this.storyUIEntities = [];
    this.storyUIBuilt = false;
    this._vpParticles = [];
    this._vpParticleSpeeds = [];
    this.usedEventIds = new Set();
    this.currentEvent = null;

    // ── Reset glitch effect state ────────────────────────────────
    this._glitchActive = false;
    this._glitchDesatEntity = -1;
    this._glitchOverlayEntity = -1;
    this._glitchRgbREntity = -1;
    this._glitchRgbCEntity = -1;
    this._glitchStripEntities = [];
    this._glitchHeartbeatId = -1;
    this._glitchWhisperId = -1;
    this._glitchTimer = 0;

    // ── Reset scan line state ──────────────────────────────────────
    this._gameScanLineEntity = -1;
    this._costInfoEntity = -1;

    // ── Reset toast state ─────────────────────────────────────────
    this._toastShownForStat = new Set();
    this._toastEntity = -1;
    this._toastBgEntity = -1;

    // ── Tiling grid background ──────────────────────────────────
    this.gridBgEntity = EntityBuilder.create(world, W, H)
      .withTilingSprite({ textureId: 'cyber-grid', tileWidth: W, tileHeight: H, zIndex: 1 })
      .build();
    this.trackEntity(this.gridBgEntity);

    // ── Full-screen scrolling night skyline background ──────────
    this.nightBgEntity = EntityBuilder.create(world, W, H)
      .withTilingSprite({ textureId: 'hk-night-bg', tileWidth: W, tileHeight: H, zIndex: 0 })
      .build();
    this.trackEntity(this.nightBgEntity);

    // ── City skyline background ─────────────────────────────────
    this.bgEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: H / 2 })
      .withSprite({ textureId: 'cyber-bg', anchorX: 0.5, anchorY: 0.5, alpha: 0.45, zIndex: 2 })
      .build();
    this.trackEntity(this.bgEntity);

    this.overlayEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: H / 2, screenSpace: true })
      .withSprite({ color: 0x020408, width: W, height: H, alpha: 0.2, zIndex: 3 })
      .build();
    this.trackEntity(this.overlayEntity);

    // ── CRT Scanlines ───────────────────────────────────────────
    const scanlineCount = Math.floor(H / SCANLINE_SPACING);
    for (let i = 0; i < scanlineCount; i++) {
      if (i % 2 === 0) continue;
      this.trackEntity(
        EntityBuilder.create(world, W, H)
          .withTransform({ x: W / 2, y: i * SCANLINE_SPACING, screenSpace: true })
          .withSprite({ color: 0x000000, width: W, height: 1, alpha: SCANLINE_ALPHA, zIndex: 500 })
          .build()
      );
    }

    // ── Vignette corners ────────────────────────────────────────
    const vigPositions = [[0, 0], [W, 0], [0, H], [W, H]];
    for (const [vx, vy] of vigPositions) {
      this.trackEntity(
        EntityBuilder.create(world, W, H)
          .withTransform({ x: vx, y: vy, screenSpace: true })
          .withSprite({ color: 0x000000, width: 300, height: 200, alpha: VIGNETTE_ALPHA, zIndex: 490 })
          .build()
      );
    }

    // ── Neon border lines (magenta accent matching reference) ──────
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W / 2, y: 1, screenSpace: true }).withSprite({ color: 0xff00aa, width: W, height: 3, alpha: 0.7, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W / 2, y: H - 1, screenSpace: true }).withSprite({ color: 0xff00aa, width: W, height: 3, alpha: 0.7, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: 2, y: H / 2, screenSpace: true }).withSprite({ color: 0x440044, width: 2, height: H, alpha: 0.4, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W - 2, y: H / 2, screenSpace: true }).withSprite({ color: 0x440044, width: 2, height: H, alpha: 0.4, zIndex: 10 }).build());

    // ── Top HUD: game title + subtitle ───────────────────────────
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: MARGIN, y: 10, width: 360, height: 28, zIndex: 200 }).withText({ text: '◈ 港硕留子生存图鉴', fontSize: 20, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xff66cc, align: 'left', strokeColor: 0x330022, strokeWidth: 2 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: MARGIN, y: 34, width: 360, height: 16, zIndex: 200 }).withText({ text: 'THE GAME OF THE BRAVE // HK_MSc_SIM', fontSize: 11, fontFamily: FONT.PIXEL, color: 0x667788, align: 'left' }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 300, y: 14, width: 280, height: 18, zIndex: 200 }).withText({ text: 'SYSTEM::ONLINE ◈', fontSize: 13, fontFamily: FONT.PIXEL, color: 0x556677, align: 'right' }).build());

    // ── Bottom tab bar ─────────────────────────────────────────
    // Background strip
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W / 2, y: H - 22, screenSpace: true }).withSprite({ color: 0x0a0a20, width: W - 32, height: 36, alpha: 0.85, zIndex: 9 }).build());
    // Tab labels
    const TAB_Y = H - 34;
    const TAB_FONT = 15;
    const TAB_COLOR = 0xff66cc;
    const TAB_DIM = 0x556677;
    const tabItems = ['【图鉴系统】', '【人脉存折】', '【深港跨境通勤选项】'];
    const tabW = Math.floor((W - 80) / tabItems.length);
    tabItems.forEach((label, idx) => {
      this.trackEntity(UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: 40 + idx * tabW, y: TAB_Y, width: tabW, height: 24, zIndex: 200 })
        .withText({ text: label, fontSize: TAB_FONT, fontFamily: FONT.PIXEL, color: idx === 0 ? TAB_COLOR : TAB_DIM, align: 'center' })
        .build());
    });

    // ── Animated horizontal scan line ─────────────────────────────
    this._gameScanLineEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: 0, screenSpace: true })
      .withSprite({ color: 0x00e5ff, width: W, height: 1, alpha: 0.04, zIndex: 495 })
      .build();
    this.trackEntity(this._gameScanLineEntity);

    // ── Corner bracket decorations ─────────────────────────────────
    const BK = 40;
    const BT = 2;
    const bkColor = 0xff00aa;
    const bkAlpha = 0.35;
    // Top-left
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: 6, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: 6, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    // Top-right
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BK, y: 6, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BT, y: 6, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    // Bottom-left
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: H - 6 - BT, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: 0xaa0066, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: H - 6 - BK, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: 0xaa0066, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    // Bottom-right
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BK, y: H - 6 - BT, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: 0xaa0066, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BT, y: H - 6 - BK, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: 0xaa0066, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());

    this.showGenderSelection(world);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Gender Selection Phase
  // ══════════════════════════════════════════════════════════════════
  private showGenderSelection(world: IWorld): void {
    this.phase = 'select-gender';
    this.clearSelectionEntities(world);

    const titleE = this.createSelText(world, '选 择 你 的 角 色', SEL_TITLE_Y, 48, 0x44bbcc, true);
    const subE = this.createSelText(world, '> CHARACTER_SELECT // 选择性别', SEL_SUBTITLE_Y, 16, 0x6644aa);
    this.selectionEntities.push(titleE, subE);

    const divE = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: SEL_SUBTITLE_Y + 35, screenSpace: true })
      .withSprite({ color: 0x005566, width: 700, height: 1, alpha: 0.5, zIndex: 10 })
      .build();
    this.trackEntity(divE);
    this.selectionEntities.push(divE);

    // Two character cards side by side
    const CARD_W = 320;
    const CARD_H = 460;
    const CARD_GAP = 80;
    const totalW = 2 * CARD_W + CARD_GAP;
    const startX = W / 2 - totalW / 2;
    const cardY = SEL_CARDS_Y + 20;

    const genders: Array<{ label: string; spinePath: string; key: 'male' | 'female' }> = [
      { label: '男 生', spinePath: SPINE_MALE, key: 'male' },
      { label: '女 生', spinePath: SPINE_FEMALE, key: 'female' },
    ];

    genders.forEach((g, i) => {
      const x = startX + i * (CARD_W + CARD_GAP);
      const eventName = `gender:select:${g.key}`;

      // Card panel
      const panelE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y: cardY, width: CARD_W, height: CARD_H, zIndex: 160, alpha: 1 })
        .withPanel({ backgroundColor: 0x040a14, backgroundAlpha: 0.95, borderRadius: 10, borderWidth: 2, borderColor: 0x1a4455 })
        .build();
      this.trackEntity(panelE);
      this.selectionEntities.push(panelE);

      // Spine character (game-world layer, centered in card)
      const spineX = x + CARD_W / 2;
      const spineY = cardY + CARD_H - 80;
      const spineE = EntityBuilder.create(world, W, H)
        .withTransform({ x: spineX, y: spineY, screenSpace: true })
        .withSpine({ skeletonPath: g.spinePath, defaultAnimation: 'idle', loop: true, scale: CHAR_SELECT_SCALE, zIndex: 170 })
        .build();
      this.trackEntity(spineE);
      this.selectionEntities.push(spineE);

      // Label below character
      const labelE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y: cardY + CARD_H - 50, width: CARD_W, height: 40, zIndex: 200, alpha: 1 })
        .withText({ text: g.label, fontSize: 28, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xb0c8d8, align: 'center' })
        .build();
      this.trackEntity(labelE);
      this.selectionEntities.push(labelE);

      // Click overlay button
      const btnE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y: cardY, width: CARD_W, height: CARD_H, zIndex: 250, alpha: 0.01 })
        .withButton({ label: '', fontSize: 1, borderRadius: 10, borderWidth: 0, onClick: eventName })
        .build();
      this.trackEntity(btnE);
      this.selectionEntities.push(btnE);

      const handler = () => this.onGenderSelected(world, g.key, g.spinePath);
      globalEventBus.on(eventName, handler);
      this._choiceHandlers.push(handler);
      this._choiceEventNames.push(eventName);
    });
  }

  private onGenderSelected(world: IWorld, gender: 'male' | 'female', spinePath: string): void {
    this.selectedGender = gender;
    this._spinePath = spinePath;
    this.clearSelectionHandlers();
    this.showUniversitySelection(world);
  }

  /** Switch character Spine animation based on current chapter. */
  private updateCharacterAnim(world: IWorld): void {
    if (this.characterEntity === -1) return;
    const spine = world.getComponent<SpineComponent>(this.characterEntity, SPINE_COMPONENT);
    if (!spine) return;

    if (this.chapterIndex >= RUN_CHAPTER_THRESHOLD) {
      // Late chapters (graduation rush) → run
      spine.play(RUN_ANIM, true);
    } else {
      // Early chapters → random idle variant
      const anim = IDLE_ANIMS[Math.floor(Math.random() * IDLE_ANIMS.length)];
      spine.play(anim, true);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── University Selection Phase
  // ══════════════════════════════════════════════════════════════════
  private showUniversitySelection(world: IWorld): void {
    this.phase = 'select-university';
    this.clearSelectionEntities(world);
    this._uniCardRects = [];
    this._uniHoveredIdx = -1;

    const titleE = this.createSelText(world, '选 择 你 的 学 校', SEL_TITLE_Y, 48, 0x44bbcc, true);
    const subE = this.createSelText(world, '> SCHOOL_ORIGINS // 地理决定论 // 5 OPTIONS', SEL_SUBTITLE_Y, 16, 0x6644aa);
    this.selectionEntities.push(titleE, subE);

    const divE = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: SEL_SUBTITLE_Y + 35, screenSpace: true })
      .withSprite({ color: 0x005566, width: 700, height: 1, alpha: 0.5, zIndex: 10 })
      .build();
    this.trackEntity(divE);
    this.selectionEntities.push(divE);

    // 5 university cards — 3 top + 2 bottom (centered)
    const CARD_W = 340;
    const CARD_H = 170;
    const GRID_GAP_X = 24;
    const GRID_GAP_Y = 22;
    const COLS_TOP = 3;
    const COLS_BOT = 2;
    const topRowW = COLS_TOP * CARD_W + (COLS_TOP - 1) * GRID_GAP_X;
    const botRowW = COLS_BOT * CARD_W + (COLS_BOT - 1) * GRID_GAP_X;
    const topStartX = W / 2 - topRowW / 2;
    const botStartX = W / 2 - botRowW / 2;

    UNIVERSITIES.forEach((uni, i) => {
      const isTopRow = i < COLS_TOP;
      const col = isTopRow ? i : i - COLS_TOP;
      const row = isTopRow ? 0 : 1;
      const x = isTopRow
        ? topStartX + col * (CARD_W + GRID_GAP_X)
        : botStartX + col * (CARD_W + GRID_GAP_X);
      const y = SEL_CARDS_Y + row * (CARD_H + GRID_GAP_Y);
      const eventName = `uni:select:${i}`;

      // Panel
      const panelE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y, width: CARD_W, height: CARD_H, zIndex: 160, alpha: 1 })
        .withPanel({ backgroundColor: 0x040a14, backgroundAlpha: 0.95, borderRadius: 8, borderWidth: 2, borderColor: 0x1a4455 })
        .build();
      this.trackEntity(panelE);
      this.selectionEntities.push(panelE);

      // Title badge — 图鉴名称
      const badgeE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 14, y: y + 10, width: CARD_W - 28, height: 22, zIndex: 200, alpha: 1 })
        .withText({ text: `【${uni.title}】`, fontSize: 17, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xff8844, align: 'left' })
        .build();
      this.trackEntity(badgeE);
      this.selectionEntities.push(badgeE);

      // University name + abbr
      const nameE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 14, y: y + 36, width: CARD_W - 28, height: 28, zIndex: 200, alpha: 1 })
        .withText({ text: `${uni.name} (${uni.abbr})`, fontSize: 22, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xb0c8d8, align: 'left' })
        .build();
      this.trackEntity(nameE);
      this.selectionEntities.push(nameE);

      // Geographic trait
      const geoE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 14, y: y + 68, width: CARD_W - 28, height: 18, zIndex: 200, alpha: 1 })
        .withText({ text: `📍 ${uni.geoTrait}`, fontSize: 15, fontFamily: FONT.PIXEL, color: 0x668899, align: 'left' })
        .build();
      this.trackEntity(geoE);
      this.selectionEntities.push(geoE);

      // Mechanic lines
      const mechLines = uni.mechanic.split('\n');
      mechLines.forEach((line, li) => {
        const mechE = UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: x + 14, y: y + 90 + li * 20, width: CARD_W - 28, height: 18, zIndex: 200, alpha: 1 })
          .withText({ text: line, fontSize: 14, fontFamily: FONT.PIXEL, color: 0x44aa88, align: 'left' })
          .build();
        this.trackEntity(mechE);
        this.selectionEntities.push(mechE);
      });

      // Stat bonus hint
      const bonusText = Object.entries(uni.statBonus)
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${STAT_LABELS[k as keyof PlayerStats]}${v! > 0 ? '+' : ''}${v}`)
        .join('  ');
      const bonusE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 14, y: y + CARD_H - 26, width: CARD_W - 28, height: 18, zIndex: 200, alpha: 1 })
        .withText({ text: bonusText, fontSize: 13, fontFamily: FONT.PIXEL, color: 0x558866, align: 'left' })
        .build();
      this.trackEntity(bonusE);
      this.selectionEntities.push(bonusE);

      // Click button overlay
      const btnE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y, width: CARD_W, height: CARD_H, zIndex: 250, alpha: 0.01 })
        .withButton({ label: '', fontSize: 1, borderRadius: 8, borderWidth: 0, onClick: eventName })
        .build();
      this.trackEntity(btnE);
      this.selectionEntities.push(btnE);

      // Record card rect for hover detection
      this._uniCardRects.push({ x, y, w: CARD_W, h: CARD_H, uniId: uni.id });

      const handler = () => this.onUniversitySelected(world, uni);
      globalEventBus.on(eventName, handler);
      this._choiceHandlers.push(handler);
      this._choiceEventNames.push(eventName);
    });
  }

  private onUniversitySelected(world: IWorld, uni: UniversityDef): void {
    this.selectedUniversity = uni;
    this.applyStatBonus(uni.statBonus);
    this.clearSelectionHandlers();
    this.showMajorSelection(world);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Major Selection Phase
  // ══════════════════════════════════════════════════════════════════
  private showMajorSelection(world: IWorld): void {
    this.phase = 'select-major';
    this.clearSelectionEntities(world);

    const uniName = this.selectedUniversity ? this.selectedUniversity.name : '';
    const uniTitle = this.selectedUniversity ? this.selectedUniversity.title : '';
    const titleE = this.createSelText(world, '选 择 你 的 专 业', SEL_TITLE_Y, 48, 0x44bbcc, true);
    const subE = this.createSelText(world, `> 【${uniTitle}】 ${uniName} // SELECT_MAJOR`, SEL_SUBTITLE_Y, 16, 0x6644aa);
    this.selectionEntities.push(titleE, subE);

    const divE = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: SEL_SUBTITLE_Y + 35, screenSpace: true })
      .withSprite({ color: 0x005566, width: 700, height: 1, alpha: 0.5, zIndex: 10 })
      .build();
    this.trackEntity(divE);
    this.selectionEntities.push(divE);

    const CARD_W = 400;
    const CARD_H = 150;
    const totalW = MAJORS.length * CARD_W + (MAJORS.length - 1) * SEL_CARD_GAP;
    const startX = W / 2 - totalW / 2;

    MAJORS.forEach((major, i) => {
      const x = startX + i * (CARD_W + SEL_CARD_GAP);
      const y = SEL_CARDS_Y + 40;
      const eventName = `major:select:${i}`;

      const panelE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y, width: CARD_W, height: CARD_H, zIndex: 160, alpha: 1 })
        .withPanel({ backgroundColor: 0x040a14, backgroundAlpha: 0.95, borderRadius: 8, borderWidth: 2, borderColor: 0x1a4455 })
        .build();
      this.trackEntity(panelE);
      this.selectionEntities.push(panelE);

      const nameE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 18, width: CARD_W - 40, height: 30, zIndex: 200, alpha: 1 })
        .withText({ text: major.name, fontSize: 26, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xb0c8d8, align: 'center' })
        .build();
      this.trackEntity(nameE);
      this.selectionEntities.push(nameE);

      const descE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 56, width: CARD_W - 40, height: 24, zIndex: 200, alpha: 1 })
        .withText({ text: major.description, fontSize: 16, fontFamily: FONT.PIXEL, color: 0x668899, align: 'center', wordWrap: true, maxWidth: CARD_W - 50 })
        .build();
      this.trackEntity(descE);
      this.selectionEntities.push(descE);

      const bonusText = Object.entries(major.statBonus)
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${STAT_LABELS[k as keyof PlayerStats]}${v! > 0 ? '+' : ''}${v}`)
        .join('  ');
      const bonusE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 105, width: CARD_W - 40, height: 18, zIndex: 200, alpha: 1 })
        .withText({ text: bonusText, fontSize: 15, fontFamily: FONT.PIXEL, color: 0x44aa88, align: 'center' })
        .build();
      this.trackEntity(bonusE);
      this.selectionEntities.push(bonusE);

      const btnE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y, width: CARD_W, height: CARD_H, zIndex: 250, alpha: 0.01 })
        .withButton({ label: '', fontSize: 1, borderRadius: 8, borderWidth: 0, onClick: eventName })
        .build();
      this.trackEntity(btnE);
      this.selectionEntities.push(btnE);

      const handler = () => this.onMajorSelected(world, major);
      globalEventBus.on(eventName, handler);
      this._choiceHandlers.push(handler);
      this._choiceEventNames.push(eventName);
    });
  }

  private onMajorSelected(world: IWorld, major: MajorDef): void {
    this.selectedMajor = major;
    this.applyStatBonus(major.statBonus);

    // Resolve character spine based on gender + major combination
    const key = `${major.id}_${this.selectedGender}`;
    this._spinePath = MAJOR_SPINE_MAP[key] ?? this._spinePath;

    this.clearSelectionHandlers();
    this.showHousingTimingSelection(world);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Housing Timing Selection Phase (Chapter 1 Dynamic Opening)
  // ══════════════════════════════════════════════════════════════════
  private showHousingTimingSelection(world: IWorld): void {
    this.phase = 'select-housing';
    this.clearSelectionEntities(world);

    const titleE = this.createSelText(world, '🗺️ 第一章 · 动态开局设定', SEL_TITLE_Y, 42, 0x44bbcc, true);
    const subE = this.createSelText(world, '> HOUSING_TIMING // 你是什么时候开始看房的？', SEL_SUBTITLE_Y, 16, 0x6644aa);
    this.selectionEntities.push(titleE, subE);

    const divE = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: SEL_SUBTITLE_Y + 35, screenSpace: true })
      .withSprite({ color: 0x005566, width: 700, height: 1, alpha: 0.5, zIndex: 10 })
      .build();
    this.trackEntity(divE);
    this.selectionEntities.push(divE);

    const CARD_W = 380;
    const CARD_H = 260;
    const totalW = HOUSING_TIMING_OPTIONS.length * CARD_W + (HOUSING_TIMING_OPTIONS.length - 1) * SEL_CARD_GAP;
    const startX = W / 2 - totalW / 2;

    HOUSING_TIMING_OPTIONS.forEach((opt, i) => {
      const x = startX + i * (CARD_W + SEL_CARD_GAP);
      const y = SEL_CARDS_Y + 20;
      const eventName = `housing:select:${i}`;

      // Card panel
      const panelE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y, width: CARD_W, height: CARD_H, zIndex: 160, alpha: 1 })
        .withPanel({ backgroundColor: 0x040a14, backgroundAlpha: 0.95, borderRadius: 8, borderWidth: 2, borderColor: 0x1a4455 })
        .build();
      this.trackEntity(panelE);
      this.selectionEntities.push(panelE);

      // Emoji + Name
      const nameE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 16, width: CARD_W - 40, height: 36, zIndex: 200, alpha: 1 })
        .withText({ text: `${opt.emoji} ${opt.name}`, fontSize: 28, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xb0c8d8, align: 'center' })
        .build();
      this.trackEntity(nameE);
      this.selectionEntities.push(nameE);

      // Label tag
      const labelE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 56, width: CARD_W - 40, height: 22, zIndex: 200, alpha: 1 })
        .withText({ text: `【${opt.label}】`, fontSize: 17, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xff8844, align: 'center' })
        .build();
      this.trackEntity(labelE);
      this.selectionEntities.push(labelE);

      // Description (multi-line)
      const descE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 88, width: CARD_W - 40, height: 80, zIndex: 200, alpha: 1 })
        .withText({ text: opt.description, fontSize: 16, fontFamily: FONT.PIXEL, color: 0x668899, align: 'center', wordWrap: true, maxWidth: CARD_W - 50, lineHeight: 1.5 })
        .build();
      this.trackEntity(descE);
      this.selectionEntities.push(descE);

      // Stat bonus hint
      const bonusText = Object.entries(opt.statBonus)
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${STAT_LABELS[k as keyof PlayerStats]}${v! > 0 ? '+' : ''}${v}`)
        .join('  ');
      const bonusE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 180, width: CARD_W - 40, height: 18, zIndex: 200, alpha: 1 })
        .withText({ text: bonusText, fontSize: 15, fontFamily: FONT.PIXEL, color: 0x44aa88, align: 'center' })
        .build();
      this.trackEntity(bonusE);
      this.selectionEntities.push(bonusE);

      // Chapter buff hint
      const buffKeys = Object.entries(opt.chapterBuff).filter(([, v]) => v !== 0);
      const buffText = buffKeys.length > 0
        ? `每章: ${buffKeys.map(([k, v]) => `${STAT_LABELS[k as keyof PlayerStats]}+${v}`).join(' ')}`
        : '每章: 随机属性+3';
      const buffE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 206, width: CARD_W - 40, height: 18, zIndex: 200, alpha: 1 })
        .withText({ text: `🔄 ${buffText}`, fontSize: 13, fontFamily: FONT.PIXEL, color: 0x558866, align: 'center' })
        .build();
      this.trackEntity(buffE);
      this.selectionEntities.push(buffE);

      // Click overlay button
      const btnE = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y, width: CARD_W, height: CARD_H, zIndex: 250, alpha: 0.01 })
        .withButton({ label: '', fontSize: 1, borderRadius: 8, borderWidth: 0, onClick: eventName })
        .build();
      this.trackEntity(btnE);
      this.selectionEntities.push(btnE);

      const handler = () => this.onHousingTimingSelected(world, opt);
      globalEventBus.on(eventName, handler);
      this._choiceHandlers.push(handler);
      this._choiceEventNames.push(eventName);
    });
  }

  private onHousingTimingSelected(world: IWorld, opt: HousingTimingDef): void {
    this.selectedHousingTiming = opt;
    this.applyStatBonus(opt.statBonus);

    this.clearSelectionHandlers();
    this.clearSelectionEntities(world);

    // Skip original chapter 0 (replaced by housing timing system)
    this.chapterIndex = 1;

    // Build story UI and trigger the branch-specific event
    this.buildStoryUI(world);

    const branchEventId = HOUSING_BRANCH_EVENTS[opt.id];
    const branchEvent = SURVIVAL_EVENTS.find((e) => e.id === branchEventId);
    if (branchEvent) {
      this.currentEvent = branchEvent;
      this.usedEventIds.add(branchEvent.id);
      this.showEventNarration(world, branchEvent);
    } else {
      this.showChapter(world);
    }
  }

  // ── Helpers for selection phase ────────────────────────────────
  private createSelText(world: IWorld, text: string, y: number, size: number, color: number, bold = false): number {
    const e = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: W / 2 - 500, y, width: 1000, height: 60, zIndex: 200, alpha: 1 })
      .withText({ text, fontSize: size, fontFamily: FONT.PIXEL, fontWeight: bold ? 'bold' : 'normal', color, align: 'center', strokeColor: bold ? 0x0a2233 : undefined, strokeWidth: bold ? 3 : undefined })
      .build();
    this.trackEntity(e);
    return e;
  }

  private applyStatBonus(bonus: Partial<PlayerStats>): void {
    STAT_KEYS.forEach((key) => {
      const delta = bonus[key] ?? 0;
      this.stats[key] = MathUtils.clamp(this.stats[key] + delta, STAT_MIN, STAT_MAX);
    });
  }

  private clearSelectionEntities(world: IWorld): void {
    this.selectionEntities.forEach((eid) => world.destroyEntity(eid));
    this.selectionEntities = [];
    this._uniCardRects = [];
    this._uniHoverTagEntities = [];
    this._uniHoverGlowEntity = -1;
    this._uniHoveredIdx = -1;
  }

  private clearSelectionHandlers(): void {
    this._choiceEventNames.forEach((name, i) => {
      if (this._choiceHandlers[i]) globalEventBus.off(name, this._choiceHandlers[i]);
    });
    this._choiceHandlers = [];
    this._choiceEventNames = [];
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Build Story UI (once after selection)
  // ══════════════════════════════════════════════════════════════════
  private buildStoryUI(world: IWorld): void {
    if (this.storyUIBuilt) return;
    this.storyUIBuilt = true;

    // ── Progress indicator ──────────────────────────────────────
    const progW = 500;
    this.progressEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: W / 2 - progW / 2, y: 14, width: progW, height: 8, zIndex: 200 })
      .withProgressBar({ value: 0, maxValue: TOTAL_CHAPTERS, fillColor: 0xff00aa, backgroundColor: 0x0a1a2a, borderRadius: 4, animated: true, animationSpeed: 4 })
      .build();
    this.trackEntity(this.progressEntity);
    this.storyUIEntities.push(this.progressEntity);

    const uniLabel = this.selectedUniversity ? `【${this.selectedUniversity.title}】` : '';
    const majorLabel = this.selectedMajor ? this.selectedMajor.name : '';
    this.storyUIEntities.push(this.trackAndReturn(UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: W / 2 - progW / 2, y: 26, width: progW, height: 18, zIndex: 200 })
      .withText({ text: `${uniLabel} ${majorLabel} // ${TOTAL_CHAPTERS} CHAPTERS`, fontSize: 13, fontFamily: FONT.PIXEL, color: 0x667788, align: 'center' })
      .build()));

    // ── "每日呼吸成本" info bar (reference-style cost display) ──
    const costBarY = TOP_Y - 12;
    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H)
      .withTransform({ x: NAR_X + NAR_W / 2, y: costBarY, screenSpace: true })
      .withSprite({ color: 0x1a0a22, width: NAR_W, height: 28, alpha: 0.85, zIndex: 148 })
      .build()));
    this._costInfoEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: NAR_X + 8, y: costBarY - 10, width: NAR_W - 16, height: 22, zIndex: 200 })
      .withText({ text: `每日呼吸成本 ◈ HKD余额: ${this.stats.hkd} / Visa倒计时: ${TOTAL_CHAPTERS - this.chapterIndex} 章`, fontSize: 14, fontFamily: FONT.PIXEL, color: 0xff66cc, align: 'center' })
      .build();
    this.trackEntity(this._costInfoEntity);
    this.storyUIEntities.push(this._costInfoEntity);

    // ── Image viewport (top, full content width) ──────────────
    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H)
      .withTransform({ x: IMG_X + IMG_W / 2, y: IMG_Y + IMG_H / 2, screenSpace: true })
      .withPanel({ width: IMG_W + 8, height: IMG_H + 8, backgroundColor: 0x030810, backgroundAlpha: 1, borderRadius: 4, borderWidth: 2, borderColor: 0x331133 })
      .build()));

    this.buildCornerBrackets(world, IMG_X, IMG_Y, IMG_W, IMG_H, 0xff00aa, 0x660044);

    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H).withTransform({ x: IMG_X + 160, y: IMG_Y + 14, screenSpace: true }).withSprite({ textureId: '', color: 0x338899, width: 1, height: 1, alpha: 0, zIndex: 260 }).build()));
    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H).withTransform({ x: IMG_X + IMG_W - 105, y: IMG_Y + 14, screenSpace: true }).withSprite({ textureId: '', color: 0x556677, width: 1, height: 1, alpha: 0, zIndex: 260 }).build()));
    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H).withTransform({ x: IMG_X + 190, y: IMG_Y + IMG_H - 14, screenSpace: true }).withSprite({ textureId: '', color: 0x336677, width: 1, height: 1, alpha: 0, zIndex: 260 }).build()));

    this.chapterImageEntity = -1;

    // ── Viewport ambient particles ────────────────────────────────
    this.createViewportParticles(world);

    // ── Narration panel (below image) ─────────────────────────────
    this.storyUIEntities.push(this.trackAndReturn(UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: NAR_X - 4, y: NAR_Y - 4, width: NAR_W + 8, height: NAR_PANEL_H + 8, zIndex: 148 })
      .withPanel({ backgroundColor: 0x040a14, backgroundAlpha: 0.95, borderRadius: 6, borderWidth: 2, borderColor: 0x331133, clipContent: true })
      .build()));

    this.buildCornerBrackets(world, NAR_X - 4, NAR_Y - 4, NAR_W + 8, NAR_PANEL_H + 8, 0xff00aa, 0x660044);

    // Chapter title
    this.chapterTitleEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: NAR_X + NAR_TEXT_PAD, y: NAR_Y + 8, width: NAR_W - NAR_TEXT_PAD * 2, height: NAR_TITLE_H, zIndex: 200 })
      .withText({ text: '', fontSize: 30, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0x44bbcc, align: 'left', strokeColor: 0x0a2233, strokeWidth: 3 })
      .build();
    this.trackEntity(this.chapterTitleEntity);
    this.storyUIEntities.push(this.chapterTitleEntity);

    // Narration header
    this.storyUIEntities.push(this.trackAndReturn(UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: NAR_X + NAR_TEXT_PAD, y: NAR_Y + NAR_TITLE_H + 4, width: NAR_W - NAR_TEXT_PAD * 2, height: 18, zIndex: 200 })
      .withText({ text: '> NARRATION_STREAM // ACTIVE', fontSize: 13, fontFamily: FONT.PIXEL, color: 0xff66cc, align: 'left' })
      .build()));

    // Divider
    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H)
      .withTransform({ x: NAR_X + NAR_W / 2, y: NAR_Y + NAR_TITLE_H + 26, screenSpace: true })
      .withSprite({ color: 0x1a3344, width: NAR_W - 40, height: 1, alpha: 0.5, zIndex: 200 })
      .build()));

    // Narration text
    const narTextY = NAR_Y + NAR_TITLE_H + 34;
    this.narrationEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: NAR_X + NAR_TEXT_PAD, y: narTextY, width: NAR_TEXT_W, height: NAR_BODY_H, zIndex: 200 })
      .withText({ text: '', fontSize: 22, fontFamily: FONT.PIXEL, color: 0xb0c8d8, align: 'left', wordWrap: true, maxWidth: NAR_TEXT_W, lineHeight: 1.6 })
      .build();
    this.trackEntity(this.narrationEntity);
    this.storyUIEntities.push(this.narrationEntity);

    // Continue hint (bottom of narration panel)
    this.continueHintEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: NAR_X, y: NAR_Y + NAR_PANEL_H - 30, width: NAR_W, height: 28, zIndex: 210, alpha: 0 })
      .withText({ text: '▼ 点击任意处继续 ▼', fontSize: 15, fontFamily: FONT.PIXEL, color: 0x44bbcc, align: 'center' })
      .build();
    this.trackEntity(this.continueHintEntity);
    this.storyUIEntities.push(this.continueHintEntity);

    // ── Stat bars (right panel, 6 stats) ──────────────────────────
    const STAT_BAR_X = STATS_X + 14;
    const STAT_BAR_W = STATS_W - 28;
    const STAT_Y_START = IMG_Y;
    const STAT_ROW_H = 42;

    this.storyUIEntities.push(this.trackAndReturn(UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: STATS_X, y: STAT_Y_START - 12, width: STATS_W, height: STAT_KEYS.length * STAT_ROW_H + 32, zIndex: 148 })
      .withPanel({ backgroundColor: 0x040a14, backgroundAlpha: 0.95, borderRadius: 6, borderWidth: 2, borderColor: 0x331133 })
      .build()));

    this.storyUIEntities.push(this.trackAndReturn(UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: STAT_BAR_X, y: STAT_Y_START - 6, width: STAT_BAR_W, height: 16, zIndex: 200 })
      .withText({ text: '[ STATUS_MONITOR ]', fontSize: 12, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: 0xff66cc, align: 'left' })
      .build()));

    STAT_KEYS.forEach((key, i) => {
      const y = STAT_Y_START + 14 + i * STAT_ROW_H;

      this.statLabelEntities[key] = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: STAT_BAR_X, y, width: STAT_BAR_W - 40, height: 16, zIndex: 200 })
        .withText({ text: STAT_LABELS[key], fontSize: 14, fontFamily: FONT.PIXEL, color: STAT_COLORS[key], align: 'left' })
        .build();
      this.trackEntity(this.statLabelEntities[key]);
      this.storyUIEntities.push(this.statLabelEntities[key]);

      this.statValueEntities[key] = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: STAT_BAR_X + STAT_BAR_W - 36, y, width: 40, height: 16, zIndex: 200 })
        .withText({ text: `${this.stats[key]}`, fontSize: 14, fontFamily: FONT.PIXEL, color: 0xb0c8d8, align: 'right' })
        .build();
      this.trackEntity(this.statValueEntities[key]);
      this.storyUIEntities.push(this.statValueEntities[key]);

      this.statBarEntities[key] = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: STAT_BAR_X, y: y + 18, width: STAT_BAR_W, height: 12, zIndex: 200 })
        .withProgressBar({ value: this.stats[key], maxValue: STAT_MAX, fillColor: STAT_COLORS[key], backgroundColor: 0x0a1a2a, borderRadius: 3, animated: true, animationSpeed: 4 })
        .build();
      this.trackEntity(this.statBarEntities[key]);
      this.storyUIEntities.push(this.statBarEntities[key]);
    });

    // ── Choice panel ────────────────────────────────────────────
    const choiceRows = Math.ceil(MAX_CHOICES / 2);
    this.choicePanelEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: NAR_X - 4, y: CHOICE_Y - 4, width: CHOICE_FULL_W + 8, height: choiceRows * (CHOICE_BTN_H + CHOICE_GRID_GAP_Y) + 20, zIndex: 140, alpha: 0 })
      .withPanel({ backgroundColor: 0x030810, backgroundAlpha: 0.85, borderRadius: 4, borderWidth: 2, borderColor: 0x331133 })
      .build();
    this.trackEntity(this.choicePanelEntity);
    this.storyUIEntities.push(this.choicePanelEntity);

    // Horizontal divider above choices
    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H).withTransform({ x: NAR_X + NAR_W / 2, y: CHOICE_Y - 6, screenSpace: true }).withSprite({ color: 0x005566, width: NAR_W, height: 1, alpha: 0.5, zIndex: 10 }).build()));

    // Vertical neon accent (stats separator)
    this.storyUIEntities.push(this.trackAndReturn(EntityBuilder.create(world, W, H).withTransform({ x: STATS_X - 8, y: IMG_Y + 150, screenSpace: true }).withSprite({ color: 0x1a2244, width: 1, height: 300, alpha: 0.3, zIndex: 10 }).build()));

    // ── Character Spine (bottom-left, below stats) ──────────────
    if (this._spinePath) {
      this.characterEntity = EntityBuilder.create(world, W, H)
        .withTransform({ x: CHAR_GAME_X, y: CHAR_GAME_Y, screenSpace: true })
        .withSpine({ skeletonPath: this._spinePath, defaultAnimation: 'idle', loop: true, scale: CHAR_GAME_SCALE, zIndex: 999 })
        .build();
      this.trackEntity(this.characterEntity);
      this.storyUIEntities.push(this.characterEntity);
    }

    // ── Event handler for continue ──────────────────────────────
    this._onContinue = () => {
      if (this.phase === 'narration') this.showChoices(world);
      else if (this.phase === 'event-narration') this.showEventChoices(world);
    };
    globalEventBus.on(EVENTS.CONTINUE_STORY, this._onContinue);
  }

  private trackAndReturn(eid: number): number {
    this.trackEntity(eid);
    return eid;
  }

  private createViewportParticles(world: IWorld): void {
    for (let i = 0; i < VP_PARTICLE_COUNT; i++) {
      const size = 2 + Math.random() * 5;
      const x = IMG_X + 20 + Math.random() * (IMG_W - 40);
      const y = IMG_Y + Math.random() * IMG_H;
      const color = VP_PARTICLE_COLORS[i % VP_PARTICLE_COLORS.length];
      const speed = 0.15 + Math.random() * 0.45;
      const entity = EntityBuilder.create(world, W, H)
        .withTransform({ x, y, screenSpace: true })
        .withSprite({ color, width: size, height: size, alpha: 0.15, zIndex: 155 })
        .build();
      this.trackEntity(entity);
      this._vpParticles.push(entity);
      this._vpParticleSpeeds.push(speed);
    }
  }

  private buildCornerBrackets(world: IWorld, x: number, y: number, w: number, h: number, topColor: number, bottomColor: number): void {
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x - 6, y: y - 6, width: BRACKET_LEN, height: BRACKET_THICK, zIndex: 300 }).withPanel({ backgroundColor: topColor, backgroundAlpha: 1, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x - 6, y: y - 6, width: BRACKET_THICK, height: BRACKET_LEN, zIndex: 300 }).withPanel({ backgroundColor: topColor, backgroundAlpha: 1, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x + w - BRACKET_LEN + 6, y: y - 6, width: BRACKET_LEN, height: BRACKET_THICK, zIndex: 300 }).withPanel({ backgroundColor: topColor, backgroundAlpha: 1, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x + w + 3, y: y - 6, width: BRACKET_THICK, height: BRACKET_LEN, zIndex: 300 }).withPanel({ backgroundColor: topColor, backgroundAlpha: 1, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x - 6, y: y + h + 3, width: BRACKET_LEN, height: BRACKET_THICK, zIndex: 300 }).withPanel({ backgroundColor: bottomColor, backgroundAlpha: 1, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x - 6, y: y + h - BRACKET_LEN + 6, width: BRACKET_THICK, height: BRACKET_LEN, zIndex: 300 }).withPanel({ backgroundColor: bottomColor, backgroundAlpha: 1, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x + w - BRACKET_LEN + 6, y: y + h + 3, width: BRACKET_LEN, height: BRACKET_THICK, zIndex: 300 }).withPanel({ backgroundColor: bottomColor, backgroundAlpha: 1, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: x + w + 3, y: y + h - BRACKET_LEN + 6, width: BRACKET_THICK, height: BRACKET_LEN, zIndex: 300 }).withPanel({ backgroundColor: bottomColor, backgroundAlpha: 1, borderRadius: 0 }).build());
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Chapter Flow
  // ══════════════════════════════════════════════════════════════════
  private showChapter(world: IWorld): void {
    const chapter = STORY_CHAPTERS[this.chapterIndex];
    if (!chapter) return;
    this.phase = 'narration';

    const titleComp = world.getComponent<UITextComponent>(this.chapterTitleEntity, UI_TEXT_COMPONENT);
    if (titleComp) titleComp.setText(chapter.title);

    const narComp = world.getComponent<UITextComponent>(this.narrationEntity, UI_TEXT_COMPONENT);
    if (narComp) narComp.setText(wrapAtPeriod(chapter.narration));

    if (this.chapterImageEntity !== -1) world.destroyEntity(this.chapterImageEntity);
    this.chapterImageEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: IMG_X + IMG_W / 2, y: IMG_Y + IMG_H / 2, screenSpace: true })
      .withSprite({ textureId: chapter.imageId, anchorX: 0.5, anchorY: 0.5, width: IMG_W - 6, height: IMG_H - 6, zIndex: 149 })
      .build();
    this.trackEntity(this.chapterImageEntity);

    const progComp = world.getComponent<UIProgressBarComponent>(this.progressEntity, UI_PROGRESS_BAR_COMPONENT);
    if (progComp) progComp.setValue(this.chapterIndex);

    // ── Switch Spine animation based on chapter progress ──────
    this.updateCharacterAnim(world);

    const hintT = world.getComponent<UITransformComponent>(this.continueHintEntity, UI_TRANSFORM_COMPONENT);
    if (hintT) {
      hintT.alpha = 0;
      globalTweens.to(hintT, { alpha: 1 }, { duration: 0.8, delay: 1.0, easing: Easing.easeInOutSine, yoyo: true, repeat: -1 });
    }

    const choicePanelT = world.getComponent<UITransformComponent>(this.choicePanelEntity, UI_TRANSFORM_COMPONENT);
    if (choicePanelT) choicePanelT.alpha = 0;

    this.clearChoices(world);
  }

  private showChoices(world: IWorld): void {
    this.phase = 'choosing';
    this._choiceBtnRects = [];
    this._choiceHoveredIdx = -1;
    const hintT = world.getComponent<UITransformComponent>(this.continueHintEntity, UI_TRANSFORM_COMPONENT);
    if (hintT) { globalTweens.killTweensOf(hintT); hintT.alpha = 0; }

    const chapter = STORY_CHAPTERS[this.chapterIndex];
    if (!chapter) return;

    const choicePanelT = world.getComponent<UITransformComponent>(this.choicePanelEntity, UI_TRANSFORM_COMPONENT);
    if (choicePanelT) globalTweens.to(choicePanelT, { alpha: 1 }, { duration: 0.3, easing: Easing.easeOutCubic });

    chapter.choices.forEach((choice, i) => {
      if (i >= MAX_CHOICES) return;
      const eventName = `${EVENTS.CHOICE_SELECTED}:${this.chapterIndex}:${i}`;
      // 2×2 grid layout
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = NAR_X + col * (CHOICE_BTN_W + CHOICE_GRID_GAP_X);
      const y = CHOICE_Y + 6 + row * (CHOICE_BTN_H + CHOICE_GRID_GAP_Y);
      const label = `> ${choice.text}${formatEffects(choice.effects)}`;

      const btnEntity = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: bx, y, width: CHOICE_BTN_W, height: CHOICE_BTN_H, zIndex: 200, alpha: 0 })
        .withButton({ label, fontSize: 19, borderRadius: 4, borderWidth: 2, onClick: eventName })
        .build();
      this.trackEntity(btnEntity);
      this.choiceEntities.push(btnEntity);
      this._choiceBtnRects.push({ x: bx, y, w: CHOICE_BTN_W, h: CHOICE_BTN_H });

      const btnT = world.getComponent<UITransformComponent>(btnEntity, UI_TRANSFORM_COMPONENT);
      if (btnT) {
        const targetY = btnT.y;
        btnT.y = targetY + 20;
        globalTweens.to(btnT, { alpha: 1, y: targetY }, { duration: 0.35, delay: i * 0.1, easing: Easing.easeOutCubic });
      }

      const handler = () => this.applyChoice(world, choice);
      globalEventBus.on(eventName, handler);
      this._choiceHandlers.push(handler);
      this._choiceEventNames.push(eventName);
    });
  }

  private applyChoice(world: IWorld, choice: StoryChoice): void {
    this.applyStatBonus(choice.effects);

    // Apply per-chapter housing timing buff
    if (this.selectedHousingTiming) {
      if (this.selectedHousingTiming.id === 'bargain_hunter') {
        const randomKey = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)];
        this.applyStatBonus({ [randomKey]: 3 });
      } else {
        this.applyStatBonus(this.selectedHousingTiming.chapterBuff);
      }
    }

    this.updateStatUI(world);
    this.showStatChanges(world, choice.effects);
    this.chapterIndex++;
    this.clearChoices(world);

    if (this.chapterIndex >= TOTAL_CHAPTERS) {
      globalEventBus.emit(EVENTS.SCENE_SETTLEMENT, {
        stats: { ...this.stats },
        university: this.selectedUniversity,
        major: this.selectedMajor,
        gender: this.selectedGender,
      });
      return;
    }

    // Check crisis events first (stat < threshold)
    const crisisEvent = this.rollCrisisEvent();
    if (crisisEvent) {
      this.currentEvent = crisisEvent;
      this.usedEventIds.add(crisisEvent.id);
      this.showEventNarration(world, crisisEvent);
      return;
    }

    // Check miracle events (low stats + luck — "赛博锦鲤" reversal)
    const miracleEvent = this.rollMiracleEvent();
    if (miracleEvent) {
      this.currentEvent = miracleEvent;
      this.usedEventIds.add(miracleEvent.id);
      this.showMiracleNarration(world, miracleEvent);
      return;
    }

    // Roll for random event (not after last chapter)
    const event = this.rollRandomEvent();
    if (event) {
      this.currentEvent = event;
      this.usedEventIds.add(event.id);
      this.showEventNarration(world, event);
    } else {
      this.showChapter(world);
    }
  }

  private rollRandomEvent(): SurvivalEvent | null {
    if (Math.random() > EVENT_TRIGGER_CHANCE) return null;
    const uniId = this.selectedUniversity?.id ?? '';
    const gender = this.selectedGender;
    const available = SURVIVAL_EVENTS.filter(
      (e) =>
        !this.usedEventIds.has(e.id) &&
        !e.housingTiming &&
        (!e.universityId || e.universityId === uniId) &&
        (!e.gender || e.gender === gender),
    );
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  /** Force-trigger a crisis event when any core stat drops below CRISIS_THRESHOLD. */
  private rollCrisisEvent(): SurvivalEvent | null {
    for (const [statKey, eventId] of Object.entries(CRISIS_EVENT_MAP)) {
      const val = this.stats[statKey as keyof PlayerStats];
      if (val < CRISIS_THRESHOLD && !this.usedEventIds.has(eventId!)) {
        const evt = SURVIVAL_EVENTS.find((e) => e.id === eventId);
        if (evt) return evt;
      }
    }
    return null;
  }

  /** Roll a miracle reversal event when core stats are low and luck strikes. */
  private rollMiracleEvent(): SurvivalEvent | null {
    const isEligible = MIRACLE_TRIGGER_STATS.some(
      (key) => this.stats[key] < MIRACLE_STAT_THRESHOLD,
    );
    if (!isEligible) return null;
    if (Math.random() > MIRACLE_TRIGGER_CHANCE) return null;

    const available = SURVIVAL_EVENTS.filter(
      (e) =>
        (MIRACLE_EVENT_IDS as readonly string[]).includes(e.id) &&
        !this.usedEventIds.has(e.id),
    );
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  /** Show miracle event narration with a positive "skill1" animation. */
  private showMiracleNarration(world: IWorld, event: SurvivalEvent): void {
    this.phase = 'event-narration';

    // Play skill1 (positive) animation for miracle events
    if (this.characterEntity !== -1) {
      const spine = world.getComponent<SpineComponent>(this.characterEntity, SPINE_COMPONENT);
      if (spine) spine.play('skill1', false);
    }

    const titleComp = world.getComponent<UITextComponent>(this.chapterTitleEntity, UI_TEXT_COMPONENT);
    if (titleComp) titleComp.setText(`🎰 ${event.series} · ${event.title}`);

    const narComp = world.getComponent<UITextComponent>(this.narrationEntity, UI_TEXT_COMPONENT);
    if (narComp) narComp.setText(wrapAtPeriod(event.narration));

    // Swap viewport image to miracle illustration
    this.swapEventImage(world, event);

    const hintT = world.getComponent<UITransformComponent>(this.continueHintEntity, UI_TRANSFORM_COMPONENT);
    if (hintT) {
      hintT.alpha = 0;
      globalTweens.to(hintT, { alpha: 1 }, { duration: 0.8, delay: 0.6, easing: Easing.easeInOutSine, yoyo: true, repeat: -1 });
    }

    const choicePanelT = world.getComponent<UITransformComponent>(this.choicePanelEntity, UI_TRANSFORM_COMPONENT);
    if (choicePanelT) choicePanelT.alpha = 0;

    this.clearChoices(world);

    // Golden flash for miracle events
    this.flashMiracle(world);
  }

  /** Flash a golden overlay to signal a miracle event. */
  private flashMiracle(world: IWorld): void {
    const flash = EntityBuilder.create(world, W, H)
      .withTransform({ x: IMG_X + IMG_W / 2, y: IMG_Y + IMG_H / 2, screenSpace: true })
      .withSprite({ color: 0xffe600, width: IMG_W, height: IMG_H, alpha: 0, zIndex: 160 })
      .build();
    this.trackEntity(flash);
    const sprite = world.getComponent<SpriteComponent>(flash, SPRITE_COMPONENT);
    if (sprite) {
      globalTweens.to(sprite, { alpha: 0.25 }, { duration: 0.15, easing: Easing.easeOutCubic });
      globalTweens.to(sprite, { alpha: 0 }, { duration: 0.6, delay: 0.15, easing: Easing.easeInCubic, onComplete: () => { world.destroyEntity(flash); } });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Random Event Flow
  // ══════════════════════════════════════════════════════════════════
  private showEventNarration(world: IWorld, event: SurvivalEvent): void {
    this.phase = 'event-narration';

    // Play hurt animation during random events for dramatic effect
    if (this.characterEntity !== -1) {
      const spine = world.getComponent<SpineComponent>(this.characterEntity, SPINE_COMPONENT);
      if (spine) spine.play('hurt', false);
    }

    const titleComp = world.getComponent<UITextComponent>(this.chapterTitleEntity, UI_TEXT_COMPONENT);
    if (titleComp) titleComp.setText(`⚡ ${event.series} · ${event.title}`);

    const narComp = world.getComponent<UITextComponent>(this.narrationEntity, UI_TEXT_COMPONENT);
    if (narComp) narComp.setText(wrapAtPeriod(event.narration));

    // Swap viewport image to event-specific illustration
    this.swapEventImage(world, event);

    const hintT = world.getComponent<UITransformComponent>(this.continueHintEntity, UI_TRANSFORM_COMPONENT);
    if (hintT) {
      hintT.alpha = 0;
      globalTweens.to(hintT, { alpha: 1 }, { duration: 0.8, delay: 0.6, easing: Easing.easeInOutSine, yoyo: true, repeat: -1 });
    }

    const choicePanelT = world.getComponent<UITransformComponent>(this.choicePanelEntity, UI_TRANSFORM_COMPONENT);
    if (choicePanelT) choicePanelT.alpha = 0;

    this.clearChoices(world);
  }

  /** Swap the viewport image to match the event's series illustration. */
  private swapEventImage(world: IWorld, event: SurvivalEvent): void {
    const imageId = event.imageId ?? EVENT_SERIES_IMAGE_MAP[event.series];
    if (!imageId) return;

    if (this.chapterImageEntity !== -1) world.destroyEntity(this.chapterImageEntity);
    this.chapterImageEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: IMG_X + IMG_W / 2, y: IMG_Y + IMG_H / 2, screenSpace: true })
      .withSprite({ textureId: imageId, anchorX: 0.5, anchorY: 0.5, width: IMG_W - 6, height: IMG_H - 6, zIndex: 149, alpha: 0 })
      .build();
    this.trackEntity(this.chapterImageEntity);

    // Fade in the new event image
    const spr = world.getComponent<SpriteComponent>(this.chapterImageEntity, SPRITE_COMPONENT);
    if (spr) globalTweens.to(spr, { alpha: 1 }, { duration: 0.35, easing: Easing.easeOutCubic });
  }

  private showEventChoices(world: IWorld): void {
    if (!this.currentEvent) return;
    this.phase = 'event-choosing';
    this._choiceBtnRects = [];
    this._choiceHoveredIdx = -1;

    const hintT = world.getComponent<UITransformComponent>(this.continueHintEntity, UI_TRANSFORM_COMPONENT);
    if (hintT) { globalTweens.killTweensOf(hintT); hintT.alpha = 0; }

    const choicePanelT = world.getComponent<UITransformComponent>(this.choicePanelEntity, UI_TRANSFORM_COMPONENT);
    if (choicePanelT) globalTweens.to(choicePanelT, { alpha: 1 }, { duration: 0.3, easing: Easing.easeOutCubic });

    this.currentEvent.choices.forEach((choice, i) => {
      const eventName = `event:choice:${this.currentEvent!.id}:${i}`;
      // 2×2 grid layout
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = NAR_X + col * (CHOICE_BTN_W + CHOICE_GRID_GAP_X);
      const y = CHOICE_Y + 6 + row * (CHOICE_BTN_H + CHOICE_GRID_GAP_Y);
      const label = `> ${choice.text}${formatEffects(choice.effects)}`;

      const btnEntity = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: bx, y, width: CHOICE_BTN_W, height: CHOICE_BTN_H, zIndex: 200, alpha: 0 })
        .withButton({ label, fontSize: 19, borderRadius: 4, borderWidth: 2, onClick: eventName })
        .build();
      this.trackEntity(btnEntity);
      this.choiceEntities.push(btnEntity);
      this._choiceBtnRects.push({ x: bx, y, w: CHOICE_BTN_W, h: CHOICE_BTN_H });

      const btnT = world.getComponent<UITransformComponent>(btnEntity, UI_TRANSFORM_COMPONENT);
      if (btnT) {
        const targetY = btnT.y;
        btnT.y = targetY + 20;
        globalTweens.to(btnT, { alpha: 1, y: targetY }, { duration: 0.35, delay: i * 0.1, easing: Easing.easeOutCubic });
      }

      const handler = () => this.applyEventChoice(world, choice);
      globalEventBus.on(eventName, handler);
      this._choiceHandlers.push(handler);
      this._choiceEventNames.push(eventName);
    });
  }

  private applyEventChoice(world: IWorld, choice: StoryChoice): void {
    this.applyStatBonus(choice.effects);
    this.updateStatUI(world);
    this.showStatChanges(world, choice.effects);
    this.clearChoices(world);
    this.currentEvent = null;
    // Continue to next chapter
    this.showChapter(world);
  }

  private updateStatUI(world: IWorld): void {
    STAT_KEYS.forEach((key) => {
      const bar = world.getComponent<UIProgressBarComponent>(this.statBarEntities[key], UI_PROGRESS_BAR_COMPONENT);
      if (bar) bar.setValue(this.stats[key]);
      const valText = world.getComponent<UITextComponent>(this.statValueEntities[key], UI_TEXT_COMPONENT);
      if (valText) valText.setText(`${this.stats[key]}`);
    });
    // Update cost info bar
    if (this._costInfoEntity !== -1) {
      const costText = world.getComponent<UITextComponent>(this._costInfoEntity, UI_TEXT_COMPONENT);
      if (costText) costText.setText(`每日呼吸成本 ◈ HKD余额: ${this.stats.hkd} / Visa倒计时: ${TOTAL_CHAPTERS - this.chapterIndex} 章`);
    }
    // Sync glitch effect after stat update
    this.syncGlitchState(world);
    // Check for system toast (Cantonese roast)
    this.checkSystemToast(world);
  }

  // ── System Toast (粤语调侃提示) ──────────────────────────────────

  /** Show a Cantonese roast toast when a core stat first drops below TOAST_STAT_THRESHOLD. */
  private checkSystemToast(world: IWorld): void {
    const toastKeys: (keyof PlayerStats)[] = ['energy', 'hkd', 'san'];
    for (const key of toastKeys) {
      if (this.stats[key] < TOAST_STAT_THRESHOLD && !this._toastShownForStat.has(key)) {
        this._toastShownForStat.add(key);
        const messages = SYSTEM_TOAST_MESSAGES[key];
        if (messages && messages.length > 0) {
          const msg = messages[Math.floor(Math.random() * messages.length)];
          this.showSystemToast(world, msg);
        }
        return; // Only one toast at a time
      }
    }
  }

  /** Display a floating toast banner over the image viewport. */
  private showSystemToast(world: IWorld, message: string): void {
    // Clear previous toast if still visible
    this.clearToast(world);

    // Background panel
    this._toastBgEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: TOAST_X, y: TOAST_Y + TOAST_H / 2, screenSpace: true })
      .withSprite({ color: TOAST_BG_COLOR, width: TOAST_W, height: TOAST_H, alpha: 0, zIndex: 460 })
      .build();
    this.trackEntity(this._toastBgEntity);

    // Text
    this._toastEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({
        anchor: 'top-left',
        x: TOAST_X - TOAST_W / 2 + 16,
        y: TOAST_Y + 10,
        width: TOAST_W - 32,
        height: TOAST_H - 10,
        zIndex: 461,
        alpha: 0,
      })
      .withText({
        text: `⚠️ ${message}`,
        fontSize: TOAST_FONT_SIZE,
        fontFamily: FONT.PIXEL,
        fontWeight: 'bold',
        color: TOAST_TEXT_COLOR,
        align: 'center',
        wordWrap: true,
        maxWidth: TOAST_W - 40,
      })
      .build();
    this.trackEntity(this._toastEntity);

    // Animate in
    const bgSpr = world.getComponent<SpriteComponent>(this._toastBgEntity, SPRITE_COMPONENT);
    if (bgSpr) {
      globalTweens.to(bgSpr, { alpha: TOAST_BG_ALPHA }, { duration: 0.25, easing: Easing.easeOutCubic });
    }
    const txtT = world.getComponent<UITransformComponent>(this._toastEntity, UI_TRANSFORM_COMPONENT);
    if (txtT) {
      globalTweens.to(txtT, { alpha: 1 }, { duration: 0.25, easing: Easing.easeOutCubic });
    }

    // Auto-dismiss after TOAST_DURATION
    const bgE = this._toastBgEntity;
    const txtE = this._toastEntity;
    if (bgSpr) {
      globalTweens.to(bgSpr, { alpha: 0 }, {
        duration: 0.4,
        delay: TOAST_DURATION,
        easing: Easing.easeInCubic,
        onComplete: () => { world.destroyEntity(bgE); },
      });
    }
    if (txtT) {
      globalTweens.to(txtT, { alpha: 0 }, {
        duration: 0.4,
        delay: TOAST_DURATION,
        easing: Easing.easeInCubic,
        onComplete: () => { world.destroyEntity(txtE); },
      });
    }
  }

  /** Remove any active toast immediately. */
  private clearToast(world: IWorld): void {
    if (this._toastBgEntity !== -1) { world.destroyEntity(this._toastBgEntity); this._toastBgEntity = -1; }
    if (this._toastEntity !== -1) { world.destroyEntity(this._toastEntity); this._toastEntity = -1; }
  }

  private clearChoices(world: IWorld): void {
    this._choiceEventNames.forEach((name, i) => {
      if (this._choiceHandlers[i]) globalEventBus.off(name, this._choiceHandlers[i]);
    });
    this._choiceHandlers = [];
    this._choiceEventNames = [];
    this.choiceEntities.forEach((eid) => world.destroyEntity(eid));
    this.choiceEntities = [];
    this._choiceBtnRects = [];
    this._choiceHoveredIdx = -1;
    this.clearChoiceGlitch(world);
  }

  // ── Stat change popup animation ─────────────────────────────────
  private showStatChanges(world: IWorld, effects: Partial<PlayerStats>): void {
    const entries = (Object.entries(effects) as [keyof PlayerStats, number | undefined][])
      .filter(([, v]) => v !== undefined && v !== 0);
    if (entries.length === 0) return;

    const centerX = IMG_X + IMG_W / 2;
    const startY = IMG_Y + IMG_H / 2 - entries.length * 20;

    entries.forEach(([key, value], i) => {
      const label = STAT_LABELS[key];
      const v = value!;
      const isPositive = v > 0;
      const text = `${isPositive ? '▲' : '▼'} ${label} ${isPositive ? '+' : ''}${v}`;
      const color = isPositive ? 0x44ff88 : 0xff5555;
      const y = startY + i * 42;

      const entity = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: centerX - 140, y, width: 280, height: 36, zIndex: 450, alpha: 0 })
        .withText({ text, fontSize: 24, fontFamily: FONT.PIXEL, fontWeight: 'bold', color, align: 'center', strokeColor: 0x000000, strokeWidth: 3 })
        .build();
      this.trackEntity(entity);

      const t = world.getComponent<UITransformComponent>(entity, UI_TRANSFORM_COMPONENT);
      if (t) {
        globalTweens.to(t, { alpha: 1, y: y - 12 }, { duration: 0.35, delay: i * 0.08, easing: Easing.easeOutCubic });
        globalTweens.to(t, { alpha: 0, y: y - 50 }, { duration: 0.45, delay: 1.2 + i * 0.08, easing: Easing.easeInCubic, onComplete: () => { world.destroyEntity(entity); } });
      }
    });

    this.flashViewport(world);
  }

  private flashViewport(world: IWorld): void {
    const flash = EntityBuilder.create(world, W, H)
      .withTransform({ x: IMG_X + IMG_W / 2, y: IMG_Y + IMG_H / 2, screenSpace: true })
      .withSprite({ color: 0x44bbcc, width: IMG_W, height: IMG_H, alpha: 0, zIndex: 160 })
      .build();
    this.trackEntity(flash);
    const sprite = world.getComponent<SpriteComponent>(flash, SPRITE_COMPONENT);
    if (sprite) {
      globalTweens.to(sprite, { alpha: 0.12 }, { duration: 0.12, easing: Easing.easeOutCubic });
      globalTweens.to(sprite, { alpha: 0 }, { duration: 0.35, delay: 0.12, easing: Easing.easeInCubic, onComplete: () => { world.destroyEntity(flash); } });
    }
  }

  // ── Hover effect helpers ──────────────────────────────────────
  private updateUniHover(world: IWorld, mx: number, my: number): void {
    if (this.phase !== 'select-university') {
      if (this._uniHoveredIdx !== -1) this.clearUniHoverFx(world);
      return;
    }
    let hitIdx = -1;
    for (let i = 0; i < this._uniCardRects.length; i++) {
      const r = this._uniCardRects[i];
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) { hitIdx = i; break; }
    }
    if (hitIdx === this._uniHoveredIdx) return;

    // Clear old hover
    this.clearUniHoverFx(world);
    this._uniHoveredIdx = hitIdx;
    if (hitIdx === -1) return;

    // Spawn glow border
    const r = this._uniCardRects[hitIdx];
    const glowE = EntityBuilder.create(world, W, H)
      .withTransform({ x: r.x + r.w / 2, y: r.y + r.h / 2, screenSpace: true })
      .withSprite({ color: HOVER_GLOW_COLOR, width: r.w + 6, height: r.h + 6, alpha: 0, zIndex: 155 })
      .build();
    this.trackEntity(glowE);
    this.selectionEntities.push(glowE);
    this._uniHoverGlowEntity = glowE;
    const glowSpr = world.getComponent<SpriteComponent>(glowE, SPRITE_COMPONENT);
    if (glowSpr) globalTweens.to(glowSpr, { alpha: 0.18 }, { duration: 0.2, easing: Easing.easeOutCubic });

    // Spawn floating keyword tags
    const tags = UNI_HOVER_TAGS[r.uniId];
    if (!tags) return;
    tags.forEach((tag, ti) => {
      const tagE = UIEntityBuilder.create(world, W, H)
        .withUITransform({
          anchor: 'top-left',
          x: r.x + r.w / 2 - 70 + ti * 80,
          y: r.y - 32,
          width: 130,
          height: 26,
          zIndex: 300,
          alpha: 0,
        })
        .withText({ text: `#${tag}`, fontSize: HOVER_TAG_FONT_SIZE, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: HOVER_TAG_COLOR, align: 'center' })
        .build();
      this.trackEntity(tagE);
      this.selectionEntities.push(tagE);
      this._uniHoverTagEntities.push(tagE);
      const tagT = world.getComponent<UITransformComponent>(tagE, UI_TRANSFORM_COMPONENT);
      if (tagT) {
        const finalY = tagT.y;
        tagT.y = finalY + 12;
        globalTweens.to(tagT, { alpha: 1, y: finalY }, { duration: 0.25, delay: ti * 0.08, easing: Easing.easeOutCubic });
      }
    });
  }

  private clearUniHoverFx(world: IWorld): void {
    if (this._uniHoverGlowEntity !== -1) {
      world.destroyEntity(this._uniHoverGlowEntity);
      this.selectionEntities = this.selectionEntities.filter((e) => e !== this._uniHoverGlowEntity);
      this._uniHoverGlowEntity = -1;
    }
    for (const eid of this._uniHoverTagEntities) {
      world.destroyEntity(eid);
      this.selectionEntities = this.selectionEntities.filter((e) => e !== eid);
    }
    this._uniHoverTagEntities = [];
    this._uniHoveredIdx = -1;
  }

  private updateChoiceGlitch(world: IWorld, mx: number, my: number): void {
    if (this.phase !== 'choosing' && this.phase !== 'event-choosing') {
      if (this._choiceHoveredIdx !== -1) this.clearChoiceGlitch(world);
      return;
    }
    let hitIdx = -1;
    for (let i = 0; i < this._choiceBtnRects.length; i++) {
      const r = this._choiceBtnRects[i];
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) { hitIdx = i; break; }
    }
    if (hitIdx === this._choiceHoveredIdx) return;

    this.clearChoiceGlitch(world);
    this._choiceHoveredIdx = hitIdx;
    if (hitIdx === -1) return;

    // Spawn multiple red glitch scanline bars on the hovered choice
    const r = this._choiceBtnRects[hitIdx];
    const barCount = 3;
    for (let b = 0; b < barCount; b++) {
      const offsetY = (b - 1) * (r.h / 3);
      const barW = r.w * (0.4 + Math.random() * 0.5);
      const barX = r.x + Math.random() * (r.w - barW);
      const barE = EntityBuilder.create(world, W, H)
        .withTransform({ x: barX + barW / 2, y: r.y + r.h / 2 + offsetY, screenSpace: true })
        .withSprite({ color: GLITCH_BAR_COLOR, width: barW, height: GLITCH_BAR_H, alpha: 0, zIndex: 210 })
        .build();
      this.trackEntity(barE);
      this._choiceGlitchEntities.push(barE);
      const spr = world.getComponent<SpriteComponent>(barE, SPRITE_COMPONENT);
      if (spr) {
        globalTweens.to(spr, { alpha: GLITCH_BAR_ALPHA }, { duration: 0.1, easing: Easing.easeOutCubic });
      }
    }

    // Spawn a left-edge red accent line
    const accentE = EntityBuilder.create(world, W, H)
      .withTransform({ x: r.x + 2, y: r.y + r.h / 2, screenSpace: true })
      .withSprite({ color: HOVER_GLOW_COLOR, width: 4, height: r.h - 4, alpha: 0, zIndex: 210 })
      .build();
    this.trackEntity(accentE);
    this._choiceGlitchEntities.push(accentE);
    const accentSpr = world.getComponent<SpriteComponent>(accentE, SPRITE_COMPONENT);
    if (accentSpr) {
      globalTweens.to(accentSpr, { alpha: 0.7 }, { duration: 0.15, easing: Easing.easeOutCubic });
    }
  }

  private clearChoiceGlitch(world: IWorld): void {
    for (const eid of this._choiceGlitchEntities) world.destroyEntity(eid);
    this._choiceGlitchEntities = [];
    this._choiceHoveredIdx = -1;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Cyber Glitch Effect (activates when any crisis stat < 20%)
  // ══════════════════════════════════════════════════════════════════

  /** Check whether any of the crisis stats (hkd, san, energy) is below CRISIS_THRESHOLD. */
  private shouldGlitch(): boolean {
    return GLITCH_TRIGGER_STATS.some((key) => this.stats[key] < CRISIS_THRESHOLD);
  }

  /** Call after every stat change to toggle the glitch effect on/off. */
  private syncGlitchState(world: IWorld): void {
    const need = this.shouldGlitch();
    if (need && !this._glitchActive) this.activateGlitch(world);
    else if (!need && this._glitchActive) this.deactivateGlitch(world);
  }

  private activateGlitch(world: IWorld): void {
    if (this._glitchActive) return;
    this._glitchActive = true;
    this._glitchTimer = 0;

    // ── Desaturation overlay (dark greenish) ──────────────────────
    this._glitchDesatEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: H / 2, screenSpace: true })
      .withSprite({ color: GLITCH_DESAT_COLOR, width: W, height: H, alpha: 0, zIndex: 480 })
      .build();
    this.trackEntity(this._glitchDesatEntity);
    const desatSpr = world.getComponent<SpriteComponent>(this._glitchDesatEntity, SPRITE_COMPONENT);
    if (desatSpr) globalTweens.to(desatSpr, { alpha: GLITCH_DESAT_ALPHA }, { duration: 0.6, easing: Easing.easeOutCubic });

    // ── Sickly green overlay ─────────────────────────────────────
    this._glitchOverlayEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: H / 2, screenSpace: true })
      .withSprite({ color: GLITCH_OVERLAY_COLOR, width: W, height: H, alpha: 0, zIndex: 481 })
      .build();
    this.trackEntity(this._glitchOverlayEntity);
    const overSpr = world.getComponent<SpriteComponent>(this._glitchOverlayEntity, SPRITE_COMPONENT);
    if (overSpr) globalTweens.to(overSpr, { alpha: GLITCH_OVERLAY_ALPHA }, { duration: 0.6, easing: Easing.easeOutCubic });

    // ── RGB split overlays ───────────────────────────────────────
    this._glitchRgbREntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2 - GLITCH_RGB_OFFSET, y: H / 2, screenSpace: true })
      .withSprite({ color: GLITCH_RGB_R_COLOR, width: W, height: H, alpha: 0, zIndex: 482 })
      .build();
    this.trackEntity(this._glitchRgbREntity);
    const rgbR = world.getComponent<SpriteComponent>(this._glitchRgbREntity, SPRITE_COMPONENT);
    if (rgbR) globalTweens.to(rgbR, { alpha: GLITCH_RGB_ALPHA }, { duration: 0.4, easing: Easing.easeOutCubic });

    this._glitchRgbCEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2 + GLITCH_RGB_OFFSET, y: H / 2, screenSpace: true })
      .withSprite({ color: GLITCH_RGB_C_COLOR, width: W, height: H, alpha: 0, zIndex: 482 })
      .build();
    this.trackEntity(this._glitchRgbCEntity);
    const rgbC = world.getComponent<SpriteComponent>(this._glitchRgbCEntity, SPRITE_COMPONENT);
    if (rgbC) globalTweens.to(rgbC, { alpha: GLITCH_RGB_ALPHA }, { duration: 0.4, easing: Easing.easeOutCubic });

    // ── Horizontal glitch strips ─────────────────────────────────
    for (let i = 0; i < GLITCH_STRIP_COUNT; i++) {
      const sy = Math.random() * H;
      const sw = W * (0.2 + Math.random() * 0.6);
      const sx = Math.random() * (W - sw) + sw / 2;
      const stripE = EntityBuilder.create(world, W, H)
        .withTransform({ x: sx, y: sy, screenSpace: true })
        .withSprite({ color: GLITCH_STRIP_COLOR, width: sw, height: GLITCH_STRIP_H, alpha: GLITCH_STRIP_ALPHA, zIndex: 483 })
        .build();
      this.trackEntity(stripE);
      this._glitchStripEntities.push(stripE);
    }

    // ── Audio: heartbeat + whisper ────────────────────────────────
    this._glitchHeartbeatId = globalAudio.play(GLITCH_AUDIO_HEARTBEAT, { volume: 0.6, loop: true });
    this._glitchWhisperId = globalAudio.play(GLITCH_AUDIO_WHISPER, { volume: 0.35, loop: true });
  }

  private deactivateGlitch(world: IWorld): void {
    if (!this._glitchActive) return;
    this._glitchActive = false;

    // Fade out and destroy overlays
    const fadeAndDestroy = (eid: number, dur = 0.5) => {
      if (eid === -1) return;
      const spr = world.getComponent<SpriteComponent>(eid, SPRITE_COMPONENT);
      if (spr) {
        globalTweens.to(spr, { alpha: 0 }, { duration: dur, easing: Easing.easeInCubic, onComplete: () => world.destroyEntity(eid) });
      } else {
        world.destroyEntity(eid);
      }
    };

    fadeAndDestroy(this._glitchDesatEntity);
    fadeAndDestroy(this._glitchOverlayEntity);
    fadeAndDestroy(this._glitchRgbREntity, 0.3);
    fadeAndDestroy(this._glitchRgbCEntity, 0.3);
    for (const eid of this._glitchStripEntities) fadeAndDestroy(eid, 0.25);

    this._glitchDesatEntity = -1;
    this._glitchOverlayEntity = -1;
    this._glitchRgbREntity = -1;
    this._glitchRgbCEntity = -1;
    this._glitchStripEntities = [];

    // Stop audio
    if (this._glitchHeartbeatId !== -1) { globalAudio.stop(this._glitchHeartbeatId); this._glitchHeartbeatId = -1; }
    if (this._glitchWhisperId !== -1) { globalAudio.stop(this._glitchWhisperId); this._glitchWhisperId = -1; }
  }

  /** Per-frame update for active glitch visuals (jitter, pulse). */
  private updateGlitchEffect(world: IWorld): void {
    if (!this._glitchActive) return;
    const dt = Time.deltaTime;
    this._glitchTimer += dt;

    // Pulse the green overlay alpha
    const pulse = 0.5 + 0.5 * Math.sin(this._glitchTimer * Math.PI * 2 / GLITCH_PULSE_SPEED);
    const overSpr = this._glitchOverlayEntity !== -1
      ? world.getComponent<SpriteComponent>(this._glitchOverlayEntity, SPRITE_COMPONENT) : undefined;
    if (overSpr) overSpr.alpha = GLITCH_OVERLAY_ALPHA * (0.6 + 0.4 * pulse);

    // Jitter horizontal strips
    for (const eid of this._glitchStripEntities) {
      const t = world.getComponent<TransformComponent>(eid, TRANSFORM_COMPONENT);
      if (!t) continue;
      t.x += (Math.random() - 0.5) * GLITCH_STRIP_JITTER;
      // Occasionally teleport a strip to a new Y
      if (Math.random() < 0.02) {
        t.y = Math.random() * H;
        const spr = world.getComponent<SpriteComponent>(eid, SPRITE_COMPONENT);
        if (spr) spr.alpha = GLITCH_STRIP_ALPHA * (0.5 + Math.random());
      }
    }

    // Jitter RGB split offset
    const rgbJitter = (Math.random() - 0.5) * 2;
    const rT = this._glitchRgbREntity !== -1
      ? world.getComponent<TransformComponent>(this._glitchRgbREntity, TRANSFORM_COMPONENT) : undefined;
    if (rT) rT.x = W / 2 - GLITCH_RGB_OFFSET + rgbJitter;
    const cT = this._glitchRgbCEntity !== -1
      ? world.getComponent<TransformComponent>(this._glitchRgbCEntity, TRANSFORM_COMPONENT) : undefined;
    if (cT) cT.x = W / 2 + GLITCH_RGB_OFFSET - rgbJitter;
  }

  // ── Scrolling grid + input ────────────────────────────────────
  private wasMouseDown = false;

  update(world: IWorld, _deltaTime: number): void {
    if (this.gridBgEntity !== -1) {
      const sprite = world.getComponent<SpriteComponent>(this.gridBgEntity, SPRITE_COMPONENT);
      if (sprite) {
        sprite.tilePositionX -= 0.15;
        sprite.tilePositionY -= 0.08;
      }
    }

    // Scroll full-screen night skyline background
    if (this.nightBgEntity !== -1) {
      const nightSprite = world.getComponent<SpriteComponent>(this.nightBgEntity, SPRITE_COMPONENT);
      if (nightSprite) {
        nightSprite.tilePositionX -= NIGHT_BG_SCROLL_SPEED;
      }
    }

    // Animate viewport particles
    for (let i = 0; i < this._vpParticles.length; i++) {
      const eid = this._vpParticles[i];
      const transform = world.getComponent<TransformComponent>(eid, TRANSFORM_COMPONENT);
      if (!transform) continue;
      transform.y -= this._vpParticleSpeeds[i];
      const spr = world.getComponent<SpriteComponent>(eid, SPRITE_COMPONENT);
      if (spr) spr.alpha = 0.12 + Math.sin(Date.now() * 0.002 + i * 1.7) * 0.08;
      if (transform.y < IMG_Y - 10) {
        transform.y = IMG_Y + IMG_H + 10;
        transform.x = IMG_X + 20 + Math.random() * (IMG_W - 40);
      }
    }

    // ── Animate scan line (sweep top to bottom) ──────────────────
    if (this._gameScanLineEntity !== -1) {
      const scanT = world.getComponent<TransformComponent>(this._gameScanLineEntity, TRANSFORM_COMPONENT);
      if (scanT) {
        scanT.y += 1.2;
        if (scanT.y > H) scanT.y = 0;
      }
      const scanS = world.getComponent<SpriteComponent>(this._gameScanLineEntity, SPRITE_COMPONENT);
      if (scanS) {
        const progress = (world.getComponent<TransformComponent>(this._gameScanLineEntity, TRANSFORM_COMPONENT)?.y ?? 0) / H;
        scanS.alpha = 0.04 * (1 + Math.sin(progress * Math.PI) * 0.5);
      }
    }

    // ── Hover effects ────────────────────────────────────────────
    const inputSys = world.getSystem<import('agent-gamedev').InputSystem>('InputSystem');
    if (inputSys) {
      const mp = inputSys.getMousePosition();
      const mx = mp?.x ?? 0;
      const my = mp?.y ?? 0;
      this.updateUniHover(world, mx, my);
      this.updateChoiceGlitch(world, mx, my);

      // Animate glitch bars jitter
      for (const eid of this._choiceGlitchEntities) {
        const t = world.getComponent<TransformComponent>(eid, TRANSFORM_COMPONENT);
        if (t) t.x += (Math.random() - 0.5) * 2;
      }
    }

    // ── Cyber glitch per-frame update ───────────────────────────
    this.updateGlitchEffect(world);

    if (this.phase !== 'narration' && this.phase !== 'event-narration') return;
    if (!inputSys) return;
    const isDown = inputSys.isMouseButtonDown(0);
    if (!isDown && this.wasMouseDown) globalEventBus.emit(EVENTS.CONTINUE_STORY);
    this.wasMouseDown = isDown;
  }

  onExit(world: IWorld): void {
    if (this._onContinue) { globalEventBus.off(EVENTS.CONTINUE_STORY, this._onContinue); this._onContinue = null; }
    this.clearChoices(world);
    this.clearSelectionHandlers();

    // ── Stop glitch audio immediately (entities cleaned via trackEntity) ──
    if (this._glitchHeartbeatId !== -1) { globalAudio.stop(this._glitchHeartbeatId); this._glitchHeartbeatId = -1; }
    if (this._glitchWhisperId !== -1) { globalAudio.stop(this._glitchWhisperId); this._glitchWhisperId = -1; }
    this._glitchActive = false;
    this._glitchDesatEntity = -1;
    this._glitchOverlayEntity = -1;
    this._glitchRgbREntity = -1;
    this._glitchRgbCEntity = -1;
    this._glitchStripEntities = [];
    this._glitchTimer = 0;

    // ── Reset toast state ─────────────────────────────────────────
    this._toastShownForStat = new Set();
    this._toastEntity = -1;
    this._toastBgEntity = -1;

    this.bgEntity = -1;
    this.gridBgEntity = -1;
    this._gameScanLineEntity = -1;
    this.chapterTitleEntity = -1;
    this.narrationEntity = -1;
    this.continueHintEntity = -1;
    this.progressEntity = -1;
    this.overlayEntity = -1;
    this.chapterImageEntity = -1;
    this.choicePanelEntity = -1;
    this.characterEntity = -1;
    this.nightBgEntity = -1;
    this.selectedGender = null;
    this.selectedHousingTiming = null;
    this._spinePath = '';
    this.selectionEntities = [];
    this.storyUIEntities = [];
    this.storyUIBuilt = false;
    this._vpParticles = [];
    this._vpParticleSpeeds = [];
    this.usedEventIds = new Set();
    this.currentEvent = null;
    this._uniCardRects = [];
    this._uniHoverTagEntities = [];
    this._uniHoverGlowEntity = -1;
    this._uniHoveredIdx = -1;
    this._choiceBtnRects = [];
    this._choiceGlitchEntities = [];
    this._choiceHoveredIdx = -1;
    const emptyStats: Record<keyof PlayerStats, number> = { hkd: -1, san: -1, energy: -1, gpa: -1, cantonese: -1, english: -1 };
    this.statBarEntities = { ...emptyStats };
    this.statLabelEntities = { ...emptyStats };
    this.statValueEntities = { ...emptyStats };
    super.onExit(world);
  }
}
