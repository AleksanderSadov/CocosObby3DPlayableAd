import { _decorator, Component, RigidBody, find, Camera, SkeletalAnimation, ICollisionEvent, CapsuleCollider, Vec3, ITriggerEvent, PhysicsGroup } from 'cc';
import { CharacterAbstractState } from '../../Scripts/ObbyCharacterController/CharacterStates/CharacterAbstractState';
import { CharacterAirState } from '../../Scripts/ObbyCharacterController/CharacterStates/CharacterAirState';
import { GroundCheck } from '../../Scripts/ObbyCharacterController/GroundCheck';
import { ClimbableCheck } from '../../Scripts/ObbyCharacterController/ClimbableCheck';
import { CharacterInputProcessor } from '../../Scripts/ObbyCharacterController/CharacterInputProcessor';
import { GameEvent, GlobalEventBus } from '../../Scripts/Events/GlobalEventBus';
import { CustomNodeEvent } from '../../Scripts/Events/CustomNodeEvents';
import { Hazard } from '../../Scripts/Obstacles/Hazard';
const { ccclass, property } = _decorator;

// Это на основе EasyController плагина, но модифицировал (добавил карабканье, проверку земли, правку застревания в стене в прыжке из-за трения и др) и зарефакторил (стейт машин и разделение логики) для лучшей читаемости
@ccclass('CharacterMovement')
export class CharacterMovement extends Component {
    @property(Camera)
    mainCamera: Camera;
    @property
    maxVelocity = 1.0;

    @property(SkeletalAnimation)
    public anim: SkeletalAnimation;

    private _states: Map<new (...args: any[]) => CharacterAbstractState, CharacterAbstractState> = new Map();
    private _currentState: CharacterAbstractState = null;
    @property({visible: true})
    private get _currentStateName(): string {
        return this._currentState?.constructor?.name ?? 'None';
    }
    @property({readonly: true, visible: true, serializable: false})
    private _velocity: Vec3 = new Vec3();
    @property({readonly: true, visible: true, serializable: false})
    private _angularVelocity: Vec3 = new Vec3();

    @property
    private get editorRespawn() { return false }
    private set editorRespawn(value) { this._respawn() }

    private _rb: RigidBody;
    private _collider: CapsuleCollider;
    private _inputProcessor: CharacterInputProcessor;
    private _groundCheck: GroundCheck;
    private _climbableCheck: ClimbableCheck;
    private _initialSpawn = new Vec3();

    protected onLoad(): void {
        this._initialSpawn.set(this.node.worldPosition);
        if (!this.mainCamera) {
            this.mainCamera = find('Main Camera')?.getComponent(Camera);
        }
        this._rb = this.node.getComponent(RigidBody);
        this._collider = this.getComponent(CapsuleCollider);
        this._inputProcessor = this.getComponent(CharacterInputProcessor);
        this._inputProcessor.init(this);
        this._groundCheck = this.getComponent(GroundCheck);
        this._climbableCheck = this.getComponent(ClimbableCheck);
    }

    protected onEnable(): void {
        this._collider.on('onCollisionEnter', this._onCollisionEnter, this);
        this._collider.on('onTriggerEnter', this._onTriggerEnter, this);
        this.node.on(CustomNodeEvent.NODE_FELL, this._onPlayerFell, this);
    }

    protected onDisable(): void {
        this._collider.off('onCollisionEnter', this._onCollisionEnter, this);
        this._collider.off('onTriggerEnter', this._onTriggerEnter, this);
        this.node.off(CustomNodeEvent.NODE_FELL, this._onPlayerFell, this);
    }

    start() {
        this.setState(CharacterAirState); // пока по простому будем считать что всегда стартуем в воздухе
    }

    public setState(stateCtor: new (...args: any[]) => CharacterAbstractState, payload?: any) {
        let next = this._states.get(stateCtor);
        if (!next) {
            next = this.getComponent(stateCtor);
            this._states.set(stateCtor, next);
        }
        if (this._currentState === next) {
            return;
        }
        const prev = this._currentState;
        if (prev) {
            prev.onExit(next);
        }
        this._currentState = next;
        this._currentState.onEnter(prev, payload);
    }

    private _onCollisionEnter(event: ICollisionEvent) {
        this._currentState.onCollisionEnter(event);
    }

    private _onTriggerEnter(event: ITriggerEvent) {
        const hazard = event.otherCollider.getComponent(Hazard);
        if (hazard) {
            this._respawn();
            return;
        }
        this._currentState.onTriggerEnter(event);
    }

    update(deltaTime: number) {
        // deltaTime = PhysicsSystem.instance.fixedTimeStep; // TODO: Использовать ли fixedTimeStep?
        this._groundCheck.check();
        this._climbableCheck.updateState(deltaTime);
        this._currentState.updateState(deltaTime);
        this._rb.getLinearVelocity(this._velocity);
        this._rb.getAngularVelocity(this._angularVelocity);
    }

    onMoveInput(degree: number, offset: number) {
        this._currentState.onMoveInput(degree, offset);
    }

    onMoveInputStop() {
        this._currentState.onMoveInputStop();
    }

    onButton(btnName: string) {
        if (btnName == 'btn_slot_0') {
            this._currentState.onJump();
            return;
        }
    }

    private _respawn() {
        this._rb.setLinearVelocity(Vec3.ZERO);
        GlobalEventBus.emit(GameEvent.REQUEST_RESPAWN, {node: this.node, defaultSpawn: this._initialSpawn});
    }

    private _onPlayerFell() {
        this._respawn();
    }
}

