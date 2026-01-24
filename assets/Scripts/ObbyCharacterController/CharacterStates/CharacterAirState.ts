import { _decorator, AnimationClip, AudioClip, ICollisionEvent } from 'cc';
import { CharacterGroundedState } from './CharacterGroundedState';
import { CharacterClingState } from './CharacterClingState';
import { CharacterAbstractState } from './CharacterAbstractState';
import { v3_0 } from '../../General/Constants';
const { ccclass, property } = _decorator;

@ccclass('CharacterAirState')
export class CharacterAirState extends CharacterAbstractState {
    @property
    jumpVelocity = 1.0;

    @property
    maxJumpTimes: number = 2;

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
    public detachJumpSpeed = 60;
    @property
    public detachJumpTime = 0.1;
    @property({readonly: true, visible: true, serializable: false})
    public _detachJumpCountdown = 0;

    @property
    public detachPushBackSpeed = 120;
    @property
    public detachPushBackTime = 1.5;
    @property({readonly: true, visible: true, serializable: false})
    public _detachPushBackCountdown = 0;

    protected onLoad(): void {
        super.onLoad();
        this.initClips([this.jumpBeginAnimClip, this.jumpLoopAnimClip, this.jumpLandAnimClip]);
    }

    public onEnter(prevState?: CharacterAbstractState, payload?: any): void {
        this._anim.crossFade(this.jumpBeginAnimClip.name);

        if (payload?.doJump) {
            this._jump();
        }
        
        // this.resetCountdowns();
    }

    updateState(deltaTime: number) {
        if (this._groundCheck.isGroundBelow) {
            this._onLand();
            console.log("onLand");
            return;
        }

        if (this._climbableCheck.isClimbableAhead) {
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
        this.resetCountdowns();
    }

    public onRespawn() {
        // this._occt._playerVelocity.set(0, 0, 0);
        this.resetFlags();
        this.resetCountdowns();
    }

    private resetFlags() {
        this._curJumpTimes = 0;
        // this._occt._doJump = this._occt._doClingDetachJump = false;
    }

    private resetCountdowns() {
        // this._jumpAccelerationCountdown = this._detachJumpCountdown = this._detachPushBackCountdown = 0;
    }

    public onCollisionEnter(event: ICollisionEvent): void {
        // TODO Как-то пока слишком просто без проверок как соприкоснулись
        // if (event.otherCollider != event.selfCollider) {
        //     this._onLand();
        // }
    }

    public onJump() {
        this._jump();
    }

    private _jump() {
        if (this._curJumpTimes >= this.maxJumpTimes) {
            return;
        }

        this._curJumpTimes++;
        const newVelocity = v3_0;
        this._rigidBody.getLinearVelocity(newVelocity);
        newVelocity.y = this.jumpVelocity;
        this._rigidBody.setLinearVelocity(newVelocity);

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
