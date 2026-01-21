import { _decorator, Vec3 } from 'cc';
import { CharacterAirState } from './CharacterAirState';
import { CharacterAbstractState } from './CharacterAbstractState';
const { ccclass, property } = _decorator;

@ccclass('CharacterGroundedState')
export class CharacterGroundedState extends CharacterAbstractState {
    updateState(deltaTime: number) {
        this.baseGravity(deltaTime);

        this.baseHorizontalVelocity();
        this.baseHorizontalDamping();
        this.baseMove(deltaTime);

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
