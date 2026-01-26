import { _decorator, AnimationClip, Component, RigidBody, SkeletalAnimation, Vec3 } from 'cc';
import { v3_0, v3_1, v3_2, v3_3 } from '../../General/Constants';
import { GroundCheck } from '../GroundCheck';
import { ClimbableCheck } from '../ClimbableCheck';
import { AbstractController } from '../AbstractController';
const { ccclass } = _decorator;

@ccclass('CharacterAbstractState')
export abstract class CharacterAbstractState extends Component {
    protected _controller: AbstractController;
    protected _rb: RigidBody;
    protected _anim: SkeletalAnimation;
    protected _groundCheck: GroundCheck;
    protected _climbableCheck: ClimbableCheck;

    protected onLoad(): void {
        this._controller = this.getComponent(AbstractController);
        this._rb = this.getComponent(RigidBody);
        this._anim = this._controller.anim;
        this._groundCheck = this.getComponent(GroundCheck);
        this._climbableCheck = this.getComponent(ClimbableCheck);
    }

    public onEnter(prevState?: CharacterAbstractState, payload?: any): void {}
    public onExit(nextState?: CharacterAbstractState): void {}
    public updateState(deltaTime: number): void {}
    public onMoveInput(degree: number, offset: number): void {}
    public onMoveInputStop(): void {}
    public onJump(): void {}
    public beforeRespawn(): void {}

    protected _baseMovement() {
        if (this._controller.inputOffset <= 0) {
            return;
        }
        const currentVelocity = v3_0;
        this._rb.getLinearVelocity(currentVelocity);
        const newVelocity = v3_1;
        newVelocity.set(this.node.forward);
        newVelocity.multiplyScalar(this._controller.maxVelocity * this._controller.inputOffset);
        newVelocity.y = currentVelocity.y;

        // Проблема: Если персонаж прыгнул в стену, то когда задаем скорость по направлению к стене тогда персонаж застревал в стене из за трения
        // У персонажа friction = 0, но этого недостаточно, т.к. учитывается и friction объектов. Уже видно, что мы не скользим по полу, а учитывается friction пола
        // Сделать все скользким не подходит, т.к. будем скользить по полу. Сделать все стены скользкими тоже неудобно т.к. придется за этим следить
        // Решение: Убирать скорость в направлении стены
        // Пока удобно переиспользовать проверку на стены через climbableCheck
        if (this._climbableCheck.fixStuckInWall && this._climbableCheck.hitNode) {
            const wallHitNormal = v3_2.set(this._climbableCheck.hitNormal);
            const pushTowardWall = Vec3.dot(newVelocity, wallHitNormal);
            if (pushTowardWall < 0) {
                const correction = v3_3;
                correction.set(wallHitNormal.multiplyScalar(pushTowardWall));
                newVelocity.subtract(correction);
            }
        }

        // В EasyController по умолчанию в rigidBody был выставлен Angular Factor (0, 1, 0), то есть разрешали физике поворачивать персонажа влево/вправоe
        // Проблема: если бежать в стену то прямо на угле персонажа поворачивало к стене. Опять наверное проблема, что задаем движение скоростью в стену
        // Так же эта проблема заметна с текущей реализацией карабканья и отцепления на краю стены
        // Решение: пока не требуется отключить повороты персонажа физикой, т.е. выставить Angular Factor (0, 0, 0)

        this._rb.setLinearVelocity(newVelocity);
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
