import { _decorator, Component, Node } from 'cc';
import { GameEvent, GlobalEventBus } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('PackshotUI')
export class PackshotUI extends Component {
    @property({type: Node})
    public container: Node | null = null;

    onLoad() {
        this.container.active = false;
    }

    onEnable() {
        GlobalEventBus.on(GameEvent.GAME_END, this._showPackshot, this);
    }

    onDisable() {
        GlobalEventBus.off(GameEvent.GAME_END, this._showPackshot, this);
    }

    private _showPackshot() {
        this.container.active = true;
    }

    public downloadNow() {
        console.log("Download Now Debug");
    }
}


