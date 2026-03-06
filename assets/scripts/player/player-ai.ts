import { Vec3, Node } from 'cc';
import { BossBullet } from '../boss/boss-bullet';
import { BossPhase } from '../boss/boss-phase';

const NUM_DIRECTIONS = 16;
const ANGLE_STEP = (Math.PI * 2) / NUM_DIRECTIONS;
const LOOKAHEAD_TIME = 0.35;
const DANGER_RADIUS = 100;
const DANGER_RADIUS_SQ = DANGER_RADIUS * DANGER_RADIUS;
const CLOSE_DANGER_RADIUS = 60;
const CLOSE_DANGER_RADIUS_SQ = CLOSE_DANGER_RADIUS * CLOSE_DANGER_RADIUS;
const ORBIT_BIAS_WEIGHT = 0.4;
const CENTER_PULL_WEIGHT = 0.15;
const WALL_PENALTY_DIST = 80;
const WALL_PENALTY_WEIGHT = 1.5;
const ORBIT_REEVAL_INTERVAL = 0.5;
const DASH_PRESSURE_THRESHOLD = 1.2;
const DASH_CLOSE_COUNT_THRESHOLD = 3;

const ORBIT_DIST_BY_PHASE: Record<BossPhase, number> = {
    [BossPhase.Phase1]: 200,
    [BossPhase.Phase2]: 280,
    [BossPhase.Phase3]: 350,
};

const DASH_COOLDOWN_BY_PHASE: Record<BossPhase, number> = {
    [BossPhase.Phase1]: 2.0,
    [BossPhase.Phase2]: 1.5,
    [BossPhase.Phase3]: 0.9,
};

export interface AiBounds {
    minX: number; maxX: number; minY: number; maxY: number;
}

export class PlayerAi {
    readonly direction = new Vec3();
    wantsDash = false;

    private _candidates: Vec3[] = [];
    private _scores: number[] = new Float64Array(NUM_DIRECTIONS) as unknown as number[];

    private _orbitCW = true;
    private _orbitReevalTimer = 0;

    private _dashCooldownTimer = 0;

    private _predictedPlayer = new Vec3();
    private _predictedBullet = new Vec3();

    constructor() {
        for (let i = 0; i < NUM_DIRECTIONS; i++) {
            const angle = i * ANGLE_STEP;
            this._candidates.push(new Vec3(Math.cos(angle), Math.sin(angle), 0));
        }
    }

