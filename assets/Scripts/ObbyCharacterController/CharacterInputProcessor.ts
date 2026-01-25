import { _decorator, Component } from 'cc';
import { EasyController, EasyControllerEvent } from '../../EasyController/kylins_easy_controller/EasyController';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
import { IInputReceiver } from './IInputReceiver';
const { ccclass, property } = _decorator;

@ccclass('CharacterInputProcessor')
export class CharacterInputProcessor extends Component {
    @property({readonly: true, visible: true, serializable: false})
    public degree: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public offset: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public sin: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public cos: number = 0;

    private _callback: IInputReceiver;

    init(callback: IInputReceiver) {
        this._callback = callback;
    }

    protected onEnable(): void {
        EasyController.on(EasyControllerEvent.MOVEMENT, this._onMoveInput, this);
        EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this._onMoveInputStop, this);
        EasyController.on(EasyControllerEvent.BUTTON, this._onButton, this);
        GlobalEventBus.on(GameEvent.GAME_END, this._onGameEnd, this);
    }

    protected onDisable(): void {
        EasyController.off(EasyControllerEvent.MOVEMENT, this._onMoveInput, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this._onMoveInputStop, this);
        EasyController.off(EasyControllerEvent.BUTTON, this._onButton, this);
        GlobalEventBus.on(GameEvent.GAME_END, this._onGameEnd, this);
        this.degree = this.offset = this.cos = this.sin = 0;
    }

    private _onMoveInput(degree: number, offset: number) {
        GlobalEventBus.emit(GameEvent.PLAYER_ACTIVITY);
        this.degree = degree;
        this.offset = offset;
        const rad = degree * Math.PI / 180;
        this.cos = Math.cos(rad) * offset;
        this.sin = Math.sin(rad) * offset;
        this._callback.onMoveInput(degree, offset);
    }

    private _onMoveInputStop() {
        GlobalEventBus.emit(GameEvent.PLAYER_ACTIVITY);
        this.degree = this.offset = 0;
        this.sin = this.cos = 0;
        this._callback.onMoveInputStop();
    }

    private _onButton(btnName: string) {
        GlobalEventBus.emit(GameEvent.PLAYER_ACTIVITY);
        this._callback.onButton(btnName);
    }

    private _onGameEnd() {
        this.enabled = false;
    }
}
