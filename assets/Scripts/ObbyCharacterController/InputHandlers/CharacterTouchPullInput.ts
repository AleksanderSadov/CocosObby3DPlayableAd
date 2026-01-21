import { _decorator, clamp, EventTouch, Input, input } from 'cc';
import { ObbyCharacterController } from '../ObbyCharacterController';
import { v2_0 } from '../../General/Constants';
import { CharacterAbstractInput } from './CharacterAbstractInput';
const { ccclass, requireComponent } = _decorator;

@ccclass('CharacterTouchPullInput')
@requireComponent(ObbyCharacterController)
export class CharacterTouchPullInput extends CharacterAbstractInput {
    protected onEnable(): void {
        super.onEnable();
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDisable(): void {
        super.onDisable();
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    // Это реализация из примера кокоса и оставлю для возможного референса
    // Эту реализацию поломал, т.к. нужно обнулять control_x, control_z в update, смотри пример кокоса. Но мне для клавы было удобнее убрать пока
    // TODO нужно сделать другую реализацию тач джойстика по тз
    onTouchMove(event: EventTouch) {
        this.registerUserActivity();
        event.getDelta(v2_0);
        const step = 1;
        if(Math.abs(v2_0.x) > 1)
            this._occt.control_x -= step * Math.sign(v2_0.x);
        if(Math.abs(v2_0.y) > 1)
            this._occt.control_z += step * Math.sign(v2_0.y);

        this._occt.control_z = clamp(this._occt.control_z, -1,1);
        this._occt.control_x = clamp(this._occt.control_x, -1,1);
    }

    onTouchEnd (event: EventTouch) {
    }
}


