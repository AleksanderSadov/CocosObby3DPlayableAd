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
    @property({tooltip: "Время сколько не прилипать снова к стене, если недавно отпрыгнули"})
    public clingCooldown = 0.6;
    @property({tooltip: "Разрешать ли карабкаться. Отключать не планируется, но оставляю удобный переключатель для тестирования"})
    public allowClimb = true;
    @property({tooltip: "Применять ли фикс для правки застревания в стенах в прыжке (смотри код). Отключать не планируется, но оставляю удобный переключатель для тестирования"})
    public fixStuckInWall = true;

    @property
    public showRayCastLine: boolean = false;

    @property({readonly: true, serializable: false})
    public isClimbing = false;
    @property({readonly: true, serializable: false})
    public isClimbableAhead: boolean = false;
    @property({readonly: true, serializable: false})
    public isClingOnCooldown: boolean = false;
    @property({readonly: true, serializable: false})
    public canClimb: boolean = false;
    @property({type: Node, readonly: true, serializable: false})
    public hitNode: Node = null;
    @property({readonly: true, serializable: false})
    public hitNormal: Vec3 = new Vec3();
    @property({readonly: true, serializable: false})
    public hitHasClimbable = false;
    @property({readonly: true, serializable: false})
    public hitDotProduct = 0;

    @property({readonly: true, visible: true, serializable: false})
    private _clingCooldownTimer = 0;

    public updateState(dt: number) {
        if (this._clingCooldownTimer > 0) {
            this._clingCooldownTimer -= dt;
        }
        this.check();
    }

    // пока привязан к компоненту, но можно вынести в чистую функцию, если потребуется, просто сейчас удобно и так и не усложняю
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
        // обращаю внимание важно исключить триггеры queryTrigger = false, тут они не подразумевались, иначе будем упираться в невидимые стены
        if (PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, distance, false)) {
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
        this.isClingOnCooldown = this._clingCooldownTimer > 0;
        this.canClimb = this.allowClimb && this.isClimbableAhead && !this.isClingOnCooldown;
        return this.canClimb;
    }

    public startClingCooldown() {
        this._clingCooldownTimer = this.clingCooldown;
    }

    public stopClingCooldown() {
        this._clingCooldownTimer = 0;
    }
}


