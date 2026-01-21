import { _decorator, ColliderComponent, Component, Quat, Vec3 } from 'cc';
import { CustomNodeEvent } from '../Events/CustomNodeEvents';
const { ccclass, property } = _decorator;

@ccclass('RotatingObstacle')
export class RotatingObstacle extends Component {

    @property({ tooltip: 'Скорость вращения (градусы в секунду)' })
    public rotationSpeed: number = 90;

    @property({ tooltip: 'Ось вращения'})
    public rotationAxis: Vec3 = new Vec3(0, 0, 1);

    private _triggerColliders: ColliderComponent[] = [];
    private _rot = new Quat();

    protected onLoad(): void {
        const colliders = this.getComponentsInChildren(ColliderComponent);
        colliders.forEach((collider) => {
            if (collider.isTrigger) {
                this._triggerColliders.push(collider);
            }
        });
    }

    protected onEnable(): void {
        this._triggerColliders.forEach((collider) => {
            collider.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
        });
    }

    protected onDisable(): void {
        this._triggerColliders.forEach((collider) => {
            collider.off('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
        });
    }

    onControllerTriggerEnter(event: any) {
        event.characterController.node.emit(CustomNodeEvent.NODE_FELL);
    }

    update(deltaTime: number) {
        const angleRad = this.rotationSpeed * deltaTime * Math.PI / 180;
        Quat.fromAxisAngle(this._rot, this.rotationAxis, angleRad);
        this.node.rotate(this._rot);
    }
}