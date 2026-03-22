import Phaser from 'phaser';

export default class LoseScene extends Phaser.Scene {
  constructor() {
    super('Lose');
  }

  init(data) {
    this.reason = data.reason || 'time';
    this.materialsCollected = data.materialsCollected || 0;
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.cameras.main.setBackgroundColor('#1a0a0a');

    this.add.text(cx, cy - 100, 'MISSION FAILED', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const reasonText = this.reason === 'time'
      ? 'Time ran out before the robot could be repaired.'
      : 'The monster caught you one too many times.';

    this.add.text(cx, cy - 30, reasonText, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ff8888',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, `Materials collected: ${this.materialsCollected} / 5`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    const restart = this.add.text(cx, cy + 100, '[ PRESS ENTER TO TRY AGAIN ]', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ff4444',
    }).setOrigin(0.5).setInteractive();

    this.tweens.add({
      targets: restart,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    restart.on('pointerdown', () => this.scene.start('Game'));
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('Game'));
  }
}
