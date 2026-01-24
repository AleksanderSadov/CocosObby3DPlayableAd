import { _decorator, AnimationClip, Component, ICollisionEvent, RigidBody, SkeletalAnimation } from 'cc';
import { CharacterMovement } from 'db://assets/EasyController/kylins_easy_controller/CharacterMovement';
import { v3_0, v3_1 } from '../../General/Constants';
import { GroundCheck } from '../GroundCheck';
import { ClimbableCheck } from '../ClimbableCheck';
const { ccclass } = _decorator;

@ccclass('CharacterAbstractState')
export abstract class CharacterAbstractState extends Component {
    protected _cm: CharacterMovement;
    protected _rigidBody: RigidBody;
    protected _anim: SkeletalAnimation;
    protected _groundCheck: GroundCheck;
    protected _climbableCheck: ClimbableCheck;

    protected onLoad(): void {
        this._cm = this.getComponent(CharacterMovement);
        this._rigidBody = this.getComponent(RigidBody);
        this._anim = this._cm.anim;
        this._groundCheck = this.getComponent(GroundCheck);
        this._climbableCheck = this.getComponent(ClimbableCheck);
    }

    public onEnter(prevState?: CharacterAbstractState, payload?: any): void {}
    public onExit(nextState?: CharacterAbstractState): void {}
    public updateState(deltaTime: number): void {}
    public onMoveInput(degree: number, offset: number): void {}
    public onMoveInputStop(): void {}
    public onCollisionEnter(event: ICollisionEvent): void {}
    public onJump(): void {}
    public onRespawn(): void {}

    protected _baseMovement() {
        if (this._cm._moveInputOffset <= 0) {
            return;
        }
        const currentVelocity = v3_0;
        this._rigidBody.getLinearVelocity(currentVelocity);
        const newVelocity = v3_1;
        newVelocity.set(this.node.forward);
        newVelocity.multiplyScalar(this._cm.maxVelocity * this._cm._moveInputOffset);
        newVelocity.y = currentVelocity.y;
        this._rigidBody.setLinearVelocity(newVelocity);
    }

    protected _baseLookRotate(degree: number) {
        const cameraRotationY = this._cm.mainCamera.node.eulerAngles.y;
        const uiToGame = -90; // //In a 2D interface, the x-axis is 0, while in a 3D scene, the area directly in front is 0, so a -90 degree rotation is needed. (Rotate 90 degrees clockwise)
        v3_0.set(0, cameraRotationY + degree + uiToGame, 0);
        this.node.setRotationFromEuler(v3_0);
    }

    protected initClips(clips: AnimationClip[]) {
        for (let i = 0; i < clips.length; ++i) {
            const clip = clips[i];
            if (!this._anim.getState(clip.name)) {
                this._anim.addClip(clip);
            }
        }
    }
}
