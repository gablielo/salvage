import { TILE_SIZE, MAP_COLS, MAP_ROWS, ZONES, CORRIDORS } from '../config/gameData.js';

// Tile types
export const WALL = 0;
export const FLOOR = 1;

export function generateMap() {
  // Initialize grid with walls
  const grid = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(WALL));

  // Carve out rooms
  for (const zone of Object.values(ZONES)) {
    for (let r = zone.row; r < zone.row + zone.h; r++) {
      for (let c = zone.col; c < zone.col + zone.w; c++) {
        if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
          grid[r][c] = FLOOR;
        }
      }
    }
  }

  // Carve corridors
  const CORRIDOR_WIDTH = 3;
  const half = Math.floor(CORRIDOR_WIDTH / 2);

  for (const corr of CORRIDORS) {
    const fromZone = ZONES[corr.from];
    const toZone = ZONES[corr.to];

    const fromCenterCol = Math.floor(fromZone.col + fromZone.w / 2);
    const fromCenterRow = Math.floor(fromZone.row + fromZone.h / 2);
    const toCenterCol = Math.floor(toZone.col + toZone.w / 2);
    const toCenterRow = Math.floor(toZone.row + toZone.h / 2);

    if (corr.type === 'V') {
      // Straight vertical corridor
      const col = fromCenterCol;
      const startRow = Math.min(fromCenterRow, toCenterRow);
      const endRow = Math.max(fromCenterRow, toCenterRow);
      for (let r = startRow; r <= endRow; r++) {
        for (let dc = -half; dc <= half; dc++) {
          const c = col + dc;
          if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
            grid[r][c] = FLOOR;
          }
        }
      }
    } else if (corr.type === 'L') {
      // L-shaped corridor: go vertical to midRow, then horizontal to target col, then vertical to target
      const midCol = corr.midCol || fromCenterCol;
      const midRow = corr.midRow || fromCenterRow;

      // Vertical segment from source to mid
      const vStart = Math.min(fromCenterRow, midRow);
      const vEnd = Math.max(fromCenterRow, midRow);
      for (let r = vStart; r <= vEnd; r++) {
        for (let dc = -half; dc <= half; dc++) {
          const c = fromCenterCol + dc;
          if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
            grid[r][c] = FLOOR;
          }
        }
      }

      // Horizontal segment from source col to target col at midRow
      const hStart = Math.min(fromCenterCol, toCenterCol);
      const hEnd = Math.max(fromCenterCol, toCenterCol);
      for (let c = hStart; c <= hEnd; c++) {
        for (let dr = -half; dr <= half; dr++) {
          const r = midRow + dr;
          if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
            grid[r][c] = FLOOR;
          }
        }
      }

      // Vertical segment from midRow at target col to target center
      const v2Start = Math.min(midRow, toCenterRow);
      const v2End = Math.max(midRow, toCenterRow);
      for (let r = v2Start; r <= v2End; r++) {
        for (let dc = -half; dc <= half; dc++) {
          const c = toCenterCol + dc;
          if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
            grid[r][c] = FLOOR;
          }
        }
      }
    }
  }

  return grid;
}

export function getZoneCenter(zoneId) {
  const zone = ZONES[zoneId];
  return {
    x: (zone.col + zone.w / 2) * TILE_SIZE,
    y: (zone.row + zone.h / 2) * TILE_SIZE,
  };
}

export function getZoneAt(worldX, worldY) {
  const col = Math.floor(worldX / TILE_SIZE);
  const row = Math.floor(worldY / TILE_SIZE);

  for (const zone of Object.values(ZONES)) {
    if (col >= zone.col && col < zone.col + zone.w &&
        row >= zone.row && row < zone.row + zone.h) {
      return zone;
    }
  }
  return null;
}
