// Game configuration and data

export const TILE_SIZE = 32;
export const MAP_COLS = 50;
export const MAP_ROWS = 40;

export const GAME_TIME = 300; // 5 minutes in seconds

export const ZONES = {
  hub:      { id: 'hub',      name: 'Central Hub',          col: 19, row: 16, w: 12, h: 8,  color: 0x3d3d3d, floorColor: 0x5a5a5a },
  junkyard: { id: 'junkyard', name: 'Junkyard',             col: 2,  row: 2,  w: 12, h: 8,  color: 0x6b3a1f, floorColor: 0x8B5E3C },
  rooftop:  { id: 'rooftop',  name: 'Rooftop',              col: 19, row: 2,  w: 12, h: 8,  color: 0x4a5568, floorColor: 0x6B7B8D },
  lab:      { id: 'lab',      name: 'Abandoned Lab',         col: 36, row: 2,  w: 12, h: 8,  color: 0x1a3a5c, floorColor: 0x2A5A8C },
  basement: { id: 'basement', name: 'Flooded Basement',      col: 2,  row: 30, w: 12, h: 8,  color: 0x1a3a4a, floorColor: 0x2A5A6A },
  tunnels:  { id: 'tunnels',  name: 'Underground Tunnels',   col: 36, row: 30, w: 12, h: 8,  color: 0x1a1a2e, floorColor: 0x2A2A4E },
};

export const CORRIDORS = [
  // Top rooms to hub (vertical)
  { from: 'junkyard', to: 'hub',     type: 'L', midCol: 8,  midRow: 20 },
  { from: 'rooftop',  to: 'hub',     type: 'V' },
  { from: 'lab',      to: 'hub',     type: 'L', midCol: 42, midRow: 20 },
  // Hub to bottom rooms (vertical)
  { from: 'hub',      to: 'basement', type: 'L', midCol: 8,  midRow: 24 },
  { from: 'hub',      to: 'tunnels',  type: 'L', midCol: 42, midRow: 24 },
];

export const MATERIALS = [
  {
    id: 'power_core',
    name: 'Power Core',
    zone: 'junkyard',
    clue: 'Among rusted metal and forgotten machines, energy still hums beneath the scrap.',
    challenge: 'memory',
    icon: '⚡',
  },
  {
    id: 'sensor_array',
    name: 'Sensor Array',
    zone: 'rooftop',
    clue: 'High above, where the wind carries signals, eyes that see without seeing await.',
    challenge: 'reaction',
    icon: '📡',
  },
  {
    id: 'circuit_board',
    name: 'Circuit Board',
    zone: 'lab',
    clue: 'Where scientists once worked, pathways of logic still trace through the silence.',
    challenge: 'wire',
    icon: '🔌',
  },
  {
    id: 'hydraulic_arm',
    name: 'Hydraulic Arm',
    zone: 'basement',
    clue: 'In flooded depths where water drips, mechanical strength rusts but endures.',
    challenge: 'code',
    icon: '🦾',
  },
  {
    id: 'fuel_cell',
    name: 'Fuel Cell',
    zone: 'tunnels',
    clue: 'Deep underground where no light reaches, raw power waits in the dark passages.',
    challenge: 'memory',
    icon: '🔋',
  },
];

export const MONSTER_PHASES = [
  {
    phase: 1,
    startPercent: 0,
    speed: 60,
    description: 'Slow patrol',
    abilities: ['patrol'],
  },
  {
    phase: 2,
    startPercent: 0.25,
    speed: 90,
    description: 'Sprint bursts, hears running',
    abilities: ['patrol', 'sprint', 'hearing'],
  },
  {
    phase: 3,
    startPercent: 0.50,
    speed: 110,
    description: 'Sets traps, blocks paths',
    abilities: ['patrol', 'sprint', 'hearing', 'traps'],
  },
  {
    phase: 4,
    startPercent: 0.75,
    speed: 140,
    description: 'Teleport, heightened senses',
    abilities: ['patrol', 'sprint', 'hearing', 'traps', 'teleport'],
  },
];

export const PLAYER_SPEED = 150;
export const PLAYER_SPRINT_SPEED = 220;
