import { _decorator, CharacterController, CharacterControllerContact, Component } from 'cc';
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
}
