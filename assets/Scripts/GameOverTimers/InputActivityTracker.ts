import { _decorator, Component, EventKeyboard, EventTouch, input, Input, KeyCode } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('InputActivityTracker')
export class InputActivityTracker extends Component {
    @property({readonly: true, visible: true, serializable: false})
    private _keysActive: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    private _touchesActive: number = 0;

    private _touchesSet: Set<KeyCode> = new Set();
    private _keysSet: Set<KeyCode> = new Set();

    // Здесь за активность будем считать любые инпут события от пользователя (инпут движения, движение камерой, кнопка звука и тд)
    // Еще можно считать и/или движение персонажа, сейчас пока в свободном падении без инпута будем сейчас неактивностью, для таймера на 40 сек на бездействие это некритично, даже полезно, но для небольших таймеров может потребоваться учитывать свободное падение

    // input.on(Input.EventType.TOUCH_START) - не сработал для глобальной ловли тачей, т.к. не ловит скушанные тачи от кнопок. Думаю это относится к Note: we lowered the priority of input in v3.4.1, so there is no difference in priority between the two objects since v3.4.1: https://docs.cocos.com/creator/3.8/manual/en/engine/event/event-input.html
    // поэтому события рекомендуется цеплять на полноэкранный Canvas который поймает все тачи, обращаю внимание что для тачей useCapture = true который ловит инпут до кнопок
    protected onEnable(): void {
        this.node.on(Input.EventType.TOUCH_START, this._onTouchStart, this, true);
        this.node.on(Input.EventType.TOUCH_CANCEL, this._onTouchStop, this, true);
        this.node.on(Input.EventType.TOUCH_END, this._onTouchStop, this, true);
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
        input.on(Input.EventType.MOUSE_WHEEL, this._onMouseWheel, this);
        GlobalEventBus.on(GameEvent.GAME_END, this._onGameEnd, this);
    }
    
    protected onDisable(): void {
        this.node.off(Input.EventType.TOUCH_START, this._onTouchStart, this, true);
        this.node.off(Input.EventType.TOUCH_CANCEL, this._onTouchStop, this, true);
        this.node.off(Input.EventType.TOUCH_END, this._onTouchStop, this, true);
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
        input.off(Input.EventType.MOUSE_WHEEL, this._onMouseWheel, this);
        GlobalEventBus.off(GameEvent.GAME_END, this._onGameEnd, this);
        this._keysActive = this._touchesActive = 0;
    }

    // В превью в редакторе если фокус не на игровой зоне, то onKeyDown не выстреливается, но выстреливается onKeyUp
    // Еще иногда повторяется такое:
    // 1) Нажимаем S
    // 2) Держа S нажимаем D
    // 3) Отпускаем D
    // 4) Продолжаем держать S и иногда приходит дополнительный onKeyDown(S) без onKeyUp(S), что ломало счетчик
    // Для избежания таких багов чуть усложнил используя Set, а не просто счетчик
    private _onKeyDown(event: EventKeyboard) {
        this._keysSet.add(event.keyCode);
        this._keysActive = this._keysSet.size;
    }

    private _onKeyUp(event: EventKeyboard) {
        this._keysSet.delete(event.keyCode);
        this._keysActive = this._keysSet.size;
    }

    // TODO проверить на мобильном
    // touch.getID() - это порядковый номер тача, т.е. если одним пальцем то будет всегда 0, если двумя то 0 и 1
    // может и есть еще какие то эдж кейсы с багами, но с Set хотя бы уменьшил возможные баги
    private _onTouchStart(event: EventTouch) {
        this._touchesSet.add(event.touch.getID())
        this._touchesActive = this._touchesSet.size;
    }

    private _onTouchStop(event: EventTouch) {
        this._touchesSet.delete(event.touch.getID());
        this._touchesActive = this._touchesSet.size;
    }

    private _onMouseWheel() {
        GlobalEventBus.emit(GameEvent.PLAYER_ACTIVITY);
    }

    private _onGameEnd() {
        this.enabled = false;
    }

    protected update(dt: number): void {
        if (this._keysActive > 0 || this._touchesActive > 0) {
            GlobalEventBus.emit(GameEvent.PLAYER_ACTIVITY);
        }
    }
}


