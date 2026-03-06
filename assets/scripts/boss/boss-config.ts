import { Color } from 'cc';

export const BossConfig = {
    moveSpeed: 200,
    keepDistance: 400,
    startDelay: 2,

    dashSpeed: 500,
    dashDuration: 0.18,
    dashCooldown: 1.5,

    /** Random interval range (seconds) between casual dashes */
    casualDashMin: 2,
    casualDashMax: 4,
    /** Distance beyond keepDistance that triggers a chase-dash */
    chaseDashThreshold: 600,

    afterimage: {
        spawnInterval: 0.03,
        fadeDuration: 0.3,
        startOpacity: 130,
        color: new Color(255, 80, 80, 255),
    },

    shooting1: {
        /** Number of bullets per burst */
        bulletCount: 6,
        /** Half-circle arc spread in degrees */
        arcDegrees: 160,
        /** Bullet travel speed (px/s) — slower than character's 300 moveSpeed so they can dodge */
        bulletSpeed: 220,
        /** Time between bursts (seconds) */
        fireCooldown: 3,
    },
};
