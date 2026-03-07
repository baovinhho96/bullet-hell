# BulletHell2D

A 2D bullet-hell boss fight game built with Cocos Creator.

## Gameplay

- Dodge waves of bullet patterns fired by the boss
- Shoot back to deal damage and progress through boss phases
- Dash to evade with afterimage effects
- Defeat the boss to win

## Tech Stack

- **Engine:** Cocos Creator 3.7.4
- **Language:** TypeScript
- **Rendering:** 2D sprites with custom shaders (health bar)

## Project Structure

```
assets/scripts/
├── boss/          # Boss movement, shooting, phases, config
├── player/        # Player movement, shooting, AI, config
├── combat/        # Health, health bar, combat manager, game state
├── sound/         # Sound manager and config
├── ui/            # Start, game over, victory popups
└── utils/         # Object pool, arena bounds, dash afterimage, hit effect
```

## Features

- Multi-phase boss with varied bullet patterns
- Player dash with afterimage effect
- Object pooling for bullets
- Health bar with custom shader
- Sound system with BGM, SFX, and volume fade
- Player AI and demo mode
