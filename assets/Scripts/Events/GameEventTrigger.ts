import { _decorator, ColliderComponent, Component, Enum, ITriggerEvent } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
import { Player } from '../ObbyCharacterController/Player';
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
        this._trigger.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    protected onDisable(): void {
        this._trigger.off('onTriggerEnter', this.onTriggerEnter, this);
    }

    onTriggerEnter(event: ITriggerEvent) {
        const player = event.otherCollider.node.getComponent(Player);
        if (player) {
            GlobalEventBus.emit(this.gameEvent);
        }
    }
}


