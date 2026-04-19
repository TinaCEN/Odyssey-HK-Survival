import {
  Scene,
  UIEntityBuilder,
  EntityBuilder,
  globalEventBus,
  globalTheme,
  globalTweens,
  Easing,
  UI_TRANSFORM_COMPONENT,
  SPRITE_COMPONENT,
  TRANSFORM_COMPONENT,
} from 'agent-gamedev';
import type { IWorld, SceneTransitionData, UITransformComponent, SpriteComponent, TransformComponent } from 'agent-gamedev';
import {
  GAME_CONFIG,
  PALETTE,
  FONT,
  EVENTS,
  ALL_TAGS,
  TAG_CAT_COLORS,
  STAT_LABELS,
  STAT_COLORS,
  FINAL_ENDINGS,
  ENDING_TYPE_MAP,
  SOUL_VERDICTS,
  STATUS_STAMPS,
  PERSONALITY_DIMENSIONS,
  PERSONALITY_TAGS,
  MAX_PERSONALITY_TAGS,
  SETTLE,
  BARCODE_TYPES,
  getPersonalityDescriptor,
  getStatPercentile,
  matchWarmMemo,
} from '../constants';
import type { PlayerStats, TagDef, FinalEnding, UniversityDef, MajorDef, EndingType, WarmMemoDef } from '../constants';

const W = GAME_CONFIG.WIDTH;
const H = GAME_CONFIG.HEIGHT;

const STAT_KEYS: (keyof PlayerStats)[] = ['hkd', 'san', 'energy', 'gpa', 'cantonese', 'english'];
const DEFAULT_STATS: PlayerStats = { hkd: 50, san: 50, energy: 50, gpa: 50, cantonese: 10, english: 40 };

// ── Identity Card Layout ─────────────────────────────────────────
const CARD_X = 50;
const CARD_Y = 50;
const CARD_W = W - 2 * CARD_X;
const CARD_PAD = 28;
const CX = CARD_X + CARD_PAD;               // card inner left
const CW = CARD_W - 2 * CARD_PAD;           // card inner width

// Gender avatar
const AVATAR_SIZE = 54;

// Tag badge
const TAG_W = 428;
const TAG_H = 130;
const TAG_GAP_X = 12;
const TAG_GAP_Y = 12;
const TAGS_PER_ROW = Math.floor((CW + TAG_GAP_X) / (TAG_W + TAG_GAP_X));

// Section vertical spacing
const SEC_GAP = 8;
const DIVIDER_H = 1;

/** Maximum number of tags shown per player identity card. */
const MAX_DISPLAY_TAGS = 4;

// ── Ambient particle constants ───────────────────────────────────
const SETTLE_PARTICLE_COUNT = 20;
const SETTLE_PARTICLE_COLORS = [0x00ccdd, 0x005566, 0x44bbcc, 0x6644aa, 0xff00aa];

// ── Personality dimension labels for percentile display ──────────
const PERSONALITY_LABELS: Record<keyof PlayerStats, string> = {
  hkd: '生存本能',
  san: '抗压韧性',
  energy: '行动力',
  gpa: '学术潜力',
  cantonese: '文化融入',
  english: '国际视野',
};

// ── Warm Memo Modal Events ───────────────────────────────────────
const MEMO_OPEN_EVENT = 'settlement:memo:open';
const MEMO_CLOSE_EVENT = 'settlement:memo:close';

// ── Memo Modal Layout ────────────────────────────────────────────
const MEMO_W = 1100;
const MEMO_H = 980;
const MEMO_PAD = 32;
const MEMO_X = (W - MEMO_W) / 2;
const MEMO_Y = (H - MEMO_H) / 2;

export class SettlementScene extends Scene {
  readonly name = 'SettlementScene';

  private _onRestart: (() => void) | null = null;
  private _animateIds: number[] = [];
  private _scanLineEntity = -1;
  private _gridBgEntity = -1;
  private _particles: number[] = [];
  private _particleSpeeds: number[] = [];
  private _stampEntities: number[] = [];
  private _memoEntities: number[] = [];
  private _memoOpen = false;
  private _onMemoOpen: (() => void) | null = null;
  private _onMemoClose: (() => void) | null = null;
  private _matchedMemo: WarmMemoDef | null = null;

