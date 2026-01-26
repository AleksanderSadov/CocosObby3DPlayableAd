import { _decorator, Component } from 'cc';
import { IInputReceiver } from '../IInputReceiver';
const { ccclass, property } = _decorator;

@ccclass('CharacterInputProcessor')
export abstract class CharacterInputProcessor extends Component {
    @property({readonly: true, visible: true, serializable: false})
    public degree: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public offset: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public sin: number = 0;
    @property({readonly: true, visible: true, serializable: false})
    public cos: number = 0;

    protected _callback: IInputReceiver;

    init(callback: IInputReceiver) {
        this._callback = callback;
    }

    protected _onMoveInput(degree: number, offset: number) {
        this.degree = degree;
        this.offset = offset;
        const rad = degree * Math.PI / 180;
        this.cos = Math.cos(rad) * offset;
        this.sin = Math.sin(rad) * offset;
        this._callback.onMoveInput(degree, offset);
    }

    protected _onMoveInputStop() {
        this.degree = this.offset = 0;
        this.sin = this.cos = 0;
        this._callback.onMoveInputStop();
    }

    protected _onButton(btnName: string) {
        this._callback.onButton(btnName);
    }
}
