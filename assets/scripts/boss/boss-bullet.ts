import { _decorator, Component, Node, Vec3, UITransform } from 'cc';
import { BossConfig } from './boss-config';
import { CombatConfig } from '../combat/combat-config';
import { Health } from '../combat/health';

const { ccclass, property } = _decorator;

const _tempVec3 = new Vec3();

@ccclass('BossBullet')
export class BossBullet extends Component {
    private _direction = new Vec3();
    private _bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    private _playerNode: Node | null = null;
    private _hitRadius = 20;

    init(direction: Vec3, wallsNode: Node, playerNode?: Node) {
        Vec3.normalize(this._direction, direction);
        this._computeBounds(wallsNode);
        this._playerNode = playerNode ?? null;
        if (playerNode) {
            const transform = playerNode.getComponent(UITransform);
            if (transform) {
                this._hitRadius = Math.min(transform.contentSize.width, transform.contentSize.height) * 0.4;
            }
        }
    }

    update(dt: number) {
        const step = BossConfig.shooting1.bulletSpeed * dt;

        const pos = this.node.position;
        _tempVec3.set(
            pos.x + this._direction.x * step,
            pos.y + this._direction.y * step,
            pos.z,
        );
        this.node.setPosition(_tempVec3);

        // Check collision with player
        if (this._playerNode && this._playerNode.active) {
            const playerPos = this._playerNode.worldPosition;
            const bulletPos = this.node.worldPosition;
            const dx = bulletPos.x - playerPos.x;
            const dy = bulletPos.y - playerPos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = this._hitRadius + 8;
            if (distSq < hitDist * hitDist) {
                const health = this._playerNode.getComponent(Health);
                if (health && !health.isDead) {
                    health.takeDamage(CombatConfig.damage.bossBullet);
                }
                this.node.destroy();
                return;
            }
        }

        const { minX, maxX, minY, maxY } = this._bounds;
        if (_tempVec3.x < minX || _tempVec3.x > maxX || _tempVec3.y < minY || _tempVec3.y > maxY) {
            this.node.destroy();
        }
    }

    private _computeBounds(wallsNode: Node) {
        const left = wallsNode.getChildByName('Left')!;
        const right = wallsNode.getChildByName('Right')!;
        const top = wallsNode.getChildByName('Top')!;
        const down = wallsNode.getChildByName('Down')!;

        this._bounds.minX = left.position.x + left.getComponent(UITransform)!.contentSize.width / 2;
        this._bounds.maxX = right.position.x - right.getComponent(UITransform)!.contentSize.width / 2;
        this._bounds.minY = down.position.y + down.getComponent(UITransform)!.contentSize.height / 2;
        this._bounds.maxY = top.position.y - top.getComponent(UITransform)!.contentSize.height / 2;
    }
}
