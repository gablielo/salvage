import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const g = this.make.graphics({ add: false });

    // Player sprite — humanoid top-down, 4 directions
    const drawPlayer = (headX, headY, headR, bodyX, bodyY, visorFn) => {
      g.clear();
      // Body (top-down torso oval)
      g.fillStyle(0x336633);
      g.fillEllipse(bodyX, bodyY, 14, 8);
      g.lineStyle(1, 0x224422);
      g.strokeEllipse(bodyX, bodyY, 14, 8);
      // Head
      g.fillStyle(0x44aa44);
      g.fillCircle(headX, headY, headR);
      g.lineStyle(1, 0x224422);
      g.strokeCircle(headX, headY, headR);
      // Visor
      g.fillStyle(0x00ffcc);
      visorFn();
    };

    // Down — head top-center, visor on bottom edge of head
    drawPlayer(12, 7, 6, 12, 16, () => g.fillRect(8, 10, 8, 2));
    g.generateTexture('player_down', 24, 24);

    // Up — head top-center, hair/back detail instead of visor
    drawPlayer(12, 7, 6, 12, 16, () => { g.fillStyle(0x225522); g.fillRect(9, 3, 6, 2); });
    g.generateTexture('player_up', 24, 24);

    // Left — head offset left, visor on left edge
    drawPlayer(8, 9, 5, 14, 16, () => g.fillRect(3, 8, 3, 2));
    g.generateTexture('player_left', 24, 24);

    // Right — head offset right, visor on right edge
    drawPlayer(16, 9, 5, 10, 16, () => g.fillRect(18, 8, 3, 2));
    g.generateTexture('player_right', 24, 24);

    // Monster sprite (red with horns)
    g.clear();
    g.fillStyle(0xcc2222);
    g.fillCircle(14, 14, 12);
    g.lineStyle(2, 0x881111);
    g.strokeCircle(14, 14, 12);
    // Eyes
    g.fillStyle(0xffff00);
    g.fillCircle(10, 11, 3);
    g.fillCircle(18, 11, 3);
    g.fillStyle(0x000000);
    g.fillCircle(10, 11, 1.5);
    g.fillCircle(18, 11, 1.5);
    g.generateTexture('monster', 28, 28);

    // Material pickup (glowing diamond)
    g.clear();
    g.fillStyle(0x00ddff);
    g.fillTriangle(10, 0, 0, 10, 10, 20);
    g.fillTriangle(10, 0, 20, 10, 10, 20);
    g.lineStyle(1, 0x00ffff);
    g.strokeTriangle(10, 0, 0, 10, 10, 20);
    g.strokeTriangle(10, 0, 20, 10, 10, 20);
    g.generateTexture('material', 20, 20);

    // Robot sprite (broken, gray)
    g.clear();
    g.fillStyle(0x888888);
    g.fillRect(4, 0, 16, 20);
    g.fillStyle(0x666666);
    g.fillRect(0, 6, 24, 12);
    // Eyes (one broken)
    g.fillStyle(0xff0000);
    g.fillCircle(9, 7, 3);
    g.fillStyle(0x333333);
    g.fillCircle(15, 7, 3);
    // Sparks
    g.lineStyle(1, 0xffff00);
    g.lineBetween(2, 2, 6, 5);
    g.lineBetween(20, 3, 18, 6);
    g.generateTexture('robot', 24, 24);

    // Trap sprite (purple hazard)
    g.clear();
    g.fillStyle(0x9933ff, 0.6);
    g.fillCircle(12, 12, 10);
    g.lineStyle(2, 0x6600cc);
    g.strokeCircle(12, 12, 10);
    g.lineStyle(1, 0xcc66ff);
    g.lineBetween(12, 4, 12, 20);
    g.lineBetween(4, 12, 20, 12);
    g.generateTexture('trap', 24, 24);

    g.destroy();

    this.scene.start('Menu');
  }
}
