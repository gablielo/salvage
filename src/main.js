import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ChallengeScene from './scenes/ChallengeScene.js';
import HUDScene from './scenes/HUDScene.js';
import WinScene from './scenes/WinScene.js';
import LoseScene from './scenes/LoseScene.js';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './config/gameData.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: document.body,
  backgroundColor: '#0a0a0a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, ChallengeScene, HUDScene, WinScene, LoseScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
};

new Phaser.Game(config);
