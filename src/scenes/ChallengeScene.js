import Phaser from 'phaser';

export default class ChallengeScene extends Phaser.Scene {
  constructor() {
    super('Challenge');
  }

  init(data) {
    this.material = data.material;
    this.onComplete = data.onComplete;
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Semi-transparent overlay
    this.add.rectangle(cx, cy, 800, 600, 0x000000, 0.85).setDepth(100);

    // Title
    this.add.text(cx, cy - 220, `CHALLENGE: ${this.material.name}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#00ddff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    // Launch appropriate challenge
    switch (this.material.challenge) {
      case 'memory':
        this.createMemoryChallenge(cx, cy);
        break;
      case 'reaction':
        this.createReactionChallenge(cx, cy);
        break;
      case 'wire':
        this.createWireChallenge(cx, cy);
        break;
      case 'code':
        this.createCodeChallenge(cx, cy);
        break;
      default:
        this.createMemoryChallenge(cx, cy);
    }
  }

  // ---- MEMORY SEQUENCE ----
  createMemoryChallenge(cx, cy) {
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
    const colorNames = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
    const sequenceLength = 5;
    const sequence = [];

    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(Phaser.Math.Between(0, 3));
    }

    this.add.text(cx, cy - 160, 'Watch the sequence, then repeat it!', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(101);

    // Create 4 buttons
    const buttons = [];
    const startX = cx - 120;
    const btnSize = 70;

    for (let i = 0; i < 4; i++) {
      const bx = startX + i * 80;
      const btn = this.add.rectangle(bx, cy, btnSize, btnSize, colors[i], 0.3)
        .setDepth(101).setInteractive();
      const label = this.add.text(bx, cy + 50, colorNames[i], {
        fontSize: '10px', fontFamily: 'monospace', color: '#888888',
      }).setOrigin(0.5).setDepth(101);

      buttons.push({ rect: btn, color: colors[i], index: i, label });
    }

    const statusText = this.add.text(cx, cy + 100, 'Watch...', {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffff44',
    }).setOrigin(0.5).setDepth(101);

    // Play sequence
    let showIndex = 0;
    const showNext = () => {
      if (showIndex >= sequence.length) {
        // Player's turn
        statusText.setText('Your turn! Repeat the sequence.');
        this.enableMemoryInput(buttons, sequence, statusText);
        return;
      }

      const btnIdx = sequence[showIndex];
      const btn = buttons[btnIdx];

      // Flash the button
      this.tweens.add({
        targets: btn.rect,
        fillAlpha: 1,
        duration: 400,
        yoyo: true,
        onComplete: () => {
          showIndex++;
          this.time.delayedCall(200, showNext);
        },
      });
    };

    this.time.delayedCall(1000, showNext);
  }

  enableMemoryInput(buttons, sequence, statusText) {
    let inputIndex = 0;

    buttons.forEach(btn => {
      btn.rect.on('pointerdown', () => {
        // Flash
        this.tweens.add({
          targets: btn.rect,
          fillAlpha: 1,
          duration: 200,
          yoyo: true,
        });

        if (btn.index === sequence[inputIndex]) {
          inputIndex++;
          if (inputIndex >= sequence.length) {
            statusText.setText('SUCCESS!').setColor('#44ff44');
            this.time.delayedCall(800, () => this.onComplete(true));
          }
        } else {
          statusText.setText('WRONG! Try again...').setColor('#ff4444');
          inputIndex = 0;
          this.time.delayedCall(1000, () => {
            statusText.setText('Your turn! Repeat the sequence.').setColor('#ffff44');
          });
        }
      });
    });
  }

  // ---- REACTION TEST ----
  createReactionChallenge(cx, cy) {
    this.add.text(cx, cy - 160, 'Press the correct key when it appears! (5 times)', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(101);

    const keys = ['W', 'A', 'S', 'D'];
    let score = 0;
    const target = 5;
    let active = false;
    let currentKey = '';

    const keyDisplay = this.add.text(cx, cy, '', {
      fontSize: '64px', fontFamily: 'monospace', color: '#00ddff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    const statusText = this.add.text(cx, cy + 100, `0 / ${target}`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffff44',
    }).setOrigin(0.5).setDepth(101);

    const showNext = () => {
      if (score >= target) {
        keyDisplay.setText('');
        statusText.setText('SUCCESS!').setColor('#44ff44');
        this.time.delayedCall(800, () => this.onComplete(true));
        return;
      }

      // Brief pause
      keyDisplay.setText('...');
      active = false;

      this.time.delayedCall(Phaser.Math.Between(500, 1500), () => {
        currentKey = keys[Phaser.Math.Between(0, 3)];
        keyDisplay.setText(currentKey).setColor('#00ddff');
        active = true;

        // Time limit per key
        this.time.delayedCall(2000, () => {
          if (active && keyDisplay.text === currentKey) {
            keyDisplay.setText('MISS!').setColor('#ff4444');
            active = false;
            this.time.delayedCall(500, showNext);
          }
        });
      });
    };

    this.input.keyboard.on('keydown', (event) => {
      if (!active) return;
      if (event.key.toUpperCase() === currentKey) {
        score++;
        statusText.setText(`${score} / ${target}`);
        keyDisplay.setText('HIT!').setColor('#44ff44');
        active = false;
        this.time.delayedCall(300, showNext);
      } else {
        keyDisplay.setText('WRONG!').setColor('#ff4444');
        active = false;
        this.time.delayedCall(500, showNext);
      }
    });

    this.time.delayedCall(500, showNext);
  }

  // ---- WIRE MATCHING ----
  createWireChallenge(cx, cy) {
    this.add.text(cx, cy - 170, 'Click matching pairs to connect wires!', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(101);

    const wireColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
    const leftWires = Phaser.Utils.Array.Shuffle([...wireColors]);
    const rightWires = Phaser.Utils.Array.Shuffle([...wireColors]);

    let selected = null;
    let matches = 0;
    const needed = wireColors.length;

    const statusText = this.add.text(cx, cy + 140, `${matches} / ${needed} connected`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffff44',
    }).setOrigin(0.5).setDepth(101);

    const allButtons = [];

    // Left column
    leftWires.forEach((color, i) => {
      const y = cy - 80 + i * 55;
      const btn = this.add.rectangle(cx - 120, y, 60, 40, color, 0.6)
        .setDepth(101).setInteractive();
      btn.setData('color', color);
      btn.setData('side', 'left');
      btn.setData('matched', false);
      allButtons.push(btn);

      btn.on('pointerdown', () => handleClick(btn));
    });

    // Right column
    rightWires.forEach((color, i) => {
      const y = cy - 80 + i * 55;
      const btn = this.add.rectangle(cx + 120, y, 60, 40, color, 0.6)
        .setDepth(101).setInteractive();
      btn.setData('color', color);
      btn.setData('side', 'right');
      btn.setData('matched', false);
      allButtons.push(btn);

      btn.on('pointerdown', () => handleClick(btn));
    });

    const handleClick = (btn) => {
      if (btn.getData('matched')) return;

      if (!selected) {
        selected = btn;
        btn.setStrokeStyle(3, 0xffffff);
      } else {
        if (selected === btn) {
          selected.setStrokeStyle(0);
          selected = null;
          return;
        }

        if (selected.getData('side') !== btn.getData('side') &&
            selected.getData('color') === btn.getData('color')) {
          // Match!
          selected.setAlpha(1);
          btn.setAlpha(1);
          selected.setData('matched', true);
          btn.setData('matched', true);
          selected.setStrokeStyle(2, 0x44ff44);
          btn.setStrokeStyle(2, 0x44ff44);

          // Draw connecting line
          const line = this.add.line(
            0, 0,
            selected.x, selected.y,
            btn.x, btn.y,
            selected.getData('color'), 0.8
          ).setDepth(101).setOrigin(0, 0);

          matches++;
          statusText.setText(`${matches} / ${needed} connected`);

          if (matches >= needed) {
            statusText.setText('SUCCESS!').setColor('#44ff44');
            this.time.delayedCall(800, () => this.onComplete(true));
          }
        } else {
          // No match
          selected.setStrokeStyle(2, 0xff0000);
          btn.setStrokeStyle(2, 0xff0000);
          this.time.delayedCall(500, () => {
            if (!selected.getData('matched')) selected.setStrokeStyle(0);
            if (!btn.getData('matched')) btn.setStrokeStyle(0);
          });
        }
        selected = null;
      }
    };
  }

  // ---- CODE CRACK ----
  createCodeChallenge(cx, cy) {
    const digits = 4;
    const code = [];
    for (let i = 0; i < digits; i++) {
      code.push(Phaser.Math.Between(1, 9));
    }

    // Generate hint
    const hint = `The sum is ${code.reduce((a, b) => a + b, 0)}. First digit is ${code[0]}.`;

    this.add.text(cx, cy - 170, 'Crack the code!', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(101);

    this.add.text(cx, cy - 140, `Hint: ${hint}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffaa00',
    }).setOrigin(0.5).setDepth(101);

