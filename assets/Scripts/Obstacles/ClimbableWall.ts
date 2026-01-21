import { _decorator, ColliderComponent, Component } from 'cc';
import { CustomNodeEvent } from '../Events/CustomNodeEvents';
const { ccclass, property } = _decorator;

@ccclass('ClimbableWall')
export class ClimbableWall extends Component {
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
        this._triggerCollider.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
        this._triggerCollider.on('onControllerTriggerExit', this.onControllerTriggerExit, this);
    }

    protected onDisable(): void {
        this._triggerCollider.off('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
        this._triggerCollider.off('onControllerTriggerExit', this.onControllerTriggerExit, this);
    }

    onControllerTriggerEnter(event: any) {
        event.characterController.node.emit(CustomNodeEvent.CLIMBABLE_WALL_ENTER);
    }

    onControllerTriggerExit(event: any) {
        event.characterController.node.emit(CustomNodeEvent.CLIMBABLE_WALL_EXIT);
    }
}
