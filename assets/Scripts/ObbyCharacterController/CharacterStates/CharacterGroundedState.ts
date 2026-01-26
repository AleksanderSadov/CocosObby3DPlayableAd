import { _decorator, AnimationClip, Vec3 } from 'cc';
import { CharacterAbstractState } from './CharacterAbstractState';
import { CharacterState } from '../../General/Constants';
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
        if (this._controller.inputOffset > 0) {
            this._anim.crossFade(this.moveAnimClip.name, 0.5);
        } else {
            this._anim.crossFade(this.idleAnimClip.name, 0.5);
        }
    }

    public updateState(deltaTime: number) {
        if (!this._groundCheck.isGroundBelow) {
            this._controller.setState(CharacterState.Air);
            return;
        }

        if (this._climbableCheck.canClimb) {
            this._controller.setState(CharacterState.Cling);
            return;
        }

        this._baseMovement();
    }

    public onMoveInput(degree: number, offset: number): void {
        this._controller.lookAtDegree(degree);
        const moveAnimState = this._anim.getState(this.moveAnimClip.name);
        this._anim.crossFade(this.moveAnimClip.name, 0.1);
        moveAnimState.speed = offset;
    }

    public onMoveInputStop(): void {
        this._rb.setLinearVelocity(Vec3.ZERO);
        this._anim.crossFade(this.idleAnimClip.name);
    }

    public onJump() {
        this._controller.setState(CharacterState.Air, {doJump: true});
    }
}
