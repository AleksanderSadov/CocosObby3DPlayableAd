import { _decorator, Vec3 } from 'cc';
import { CharacterAirState } from './CharacterAirState';
import { CharacterAbstractState } from './CharacterAbstractState';
const { ccclass, property } = _decorator;

@ccclass('CharacterGroundedState')
export class CharacterGroundedState extends CharacterAbstractState {
    updateState(deltaTime: number) {
        this._occt._playerVelocity.y += this._occt.gravity * deltaTime;

        this._occt._playerVelocity.z += -this._occt.control_z * this._occt.speed;
        this._occt._playerVelocity.x += -this._occt.control_x * this._occt.speed;

        this._occt._playerVelocity.x *= this._occt.linearDamping;
        this._occt._playerVelocity.z *= this._occt.linearDamping;

        Vec3.multiplyScalar(this._occt._movement, this._occt._playerVelocity, deltaTime);
        this._cct!.move(this._occt._movement);

        if (this._occt._grounded) {
            this._occt._playerVelocity.y = 0;
        } else {
            this._occt.setState(CharacterAirState);
        }
    }

    public onRespawn() {
        this._occt._playerVelocity.set(0, 0, 0);
    }

    public onJump() {
        this._occt._doJump = true;
        this._occt.setState(CharacterAirState);
    }
}
