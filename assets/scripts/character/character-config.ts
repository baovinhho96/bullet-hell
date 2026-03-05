import { Color } from 'cc';

export const CharacterConfig = {
    moveSpeed: 300,
    dashSpeed: 600,
    dashDuration: 0.15,
    dashCooldown: 0.8,

    bounds: {
        minX: -440,
        maxX: 440,
        minY: -280,
        maxY: 280,
    },

    shooting: {
        bulletSpeed: 800,
        fireRate: 0.2,
        attackRange: 400,
        hitEffect: {
            scaleTo: 1.2,
            duration: 0.2,
            color: new Color(255, 200, 50, 200),
        },
    },

    afterimage: {
        spawnInterval: 0.03,
        fadeDuration: 0.25,
        startOpacity: 150,
        color: new Color(100, 180, 255, 255),
    },
};
