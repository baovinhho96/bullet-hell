import { _decorator, Component, Node, Vec3 } from 'cc';
import { PlayerConfig } from './player-config';

const { ccclass } = _decorator;

const _tempVec3 = new Vec3();

@ccclass('PlayerBullet')
export class PlayerBullet extends Component {
    private _direction = new Vec3();
    private _targetDistance = 0;
    private _traveled = 0;
    private _onHit: ((dir: Vec3) => void) | null = null;
    private _onRecycle: ((node: Node) => void) | null = null;

    init(direction: Vec3, targetDistance: number, onHit: (dir: Vec3) => void, onRecycle?: (node: Node) => void) {
        Vec3.normalize(this._direction, direction);
        this._targetDistance = targetDistance;
        this._traveled = 0;
        this._onHit = onHit;
        this._onRecycle = onRecycle ?? null;
    }

    update(dt: number) {
        const speed = PlayerConfig.shooting.bulletSpeed;
        const step = speed * dt;
        this._traveled += step;

        const pos = this.node.position;
        _tempVec3.set(
            pos.x + this._direction.x * step,
            pos.y + this._direction.y * step,
            pos.z,
        );
        this.node.setPosition(_tempVec3);

        if (this._traveled >= this._targetDistance) {
            this._onHit?.(this._direction);
            if (this._onRecycle) {
                this._onRecycle(this.node);
            } else {
                this.node.destroy();
            }
        }
    }
}
