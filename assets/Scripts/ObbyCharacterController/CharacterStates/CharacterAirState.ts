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
    public jumpAccelTime = 0.1;

    @property
    public allowMoveInAir = true;

    @property({readonly: true, visible: true, serializable: false})
    public _jumpAccelCountdown = 0;

    updateState(deltaTime: number) {
        this._occt._playerVelocity.y += this._occt.gravity * deltaTime;

        if (this._occt._doJump) {
            this._occt._doJump = false;
            this._jumpAccelCountdown = this.jumpAccelTime;
        }

        if (this._jumpAccelCountdown > 0) {
            this._jumpAccelCountdown = Math.max(this._jumpAccelCountdown - deltaTime, 0);
            this._occt._playerVelocity.y += this.jumpSpeed * deltaTime;
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
        this._occt._doJump = false;
        this._jumpAccelCountdown = 0;
    }

    public onControllerColliderHit(hit: any) {
        // detect climbable wall: mostly horizontal normal and not grounded
        if (!this._occt._grounded && Math.abs(hit.worldNormal.y) < 0.3 && (Math.abs(hit.worldNormal.x) > 0.7 || Math.abs(hit.worldNormal.z) > 0.7)) {
            let n: any = hit.collider.node;
            let found = false;
            while (n) {
                const cw = n.getComponent && n.getComponent('ClimbableWall');
                if (cw) { found = true; break; }
                n = n.parent;
            }
            if (found) {
                // store normal and switch to cling state
                // this._occt._lastClingNormal = hit.worldNormal;
                this._occt.setState(CharacterClingState);
            }
        }
    }
}
