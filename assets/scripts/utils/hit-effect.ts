import { _decorator, Component, Node, UIOpacity, Vec3, UITransform, Graphics, tween, Color } from 'cc';
import { ObjectPool } from './object-pool';

const { ccclass } = _decorator;

interface HitEffectConfig {
    scaleTo: number;
    duration: number;
    color: Color;
    radius: number;
}

@ccclass('HitEffect')
export class HitEffect extends Component {
    private _pool = new ObjectPool<Node>(() => this._createNode());
    private _config: HitEffectConfig = null!;

    init(config: HitEffectConfig) {
        this._config = config;
    }

    spawn(worldPos: Vec3) {
        const cfg = this._config;

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
        const cfg = this._config;
        const node = new Node('HitFX');
        node.setParent(this.node);

        const size = cfg.radius * 2;
        const transform = node.addComponent(UITransform);
        transform.setContentSize(size, size);

        const g = node.addComponent(Graphics);
        const c = cfg.color;
        g.fillColor = new Color(c.r, c.g, c.b, c.a);
        g.circle(0, 0, cfg.radius);
        g.fill();

        node.addComponent(UIOpacity);

        return node;
    }
}
