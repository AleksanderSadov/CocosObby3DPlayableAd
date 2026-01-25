import { _decorator, AnimationClip, Quat, Vec3 } from 'cc';
import { CharacterAbstractState } from './CharacterAbstractState';
import { CharacterAirState } from './CharacterAirState';
import { rotation, v3_0, v3_1, v3_2 } from '../../General/Constants';
const { ccclass, property } = _decorator;

@ccclass('CharacterClingState')
export class CharacterClingState extends CharacterAbstractState {
    @property
    public climbSpeed = 2.5;

    // пока нет отдельных анимаций для карабканья, переиспользуем от ходьбы
    @property(AnimationClip)
    idleAnimClip: AnimationClip;

    @property(AnimationClip)
    moveAnimClip: AnimationClip;

    protected onLoad(): void {
        super.onLoad();
        this.initClips([this.idleAnimClip, this.moveAnimClip]);
    }

    onEnter(prev?: CharacterAbstractState, payload?: any) {
        this._climbableCheck.isClimbing = true;

        this._rb.useGravity = false;
        this._rb.setLinearVelocity(Vec3.ZERO);
        this._rb.enabled = false;

        const hitNormal = this._climbableCheck.hitNormal;
        const wallForward = v3_0.set(hitNormal).multiplyScalar(1);
        const up = v3_1.set(this.node.up);
        const targetQuat = rotation;
        Quat.fromViewUp(targetQuat, wallForward, up);
        this.node.setRotation(targetQuat);

        if (this._input.offset > 0) {
            this._anim.crossFade(this.moveAnimClip.name, 0.5);
        } else {
            this._anim.crossFade(this.idleAnimClip.name, 0.5);
        }
    }

    updateState(deltaTime: number) {
        if (!this._climbableCheck.canClimb) {
            this._cm.setState(CharacterAirState);
            return;
        }

        const vertical = this._input.sin * this.climbSpeed * deltaTime;
        const horizontal = this._input.cos * this.climbSpeed * deltaTime;
        const localClimb = v3_0.set(horizontal, vertical, 0);
        const worldClimb = v3_1.set();
        Vec3.transformQuat(worldClimb, localClimb, this.node.worldRotation);
        const newPos = v3_2.set(this.node.position);
        newPos.add(worldClimb);
        this.node.setPosition(newPos);
    }

    public onMoveInput(degree: number, offset: number): void {
        // this._baseLookRotate(degree); // персонажа специально не поворачиваем чтобы смотрел только в стену
        const moveAnimState = this._anim.getState(this.moveAnimClip.name);
        if (!moveAnimState.isPlaying) {
            this._anim.crossFade(this.moveAnimClip.name, 0.1);
        }
        moveAnimState.speed = offset;
    }

    public onExit(nextState?: CharacterAbstractState): void {
        this._climbableCheck.isClimbing = false;
        this._climbableCheck.startClingCooldown();
        if (this._input.offset > 0) {
            // offset > 0, значит есть инпут движения и поворачиваемся в сторону движения
            // Если не повернуть персонажа, то была проблема на краю застревали в стене
            this._baseLookRotate(this._input.degree); 
        } else {
            // Инпута движения в сторону не было, поворачивать персонажа не надо. Например если нажать только прыжок для отскока от стены
        }
        this._rb.useGravity = true;
        this._rb.enabled = true;
    }

    public onRespawn() {
        // this._occt._playerVelocity.set(0, 0, 0);
    }

    public onJump() {
        this._cm.setState(CharacterAirState, {doDetach: true});
    }
}
