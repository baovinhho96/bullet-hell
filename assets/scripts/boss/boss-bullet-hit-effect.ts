import { _decorator, Component, Node, UIOpacity, Vec3, UITransform, Graphics, tween, Color } from 'cc';
import { BossConfig } from './boss-config';

const { ccclass } = _decorator;

@ccclass('BossBulletHitEffect')
export class BossBulletHitEffect extends Component {
    private _pool: Node[] = [];

    spawn(worldPos: Vec3) {
        const cfg = BossConfig.hitEffect;

        let fx = this._pool.pop();
        if (!fx) {
            fx = this._createNode();
        }

        fx.active = true;
        fx.setWorldPosition(worldPos);
        fx.setScale(0.5, 0.5, 1);

        const opacity = fx.getComponent(UIOpacity)!;
        opacity.opacity = 255;

        tween(fx)
            .to(cfg.duration, { scale: new Vec3(cfg.scaleTo, cfg.scaleTo, 1) })
            .call(() => {
                fx!.active = false;
                this._pool.push(fx!);
            })
            .start();

        tween(opacity)
            .to(cfg.duration, { opacity: 0 })
            .start();
    }

    private _createNode(): Node {
        const node = new Node('BossBulletHitFX');
        node.setParent(this.node);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(20, 20);

        const g = node.addComponent(Graphics);
        const c = BossConfig.hitEffect.color;
        g.fillColor = new Color(c.r, c.g, c.b, c.a);
        g.circle(0, 0, 10);
        g.fill();

        node.addComponent(UIOpacity);

        return node;
    }
}