    compute(dt: number, selfPos: Readonly<Vec3>, bossNode: Node | null, bounds: AiBounds, phase: BossPhase = BossPhase.Phase1) {
        const ai = this.direction;
        ai.set(0, 0, 0);
        this.wantsDash = false;

        const bossPos = bossNode ? bossNode.worldPosition : null;
        const orbitDist = ORBIT_DIST_BY_PHASE[phase];
        const centerPull = phase === BossPhase.Phase3 ? CENTER_PULL_WEIGHT + 0.3 : CENTER_PULL_WEIGHT;

        this._orbitReevalTimer -= dt;
        if (this._orbitReevalTimer <= 0 && bossPos) {
            this._orbitReevalTimer = ORBIT_REEVAL_INTERVAL;
            this._reevaluateOrbitDirection(selfPos, bossPos);
        }

        const centerX = (bounds.minX + bounds.maxX) * 0.5;
        const centerY = (bounds.minY + bounds.maxY) * 0.5;

        const bullets = BossBullet.activeBullets;

        let bestIdx = 0;
        let bestScore = -Infinity;

        for (let i = 0; i < NUM_DIRECTIONS; i++) {
            const cand = this._candidates[i];
            const pp = this._predictedPlayer;
            pp.x = selfPos.x + cand.x * PlayerAi._moveSpeed * LOOKAHEAD_TIME;
            pp.y = selfPos.y + cand.y * PlayerAi._moveSpeed * LOOKAHEAD_TIME;

            let danger = 0;
            for (const bullet of bullets) {
                const bPos = bullet.node.worldPosition;
                const bDir = bullet.bulletDirection;
                const bSpd = bullet.bulletSpeed;

                const pbx = bPos.x + bDir.x * bSpd * LOOKAHEAD_TIME;
                const pby = bPos.y + bDir.y * bSpd * LOOKAHEAD_TIME;

                let dx = pp.x - pbx;
                let dy = pp.y - pby;
                let distSq = dx * dx + dy * dy;

                if (distSq < DANGER_RADIUS_SQ) {
                    const dist = Math.sqrt(distSq);
                    danger += 1 - dist / DANGER_RADIUS;
                    if (distSq < CLOSE_DANGER_RADIUS_SQ) {
                        danger += 0.5;
                    }
                }

                dx = pp.x - bPos.x;
                dy = pp.y - bPos.y;
                distSq = dx * dx + dy * dy;
                if (distSq < DANGER_RADIUS_SQ) {
                    const dist = Math.sqrt(distSq);
                    danger += (1 - dist / DANGER_RADIUS) * 0.5;
                }
            }

            let orbitBias = 0;
            if (bossPos) {
                const toBossX = bossPos.x - selfPos.x;
                const toBossY = bossPos.y - selfPos.y;
                const distToBoss = Math.sqrt(toBossX * toBossX + toBossY * toBossY);
                if (distToBoss > 0.01) {
                    const nx = toBossX / distToBoss;
                    const ny = toBossY / distToBoss;
                    const tx = this._orbitCW ? -ny : ny;
                    const ty = this._orbitCW ? nx : -nx;
                    orbitBias = (cand.x * tx + cand.y * ty) * ORBIT_BIAS_WEIGHT;

                    const radialErr = (distToBoss - orbitDist) / orbitDist;
                    orbitBias += (cand.x * nx + cand.y * ny) * radialErr * 0.5;
                }
            }

            const toCenterX = centerX - selfPos.x;
            const toCenterY = centerY - selfPos.y;
            const toCenterLen = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
            let pull = 0;
            if (toCenterLen > 0.01) {
                pull = (cand.x * toCenterX / toCenterLen + cand.y * toCenterY / toCenterLen) * centerPull;
            }

            let wallPen = 0;
            const distLeft = pp.x - bounds.minX;
            const distRight = bounds.maxX - pp.x;
            const distBottom = pp.y - bounds.minY;
            const distTop = bounds.maxY - pp.y;
            if (distLeft < WALL_PENALTY_DIST) wallPen += (1 - distLeft / WALL_PENALTY_DIST) * WALL_PENALTY_WEIGHT;
            if (distRight < WALL_PENALTY_DIST) wallPen += (1 - distRight / WALL_PENALTY_DIST) * WALL_PENALTY_WEIGHT;
            if (distBottom < WALL_PENALTY_DIST) wallPen += (1 - distBottom / WALL_PENALTY_DIST) * WALL_PENALTY_WEIGHT;
            if (distTop < WALL_PENALTY_DIST) wallPen += (1 - distTop / WALL_PENALTY_DIST) * WALL_PENALTY_WEIGHT;

            const score = -danger + orbitBias + pull - wallPen;
            this._scores[i] = score;

            if (score > bestScore) {
                bestScore = score;
                bestIdx = i;
            }
        }

        ai.set(this._candidates[bestIdx]);

        this._dashCooldownTimer -= dt;
        if (this._dashCooldownTimer <= 0) {
            let totalPressure = 0;
            let closeCount = 0;

            for (const bullet of bullets) {
                const bPos = bullet.node.worldPosition;
                const dx = selfPos.x - bPos.x;
                const dy = selfPos.y - bPos.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < DANGER_RADIUS_SQ) {
                    totalPressure += 1 - Math.sqrt(distSq) / DANGER_RADIUS;
                }
                if (distSq < CLOSE_DANGER_RADIUS_SQ) {
                    closeCount++;
                }
            }

            if (totalPressure > DASH_PRESSURE_THRESHOLD || closeCount >= DASH_CLOSE_COUNT_THRESHOLD) {
                this.wantsDash = true;
                this._dashCooldownTimer = DASH_COOLDOWN_BY_PHASE[phase];
            }
        }
    }

    private _reevaluateOrbitDirection(selfPos: Readonly<Vec3>, bossPos: Readonly<Vec3>) {
        const toBossX = bossPos.x - selfPos.x;
        const toBossY = bossPos.y - selfPos.y;
        const dist = Math.sqrt(toBossX * toBossX + toBossY * toBossY);
        if (dist < 0.01) return;

        const nx = toBossX / dist;
        const ny = toBossY / dist;

        const cwX = -ny, cwY = nx;
        const ccwX = ny, ccwY = -nx;

        let cwDanger = 0;
        let ccwDanger = 0;

        const sampleDist = 80;
        const cwPosX = selfPos.x + cwX * sampleDist;
        const cwPosY = selfPos.y + cwY * sampleDist;
        const ccwPosX = selfPos.x + ccwX * sampleDist;
        const ccwPosY = selfPos.y + ccwY * sampleDist;

        for (const bullet of BossBullet.activeBullets) {
            const bPos = bullet.node.worldPosition;

            let dx = cwPosX - bPos.x;
            let dy = cwPosY - bPos.y;
            let distSq = dx * dx + dy * dy;
            if (distSq < DANGER_RADIUS_SQ) {
                cwDanger += 1 - Math.sqrt(distSq) / DANGER_RADIUS;
            }

            dx = ccwPosX - bPos.x;
            dy = ccwPosY - bPos.y;
            distSq = dx * dx + dy * dy;
            if (distSq < DANGER_RADIUS_SQ) {
                ccwDanger += 1 - Math.sqrt(distSq) / DANGER_RADIUS;
            }
        }

        this._orbitCW = cwDanger <= ccwDanger;
    }

    private static _moveSpeed = 300;
    static setMoveSpeed(speed: number) { PlayerAi._moveSpeed = speed; }
}
