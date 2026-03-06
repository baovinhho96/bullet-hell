import { _decorator, Component, Node, Prefab, Vec3, instantiate, toRadian } from 'cc';
import { BossConfig } from './boss-config';
import { BossBullet } from './boss-bullet';

const { ccclass, property } = _decorator;

const _dir = new Vec3();

@ccclass('BossShooting')
export class BossShooting extends Component {
    @property(Node)
    characterNode: Node = null!;

    @property(Prefab)
    bullet1Prefab: Prefab = null!;

    private _fireTimer = 0;

    start() {
        this._fireTimer = BossConfig.startDelay;
    }

    update(dt: number) {
        if (!this.characterNode) return;

        this._fireTimer -= dt;
        if (this._fireTimer > 0) return;

        this._fireTimer = BossConfig.shooting1.fireCooldown;
        this._firePattern1();
    }

    private _firePattern1() {
        const selfPos = this.node.worldPosition;
        const targetPos = this.characterNode.worldPosition;

        Vec3.subtract(_dir, targetPos, selfPos);
        _dir.z = 0;
        const dist = _dir.length();
        if (dist < 1) return;

        // Center angle toward character
        const centerAngle = Math.atan2(_dir.y, _dir.x);

        const { bulletCount, arcDegrees } = BossConfig.shooting1;
        const arcRad = toRadian(arcDegrees);
        const startAngle = centerAngle - arcRad / 2;
        const step = arcRad / (bulletCount - 1);

        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + step * i;
            const dir = new Vec3(Math.cos(angle), Math.sin(angle), 0);
            this._spawnBullet(dir);
        }
    }

    private _spawnBullet(direction: Vec3) {
        const bullet = instantiate(this.bullet1Prefab);
        bullet.setParent(this.node.parent);
        bullet.setWorldPosition(this.node.worldPosition);

        bullet.getComponent(BossBullet)!.init(direction);
    }
}
