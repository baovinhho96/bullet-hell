import { _decorator, Component, Node, director } from 'cc';
import { CombatConfig } from './combat-config';
import { Health } from './health';
import { BossHealthBar } from './boss-health-bar';
import { PlayerHealthBar } from './player-health-bar';
import { BossPhaseTracker } from '../boss/boss-phase';
import { BossMovement } from '../boss/boss-movement';
import { BossShooting } from '../boss/boss-shooting';
import { BossBullet } from '../boss/boss-bullet';
import { PlayerBullet } from '../player/player-bullet';
import { GameOverPopup } from '../ui/game-over-popup';
import { VictoryPopup } from '../ui/victory-popup';

const { ccclass, property } = _decorator;

@ccclass('CombatManager')
export class CombatManager extends Component {
    static gameOver = false;

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

    start() {
        CombatManager.gameOver = false;
        // Add Health to boss
        const bossHealth = this.bossNode.addComponent(Health);
        bossHealth.init(CombatConfig.boss.maxHp, CombatConfig.boss.iFrameDuration);

        // Add Health to player
        const playerHealth = this.playerNode.addComponent(Health);
        playerHealth.init(CombatConfig.player.maxHp, CombatConfig.player.iFrameDuration);

        // Get health bars from scene nodes
        const bossHealthBar = this.healthBarNode.getComponent(BossHealthBar)!;
        const playerHealthBar = this.playerHealthBarNode.getComponent(PlayerHealthBar)!;

        // Set up phase tracker
        const phaseTracker = new BossPhaseTracker();
        this.bossNode.getComponent(BossMovement)?.setPhaseTracker(phaseTracker);
        this.bossNode.getComponent(BossShooting)?.setPhaseTracker(phaseTracker);

        // Wire boss damage → health bar update + phase tracking
        bossHealth.onDamage((current, max) => {
            bossHealthBar.updateHealth(current, max);
            phaseTracker.update(current / max);
        });

        // Wire player damage → health bar update
        playerHealth.onDamage((current, max) => {
            playerHealthBar.updateHealth(current, max);
        });

        // Boss death → Victory
        bossHealth.onDeath(() => {
            CombatManager.gameOver = true;
            this.bossNode.active = false;
            this._destroyAllBullets();
            this.victoryPopupNode.getComponent(VictoryPopup)?.show();
        });

        // Player death
        playerHealth.onDeath(() => {
            CombatManager.gameOver = true;
            this.playerNode.active = false;
            this._destroyAllBullets();
            this._showGameOver();
        });
    }

    private _showGameOver() {
        this.gameOverPopupNode.getComponent(GameOverPopup)?.show();
    }

    private _destroyAllBullets() {
        const scene = director.getScene()!;
        for (const comp of scene.getComponentsInChildren(BossBullet)) {
            comp.node.destroy();
        }
        for (const comp of scene.getComponentsInChildren(PlayerBullet)) {
            comp.node.destroy();
        }
    }
}
