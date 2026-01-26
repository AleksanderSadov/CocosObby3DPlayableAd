import { _decorator, Component, Node } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('MainCanvas')
export class MainCanvas extends Component {
    @property({type: Node})
    public joystickUI: Node | null = null;

    @property({type: Node})
    public soundUI: Node | null = null;

    @property({type: Node})
    public colorChallenge: Node | null = null;

    protected onEnable(): void {
        GlobalEventBus.on(GameEvent.GAME_END, this._onGameEnd, this);
    }

    protected onDisable(): void {
        GlobalEventBus.off(GameEvent.GAME_END, this._onGameEnd, this);
    }

    private _onGameEnd() {
        this.joystickUI.active = this.soundUI.active = this.colorChallenge.active = false;
    }
}
