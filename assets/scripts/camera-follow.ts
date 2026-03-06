import { _decorator, Component, Node, Vec3, math, UITransform, view } from 'cc';

const { ccclass, property } = _decorator;

const _tempVec3 = new Vec3();

@ccclass('CameraFollow')
export class CameraFollow extends Component {
    @property(Node)
    target: Node = null!;

    @property(Node)
    playground: Node = null!;

    @property({ tooltip: 'Smooth follow speed (higher = snappier)' })
    smoothSpeed: number = 5;

    @property({ tooltip: 'Minimum distance (px) character must remain inside the viewport edge' })
    edgePadding: number = 100;

    private _bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    private _halfViewW = 0;
    private _halfViewH = 0;

    start() {
        this._computeBounds();
        const visibleSize = view.getVisibleSize();
        this._halfViewW = visibleSize.width / 2;
        this._halfViewH = visibleSize.height / 2;
    }

    lateUpdate(dt: number) {
        if (!this.target) return;

        const targetPos = this.target.position;
        const camPos = this.node.position;
        const pad = this.edgePadding;

        // Character position relative to camera
        const relX = targetPos.x - camPos.x;
        const relY = targetPos.y - camPos.y;

        // Inner bounds the character must stay within
        const limitX = this._halfViewW - pad;
        const limitY = this._halfViewH - pad;

        // Only move camera if character exceeds the inner bounds
        let pushX = 0;
        let pushY = 0;
        if (relX > limitX) pushX = relX - limitX;
        else if (relX < -limitX) pushX = relX + limitX;
        if (relY > limitY) pushY = relY - limitY;
        else if (relY < -limitY) pushY = relY + limitY;

        if (pushX === 0 && pushY === 0) return;

        const t = 1 - Math.exp(-this.smoothSpeed * dt);
        _tempVec3.set(
            camPos.x + pushX * t,
            camPos.y + pushY * t,
            camPos.z,
        );

        // Clamp within playground bounds
        _tempVec3.x = math.clamp(_tempVec3.x, this._bounds.minX, this._bounds.maxX);
        _tempVec3.y = math.clamp(_tempVec3.y, this._bounds.minY, this._bounds.maxY);

        this.node.setPosition(_tempVec3);
    }

    private _computeBounds() {
        if (!this.playground) return;

        const pgSize = this.playground.getComponent(UITransform)!.contentSize;
        const visibleSize = view.getVisibleSize();

        const halfViewW = visibleSize.width / 2;
        const halfViewH = visibleSize.height / 2;
        const halfPgW = pgSize.width / 2;
        const halfPgH = pgSize.height / 2;

        this._bounds.minX = -(halfPgW - halfViewW);
        this._bounds.maxX = halfPgW - halfViewW;
        this._bounds.minY = -(halfPgH - halfViewH);
        this._bounds.maxY = halfPgH - halfViewH;

        // If playground is smaller than view, center the camera
        if (this._bounds.minX > this._bounds.maxX) {
            this._bounds.minX = this._bounds.maxX = 0;
        }
        if (this._bounds.minY > this._bounds.maxY) {
            this._bounds.minY = this._bounds.maxY = 0;
        }
    }

    private _snapToTarget() {
        if (!this.target) return;

        const targetPos = this.target.position;
        _tempVec3.set(
            math.clamp(targetPos.x, this._bounds.minX, this._bounds.maxX),
            math.clamp(targetPos.y, this._bounds.minY, this._bounds.maxY),
            this.node.position.z,
        );
        this.node.setPosition(_tempVec3);
    }
}
