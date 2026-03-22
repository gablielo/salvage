import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_SPRINT_SPEED, TILE_SIZE } from '../config/gameData.js';
import { getZoneAt } from '../utils/MapGenerator.js';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player_down');
    this.facing = 'down';
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(18, 18);

    this.isSprinting = false;
    this.lives = 3;
    this.isStunned = false;
    this.stunTimer = 0;
    this.isInChallenge = false;

    // Footstep sound radius (for monster hearing)
    this.noiseRadius = 0;

    // Setup keys
    this.keys = {
      up: scene.input.keyboard.addKey('W'),
      down: scene.input.keyboard.addKey('S'),
      left: scene.input.keyboard.addKey('A'),
      right: scene.input.keyboard.addKey('D'),
      arrowUp: scene.input.keyboard.addKey('UP'),
      arrowDown: scene.input.keyboard.addKey('DOWN'),
      arrowLeft: scene.input.keyboard.addKey('LEFT'),
      arrowRight: scene.input.keyboard.addKey('RIGHT'),
      sprint: scene.input.keyboard.addKey('SHIFT'),
      interact: scene.input.keyboard.addKey('E'),
      blueprint: scene.input.keyboard.addKey('TAB'),
    };

    // Prevent tab from switching focus
    scene.input.keyboard.addCapture('TAB');
  }

  update(delta) {
    if (this.isStunned) {
      this.stunTimer -= delta;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.sprite.setAlpha(1);
      } else {
        // Flash while stunned
        this.sprite.setAlpha(Math.sin(this.stunTimer * 0.01) * 0.5 + 0.5);
        this.sprite.setVelocity(0, 0);
        return;
      }
    }

    if (this.isInChallenge) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.keys.left.isDown || this.keys.arrowLeft.isDown) vx = -1;
    else if (this.keys.right.isDown || this.keys.arrowRight.isDown) vx = 1;

    if (this.keys.up.isDown || this.keys.arrowUp.isDown) vy = -1;
    else if (this.keys.down.isDown || this.keys.arrowDown.isDown) vy = 1;

    this.isSprinting = this.keys.sprint.isDown && (vx !== 0 || vy !== 0);
    const speed = this.isSprinting ? PLAYER_SPRINT_SPEED : PLAYER_SPEED;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    this.sprite.setVelocity(vx * speed, vy * speed);

    // Direction — horizontal takes priority on diagonals
    let newFacing = this.facing;
    if (vx < 0) newFacing = 'left';
    else if (vx > 0) newFacing = 'right';
    else if (vy < 0) newFacing = 'up';
    else if (vy > 0) newFacing = 'down';

    if (newFacing !== this.facing) {
      this.facing = newFacing;
      this.sprite.setTexture('player_' + this.facing);
    }

    // Sprint tint
    if (this.isSprinting) {
      this.sprite.setTint(0xaaffcc);
    } else {
      this.sprite.clearTint();
    }

    // Noise for monster hearing
    if (vx === 0 && vy === 0) {
      this.noiseRadius = 0;
    } else if (this.isSprinting) {
      this.noiseRadius = 200;
    } else {
      this.noiseRadius = 80;
    }
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  getCurrentZone() {
    return getZoneAt(this.sprite.x, this.sprite.y);
  }

  stun(duration = 2000) {
    this.isStunned = true;
    this.stunTimer = duration;
    this.sprite.setVelocity(0, 0);
  }

  hit() {
    this.lives--;
    this.stun(2000);

    // Knockback flash
    this.scene.cameras.main.shake(200, 0.01);
    this.scene.cameras.main.flash(200, 255, 0, 0);

    return this.lives <= 0;
  }

  destroy() {
    this.sprite.destroy();
  }
}
