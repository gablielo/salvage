import Phaser from 'phaser';
import { MONSTER_PHASES, TILE_SIZE, GAME_TIME, ZONES } from '../config/gameData.js';
import { getZoneCenter } from '../utils/MapGenerator.js';

export default class Monster {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'monster');
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(22, 22);

    this.currentPhase = MONSTER_PHASES[0];
    this.state = 'patrol'; // patrol, chase, sprint, returning
    this.patrolTarget = null;
    this.chaseTarget = null;
    this.stateTimer = 0;
    this.sprintCooldown = 0;
    this.trapCooldown = 0;
    this.teleportCooldown = 0;
    this.traps = [];

    // Zone patrol order
    this.patrolZones = ['junkyard', 'rooftop', 'lab', 'tunnels', 'basement'];
    this.patrolIndex = 0;

    this.pickNextPatrolTarget();
  }

  updatePhase(elapsedPercent) {
    // Find the highest phase we've reached
    let newPhase = MONSTER_PHASES[0];
    for (const phase of MONSTER_PHASES) {
      if (elapsedPercent >= phase.startPercent) {
        newPhase = phase;
      }
    }

    if (newPhase.phase !== this.currentPhase.phase) {
      this.currentPhase = newPhase;
      // Visual feedback for phase change
      this.scene.cameras.main.shake(300, 0.005);

      // Change monster tint based on phase
      const tints = [0xffffff, 0xff6644, 0xff3322, 0xff0000];
      this.sprite.setTint(tints[newPhase.phase - 1]);

      return true; // Phase changed
    }
    return false;
  }

  update(delta, playerPos, playerNoise, elapsedPercent) {
    this.stateTimer -= delta;
    this.sprintCooldown = Math.max(0, this.sprintCooldown - delta);
    this.trapCooldown = Math.max(0, this.trapCooldown - delta);
    this.teleportCooldown = Math.max(0, this.teleportCooldown - delta);

    this.updatePhase(elapsedPercent);

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y, playerPos.x, playerPos.y
    );

    const abilities = this.currentPhase.abilities;
    const speed = this.currentPhase.speed;

    // Detection logic
    const canSeePlayer = dist < 180;
    const canHearPlayer = abilities.includes('hearing') && playerNoise > 0 && dist < playerNoise + 100;

    if (canSeePlayer || canHearPlayer) {
      this.state = 'chase';
      this.chaseTarget = playerPos;

      // Sprint ability
      if (abilities.includes('sprint') && dist < 250 && dist > 100 && this.sprintCooldown <= 0) {
        this.state = 'sprint';
        this.sprintCooldown = 5000;
        this.stateTimer = 1500;
      }

      // Teleport ability
      if (abilities.includes('teleport') && dist > 350 && this.teleportCooldown <= 0) {
        this.teleportNearPlayer(playerPos);
        this.teleportCooldown = 15000;
      }
    } else if (this.state === 'chase' || this.state === 'sprint') {
      // Lost sight — continue toward last known position briefly
      if (this.stateTimer <= 0) {
        this.state = 'patrol';
        this.pickNextPatrolTarget();
      }
    }

    // Place traps
    if (abilities.includes('traps') && this.trapCooldown <= 0 && this.state === 'patrol') {
      this.placeTrap();
      this.trapCooldown = 12000;
    }

    // Movement
    let targetX, targetY, moveSpeed;

    switch (this.state) {
      case 'chase':
        targetX = this.chaseTarget.x;
        targetY = this.chaseTarget.y;
        moveSpeed = speed;
        this.stateTimer = 3000; // Keep chasing for a bit after losing sight
        break;

      case 'sprint':
        targetX = this.chaseTarget.x;
        targetY = this.chaseTarget.y;
        moveSpeed = speed * 1.8;
        if (this.stateTimer <= 0) {
          this.state = 'chase';
        }
        break;

      case 'patrol':
      default:
        if (this.patrolTarget) {
          targetX = this.patrolTarget.x;
          targetY = this.patrolTarget.y;
          moveSpeed = speed * 0.6;

          // Reached patrol target?
          const patrolDist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y, targetX, targetY
          );
          if (patrolDist < 20) {
            this.stateTimer = 2000; // Linger
            this.pickNextPatrolTarget();
          }
        } else {
          moveSpeed = 0;
        }
        break;
    }

    if (targetX !== undefined && moveSpeed > 0) {
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y, targetX, targetY
      );
      this.sprite.setVelocity(
        Math.cos(angle) * moveSpeed,
        Math.sin(angle) * moveSpeed
      );
    } else {
      this.sprite.setVelocity(0, 0);
    }
  }

  pickNextPatrolTarget() {
    this.patrolIndex = (this.patrolIndex + 1) % this.patrolZones.length;
    const zoneId = this.patrolZones[this.patrolIndex];
    const center = getZoneCenter(zoneId);
    // Add some randomness
    this.patrolTarget = {
      x: center.x + Phaser.Math.Between(-50, 50),
      y: center.y + Phaser.Math.Between(-50, 50),
    };
  }

  teleportNearPlayer(playerPos) {
    // Teleport to a position near but not on top of the player
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 100;
    this.sprite.setPosition(
      playerPos.x + Math.cos(angle) * dist,
      playerPos.y + Math.sin(angle) * dist
    );
    this.state = 'chase';
    this.chaseTarget = playerPos;

    // Visual effect
    this.scene.cameras.main.flash(100, 80, 0, 0);
  }

  placeTrap() {
    const trap = this.scene.physics.add.sprite(
      this.sprite.x, this.sprite.y, 'trap'
    );
    trap.setDepth(5);
    trap.setAlpha(0.5);

    // Pulse animation
    this.scene.tweens.add({
      targets: trap,
      alpha: 0.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.traps.push(trap);

    // Remove old traps (max 5)
    if (this.traps.length > 5) {
      const old = this.traps.shift();
      old.destroy();
    }

    return trap;
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy() {
    this.traps.forEach(t => t.destroy());
    this.sprite.destroy();
  }
}
