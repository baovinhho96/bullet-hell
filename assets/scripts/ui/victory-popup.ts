import { _decorator, Component, Node, director, Button } from 'cc';
import { CombatManager } from '../combat/combat-manager';

const { ccclass, property } = _decorator;

@ccclass('VictoryPopup')
export class VictoryPopup extends Component {
    @property(Node)
    playAgainBtn: Node = null!;

    start() {
        this.playAgainBtn.on(Button.EventType.CLICK, this._onPlayAgain, this);
    }

    show() {
        this.node.active = true;
    }

    private _onPlayAgain() {
        CombatManager.gameOver = false;
        CombatManager.demoMode = true;
        director.loadScene(director.getScene()!.name);
    }
}
