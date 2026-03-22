import Phaser from 'phaser';
import { MATERIALS, GAME_TIME, MONSTER_PHASES } from '../config/gameData.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const padding = 16;
    this.showingBlueprint = false;

    // --- TOP BAR ---

    // Timer
    this.timerText = this.add.text(padding, padding, this.formatTime(GAME_TIME), {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Lives
    this.livesText = this.add.text(padding, padding + 36, 'LIVES: ♥♥♥', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ff4444',
    });

    // Zone name (top center)
    this.zoneText = this.add.text(this.cameras.main.centerX, padding, 'Central Hub', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setOrigin(0.5, 0);

    // Monster phase indicator (top right)
    this.phaseText = this.add.text(this.cameras.main.width - padding, padding, 'THREAT: LOW', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#44cc44',
    }).setOrigin(1, 0);

    // Materials collected (top right, below phase)
    this.materialsText = this.add.text(this.cameras.main.width - padding, padding + 24, 'PARTS: 0/5', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00ddff',
    }).setOrigin(1, 0);

    // --- INTERACT HINT ---
    this.interactHint = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 60, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffff44',
      backgroundColor: '#000000aa',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setAlpha(0);

    // --- BLUEPRINT OVERLAY ---
    this.blueprintGroup = this.add.group();
    this.createBlueprintOverlay();

    // --- EVENTS ---
    this.gameScene.events.on('timerUpdate', this.updateTimer, this);
    this.gameScene.events.on('materialCollected', this.onMaterialCollected, this);
    this.gameScene.events.on('playerHit', this.updateLives, this);
    this.gameScene.events.on('zoneChange', this.updateZone, this);
    this.gameScene.events.on('toggleBlueprint', this.toggleBlueprint, this);

    // Cleanup on scene shutdown
    this.events.on('shutdown', () => {
      this.gameScene.events.off('timerUpdate', this.updateTimer, this);
      this.gameScene.events.off('materialCollected', this.onMaterialCollected, this);
      this.gameScene.events.off('playerHit', this.updateLives, this);
      this.gameScene.events.off('zoneChange', this.updateZone, this);
      this.gameScene.events.off('toggleBlueprint', this.toggleBlueprint, this);
    });

    // Proximity hint check
    this.time.addEvent({
      delay: 200,
      callback: this.checkProximity,
      callbackScope: this,
      loop: true,
    });
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  updateTimer(timeRemaining) {
    this.timerText.setText(this.formatTime(timeRemaining));

    // Color changes
    if (timeRemaining <= 30) {
      this.timerText.setColor('#ff0000');
      // Pulse effect
      if (timeRemaining <= 10) {
        this.tweens.add({
          targets: this.timerText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 200,
          yoyo: true,
        });
      }
    } else if (timeRemaining <= 60) {
      this.timerText.setColor('#ffaa00');
    } else {
      this.timerText.setColor('#ffffff');
    }

    // Update monster phase display
    const elapsed = 1 - (timeRemaining / GAME_TIME);
    let phase = MONSTER_PHASES[0];
    for (const p of MONSTER_PHASES) {
      if (elapsed >= p.startPercent) phase = p;
    }

    const threatColors = ['#44cc44', '#ffaa00', '#ff6644', '#ff0000'];
    const threatLabels = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];
    this.phaseText.setText(`THREAT: ${threatLabels[phase.phase - 1]}`);
    this.phaseText.setColor(threatColors[phase.phase - 1]);
  }

  onMaterialCollected(material) {
    const count = this.gameScene.collectedMaterials.length;
    this.materialsText.setText(`PARTS: ${count}/5`);

    // Flash notification
    const notif = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      `✓ ${material.name} collected!`,
      {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#44ff44',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: notif,
      y: notif.y - 60,
      alpha: 0,
      duration: 2000,
      onComplete: () => notif.destroy(),
    });

    // Update blueprint if showing
    this.updateBlueprintItems();

    // Check if all collected
    if (count === MATERIALS.length) {
      const returnHint = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 20,
        'All parts collected! Return to the robot and press E!',
        {
          fontSize: '18px',
          fontFamily: 'monospace',
          color: '#00ddff',
          fontStyle: 'bold',
          backgroundColor: '#000000cc',
          padding: { x: 12, y: 8 },
        }
      ).setOrigin(0.5);

      this.tweens.add({
        targets: returnHint,
        alpha: 0,
        duration: 5000,
        onComplete: () => returnHint.destroy(),
      });
    }
  }

  updateLives(lives) {
    const hearts = '♥'.repeat(lives) + '♡'.repeat(3 - lives);
    this.livesText.setText(`LIVES: ${hearts}`);
  }

  updateZone(zoneName) {
    this.zoneText.setText(zoneName);
    this.tweens.add({
      targets: this.zoneText,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
    });
  }

  checkProximity() {
    if (!this.gameScene || this.gameScene.gameOver || this.gameScene.challengeActive) {
      this.interactHint.setAlpha(0);
      return;
    }

    const playerPos = this.gameScene.player.getPosition();
    let hint = '';

    // Check materials
    for (const matSprite of this.gameScene.materialSprites) {
      const dist = Phaser.Math.Distance.Between(
        playerPos.x, playerPos.y, matSprite.x, matSprite.y
      );
      if (dist < 50) {
        const matId = matSprite.getData('materialId');
        const mat = MATERIALS.find(m => m.id === matId);
        hint = `Press E to collect ${mat.name}`;
        break;
      }
    }

    // Check robot
    if (!hint) {
      const robotDist = Phaser.Math.Distance.Between(
        playerPos.x, playerPos.y,
        this.gameScene.robot.x, this.gameScene.robot.y
      );
      if (robotDist < 60) {
        const count = this.gameScene.collectedMaterials.length;
        if (count === MATERIALS.length) {
          hint = 'Press E to repair the robot!';
        } else {
          hint = `Robot needs ${MATERIALS.length - count} more parts`;
        }
      }
    }

    if (hint) {
      this.interactHint.setText(hint).setAlpha(1);
    } else {
      this.interactHint.setAlpha(0);
    }
  }

  createBlueprintOverlay() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Background
    this.bpBg = this.add.rectangle(cx, cy, 500, 420, 0x111122, 0.95)
      .setStrokeStyle(2, 0x00ddff);
    this.blueprintGroup.add(this.bpBg);

    // Title
    this.bpTitle = this.add.text(cx, cy - 180, '[ BLUEPRINT ]', {
      fontSize: '22px', fontFamily: 'monospace', color: '#00ddff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.blueprintGroup.add(this.bpTitle);

    // Material list
    this.bpItems = [];
    MATERIALS.forEach((mat, i) => {
      const y = cy - 120 + i * 60;

      const nameText = this.add.text(cx - 200, y, `${mat.icon}  ${mat.name}`, {
        fontSize: '16px', fontFamily: 'monospace', color: '#ffffff',
      });
      const clueText = this.add.text(cx - 200, y + 20, `"${mat.clue}"`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#666666',
        wordWrap: { width: 440 },
      });
      const statusIcon = this.add.text(cx + 210, y + 8, '○', {
        fontSize: '20px', fontFamily: 'monospace', color: '#555555',
      }).setOrigin(0.5);

      this.blueprintGroup.add(nameText);
      this.blueprintGroup.add(clueText);
      this.blueprintGroup.add(statusIcon);

      this.bpItems.push({ nameText, clueText, statusIcon, matId: mat.id });
    });

    // Hint
    this.bpHint = this.add.text(cx, cy + 190, 'Press TAB to close', {
      fontSize: '12px', fontFamily: 'monospace', color: '#555555',
    }).setOrigin(0.5);
    this.blueprintGroup.add(this.bpHint);

    // Hide by default
    this.blueprintGroup.setVisible(false);
    this.bpBg.setVisible(false);
    this.bpTitle.setVisible(false);
    this.bpHint.setVisible(false);
  }

  updateBlueprintItems() {
    const collected = this.gameScene.collectedMaterials;
    this.bpItems.forEach(item => {
      if (collected.includes(item.matId)) {
        item.statusIcon.setText('✓').setColor('#44ff44');
        item.nameText.setColor('#44ff44');
      }
    });
  }

  toggleBlueprint() {
    this.showingBlueprint = !this.showingBlueprint;
    this.updateBlueprintItems();

    const visible = this.showingBlueprint;
    this.blueprintGroup.setVisible(visible);
    this.bpBg.setVisible(visible);
    this.bpTitle.setVisible(visible);
    this.bpHint.setVisible(visible);
  }
}
