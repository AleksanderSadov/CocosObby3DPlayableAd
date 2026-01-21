import { _decorator, Vec3 } from 'cc';
import { CharacterAbstractState } from './CharacterAbstractState';
import { CharacterAirState } from './CharacterAirState';
const { ccclass, property } = _decorator;

@ccclass('CharacterClingState')
export class CharacterClingState extends CharacterAbstractState {
    @property
    public climbSpeed = 2.5;

    onEnter(prev?: CharacterAbstractState) {
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

    public onRespawn() {
        this._occt._playerVelocity.set(0, 0, 0);
    }

    public onJump() {
        this._occt._doClingDetachJump = true;
        this._occt.setState(CharacterAirState);
    }
}
