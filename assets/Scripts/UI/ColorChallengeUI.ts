import { _decorator, Component, Label } from 'cc';
import { GlobalEventBus, GameEvent } from '../Events/GlobalEventBus';
const { ccclass, property } = _decorator;

@ccclass('ColorChallengeUI')
export class ColorChallengeUI extends Component {
    @property({ type: Label })
    public firstLabel: Label | null = null;

    @property({ type: Label })
    public secondLabel: Label | null = null;

    onLoad() {
        this.firstLabel.node.active = false;
        this.secondLabel.node.active = false;
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
            this.firstLabel.string = payload.color.toUpperCase();
            this.secondLabel.string = `${Math.max(0, Math.round(payload.roundTimer))}`;
            this.secondLabel.node.active = this.firstLabel.node.active = true;
            return;
        }

        if (payload.waitTimer != undefined) {
            this.firstLabel.string = `${Math.max(0, Math.round(payload.waitTimer))}`;
            this.firstLabel.node.active = true;
            this.secondLabel.node.active = false;
            return;
        }
    }

    private _onStop() {
        this.firstLabel.node.active = false;
        this.secondLabel.node.active = false;
    }
}
