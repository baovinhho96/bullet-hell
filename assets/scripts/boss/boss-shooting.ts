import { _decorator, Component, Node, Prefab, Vec3, toRadian } from 'cc';
import { BossConfig } from './boss-config';
import { BossBullet } from './boss-bullet';
import { HitEffect } from '../utils/hit-effect';
import { BossPhase, BossPhaseTracker } from './boss-phase';
import { CombatManager } from '../combat/combat-manager';
import { NodePool } from '../utils/object-pool';
import { SoundManager } from '../sound/sound-manager';

const { ccclass, property } = _decorator;

const _dir = new Vec3();

@ccclass('BossShooting')
export class BossShooting extends Component {
    @property(Node)
    playerNode: Node = null!;

    @property(Node)
    wallsNode: Node = null!;

    @property(Prefab)
    bullet1Prefab: Prefab = null!;

    private _fireTimer = 0;
    private _hitEffect!: HitEffect;
    private _phase = BossPhase.Phase1;
    private _pool!: NodePool;

    setPhaseTracker(tracker: BossPhaseTracker) {
        this._phase = tracker.phase;
        tracker.onChange((phase) => { this._phase = phase; });
    }

    start() {
        this._pool = new NodePool(this.bullet1Prefab);
        this._fireTimer = BossConfig.startDelay;
        this._hitEffect = this.node.addComponent(HitEffect);
        this._hitEffect.init(BossConfig.hitEffect);
    }

    update(dt: number) {
        if (!this.playerNode || CombatManager.gameOver) return;

        this._fireTimer -= dt;
        if (this._fireTimer > 0) return;

        const phaseCfg = BossConfig.phases[this._phase];
        this._fireTimer = phaseCfg.fireCooldown;

        const patterns = phaseCfg.patterns;
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        switch (pattern) {
            case 'normal':
                this._fireNormalFan();
                break;
            case 'crazyFan':
                this._fireCrazyFan();
                break;
            case 'crazySpiral':
                this._fireCrazySpiral();
                break;
        }
    }

    private _fireNormalFan() {
        const cfg = BossConfig.shooting.normal;
        this._fireFan(cfg.bulletCount, cfg.arcDegrees, cfg.speed);
    }

    private _fireCrazyFan() {
        const cfg = BossConfig.shooting.crazyFan;
        this._fireFan(cfg.bulletCount, cfg.arcDegrees, cfg.speed);
    }

    private _fireFan(bulletCount: number, arcDegrees: number, speed: number) {
        this._playShootSound();
        const selfPos = this.node.worldPosition;
        const targetPos = this.playerNode.worldPosition;

        Vec3.subtract(_dir, targetPos, selfPos);
        _dir.z = 0;
        if (_dir.length() < 1) return;

        const centerAngle = Math.atan2(_dir.y, _dir.x);
        const arcRad = toRadian(arcDegrees);
        const step = bulletCount > 1 ? arcRad / (bulletCount - 1) : 0;
        const centerIdx = Math.floor((bulletCount - 1) / 2);

        for (let i = 0; i < bulletCount; i++) {
            const angle = centerAngle + (i - centerIdx) * step;
            const dir = new Vec3(Math.cos(angle), Math.sin(angle), 0);
            this._spawnBullet(dir, speed);
        }
    }

    private _fireCrazySpiral() {
        this._playShootSound();
        const cfg = BossConfig.shooting.crazySpiral;
        const selfPos = this.node.worldPosition;
        const targetPos = this.playerNode.worldPosition;

        Vec3.subtract(_dir, targetPos, selfPos);
        _dir.z = 0;
        if (_dir.length() < 1) return;

        const baseAngle = Math.atan2(_dir.y, _dir.x);
        const delay = cfg.spiralDuration / cfg.bulletCount;

        for (let i = 0; i < cfg.bulletCount; i++) {
            this.scheduleOnce(() => {
                if (CombatManager.gameOver) return;
                const angle = baseAngle + toRadian(cfg.degPerBullet * i);
                const dir = new Vec3(Math.cos(angle), Math.sin(angle), 0);
                this._spawnBullet(dir, cfg.speed);
            }, delay * i);
        }
    }

    private _playShootSound() {
        SoundManager.instance.playBossShoot();
    }

    private _spawnBullet(direction: Vec3, speed: number) {
        const bullet = this._pool.get();
        bullet.setParent(this.node.parent);
        bullet.setWorldPosition(this.node.worldPosition);

        bullet.getComponent(BossBullet)!.init(direction, this.wallsNode, this.playerNode, (pos) => {
            this._hitEffect.spawn(pos);
        }, speed, this._pool.recycle);
    }
}
