import { _decorator, Component, Node, director, Button } from 'cc';
import { GameState } from '../combat/game-state';

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
        GameState.gameOver = false;
        GameState.demoMode = true;
        director.loadScene(director.getScene()!.name);
    }
}
