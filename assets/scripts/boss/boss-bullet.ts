import { _decorator, Component, Vec3 } from 'cc';
import { BossConfig } from './boss-config';

const { ccclass } = _decorator;

const _tempVec3 = new Vec3();

@ccclass('BossBullet')
export class BossBullet extends Component {
    private _direction = new Vec3();
    private _traveled = 0;

    init(direction: Vec3) {
        Vec3.normalize(this._direction, direction);
        this._traveled = 0;
    }

    update(dt: number) {
        const speed = BossConfig.shooting1.bulletSpeed;
        const step = speed * dt;
        this._traveled += step;

        const pos = this.node.position;
        _tempVec3.set(
            pos.x + this._direction.x * step,
            pos.y + this._direction.y * step,
            pos.z,
        );
        this.node.setPosition(_tempVec3);

        if (this._traveled >= BossConfig.shooting1.bulletMaxDistance) {
            this.node.destroy();
        }
    }
}
