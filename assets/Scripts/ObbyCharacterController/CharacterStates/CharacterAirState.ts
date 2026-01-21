import { _decorator, Vec3 } from 'cc';
import { CharacterGroundedState } from './CharacterGroundedState';
import { CharacterClingState } from './CharacterClingState';
import { CharacterAbstractState } from './CharacterAbstractState';
const { ccclass, property } = _decorator;

@ccclass('CharacterAirState')
export class CharacterAirState extends CharacterAbstractState {
    @property
    public jumpSpeed = 60;
    @property
    public jumpAccelerationTime = 0.1;
    @property
    public allowMoveInAir = true;
    @property({readonly: true, visible: true, serializable: false})
    public _jumpAccelerationCountdown = 0;

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

    public onEnter(prevState?: CharacterAbstractState): void {
        this.resetCountdowns();
    }

    updateState(deltaTime: number) {
        this._occt._playerVelocity.y += this._occt.gravity * deltaTime;

        if (this._occt._doJump) {
            this._occt._doJump = false;
            this._jumpAccelerationCountdown = this.jumpAccelerationTime;
        }

        // TODO можно лучше организовать эту логику с отрывом от стены, но пока так
        if (this._occt._doClingDetachJump) {
            this._occt._doClingDetachJump = false;
            this._detachJumpCountdown = this.detachJumpTime;
            this._detachPushBackCountdown = this.detachPushBackTime;
        }

        if (this._jumpAccelerationCountdown > 0) {
            this._jumpAccelerationCountdown = Math.max(this._jumpAccelerationCountdown - deltaTime, 0);
            this._occt._playerVelocity.y += this.jumpSpeed * deltaTime;
        }

        if (this._detachJumpCountdown > 0) {
            this._detachJumpCountdown = Math.max(this._detachJumpCountdown - deltaTime, 0);
            this._occt._playerVelocity.y += this.detachJumpSpeed * deltaTime;
        }

        if (this._detachPushBackCountdown > 0) {
            this._detachPushBackCountdown = Math.max(this._detachPushBackCountdown - deltaTime, 0);
            // TODO пока достаточно отталкиваться просто по оси Z относительно мира, но можно сделать по нормали стены
            this._occt._playerVelocity.z += this.detachPushBackSpeed * deltaTime;
            if (!this.allowMoveInAir) {
                this._occt._playerVelocity.x *= this._occt.linearDamping;
                this._occt._playerVelocity.z *= this._occt.linearDamping;
            }
        }

        if (this.allowMoveInAir) {
            this._occt._playerVelocity.z += -this._occt.control_z * this._occt.speed;
            this._occt._playerVelocity.x += -this._occt.control_x * this._occt.speed;

            this._occt._playerVelocity.x *= this._occt.linearDamping;
            this._occt._playerVelocity.z *= this._occt.linearDamping;
        }

        Vec3.multiplyScalar(this._occt._movement, this._occt._playerVelocity, deltaTime);
        this._cct!.move(this._occt._movement);

        if (this._occt._grounded) {
            this._occt.setState(CharacterGroundedState);
            return;
        }
    }

    public onExit(nextState?: CharacterAbstractState): void {
        this.resetFlags();
        this.resetCountdowns();
    }

    public onRespawn() {
        this._occt._playerVelocity.set(0, 0, 0);
        this.resetFlags();
        this.resetCountdowns();
    }

    private resetFlags() {
        this._occt._doJump = this._occt._doClingDetachJump = false;
    }

    private resetCountdowns() {
        this._jumpAccelerationCountdown = this._detachJumpCountdown = this._detachPushBackCountdown = 0;
    }

    public onControllerColliderHit(hit: any) {
        // пока только в полете приклепляемся к стенам
        if (this._occt._grounded) {
            return;
        }
        const climbableWall = hit.collider.node.getComponent('ClimbableWall');
        if (!climbableWall) {
            return;
        }
        // TODO checkNormal проверку предложил ИИ, но пока не использую для простоты, потом можно еще раз глянуть
        // const checkNormal = Math.abs(hit.worldNormal.y) < 0.3 && (Math.abs(hit.worldNormal.x) > 0.7 || Math.abs(hit.worldNormal.z) > 0.7);
        this._occt.setState(CharacterClingState);
    }
}
