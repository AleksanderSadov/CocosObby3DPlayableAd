import {
    _decorator, Component, Node, CharacterController, Vec3, PhysicsSystem, CharacterControllerContact, Quat, ModelComponent, Color,
    geometry
} from 'cc';
import { GameEvent, GlobalEventBus } from './GlobalEventBus';
import { CustomNodeEvent } from './CustomNodeEvents';
import { rotation, scale } from './Constants';
const { ccclass, property } = _decorator;



// За основу взят пример из документации: https://docs.cocos.com/creator/3.8/manual/en/cases-and-tutorials/ -> Examples of Physics -> case-character-controller
// Буду модифицировать по мере необходимости

// TODO Камера: камеру пока поставил по простому следовать за персонажем, надо будет реализовать свободное вращение камеры

@ccclass('ObbyCharacterController')
export class ObbyCharacterController extends Component {
    @property
    public speed : number = 0.5;
    @property
    public gravityValue = -9.81;
    @property
    public jumpSpeed = 60;
    @property
    public jumpAccelTime = 0.1;
    @property
    public allowMoveInAir = true;
    @property
    public linearDamping = 0.9;
    @property
    public pushPower = 4;

    private _cct : CharacterController = null!

    @property({readonly: true, visible: true, serializable: false})
    private _initialPosition: Vec3;
    @property({readonly: true, serializable: false})
    public control_z = 0;
    @property({readonly: true, serializable: false})
    public control_x = 0;
    @property({readonly: true, visible: true, serializable: false})
    private _movement = new Vec3(0,0,0);
    @property({readonly: true, visible: true, serializable: false})
    private _grounded = true;
    @property({readonly: true, visible: true, serializable: false})
    private _playerVelocity = new Vec3(0,0,0);
    @property({serializable: false})
    private _doJump = false;
    @property({readonly: true, visible: true, serializable: false})
    private _jumpAccelCountdown = 0;
    private _hitPoint: Node = null!;

    onLoad () {
        this._initialPosition = this.node.position.clone();
        this._hitPoint = this.node.scene.getChildByName('HitPoint')!;
        this._cct = this.node.getComponent(CharacterController)!;
        if (this._cct) {
            this._cct.on('onControllerColliderHit', this.onControllerColliderHit, this);
            this._cct.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
            this._cct.on('onControllerTriggerStay', this.onControllerTriggerStay, this);
            this._cct.on('onControllerTriggerExit', this.onControllerTriggerExit, this);
        }
    }

    onEnable () {
        this.node.on(CustomNodeEvent.NODE_FELL, this.onPlayerFell, this);
    }

    onDisable () {
        this.node.off(CustomNodeEvent.NODE_FELL, this.onPlayerFell, this);
    }

    onControllerColliderHit(hit: CharacterControllerContact) {
        // onControllerColliderHit триггерится постоянно когда стоит на платформе, нужно иметь это ввиду
        // поэтому например сохранение чекпоинта проверка через триггер в PlatformCheckpoint.ts, который триггерится только при входе на платформу

        // log("onControllerColliderHit", hit.collider.node);
        // console.log('Test onColliderHit');
        // console.log('selfCCT ', selfCCT.node.name, ' hitCollider ', hitCollider.node.name);
        // console.log('character velocity ', selfCCT.getVelocity());
        //selfCCT.detectCollisions = false;
        
        Quat.rotationTo(rotation, Vec3.UNIT_Y, hit.worldNormal);
        this._hitPoint.setWorldPosition(hit.worldPosition);
        scale.set(0.05, 1, 0.05);
        this._hitPoint.setWorldScale(scale);
        this._hitPoint.setWorldRotation(rotation);
        
        const body = hit.collider.attachedRigidBody;
        // no rigidbody
        if (body == null || body.isKinematic) {
            return;
        }

        // We dont want to push objects below us
        if (hit.motionDirection.y < -0.1) {
            return;
        }

        // Calculate push direction from move direction,
        // we only push objects to the sides never up and down
        const pushDir = new Vec3(hit.motionDirection.x, 0, hit.motionDirection.z);

         // If you know how fast your character is trying to move,
        // then you can also multiply the push velocity by that.

        // Apply the push
        Vec3.multiplyScalar(pushDir, pushDir, this.pushPower);
        body.setLinearVelocity(pushDir);
    }

