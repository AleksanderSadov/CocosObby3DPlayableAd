import { _decorator, Component } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('ToggleSoundsButton')
export class ToggleSoundsButton extends Component {
    onClick() {
        GlobalEventBus.emit(GameEvent.TOGGLE_SOUNDS);
    }
}
