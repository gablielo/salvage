import Phaser from 'phaser';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super('Win');
  }

  init(data) {
    this.timeRemaining = data.timeRemaining || 0;
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.cameras.main.setBackgroundColor('#0a1a0a');

    this.add.text(cx, cy - 100, 'ROBOT REPAIRED!', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#44ff44',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 30, 'You fixed the robot and escaped!', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#aaffaa',
    }).setOrigin(0.5);

    const m = Math.floor(this.timeRemaining / 60);
    const s = this.timeRemaining % 60;
    this.add.text(cx, cy + 20, `Time remaining: ${m}:${s.toString().padStart(2, '0')}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5);

    const restart = this.add.text(cx, cy + 100, '[ PRESS ENTER TO PLAY AGAIN ]', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#44ff44',
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
