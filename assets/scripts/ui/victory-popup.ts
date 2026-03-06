import { _decorator, Component, Node, director, Button } from 'cc';
import { CombatManager } from '../combat/combat-manager';

const { ccclass, property } = _decorator;

@ccclass('VictoryPopup')
export class VictoryPopup extends Component {
    @property(Node)
    backToMenuBtn: Node = null!;

    start() {
        this.backToMenuBtn.on(Button.EventType.CLICK, this._onBackToMenu, this);
    }

    show() {
        this.node.active = true;
    }

    private _onBackToMenu() {
        CombatManager.gameOver = false;
        CombatManager.demoMode = true;
        director.loadScene(director.getScene()!.name);
    }
}
