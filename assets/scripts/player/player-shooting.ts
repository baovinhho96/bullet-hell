import { _decorator, Component, Node, Prefab, Vec3, toDegree, UITransform } from 'cc';
import { PlayerConfig } from './player-config';
import { PlayerBullet } from './player-bullet';
import { BulletHitEffect } from './bullet-hit-effect';
import { CombatConfig } from '../combat/combat-config';
import { Health } from '../combat/health';
import { CombatManager } from '../combat/combat-manager';
import { NodePool } from '../utils/object-pool';

const { ccclass, property } = _decorator;

const _dir = new Vec3();

@ccclass('PlayerShooting')
export class PlayerShooting extends Component {
    @property(Node)
    bossNode: Node = null!;

    @property(Prefab)
    bulletPrefab: Prefab = null!;

    private _fireTimer = 0;
    private _hitEffect: BulletHitEffect = null!;
    private _pool!: NodePool;

    start() {
        this._pool = new NodePool(this.bulletPrefab);
        const fxNode = new Node('HitEffectPool');
        fxNode.setParent(this.node.parent);
        this._hitEffect = fxNode.addComponent(BulletHitEffect);
    }

    update(dt: number) {
        this._fireTimer -= dt;

        if (!this.bossNode || CombatManager.gameOver) return;

        const selfPos = this.node.worldPosition;
        const bossPos = this.bossNode.worldPosition;
        Vec3.subtract(_dir, bossPos, selfPos);
        const distance = _dir.length();

        if (distance > PlayerConfig.shooting.attackRange) return;
        if (this._fireTimer > 0) return;

        this._fireTimer = PlayerConfig.shooting.fireRate;
        this._fire(_dir, distance);
    }

    private _fire(dir: Vec3, distance: number) {
        dir.x /= distance;
        dir.y /= distance;
        dir.z = 0;

        const transform = this.bossNode.getComponent(UITransform);
        const radius = transform ? Math.min(transform.contentSize.width, transform.contentSize.height) * 0.5 : 0;
        const hitDistance = distance - radius;

        const bullet = this._pool.get();
        bullet.setParent(this.node.parent);
        bullet.setWorldPosition(this.node.worldPosition);

        const angle = toDegree(Math.atan2(dir.x, dir.y));
        bullet.setRotationFromEuler(0, 0, -angle + 90);

        bullet.getComponent(PlayerBullet)!.init(dir, hitDistance, (hitDir) => {
            this._onBulletHit(hitDir);
        }, this._pool.recycle);
    }

    private _onBulletHit(hitDir: Vec3) {
        const bossPos = this.bossNode.worldPosition;
        const transform = this.bossNode.getComponent(UITransform);
        const radius = transform ? Math.min(transform.contentSize.width, transform.contentSize.height) * 0.5 : 0;
        const edgePos = new Vec3(
            bossPos.x - hitDir.x * radius,
            bossPos.y - hitDir.y * radius,
            bossPos.z,
        );
        this._hitEffect.spawn(edgePos);

        const health = this.bossNode.getComponent(Health);
        if (health && !health.isDead) {
            health.takeDamage(CombatConfig.damage.playerBullet);
        }
    }
}
