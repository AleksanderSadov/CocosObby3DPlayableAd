import { _decorator, Color, Component, Node, PhysicsSystem, RigidBody, Vec3 } from 'cc';
import { ray, v3_0, v3_1, v3_2 } from '../General/Constants';
import { DEBUG } from 'cc/env';
import { DebugDrawer } from '../Debug/DebugDrawer';
const { ccclass, property } = _decorator;

@ccclass('GroundCheck')
export class GroundCheck extends Component {
    @property
    public rayCastMaxDistance: number = 0.4;
    @property({tooltip: "Стреляем чуть выше ног персонажа, иначе может стрельнуть уже из пола и не засчитает хит"})
    public offsetY = 0.2;
    @property({tooltip: "Скорость по Y меньше которой считаем что мы уже не в полете. Учти при ударе об пол сейчас тоже немного подбрасывает со скоростью вверх"})
    public speedOffsetY = 0.5;
    @property({tooltip: "Насколько перпендикулярным должен быть пол"})
    public normalY = 0.6;

    @property
    public showRayCastLine: boolean = false;

    @property({readonly: true, serializable: false})
    public isGroundBelow: boolean = false;
    @property({type: Node, readonly: true, serializable: false})
    public hitNode: Node = null;
    @property({readonly: true, serializable: false})
    public hitNormal: Vec3 = new Vec3();

    private _rb: RigidBody;

    protected onLoad(): void {
        this._rb = this.getComponent(RigidBody);
    }

    // пока привязан к компоненту, но можно вынести в чистую функцию, если потребуется, просто сейчас удобно и так и не усложняю
    public check(): boolean {
        const origin = v3_0.set(this.node.worldPosition);
        const down = v3_1.set(0, -1, 0);
        const offsetY = this.offsetY;
        ray.o.set(origin.x, origin.y + offsetY, origin.z);
        ray.d.set(down);

        if (DEBUG && this.showRayCastLine) {
            DebugDrawer.drawRay(ray, this.rayCastMaxDistance, Color.RED);
        }

        // обращаю внимание важно исключить триггеры queryTrigger = false, тут они не подразумевались, иначе будем упираться в невидимые стены
        if (PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, this.rayCastMaxDistance, false)) {
            const hit = PhysicsSystem.instance.raycastClosestResult;
            const currentVelocity = v3_2;
            this._rb.getLinearVelocity(currentVelocity);
            this.hitNormal.set(hit.hitNormal);
            this.isGroundBelow = hit.hitNormal.y > this.normalY && currentVelocity.y <= this.speedOffsetY;
            this.hitNode = hit.collider.node;
            return this.isGroundBelow;
        }

        this.isGroundBelow = false;
        this.hitNormal.set(Vec3.ZERO);
        this.hitNode = null;
        return false;
    }
}
