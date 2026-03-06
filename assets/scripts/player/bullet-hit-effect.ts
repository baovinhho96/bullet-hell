import { _decorator, Component, Node, UIOpacity, Vec3, UITransform, Graphics, tween, Color } from 'cc';
import { PlayerConfig } from './player-config';
import { ObjectPool } from '../utils/object-pool';

const { ccclass } = _decorator;

@ccclass('BulletHitEffect')
export class BulletHitEffect extends Component {
    private _pool = new ObjectPool<Node>(() => this._createNode());

    spawn(worldPos: Vec3) {
        const cfg = PlayerConfig.shooting.hitEffect;

        const fx = this._pool.get();
        fx.active = true;
        fx.setWorldPosition(worldPos);
        fx.setScale(0.5, 0.5, 1);

        const opacity = fx.getComponent(UIOpacity)!;
        opacity.opacity = 255;

        tween(fx)
            .to(cfg.duration, { scale: new Vec3(cfg.scaleTo, cfg.scaleTo, 1) })
            .call(() => {
                fx.active = false;
                this._pool.put(fx);
            })
            .start();

        tween(opacity)
            .to(cfg.duration, { opacity: 0 })
            .start();
    }

    private _createNode(): Node {
        const node = new Node('BulletHitFX');
        node.setParent(this.node);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(16, 16);

        const g = node.addComponent(Graphics);
        const c = PlayerConfig.shooting.hitEffect.color;
        g.fillColor = new Color(c.r, c.g, c.b, c.a);
        g.circle(0, 0, 8);
        g.fill();

        node.addComponent(UIOpacity);

        return node;
    }
}
