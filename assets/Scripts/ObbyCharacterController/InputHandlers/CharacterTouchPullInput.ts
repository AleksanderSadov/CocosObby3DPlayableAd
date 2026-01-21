import { _decorator, clamp, Component, EventTouch, Input, input } from 'cc';
import { ObbyCharacterController } from '../ObbyCharacterController';
import { v2_0 } from '../../General/Constants';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
const { ccclass, requireComponent } = _decorator;

@ccclass('CharacterTouchPullInput')
@requireComponent(ObbyCharacterController)
export class CharacterTouchPullInput extends Component {
    private _obbyCharacterController: ObbyCharacterController | null = null;

    onLoad() {
        this._obbyCharacterController = this.node.getComponent(ObbyCharacterController);
    }

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        GlobalEventBus.on(GameEvent.GAME_END, this.onGameEnd, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        GlobalEventBus.off(GameEvent.GAME_END, this.onGameEnd, this);
    }

    onGameEnd() {
        this.enabled = false;
    }

    // Это реализация из примера кокоса и оставлю для возможного референса
    // Эту реализацию поломал, т.к. нужно обнулять control_x, control_z в update, смотри пример кокоса. Но мне для клавы было удобнее убрать пока
    // TODO нужно сделать другую реализацию тач джойстика по тз
    onTouchMove (event: EventTouch) {
        event.getDelta(v2_0);
        const step = 1;
        if(Math.abs(v2_0.x) > 1)
            this._obbyCharacterController.control_x -= step * Math.sign(v2_0.x);
        if(Math.abs(v2_0.y) > 1)
            this._obbyCharacterController.control_z += step * Math.sign(v2_0.y);

        this._obbyCharacterController.control_z = clamp(this._obbyCharacterController.control_z, -1,1);
        this._obbyCharacterController.control_x = clamp(this._obbyCharacterController.control_x, -1,1);
    }

    onTouchEnd (event: EventTouch) {
    }
}


