import { Color } from 'cc';
import { BossPhase } from './boss-phase';

export const BossConfig = {
    moveSpeed: 200,
    keepDistance: 400,
    startDelay: 2,

    dashSpeed: 700,
    dashDuration: 0.3,

    afterimage: {
        spawnInterval: 0.03,
        fadeDuration: 0.3,
        startOpacity: 130,
        color: new Color(255, 80, 80, 255),
    },

    hitEffect: {
        scaleTo: 1.5,
        duration: 0.25,
        color: new Color(255, 80, 80, 200),
    },

    shooting: {
        normal: {
            bulletCount: 6,
            arcDegrees: 160,
            speed: 220,
        },
        crazyFan: {
            bulletCount: 18,
            arcDegrees: 300,
            speed: 200,
        },
        crazySpiral: {
            bulletCount: 18,
            spiralDuration: 0.6,
            degPerBullet: 20,
            speed: 180,
        },
    },

    phases: {
        [BossPhase.Phase1]: {
            dashCooldown: 1.5,
            casualDashMin: 2,
            casualDashMax: 4,
            chaseDashThreshold: 600,
            fireCooldown: 3,
            patterns: ['normal'] as const,
        },
        [BossPhase.Phase2]: {
            dashCooldown: 2.0,
            casualDashMin: 2.5,
            casualDashMax: 5,
            chaseDashThreshold: 600,
            fireCooldown: 2.5,
            patterns: ['normal', 'crazyFan'] as const,
        },
        [BossPhase.Phase3]: {
            dashCooldown: 0.8,
            casualDashMin: 0.8,
            casualDashMax: 1.5,
            chaseDashThreshold: 400,
            fireCooldown: 1.8,
            patterns: ['crazyFan', 'crazySpiral'] as const,
        },
    },
};
