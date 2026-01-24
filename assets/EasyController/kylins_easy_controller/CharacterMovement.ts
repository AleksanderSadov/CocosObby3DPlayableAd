import { _decorator, Component, RigidBody, find, Camera, SkeletalAnimation, ICollisionEvent, CapsuleCollider } from 'cc';
import { EasyController, EasyControllerEvent } from './EasyController';
import { CharacterAbstractState } from '../../Scripts/ObbyCharacterController/CharacterStates/CharacterAbstractState';
import { CharacterAirState } from '../../Scripts/ObbyCharacterController/CharacterStates/CharacterAirState';
import { GroundCheck } from '../../Scripts/ObbyCharacterController/GroundCheck';
import { ClimbableCheck } from '../../Scripts/ObbyCharacterController/ClimbableCheck';
const { ccclass, property } = _decorator;

// Это на основе EasyController плагина, но модифицировал (добавил карабканье, groundCheck и тд) и зарефакторил (стейт машин и разделение логики) для лучшей читаемости
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

    private _rb: RigidBody;
    private _collider: CapsuleCollider;
    private _groundCheck: GroundCheck;
    private _climbableCheck: ClimbableCheck;

    protected onLoad(): void {
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
        EasyController.on(EasyControllerEvent.MOVEMENT, this.onMoveInput, this);
        EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this.onMoveInputStop, this);
        EasyController.on(EasyControllerEvent.BUTTON, this.onButton, this);
    }

    protected onDisable(): void {
        this._collider.off('onCollisionEnter', this._onCollisionEnter, this);
        EasyController.off(EasyControllerEvent.MOVEMENT, this.onMoveInput, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onMoveInputStop, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onButton, this);
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

    update(deltaTime: number) {
        // deltaTime = PhysicsSystem.instance.fixedTimeStep; // TODO: Использовать ли fixedTimeStep?
        this._groundCheck.check();
        this._climbableCheck.check();
        this._currentState.updateState(deltaTime);
    }

    @property({readonly: true, visible: true, serializable: false})
    public _moveInputDegree: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public _moveInputOffset: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public _moveInputSinus: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public _moveInputCosinus: number = 0;

    onMoveInput(degree: number, offset: number) {
        this._moveInputDegree = degree;
        this._moveInputOffset = offset;
        const rad = degree * Math.PI / 180;
        this._moveInputCosinus = Math.cos(rad) * offset;
        this._moveInputSinus = Math.sin(rad) * offset;
        this._currentState.onMoveInput(degree, offset);
    }

    onMoveInputStop() {
        this._moveInputDegree = this._moveInputOffset = 0;
        this._moveInputSinus = this._moveInputCosinus = 0;
        this._currentState.onMoveInputStop();
    }

    onButton(btnName: string) {
        if (btnName == 'btn_slot_0') {
            this._currentState.onJump();
            return;
        }
    }
}

