import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('Health')
export class Health extends Component {
    private _maxHp = 1;
    private _currentHp = 1;
    private _iFrameDuration = 0;
    private _iFrameTimer = 0;

    private _onDamageCallbacks: ((current: number, max: number) => void)[] = [];
    private _onDeathCallbacks: (() => void)[] = [];

    get maxHp() { return this._maxHp; }
    get currentHp() { return this._currentHp; }
    get hpRatio() { return this._currentHp / this._maxHp; }
    get isDead() { return this._currentHp <= 0; }

    init(maxHp: number, iFrameDuration: number) {
        this._maxHp = maxHp;
        this._currentHp = maxHp;
        this._iFrameDuration = iFrameDuration;
        this._iFrameTimer = 0;
    }

    onDamage(cb: (current: number, max: number) => void) {
        this._onDamageCallbacks.push(cb);
    }

    onDeath(cb: () => void) {
        this._onDeathCallbacks.push(cb);
    }

    takeDamage(amount: number) {
        if (this.isDead) return;
        if (this._iFrameTimer > 0) return;

        this._currentHp = Math.max(0, this._currentHp - amount);
        this._iFrameTimer = this._iFrameDuration;

        for (const cb of this._onDamageCallbacks) {
            cb(this._currentHp, this._maxHp);
        }

        if (this._currentHp <= 0) {
            for (const cb of this._onDeathCallbacks) {
                cb();
            }
        }
    }

    update(dt: number) {
        if (this._iFrameTimer > 0) {
            this._iFrameTimer -= dt;
        }
    }
}
