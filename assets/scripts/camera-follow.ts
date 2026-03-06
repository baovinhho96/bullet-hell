import { _decorator, Component, Node, Vec3, math, UITransform, Camera, screen } from 'cc';

const { ccclass, property } = _decorator;

const _tempVec3 = new Vec3();

@ccclass('CameraFollow')
export class CameraFollow extends Component {
    @property(Node)
    target: Node = null!;

    @property(Node)
    wallsNode: Node = null!;

    @property({ tooltip: 'Smooth follow speed (higher = snappier)' })
    smoothSpeed: number = 5;

    @property({ tooltip: 'Minimum distance (px) player must remain inside the viewport edge' })
    edgePadding: number = 100;

    private _bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    private _halfViewW = 0;
    private _halfViewH = 0;
    private _cam: Camera = null!;
    private _leftWall: Node = null!;
    private _rightWall: Node = null!;
    private _topWall: Node = null!;
    private _bottomWall: Node = null!;

    start() {
        this._cam = this.node.getComponent(Camera)!;
        if (this.wallsNode) {
            this._leftWall = this.wallsNode.getChildByName('Left')!;
            this._rightWall = this.wallsNode.getChildByName('Right')!;
            this._topWall = this.wallsNode.getChildByName('Top')!;
            this._bottomWall = this.wallsNode.getChildByName('Down')!;
        }
    }

    lateUpdate(dt: number) {
        if (!this.target || !this._leftWall) return;

        this._computeBounds();

        const targetPos = this.target.position;
        const camPos = this.node.position;
        const pad = this.edgePadding;

        const relX = targetPos.x - camPos.x;
        const relY = targetPos.y - camPos.y;

        const limitX = this._halfViewW - pad;
        const limitY = this._halfViewH - pad;

        let pushX = 0;
        let pushY = 0;
        if (relX > limitX) pushX = relX - limitX;
        else if (relX < -limitX) pushX = relX + limitX;
        if (relY > limitY) pushY = relY - limitY;
        else if (relY < -limitY) pushY = relY + limitY;

        let newX = camPos.x;
        let newY = camPos.y;

        if (pushX !== 0 || pushY !== 0) {
            const t = 1 - Math.exp(-this.smoothSpeed * dt);
            newX += pushX * t;
            newY += pushY * t;
        }

        newX = math.clamp(newX, this._bounds.minX, this._bounds.maxX);
        newY = math.clamp(newY, this._bounds.minY, this._bounds.maxY);

        if (newX !== camPos.x || newY !== camPos.y) {
            _tempVec3.set(newX, newY, camPos.z);
            this.node.setPosition(_tempVec3);
        }
    }

    private _computeBounds() {
        const leftOuter = this._leftWall.position.x - this._leftWall.getComponent(UITransform)!.contentSize.width / 2;
        const rightOuter = this._rightWall.position.x + this._rightWall.getComponent(UITransform)!.contentSize.width / 2;
        const bottomOuter = this._bottomWall.position.y - this._bottomWall.getComponent(UITransform)!.contentSize.height / 2;
        const topOuter = this._topWall.position.y + this._topWall.getComponent(UITransform)!.contentSize.height / 2;

        const aspect = screen.windowSize.width / screen.windowSize.height;
        const halfViewH = this._cam.orthoHeight;
        const halfViewW = this._cam.orthoHeight * aspect;

        this._halfViewW = halfViewW;
        this._halfViewH = halfViewH;

        this._bounds.minX = leftOuter + halfViewW;
        this._bounds.maxX = rightOuter - halfViewW;
        this._bounds.minY = bottomOuter + halfViewH;
        this._bounds.maxY = topOuter - halfViewH;

        if (this._bounds.minX > this._bounds.maxX) {
            this._bounds.minX = this._bounds.maxX = (leftOuter + rightOuter) / 2;
        }
        if (this._bounds.minY > this._bounds.maxY) {
            this._bounds.minY = this._bounds.maxY = (bottomOuter + topOuter) / 2;
        }
    }
}
