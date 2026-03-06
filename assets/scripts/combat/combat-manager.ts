import { _decorator, Component, Node } from 'cc';
import { CombatConfig } from './combat-config';
import { Health } from './health';
import { BossHealthBar } from './boss-health-bar';

const { ccclass, property } = _decorator;

@ccclass('CombatManager')
export class CombatManager extends Component {
    @property(Node)
    bossNode: Node = null!;

    @property(Node)
    playerNode: Node = null!;

    @property(Node)
    healthBarNode: Node = null!;

    start() {
        // Add Health to boss
        const bossHealth = this.bossNode.addComponent(Health);
        bossHealth.init(CombatConfig.boss.maxHp, CombatConfig.boss.iFrameDuration);

        // Add Health to player
        const playerHealth = this.playerNode.addComponent(Health);
        playerHealth.init(CombatConfig.player.maxHp, CombatConfig.player.iFrameDuration);

        // Get health bar from scene node
        const healthBar = this.healthBarNode.getComponent(BossHealthBar)!;

        // Wire boss damage → health bar update
        bossHealth.onDamage((current, max) => {
            healthBar.updateHealth(current, max);
        });

        // Boss death
        bossHealth.onDeath(() => {
            this.bossNode.active = false;
        });

        // Player death
        playerHealth.onDeath(() => {
            this.playerNode.active = false;
        });
    }
}
