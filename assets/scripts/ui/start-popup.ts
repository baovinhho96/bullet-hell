import { _decorator, Component, Node, Button, director } from 'cc';
import { GameState } from '../combat/game-state';

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
        GameState.demoMode = false;
        director.loadScene(director.getScene()!.name);
    }
}
