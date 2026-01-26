import { _decorator } from 'cc';
import { CharacterInputProcessor } from './CharacterInputProcessor';
import { EasyController, EasyControllerEvent } from 'db://assets/EasyController/kylins_easy_controller/EasyController';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('PlayerInputProcessor')
export class PlayerInputProcessor extends CharacterInputProcessor {
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
        GlobalEventBus.off(GameEvent.GAME_END, this._onGameEnd, this);
        this.degree = this.offset = this.cos = this.sin = 0;
    }

    private _onGameEnd() {
        this._onMoveInputStop();
        this.enabled = false;
    }
}
