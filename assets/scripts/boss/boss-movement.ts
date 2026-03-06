import { _decorator, Component, Node, Vec3, math, toDegree, UITransform } from 'cc';
import { BossConfig } from './boss-config';
import { BossDashAfterimage } from './boss-dash-afterimage';

const { ccclass, property } = _decorator;

const _tempVec3 = new Vec3();

@ccclass('BossMovement')
export class BossMovement extends Component {
    @property(Node)
    characterNode: Node = null!;

    @property(Node)
    wallsNode: Node = null!;

    private _startTimer = 0;
    private _bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    private _isDashing = false;
    private _dashTimer = 0;
    private _dashCooldownTimer = 0;
    private _dashDir = new Vec3();
    private _casualDashTimer = 0;
    private _afterimage: BossDashAfterimage = null!;

    start() {
        this._startTimer = BossConfig.startDelay;
        this._computeBounds();
        this._afterimage = this.node.addComponent(BossDashAfterimage);
        this._resetCasualDashTimer();
    }

    update(dt: number) {
        if (!this.characterNode) return;

        if (this._startTimer > 0) {
            this._startTimer -= dt;
            this._lookAtCharacter();
            return;
        }

        this._updateDashTimers(dt);
        this._updateCasualDash(dt);
        this._checkChaseDash();
        this._move(dt);
        this._clampPosition();
        this._lookAtCharacter();
        this._afterimage.onDashFrame(this._isDashing, dt);
    }

    private _resetCasualDashTimer() {
        const { casualDashMin, casualDashMax } = BossConfig;
        this._casualDashTimer = casualDashMin + Math.random() * (casualDashMax - casualDashMin);
    }

    private _updateCasualDash(dt: number) {
        if (this._isDashing || this._dashCooldownTimer > 0) return;

        this._casualDashTimer -= dt;
        if (this._casualDashTimer <= 0) {
            this._startCasualDash();
        }
    }

    /** Casual dash: pick a random direction biased toward the character */
    private _startCasualDash() {
        const selfPos = this.node.worldPosition;
        const targetPos = this.characterNode.worldPosition;

        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            // Bias toward character direction with some randomness
            const toCharX = dx / dist;
            const toCharY = dy / dist;
            const randAngle = (Math.random() - 0.5) * Math.PI; // +-90 degrees
            const cos = Math.cos(randAngle);
            const sin = Math.sin(randAngle);
            this._dashDir.set(
                toCharX * cos - toCharY * sin,
                toCharX * sin + toCharY * cos,
                0,
            );
        } else {
            const angle = Math.random() * Math.PI * 2;
            this._dashDir.set(Math.cos(angle), Math.sin(angle), 0);
        }

        this._dashDir.normalize();
        this._isDashing = true;
        this._dashTimer = BossConfig.dashDuration;
    }

    /** Chase dash: triggered when character is too far, dash directly toward them */
    private _checkChaseDash() {
        if (this._isDashing || this._dashCooldownTimer > 0) return;

        const selfPos = this.node.worldPosition;
        const targetPos = this.characterNode.worldPosition;
        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > BossConfig.chaseDashThreshold) {
            this._dashDir.set(dx / dist, dy / dist, 0);
            this._isDashing = true;
            this._dashTimer = BossConfig.dashDuration;
            this._resetCasualDashTimer();
        }
    }

    private _updateDashTimers(dt: number) {
        if (this._isDashing) {
            this._dashTimer -= dt;
            if (this._dashTimer <= 0) {
                this._isDashing = false;
                this._dashCooldownTimer = BossConfig.dashCooldown;
                this._resetCasualDashTimer();
            }
        }

        if (this._dashCooldownTimer > 0) {
            this._dashCooldownTimer -= dt;
        }
    }

    private _move(dt: number) {
        if (this._isDashing) {
            this._dashMove(dt);
        } else {
            this._moveTowardCharacter(dt);
        }
    }

    private _dashMove(dt: number) {
        const pos = this.node.position;
        _tempVec3.set(
            pos.x + this._dashDir.x * BossConfig.dashSpeed * dt,
            pos.y + this._dashDir.y * BossConfig.dashSpeed * dt,
            pos.z,
        );
        this.node.setPosition(_tempVec3);
    }

    private _moveTowardCharacter(dt: number) {
        const selfPos = this.node.worldPosition;
        const targetPos = this.characterNode.worldPosition;

        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1 || dist <= BossConfig.keepDistance) return;

        const nx = dx / dist;
        const ny = dy / dist;

        const pos = this.node.position;
        _tempVec3.set(
            pos.x + nx * BossConfig.moveSpeed * dt,
            pos.y + ny * BossConfig.moveSpeed * dt,
            pos.z,
        );
        this.node.setPosition(_tempVec3);
    }

    private _computeBounds() {
        if (!this.wallsNode) return;

        const left = this.wallsNode.getChildByName('Left')!;
        const right = this.wallsNode.getChildByName('Right')!;
        const top = this.wallsNode.getChildByName('Top')!;
        const down = this.wallsNode.getChildByName('Down')!;

        const selfSize = this.node.getComponent(UITransform)!.contentSize;
        const halfW = selfSize.width / 2;
        const halfH = selfSize.height / 2;

        this._bounds.minX = left.position.x + left.getComponent(UITransform)!.contentSize.width / 2 + halfW;
        this._bounds.maxX = right.position.x - right.getComponent(UITransform)!.contentSize.width / 2 - halfW;
        this._bounds.minY = down.position.y + down.getComponent(UITransform)!.contentSize.height / 2 + halfH;
        this._bounds.maxY = top.position.y - top.getComponent(UITransform)!.contentSize.height / 2 - halfH;
    }

    private _clampPosition() {
        const pos = this.node.position;
        const { minX, maxX, minY, maxY } = this._bounds;
        const clampedX = math.clamp(pos.x, minX, maxX);
        const clampedY = math.clamp(pos.y, minY, maxY);

        if (clampedX !== pos.x || clampedY !== pos.y) {
            _tempVec3.set(clampedX, clampedY, pos.z);
            this.node.setPosition(_tempVec3);
        }
    }

    private _lookAtCharacter() {
        if (!this.characterNode) return;

        const selfPos = this.node.worldPosition;
        const targetPos = this.characterNode.worldPosition;
        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const angle = toDegree(Math.atan2(dx, dy));

        this.node.setRotationFromEuler(0, 0, -angle + 180);
    }
}
