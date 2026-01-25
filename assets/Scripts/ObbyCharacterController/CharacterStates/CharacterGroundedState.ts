import { _decorator, AnimationClip, Vec3 } from 'cc';
import { CharacterAirState } from './CharacterAirState';
import { CharacterAbstractState } from './CharacterAbstractState';
import { CharacterClingState } from './CharacterClingState';
const { ccclass, property } = _decorator;

@ccclass('CharacterGroundedState')
export class CharacterGroundedState extends CharacterAbstractState {
    @property(AnimationClip)
    idleAnimClip: AnimationClip;

    @property(AnimationClip)
    moveAnimClip: AnimationClip;

    protected onLoad(): void {
        super.onLoad();
        this.initClips([this.idleAnimClip, this.moveAnimClip]);
    }

    onEnter() {
        if (this._input.offset > 0) {
            this._anim.crossFade(this.moveAnimClip.name, 0.5);
        } else {
            this._anim.crossFade(this.idleAnimClip.name, 0.5);
        }
    }

    public updateState(deltaTime: number) {
        if (!this._groundCheck.isGroundBelow) {
            this._cm.setState(CharacterAirState);
            return;
        }

        if (this._climbableCheck.canClimb) {
            this._cm.setState(CharacterClingState);
            return;
        }

        this._baseMovement();
    }

    public onMoveInput(degree: number, offset: number): void {
        this._baseLookRotate(degree);
        const moveAnimState = this._anim.getState(this.moveAnimClip.name);
        if (!moveAnimState.isPlaying) {
            this._anim.crossFade(this.moveAnimClip.name, 0.1);
        }
        moveAnimState.speed = offset;
    }

    public onMoveInputStop(): void {
        this._rb.setLinearVelocity(Vec3.ZERO);
        this._anim.crossFade(this.idleAnimClip.name);
    }

    public onJump() {
        this._cm.setState(CharacterAirState, {doJump: true});
    }
}