  onEnter(world: IWorld, data?: SceneTransitionData): void {
    globalTheme.setTheme('cyberpunk');
    this._animateIds = [];
    this._stampEntities = [];
    this._memoEntities = [];
    this._memoOpen = false;

    const stats: PlayerStats = (data as { stats?: PlayerStats })?.stats ?? { ...DEFAULT_STATS };
    const university = (data as { university?: UniversityDef })?.university;
    const major = (data as { major?: MajorDef })?.major;
    const gender: 'male' | 'female' | null = (data as { gender?: 'male' | 'female' | null })?.gender ?? null;

    const ending = this.matchEnding(stats);
    const endingType: EndingType = ENDING_TYPE_MAP[ending.id] ?? 'leave_hk';
    const allEarnedTags = ALL_TAGS.filter(
      (tag) =>
        tag.condition(stats) &&
        (!tag.universityId || tag.universityId === university?.id) &&
        (!tag.gender || tag.gender === gender),
    );
    const earnedTags = allEarnedTags.slice(0, MAX_DISPLAY_TAGS);
    const tagRows = Math.max(1, Math.ceil(earnedTags.length / TAGS_PER_ROW));

    // Pre-calculate percentiles (seeded by stats so it's stable per render)
    const percentiles: Record<string, number> = {};
    for (const key of STAT_KEYS) {
      percentiles[key] = getStatPercentile(stats[key]);
    }

    // ── Calculate dynamic card height ─────────────────────────
    let curY = CARD_Y + 14;

    const headerY = curY;
    const headerH = 58;
    curY += headerH + SEC_GAP + DIVIDER_H + SEC_GAP;

    const endingY = curY;
    const endingH = 74;
    curY += endingH + SEC_GAP + DIVIDER_H + SEC_GAP;

    // Soul Verdict (NEW)
    const verdictY = curY;
    const verdictH = SETTLE.VERDICT_H;
    curY += verdictH + SEC_GAP + DIVIDER_H + SEC_GAP;

    // Stats
    const statsHeaderY = curY;
    curY += 20;
    const statsY = curY;
    const statsH = 48;
    curY += statsH + SEC_GAP + DIVIDER_H + SEC_GAP;

    // Personality Analysis (NEW)
    const personalityHeaderY = curY;
    curY += SETTLE.PERSONALITY_HEADER_H;
    const personalityBarsY = curY;
    const personalityBarsH = PERSONALITY_DIMENSIONS.length * (SETTLE.PERSONALITY_BAR_H + SETTLE.PERSONALITY_BAR_GAP) - SETTLE.PERSONALITY_BAR_GAP;
    curY += personalityBarsH + SEC_GAP;
    const personalityTagsY = curY;
    curY += SETTLE.PERSONALITY_TAG_H + SEC_GAP + DIVIDER_H + SEC_GAP;

    // Tags
    const tagHeaderY = curY;
    curY += 24;
    const tagGridY = curY;
    const tagGridH = tagRows * TAG_H + (tagRows - 1) * TAG_GAP_Y;
    curY += tagGridH + SEC_GAP;

    // Barcode (NEW)
    const barcodeY = curY;
    curY += SETTLE.BARCODE_H + SEC_GAP;

    // Buttons (memo + restart)
    const restartY = curY;
    curY += 44 + 12 + 44 + 12;

    const CARD_H = curY - CARD_Y;

    // ── Background ────────────────────────────────────────────
    this._gridBgEntity = EntityBuilder.create(world, W, H)
      .withTilingSprite({ textureId: 'cyber-grid', tileWidth: W, tileHeight: H, zIndex: -1010 })
      .build();
    this.trackEntity(this._gridBgEntity);

    this.trackEntity(
      EntityBuilder.create(world, W, H)
        .withTransform({ x: W / 2, y: H / 2 })
        .withSprite({ textureId: 'cyber-bg', anchorX: 0.5, anchorY: 0.5, alpha: 0.5, zIndex: -1000 })
        .build()
    );
    this.trackEntity(
      EntityBuilder.create(world, W, H)
        .withTransform({ x: W / 2, y: H / 2, screenSpace: true })
        .withSprite({ color: 0x000000, width: W, height: H, alpha: 0.65, zIndex: -999 })
        .build()
    );

    // ── Floating ambient particles ───────────────────────────────
    this._particles = [];
    this._particleSpeeds = [];
    for (let i = 0; i < SETTLE_PARTICLE_COUNT; i++) {
      const size = 1 + Math.random() * 3;
      const x = Math.random() * W;
      const y2 = Math.random() * H;
      const color = SETTLE_PARTICLE_COLORS[i % SETTLE_PARTICLE_COLORS.length];
      const speed = 0.08 + Math.random() * 0.3;
      const entity = EntityBuilder.create(world, W, H)
        .withTransform({ x, y: y2, screenSpace: true })
        .withSprite({ color, width: size, height: size, alpha: 0.1 + Math.random() * 0.08, zIndex: 5 })
        .build();
      this.trackEntity(entity);
      this._particles.push(entity);
      this._particleSpeeds.push(speed);
    }

    // ── Animated horizontal scan line ────────────────────────────
    this._scanLineEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: 0, screenSpace: true })
      .withSprite({ color: 0x00e5ff, width: W, height: 1, alpha: 0.04, zIndex: 495 })
      .build();
    this.trackEntity(this._scanLineEntity);

    // Neon accent lines
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W / 2, y: 1, screenSpace: true }).withSprite({ color: PALETTE.NEON_CYAN, width: W, height: 3, alpha: 0.7, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W / 2, y: H - 1, screenSpace: true }).withSprite({ color: PALETTE.NEON_MAGENTA, width: W, height: 3, alpha: 0.7, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: 1, y: H / 2, screenSpace: true }).withSprite({ color: 0x003344, width: 2, height: H, alpha: 0.35, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W - 1, y: H / 2, screenSpace: true }).withSprite({ color: 0x003344, width: 2, height: H, alpha: 0.35, zIndex: 10 }).build());

    // ── Corner bracket decorations ─────────────────────────────────
    const BK = 40;
    const BT = 2;
    const bkColor = 0x006677;
    const bkAlpha = 0.45;
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: 6, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: 6, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BK, y: 6, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BT, y: 6, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: H - 6 - BT, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 16, y: H - 6 - BK, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BK, y: H - 6 - BT, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 16 - BT, y: H - 6 - BK, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());

    // ── Bottom HUD decorative text ─────────────────────────────
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 24, y: H - 32, width: 360, height: 18, zIndex: 200 }).withText({ text: 'AUDIT_REPORT::FINAL // PERSONA_SCAN::COMPLETE', fontSize: 12, fontFamily: FONT.PIXEL, color: 0x223344, align: 'left' }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 320, y: H - 32, width: 300, height: 18, zIndex: 200 }).withText({ text: 'CYBER_PROFILER::v9 // BUILD::2026', fontSize: 12, fontFamily: FONT.PIXEL, color: 0x223344, align: 'right' }).build());

    // ── Title ─────────────────────────────────────────────────
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: W / 2 - 400, y: 8, width: 800, height: 40, zIndex: 200, alpha: 0 })
        .withText({
          text: '// 赛博人格侧写 //',
          fontSize: 34, fontFamily: FONT.PIXEL, fontWeight: 'bold',
          color: PALETTE.NEON_CYAN, align: 'center',
          strokeColor: PALETTE.NEON_MAGENTA, strokeWidth: 2,
        })
        .build()
    );

    // ── Identity Card Background ──────────────────────────────
    // Outer glow border
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CARD_X - 2, y: CARD_Y - 2, width: CARD_W + 4, height: CARD_H + 4, zIndex: 98, alpha: 0 })
        .withPanel({ backgroundColor: PALETTE.NEON_CYAN, backgroundAlpha: 0.15, borderRadius: 14 })
        .build()
    );
    // Main card
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CARD_X, y: CARD_Y, width: CARD_W, height: CARD_H, zIndex: 100, alpha: 0 })
        .withPanel({ backgroundColor: 0x06061a, backgroundAlpha: 0.95, borderRadius: 12, borderWidth: 2, borderColor: PALETTE.NEON_CYAN })
        .build()
    );

    // Card watermark — top-right
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CARD_X + CARD_W - 240, y: CARD_Y + 8, width: 220, height: 20, zIndex: 200, alpha: 0 })
        .withText({ text: '港硕留学生身份卡', fontSize: 14, fontFamily: FONT.PIXEL, color: PALETTE.NEON_CYAN, align: 'right' })
        .build()
    );

    // ── Section 1: Header ───────────────────────────────────
    this.buildHeader(world, headerY, gender, university, major);
    this.buildDivider(world, headerY + headerH + SEC_GAP, PALETTE.NEON_CYAN);

    // ── Section 2: Ending ───────────────────────────────────
    this.buildEnding(world, endingY, ending);
    this.buildDivider(world, endingY + endingH + SEC_GAP, ending.color);

    // ── Section 3: Soul Verdict (NEW) ───────────────────────
    this.buildSoulVerdict(world, verdictY, endingType, ending.color);
    this.buildDivider(world, verdictY + verdictH + SEC_GAP, PALETTE.NEON_MAGENTA);

    // ── Section 4: Stats ────────────────────────────────────
    this.buildStats(world, statsHeaderY, statsY, stats);
    this.buildDivider(world, statsY + statsH + SEC_GAP, PALETTE.NEON_MAGENTA);

    // ── Section 5: Personality Analysis (NEW) ───────────────
    this.buildPersonalityAnalysis(world, personalityHeaderY, personalityBarsY, personalityTagsY, stats, percentiles);
    this.buildDivider(world, personalityTagsY + SETTLE.PERSONALITY_TAG_H + SEC_GAP, PALETTE.NEON_CYAN);

    // ── Section 6: Tags ─────────────────────────────────────
    this.buildTagSection(world, tagHeaderY, tagGridY, earnedTags);

    // ── Section 7: Barcode (NEW) ────────────────────────────
    this.buildBarcode(world, barcodeY, endingType);

    // ── Status Stamp (overlay) ──────────────────────────────
    this.buildStatusStamp(world, endingType);

    // ── Warm Memo Button (before restart) ─────────────────────
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: W / 2 - 180, y: restartY, width: 360, height: 44, zIndex: 200, alpha: 0 })
        .withButton({ label: '📜 给港硕的温情备忘录', fontSize: 20, borderRadius: 4, borderWidth: 2, onClick: MEMO_OPEN_EVENT })
        .build()
    );

    // ── Restart Button ──────────────────────────────────────
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: W / 2 - 180, y: restartY + 56, width: 360, height: 44, zIndex: 200, alpha: 0 })
        .withButton({ label: '[ 再 来 一 次 ]', fontSize: FONT.CHOICE_SIZE, borderRadius: 4, borderWidth: 2, onClick: EVENTS.RESTART_GAME })
        .build()
    );

    // ── Animate all elements in ───────────────────────────────
    let delay = 0;
    for (const eid of this._animateIds) {
      const t = world.getComponent<UITransformComponent>(eid, UI_TRANSFORM_COMPONENT);
      if (t && t.alpha === 0) {
        const targetY = t.y;
        t.y = targetY + 12;
        globalTweens.to(t, { alpha: 1, y: targetY }, { duration: 0.35, delay, easing: Easing.easeOutCubic });
        delay += 0.02;
      }
    }

    // Stamp special bounce animation (delayed)
    for (const eid of this._stampEntities) {
      const t = world.getComponent<UITransformComponent>(eid, UI_TRANSFORM_COMPONENT);
      if (t) {
        t.alpha = 0;
        globalTweens.to(t, { alpha: 1 }, { duration: 0.3, delay: 0.8, easing: Easing.easeOutBounce });
      }
    }

    this._onRestart = () => { globalEventBus.emit(EVENTS.SCENE_GAME); };
    globalEventBus.on(EVENTS.RESTART_GAME, this._onRestart);

    // ── Warm Memo handlers ────────────────────────────────────
    this._matchedMemo = matchWarmMemo(stats, endingType);
    this._onMemoOpen = () => { if (!this._memoOpen) this.showMemoModal(world); };
    this._onMemoClose = () => { if (this._memoOpen) this.closeMemoModal(world); };
    globalEventBus.on(MEMO_OPEN_EVENT, this._onMemoOpen);
    globalEventBus.on(MEMO_CLOSE_EVENT, this._onMemoClose);
  }

  // ── Header: Gender + University + Major ─────────────────────
  private buildHeader(
    world: IWorld, y: number,
    gender: 'male' | 'female' | null,
    university?: UniversityDef,
    major?: MajorDef,
  ): void {
    const genderIcon = gender === 'female' ? '♀' : '♂';
    const genderColor = gender === 'female' ? 0xff66aa : 0x44aaff;

    // Avatar circle background
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y, width: AVATAR_SIZE, height: AVATAR_SIZE, zIndex: 200, alpha: 0 })
        .withPanel({ backgroundColor: genderColor, backgroundAlpha: 0.15, borderRadius: 27, borderWidth: 2, borderColor: genderColor })
        .build()
    );
    // Gender symbol
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y: y + 4, width: AVATAR_SIZE, height: AVATAR_SIZE, zIndex: 210, alpha: 0 })
        .withText({ text: genderIcon, fontSize: 34, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: genderColor, align: 'center' })
        .build()
    );

    // University name
    const uniTitle = university ? `【${university.title}】` : '';
    const uniName = university ? university.name : '未知学校';
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + AVATAR_SIZE + 20, y, width: CW - AVATAR_SIZE - 20, height: 30, zIndex: 200, alpha: 0 })
        .withText({
          text: `${uniTitle} ${uniName}`,
          fontSize: 24, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: PALETTE.TEXT_BRIGHT, align: 'left',
          strokeColor: 0x0a1a2a, strokeWidth: 1,
        })
        .build()
    );

    // Major
    const majorName = major ? major.name : '未知专业';
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + AVATAR_SIZE + 20, y: y + 32, width: CW - AVATAR_SIZE - 20, height: 22, zIndex: 200, alpha: 0 })
        .withText({ text: `专业: ${majorName}`, fontSize: 15, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_DIM, align: 'left' })
        .build()
    );
  }

  // ── Ending Section ──────────────────────────────────────────
  private buildEnding(world: IWorld, y: number, ending: FinalEnding): void {
    // Left accent bar
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y, width: 4, height: 66, zIndex: 210, alpha: 0 })
        .withPanel({ backgroundColor: ending.color, backgroundAlpha: 1, borderRadius: 2 })
        .build()
    );
    // Category
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + 16, y, width: 200, height: 18, zIndex: 200, alpha: 0 })
        .withText({ text: `〔${ending.category}〕结局`, fontSize: 13, fontFamily: FONT.PIXEL, color: ending.color, align: 'left' })
        .build()
    );
    // Title
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + 16, y: y + 20, width: CW - 32, height: 30, zIndex: 200, alpha: 0 })
        .withText({
          text: ending.title,
          fontSize: 26, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: PALETTE.TEXT_BRIGHT, align: 'left',
          strokeColor: ending.color, strokeWidth: 1,
        })
        .build()
    );
    // Description
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + 16, y: y + 50, width: CW - 32, height: 22, zIndex: 200, alpha: 0 })
        .withText({
          text: ending.description,
          fontSize: FONT.LABEL_SIZE, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_DIM, align: 'left',
          wordWrap: true, maxWidth: CW - 48,
        })
        .build()
    );
  }

  // ── Soul Verdict ────────────────────────────────────────────
  private buildSoulVerdict(world: IWorld, y: number, endingType: EndingType, endingColor: number): void {
    const verdict = SOUL_VERDICTS[endingType];

    // Left accent bar
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y: y + 6, width: SETTLE.VERDICT_BORDER_W, height: 52, zIndex: 210, alpha: 0 })
        .withPanel({ backgroundColor: endingColor, backgroundAlpha: 0.6, borderRadius: 1 })
        .build()
    );
    // Section label
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + 14, y, width: 300, height: 18, zIndex: 200, alpha: 0 })
        .withText({ text: '〔 SOUL_VERDICT 〕', fontSize: 12, fontFamily: FONT.PIXEL, color: endingColor, align: 'left' })
        .build()
    );
    // Verdict text
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + 14, y: y + 20, width: CW - 40, height: 48, zIndex: 200, alpha: 0 })
        .withText({
          text: `"${verdict}"`,
          fontSize: SETTLE.VERDICT_FONT_SIZE, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_BRIGHT, align: 'left',
          wordWrap: true, maxWidth: CW - 60,
          strokeColor: endingColor, strokeWidth: 1,
        })
        .build()
    );
  }

  // ── Stats Row ───────────────────────────────────────────────
  private buildStats(world: IWorld, headerY: number, statsY: number, stats: PlayerStats): void {
    // Section header
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y: headerY, width: 200, height: 18, zIndex: 200, alpha: 0 })
        .withText({ text: '[ 最终属性 ]', fontSize: 14, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: PALETTE.NEON_MAGENTA, align: 'left' })
        .build()
    );

    const COLS = 6;
    const colGap = 16;
    const colW = (CW - (COLS - 1) * colGap) / COLS;
    STAT_KEYS.forEach((key, i) => {
      const x = CX + i * (colW + colGap);
      // Label + value
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x, y: statsY, width: colW, height: 16, zIndex: 200, alpha: 0 })
          .withText({
            text: `${STAT_LABELS[key]}  ${stats[key]}`,
            fontSize: 13, fontFamily: FONT.PIXEL, color: STAT_COLORS[key], align: 'left',
          })
          .build()
      );
      // Progress bar
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x, y: statsY + 20, width: colW, height: 8, zIndex: 200, alpha: 0 })
          .withProgressBar({
            value: stats[key], maxValue: 100,
            fillColor: STAT_COLORS[key],
            backgroundColor: 0x1a1a3a, borderRadius: 3, animated: true, animationSpeed: 2,
          })
          .build()
      );
    });
  }

  // ── Personality Analysis (赛博人格侧写) ─────────────────────
  private buildPersonalityAnalysis(
    world: IWorld, headerY: number, barsY: number, tagsY: number,
    stats: PlayerStats, percentiles: Record<string, number>,
  ): void {
    // Section header
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y: headerY, width: 400, height: 24, zIndex: 200, alpha: 0 })
        .withText({ text: '[ 赛博人格侧写 ]', fontSize: 16, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: PALETTE.NEON_CYAN, align: 'left' })
        .build()
    );
    // Sub-header
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + 200, y: headerY + 2, width: 340, height: 18, zIndex: 200, alpha: 0 })
        .withText({ text: 'CYBER_PERSONA_PROFILE::SCAN', fontSize: 11, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_DIM, align: 'left' })
        .build()
    );

    // Personality dimension bars
    PERSONALITY_DIMENSIONS.forEach((dim, i) => {
      const barY = barsY + i * (SETTLE.PERSONALITY_BAR_H + SETTLE.PERSONALITY_BAR_GAP);
      const value = stats[dim.statKey];
      const descriptor = getPersonalityDescriptor(dim.statKey, value);
      const color = STAT_COLORS[dim.statKey];
      const pct = percentiles[dim.statKey] ?? 50;

      // Dimension label
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: CX, y: barY, width: SETTLE.PERSONALITY_LABEL_W, height: SETTLE.PERSONALITY_BAR_H, zIndex: 200, alpha: 0 })
          .withText({ text: `${dim.icon} ${dim.label}`, fontSize: 14, fontFamily: FONT.PIXEL, color, align: 'left' })
          .build()
      );

      // Progress bar
      const barX = CX + SETTLE.PERSONALITY_LABEL_W + 8;
      const barW = CW - SETTLE.PERSONALITY_LABEL_W - SETTLE.PERSONALITY_VALUE_W - SETTLE.PERSONALITY_DESC_W - SETTLE.PERSONALITY_PCT_W - 40;
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: barX, y: barY + 5, width: barW, height: 14, zIndex: 200, alpha: 0 })
          .withProgressBar({
            value, maxValue: 100,
            fillColor: color,
            backgroundColor: 0x1a1a3a, borderRadius: 3, animated: true, animationSpeed: 1.5,
          })
          .build()
      );

      // Numeric value
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: barX + barW + 6, y: barY, width: SETTLE.PERSONALITY_VALUE_W, height: SETTLE.PERSONALITY_BAR_H, zIndex: 200, alpha: 0 })
          .withText({ text: `${value}`, fontSize: 14, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: PALETTE.TEXT_BRIGHT, align: 'center' })
          .build()
      );

      // Descriptor text
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: barX + barW + SETTLE.PERSONALITY_VALUE_W + 6, y: barY, width: SETTLE.PERSONALITY_DESC_W, height: SETTLE.PERSONALITY_BAR_H, zIndex: 200, alpha: 0 })
          .withText({ text: descriptor, fontSize: 12, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_DIM, align: 'left' })
          .build()
      );

      // Percentile comparison text
      const pctLabel = PERSONALITY_LABELS[dim.statKey];
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: CX + CW - SETTLE.PERSONALITY_PCT_W, y: barY, width: SETTLE.PERSONALITY_PCT_W, height: SETTLE.PERSONALITY_BAR_H, zIndex: 200, alpha: 0 })
          .withText({
            text: `超过全港 ${pct}% 留子的${pctLabel}`,
            fontSize: 11, fontFamily: FONT.PIXEL, color: pct >= 75 ? PALETTE.NEON_YELLOW : PALETTE.TEXT_DIM, align: 'right',
          })
          .build()
      );
    });

    // ── Personality Summary Tags ──
    const matchedTags = PERSONALITY_TAGS.filter(t => t.condition(stats));
    const displayTags = matchedTags.slice(0, MAX_PERSONALITY_TAGS);

    // Tags sub-header
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y: tagsY - 2, width: 140, height: 18, zIndex: 200, alpha: 0 })
        .withText({ text: 'PERSONA_TYPE::', fontSize: 11, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_DIM, align: 'left' })
        .build()
    );

    // Render personality tag pills
    const FIXED_PILL_W = 150;
    let tagX = CX + 110;
    displayTags.forEach((tag) => {
      // Tag pill background
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: tagX, y: tagsY - 4, width: FIXED_PILL_W, height: SETTLE.PERSONALITY_TAG_H, zIndex: 200, alpha: 0 })
          .withPanel({ backgroundColor: tag.color, backgroundAlpha: 0.12, borderRadius: 17, borderWidth: 1, borderColor: tag.color })
          .build()
      );
      // Tag text
      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: tagX, y: tagsY, width: FIXED_PILL_W, height: SETTLE.PERSONALITY_TAG_H - 8, zIndex: 210, alpha: 0 })
          .withText({ text: `# ${tag.label}`, fontSize: 13, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: tag.color, align: 'center' })
          .build()
      );
      tagX += FIXED_PILL_W + SETTLE.PERSONALITY_TAG_GAP;
    });
  }

  // ── Tag Section ─────────────────────────────────────────────
  private buildTagSection(world: IWorld, headerY: number, gridY: number, earnedTags: TagDef[]): void {
    // Header
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX, y: headerY, width: 400, height: 22, zIndex: 200, alpha: 0 })
        .withText({
          text: `[ 获得标签 × ${earnedTags.length} ]`,
          fontSize: 16, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: PALETTE.NEON_YELLOW, align: 'left',
        })
        .build()
    );

    // Tag badges in a flowing grid
    earnedTags.forEach((tag, i) => {
      const col = i % TAGS_PER_ROW;
      const row = Math.floor(i / TAGS_PER_ROW);
      const tx = CX + col * (TAG_W + TAG_GAP_X);
      const ty = gridY + row * (TAG_H + TAG_GAP_Y);
      this.buildTagBadge(world, tag, tx, ty);
    });
  }

  private buildTagBadge(world: IWorld, tag: TagDef, x: number, y: number): void {
    const catColor = TAG_CAT_COLORS[tag.category] ?? tag.color;
    // Badge background
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x, y, width: TAG_W, height: TAG_H, zIndex: 200, alpha: 0 })
        .withPanel({ backgroundColor: 0x0c0c24, backgroundAlpha: 0.92, borderRadius: 10, borderWidth: 2, borderColor: catColor })
        .build()
    );
    // Left accent
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 4, y: y + 8, width: 5, height: TAG_H - 16, zIndex: 210, alpha: 0 })
        .withPanel({ backgroundColor: catColor, backgroundAlpha: 1, borderRadius: 2 })
        .build()
    );
    // Label
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 4, width: TAG_W - 40, height: 32, zIndex: 210, alpha: 0 })
        .withText({ text: `# ${tag.label}`, fontSize: 24, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: catColor, align: 'left' })
        .build()
    );
    // Description (break at 。)
    const desc = tag.description.replace(/。/g, '。\n').replace(/，/g, '，\n');
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: x + 20, y: y + 38, width: TAG_W - 40, height: TAG_H - 46, zIndex: 210, alpha: 0 })
        .withText({
          text: desc,
          fontSize: 18, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_DIM, align: 'left',
          wordWrap: true, maxWidth: TAG_W - 48,
        })
        .build()
    );
  }

  // ── Status Stamp (overlay, no layout space) ─────────────────
  private buildStatusStamp(world: IWorld, endingType: EndingType): void {
    const stamp = STATUS_STAMPS[endingType];
    const stampX = CARD_X + CARD_W - SETTLE.STAMP_OFFSET_X - SETTLE.STAMP_W;
    const stampY = CARD_Y + SETTLE.STAMP_OFFSET_Y;

    // Outer border (double-line stamp effect)
    const outer = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: stampX, y: stampY, width: SETTLE.STAMP_W, height: SETTLE.STAMP_H, zIndex: 500, alpha: 0 })
      .withPanel({ backgroundColor: stamp.color, backgroundAlpha: 0.08, borderRadius: 4, borderWidth: SETTLE.STAMP_BORDER_W, borderColor: stamp.color })
      .build();
    this.trackEntity(outer);
    this._stampEntities.push(outer);

    // Inner border
    const inner = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: stampX + 4, y: stampY + 4, width: SETTLE.STAMP_W - 8, height: SETTLE.STAMP_H - 8, zIndex: 501, alpha: 0 })
      .withPanel({ backgroundColor: stamp.color, backgroundAlpha: 0.0, borderRadius: 2, borderWidth: 1, borderColor: stamp.color })
      .build();
    this.trackEntity(inner);
    this._stampEntities.push(inner);

    // Stamp text
    const text = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: stampX, y: stampY + 10, width: SETTLE.STAMP_W, height: SETTLE.STAMP_H - 20, zIndex: 502, alpha: 0 })
      .withText({
        text: `STATUS: ${stamp.text}`,
        fontSize: SETTLE.STAMP_FONT_SIZE, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: stamp.color, align: 'center',
      })
      .build();
    this.trackEntity(text);
    this._stampEntities.push(text);
  }

  // ── Barcode ─────────────────────────────────────────────────
  private buildBarcode(world: IWorld, y: number, endingType: EndingType): void {
    const barcode = BARCODE_TYPES[endingType];

    // Draw barcode bars using panels
    let bx = CX;
    // Use a deterministic seed for bar widths
    let seed = endingType.length * 7 + 42;
    for (let i = 0; i < SETTLE.BARCODE_BAR_COUNT; i++) {
      seed = (seed * 31 + 17) % 97;
      const bw = SETTLE.BARCODE_MIN_W + (seed % (SETTLE.BARCODE_MAX_W - SETTLE.BARCODE_MIN_W + 1));
      const bh = SETTLE.BARCODE_H - 8 - (seed % 6);
      const alpha = 0.3 + (seed % 40) / 100;

      this.ta(
        UIEntityBuilder.create(world, W, H)
          .withUITransform({ anchor: 'top-left', x: bx, y: y + 4, width: bw, height: bh, zIndex: 200, alpha: 0 })
          .withPanel({ backgroundColor: PALETTE.NEON_CYAN, backgroundAlpha: alpha, borderRadius: 0 })
          .build()
      );
      bx += bw + SETTLE.BARCODE_GAP;
      if (bx > CX + CW / 2 - 20) break;
    }

    // Barcode type label (right side)
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + CW / 2, y, width: CW / 2, height: 18, zIndex: 200, alpha: 0 })
        .withText({
          text: `[TYPE: ${barcode.code}]`,
          fontSize: 15, fontFamily: FONT.PIXEL, fontWeight: 'bold', color: PALETTE.NEON_CYAN, align: 'right',
        })
        .build()
    );
    this.ta(
      UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: CX + CW / 2, y: y + 20, width: CW / 2, height: 18, zIndex: 200, alpha: 0 })
        .withText({
          text: barcode.label,
          fontSize: 13, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_DIM, align: 'right',
        })
        .build()
    );
  }

  // ── Warm Memo Modal ──────────────────────────────────────────
  private showMemoModal(world: IWorld): void {
    if (!this._matchedMemo) return;
    this._memoOpen = true;
    const memo = this._matchedMemo;

    // Full-screen darkened backdrop (click to close)
    const backdrop = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: 0, y: 0, width: W, height: H, zIndex: 900, alpha: 0 })
      .withPanel({ backgroundColor: 0x000000, backgroundAlpha: 0.7, borderRadius: 0 })
      .withButton({ label: '', onClick: MEMO_CLOSE_EVENT })
      .build();
    this.trackEntity(backdrop);
    this._memoEntities.push(backdrop);

    // Modal card background
    const card = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: MEMO_X, y: MEMO_Y, width: MEMO_W, height: MEMO_H, zIndex: 910, alpha: 0 })
      .withPanel({ backgroundColor: 0x06061a, backgroundAlpha: 0.97, borderRadius: 14, borderWidth: 2, borderColor: PALETTE.NEON_CYAN })
      .build();
    this.trackEntity(card);
    this._memoEntities.push(card);

    // Outer glow
    const glow = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: MEMO_X - 2, y: MEMO_Y - 2, width: MEMO_W + 4, height: MEMO_H + 4, zIndex: 905, alpha: 0 })
      .withPanel({ backgroundColor: PALETTE.NEON_CYAN, backgroundAlpha: 0.12, borderRadius: 16 })
      .build();
    this.trackEntity(glow);
    this._memoEntities.push(glow);

    const cx = MEMO_X + MEMO_PAD;
    const cw = MEMO_W - 2 * MEMO_PAD;
    let my = MEMO_Y + MEMO_PAD;

    // Title line
    const title = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: cx, y: my, width: cw, height: 40, zIndex: 920, alpha: 0 })
      .withText({
        text: `${memo.emoji}  给港硕的温情备忘录`,
        fontSize: 28, fontFamily: FONT.PIXEL, fontWeight: 'bold',
        color: PALETTE.NEON_CYAN, align: 'center',
        strokeColor: PALETTE.NEON_MAGENTA, strokeWidth: 1,
      })
      .build();
    this.trackEntity(title);
    this._memoEntities.push(title);
    my += 46;

    // Subtitle
    const sub = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: cx, y: my, width: cw, height: 26, zIndex: 920, alpha: 0 })
      .withText({
        text: `— ${memo.subtitle} —`,
        fontSize: 18, fontFamily: FONT.PIXEL, color: PALETTE.NEON_MAGENTA, align: 'center',
      })
      .build();
    this.trackEntity(sub);
    this._memoEntities.push(sub);
    my += 34;

    // Divider
    const div = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: cx + 80, y: my, width: cw - 160, height: 1, zIndex: 920, alpha: 0 })
      .withPanel({ backgroundColor: PALETTE.NEON_CYAN, backgroundAlpha: 0.3, borderRadius: 0 })
      .build();
    this.trackEntity(div);
    this._memoEntities.push(div);
    my += 16;

    // Body text — poetry-style: break at each 。，and center-aligned
    const poetryText = memo.body
      .replace(/\n\n/g, '\n')
      .replace(/。/g, '。\n')
      .replace(/，/g, '，\n')
      .replace(/\n+/g, '\n')
      .trim();
    const lines = poetryText.split('\n');
    const LINE_H = 35; // 28 * 1.25 = 35 for 1.25x line spacing
    for (const line of lines) {
      if (line.trim().length === 0) {
        my += 12; // blank line spacing
        continue;
      }
      const body = UIEntityBuilder.create(world, W, H)
        .withUITransform({ anchor: 'top-left', x: cx, y: my, width: cw, height: LINE_H, zIndex: 920, alpha: 0 })
        .withText({
          text: line.trim(),
          fontSize: 17, fontFamily: FONT.PIXEL, color: PALETTE.TEXT_BRIGHT, align: 'center',
        })
        .build();
      this.trackEntity(body);
      this._memoEntities.push(body);
      my += LINE_H;
    }

    // Close button at bottom
    my = MEMO_Y + MEMO_H - MEMO_PAD - 44;
    const closeBtn = UIEntityBuilder.create(world, W, H)
      .withUITransform({ anchor: 'top-left', x: MEMO_X + MEMO_W / 2 - 120, y: my, width: 240, height: 44, zIndex: 920, alpha: 0 })
      .withButton({ label: '✕  我知道了', fontSize: 20, borderRadius: 4, borderWidth: 2, onClick: MEMO_CLOSE_EVENT })
      .build();
    this.trackEntity(closeBtn);
    this._memoEntities.push(closeBtn);

    // Animate in
    for (const eid of this._memoEntities) {
      const t = world.getComponent<UITransformComponent>(eid, UI_TRANSFORM_COMPONENT);
      if (t) {
        t.alpha = 0;
        globalTweens.to(t, { alpha: 1 }, { duration: 0.35, easing: Easing.easeOutCubic });
      }
    }
  }

  private closeMemoModal(world: IWorld): void {
    this._memoOpen = false;
    // Fade out then destroy
    let done = 0;
    const total = this._memoEntities.length;
    for (const eid of this._memoEntities) {
      const t = world.getComponent<UITransformComponent>(eid, UI_TRANSFORM_COMPONENT);
      if (t) {
        globalTweens.to(t, { alpha: 0 }, {
          duration: 0.2,
          easing: Easing.easeInCubic,
          onComplete: () => {
            done++;
            if (done >= total) {
              for (const e of this._memoEntities) {
                world.destroyEntity(e);
              }
              this._memoEntities = [];
            }
          },
        });
      }
    }
  }

  // ── Helpers ─────────────────────────────────────────────────
  /** Track entity and record for fade-in animation. */
  private ta(eid: number): void {
    this.trackEntity(eid);
    this._animateIds.push(eid);
  }

  private buildDivider(world: IWorld, y: number, color: number): void {
    this.trackEntity(
      EntityBuilder.create(world, W, H)
        .withTransform({ x: W / 2, y, screenSpace: true })
        .withSprite({ color, width: CW, height: 1, alpha: 0.25, zIndex: 10 })
        .build()
    );
  }

  private matchEnding(stats: PlayerStats): FinalEnding {
    for (const ending of FINAL_ENDINGS) {
      if (ending.condition(stats)) return ending;
    }
    return FINAL_ENDINGS[FINAL_ENDINGS.length - 1];
  }

  update(world: IWorld, _deltaTime: number): void {
    // Scroll grid background
    if (this._gridBgEntity !== -1) {
      const sprite = world.getComponent<SpriteComponent>(this._gridBgEntity, SPRITE_COMPONENT);
      if (sprite) {
        sprite.tilePositionX -= 0.08;
        sprite.tilePositionY -= 0.04;
      }
    }

    // Animate ambient particles (float upward)
    for (let i = 0; i < this._particles.length; i++) {
      const eid = this._particles[i];
      const transform = world.getComponent<TransformComponent>(eid, TRANSFORM_COMPONENT);
      if (!transform) continue;
      transform.y -= this._particleSpeeds[i];
      const spr = world.getComponent<SpriteComponent>(eid, SPRITE_COMPONENT);
      if (spr) spr.alpha = 0.06 + Math.sin(Date.now() * 0.0012 + i * 2.3) * 0.05;
      if (transform.y < -10) {
        transform.y = H + 10;
        transform.x = Math.random() * W;
      }
    }

    // Animate scan line (sweep top to bottom)
    if (this._scanLineEntity !== -1) {
      const scanT = world.getComponent<TransformComponent>(this._scanLineEntity, TRANSFORM_COMPONENT);
      if (scanT) {
        scanT.y += 1.0;
        if (scanT.y > H) scanT.y = 0;
      }
      const scanS = world.getComponent<SpriteComponent>(this._scanLineEntity, SPRITE_COMPONENT);
      if (scanS) {
        const progress = (world.getComponent<TransformComponent>(this._scanLineEntity, TRANSFORM_COMPONENT)?.y ?? 0) / H;
        scanS.alpha = 0.04 * (1 + Math.sin(progress * Math.PI) * 0.5);
      }
    }
  }

  onExit(world: IWorld): void {
    if (this._onRestart) {
      globalEventBus.off(EVENTS.RESTART_GAME, this._onRestart);
      this._onRestart = null;
    }
    if (this._onMemoOpen) {
      globalEventBus.off(MEMO_OPEN_EVENT, this._onMemoOpen);
      this._onMemoOpen = null;
    }
    if (this._onMemoClose) {
      globalEventBus.off(MEMO_CLOSE_EVENT, this._onMemoClose);
      this._onMemoClose = null;
    }
    this._scanLineEntity = -1;
    this._gridBgEntity = -1;
    this._particles = [];
    this._particleSpeeds = [];
    this._stampEntities = [];
    this._memoEntities = [];
    this._memoOpen = false;
    this._matchedMemo = null;
    super.onExit(world);
  }
}
