import { _decorator, AnimationClip, AudioClip, Vec3 } from 'cc';
import { CharacterGroundedState } from './CharacterGroundedState';
import { CharacterClingState } from './CharacterClingState';
import { CharacterAbstractState } from './CharacterAbstractState';
import { v3_0, v3_1 } from '../../General/Constants';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('CharacterAirState')
export class CharacterAirState extends CharacterAbstractState {
    @property
    jumpVelocity = 1.0;

    @property
    maxJumpTimes: number = 1;

    @property({readonly: true, visible: true, serializable: false})
    private _curJumpTimes: number = 0;

    @property(AnimationClip)
    jumpBeginAnimClip: AnimationClip;

    @property(AnimationClip)
    jumpLoopAnimClip: AnimationClip;

    @property(AnimationClip)
    jumpLandAnimClip: AnimationClip;

    @property(AudioClip)
    public jumpSound: AudioClip;

    @property
    public detachJumpVelocity = 6;
    @property
    public detachPushBackVelocity = 2;

    protected onLoad(): void {
        super.onLoad();
        this.initClips([this.jumpBeginAnimClip, this.jumpLoopAnimClip, this.jumpLandAnimClip]);
    }

    public onEnter(prevState?: CharacterAbstractState, payload?: any): void {
        this._anim.crossFade(this.jumpBeginAnimClip.name);

        if (payload?.doJump) {
            this._jump();
        } else if (payload?.doDetach) {
            this._detach();
        }
    }

    updateState(deltaTime: number) {
        if (this._groundCheck.isGroundBelow) {
            this._onLand();
            return;
        }

        if (this._climbableCheck.canClimb) {
            this._cm.setState(CharacterClingState);
            return;
        }

        // гравитация расчитывается сама через rigidbody
        this._baseMovement();
        const state = this._anim.getState(this.jumpBeginAnimClip.name);
        if (state.isPlaying && state.current >= state.duration) {
            this._anim.crossFade(this.jumpLoopAnimClip.name);
        }
    }

    public onMoveInput(degree: number, offset: number): void {
        this._baseLookRotate(degree);
    }

    public onExit(nextState?: CharacterAbstractState): void {
        this.resetFlags();
    }

    public beforeRespawn() {
        this.resetFlags();
    }

    private resetFlags() {
        this._curJumpTimes = 0;
    }

    public onJump() {
        // Пока не разрешаю двойной прыжок
        // this._jump();
    }

    private _jump() {
        if (this._curJumpTimes >= this.maxJumpTimes) {
            return;
        }

        this._cm.playSound('jump');
        this._curJumpTimes++;
        const newVelocity = v3_0;
        this._rb.getLinearVelocity(newVelocity);
        newVelocity.y = this.jumpVelocity;
        this._rb.setLinearVelocity(newVelocity);

        const jumpBeginState = this._anim.getState(this.jumpBeginAnimClip.name);
        const jumpLoopState = this._anim.getState(this.jumpLoopAnimClip.name);
        if (jumpBeginState.current || jumpLoopState.current) {
            return;
        }
        this._anim.crossFade(this.jumpBeginAnimClip.name);
    }

    private _detach() {
        this._cm.playSound('jump');
        const newVelocity = v3_0.set(Vec3.ZERO);
        newVelocity.y = this.detachJumpVelocity;
        const back = v3_1.set(this.node.forward).negative();
        back.multiplyScalar(this.detachPushBackVelocity);
        newVelocity.x = back.x;
        newVelocity.z = back.z;
        this._rb.setLinearVelocity(newVelocity);

        const jumpBeginState = this._anim.getState(this.jumpBeginAnimClip.name);
        const jumpLoopState = this._anim.getState(this.jumpLoopAnimClip.name);
        if (jumpBeginState.current || jumpLoopState.current) {
            return;
        }
        this._anim.crossFade(this.jumpBeginAnimClip.name);
    }

    private _onLand() {
        this._anim.crossFade(this.jumpLandAnimClip.name);
        this._cm.setState(CharacterGroundedState);
    }
}
