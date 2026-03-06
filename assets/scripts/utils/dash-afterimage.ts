import { _decorator, Component, Node, Sprite, UIOpacity, UITransform, Color } from 'cc';
import { ObjectPool } from './object-pool';

const { ccclass } = _decorator;

interface AfterimageConfig {
    spawnInterval: number;
    fadeDuration: number;
    startOpacity: number;
    color: Color;
}

interface Ghost {
    node: Node;
    sprite: Sprite;
    opacity: UIOpacity;
    timer: number;
}

@ccclass('DashAfterimage')
export class DashAfterimage extends Component {
    private _pool = new ObjectPool<Ghost>(() => this._createGhost());
    private _active: Ghost[] = [];
    private _spawnTimer = 0;
    private _sourceSprite: Sprite = null!;
    private _config: AfterimageConfig = null!;

    init(config: AfterimageConfig) {
        this._config = config;
    }

    start() {
        this._sourceSprite = this.node.getComponent(Sprite)!;
    }

    onDashFrame(isDashing: boolean, dt: number) {
        if (isDashing) {
            this._spawnTimer -= dt;
            if (this._spawnTimer <= 0) {
                this._spawnGhost();
                this._spawnTimer = this._config.spawnInterval;
            }
        } else {
            this._spawnTimer = 0;
        }

        this._updateGhosts(dt);
    }

    private _spawnGhost() {
        const ghost = this._pool.get();
        const { node } = ghost;

        node.setWorldPosition(this.node.worldPosition);
        node.setWorldRotation(this.node.worldRotation);
        node.setWorldScale(this.node.worldScale);

        ghost.sprite.spriteFrame = this._sourceSprite.spriteFrame;
        ghost.sprite.color = this._config.color;
        ghost.opacity.opacity = this._config.startOpacity;
        ghost.timer = this._config.fadeDuration;

        node.active = true;
        this._active.push(ghost);
    }

    private _updateGhosts(dt: number) {
        const { fadeDuration, startOpacity } = this._config;

        for (let i = this._active.length - 1; i >= 0; i--) {
            const ghost = this._active[i];
            ghost.timer -= dt;

            if (ghost.timer <= 0) {
                ghost.node.active = false;
                this._pool.put(ghost);
                this._active.splice(i, 1);
            } else {
                const ratio = ghost.timer / fadeDuration;
                ghost.opacity.opacity = startOpacity * ratio;
            }
        }
    }

    private _createGhost(): Ghost {
        const node = new Node('Afterimage');
        this.node.parent!.addChild(node);
        node.setSiblingIndex(this.node.getSiblingIndex());

        const transform = node.addComponent(UITransform);
        const selfTransform = this.node.getComponent(UITransform)!;
        transform.contentSize = selfTransform.contentSize;
        transform.anchorPoint = selfTransform.anchorPoint;

        const sprite = node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;

        const opacity = node.addComponent(UIOpacity);

        return { node, sprite, opacity, timer: 0 };
    }
}
