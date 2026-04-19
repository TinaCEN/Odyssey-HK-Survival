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
import type { IWorld, UITransformComponent, SpriteComponent, TransformComponent } from 'agent-gamedev';
import {
  GAME_CONFIG,
  PALETTE,
  FONT,
  EVENTS,
} from '../constants';

const W = GAME_CONFIG.WIDTH;
const H = GAME_CONFIG.HEIGHT;

// ── Menu layout constants ────────────────────────────────────────
const MENU_PARTICLE_COUNT = 30;
const MENU_PARTICLE_COLORS = [0x00ccdd, 0x005566, 0x44bbcc, 0x338899, 0x6644aa, 0xff00aa];
const HUD_DATA_COLOR = 0x334455;
const HUD_DATA_ALPHA = 0.35;
const SCAN_LINE_COLOR = 0x00e5ff;
const SCAN_LINE_ALPHA = 0.04;
const SCAN_LINE_WIDTH = 1;

export class MenuScene extends Scene {
  readonly name = 'MenuScene';

  private _onStart: (() => void) | null = null;
  private _particles: number[] = [];
  private _particleSpeeds: number[] = [];
  private _scanLineEntity = -1;
  private _gridBgEntity = -1;
  private _scrollTextEntity = -1;

  onEnter(world: IWorld): void {
    globalTheme.setTheme('cyberpunk');

    this._particles = [];
    this._particleSpeeds = [];

    // ── Tiling grid background ──────────────────────────────────
    this._gridBgEntity = EntityBuilder.create(world, W, H)
      .withTilingSprite({ textureId: 'cyber-grid', tileWidth: W, tileHeight: H, zIndex: 0 })
      .build();
    this.trackEntity(this._gridBgEntity);

    // Dark overlay for text readability
    const overlayEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: H / 2, screenSpace: true })
      .withSprite({ color: 0x030810, width: W, height: H, alpha: 0.3, zIndex: 2 })
      .build();
    this.trackEntity(overlayEntity);

    // ── Floating ambient particles ───────────────────────────────
    for (let i = 0; i < MENU_PARTICLE_COUNT; i++) {
      const size = 1 + Math.random() * 4;
      const x = Math.random() * W;
      const y = Math.random() * H;
      const color = MENU_PARTICLE_COLORS[i % MENU_PARTICLE_COLORS.length];
      const speed = 0.1 + Math.random() * 0.4;
      const entity = EntityBuilder.create(world, W, H)
        .withTransform({ x, y, screenSpace: true })
        .withSprite({ color, width: size, height: size, alpha: 0.12 + Math.random() * 0.1, zIndex: 5 })
        .build();
      this.trackEntity(entity);
      this._particles.push(entity);
      this._particleSpeeds.push(speed);
    }

    // ── Animated horizontal scan line ────────────────────────────
    this._scanLineEntity = EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: 0, screenSpace: true })
      .withSprite({ color: SCAN_LINE_COLOR, width: W, height: SCAN_LINE_WIDTH, alpha: SCAN_LINE_ALPHA, zIndex: 495 })
      .build();
    this.trackEntity(this._scanLineEntity);

    // ── Top/bottom neon lines (thicker, more glow) ──────────────
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W / 2, y: 1, screenSpace: true }).withSprite({ color: PALETTE.NEON_CYAN, width: W, height: 3, alpha: 0.7, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W / 2, y: H - 1, screenSpace: true }).withSprite({ color: PALETTE.NEON_MAGENTA, width: W, height: 3, alpha: 0.7, zIndex: 10 }).build());
    // Side accent lines
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: 1, y: H / 2, screenSpace: true }).withSprite({ color: 0x003344, width: 2, height: H, alpha: 0.35, zIndex: 10 }).build());
    this.trackEntity(EntityBuilder.create(world, W, H).withTransform({ x: W - 1, y: H / 2, screenSpace: true }).withSprite({ color: 0x003344, width: 2, height: H, alpha: 0.35, zIndex: 10 }).build());

    // ── HUD decorative text (top corners) ────────────────────────
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 30, y: 18, width: 350, height: 18, zIndex: 200 }).withText({ text: '◈ SYS::HK_MSC_SIM_v3.0 // NEURAL_LINK', fontSize: 13, fontFamily: FONT.PIXEL, color: HUD_DATA_COLOR, align: 'left' }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 380, y: 18, width: 350, height: 18, zIndex: 200 }).withText({ text: 'STATUS::ONLINE // LAT::22.3N LON::114.2E', fontSize: 13, fontFamily: FONT.PIXEL, color: HUD_DATA_COLOR, align: 'right' }).build());

    // ── HUD decorative text (bottom corners) ─────────────────────
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 30, y: H - 36, width: 350, height: 18, zIndex: 200 }).withText({ text: 'FRAME::OK // MEM::STABLE // UPTIME::∞', fontSize: 12, fontFamily: FONT.PIXEL, color: 0x223344, align: 'left' }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 380, y: H - 36, width: 350, height: 18, zIndex: 200 }).withText({ text: 'BUILD::2025.CYBER // ENGINE::ECS_v8', fontSize: 12, fontFamily: FONT.PIXEL, color: 0x223344, align: 'right' }).build());

    // ── Corner bracket decorations (large) ───────────────────────
    const BK = 50;
    const BT = 3;
    const bkColor = 0x006677;
    const bkAlpha = 0.5;
    // Top-left
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 20, y: 8, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 20, y: 8, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    // Top-right
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 20 - BK, y: 8, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 20 - BT, y: 8, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: bkColor, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    // Bottom-left
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 20, y: H - 8 - BT, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: 20, y: H - 8 - BK, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    // Bottom-right
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 20 - BK, y: H - 8 - BT, width: BK, height: BT, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());
    this.trackEntity(UIEntityBuilder.create(world, W, H).withUITransform({ anchor: 'top-left', x: W - 20 - BT, y: H - 8 - BK, width: BT, height: BK, zIndex: 300 }).withPanel({ backgroundColor: 0x440044, backgroundAlpha: bkAlpha, borderRadius: 0 }).build());

    // ── Horizontal data stream lines (decorative) ────────────────
    const dataLineY = [H / 2 - 260, H / 2 + 260];
    for (const dly of dataLineY) {
      this.trackEntity(EntityBuilder.create(world, W, H)
        .withTransform({ x: W / 2, y: dly, screenSpace: true })
        .withSprite({ color: 0x005566, width: W - 80, height: 1, alpha: HUD_DATA_ALPHA, zIndex: 8 })
        .build());
    }

    // Title: 港硕模拟器 (2x size)
    const titleEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({
        anchor: 'center', y: -200, width: 1200, height: 160,
        pivotX: 0.5, pivotY: 0.5, zIndex: 100, alpha: 0,
      })
      .withText({
        text: '港 硕 模 拟 器',
        fontSize: FONT.TITLE_SIZE * 2,
        fontFamily: FONT.PIXEL,
        fontWeight: 'bold',
        color: PALETTE.NEON_CYAN,
        align: 'center',
        strokeColor: PALETTE.NEON_MAGENTA,
        strokeWidth: 4,
      })
      .build();
    this.trackEntity(titleEntity);

    // Scrolling subtitle at top (moves right continuously)
    this._scrollTextEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({
        anchor: 'top-left', x: -800, y: 12, width: 800, height: 30,
        zIndex: 200, alpha: 0.6,
      })
      .withText({
        text: 'CYBER M.Sc. SIMULATOR // 2025 ░░ CYBER M.Sc. SIMULATOR // 2025 ░░ CYBER M.Sc. SIMULATOR // 2025',
        fontSize: 16,
        fontFamily: FONT.PIXEL,
        color: PALETTE.NEON_MAGENTA,
        align: 'left',
      })
      .build();
    this.trackEntity(this._scrollTextEntity);

    // Decorative divider below subtitle
    this.trackEntity(EntityBuilder.create(world, W, H)
      .withTransform({ x: W / 2, y: H / 2 - 70, screenSpace: true })
      .withSprite({ color: PALETTE.NEON_CYAN, width: 500, height: 1, alpha: 0.3, zIndex: 100 })
      .build());

    // Description
    const descEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({
        anchor: 'center', y: 40, width: 700, height: 180,
        pivotX: 0.5, pivotY: 0.5, zIndex: 100, alpha: 0,
      })
      .withText({
        text: '每个人的人生中都有一段"奥德赛时期"：\n你在海上漂泊，满目都是从未见过的岛屿，\n却迟迟找不到靠岸的坐标。\n而这一年的香港，就是你最汹涌的那片海。\n这是一段关于梦想，挣扎和成长的港硕故事',
        fontSize: FONT.BODY_SIZE,
        fontFamily: FONT.PIXEL,
        color: PALETTE.TEXT_BRIGHT,
        align: 'center',
        wordWrap: true,
        maxWidth: 700,
      })
      .build();
    this.trackEntity(descEntity);

    // Start button
    const startBtnEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({
        anchor: 'center', y: 220, width: 360, height: 70,
        pivotX: 0.5, pivotY: 0.5, zIndex: 100, alpha: 0,
      })
      .withButton({
        label: '[ 开 始 模 拟 ]',
        fontSize: FONT.BODY_SIZE,
        borderRadius: 4,
        borderWidth: 2,
        onClick: EVENTS.START_GAME,
      })
      .build();
    this.trackEntity(startBtnEntity);

    // Hint
    const hintEntity = UIEntityBuilder.create(world, W, H)
      .withUITransform({
        anchor: 'center', y: 275, width: 400, height: 30,
        pivotX: 0.5, pivotY: 0.5, zIndex: 100, alpha: 0,
      })
      .withText({
        text: '▸ 点击按钮或触屏开始 ◂',
        fontSize: FONT.HINT_SIZE,
        fontFamily: FONT.PIXEL,
        color: PALETTE.TEXT_DIM,
        align: 'center',
      })
      .build();
    this.trackEntity(hintEntity);

    // Staggered fade-in animation
    const animEntities = [titleEntity, descEntity, startBtnEntity, hintEntity];
    animEntities.forEach((eid, i) => {
      const t = world.getComponent<UITransformComponent>(eid, UI_TRANSFORM_COMPONENT);
      if (!t) return;
      const targetY = t.y;
      t.y = targetY + 30;
      globalTweens.to(t, { alpha: 1, y: targetY }, {
        duration: 0.5,
        delay: 0.2 + i * 0.15,
        easing: Easing.easeOutCubic,
      });
    });

    // Hint blinking loop
    const hintT = world.getComponent<UITransformComponent>(hintEntity, UI_TRANSFORM_COMPONENT);
    if (hintT) {
      globalTweens.to(hintT, { alpha: 0.4 }, { duration: 1.2, delay: 1.5, easing: Easing.easeInOutSine, yoyo: true, repeat: -1 });
    }

    // Event listener
    this._onStart = () => {
      globalEventBus.emit(EVENTS.SCENE_GAME);
    };
    globalEventBus.on(EVENTS.START_GAME, this._onStart);
  }

  update(world: IWorld, _deltaTime: number): void {
    // Scroll grid background
    if (this._gridBgEntity !== -1) {
      const sprite = world.getComponent<SpriteComponent>(this._gridBgEntity, SPRITE_COMPONENT);
      if (sprite) {
        sprite.tilePositionX -= 0.12;
        sprite.tilePositionY -= 0.06;
      }
    }

    // Scroll subtitle text rightward at top
    if (this._scrollTextEntity !== -1) {
      const t = world.getComponent<UITransformComponent>(this._scrollTextEntity, UI_TRANSFORM_COMPONENT);
      if (t) {
        t.x += 0.8;
        if (t.x > W) t.x = -800;
      }
    }

    // Animate ambient particles (float upward)
    for (let i = 0; i < this._particles.length; i++) {
      const eid = this._particles[i];
      const transform = world.getComponent<TransformComponent>(eid, TRANSFORM_COMPONENT);
      if (!transform) continue;
      transform.y -= this._particleSpeeds[i];
      const spr = world.getComponent<SpriteComponent>(eid, SPRITE_COMPONENT);
      if (spr) spr.alpha = 0.08 + Math.sin(Date.now() * 0.0015 + i * 2.1) * 0.06;
      if (transform.y < -10) {
        transform.y = H + 10;
        transform.x = Math.random() * W;
      }
    }

    // Animate scan line (sweep top to bottom)
    if (this._scanLineEntity !== -1) {
      const scanT = world.getComponent<TransformComponent>(this._scanLineEntity, TRANSFORM_COMPONENT);
      if (scanT) {
        scanT.y += 1.5;
        if (scanT.y > H) scanT.y = 0;
      }
      const scanS = world.getComponent<SpriteComponent>(this._scanLineEntity, SPRITE_COMPONENT);
      if (scanS) {
        // Fade scan line based on position
        const progress = (world.getComponent<TransformComponent>(this._scanLineEntity, TRANSFORM_COMPONENT)?.y ?? 0) / H;
        scanS.alpha = SCAN_LINE_ALPHA * (1 + Math.sin(progress * Math.PI) * 0.5);
      }
    }
  }

  onExit(world: IWorld): void {
    if (this._onStart) {
      globalEventBus.off(EVENTS.START_GAME, this._onStart);
      this._onStart = null;
    }
    this._particles = [];
    this._particleSpeeds = [];
    this._scanLineEntity = -1;
    this._gridBgEntity = -1;
    this._scrollTextEntity = -1;
    super.onExit(world);
  }
}
