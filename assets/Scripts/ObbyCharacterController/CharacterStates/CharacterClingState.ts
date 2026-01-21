import { _decorator, Vec3 } from 'cc';
import { CharacterAbstractState } from './CharacterAbstractState';
const { ccclass, property } = _decorator;

@ccclass('CharacterClingState')
export class CharacterClingState extends CharacterAbstractState {
    @property
    public climbSpeed = 2.5;

    @property
    public detachImpulse = 6;

    @property
    public pushBack = 2.5;

    private _clingNormal = new Vec3();

    onEnter(prev?: CharacterAbstractState) {
        // store normal if provided via controller
        // if ((this._occt as any)._lastClingNormal) {
        //     this._clingNormal = (this._occt as any)._lastClingNormal.clone();
        // }
        // zero horizontal velocities
        this._occt._playerVelocity.x = 0;
        this._occt._playerVelocity.z = 0;
        this._occt._playerVelocity.y = 0;
    }

    updateState(deltaTime: number) {
        this._occt._playerVelocity.y = this._occt.control_z * this.climbSpeed;
        this._occt._playerVelocity.x = -this._occt.control_x * this.climbSpeed;
        this._occt._playerVelocity.z = 0;

        Vec3.multiplyScalar(this._occt._movement, this._occt._playerVelocity, deltaTime);
        this._cct!.move(this._occt._movement);
    }

    public onJump() {
        this._occt._playerVelocity.set(-this._clingNormal.x * this.pushBack, this.detachImpulse, -this._clingNormal.z * this.pushBack);
    }
}
