import { _decorator, ColliderComponent, Component, Enum } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('GameEventTrigger')
export class GameEventTrigger extends Component {
    @property({type: Enum(GameEvent)})
    public gameEvent: GameEvent = undefined;

    private _trigger: ColliderComponent | null;

    protected onLoad(): void {
        this._trigger = this.getComponent(ColliderComponent);
    }

    protected onEnable(): void {
        this._trigger.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    protected onDisable(): void {
        this._trigger.off('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    onControllerTriggerEnter(event: any) {
        GlobalEventBus.emit(this.gameEvent);
    }
}


