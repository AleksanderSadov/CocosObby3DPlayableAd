import { _decorator } from 'cc';
import { CharacterAbstractInput } from './CharacterAbstractInput';
import { EasyController, EasyControllerEvent } from '../../../EasyController/kylins_easy_controller/EasyController';
const { ccclass, property } = _decorator;

@ccclass('CharacterTouchJoystickInput')
export class CharacterTouchJoystickInput extends CharacterAbstractInput {
    protected onEnable(): void {
        super.onEnable();
        EasyController.on(EasyControllerEvent.MOVEMENT, this._onMovement, this);
        EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this._onMovementStop, this);
    }

    protected onDisable(): void {
        super.onDisable();
        EasyController.off(EasyControllerEvent.MOVEMENT, this._onMovement, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this._onMovementStop, this);
    }

    private _onMovement(degree: number, offset: number) {
        this.registerUserActivity();
        const rad = degree * Math.PI / 180;
        this._occt.control_x = Math.cos(rad) * offset;
        this._occt.control_z = Math.sin(rad) * offset;
    }

    private _onMovementStop() {
        this._occt.control_x = 0;
        this._occt.control_z = 0;
    }
}


