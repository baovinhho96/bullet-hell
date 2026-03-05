import { _decorator, Component, Node, Sprite, UIOpacity, UITransform, Color, Vec3 } from 'cc';
import { CharacterConfig } from './character-config';

const { ccclass } = _decorator;

const _tempColor = new Color();

interface Ghost {
    node: Node;
    sprite: Sprite;
    opacity: UIOpacity;
    timer: number;
}

@ccclass('DashAfterimage')
export class DashAfterimage extends Component {
    private _pool: Ghost[] = [];
    private _active: Ghost[] = [];
    private _spawnTimer = 0;
    private _characterSprite: Sprite = null!;

    start() {
        this._characterSprite = this.node.getComponent(Sprite)!;
    }

    onDashFrame(isDashing: boolean, dt: number) {
        if (isDashing) {
            this._spawnTimer -= dt;
            if (this._spawnTimer <= 0) {
                this._spawnGhost();
                this._spawnTimer = CharacterConfig.afterimage.spawnInterval;
            }
        } else {
            this._spawnTimer = 0;
        }

        this._updateGhosts(dt);
    }

    private _spawnGhost() {
        const ghost = this._getGhost();
        const { node } = ghost;

        node.setWorldPosition(this.node.worldPosition);
        node.setWorldRotation(this.node.worldRotation);
        node.setWorldScale(this.node.worldScale);

        ghost.sprite.spriteFrame = this._characterSprite.spriteFrame;
        ghost.sprite.color = CharacterConfig.afterimage.color;
        ghost.opacity.opacity = CharacterConfig.afterimage.startOpacity;
        ghost.timer = CharacterConfig.afterimage.fadeDuration;

        node.active = true;
        this._active.push(ghost);
    }

    private _updateGhosts(dt: number) {
        const { fadeDuration, startOpacity } = CharacterConfig.afterimage;

        for (let i = this._active.length - 1; i >= 0; i--) {
            const ghost = this._active[i];
            ghost.timer -= dt;

            if (ghost.timer <= 0) {
                ghost.node.active = false;
                this._pool.push(ghost);
                this._active.splice(i, 1);
            } else {
                const ratio = ghost.timer / fadeDuration;
                ghost.opacity.opacity = startOpacity * ratio;
            }
        }
    }

    private _getGhost(): Ghost {
        if (this._pool.length > 0) {
            return this._pool.pop()!;
        }

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
