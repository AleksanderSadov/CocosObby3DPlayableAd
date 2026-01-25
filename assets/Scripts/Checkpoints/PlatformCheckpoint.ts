import { _decorator, ColliderComponent, Component, ICollisionEvent } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
import { Player } from '../ObbyCharacterController/Player';
const { ccclass, property } = _decorator;

@ccclass('PlatformCheckpoint')
export class PlatformCheckpoint extends Component {
    @property
    public isActiveCheckpoint: boolean = false;

    private _triggerCollider: ColliderComponent | null = null;

    onLoad() {
        const colliders = this.getComponents(ColliderComponent);
        colliders.forEach((collider) => {
            if (collider.isTrigger) {
                this._triggerCollider = collider;
            }
        });
    }
    
    protected onEnable(): void {
        this._triggerCollider.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    protected onDisable(): void {
        this._triggerCollider.off('onTriggerEnter', this.onTriggerEnter, this);
    }

    onTriggerEnter(event: ICollisionEvent) {
        if (this.isActiveCheckpoint) {
            return;
        }
        const player = event.otherCollider.getComponent(Player);
        if (player) {
            GlobalEventBus.emit(GameEvent.SAVE_CHECKPOINT, this);
        }
    }
}
