import { _decorator, Component, Node } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('Canvas')
export class Canvas extends Component {
    @property({type: Node})
    public joystickUI: Node | null = null;

    protected onEnable(): void {
        GlobalEventBus.on(GameEvent.GAME_END, this._onGameEnd, this);
    }

    protected onDisable(): void {
        GlobalEventBus.off(GameEvent.GAME_END, this._onGameEnd, this);
    }

    private _onGameEnd() {
        this.joystickUI.active = false;
    }
}


