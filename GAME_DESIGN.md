# Salvage - Game Design Document

## Concept
Fix a broken robot by collecting materials from dangerous zones before time runs out — while an evolving monster hunts you down.

## Core Loop
1. Read blueprint → see what materials you need
2. Decode clues → figure out which zone has each material
3. Travel to zone → navigate the map
4. Complete challenge → earn the material under pressure
5. Evade the monster → it roams and evolves over time
6. Return & repair → bring all materials back to the robot before the clock hits zero

## Mechanics

### Blueprint & Materials
- 5 materials required: Power Core, Circuit Board, Hydraulic Arm, Sensor Array, Fuel Cell
- Each material is in a specific zone, hinted at by a cryptic clue on the blueprint
- Collecting a material requires completing a mini-challenge

### Zones
- **Central Hub** — Starting area, robot location
- **Junkyard** — Rusted scrap heaps (Power Core)
- **Rooftop** — High vantage point (Sensor Array)
- **Abandoned Lab** — Broken equipment (Circuit Board)
- **Flooded Basement** — Dark and wet (Hydraulic Arm)
- **Underground Tunnels** — Maze-like passages (Fuel Cell)

### Monster Phases (time-based escalation)
| Phase | Time Elapsed | Abilities |
|-------|-------------|-----------|
| 1 | 0–25% | Slow patrol, basic chase |
| 2 | 25–50% | Sprint bursts, hears running |
| 3 | 50–75% | Sets traps, blocks corridors |
| 4 | 75–100% | Teleports to nearby zones, heightened senses |

### Challenges (mini-games)
- **Memory Sequence** — Repeat a pattern of colors/sounds
- **Quick Wire** — Connect matching wire pairs before time runs out
- **Reaction Test** — Hit the right keys as they flash on screen
- **Code Crack** — Enter the correct sequence based on a hint

### Win/Lose
- **Win:** All 5 materials collected and returned to robot before timer expires
- **Lose:** Timer runs out, or caught by monster 3 times

## Tech
- Phaser 3 (JavaScript)
- Top-down 2D, pixel-art style
- Vite dev server
