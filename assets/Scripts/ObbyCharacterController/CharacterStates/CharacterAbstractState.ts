import { _decorator, CharacterController, CharacterControllerContact, Component, Vec3 } from 'cc';
import type { ObbyCharacterController } from '../ObbyCharacterController';
const { ccclass } = _decorator;

@ccclass('CharacterAbstractState')
export abstract class CharacterAbstractState extends Component {
    protected _cct: CharacterController | null = null;
    protected _occt: ObbyCharacterController | null = null;

    protected onLoad(): void {
        this._cct = this.node.getComponent(CharacterController);
        this._occt = this.node.getComponent('ObbyCharacterController') as ObbyCharacterController; // строкой для фикса циклической зависимости, пока самое простое решение
    }

    // Called when the state becomes active
    public onEnter(prevState?: CharacterAbstractState): void {}
    // Called when the state is exited
    public onExit(nextState?: CharacterAbstractState): void {}
    // Update called from the main controller
    public updateState(deltaTime: number): void {}
    // Optional: handle controller collision events
    public onControllerColliderHit(hit: CharacterControllerContact): void {}
    public onJump(): void {}
    public onRespawn(): void {}

    public baseGravity(deltaTime: number) {
        this._occt._playerVelocity.y += this._occt.gravity * deltaTime;
    }

    public baseHorizontalVelocity() {
        // movement relative to character rotation
        const forward = this.node.forward.clone();
        forward.y = 0;
        forward.normalize();

        const right = this.node.right.clone();
        right.y = 0;
        right.normalize();

        const moveDir = new Vec3();
        Vec3.add(
            moveDir,
            forward.multiplyScalar(this._occt.control_z),
            right.multiplyScalar(this._occt.control_x),
        );

        if (moveDir.lengthSqr() > 0) {
            moveDir.normalize();
            this._occt._playerVelocity.x += moveDir.x * this._occt.speed;
            this._occt._playerVelocity.z += moveDir.z * this._occt.speed;
        }
    }

    public baseHorizontalDamping() {
        this._occt._playerVelocity.x *= this._occt.linearDamping;
        this._occt._playerVelocity.z *= this._occt.linearDamping;
    }

    public baseMove(deltaTime: number) {
        Vec3.multiplyScalar(this._occt._movement, this._occt._playerVelocity, deltaTime);
        this._cct!.move(this._occt._movement);
    }
}
