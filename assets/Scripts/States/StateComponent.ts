import { _decorator, CharacterController, CharacterControllerContact, Component } from 'cc';
import { ObbyCharacterController } from '../ObbyCharacterController/ObbyCharacterController';
const { ccclass, requireComponent } = _decorator;

@ccclass('StateComponent')
@requireComponent(ObbyCharacterController)
export class StateComponent extends Component {
    protected _cct: CharacterController | null = null;
    protected _occt: ObbyCharacterController | null = null;

    protected onLoad(): void {
        this._cct = this.node.getComponent(CharacterController);
        this._occt = this.node.getComponent(ObbyCharacterController);
    }

    // Called when the state becomes active
    public onEnter(prevState?: StateComponent): void {}
    // Called when the state is exited
    public onExit(nextState?: StateComponent): void {}
    // Update called from the main controller
    public updateState(deltaTime: number): void {}
    // Optional: handle controller collision events
    public onControllerColliderHit(hit: CharacterControllerContact): void {};
    public onJump(): void {}
}
