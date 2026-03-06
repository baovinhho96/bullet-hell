import { _decorator, Component, AudioClip, AudioSource } from 'cc';
import { SoundConfig } from './sound-config';

const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    @property(AudioClip)
    bgm: AudioClip = null!;

    @property(AudioClip)
    sfxPlayerShoot: AudioClip = null!;

    @property(AudioClip)
    sfxBossShoot: AudioClip = null!;

    private static _instance: SoundManager | null = null;
    private _bgmSource: AudioSource = null!;
    private _sfxSource: AudioSource = null!;
    private _bossShootTimer = 0;
    private _volumeScale = 1;
    private _fadeTarget = 1;
    private _fadeSpeed = 0;

    static get instance() {
        return this._instance!;
    }

    onLoad() {
        SoundManager._instance = this;

        this._bgmSource = this.node.addComponent(AudioSource);
        this._bgmSource.clip = this.bgm;
        this._bgmSource.loop = true;
        this._bgmSource.volume = SoundConfig.bgmVolume;

        this._sfxSource = this.node.addComponent(AudioSource);
    }

    update(dt: number) {
        if (this._bossShootTimer > 0) {
            this._bossShootTimer -= dt;
        }
        if (this._fadeSpeed > 0 && this._volumeScale < this._fadeTarget) {
            this._volumeScale = Math.min(this._volumeScale + this._fadeSpeed * dt, this._fadeTarget);
            this._applyVolume();
        }
    }

    playBgm() {
        if (!this._bgmSource.playing) {
            this._bgmSource.play();
        }
    }

    setDemoVolume() {
        this._volumeScale = SoundConfig.demoVolumeScale;
        this._fadeSpeed = 0;
        this._applyVolume();
    }

    fadeInFullVolume() {
        this._fadeTarget = 1;
        this._fadeSpeed = (1 - this._volumeScale) / SoundConfig.fadeInDuration;
    }

    private _applyVolume() {
        this._bgmSource.volume = SoundConfig.bgmVolume * this._volumeScale;
    }

    stopBgm() {
        this._bgmSource.stop();
    }

    playPlayerShoot() {
        this._sfxSource.playOneShot(this.sfxPlayerShoot, SoundConfig.sfxVolume * this._volumeScale);
    }

    playBossShoot() {
        if (this._bossShootTimer > 0) return;
        this._bossShootTimer = SoundConfig.bossShootCooldown;
        this._sfxSource.playOneShot(this.sfxBossShoot, SoundConfig.sfxVolume * this._volumeScale);
    }

    onDestroy() {
        if (SoundManager._instance === this) {
            SoundManager._instance = null;
        }
    }
}
