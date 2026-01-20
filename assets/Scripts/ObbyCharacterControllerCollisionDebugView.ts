import { _decorator, CharacterController, CharacterControllerContact, Color, Component, log, ModelComponent, Node, Quat, Vec3 } from 'cc';
import { rotation, scale } from './Constants';
const { ccclass, property } = _decorator;

// это кокосовский пример визуализации столкновений CharacterController для отладки
@ccclass('ObbyCharacterControllerCollisionDebugView')
export class ObbyCharacterControllerCollisionDebugView extends Component {
    @property
    public logToConsole: boolean = false;
     
    private _cct : CharacterController = null!;
    private _hitPoint: Node = null!;

    protected onLoad(): void {
        this._hitPoint = this.node.scene.getChildByName('HitPoint')!; // это маленький красный кубик в сцене - лучше было бы перевести на префаб и инициализировать
        this._cct = this.node.getComponent(CharacterController)!;
    }

    protected onEnable(): void {
        this._cct.on('onControllerColliderHit', this.onControllerColliderHit, this);
        this._cct.on('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
        this._cct.on('onControllerTriggerStay', this.onControllerTriggerStay, this);
        this._cct.on('onControllerTriggerExit', this.onControllerTriggerExit, this);
    }

    protected onDisable(): void {
        this._cct.off('onControllerColliderHit', this.onControllerColliderHit, this);
        this._cct.off('onControllerTriggerEnter', this.onControllerTriggerEnter, this);
        this._cct.off('onControllerTriggerStay', this.onControllerTriggerStay, this);
        this._cct.off('onControllerTriggerExit', this.onControllerTriggerExit, this);
    }

    onControllerColliderHit(hit: CharacterControllerContact) {
        Quat.rotationTo(rotation, Vec3.UNIT_Y, hit.worldNormal);
        this._hitPoint.setWorldPosition(hit.worldPosition);
        scale.set(0.05, 1, 0.05);
        this._hitPoint.setWorldScale(scale);
        this._hitPoint.setWorldRotation(rotation);
    }

    onControllerTriggerEnter(event: any) {
        if (this.logToConsole) {
            log('cct onControllerTriggerEnter', event);
        }
        const modelCom = event.characterController.node.getComponent(ModelComponent);
        if (modelCom) {
            modelCom.material.setProperty('mainColor', new Color(255, 0, 0, 99));
        }
    }

    onControllerTriggerStay(event: any) {
        if (this.logToConsole) {
            log('cct onControllerTriggerStay', event);
        }
        
    }

    onControllerTriggerExit(event: any) {
        if (this.logToConsole) {
            log('cct onControllerTriggerExit', event);
        }
        const modelCom = event.characterController.node.getComponent(ModelComponent);
        if (modelCom) {
            modelCom.material.setProperty('mainColor', new Color(255, 255, 255, 99));
        }
    }
}
