import Phaser from 'phaser';
import { TILE_SIZE, MAP_COLS, MAP_ROWS, ZONES, MATERIALS, GAME_TIME } from '../config/gameData.js';
import { generateMap, getZoneCenter, getZoneAt, WALL, FLOOR } from '../utils/MapGenerator.js';
import Player from '../entities/Player.js';
import Monster from '../entities/Monster.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // Game state
    this.collectedMaterials = [];
    this.timeRemaining = GAME_TIME;
    this.gameOver = false;
    this.isPaused = false;
    this.showingBlueprint = false;
    this.challengeActive = false;

    // Generate and render map
    this.mapGrid = generateMap();
    this.createTilemap();

    // Place robot in hub center
    const hubCenter = getZoneCenter('hub');
    this.robot = this.physics.add.staticSprite(hubCenter.x, hubCenter.y, 'robot');
    this.robot.setDepth(5);
    this.robot.setScale(2);

    // Create player in hub
    this.player = new Player(this, hubCenter.x, hubCenter.y - 50);

    // Create monster in a far zone
    const monsterStart = getZoneCenter('tunnels');
    this.monster = new Monster(this, monsterStart.x, monsterStart.y);

    // Place materials in their zones
    this.materialSprites = [];
    this.createMaterials();

    // Collisions
    this.physics.add.collider(this.player.sprite, this.wallLayer);
    this.physics.add.collider(this.monster.sprite, this.wallLayer);

    // Player-monster overlap
    this.physics.add.overlap(
      this.player.sprite,
      this.monster.sprite,
      this.onMonsterCatch,
      null,
      this
    );

    // Player-trap overlap
    this.trapOverlap = null;
    this.updateTrapOverlaps();

    // Camera follow
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBackgroundColor('#0a0a0a');

    // World bounds
    this.physics.world.setBounds(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

    // Launch HUD
    this.scene.launch('HUD', {
      gameScene: this,
    });

    // Timer event
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true,
    });

    // Interact key
    this.player.keys.interact.on('down', () => this.tryInteract());
    this.player.keys.blueprint.on('down', () => this.toggleBlueprint());

    // Zone label
    this.currentZoneText = '';

    // Minimap indicators
    this.createZoneLabels();
  }

  createTilemap() {
    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: MAP_COLS,
      height: MAP_ROWS,
    });

    // Create tileset from graphics
    const tilesetCanvas = document.createElement('canvas');
    tilesetCanvas.width = TILE_SIZE * 10;
    tilesetCanvas.height = TILE_SIZE;
    const ctx = tilesetCanvas.getContext('2d');

    // Tile 0: Wall
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#222222';
    ctx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Tile 1: Generic floor
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);

    // Tiles 2-7: Zone-specific floors
    const zoneOrder = ['hub', 'junkyard', 'rooftop', 'lab', 'basement', 'tunnels'];
    zoneOrder.forEach((zId, i) => {
      const zone = ZONES[zId];
      const color = zone.floorColor;
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      const x = (i + 2) * TILE_SIZE;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, 0, TILE_SIZE, TILE_SIZE);
      // Grid lines
      ctx.strokeStyle = `rgba(${Math.min(255, r + 20)},${Math.min(255, g + 20)},${Math.min(255, b + 20)},0.3)`;
      ctx.strokeRect(x, 0, TILE_SIZE, TILE_SIZE);
    });

    // Add tileset texture
    this.textures.addCanvas('tiles', tilesetCanvas);
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0);

    // Create floor layer
    const floorLayer = map.createBlankLayer('floor', tileset, 0, 0);
    // Create wall layer
    this.wallLayer = map.createBlankLayer('walls', tileset, 0, 0);

    const zoneIdToTile = { hub: 2, junkyard: 3, rooftop: 4, lab: 5, basement: 6, tunnels: 7 };

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (this.mapGrid[row][col] === FLOOR) {
          // Determine which zone this tile belongs to
          const zone = getZoneAt(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2);
          const tileIndex = zone ? (zoneIdToTile[zone.id] || 1) : 1;
          floorLayer.putTileAt(tileIndex, col, row);
        } else {
          // Check if wall is adjacent to floor (visible wall) or deep wall
          const isEdge = this.isAdjacentToFloor(row, col);
          if (isEdge) {
            this.wallLayer.putTileAt(0, col, row);
          }
          // Deep walls just stay empty (black background)
        }
      }
    }

    this.wallLayer.setCollisionByExclusion([-1]);
  }

  isAdjacentToFloor(row, col) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
          if (this.mapGrid[nr][nc] === FLOOR) return true;
        }
      }
    }
    return false;
  }

  createMaterials() {
    MATERIALS.forEach(mat => {
      if (this.collectedMaterials.includes(mat.id)) return;

      const center = getZoneCenter(mat.zone);
      // Offset from center so it's findable
      const x = center.x + Phaser.Math.Between(-40, 40);
      const y = center.y + Phaser.Math.Between(-40, 40);

      const sprite = this.physics.add.staticSprite(x, y, 'material');
      sprite.setDepth(6);
      sprite.setData('materialId', mat.id);

      // Glow effect
      this.tweens.add({
        targets: sprite,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      this.materialSprites.push(sprite);
    });
  }

  createZoneLabels() {
    // Add zone name text at center of each zone
    for (const zone of Object.values(ZONES)) {
      const center = getZoneCenter(zone.id);
      this.add.text(center.x, center.y - zone.h * TILE_SIZE / 2 + 10, zone.name, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffffff',
        alpha: 0.3,
      }).setOrigin(0.5).setDepth(1);
    }
  }

  tryInteract() {
    if (this.challengeActive || this.gameOver) return;

    const playerPos = this.player.getPosition();

    // Check for nearby materials
    for (let i = this.materialSprites.length - 1; i >= 0; i--) {
      const matSprite = this.materialSprites[i];
      const dist = Phaser.Math.Distance.Between(
        playerPos.x, playerPos.y, matSprite.x, matSprite.y
      );

      if (dist < 40) {
        const matId = matSprite.getData('materialId');
        const material = MATERIALS.find(m => m.id === matId);

        // Start challenge
        this.startChallenge(material, matSprite, i);
        return;
      }
    }

    // Check if near robot with all materials
    const robotDist = Phaser.Math.Distance.Between(
      playerPos.x, playerPos.y, this.robot.x, this.robot.y
    );

    if (robotDist < 50 && this.collectedMaterials.length === MATERIALS.length) {
      this.winGame();
    }
  }

  startChallenge(material, matSprite, spriteIndex) {
    this.challengeActive = true;
    this.player.isInChallenge = true;

    this.scene.launch('Challenge', {
      material,
      onComplete: (success) => {
        this.challengeActive = false;
        this.player.isInChallenge = false;

        if (success) {
          this.collectedMaterials.push(material.id);
          matSprite.destroy();
          this.materialSprites.splice(spriteIndex, 1);

          // Notify HUD
          this.events.emit('materialCollected', material);
        }

        this.scene.stop('Challenge');
      },
    });
  }

  toggleBlueprint() {
    this.events.emit('toggleBlueprint');
  }

  tickTimer() {
    if (this.gameOver || this.isPaused) return;

    this.timeRemaining--;
    this.events.emit('timerUpdate', this.timeRemaining);

    if (this.timeRemaining <= 0) {
      this.loseGame('time');
    }
  }

  onMonsterCatch() {
    if (this.gameOver || this.player.isStunned || this.challengeActive) return;

    const dead = this.player.hit();
    this.events.emit('playerHit', this.player.lives);

    if (dead) {
      this.loseGame('caught');
    } else {
      // Push player away from monster
      const angle = Phaser.Math.Angle.Between(
        this.monster.sprite.x, this.monster.sprite.y,
        this.player.sprite.x, this.player.sprite.y
      );
      this.player.sprite.setPosition(
        this.player.sprite.x + Math.cos(angle) * 60,
        this.player.sprite.y + Math.sin(angle) * 60
      );
    }
  }

  onTrapHit(playerSprite, trapSprite) {
    if (this.player.isStunned) return;
    this.player.stun(1500);
    trapSprite.destroy();

    // Remove from monster's trap list
    const idx = this.monster.traps.indexOf(trapSprite);
    if (idx !== -1) this.monster.traps.splice(idx, 1);
  }

  updateTrapOverlaps() {
    // Refresh trap overlaps periodically
    this.monster.traps.forEach(trap => {
      if (!trap.getData('hasOverlap')) {
        this.physics.add.overlap(
          this.player.sprite, trap,
          this.onTrapHit, null, this
        );
        trap.setData('hasOverlap', true);
      }
    });
  }

  winGame() {
    this.gameOver = true;
    this.timerEvent.destroy();
    this.scene.stop('HUD');
    this.scene.start('Win', { timeRemaining: this.timeRemaining });
  }

  loseGame(reason) {
    this.gameOver = true;
    this.timerEvent.destroy();
    this.scene.stop('HUD');
    this.scene.start('Lose', { reason, materialsCollected: this.collectedMaterials.length });
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.player.update(delta);

    const elapsedPercent = 1 - (this.timeRemaining / GAME_TIME);
    const playerPos = this.player.getPosition();

    this.monster.update(delta, playerPos, this.player.noiseRadius, elapsedPercent);

    // Update trap overlaps
    this.updateTrapOverlaps();

    // Update current zone display
    const zone = this.player.getCurrentZone();
    const zoneName = zone ? zone.name : 'Corridor';
    if (zoneName !== this.currentZoneText) {
      this.currentZoneText = zoneName;
      this.events.emit('zoneChange', zoneName);
    }
  }
}
