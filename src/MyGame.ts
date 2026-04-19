import { Game, UIEntityBuilder, globalEventBus, globalAssets } from 'agent-gamedev';
import type { SceneManager } from 'agent-gamedev';
import { initNeonUI, globalArtPack } from 'agent-gamedev-plugins';
import { MenuScene, GameScene, SettlementScene } from './scenes';
import { GAME_CONFIG, EVENTS, GLITCH_AUDIO_HEARTBEAT, GLITCH_AUDIO_WHISPER, EVENT_IMAGE_IDS } from './constants';
import type { PlayerStats } from './constants';

export class MyGame extends Game {
  private sceneManager!: SceneManager;

  constructor() {
    super({
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT,
      backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
      containerId: 'game-container',
      showFps: false,
    });
  }

  protected override async preload(): Promise<void> {
    await globalAssets.loadVersionMap();
    await initNeonUI(this);
    UIEntityBuilder.setArtPack(globalArtPack.current);

    // Preload game assets
    await Promise.all([
      globalAssets.loadTexture('menu-bg', 'assets/scene/menu-bg.jpg'),
      globalAssets.loadTexture('hk-skyline', 'assets/scene/hk-skyline.png'),
      globalAssets.loadTexture('hk-night-bg', 'assets/scene/hk-night-bg.png'),
      globalAssets.loadTexture('cyber-bg', 'assets/scene/cyber-bg.svg'),
      globalAssets.loadTexture('cyber-grid', 'assets/scene/cyber-grid.svg'),
      globalAssets.loadTexture('ch1-airport', 'assets/scene/ch1-airport.svg'),
      globalAssets.loadTexture('ch2-campus', 'assets/scene/ch2-campus.svg'),
      globalAssets.loadTexture('ch3-library', 'assets/scene/ch3-library.svg'),
      globalAssets.loadTexture('ch4-street', 'assets/scene/ch4-street.svg'),
      globalAssets.loadTexture('ch5-exam', 'assets/scene/ch5-exam.svg'),
      globalAssets.loadTexture('ch6-career', 'assets/scene/ch6-career.svg'),
      globalAssets.loadTexture('ch7-peak', 'assets/scene/ch7-peak.svg'),
      // Event series illustrations
      ...EVENT_IMAGE_IDS.map((id) =>
        globalAssets.loadTexture(id, `assets/scene/${id}.svg`),
      ),
      // Glitch effect audio
      globalAssets.loadAudio(GLITCH_AUDIO_HEARTBEAT, 'assets/audio/sfx/heartbeat.wav'),
      globalAssets.loadAudio(GLITCH_AUDIO_WHISPER, 'assets/audio/sfx/whisper.wav'),
    ]);
  }

  protected create(): void {
    this.sceneManager = this.createSceneManager();

    // Register scenes
    this.sceneManager.register('menu', new MenuScene());
    this.sceneManager.register('game', new GameScene());
    this.sceneManager.register('settlement', new SettlementScene());

    // Scene transitions
    globalEventBus.on(EVENTS.SCENE_GAME, () => {
      this.sceneManager.replace('game', this.getWorld());
    });

    globalEventBus.on(EVENTS.SCENE_MENU, () => {
      this.sceneManager.replace('menu', this.getWorld());
    });

    globalEventBus.on(EVENTS.SCENE_SETTLEMENT, (data: { stats: PlayerStats }) => {
      this.sceneManager.replace('settlement', this.getWorld(), data);
    });

    // Start with menu
    this.sceneManager.push('menu', this.getWorld());
  }

  protected update(deltaTime: number): void {
    this.sceneManager.update(this.getWorld(), deltaTime);
  }
}
