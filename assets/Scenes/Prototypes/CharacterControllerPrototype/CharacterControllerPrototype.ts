import { _decorator, CharacterController, Component, v3, log, Vec3, CharacterControllerContact } from 'cc';
const { ccclass, property } = _decorator;

// документация: https://docs.cocos.com/creator/3.8/manual/en/physics/character-controller/
@ccclass('CharacterControllerPrototype')
export class CharacterControllerPrototype extends Component {
    @property
    moveOnStart: Vec3 = new Vec3();
    @property({readonly: true})
    isOnGround: boolean = false;

    @property({readonly: true})
    private characterController: CharacterController = null;

    start() {
        this.characterController = this.node.getComponent(CharacterController);
        const movement = v3(this.moveOnStart);
        this.characterController.move(movement);
        this.characterController.on('onControllerColliderHit', this.onColliderHit, this);
    }

    update(dt: number): void {
        this.isOnGround = this.characterController.isGrounded;    
    }

    onColliderHit (contact: CharacterControllerContact) {

    }
}


