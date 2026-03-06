import { _decorator, Component, Sprite, Material } from 'cc';
import { CombatConfig } from './combat-config';

const { ccclass, property } = _decorator;

@ccclass('HealthBar')
export class HealthBar extends Component {
    @property(Sprite)
    fillSprite: Sprite = null!;

    private _displayRatio = 1;
    private _targetRatio = 1;
    private _damageFlash = 0;
    private _matInst: Material | null = null;

    private static readonly FLASH_DECAY = 4.0;

    start() {
        this.fillSprite.fillRange = 1;

        if (this.fillSprite.customMaterial) {
            this._matInst = this.fillSprite.getMaterialInstance(0);
            this._matInst?.setProperty('fillRatio', 1.0);
            this._matInst?.setProperty('damageFlash', 0.0);
        }
    }

    updateHealth(current: number, max: number) {
        const newRatio = max > 0 ? current / max : 0;

        if (newRatio < this._targetRatio) {
            this._damageFlash = 1.0;
        }

        this._targetRatio = newRatio;
    }

    update(dt: number) {
        if (this._damageFlash > 0) {
            this._damageFlash = Math.max(0, this._damageFlash - dt * HealthBar.FLASH_DECAY);
        }

        if (Math.abs(this._displayRatio - this._targetRatio) < 0.001) {
            if (this._displayRatio !== this._targetRatio) {
                this._displayRatio = this._targetRatio;
                this.fillSprite.fillRange = this._displayRatio;
            }
        } else {
            this._displayRatio += (this._targetRatio - this._displayRatio) * CombatConfig.healthBar.lerpSpeed * dt;
            this.fillSprite.fillRange = this._displayRatio;
        }

        if (this._matInst) {
            this._matInst.setProperty('fillRatio', this._displayRatio);
            this._matInst.setProperty('damageFlash', this._damageFlash);
        }
    }
}
