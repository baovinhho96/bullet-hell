import { _decorator, Component, Node, director } from 'cc';
import { CombatConfig } from './combat-config';
import { GameState } from './game-state';
import { Health } from './health';
import { HealthBar } from './health-bar';
import { BossPhaseTracker } from '../boss/boss-phase';
import { BossMovement } from '../boss/boss-movement';
import { BossShooting } from '../boss/boss-shooting';
import { BossBullet } from '../boss/boss-bullet';
import { PlayerBullet } from '../player/player-bullet';
import { PlayerMovement } from '../player/player-movement';
import { GameOverPopup } from '../ui/game-over-popup';
import { VictoryPopup } from '../ui/victory-popup';
import { StartPopup } from '../ui/start-popup';
import { SoundManager } from '../sound/sound-manager';

const { ccclass, property } = _decorator;

@ccclass('CombatManager')
export class CombatManager extends Component {
    @property(Node)
    bossNode: Node = null!;

    @property(Node)
    playerNode: Node = null!;

    @property(Node)
    healthBarNode: Node = null!;

    @property(Node)
    playerHealthBarNode: Node = null!;

    @property(Node)
    gameOverPopupNode: Node = null!;

    @property(Node)
    victoryPopupNode: Node = null!;

    @property(Node)
    startPopupNode: Node = null!;

    start() {
        GameState.gameOver = false;
        const sound = SoundManager.instance;
        if (GameState.demoMode) {
            sound.setDemoVolume();
            this.startPopupNode.getComponent(StartPopup)?.show();
        } else {
            sound.fadeInFullVolume();
        }
        sound.playBgm();
        const bossHealth = this.bossNode.addComponent(Health);
        bossHealth.init(CombatConfig.boss.maxHp, CombatConfig.boss.iFrameDuration);

        const playerHealth = this.playerNode.addComponent(Health);
        playerHealth.init(CombatConfig.player.maxHp, CombatConfig.player.iFrameDuration);

        const bossHealthBar = this.healthBarNode.getComponent(HealthBar)!;
        const playerHealthBar = this.playerHealthBarNode.getComponent(HealthBar)!;

        const phaseTracker = new BossPhaseTracker();
        this.bossNode.getComponent(BossMovement)?.setPhaseTracker(phaseTracker);
        this.bossNode.getComponent(BossShooting)?.setPhaseTracker(phaseTracker);
        this.playerNode.getComponent(PlayerMovement)?.setPhaseTracker(phaseTracker);

        bossHealth.onDamage((current, max) => {
            bossHealthBar.updateHealth(current, max);
            phaseTracker.update(current / max);
        });

        playerHealth.onDamage((current, max) => {
            playerHealthBar.updateHealth(current, max);
        });

        bossHealth.onDeath(() => {
            if (GameState.demoMode) {
                this._restartDemo();
                return;
            }
            GameState.gameOver = true;
            this.bossNode.active = false;
            this._destroyAllBullets();
            this.victoryPopupNode.getComponent(VictoryPopup)?.show();
        });

        playerHealth.onDeath(() => {
            if (GameState.demoMode) {
                this._restartDemo();
                return;
            }
            GameState.gameOver = true;
            this.playerNode.active = false;
            this._destroyAllBullets();
            this._showGameOver();
        });
    }

    private _showGameOver() {
        this.gameOverPopupNode.getComponent(GameOverPopup)?.show();
    }

    private _restartDemo() {
        this._destroyAllBullets();
        director.loadScene(director.getScene()!.name);
    }

    private _destroyAllBullets() {
        for (const comp of BossBullet.activeBullets) {
            comp.node.destroy();
        }
        const scene = director.getScene()!;
        for (const comp of scene.getComponentsInChildren(PlayerBullet)) {
            comp.node.destroy();
        }
    }
}
