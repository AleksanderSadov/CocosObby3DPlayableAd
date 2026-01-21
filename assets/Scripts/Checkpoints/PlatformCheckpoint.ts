import { _decorator, ColliderComponent, Component } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
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
        // onControllerColliderHit триггерится постоянно когда игрок стоит на платформе, нужно иметь это ввиду
        // поэтому детект сохранения сделал через отдельный триггер коллайдер
        // TODO триггер может сработать даже если персонаж не полностью презимлился на платформу, но правка пока с низким приоритетом
        this._triggerCollider.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    protected onDisable(): void {
        this._triggerCollider.off('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
    }

    onControllerTriggerEnter(event: any) {
        if (this.isActiveCheckpoint) {
            return;
        }
        GlobalEventBus.emit(GameEvent.SAVE_CHECKPOINT, this);
    }
}
