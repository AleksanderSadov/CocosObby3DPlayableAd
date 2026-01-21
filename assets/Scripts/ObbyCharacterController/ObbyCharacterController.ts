import {
    _decorator, Component, Node, CharacterController, Vec3, PhysicsSystem, CharacterControllerContact, geometry
} from 'cc';
import { CustomNodeEvent } from '../Events/CustomNodeEvents';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
import { StateComponent } from '../States/StateComponent';
const { ccclass, property } = _decorator;

// За основу взят пример из документации: https://docs.cocos.com/creator/3.8/manual/en/cases-and-tutorials/ -> Examples of Physics -> case-character-controller
// Буду модифицировать по мере необходимости

// TODO Камера: камеру пока поставил по простому следовать за персонажем, надо будет реализовать свободное вращение камеры

@ccclass('ObbyCharacterController')
export class ObbyCharacterController extends Component {
    @property
    public speed: number = 0.5;
    @property
    public gravity = -9.81;
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
    public _movement = new Vec3(0,0,0);
    @property({visible: true})
    public get _grounded() {
        return this._cct?.isGrounded;
    }
    @property({readonly: true, visible: true, serializable: false})
    public _playerVelocity = new Vec3(0,0,0);
    public _doJump = false;

    private _currentState: StateComponent = null;
    @property({visible: true})
    private get _currentStateName(): string {
        return this._currentState?.constructor?.name ?? 'None';
    }

    onLoad () {
        this._initialPosition = this.node.position.clone(); // TODO code completion постоянно советует при копировании позиций использовать clone(), надо бы явным тестом протестировать такую необходимость чтобы разобраться. Потому что Vec3 — это mutable reference-type, и без clone() ты часто работаешь с той же самой ссылкой, а не с копией?
        this._cct = this.node.getComponent(CharacterController)!;
        this.setState('AirState'); // пока по простому будем считать что всегда стартуем в воздухе
    }

    public setState(stateName: string) {
        // TODO можно избавиться от строк и сразу по типам
        // TODO можно кэшировать состояния чтобы не искать каждый раз
        const next = this.getComponent(stateName) as StateComponent;
        if (this._currentState === next) {
            return;
        }
        const prev = this._currentState;
        if (prev) {
            prev.onExit(next);
        }
        this._currentState = next;
        this._currentState.onEnter(prev);
    }

    onEnable() {
        this._cct.on('onControllerColliderHit', this.onControllerColliderHit, this);
        this.node.on(CustomNodeEvent.NODE_FELL, this.onPlayerFell, this);
    }

    onDisable() {
        this._cct.off('onControllerColliderHit', this.onControllerColliderHit, this);
        this.node.off(CustomNodeEvent.NODE_FELL, this.onPlayerFell, this);
    }

    onControllerColliderHit(hit: CharacterControllerContact) {
        this._currentState.onControllerColliderHit(hit);
    }

    private onPlayerFell(event: any) {
        // Reset internal movement flags/velocity immediately
        this._playerVelocity.set(0, 0, 0);
        GlobalEventBus.emit(GameEvent.REQUEST_RESPAWN, { characterController: this._cct, defaultSpawn: this._initialPosition });
    }

    jump() {
        this._currentState.onJump();
    }

    update(deltaTime: number) {
        deltaTime = PhysicsSystem.instance.fixedTimeStep;
        this._currentState.updateState(deltaTime);
    }

    // TODO это из примера кокоса, пока не до конца понял необходимость этой логики. Например isFacingStepOver true когда персонаж упирается в большую ступеньку в примере кокоса
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

    // это код из примера кокоса про отталкивание предметов, пока не использую, но оставлю
    private onColliderPush(hit: CharacterControllerContact) {
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
}
