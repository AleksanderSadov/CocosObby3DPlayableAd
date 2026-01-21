import { _decorator, clamp, EventKeyboard, Input, input, KeyCode } from 'cc';
import { ObbyCharacterController } from '../ObbyCharacterController';
import { CharacterAbstractInput } from './CharacterAbstractInput';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('CharacterKeyboardInput')
@requireComponent(ObbyCharacterController)
export class CharacterKeyboardInput extends CharacterAbstractInput {
    @property({readonly: true, visible: true, serializable: false})
    private _isForwardPressed = false;
    @property({readonly: true, visible: true, serializable: false})
    private _isBackPressed = false;
    @property({readonly: true, visible: true, serializable: false})
    private _isLeftPressed = false;
    @property({readonly: true, visible: true, serializable: false})
    private _isRightPressed = false;

    protected onEnable(): void {
        super.onEnable();
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDisable(): void {
        super.onDisable();
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        this.keyProcess(event);
    }

    onKeyUp(event: EventKeyboard) {
        this.keyProcess(event);
    }

    // Управление клавой не требуется по тз, но удобно для тестирования в редакторе
    keyProcess(event: EventKeyboard) {
        this.registerUserActivity();
        const step = 1;
        switch(event.keyCode) {
            case KeyCode.KEY_W:{
                this._isForwardPressed = event.isPressed;
                break;
            }
            case KeyCode.KEY_S:{
                this._isBackPressed = event.isPressed;
                break;
            }
            case KeyCode.KEY_A:{
                this._isLeftPressed = event.isPressed;
                break;
            }
            case KeyCode.KEY_D:{
                this._isRightPressed = event.isPressed;
                break;
            }
            case KeyCode.SPACE:{
                if (event.isPressed) {
                    this._occt.jump();
                }
                break;
            }
        }
        let z = 0;
        if (this._isForwardPressed) {
            z += step;
        }
        if (this._isBackPressed) {
            z -= step;
        }
        let x = 0;
        if (this._isLeftPressed) {
            x += step;
        }
        if (this._isRightPressed) {
            x -= step;
        }
        this._occt.control_z = clamp(z, -1,1);
        this._occt.control_x = clamp(x, -1,1);
    }
}


