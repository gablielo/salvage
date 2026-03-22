import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Background
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // Title
    this.add.text(cx, cy - 120, 'SALVAGE', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#00ddff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 60, 'Fix the robot. Beat the clock. Escape the monster.', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Instructions
    const instructions = [
      'WASD / Arrow Keys - Move',
      'SHIFT - Sprint (monster can hear you!)',
      'E - Interact / Pick up materials',
      'TAB - View Blueprint',
      '',
      'Collect all 5 materials to fix the robot.',
      'Beware — the monster grows stronger over time.',
    ];

    instructions.forEach((line, i) => {
      this.add.text(cx, cy + 10 + i * 24, line, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#888888',
      }).setOrigin(0.5);
    });

    // Start button
    const startText = this.add.text(cx, cy + 210, '[ PRESS ENTER OR CLICK TO START ]', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#44cc44',
    }).setOrigin(0.5).setInteractive();

    // Blink effect
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Start game on click or enter
    startText.on('pointerdown', () => this.startGame());
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
  }

  startGame() {
    this.scene.start('Game');
  }
}
