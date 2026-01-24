import { _decorator, AudioClip } from 'cc';
import { CharacterGroundedState } from './CharacterGroundedState';
import { CharacterClingState } from './CharacterClingState';
import { CharacterAbstractState } from './CharacterAbstractState';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('CharacterAirState')
export class CharacterAirState extends CharacterAbstractState {
    @property
    public jumpSpeed = 60;
    @property
    public jumpAccelerationTime = 0.1;
    @property
    public allowMoveInAir = true;

    @property(AudioClip)
    public jumpSound: AudioClip;

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
        // this.node.on(CustomNodeEvent.CLIMBABLE_WALL_ENTER, this.clingToWall, this);
    }

    updateState(deltaTime: number) {
        this.baseGravity(deltaTime);

        if (this._occt._doJump) {
            GlobalEventBus.emit(GameEvent.PLAY_SOUND, 'jump');
            this._occt._doJump = false;
            this._jumpAccelerationCountdown = this.jumpAccelerationTime;
        }

        // TODO можно лучше организовать эту логику с отрывом от стены, но пока так
        if (this._occt._doClingDetachJump) {
            GlobalEventBus.emit(GameEvent.PLAY_SOUND, 'jump');
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
            this.baseHorizontalVelocity();
            this.baseHorizontalDamping();
        }

        this.baseMove(deltaTime);

        if (this._occt._grounded) {
            this._occt.setState(CharacterGroundedState);
            return;
        }
    }

    public onExit(nextState?: CharacterAbstractState): void {
        this.resetFlags();
        this.resetCountdowns();
        // this.node.off(CustomNodeEvent.CLIMBABLE_WALL_ENTER, this.clingToWall, this);
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

    private clingToWall() {
        this._occt.setState(CharacterClingState);
    }
}
