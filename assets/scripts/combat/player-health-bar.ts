import { _decorator, Component, Sprite } from 'cc';
import { CombatConfig } from './combat-config';

const { ccclass, property } = _decorator;

@ccclass('PlayerHealthBar')
export class PlayerHealthBar extends Component {
    @property(Sprite)
    fillSprite: Sprite = null!;

    private _displayRatio = 1;
    private _targetRatio = 1;

    start() {
        this.fillSprite.fillRange = 1;
    }

    updateHealth(current: number, max: number) {
        this._targetRatio = max > 0 ? current / max : 0;
    }

    update(dt: number) {
        if (Math.abs(this._displayRatio - this._targetRatio) < 0.001) {
            if (this._displayRatio !== this._targetRatio) {
                this._displayRatio = this._targetRatio;
                this.fillSprite.fillRange = this._displayRatio;
            }
            return;
        }

        this._displayRatio += (this._targetRatio - this._displayRatio) * CombatConfig.healthBar.lerpSpeed * dt;
        this.fillSprite.fillRange = this._displayRatio;
    }
}