    onControllerTriggerEnter(event: any) {
        // log('cct onControllerTriggerEnter', event);
        const modelCom = event.characterController.node.getComponent(ModelComponent);
        if (modelCom) {
            modelCom.material.setProperty('mainColor', new Color(255, 0, 0, 99));
        }
    }

    onControllerTriggerStay(event: any) {
        // log('cct onControllerTriggerStay', event);
    }

    onControllerTriggerExit(event: any) {
        // log('cct onControllerTriggerExit', event);
        const modelCom = event.characterController.node.getComponent(ModelComponent);
        if (modelCom) {
            modelCom.material.setProperty('mainColor', new Color(255, 255, 255, 99));
        }
    }

    private onPlayerFell(event: any) {
        // Reset internal movement flags/velocity immediately
        this._playerVelocity.set(0, 0, 0);
        this._doJump = false;
        this._jumpAccelCountdown = 0;
        GlobalEventBus.emit(GameEvent.REQUEST_RESPAWN, { characterController: this._cct, defaultSpawn: this._initialPosition });
    }

    jump() {
        if (this._grounded) {
            this._doJump = true;
        }
    }

    update(deltaTime: number) {
        if(!this._cct) 
            return;

        deltaTime = PhysicsSystem.instance.fixedTimeStep;
        this._grounded = this._cct!.isGrounded;
        
        // Gravity
        this._playerVelocity.y += this.gravityValue * deltaTime;

        if (this._grounded && this._doJump) {
            this._jumpAccelCountdown = this.jumpAccelTime;
            this._doJump = false;
        }

        if (this._grounded || this.allowMoveInAir) {
            //control impulse
            this._playerVelocity.z += -this.control_z * this.speed;
            this._playerVelocity.x += -this.control_x * this.speed;

            // damping
            this._playerVelocity.x *= this.linearDamping;
            this._playerVelocity.z *= this.linearDamping;
        }

        if (this._jumpAccelCountdown > 0) {
            this._jumpAccelCountdown = Math.max(this._jumpAccelCountdown - deltaTime, 0);
            this._playerVelocity.y += this.jumpSpeed * deltaTime;
        }

        // Prevent jumping over the height limit.
        if (this.isFacingStepOver()) {
            this._playerVelocity.y += this.gravityValue * deltaTime;
            this._playerVelocity.x = 0;
            this._playerVelocity.z = 1;
        }

        Vec3.multiplyScalar(this._movement, this._playerVelocity, deltaTime);
        this._cct!.move(this._movement);

        if (this._grounded) {
            this._playerVelocity.y = 0;
        }
    }

    isFacingStepOver() {
        // Ray start point is the bottom of the character.
        const position = this.node.position;
        let outRay = new geometry.Ray(position.x, position.y - 1, position.z + 0.5, 0, 0, -1);
        PhysicsSystem.instance.raycastClosest(outRay, 0xffffffff, 0.2);

        let hitForwardNode: Node | null = null;
        // max distance should be 1, as the step width is 1. We want to check the edge situation.
        if (PhysicsSystem.instance.raycastClosest(outRay, 0xffffffff, 1, true)) {
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const collider = raycastClosestResult.collider;            
            if (!this.isStair(collider.node)) {
                return false;
            }
            hitForwardNode = collider.node;
        }

        outRay = new geometry.Ray(position.x, position.y, position.z, 0, -1, 0);
        if (PhysicsSystem.instance.raycastClosest(outRay, 0xffffffff, 10)) {
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const collider = raycastClosestResult.collider;            
            const hitGroundNode = collider.node;

            if (hitForwardNode) {
                return (hitForwardNode.worldPosition.y - hitGroundNode.worldPosition.y) > this._cct!.stepOffset;
            }
        }

        return false;
    }

    private isStair(node: Node) {
        let parent = node.parent;
        while (parent) {
            if (parent.name === '台阶测试') {
                return true;
            }
            parent = parent.parent;
        }
        return false;
    }
}


