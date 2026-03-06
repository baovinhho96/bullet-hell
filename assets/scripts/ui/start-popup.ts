import { _decorator, Component, Node, Button } from 'cc';
import { CombatManager } from '../combat/combat-manager';

const { ccclass, property } = _decorator;

@ccclass('StartPopup')
export class StartPopup extends Component {
    @property(Node)
    playBtn: Node = null!;

    start() {
        this.playBtn.on(Button.EventType.CLICK, this._onPlay, this);
    }

    show() {
        this.node.active = true;
        CombatManager.gameOver = true;
    }

    private _onPlay() {
        CombatManager.gameOver = false;
        this.node.active = false;
    }
}
