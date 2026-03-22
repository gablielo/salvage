import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const g = this.make.graphics({ add: false });

    // Player sprite (green circle)
    g.clear();
    g.fillStyle(0x44cc44);
    g.fillCircle(12, 12, 10);
    g.lineStyle(2, 0x228822);
    g.strokeCircle(12, 12, 10);
    g.generateTexture('player', 24, 24);

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
