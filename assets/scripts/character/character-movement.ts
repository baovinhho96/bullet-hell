import { _decorator, Component, Node, Vec3, input, Input, EventKeyboard, KeyCode, math, toDegree } from 'cc';
import { CharacterConfig } from './character-config';
import { DashAfterimage } from './dash-afterimage';

const { ccclass, property } = _decorator;

const _tempVec3 = new Vec3();

@ccclass('CharacterMovement')
export class CharacterMovement extends Component {
    @property(Node)
    bossNode: Node = null!;

    private _moveDir = new Vec3();
    private _keys = new Set<KeyCode>();
    private _isDashing = false;
    private _dashTimer = 0;
    private _dashCooldownTimer = 0;
    private _afterimage: DashAfterimage = null!;

    start() {
        this._afterimage = this.node.addComponent(DashAfterimage);
    }

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    update(dt: number) {
        this._updateDashTimers(dt);
        this._updateMovement(dt);
        this._clampPosition();
        this._lookAtBoss();
        this._afterimage.onDashFrame(this._isDashing, dt);
    }

    private _onKeyDown(event: EventKeyboard) {
        this._keys.add(event.keyCode);

        if (event.keyCode === KeyCode.SHIFT_LEFT || event.keyCode === KeyCode.SHIFT_RIGHT || event.keyCode === KeyCode.SPACE) {
            this._tryDash();
        }
    }

    private _onKeyUp(event: EventKeyboard) {
        this._keys.delete(event.keyCode);
    }

    private _tryDash() {
        if (this._isDashing || this._dashCooldownTimer > 0) return;
        if (this._moveDir.lengthSqr() === 0) return;

        this._isDashing = true;
        this._dashTimer = CharacterConfig.dashDuration;
    }

    private _updateDashTimers(dt: number) {
        if (this._isDashing) {
            this._dashTimer -= dt;
            if (this._dashTimer <= 0) {
                this._isDashing = false;
                this._dashCooldownTimer = CharacterConfig.dashCooldown;
            }
        }

        if (this._dashCooldownTimer > 0) {
            this._dashCooldownTimer -= dt;
        }
    }

    private _updateMovement(dt: number) {
        const dir = this._moveDir;
        dir.set(0, 0, 0);

        if (this._keys.has(KeyCode.KEY_W) || this._keys.has(KeyCode.ARROW_UP)) dir.y += 1;
        if (this._keys.has(KeyCode.KEY_S) || this._keys.has(KeyCode.ARROW_DOWN)) dir.y -= 1;
        if (this._keys.has(KeyCode.KEY_A) || this._keys.has(KeyCode.ARROW_LEFT)) dir.x -= 1;
        if (this._keys.has(KeyCode.KEY_D) || this._keys.has(KeyCode.ARROW_RIGHT)) dir.x += 1;

        if (dir.lengthSqr() === 0) return;

        dir.normalize();
        const speed = this._isDashing ? CharacterConfig.dashSpeed : CharacterConfig.moveSpeed;
        const pos = this.node.position;
        _tempVec3.set(
            pos.x + dir.x * speed * dt,
            pos.y + dir.y * speed * dt,
            pos.z,
        );
        this.node.setPosition(_tempVec3);
    }

    private _clampPosition() {
        const pos = this.node.position;
        const { minX, maxX, minY, maxY } = CharacterConfig.bounds;
        const clampedX = math.clamp(pos.x, minX, maxX);
        const clampedY = math.clamp(pos.y, minY, maxY);

        if (clampedX !== pos.x || clampedY !== pos.y) {
            _tempVec3.set(clampedX, clampedY, pos.z);
            this.node.setPosition(_tempVec3);
        }
    }

    private _lookAtBoss() {
        if (!this.bossNode) return;

        const selfPos = this.node.worldPosition;
        const targetPos = this.bossNode.worldPosition;
        const dx = targetPos.x - selfPos.x;
        const dy = targetPos.y - selfPos.y;
        const angle = toDegree(Math.atan2(dx, dy));

        this.node.setRotationFromEuler(0, 0, -angle);
    }
}
