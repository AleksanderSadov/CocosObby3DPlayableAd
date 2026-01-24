import { _decorator, CapsuleCollider, Collider, Color, Component, Node, PhysicsRayResult, PhysicsSystem, Vec3 } from 'cc';
import { ray, v3_1 } from '../General/Constants';
import { ClimbableWall } from '../Obstacles/ClimbableWall';
import { DEBUG } from 'cc/env';
import { DebugDrawer } from '../Debug/DebugDrawer';
const { ccclass, property } = _decorator;

@ccclass('ClimbableCheck')
export class ClimbableCheck extends Component {
    @property({type: Collider, tooltip: "Если указать коллайдер, то начнем рейкаст от края коллайдера"})
    public collider: Collider;
    @property({tooltip: "Если не карабкаемся, то оффсет чтобы стена искалась на уровне тела"})
    public attachOffsetY = 0.25;
    @property({tooltip: "Если карабкаемся, то оффсет чтобы подняться чуть выше края стены и потом упасть на поверность"})
    public detachOffsetY = -0.25;
    @property
    public rayCastMaxDistance: number = 0.1;
    @property({tooltip: "Насколько перпендикулярна должна быть стена"})
    public dotProductCheck = 0.2;

    @property
    public showRayCastLine: boolean = false;

    @property({readonly: true, serializable: false})
    public isClimbing = false;
    @property({readonly: true, serializable: false})
    public isClimbableAhead: boolean = false;
    @property({type: Node, readonly: true, serializable: false})
    public hitNode: Node = null;
    @property({readonly: true, serializable: false})
    public hitNormal: Vec3 = new Vec3();
    @property({readonly: true, serializable: false})
    public hitHasClimbable = false;
    @property({readonly: true, serializable: false})
    public hitDotProduct = 0;

    public check(): boolean {
        const position = this.node.worldPosition; // сейчас у персонажа это точка соприкосновения с полом
        const dir = this.node.forward;
        let offset = 0;
        if (this.isClimbing) {
            offset = this.detachOffsetY;
        } else {
            offset = this.attachOffsetY;
        }
        ray.o.set(position.x, position.y + offset, position.z);
        ray.d.set(dir);
        let distance = 0;
        if (this.collider) {
            if (this.collider instanceof CapsuleCollider) {
                distance += this.collider.radius;
            }
        }
        distance += this.rayCastMaxDistance;
        if (DEBUG && this.showRayCastLine) {
            DebugDrawer.drawRay(ray, distance, Color.RED);
        }

        let hitNode = null;
        let hitNormal = v3_1.set(Vec3.ZERO);
        let hitHasClimbable = false;
        let hitDotProduct = 0;
        let isClimbableAhead = false;
        if (PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, distance)) {
            const hit: PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult;
            hitNode = hit.collider.node;
            hitNormal.set(hit.hitNormal);
            const climbableWall = hit.collider.getComponent(ClimbableWall);
            if (climbableWall) {
                hitHasClimbable = true;
                hitDotProduct = Vec3.dot(hit.hitNormal, this.node.up);
                if (Math.abs(this.hitDotProduct) < this.dotProductCheck) {
                    isClimbableAhead = true;
                }
            }
        }

        this.hitNode = hitNode;
        this.hitNormal.set(hitNormal);
        this.hitHasClimbable = hitHasClimbable;
        this.hitDotProduct = hitDotProduct;
        this.isClimbableAhead = isClimbableAhead;
        return this.isClimbableAhead;
    }
}


