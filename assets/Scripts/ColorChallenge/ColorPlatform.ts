import { _decorator, Component, ColliderComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorPlatform')
export class ColorPlatform extends Component {
    @property
    public colorName: string = 'red';

    private _trigger: ColliderComponent | null = null;
    public isPlayerOn: boolean = false;

    onLoad() {
        const cols = this.getComponents(ColliderComponent);
        for (let c of cols) {
            if (c.isTrigger) { this._trigger = c; break; }
        }
    }

    onEnable() {
        if (this._trigger) {
            this._trigger.on('onControllerTriggerEnter', this._onEnter, this);
            this._trigger.on('onControllerTriggerExit', this._onExit, this);
        }
    }

    onDisable() {
        if (this._trigger) {
            this._trigger.off('onControllerTriggerEnter', this._onEnter, this);
            this._trigger.off('onControllerTriggerExit', this._onExit, this);
        }
    }

    private _onEnter(event: any) {
        this.isPlayerOn = true;
    }

    private _onExit(event: any) {
        this.isPlayerOn = false;
    }

    public hidePlatform() {
        this.node.active = false;
    }

    public showPlatform() {
        this.node.active = true;
    }
}
