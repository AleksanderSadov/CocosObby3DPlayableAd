import { _decorator, Component, Node, sys } from 'cc';
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
        const androidLink = "https://play.google.com/store/apps/details?id=ocean.nomad.survival.simulator";
        const iosLink = "https://apps.apple.com/us/app/raft-survival-ocean-nomad/id1326046015";
        let link: string;
        if (sys.platform == sys.Platform.IOS) {
            link = iosLink;
        } else {
            link = androidLink;
        }

        if (window.mraid) {
            window.mraid.open(link);
        } else {
            window.open(link);
        }
    }
}
