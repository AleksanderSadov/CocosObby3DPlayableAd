import { _decorator, Camera, CapsuleCollider, Component, find, ICollisionEvent, ITriggerEvent, Node, RigidBody, SkeletalAnimation, Vec3 } from 'cc';
import { CharacterAirState } from '../CharacterStates/CharacterAirState';
import { CharacterAbstractState } from '../CharacterStates/CharacterAbstractState';
import { EDITOR, EDITOR_NOT_IN_PREVIEW } from 'cc/env';
import { GroundCheck } from '../GroundCheck';
import { ClimbableCheck } from '../ClimbableCheck';
import { Hazard } from '../../Obstacles/Hazard';
import { CustomNodeEvent } from '../../Events/CustomNodeEvents';
const { ccclass, property } = _decorator;

// Это на основе EasyController плагина, но модифицировал (добавил карабканье, проверку земли, правку застревания в стене в прыжке из-за трения и др) и зарефакторил (стейт машин и разделение логики) для лучшей читаемости
@ccclass('CharacterInputProcessor')
export abstract class CharacterInputProcessor extends Component {
    @property
    isPlayer = false;
    @property(Camera)
    mainCamera: Camera;
    @property
    maxVelocity = 4.0;

    @property(SkeletalAnimation)
    public anim: SkeletalAnimation;

    @property(Node)
    public spawnTarget: Node | null = null;
    @property
    public spawnOffsetY = 1;

    protected _rb: RigidBody;
    protected _collider: CapsuleCollider;
    protected _groundCheck: GroundCheck;
    protected _climbableCheck: ClimbableCheck;

    @property({readonly: true, visible: true, serializable: false})
    public inputDegree: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public inputOffset: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public inputSin: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public inputCos: number = 0;

    protected _states: Map<new (...args: any[]) => CharacterAbstractState, CharacterAbstractState> = new Map();
    protected _currentState: CharacterAbstractState = null;
    @property
    public get currentStateName(): string {
        return this._currentState?.constructor?.name ?? 'None';
    }
    @property({readonly: true, visible: true, serializable: false})
    protected _velocity: Vec3 = new Vec3();
    @property({readonly: true, visible: true, serializable: false})
    protected _angularVelocity: Vec3 = new Vec3();

    @property
    protected get editorRespawn() { return false }
    protected set editorRespawn(value) {
        if (EDITOR && !EDITOR_NOT_IN_PREVIEW) {
            return;
        }
        this._onRespawn();
    }

    protected onLoad(): void {
        if (this.spawnTarget) {
            this.node.setWorldPosition(this.spawnTarget.worldPosition);
        }
        if (!this.mainCamera) {
            this.mainCamera = find('Main Camera')?.getComponent(Camera);
        }
        this._rb = this.node.getComponent(RigidBody);
        this._collider = this.getComponent(CapsuleCollider);
        this._groundCheck = this.getComponent(GroundCheck);
        this._climbableCheck = this.getComponent(ClimbableCheck);
    }

    protected onEnable(): void {
        this._collider.on('onCollisionEnter', this._onCollisionEnter, this);
        this._collider.on('onTriggerEnter', this._onTriggerEnter, this);
        this.node.on(CustomNodeEvent.NODE_FELL, this._onCharacterFell, this);
    }

    protected onDisable(): void {
        this._collider.off('onCollisionEnter', this._onCollisionEnter, this);
        this._collider.off('onTriggerEnter', this._onTriggerEnter, this);
        this.node.off(CustomNodeEvent.NODE_FELL, this._onCharacterFell, this);
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
    }

    private _onTriggerEnter(event: ITriggerEvent) {
        const hazard = event.otherCollider.getComponent(Hazard);
        if (hazard) {
            this._onRespawn();
            return;
        }
    }

    update(deltaTime: number) {
        // deltaTime = PhysicsSystem.instance.fixedTimeStep; // TODO: Использовать ли fixedTimeStep?
        this._groundCheck.check();
        this._climbableCheck.updateState(deltaTime);
        this._currentState.updateState(deltaTime);
        this._rb.getLinearVelocity(this._velocity);
        this._rb.getAngularVelocity(this._angularVelocity);
    }

    protected _onMoveInput(degree: number, offset: number) {
        this.inputDegree = degree;
        this.inputOffset = offset;
        const rad = degree * Math.PI / 180;
        this.inputCos = Math.cos(rad) * offset;
        this.inputSin = Math.sin(rad) * offset;
        this._currentState.onMoveInput(degree, offset);
    }

    protected _onMoveInputStop() {
        this.inputDegree = this.inputOffset = 0;
        this.inputSin = this.inputCos = 0;
        this._currentState.onMoveInputStop();
    }

    protected _onButton(btnName: string) {
        if (btnName == 'btn_slot_0') {
            this._currentState.onJump();
            return;
        }
    }

    private _onCharacterFell() {
        this._onRespawn();
    }

    private _onRespawn(): void {};

    public lookAtDegree(degree: number) {};
    public playSound(clipName: string, volume: number = 1): void {};
}