    const entry = [];
    const displayBoxes = [];

    for (let i = 0; i < digits; i++) {
      const bx = cx - (digits - 1) * 30 + i * 60;
      const box = this.add.rectangle(bx, cy - 40, 50, 60, 0x333333)
        .setDepth(101).setStrokeStyle(2, 0x00ddff);
      const txt = this.add.text(bx, cy - 40, '_', {
        fontSize: '32px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(0.5).setDepth(101);
      displayBoxes.push({ box, txt });
    }

    const statusText = this.add.text(cx, cy + 60, 'Type the 4-digit code', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffff44',
    }).setOrigin(0.5).setDepth(101);

    const attemptsText = this.add.text(cx, cy + 90, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#888888',
    }).setOrigin(0.5).setDepth(101);

    let attempts = 0;

    this.input.keyboard.on('keydown', (event) => {
      const num = parseInt(event.key);
      if (!isNaN(num) && num >= 1 && num <= 9 && entry.length < digits) {
        entry.push(num);
        displayBoxes[entry.length - 1].txt.setText(num.toString());
      }

      if (event.key === 'Backspace' && entry.length > 0) {
        entry.pop();
        displayBoxes[entry.length].txt.setText('_');
      }

      if (event.key === 'Enter' && entry.length === digits) {
        attempts++;
        let correct = 0;
        let inCode = 0;

        for (let i = 0; i < digits; i++) {
          if (entry[i] === code[i]) {
            correct++;
            displayBoxes[i].box.setStrokeStyle(2, 0x44ff44);
          } else if (code.includes(entry[i])) {
            inCode++;
            displayBoxes[i].box.setStrokeStyle(2, 0xffaa00);
          } else {
            displayBoxes[i].box.setStrokeStyle(2, 0xff4444);
          }
        }

        if (correct === digits) {
          statusText.setText('CRACKED!').setColor('#44ff44');
          this.time.delayedCall(800, () => this.onComplete(true));
        } else {
          attemptsText.setText(
            `Attempt ${attempts}: ${correct} correct, ${inCode} wrong position`
          );

          // Reset after delay
          this.time.delayedCall(1500, () => {
            entry.length = 0;
            displayBoxes.forEach(db => {
              db.txt.setText('_');
              db.box.setStrokeStyle(2, 0x00ddff);
            });
          });
        }
      }
    });
  }
}
