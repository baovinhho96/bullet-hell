import { _decorator, Component, Node, Button, director } from 'cc';
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
    }

    private _onPlay() {
        CombatManager.demoMode = false;
        director.loadScene(director.getScene()!.name);
    }
}
