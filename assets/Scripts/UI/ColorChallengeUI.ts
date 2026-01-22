import { _decorator, Component, Label, Sprite } from 'cc';
import { GlobalEventBus, GameEvent } from '../Events/GlobalEventBus';
import { ColorChallengeMap } from '../General/Constants';
const { ccclass, property } = _decorator;

@ccclass('ColorChallengeUI')
export class ColorChallengeUI extends Component {
    @property({ type: Label })
    public label: Label | null = null;

    @property({ type: Sprite })
    public sprite: Sprite | null = null;

    onLoad() {
        this.label.node.active = false;
        this.sprite.node.active = false;
    }

    onEnable() {
        GlobalEventBus.on(GameEvent.COLOR_ROUND_TICK, this._onRoundTick, this);
        GlobalEventBus.on(GameEvent.COLOR_GAME_STOP, this._onStop, this);
        GlobalEventBus.on(GameEvent.GAME_END, this._onStop, this);
    }

    onDisable() {
        GlobalEventBus.off(GameEvent.COLOR_ROUND_TICK, this._onRoundTick, this);
        GlobalEventBus.off(GameEvent.COLOR_GAME_STOP, this._onStop, this);
        GlobalEventBus.off(GameEvent.GAME_END, this._onStop, this);
    }

    private _onRoundTick(payload: any) {
        if (payload.roundTimer != undefined) {
            this.sprite.color = ColorChallengeMap.get(payload.color);
            this.label.string = `${Math.max(0, Math.round(payload.roundTimer))}`;
            this.sprite.node.active = this.label.node.active = true;
            return;
        }

        if (payload.waitTimer != undefined) {
            this.label.string = `${Math.max(0, Math.round(payload.waitTimer))}`;
            this.label.node.active = true;
            this.sprite.node.active = false;
            return;
        }
    }

    private _onStop() {
        this.label.node.active = false;
        this.sprite.node.active = false;
    }
}
