import { _decorator, clamp, Component, EventKeyboard, Input, input, KeyCode } from 'cc';
import { ObbyCharacterController } from '../ObbyCharacterController';
import { GameEvent, GlobalEventBus } from '../../Events/GlobalEventBus';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('CharacterKeyboardInput')
@requireComponent(ObbyCharacterController)
export class CharacterKeyboardInput extends Component {
    private _obbyCharacterController: ObbyCharacterController | null = null;
    @property({readonly: true, visible: true, serializable: false})
    private _isForwardPressed = false;
    @property({readonly: true, visible: true, serializable: false})
    private _isBackPressed = false;
    @property({readonly: true, visible: true, serializable: false})
    private _isLeftPressed = false;
    @property({readonly: true, visible: true, serializable: false})
    private _isRightPressed = false;

    onLoad() {
        this._obbyCharacterController = this.node.getComponent(ObbyCharacterController);
    }

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        GlobalEventBus.on(GameEvent.GAME_END, this.onGameEnd, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        GlobalEventBus.off(GameEvent.GAME_END, this.onGameEnd, this);
    }

    onGameEnd() {
        this.enabled = false;
    }

    onKeyDown(event: EventKeyboard) {
        this.keyProcess(event);
    }

    onKeyUp(event: EventKeyboard) {
        this.keyProcess(event);
    }

    // Управление клавой не требуется по тз, но удобно для тестирования в редакторе
    keyProcess(event: EventKeyboard) {
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
                    this._obbyCharacterController.jump();
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
        this._obbyCharacterController.control_z = clamp(z, -1,1);
        this._obbyCharacterController.control_x = clamp(x, -1,1);
    }
}


